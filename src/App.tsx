import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Atom, 
  BookOpen, 
  Menu, 
  X, 
  ChevronRight,
  ExternalLink,
  Info,
  Settings,
  Bell,
  LogOut,
  User,
  Lock,
  TrendingUp,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const LOGO_URL = "https://alqaheranews.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.6a2665e0.png&w=3840&q=75";

type View = "home" | "atomizer" | "stylebook";

interface Tool {
  id: View;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const TOOLS: Tool[] = [
  {
    id: "atomizer",
    name: "Content Atomizer",
    description: "Break down complex news stories into atomic, shareable content pieces.",
    url: "https://content-atomizer-563127110175.us-west1.run.app",
    icon: <Atom className="w-5 h-5" />,
    color: "bg-blue-500",
  },
  {
    id: "stylebook",
    name: "Style Book",
    description: "Ensure editorial consistency and adherence to Al Qahera News style guidelines.",
    url: "https://correction-aqn-563127110175.us-central1.run.app",
    icon: <BookOpen className="w-5 h-5" />,
    color: "bg-emerald-500",
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<View>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("aqn_auth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = formData.get("username");
    const pass = formData.get("password");

    if (user === "admin" && pass === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("aqn_auth", "true");
    } else {
      alert("Invalid credentials. Please use admin/admin.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("aqn_auth");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const activeTool = TOOLS.find(t => t.id === activeView);

  return (
    <TooltipProvider delay={0}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="hidden md:flex flex-col border-r bg-card relative z-20 shadow-xl"
        >
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-primary rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
              <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-heading font-bold text-lg tracking-tight whitespace-nowrap"
              >
                Al Qahera News
              </motion.span>
            )}
          </div>

          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-2 py-4">
              <NavItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Dashboard" 
                active={activeView === "home"} 
                collapsed={!isSidebarOpen}
                onClick={() => setActiveView("home")}
              />
              
              <div className="pt-6 pb-2">
                {isSidebarOpen ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Editorial Tools</p>
                ) : (
                  <Separator className="mx-2" />
                )}
              </div>

              {TOOLS.map((tool) => (
                <NavItem 
                  key={tool.id}
                  icon={tool.icon} 
                  label={tool.name} 
                  active={activeView === tool.id} 
                  collapsed={!isSidebarOpen}
                  onClick={() => setActiveView(tool.id)}
                />
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              collapsed={!isSidebarOpen}
            />
            <NavItem 
              icon={<LogOut className="w-5 h-5" />} 
              label="Logout" 
              collapsed={!isSidebarOpen}
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -right-3 top-20 bg-background border rounded-full shadow-md z-30 hover:scale-110 transition-transform"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </motion.aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Logo" className="h-8 object-contain" referrerPolicy="no-referrer" />
            <span className="font-heading font-bold">AQN Dashboard</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-6 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                </div>
                <span className="font-heading font-bold text-lg">Al Qahera News</span>
              </div>
              <nav className="p-4 space-y-2">
                <NavItem 
                  icon={<LayoutDashboard className="w-5 h-5" />} 
                  label="Dashboard" 
                  active={activeView === "home"} 
                  onClick={() => setActiveView("home")}
                />
                <Separator className="my-4" />
                {TOOLS.map((tool) => (
                  <NavItem 
                    key={tool.id}
                    icon={tool.icon} 
                    label={tool.name} 
                    active={activeView === tool.id} 
                    onClick={() => setActiveView(tool.id)}
                  />
                ))}
                <Separator className="my-4" />
                <NavItem 
                  icon={<LogOut className="w-5 h-5" />} 
                  label="Logout" 
                  onClick={handleLogout}
                  className="text-destructive"
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
          {/* Top Bar */}
          <header className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-heading font-bold">
                {activeView === "home" ? "Editorial Overview" : activeTool?.name}
              </h2>
              {activeView !== "home" && (
                <Badge variant="secondary" className="gap-1.5 font-medium">
                  <div className={`w-1.5 h-1.5 rounded-full ${activeTool?.color}`} />
                  Internal Tool
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">Admin Editor</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Chief Administrator</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary shadow-inner flex items-center justify-center text-primary-foreground font-bold text-sm ring-2 ring-primary/20">
                  AD
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden bg-muted/20">
            <AnimatePresence mode="wait">
              {activeView === "home" ? (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 h-full overflow-y-auto"
                >
                  <div className="max-w-6xl mx-auto space-y-8">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl shadow-primary/20">
                      <div className="relative z-10 max-w-2xl">
                        <Badge className="bg-white/20 text-white border-none mb-4 backdrop-blur-md">Editorial Suite v2.4</Badge>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">Empowering the Future of News Production</h1>
                        <p className="text-primary-foreground/80 text-lg mb-8">Welcome back, Admin. Your editorial tools are ready. Streamline your workflow with AI-powered content atomization and style consistency checks.</p>
                        <div className="flex flex-wrap gap-4">
                          <Button variant="secondary" size="lg" className="rounded-full px-8" onClick={() => setActiveView("atomizer")}>
                            Get Started
                          </Button>
                          <Button variant="outline" size="lg" className="rounded-full px-8 bg-transparent border-white/30 text-white hover:bg-white/10">
                            View Documentation
                          </Button>
                        </div>
                      </div>
                      {/* Abstract Shapes */}
                      <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                      <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-2xl" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard icon={<FileText className="text-blue-500" />} label="Total Stories" value="1,284" trend="+12%" />
                      <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Engagement" value="84.2k" trend="+5.4%" />
                      <StatCard icon={<Users className="text-purple-500" />} label="Active Editors" value="42" trend="0%" />
                      <StatCard icon={<CheckCircle2 className="text-orange-500" />} label="Style Score" value="98%" trend="+2%" />
                    </div>

                    {/* Tools Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-2 group hover:shadow-2xl transition-all duration-500 border-none bg-gradient-to-br from-card to-muted/50 overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                              <Atom className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className="text-blue-500 border-blue-500/20">Advanced AI</Badge>
                          </div>
                          <CardTitle className="text-3xl font-heading">Content Atomizer</CardTitle>
                          <CardDescription className="text-base max-w-md">
                            Our flagship tool for breaking down long-form journalism into multi-platform atomic content.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex -space-x-2">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                  {String.fromCharCode(64 + i)}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Used by 12 editors today</span>
                          </div>
                          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12" onClick={() => setActiveView("atomizer")}>
                            Launch Atomizer Suite
                            <ChevronRight className="ml-2 w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="group hover:shadow-2xl transition-all duration-500 border-none bg-gradient-to-br from-card to-muted/50 overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          </div>
                          <CardTitle className="text-2xl font-heading">Style Book</CardTitle>
                          <CardDescription className="text-sm">
                            Maintain the Al Qahera standard across all publications.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Grammar & Syntax
                            </li>
                            <li className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Brand Voice Check
                            </li>
                            <li className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Fact Verification
                            </li>
                          </ul>
                          <Button variant="outline" className="w-full border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl h-12" onClick={() => setActiveView("stylebook")}>
                            Open Style Book
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Activity Feed */}
                    <section className="pt-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-heading font-bold">Live Editorial Feed</h3>
                        <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <ActivityItem 
                            icon={<Atom className="text-blue-500" />} 
                            title="Story Atomized" 
                            desc="Global Climate Summit coverage processed into 12 social posts." 
                            time="14m ago" 
                            status="Completed"
                          />
                          <ActivityItem 
                            icon={<BookOpen className="text-emerald-500" />} 
                            title="Style Review" 
                            desc="Editorial review completed for 'Economic Outlook 2026'." 
                            time="1h ago" 
                            status="Approved"
                          />
                          <ActivityItem 
                            icon={<AlertCircle className="text-orange-500" />} 
                            title="System Alert" 
                            desc="High traffic detected on 'Regional Conflict' live blog." 
                            time="3h ago" 
                            status="Active"
                          />
                        </div>
                        <Card className="border-none shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-lg">
                              <FileText className="w-4 h-4" />
                              New Story Draft
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-lg">
                              <Users className="w-4 h-4" />
                              Manage Team
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-lg">
                              <TrendingUp className="w-4 h-4" />
                              Analytics Report
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={activeView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="bg-background/80 backdrop-blur-md px-8 py-3 flex items-center justify-between border-b z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg ${activeTool?.color} flex items-center justify-center text-white shadow-lg shadow-primary/10`}>
                        {activeTool?.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold leading-none mb-1">{activeTool?.name}</span>
                        <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">{activeTool?.url}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-full shadow-sm" asChild>
                        <a href={activeTool?.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 w-3.5 h-3.5" />
                          External View
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setActiveView("home")}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white relative">
                    <iframe 
                      src={activeTool?.url} 
                      className="w-full h-full border-none"
                      title={activeTool?.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

function LoginPage({ onLogin }: { onLogin: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden rounded-3xl">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="space-y-4 pt-10 text-center">
            <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-2">
              <img src={LOGO_URL} alt="Logo" className="w-14 h-14 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-heading font-bold">Editorial Login</CardTitle>
              <CardDescription className="text-base">Access the Al Qahera News internal dashboard</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={onLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="username" 
                    name="username" 
                    placeholder="admin" 
                    className="pl-10 h-11 rounded-xl bg-muted/50 border-none focus-visible:ring-primary" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="px-0 text-xs text-muted-foreground h-auto">Forgot password?</Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 rounded-xl bg-muted/50 border-none focus-visible:ring-primary" 
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                Sign In
              </Button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Authorized Personnel Only. <br />
                All activities are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            {icon}
          </div>
          <Badge variant={isPositive ? "secondary" : "outline"} className={isPositive ? "text-emerald-500 bg-emerald-500/10 border-none" : ""}>
            {trend}
          </Badge>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon, title, desc, time, status }: { icon: React.ReactNode, title: string, desc: string, time: string, status: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-transparent hover:border-border hover:shadow-sm transition-all group">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-sm">{title}</p>
          <span className="text-[10px] text-muted-foreground font-medium">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{desc}</p>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">{status}</Badge>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  collapsed = false, 
  onClick,
  className = ""
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  collapsed?: boolean;
  onClick?: () => void;
  className?: string;
  key?: string | number;
}) {
  const content = (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`w-full justify-start gap-4 h-11 px-4 transition-all rounded-xl ${active ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`${active ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      {!collapsed && (
        <span className="font-bold text-sm truncate">{label}</span>
      )}
      {active && !collapsed && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
        />
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-bold">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
