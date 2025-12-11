import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Mic, 
  UserCircle, 
  LogOut, 
  Menu,
  X,
  Map,
  BookOpen,
  Settings,
  LineChart
} from 'lucide-react';
import { User, CareerProfile, OnboardingPreferences } from './types';
import { MOCK_PROFILE } from './constants';
import { AuroraBackground, CareerBackground, MouseSpotlight } from './components/ui/Visuals';
import { supabase } from './services/supabaseClient';

// --- Components ---
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import LiveInterview from './components/LiveInterview';
import ProfileBuilder from './components/ProfileBuilder';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import Simulations from './components/Simulations';
import Courses from './components/Courses';
import AppSettings from './components/Settings';
import Progress from './components/Progress'; 
import { BootScreen } from './components/BootScreen';
import { Features, Pricing, HowItWorks } from './components/StaticPages';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  profile: CareerProfile | null;
  logout: () => void;
  completeOnboarding: (prefs: OnboardingPreferences) => void;
  updateProfile: (p: CareerProfile) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

// --- Layout ---
const SidebarItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick?: () => void }) => (
  <Link to={to} className="relative block group my-1" onClick={onClick}>
    {active && (
        <MotionDiv 
            layoutId="activeSidebar"
            className="absolute inset-0 bg-blue-50 rounded-xl border border-blue-100 shadow-sm"
            initial={false}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
    )}
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10 ${
      active 
        ? 'text-blue-700' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}>
      <Icon size={20} className={`transition-transform duration-200 ${active ? 'scale-110 text-primary' : ''}`} />
      <span className={`font-medium text-sm tracking-wide ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
  </Link>
);

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen text-slate-800 flex overflow-hidden font-sans selection:bg-blue-100 bg-[#F8FAFC]">
      <AuroraBackground />
      <CareerBackground />
      <MouseSpotlight />

      {/* Sidebar Desktop - Floating Glass */}
      <aside className="hidden md:flex w-72 flex-col z-20 p-4 pl-6 h-screen">
        <div className="flex-1 rounded-[2rem] glass-panel-premium flex flex-col overflow-hidden shadow-2xl bg-white/70 backdrop-blur-xl border border-white/40">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-white/40">
                <div>
                    <span className="font-display font-bold text-2xl tracking-tight text-slate-900 block leading-tight">
                    Quantum
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold opacity-80">HR Core</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
            <LayoutGroup id="sidebar">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-4 px-4">Overview</div>
                <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
                <SidebarItem to="/simulations" icon={Map} label="Career Paths" active={location.pathname === '/simulations'} />
                <SidebarItem to="/progress" icon={LineChart} label="My Progress" active={location.pathname === '/progress'} />

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8 px-4">AI Agents</div>
                <SidebarItem to="/copilot" icon={MessageSquareText} label="Agent Chat" active={location.pathname === '/copilot'} />
                <SidebarItem to="/live" icon={Mic} label="Live Interview" active={location.pathname === '/live'} />

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8 px-4">Growth</div>
                <SidebarItem to="/courses" icon={BookOpen} label="Courses & ROI" active={location.pathname === '/courses'} />
                <SidebarItem to="/profile" icon={UserCircle} label="My Profile" active={location.pathname === '/profile'} />
                <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
            </LayoutGroup>
            </nav>

            <div className="p-4 border-t border-slate-100 bg-white/40">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white hover:border-blue-100 transition-colors shadow-sm">
                    <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="User" className="w-9 h-9 rounded-lg border border-slate-200 shadow-sm object-cover" />
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate font-medium">Pro Plan</p>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-slate-900">Quantum</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-900">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MotionDiv 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl pt-20 px-4 h-screen overflow-y-auto"
          >
            <nav className="space-y-2 pb-10">
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} onClick={closeMobileMenu} />
              <SidebarItem to="/simulations" icon={Map} label="Career Paths" active={location.pathname === '/simulations'} onClick={closeMobileMenu} />
              <SidebarItem to="/progress" icon={LineChart} label="My Progress" active={location.pathname === '/progress'} onClick={closeMobileMenu} />
              <SidebarItem to="/copilot" icon={MessageSquareText} label="Agent Chat" active={location.pathname === '/copilot'} onClick={closeMobileMenu} />
              <SidebarItem to="/live" icon={Mic} label="Live Interview" active={location.pathname === '/live'} onClick={closeMobileMenu} />
              <SidebarItem to="/courses" icon={BookOpen} label="Courses & ROI" active={location.pathname === '/courses'} onClick={closeMobileMenu} />
              <SidebarItem to="/profile" icon={UserCircle} label="My Profile" active={location.pathname === '/profile'} onClick={closeMobileMenu} />
              <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} onClick={closeMobileMenu} />
              
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl mt-8">
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0 z-10 scroll-smooth">
         <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20 md:h-screen md:overflow-y-auto no-scrollbar">
            {children}
         </div>
      </main>
    </div>
  );
};

// --- App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(false);

  const fetchProfile = async (userId: string) => {
      try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (data) {
              setProfile({
                  title: data.title || '',
                  skills: data.skills || [],
                  experienceYears: data.experience_years || 0,
                  targetRole: data.target_role || '',
                  location: data.location || ''
              });
              // Update user onboarding state from DB profile if needed
              if (data.onboarding_completed && user) {
                 setUser(prev => prev ? ({ ...prev, onboardingCompleted: true }) : null);
              }
          } else {
              // If no profile exists yet, use default/empty
              setProfile(MOCK_PROFILE);
          }
      } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(MOCK_PROFILE);
      }
  };

  useEffect(() => {
    // Check active session
    const initAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Session error:", error);
                setLoading(false);
                return;
            }

            if (session?.user) {
                const newUser: User = {
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email!,
                    avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
                    role: session.user.user_metadata.role as any,
                    onboardingCompleted: false
                };
                setUser(newUser);
                await fetchProfile(session.user.id);
            }
        } catch (error) {
            console.error("Init auth error:", error);
        } finally {
            setLoading(false);
        }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email);
      
      if (session?.user) {
         const newUser: User = {
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email!,
            avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
            role: session.user.user_metadata.role as any,
            onboardingCompleted: false
        };
        setUser(newUser);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setBooting(false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const completeOnboarding = async (prefs: OnboardingPreferences) => {
    if (!user) return;
    try {
        setBooting(true);
        // Save prefs to DB
        await supabase.from('user_preferences').upsert({
            user_id: user.id,
            interests: prefs.interests,
            cities: prefs.cities,
            migration_willingness: prefs.migrationWillingness,
            salary_target: prefs.salaryTarget,
            salary_goal_2y: prefs.salaryGoal2Year,
            risk_tolerance: prefs.riskTolerance,
            learning_styles: prefs.learningStyles,
            language: prefs.language
        });

        // Update profile onboarding status
        await supabase.from('profiles').upsert({
            id: user.id,
            onboarding_completed: true,
            updated_at: new Date()
        }, { onConflict: 'id' });

        const updatedUser = { ...user, onboardingCompleted: true };
        setUser(updatedUser);
        
        setTimeout(() => setBooting(false), 2000);
    } catch (e) {
        console.error("Onboarding save failed", e);
        setBooting(false);
    }
  };

  const updateProfile = async (p: CareerProfile) => {
    if (!user) return;
    setProfile(p);
    
    try {
        await supabase.from('profiles').upsert({
            id: user.id,
            title: p.title,
            skills: p.skills,
            experience_years: p.experienceYears,
            target_role: p.targetRole,
            location: p.location,
            updated_at: new Date()
        });
    } catch (error) {
        console.error("Update profile error:", error);
    }
  };

  // Show loading screen
  if (loading || booting) {
    return <BootScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, logout, completeOnboarding, updateProfile, refreshProfile: async () => { if(user) await fetchProfile(user.id) } }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/features" element={!user ? <Features /> : <Navigate to="/dashboard" replace />} />
          <Route path="/pricing" element={!user ? <Pricing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/how-it-works" element={!user ? <HowItWorks /> : <Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={
            user && !user.onboardingCompleted && user.role !== 'admin' ? <Onboarding /> : <Navigate to={user ? "/dashboard" : "/"} replace />
          } />
          <Route path="/*" element={
            user ? (
              user.onboardingCompleted || user.role === 'admin' ? (
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/copilot" element={<ChatInterface />} />
                    <Route path="/live" element={<LiveInterview />} />
                    <Route path="/simulations" element={<Simulations />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/profile" element={<ProfileBuilder />} />
                    <Route path="/settings" element={<AppSettings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AppLayout>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
