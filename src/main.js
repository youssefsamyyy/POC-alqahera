// Al Qahera News Dashboard - Vanilla JS Version
import './index.css';

const LOGO_URL = "https://alqaheranews.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.6a2665e0.png&w=3840&q=75";
const ANALYTICS_API_BASE_URL = 'https://analytics-api-563127110175.us-central1.run.app';

const TOOLS = [
  {
    id: "atomizer",
    name: "Content Atomizer",
    description: "Break down complex news stories into atomic, shareable content pieces.",
    url: "https://content-atomizer-563127110175.us-west1.run.app",
    icon: "atom",
    color: "bg-blue-500",
  },
  {
    id: "stylebook",
    name: "Style Book",
    description: "Ensure editorial consistency and adherence to Al Qahera News style guidelines.",
    url: "https://al-qahera-news-editor-563127110175.us-west1.run.app/",
    icon: "book-open",
    color: "bg-emerald-500",
  },
  {
    id: "semantic-search",
    name: "Semantic Search",
    description: "Video semantic search for rapid media retrieval.",
    url: "https://aqn-video-semantic-search-563127110175.us-west1.run.app/",
    icon: "search",
    color: "bg-amber-500",
  },
  {
    id: "trendings",
    name: "Trendings",
    description: "Global news monitoring and trending topics from Reuters and beyond.",
    url: "https://reuters-me-agent-563127110175.us-west1.run.app",
    icon: "trending-up",
    color: "bg-red-500",
  },
  {
    id: "analytics",
    name: "News Analytics",
    description: "AI-powered insights into content performance and trending topics.",
    url: "#",
    icon: "bar-chart-3",
    color: "bg-purple-500",
  },
  {
    id: "gemini-enterprise",
    name: "Gemini Enterprise",
    description: "Enterprise-grade AI search and 2 specialized agents for advanced news workflows.",
    url: "https://vertexaisearch.cloud.google.com/home/cid/22f41100-1550-4e64-adf8-ca51c79aacf9?hl=en_US",
    icon: "sparkles",
    color: "bg-orange-500",
    isExternalOnly: true,
  },
];

let state = {
  isAuthenticated: localStorage.getItem("aqn_auth") === "true",
  activeView: "home",
  isSidebarOpen: window.innerWidth > 768,
  analytics: {
    question: "",
    result: null,
    isLoading: false,
    error: null
  }
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!state.isAuthenticated) {
    app.innerHTML = renderLoginPage();
    attachLoginListeners();
  } else {
    app.innerHTML = renderDashboard();
    attachDashboardListeners();
  }
  
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderLoginPage() {
  return `
    <div class="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background handled by body styles -->

      <div class="w-full max-w-md relative z-10 animate-in fade-in duration-500">
        <div class="hero-box overflow-hidden rounded-[30px]">
          <div class="p-10 text-center space-y-4">
            <div class="brand-logo mx-auto mb-2">
              <img src="${LOGO_URL}" alt="Logo" class="w-10 h-10 object-contain brightness-0 invert" />
            </div>
            <div class="space-y-1">
              <h1 class="text-3xl font-bold text-[#111]">Secure Login</h1>
              <p class="text-[#666] text-sm font-medium">Internal Editorial Suite Access</p>
            </div>
          </div>
          <div class="px-8 pb-10">
            <form id="login-form" class="space-y-5">
              <div class="space-y-2">
                <label class="text-xs font-bold text-[#111] uppercase tracking-widest pl-1" for="username">User Identity</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-4.5 w-4 h-4 text-[#888]"></i>
                  <input id="username" name="username" placeholder="admin" class="flex h-14 w-full rounded-2xl bg-white border border-[#eee] px-11 py-2 text-sm focus:border-[#c40000] focus:ring-4 focus:ring-[#c40000]/10 transition-all outline-none" required />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-[#111] uppercase tracking-widest pl-1" for="password">Security Code</label>
                </div>
                <div class="relative">
                  <i data-lucide="lock" class="absolute left-4 top-4.5 w-4 h-4 text-[#888]"></i>
                  <input id="password" name="password" type="password" placeholder="••••••••" class="flex h-14 w-full rounded-2xl bg-white border border-[#eee] px-11 py-2 text-sm focus:border-[#c40000] focus:ring-4 focus:ring-[#c40000]/10 transition-all outline-none" required />
                </div>
              </div>
              <button type="submit" class="w-full btn-primary h-14 rounded-2xl text-lg font-black shadow-xl shadow-[#c40000]/20 transition-all active:scale-95">
                Authenticate
              </button>
            </form>
            <div class="mt-8 text-center">
              <p class="text-[10px] text-[#777] font-bold uppercase tracking-widest">
                System Monitoring Active &bull; AuthRequired
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const activeTool = TOOLS.find(t => t.id === state.activeView);
  const sidebarWidth = state.isSidebarOpen ? '280px' : '80px';
  const isHome = state.activeView === 'home';

  return `
    <div class="flex h-screen w-full transition-all duration-500 overflow-hidden ${isHome ? 'bg-transparent' : 'bg-background'}">
      <!-- Desktop Sidebar (Hidden on Home if desired, but we'll keep it as a minimal anchor) -->
      <aside id="sidebar" class="hidden md:flex flex-col border-r bg-card relative z-30 shadow-xl transition-all duration-300 ${isHome ? 'opacity-0 -translate-x-full pointer-events-none' : ''}" style="width: ${sidebarWidth}">
        <div class="p-6 flex items-center gap-3">
          <div class="brand-logo">
            <img src="${LOGO_URL}" alt="Logo" class="w-8 h-8 object-contain brightness-0 invert" />
          </div>
          ${state.isSidebarOpen ? `<span class="font-bold text-lg tracking-tight whitespace-nowrap animate-in fade-in">AQN Editor</span>` : ''}
        </div>

        <div class="flex-1 overflow-y-auto px-4">
          <nav class="space-y-2 py-4">
            ${renderNavItem('home', 'layout-dashboard', 'Dashboard')}
            <div class="h-px bg-border my-4"></div>
            ${TOOLS.map(tool => renderNavItem(tool.id, tool.icon, tool.name)).join('')}
          </nav>
        </div>

        <div class="p-4 border-t">
          <button id="logout-btn" class="flex items-center justify-center gap-4 w-full h-11 rounded-xl text-destructive hover:bg-destructive/10 transition-all">
            <i data-lucide="log-out" class="w-5 h-5"></i>
            ${state.isSidebarOpen ? `<span class="font-bold text-sm">Logout</span>` : ''}
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto ${isHome ? '' : 'bg-muted/10'}">
        ${isHome ? '' : `
          <header class="h-16 border-b flex items-center justify-between px-8 bg-card shadow-sm sticky top-0 z-20">
            <div class="flex items-center gap-4">
              <button class="md:hidden p-2 hover:bg-muted rounded-lg mr-2" id="mobile-toggle">
                <i data-lucide="menu" class="w-6 h-6"></i>
              </button>
              <h2 class="text-xl font-bold">${activeTool ? activeTool.name : ''}</h2>
            </div>
            <button class="p-2 hover:bg-muted rounded-full" onclick="window.switchView('home')">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </header>
        `}

        <!-- Content Area -->
        <div class="flex-1 relative">
          ${state.activeView === 'home' ? renderHomeView() : 
            state.activeView === 'analytics' ? renderAnalyticsView() : 
            renderToolView(activeTool)}
        </div>
      </main>
    </div>
  `;
}

function renderNavItem(id, icon, label) {
  const isActive = state.activeView === id;
  const activeClass = isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted';
  
  return `
    <button class="nav-item flex items-center gap-4 w-full h-11 px-4 rounded-xl transition-all ${activeClass}" data-view="${id}">
      <i data-lucide="${icon}" class="w-5 h-5 ${isActive ? 'text-primary' : ''}"></i>
      ${state.isSidebarOpen ? `
        <span class="font-bold text-sm truncate">${label}</span>
        ${isActive ? `<div class="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>` : ''}
      ` : ''}
    </button>
  `;
}

function renderHomeView() {
  return `
    <div class="page-container animate-in fade-in duration-700">
      <header class="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 text-white">
        <div class="flex items-center gap-4">
          <div class="brand-logo text-white font-black text-2xl">
            <img src="${LOGO_URL}" alt="AQN" class="w-10 h-10 object-contain brightness-0 invert" />
          </div>
          <div>
            <h1 class="text-2xl font-bold leading-tight">Al Qahera News</h1>
            <p class="text-white/60 text-sm mt-1">Editorial Management Portal</p>
          </div>
        </div>
        <div class="glass-badge flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Secure Editorial Environment
        </div>
      </header>

      <section class="hero-box mb-6">
        <h2 class="text-4xl font-bold mb-3 text-[#111]">
          Welcome to <span>Editorial Hub</span>
        </h2>
        <p class="text-[#666] leading-relaxed mb-8 max-w-3xl text-lg">
          Empowering the newsroom with AI-driven content generation, semantic media search, and multi-platform trending analysis. Select a tool below to begin your editorial workflow.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-3">
            <select id="module-selector" class="w-full h-16 px-6 border border-[#ddd] bg-[#fafafa] rounded-2xl cursor-pointer outline-none focus:border-[#c40000] focus:ring-4 focus:ring-[#c40000]/10 transition-all font-bold text-[#111]">
              <option value="" disabled selected>Select an Editorial Module...</option>
              ${TOOLS.map(tool => `<option value="${tool.id}">${tool.name}</option>`).join('')}
            </select>
          </div>
          <button id="launch-wizard" class="btn-primary py-4 px-8 rounded-2xl shadow-xl shadow-[#c40000]/20 active:scale-95 transition-all h-16">
            Launch
          </button>
        </div>
      </section>

      <div class="mb-4 text-[#555] font-medium px-2">
        Available Editorial Modules (${TOOLS.length})
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${TOOLS.map(tool => `
          <div class="custom-card group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="flex justify-between items-start gap-4 mb-4">
              <h3 class="text-xl font-extrabold text-[#111] leading-tight">${tool.name}</h3>
              <div class="bg-[#111] text-white px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                v1.2
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="bg-[#f5f5f5] border border-[#eee] rounded-full px-3 py-1.5 text-xs text-[#555] flex items-center gap-1.5 font-medium">
                <i data-lucide="${tool.icon}" class="w-3.5 h-3.5"></i>
                AI Enabled
              </span>
              <span class="bg-[#f5f5f5] border border-[#eee] rounded-full px-3 py-1.5 text-xs text-[#555] font-medium">Internal</span>
            </div>

            <div class="bg-[#fafafa] border border-[#eee] p-4 rounded-xl text-sm leading-relaxed text-[#333] mb-4 min-h-[80px]">
              ${tool.description}
            </div>

            <button class="w-full btn-primary py-3 px-4 rounded-xl text-sm font-black active:scale-95 flex items-center justify-center gap-2" onclick="window.switchView('${tool.id}')">
              Open Module
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `).join('')}
      </div>

      <footer class="mt-12 text-center text-[#777] text-xs font-medium pb-8 uppercase tracking-widest">
        Powered by Cloud 11 Google cloud premier partner
      </footer>
    </div>
  `;
}

function renderStatCard(icon, label, value, trend, iconColor) {
  const isPositive = trend.startsWith('+');
  return `
    <div class="bg-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'border'}">
          ${trend}
        </span>
      </div>
      <p class="text-sm font-medium text-muted-foreground mb-1">${label}</p>
      <p class="text-2xl font-bold">${value}</p>
    </div>
  `;
}

function renderActivityItem(icon, title, desc, time, status, iconColor) {
  return `
    <div class="flex items-start gap-4 p-4 rounded-2xl bg-card border border-transparent hover:border-border hover:shadow-sm transition-all group">
      <div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <p class="font-bold text-sm">${title}</p>
          <span class="text-[10px] text-muted-foreground font-medium">${time}</span>
        </div>
        <p class="text-xs text-muted-foreground line-clamp-1 mb-2">${desc}</p>
        <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border">${status}</span>
      </div>
    </div>
  `;
}

function renderQuickAction(icon, label) {
  return `
    <button class="flex items-center gap-3 w-full h-11 px-4 rounded-lg border hover:bg-muted transition-all text-sm font-medium">
      <i data-lucide="${icon}" class="w-4 h-4"></i>
      ${label}
    </button>
  `;
}

function renderAnalyticsView() {
  const { question, result, isLoading, error } = state.analytics;

  return `
    <div class="p-8 h-full overflow-y-auto animate-in fade-in duration-500">
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-heading font-bold">News Analytics</h1>
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">API Online</span>
            </div>
          </div>
          <p class="text-muted-foreground">Ask questions about content performance, trending topics, and editorial impact.</p>
        </div>

        <div class="bg-card rounded-3xl p-6 shadow-xl border-none space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ask a Question</label>
            <div class="flex gap-3">
              <input 
                id="analytics-input" 
                type="text" 
                placeholder="e.g., What are the trending videos for program Al-Qahera Today?" 
                class="flex-1 h-12 rounded-xl bg-muted/50 border-none px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value="${question}"
              />
              <button 
                id="ask-btn" 
                class="inline-flex items-center justify-center rounded-xl px-6 h-12 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                ${isLoading ? 'disabled' : ''}
              >
                ${isLoading ? '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>' : 'Analyze'}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="suggestion-btn text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full font-medium transition-all" data-q="What are the top trending videos?">Trending Videos</button>
            <button class="suggestion-btn text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full font-medium transition-all" data-q="Show me the least viewed articles.">Least Viewed</button>
            <button class="suggestion-btn text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full font-medium transition-all" data-q="Engagement for program Al-Qahera Today?">Program Performance</button>
          </div>
        </div>

        ${error ? `
          <div class="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3 text-destructive">
            <i data-lucide="alert-circle" class="w-5 h-5"></i>
            <p class="text-sm font-medium">${error}</p>
          </div>
        ` : ''}

        ${result ? `
          <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="bg-card rounded-3xl p-8 shadow-lg border-none space-y-4">
              <div class="flex items-center gap-3 text-primary">
                <i data-lucide="sparkles" class="w-6 h-6"></i>
                <h3 class="text-2xl font-heading font-bold">${result.title}</h3>
              </div>
              <p class="text-muted-foreground leading-relaxed">${result.summary}</p>
            </div>

            ${result.data && result.data.length > 0 ? `
              <div class="bg-card rounded-3xl overflow-hidden shadow-lg border-none">
                <div class="px-8 py-4 border-b bg-muted/30">
                  <h4 class="font-bold text-sm uppercase tracking-wider">Detailed Data</h4>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left">
                    <thead class="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th class="px-8 py-4">Title</th>
                        <th class="px-8 py-4">Program</th>
                        <th class="px-8 py-4 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y">
                      ${result.data.map(row => `
                        <tr class="hover:bg-muted/30 transition-colors">
                          <td class="px-8 py-4 font-medium">${row.title || 'N/A'}</td>
                          <td class="px-8 py-4 text-muted-foreground">${row.program || 'N/A'}</td>
                          <td class="px-8 py-4 text-right font-mono font-bold">${(row.total_views || row.recent_views || 0).toLocaleString()}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function handleAskAnalytics() {
  const input = document.getElementById('analytics-input');
  const question = input ? input.value : state.analytics.question;
  
  if (!question) return;

  state.analytics.isLoading = true;
  state.analytics.error = null;
  state.analytics.question = question;
  render();

  try {
    // We use the external API URL provided by the user
    const apiUrl = `${ANALYTICS_API_BASE_URL}/api/analytics/ask`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      // Fallback to local API if external fails (useful for development)
      console.warn("External API failed, trying local fallback...");
      const fallbackResponse = await fetch('/api/analytics/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!fallbackResponse.ok) throw new Error('Failed to fetch analytics data');
      const data = await fallbackResponse.json();
      state.analytics.result = data;
    } else {
      const data = await response.json();
      state.analytics.result = data;
    }
  } catch (err) {
    console.error("Analytics Error:", err);
    state.analytics.error = "Could not retrieve analytics. Please ensure BigQuery and Vertex AI are properly configured.";
  } finally {
    state.analytics.isLoading = false;
    render();
  }
}
function renderToolView(tool) {
  if (!tool) return '';
  return `
    <div class="flex flex-col h-full animate-in fade-in duration-300">
      <div class="h-16 border-b flex items-center justify-between px-8 bg-white backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div class="flex items-center gap-4">
          <button class="md:hidden p-2 hover:bg-[#f5f5f5] rounded-xl" id="tool-mobile-toggle">
            <i data-lucide="menu" class="w-6 h-6"></i>
          </button>
          <div class="w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center text-white shadow-lg">
            <i data-lucide="${tool.icon}" class="w-5 h-5"></i>
          </div>
          <div class="hidden sm:flex flex-col">
            <span class="text-sm font-black text-[#111] leading-tight">${tool.name}</span>
            <code class="text-[9px] text-[#888] font-bold uppercase tracking-widest mt-0.5">${tool.url.substring(0, 50)}...</code>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-xl px-4 h-10 border border-[#eee] bg-[#fafafa] text-xs font-black text-[#111] hover:border-[#c40000] hover:text-[#c40000] transition-all">
            <i data-lucide="external-link" class="mr-2 w-3.5 h-3.5"></i>
            External View
          </a>
          <button class="p-2 hover:bg-[#f5f5f5] rounded-full transition-colors" onclick="window.switchView('home')">
            <i data-lucide="x" class="w-5 h-5 text-[#111]"></i>
          </button>
        </div>
      </div>
      <div class="flex-1 bg-white relative">
        ${tool.isExternalOnly ? `
          <div class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-muted/10">
            <div class="w-20 h-20 rounded-3xl ${tool.color} flex items-center justify-center text-white shadow-2xl shadow-primary/20 animate-bounce">
              <i data-lucide="${tool.icon}" class="w-10 h-10"></i>
            </div>
            <div class="max-w-md space-y-2">
              <h2 class="text-2xl font-bold text-[#111]">Secure Portal Access</h2>
              <p class="text-[#666]">Due to high-security protocols, this enterprise resource must be accessed in a standalone browser environment.</p>
            </div>
            <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="btn-primary inline-flex items-center justify-center rounded-2xl px-10 h-16 text-lg font-black shadow-2xl">
              <i data-lucide="external-link" class="mr-3 w-6 h-6"></i>
              Launch Secure Session
            </a>
            <p class="text-[10px] text-[#888] uppercase tracking-widest font-black pt-4">Cloud Verified Source</p>
          </div>
        ` : `
          <iframe src="${tool.url}" class="w-full h-full border-none bg-white font-sans" title="${tool.name}" referrerPolicy="no-referrer"></iframe>
        `}
      </div>
    </div>
  `;
}

function attachLoginListeners() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value;
      const pass = document.getElementById('password').value;

      if (user === 'admin' && pass === 'admin') {
        state.isAuthenticated = true;
        localStorage.setItem("aqn_auth", "true");
        render();
      } else {
        alert('Invalid credentials. Use admin/admin');
      }
    });
  }
}

function attachDashboardListeners() {
  // Wizard Launch Listener
  const launchBtn = document.getElementById('launch-wizard');
  const moduleSelector = document.getElementById('module-selector');
  if (launchBtn && moduleSelector) {
    launchBtn.addEventListener('click', () => {
      const selectedId = moduleSelector.value;
      if (selectedId) {
        window.switchView(selectedId);
      } else {
        moduleSelector.classList.add('animate-shake');
        setTimeout(() => moduleSelector.classList.remove('animate-shake'), 500);
      }
    });
  }

  // Mobile Toggles
  const handleMobileToggle = () => {
    state.isSidebarOpen = !state.isSidebarOpen;
    render();
  };

  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', handleMobileToggle);
  
  const toolMobileToggle = document.getElementById('tool-mobile-toggle');
  if (toolMobileToggle) toolMobileToggle.addEventListener('click', handleMobileToggle);

  // Analytics Listeners
  const askBtn = document.getElementById('ask-btn');
  if (askBtn) {
    askBtn.addEventListener('click', handleAskAnalytics);
  }

  const analyticsInput = document.getElementById('analytics-input');
  if (analyticsInput) {
    analyticsInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAskAnalytics();
    });
    analyticsInput.addEventListener('input', (e) => {
      state.analytics.question = e.target.value;
    });
  }

  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-q');
      state.analytics.question = q;
      handleAskAnalytics();
    });
  });

  // Sidebar Toggle
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      state.isSidebarOpen = !state.isSidebarOpen;
      render();
    });
  }

  // Logout
  const logout = document.getElementById('logout-btn');
  if (logout) {
    logout.addEventListener('click', () => {
      state.isAuthenticated = false;
      localStorage.removeItem("aqn_auth");
      render();
    });
  }

  // Nav Items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) {
        state.activeView = view;
        render();
      }
    });
  });
}

// Global helper for view switching from buttons
window.switchView = (view) => {
  state.activeView = view;
  render();
};

// Handle window resize for sidebar
window.addEventListener('resize', () => {
  const shouldBeOpen = window.innerWidth > 768;
  if (state.isSidebarOpen !== shouldBeOpen) {
    state.isSidebarOpen = shouldBeOpen;
    render();
  }
});

// Initial render
render();
