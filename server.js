import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'al-qahera-news';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash'; // Using a stable model alias

const bqClient = new BigQuery({ projectId: PROJECT_ID });
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

// --- Analytics Logic (Ported from Python) ---

function detectLanguage(text) {
  for (const ch of text) {
    if (ch >= '\u0600' && ch <= '\u06FF') return 'ar';
  }
  return 'en';
}

function normalizeArabic(text) {
  if (!text) return "";
  let t = text.trim();
  t = t.replace(/أ/g, "ا").replace(/إ/g, "ا").replace(/آ/g, "ا");
  t = t.replace(/ة/g, "ه");
  t = t.replace(/ى/g, "ي");
  t = t.replace(/ؤ/g, "و");
  t = t.replace(/ئ/g, "ي");
  t = t.replace(/ـ/g, "");
  t = t.replace(/[^\w\s\u0600-\u06FF]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function escapeSqlString(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function extractProgramName(question) {
  const q = question.trim();
  const patterns = [
    /program\s+(.+)/i,
    /show\s+(.+)/i,
    /for program\s+(.+)/i,
    /about program\s+(.+)/i,
    /views for program\s+(.+)/i,
    /برنامج\s+(.+)/i,
    /عن برنامج\s+(.+)/i,
    /لبرنامج\s+(.+)/i,
    /مشاهدات برنامج\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match) {
      const candidate = match[1].replace(/[ ؟?.,،:]+$/, "").trim();
      if (candidate) return candidate;
    }
  }

  const fallbackPrefixes = ["برنامج ", "لبرنامج ", "عن برنامج "];
  for (const prefix of fallbackPrefixes) {
    if (q.startsWith(prefix)) {
      const candidate = q.slice(prefix.length).replace(/[ ؟?.,،:]+$/, "").trim();
      if (candidate) return candidate;
    }
  }
  return null;
}

function classifyQuestion(question) {
  const q = question.toLowerCase().trim();
  const lang = detectLanguage(question);

  const wantsTrending = ["trending", "trend", "viral", "hot", "popular now", "رائج", "الترند", "ترند", "الأكثر رواج", "الأكثر انتشار"]
    .some(word => q.includes(word));

  const wantsVideo = ["video", "videos", "clip", "clips", "فيديو", "فيديوهات", "مقاطع", "مقطع"]
    .some(word => q.includes(word));

  const wantsArticle = ["article", "articles", "story", "stories", "مقال", "مقالات", "خبر", "أخبار"]
    .some(word => q.includes(word));

  const wantsLeast = ["least", "lowest", "worst", "fewest", "zero", "underperforming", "الأقل", "اقل", "الادنى", "الأضعف", "الاسوأ", "صفر"]
    .some(word => q.includes(word));

  const programName = extractProgramName(question);

  let metric = "total_views";
  let mode = "top";
  let category = "content";

  if (wantsTrending) {
    metric = "recent_views";
    mode = "top";
    category = "trending";
  } else if (wantsLeast) {
    metric = "total_views";
    mode = "least";
    category = "content";
  }

  let contentType = null;
  if (wantsVideo) contentType = "video";
  else if (wantsArticle) contentType = "article";

  return {
    language: lang,
    category,
    mode,
    metric,
    contentType,
    programName,
  };
}

function buildSql(intent) {
  const { category, mode, metric, contentType, programName } = intent;
  const order = mode === "least" ? "ASC" : "DESC";

  if (category === "trending") {
    let whereSql = "";
    if (programName) {
      const safeProgram = escapeSqlString(programName);
      const normalizedProgram = escapeSqlString(normalizeArabic(programName));
      whereSql = `
        WHERE (
          LOWER(program) LIKE LOWER('%${safeProgram}%')
          OR LOWER(title) LIKE LOWER('%${safeProgram}%')
          OR LOWER(REGEXP_REPLACE(
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(program,'أ','ا'),'إ','ا'),'آ','ا'),'ة','ه'),'ى','ي'),'ؤ','و'),'ئ','ي'),
                r'[^[:alnum:][:space:]\u0600-\u06FF]',
                ' '
             )) LIKE LOWER('%${normalizedProgram}%')
        )
      `;
    }
    return `
      SELECT title, program, recent_views
      FROM \`al-qahera-news.AQN.trending_content\`
      ${whereSql}
      ORDER BY recent_views DESC
      LIMIT 10
    `;
  }

  const whereClauses = [];
  if (contentType) {
    whereClauses.push(`LOWER(content_type) = '${escapeSqlString(contentType.toLowerCase())}'`);
  }
  if (programName) {
    const safeProgram = escapeSqlString(programName);
    const normalizedProgram = escapeSqlString(normalizeArabic(programName));
    whereClauses.push(`
      (
        LOWER(program) LIKE LOWER('%${safeProgram}%')
        OR LOWER(title) LIKE LOWER('%${safeProgram}%')
        OR LOWER(REGEXP_REPLACE(
              REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(program,'أ','ا'),'إ','ا'),'آ','ا'),'ة','ه'),'ى','ي'),'ؤ','و'),'ئ','ي'),
              r'[^[:alnum:][:space:]\u0600-\u06FF]',
              ' '
           )) LIKE LOWER('%${normalizedProgram}%')
      )
    `);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  return `
    SELECT
      content_id,
      content_type,
      title,
      author,
      publish_date,
      category,
      program,
      content_url,
      total_views,
      unique_users,
      avg_watch_time,
      total_watch_time,
      last_activity_time
    FROM \`al-qahera-news.AQN.most_viewed_content\`
    ${whereSql}
    ORDER BY ${metric} ${order}
    LIMIT 10
  `;
}

async function generateAiSummary(question, rows, intent) {
  if (rows.length === 0) {
    if (intent.language === "ar") {
      return {
        title: "لا توجد نتائج",
        summary: "لم يتم العثور على بيانات مطابقة لهذا البرنامج أو هذا الطلب في الجدول الحالي."
      };
    }
    return {
      title: "No Matching Data",
      summary: "No matching records were found for this program or request in the current table."
    };
  }

  const generativeModel = vertexAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = intent.language === "ar" ? `
أنت محلل متخصص في تحليلات المحتوى الإعلامي.

السؤال:
${question}

البيانات:
${JSON.stringify(rows)}

التعليمات:
- أجب بالعربية فقط.
- لا تستخدم Markdown.
- أعد JSON صالح فقط.
- اجعل العنوان قصيرًا وواضحًا.
- اجعل الملخص واضحًا ومهنيًا من سطرين إلى 4 سطور.
- إذا كان السؤال عن برنامج محدد، ركز على أداء هذا البرنامج فقط.
- إذا كانت البيانات فارغة، وضح أنه لا توجد نتائج مطابقة.

صيغة JSON فقط:
{
  "title": "عنوان قصير",
  "summary": "ملخص واضح ومهني"
}
` : `
You are a media analytics expert.

Question:
${question}

Data:
${JSON.stringify(rows)}

Instructions:
- Respond in English only.
- Do not use markdown.
- Return valid JSON only.
- Keep the title short and clear.
- Keep the summary professional and concise in 2 to 4 lines.
- If the question is about a specific program, focus only on that program.
- If the data is empty, clearly say no matching results were found.

Return JSON only:
{
  "title": "Short title",
  "summary": "Clear professional summary"
}
`;

  try {
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text.trim();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      title: intent.language === "ar" ? "تحليل الأداء" : "Analytics Insight",
      summary: text
    };
  } catch (error) {
    console.error("AI Summary Error:", error);
    return {
      title: intent.language === "ar" ? "تحليل الأداء" : "Analytics Insight",
      summary: "Error generating AI summary."
    };
  }
}

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analytics/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const intent = classifyQuestion(question);
    const sql = buildSql(intent);

    const [rows] = await bqClient.query(sql);
    const aiResult = await generateAiSummary(question, rows, intent);

    res.json({
      title: aiResult.title,
      summary: aiResult.summary,
      data: rows,
      meta: {
        mode: intent.mode,
        category: intent.category,
        metric: intent.metric,
        language: intent.language,
        contentType: intent.contentType,
        programName: intent.programName,
        sqlUsed: sql
      }
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
