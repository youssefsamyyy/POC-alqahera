// Al Qahera News Dashboard - Vanilla JS Version
import './index.css';

const LOGO_URL = "https://alqaheranews.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.6a2665e0.png&w=3840&q=75";

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
    url: "https://correction-aqn-563127110175.us-central1.run.app",
    icon: "book-open",
    color: "bg-emerald-500",
  },
];

let state = {
  isAuthenticated: localStorage.getItem("aqn_auth") === "true",
  activeView: "home",
  isSidebarOpen: window.innerWidth > 768,
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
    <div class="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="bg-card border-none shadow-2xl backdrop-blur-xl overflow-hidden rounded-3xl">
          <div class="h-2 bg-primary w-full"></div>
          <div class="p-10 text-center space-y-4">
            <div class="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-2">
              <img src="${LOGO_URL}" alt="Logo" class="w-14 h-14 object-contain brightness-0 invert" />
            </div>
            <div class="space-y-2">
              <h1 class="text-3xl font-heading font-bold">Editorial Login</h1>
              <p class="text-muted-foreground text-base">Access the Al Qahera News internal dashboard</p>
            </div>
          </div>
          <div class="px-8 pb-10">
            <form id="login-form" class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none" for="username">Username</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-3 top-3 w-4 h-4 text-muted-foreground"></i>
                  <input id="username" name="username" placeholder="admin" class="flex h-11 w-full rounded-xl bg-muted/50 border-none px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" required />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium leading-none" for="password">Password</label>
                  <button type="button" class="text-xs text-muted-foreground hover:underline">Forgot password?</button>
                </div>
                <div class="relative">
                  <i data-lucide="lock" class="absolute left-3 top-3 w-4 h-4 text-muted-foreground"></i>
                  <input id="password" name="password" type="password" placeholder="••••••••" class="flex h-11 w-full rounded-xl bg-muted/50 border-none px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" required />
                </div>
              </div>
              <button type="submit" class="inline-flex items-center justify-center w-full h-12 rounded-xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] hover:opacity-90">
                Sign In
              </button>
            </form>
            <div class="mt-8 text-center">
              <p class="text-xs text-muted-foreground">
                Authorized Personnel Only. <br />
                All activities are logged and monitored.
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

  return `
    <div class="flex h-screen w-full bg-background overflow-hidden">
      <!-- Desktop Sidebar -->
      <aside id="sidebar" class="hidden md:flex flex-col border-r bg-card relative z-20 shadow-xl transition-all duration-300" style="width: ${sidebarWidth}">
        <div class="p-6 flex items-center gap-3">
          <div class="w-10 h-10 flex-shrink-0 bg-primary rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            <img src="${LOGO_URL}" alt="Logo" class="w-8 h-8 object-contain brightness-0 invert" />
          </div>
          ${state.isSidebarOpen ? `<span class="font-heading font-bold text-lg tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2">Al Qahera News</span>` : ''}
        </div>

        <div class="flex-1 overflow-y-auto px-4">
          <nav class="space-y-2 py-4">
            ${renderNavItem('home', 'layout-dashboard', 'Dashboard')}
            
            <div class="pt-6 pb-2">
              ${state.isSidebarOpen ? `<p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Editorial Tools</p>` : `<div class="h-px bg-border mx-2"></div>`}
            </div>

            ${TOOLS.map(tool => renderNavItem(tool.id, tool.icon, tool.name)).join('')}
          </nav>
        </div>

        <div class="p-4 border-t space-y-2">
          ${renderNavItem('settings', 'settings', 'Settings')}
          <button id="logout-btn" class="flex items-center gap-4 w-full h-11 px-4 rounded-xl text-destructive hover:bg-destructive/10 transition-all">
            <i data-lucide="log-out" class="w-5 h-5"></i>
            ${state.isSidebarOpen ? `<span class="font-bold text-sm">Logout</span>` : ''}
          </button>
          
          <button id="sidebar-toggle" class="absolute -right-3 top-20 bg-background border rounded-full shadow-md z-30 hover:scale-110 transition-transform p-1">
            <i data-lucide="chevron-right" class="w-4 h-4 transition-transform ${state.isSidebarOpen ? 'rotate-180' : ''}"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0">
        <!-- Top Bar -->
        <header class="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-heading font-bold">
              ${state.activeView === 'home' ? 'Editorial Overview' : activeTool.name}
            </h2>
            ${state.activeView !== 'home' ? `
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                <div class="w-1.5 h-1.5 rounded-full ${activeTool.color}"></div>
                Internal Tool
              </span>
            ` : ''}
          </div>
          <div class="flex items-center gap-4">
            <div class="hidden lg:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-medium">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
              ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <button class="relative p-2 hover:bg-muted rounded-full">
              <i data-lucide="bell" class="w-5 h-5"></i>
              <span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
            </button>
            <div class="h-6 w-px bg-border"></div>
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold">Admin Editor</p>
                <p class="text-[10px] text-muted-foreground uppercase tracking-tighter">Chief Administrator</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-primary shadow-inner flex items-center justify-center text-primary-foreground font-bold text-sm ring-2 ring-primary/20">
                AD
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 relative overflow-hidden bg-muted/20">
          ${state.activeView === 'home' ? renderHomeView() : renderToolView(activeTool)}
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
    <div class="p-8 h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Hero Section -->
        <div class="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl shadow-primary/20">
          <div class="relative z-10 max-w-2xl">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mb-4 backdrop-blur-md">Editorial Suite v2.4</span>
            <h1 class="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">Empowering the Future of News Production</h1>
            <p class="text-primary-foreground/80 text-lg mb-8">Welcome back, Admin. Your editorial tools are ready. Streamline your workflow with AI-powered content atomization and style consistency checks.</p>
            <div class="flex flex-wrap gap-4">
              <button class="inline-flex items-center justify-center rounded-full px-8 h-11 bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-all" onclick="window.switchView('atomizer')">
                Get Started
              </button>
              <button class="inline-flex items-center justify-center rounded-full px-8 h-11 bg-transparent border border-white/30 text-white font-medium hover:bg-white/10 transition-all">
                View Documentation
              </button>
            </div>
          </div>
          <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -right-10 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${renderStatCard('file-text', 'Total Stories', '1,284', '+12%', 'text-blue-500')}
          ${renderStatCard('trending-up', 'Engagement', '84.2k', '+5.4%', 'text-emerald-500')}
          ${renderStatCard('users', 'Active Editors', '42', '0%', 'text-purple-500')}
          ${renderStatCard('check-circle-2', 'Style Score', '98%', '+2%', 'text-orange-500')}
        </div>

        <!-- Tools Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 group hover:shadow-2xl transition-all duration-500 bg-card rounded-3xl p-8 overflow-hidden relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                <i data-lucide="atom" class="w-6 h-6"></i>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-500/20 text-blue-500">Advanced AI</span>
            </div>
            <h3 class="text-3xl font-heading font-bold mb-2">Content Atomizer</h3>
            <p class="text-muted-foreground text-base max-w-md mb-6">Our flagship tool for breaking down long-form journalism into multi-platform atomic content.</p>
            <div class="flex items-center gap-4 mb-6">
              <div class="flex -space-x-2">
                ${[1, 2, 3, 4].map(i => `<div class="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">${String.fromCharCode(64 + i)}</div>`).join('')}
              </div>
              <span class="text-xs text-muted-foreground font-medium">Used by 12 editors today</span>
            </div>
            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 font-bold transition-all" onclick="window.switchView('atomizer')">
              Launch Atomizer Suite
              <i data-lucide="chevron-right" class="inline-block ml-2 w-4 h-4"></i>
            </button>
          </div>

          <div class="group hover:shadow-2xl transition-all duration-500 bg-card rounded-3xl p-8 overflow-hidden relative">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                <i data-lucide="book-open" class="w-6 h-6"></i>
              </div>
            </div>
            <h3 class="text-2xl font-heading font-bold mb-2">Style Book</h3>
            <p class="text-muted-foreground text-sm mb-6">Maintain the Al Qahera standard across all publications.</p>
            <ul class="space-y-3 mb-6">
              ${['Grammar & Syntax', 'Brand Voice Check', 'Fact Verification'].map(item => `
                <li class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500"></i>
                  ${item}
                </li>
              `).join('')}
            </ul>
            <button class="w-full border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl h-12 font-bold transition-all" onclick="window.switchView('stylebook')">
              Open Style Book
            </button>
          </div>
        </div>

        <!-- Activity Feed -->
        <section class="pt-4 pb-12">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-heading font-bold">Live Editorial Feed</h3>
            <button class="text-primary font-bold hover:underline">View All</button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              ${renderActivityItem('atom', 'Story Atomized', 'Global Climate Summit coverage processed into 12 social posts.', '14m ago', 'Completed', 'text-blue-500')}
              ${renderActivityItem('book-open', 'Style Review', 'Editorial review completed for \'Economic Outlook 2026\'.', '1h ago', 'Approved', 'text-emerald-500')}
              ${renderActivityItem('alert-circle', 'System Alert', 'High traffic detected on \'Regional Conflict\' live blog.', '3h ago', 'Active', 'text-orange-500')}
            </div>
            <div class="bg-card rounded-3xl p-6 shadow-lg border-none">
              <h4 class="text-lg font-bold mb-4">Quick Actions</h4>
              <div class="space-y-2">
                ${renderQuickAction('file-text', 'New Story Draft')}
                ${renderQuickAction('users', 'Manage Team')}
                ${renderQuickAction('trending-up', 'Analytics Report')}
              </div>
            </div>
          </div>
        </section>
      </div>
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

function renderToolView(tool) {
  return `
    <div class="absolute inset-0 flex flex-col animate-in fade-in duration-300">
      <div class="bg-background/80 backdrop-blur-md px-8 py-3 flex items-center justify-between border-b z-10">
        <div class="flex items-center gap-4">
          <div class="w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center text-white shadow-lg shadow-primary/10">
            <i data-lucide="${tool.icon}" class="w-4 h-4"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold leading-none mb-1">${tool.name}</span>
            <code class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">${tool.url}</code>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-full px-4 h-8 border text-xs font-medium hover:bg-muted transition-all">
            <i data-lucide="external-link" class="mr-2 w-3.5 h-3.5"></i>
            External View
          </a>
          <button class="p-1.5 hover:bg-muted rounded-full" onclick="window.switchView('home')">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
      <div class="flex-1 bg-white relative">
        <iframe src="${tool.url}" class="w-full h-full border-none" title="${tool.name}" referrerPolicy="no-referrer"></iframe>
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
