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
import { 
  TrendingUp, Briefcase, Target, Award, ExternalLink, MapPin, X, BookOpen, 
  Check, ShieldCheck, Users, Brain, Gavel, AlertTriangle, FileText, 
  CheckCircle, Download, Upload, Search, Eye, BarChart3, PieChart, Activity 
} from 'lucide-react';
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

// Admin Types & Data
interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: number;
  matchScore: number;
  status: 'passed' | 'failed' | 'pending';
  flags: string[];
  appliedDate: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    role: 'Senior Frontend Engineer',
    experience: 6,
    matchScore: 94,
    status: 'passed',
    flags: [],
    appliedDate: '2025-01-08'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'm.rodriguez@email.com',
    role: 'Full Stack Developer',
    experience: 4,
    matchScore: 78,
    status: 'passed',
    flags: [],
    appliedDate: '2025-01-07'
  },
  {
    id: '3',
    name: 'Emily Thompson',
    email: 'emily.t@email.com',
    role: 'Backend Engineer',
    experience: 2,
    matchScore: 52,
    status: 'failed',
    flags: ['Insufficient Experience', 'Missing Required Skills'],
    appliedDate: '2025-01-06'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    role: 'DevOps Engineer',
    experience: 8,
    matchScore: 88,
    status: 'passed',
    flags: [],
    appliedDate: '2025-01-05'
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    email: 'j.martinez@email.com',
    role: 'UI/UX Designer',
    experience: 3,
    matchScore: 45,
    status: 'failed',
    flags: ['Bias Detected - Age Markers', 'Role Mismatch'],
    appliedDate: '2025-01-04'
  }
];

const ADMIN_STATS = {
  totalApplications: 247,
  passedCandidates: 156,
  failedCandidates: 91,
  avgMatchScore: 76,
  biasDetected: 12,
  duplicatesFound: 8
};

// Admin Components
const AdminStatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        {trend}
      </span>
    </div>
    <h3 className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const CandidateRow = ({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) => (
  <div
    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
        {candidate.name[0]}
      </div>
      <div>
        <p className="font-bold text-slate-900">{candidate.name}</p>
        <p className="text-sm text-slate-500">{candidate.role}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        candidate.status === 'passed'
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {candidate.status.toUpperCase()}
      </span>
      <span className="text-sm font-bold text-slate-600">{candidate.matchScore}%</span>
      <Eye size={18} className="text-slate-400" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [showResumeScanner, setShowResumeScanner] = useState(false);

  // Admin State
  const [adminTab, setAdminTab] = useState<'overview' | 'candidates' | 'analytics'>('overview');
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      setTimeout(() => alert("Application sent successfully!"), 100);
  };

  // Admin Functions
  const filteredCandidates = candidates.filter(c => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Experience', 'Match Score', 'Status', 'Flags'],
      ...filteredCandidates.map(c => [
        c.name, c.email, c.role, c.experience, c.matchScore, c.status, c.flags.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // ADMIN VIEW
  if (isAdmin) {
    return (
      <div className="space-y-8">
        <AdminResumeScanner isOpen={showResumeScanner} onClose={() => setShowResumeScanner(false)} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={32} />
              Admin Control Center
            </h1>
            <p className="text-slate-500 mt-1">Recruitment Intelligence Dashboard</p>
          </div>
          <button
            onClick={() => setShowResumeScanner(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Upload size={20} />
            Bulk Resume Scanner
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'candidates', label: 'Candidates', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${
                adminTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Admin Content */}
        {adminTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard
                title="Total Applications"
                value={ADMIN_STATS.totalApplications}
                icon={FileText}
                color="bg-blue-50 text-blue-600"
                trend="+12%"
              />
              <AdminStatCard
                title="Passed"
                value={ADMIN_STATS.passedCandidates}
                icon={CheckCircle}
                color="bg-emerald-50 text-emerald-600"
                trend="+8%"
              />
              <AdminStatCard
                title="Failed"
                value={ADMIN_STATS.failedCandidates}
                icon={AlertTriangle}
                color="bg-red-50 text-red-600"
                trend="-3%"
              />
              <AdminStatCard
                title="Avg Match Score"
                value={`${ADMIN_STATS.avgMatchScore}%`}
                icon={TrendingUp}
                color="bg-purple-50 text-purple-600"
                trend="+5%"
              />
            </div>

            {/* AI Processing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Brain size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Multi-Agent Analysis</h3>
                </div>
                <p className="text-2xl font-bold text-indigo-600 mb-2">98.5%</p>
                <p className="text-sm text-slate-600">Accuracy Rate</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Bias Detection</h3>
                </div>
                <p className="text-2xl font-bold text-pink-600 mb-2">{ADMIN_STATS.biasDetected}</p>
                <p className="text-sm text-slate-600">Flags Raised</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Gavel size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900">Processing Speed</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mb-2">45 sec</p>
                <p className="text-sm text-slate-600">Avg per Resume</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {candidates.slice(0, 5).map(candidate => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => setSelectedCandidate(candidate)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'candidates' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'passed', 'failed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as any)}
                      className={`px-4 py-3 rounded-xl font-bold capitalize transition-all ${
                        filterStatus === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  <Download size={20} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Candidates List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-900">
                  {filteredCandidates.length} Candidates
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredCandidates.map(candidate => (
                  <div key={candidate.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {candidate.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{candidate.name}</p>
                          <p className="text-sm text-slate-500">{candidate.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          candidate.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {candidate.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Role:</span>
                        <span className="ml-2 font-bold text-slate-900">{candidate.role}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Experience:</span>
                        <span className="ml-2 font-bold text-slate-900">{candidate.experience} years</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Match Score:</span>
                        <span className="ml-2 font-bold text-indigo-600">{candidate.matchScore}%</span>
                      </div>
                    </div>
                    {candidate.flags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {candidate.flags.map((flag, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
              <Activity size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-slate-500">Advanced analytics and reporting features will be available here.</p>
            </div>
          </div>
        )}

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {selectedCandidate && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
              onClick={() => setSelectedCandidate(null)}
            >
              <MotionDiv
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                    <p className="text-slate-500">{selectedCandidate.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Role</p>
                      <p className="font-bold text-slate-900">{selectedCandidate.role}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Experience</p>
                      <p className="font-bold text-slate-900">{selectedCandidate.experience} years</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Match Score</p>
                      <p className="font-bold text-indigo-600 text-2xl">{selectedCandidate.matchScore}%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                      <p className={`font-bold capitalize ${
                        selectedCandidate.status === 'passed' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {selectedCandidate.status}
                      </p>
                    </div>
                  </div>
                  {selectedCandidate.flags.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm font-bold text-red-600 mb-2">Flags Detected:</p>
                      <ul className="space-y-1">
                        {selectedCandidate.flags.map((flag, i) => (
                          <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle size={14} />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                      Schedule Interview
                    </button>
                    <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
                      Send Email
                    </button>
                  </div>
                </div>
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // REGULAR USER VIEW (Original Dashboard)
  return (
    <div className="space-y-8 relative">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                Welcome back, <span className="text-primary">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium">Here's your career telemetry.</p>
        </div>
      </header>

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