import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { INITIAL_SALARY_DATA } from '../constants';
import { TrendingUp, Briefcase, Target, Award, ExternalLink, MapPin, X, BookOpen, Check, ShieldCheck, Users } from 'lucide-react';
import { GlassCard, NeonButton } from './ui/Visuals';
import { AdminResumeScanner } from './AdminResumeScanner';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

const RECENT_JOBS = [
    {
        id: 1,
        company: "TechFlow AI",
        title: "Senior Frontend Engineer",
        location: "Remote (India)",
        salary: "₹24L - ₹35L",
        link: "#",
        tags: ["React", "TypeScript", "AI"]
    },
    {
        id: 2,
        company: "CloudScale Systems",
        title: "Lead UI Developer",
        location: "Bangalore, KA",
        salary: "₹32L - ₹45L",
        link: "#",
        tags: ["System Design", "Leadership"]
    },
    {
        id: 3,
        company: "Nebula Data",
        title: "Product Engineer",
        location: "Gurgaon, NCR",
        salary: "₹18L - ₹26L",
        link: "#",
        tags: ["Full Stack", "Node.js"]
    }
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [showResumeScanner, setShowResumeScanner] = useState(false);

  // Updated Admin Check
  const isAdmin = user?.email?.includes('admin') || user?.role === 'admin';

  const skillData = profile?.skills.map((skill, index) => ({
    name: skill,
    proficiency: Math.floor(Math.random() * 40) + 60,
    courses: [
        { name: `Advanced ${skill} Patterns`, provider: 'FrontendMasters' },
        { name: `${skill} for Enterprise`, provider: 'Udemy' }
    ]
  })) || [];

  const handleApply = (id: number) => {
      setAppliedJobs([...appliedJobs, id]);
      // Simulate API call
      setTimeout(() => alert("Application sent successfully!"), 100);
  };

  return (
    <div className="space-y-8 relative">
      <AdminResumeScanner isOpen={showResumeScanner} onClose={() => setShowResumeScanner(false)} />

      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                Welcome back, <span className="text-primary">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium">Here's your {isAdmin ? 'admin' : 'career'} telemetry.</p>
        </div>
        {isAdmin && (
            <NeonButton 
                onClick={() => setShowResumeScanner(true)}
                className="shadow-lg shadow-indigo-500/20"
            >
                <ShieldCheck size={18} /> Admin Console
            </NeonButton>
        )}
      </header>

      {/* Admin Quick Action (Only for Admin) */}
      {isAdmin && (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-1 rounded-[2rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-8"
          >
              <div className="bg-white rounded-[1.8rem] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                          <Users size={32} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Bulk Resume Scanner</h3>
                          <p className="text-slate-500 text-sm">Process 500+ resumes with Multi-Agent AI (Fairness & Bias Check).</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setShowResumeScanner(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                      Launch Scanner
                  </button>
              </div>
          </MotionDiv>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Market Readiness" 
          value="85%" 
          trend="+5%" 
          icon={TrendingUp} 
          color="text-secondary" 
        />
        <StatsCard 
          title="Applications" 
          value={12 + appliedJobs.length} 
          trend="Active" 
          icon={Briefcase} 
          color="text-primary" 
        />
        <StatsCard 
          title="Target Role" 
          value={profile?.targetRole || 'Not Set'} 
          trend="On Track" 
          icon={Target} 
          color="text-accent" 
        />
        <StatsCard 
          title="Skill Match" 
          value="9/10" 
          trend="High" 
          icon={Award} 
          color="text-slate-900" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Chart */}
        <GlassCard className="p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Salary Benchmark (INR)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INITIAL_SALARY_DATA}>
                <defs>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="role" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/100000}L`} />
                <Tooltip 
                  contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      backdropFilter: 'blur(10px)',
                      borderColor: '#e2e8f0', 
                      color: '#0f172a', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#2563EB' }}
                  formatter={(value: any) => [`₹${(value/100000).toFixed(1)} Lakhs`, 'Median Salary']}
                />
                <Area type="monotone" dataKey="median" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorMin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skills Chart */}
        <GlassCard className="p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
            Current Skill Proficiency
          </h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(0, 0, 0, 0.02)'}}
                   contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                    dataKey="proficiency" 
                    radius={[0, 4, 4, 0]} 
                    barSize={16}
                    onClick={(data) => setSelectedSkill(data)}
                    cursor="pointer"
                >
                    {skillData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.proficiency > 80 ? '#0EA5E9' : '#2563EB'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Job Postings Section */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={22} className="text-primary" />
            Top Matching Jobs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RECENT_JOBS.map((job) => (
                <GlassCard 
                    key={job.id}
                    className="p-6 flex flex-col justify-between group"
                >
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h4>
                            <span className="bg-blue-50 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-blue-100">New</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">{job.company}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4 font-medium">
                            <MapPin size={12} /> {job.location}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {job.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="font-bold text-slate-900 text-sm">{job.salary}</span>
                        {appliedJobs.includes(job.id) ? (
                             <span className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                                <Check size={16} /> Applied
                             </span>
                        ) : (
                            <button 
                                onClick={() => handleApply(job.id)}
                                className="text-primary hover:text-blue-700 font-bold text-sm flex items-center gap-1 transition-colors"
                            >
                                Apply <ExternalLink size={14} />
                            </button>
                        )}
                    </div>
                </GlassCard>
            ))}
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1 font-display">Recommended Next Step</h3>
            <p className="text-blue-100 text-sm max-w-xl">Based on your goal to become a <strong>{profile?.targetRole}</strong>, we recommend practicing System Design interviews.</p>
        </div>
        <button 
            onClick={() => navigate('/live')}
            className="relative z-10 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
        >
          Start Session
        </button>
      </div>

      {/* Skill Details Modal */}
      <AnimatePresence>
        {selectedSkill && (
            <MotionDiv 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                onClick={() => setSelectedSkill(null)}
            >
                <GlassCard className="p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 font-display">{selectedSkill.name}</h3>
                            <p className="text-primary font-bold">Proficiency: {selectedSkill.proficiency}%</p>
                        </div>
                        <button onClick={() => setSelectedSkill(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                        To reach the next level for <strong>{profile?.targetRole}</strong>, consider these resources:
                    </p>

                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommended Courses</h4>
                    <div className="space-y-3">
                        {selectedSkill.courses?.map((course: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/50 transition-colors cursor-pointer group">
                                <div className="p-2.5 bg-white text-primary rounded-lg shadow-sm border border-slate-100">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{course.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">{course.provider}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <NeonButton 
                        onClick={() => setSelectedSkill(null)}
                        className="w-full mt-8"
                    >
                        Close Details
                    </NeonButton>
                </GlassCard>
            </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatsCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <GlassCard className="p-6 flex items-start justify-between cursor-default">
    <div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1 opacity-70">{title}</p>
      <h4 className="text-3xl font-display font-bold text-slate-900">{value}</h4>
      <span className={`text-[10px] font-bold ${color} bg-slate-100 px-2 py-0.5 rounded-full mt-3 inline-block border border-slate-200`}>
        {trend}
      </span>
    </div>
    <div className={`p-3.5 rounded-2xl bg-slate-50 ${color} shadow-inner border border-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
      <Icon size={22} />
    </div>
  </GlassCard>
);

export default Dashboard;
