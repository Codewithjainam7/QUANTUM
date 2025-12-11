import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Search, Check, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeCourseWithGemini } from '../services/geminiService';
import { CourseRecommendation } from '../types';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

const RECOMMENDED_COURSES = [
  {
    id: 1,
    title: "Advanced React Patterns",
    provider: "FrontendMasters",
    duration: "6 Weeks",
    cost: 12000,
    matchTag: "Senior Frontend Engineer",
    verified: true,
    roi: "High ROI"
  },
  {
    id: 2,
    title: "System Design Interview Guide",
    provider: "Educative.io",
    duration: "Self-paced",
    cost: 8500,
    matchTag: "Tier-1 Tech Companies",
    verified: true,
    roi: "High ROI"
  }
];

const Courses = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CourseRecommendation | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setAnalyzing(true);
    setResult(null);
    
    // Real-time AI Analysis
    const data = await analyzeCourseWithGemini(url);
    
    setResult(data);
    setAnalyzing(false);
  };

  const handleCourseClick = (title: string) => {
      alert(`Redirecting to ${title}...`);
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-3 mb-8">
           <div className="p-3.5 bg-white/50 backdrop-blur-md rounded-2xl text-pink-500 shadow-glass border border-white">
               <BookOpen size={24} />
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Course ROI & Fraud Referee</h1>
               <p className="text-slate-500">AI-analyzed course recommendations with real-time scam detection.</p>
           </div>
       </div>

       {/* URL Checker Input */}
       <div className="glass-card-3d p-8 rounded-[2rem]">
           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Validate a Course
           </h3>
           <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors">
                       <Search size={22} />
                   </div>
                   <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste course URL (e.g. udemy.com/course...)" 
                      className="w-full bg-white/60 border border-white rounded-2xl py-4 pl-14 pr-4 text-slate-900 focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-pink-500/10 transition-all shadow-inner placeholder:text-slate-400 font-medium"
                   />
               </div>
               <button 
                  type="submit" 
                  disabled={analyzing || !url}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
               >
                   {analyzing ? (
                       <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         AI Analyzing...
                       </>
                   ) : "Check ROI"}
               </button>
           </form>

           {/* Analysis Result */}
           {result && (
               <MotionDiv 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 className={`mt-8 p-6 rounded-2xl border border-white/60 shadow-lg ${result.verified ? 'bg-emerald-50/80' : 'bg-red-50/80'}`}
               >
                   <div className="flex items-start justify-between mb-4">
                       <div>
                           <h4 className="text-xl font-bold text-slate-900">{result.title}</h4>
                           <p className="text-sm text-slate-600 font-medium">{result.provider} • ₹{result.cost.toLocaleString()}</p>
                       </div>
                       <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-white/50 ${result.verified ? 'text-emerald-700 bg-white/60' : 'text-red-700 bg-white/60'}`}>
                           {result.verified ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                           {result.verified ? "Verified" : "Risk Detected"}
                       </div>
                   </div>
                   
                   <p className="text-slate-700 mb-6 font-medium leading-relaxed">{result.matchReason}</p>

                   {result.fraudAlerts && result.fraudAlerts.length > 0 && (
                       <div className="bg-white/60 p-5 rounded-xl border border-red-100 shadow-sm">
                           <h5 className="text-red-600 font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18} /> AI Flags:</h5>
                           <ul className="space-y-2">
                               {result.fraudAlerts.map((alert, i) => (
                                   <li key={i} className="text-sm text-red-500 flex items-start gap-3 font-medium">
                                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                                       {alert}
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}
                   
                   {result.verified && (
                       <div className="flex items-center gap-8 mt-4">
                           <div className="bg-white/50 px-4 py-2 rounded-xl border border-white/50">
                               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">ROI Score</p>
                               <p className="text-3xl font-extrabold text-emerald-600">{result.roiScore}/100</p>
                           </div>
                           <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all">
                               Apply with Scholarship
                           </button>
                       </div>
                   )}
               </MotionDiv>
           )}
       </div>

       {/* Static Recommendations */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
               <h3 className="text-lg font-bold text-slate-900">Top Recommendations for You</h3>
               
               {RECOMMENDED_COURSES.map((course) => (
                   <div 
                        key={course.id} 
                        className="glass-card-3d p-6 rounded-3xl flex flex-col sm:flex-row gap-5 group cursor-pointer"
                        onClick={() => handleCourseClick(course.title)}
                   >
                       <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-400 border border-white shadow-inner">
                            <BookOpen size={24} />
                       </div>
                       <div className="flex-1">
                           <div className="flex justify-between items-start mb-1 gap-2">
                               <h4 className="font-bold text-slate-900 text-lg group-hover:text-pink-600 transition-colors leading-tight">{course.title}</h4>
                               {course.verified && (
                                   <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wide whitespace-nowrap flex-shrink-0">
                                       <ShieldCheck size={12}/> Verified
                                   </span>
                               )}
                           </div>
                           <p className="text-sm text-slate-500 mb-2 font-semibold">{course.provider} • {course.duration}</p>
                           <p className="text-xs text-slate-500 mb-4 bg-white/50 inline-block px-2 py-1 rounded-lg border border-white/50">Matches: "{course.matchTag}"</p>
                           <div className="flex items-center justify-between mt-2">
                               <div className="flex items-center gap-4">
                                   <span className="text-slate-900 font-bold text-lg">₹{course.cost.toLocaleString()}</span>
                                   <span className="text-xs text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">{course.roi}</span>
                               </div>
                               <button className="text-xs font-bold text-pink-500 group-hover:text-pink-600 flex items-center gap-1 transition-colors">
                                   View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                               </button>
                           </div>
                       </div>
                   </div>
               ))}
           </div>

           <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Recent Scam Alerts</h3>
                <div className="p-6 rounded-3xl bg-red-50/80 border border-red-100 shadow-glass backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-red-600 font-bold mb-3">
                        <div className="p-1.5 bg-red-100 rounded-lg"><AlertTriangle size={18} /></div>
                        <span>Scam Detected</span>
                    </div>
                    <h5 className="text-slate-900 font-bold mb-2">"Guaranteed Placement" Bootcamp</h5>
                    <div className="text-xs text-slate-600 mb-6 font-medium">
                        We found 3 red flags:
                        <ul className="mt-3 space-y-2">
                            {['Unverified placement stats', 'Generic curriculum', 'No instructor profiles'].map(item => (
                                <li key={item} className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-red-100">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button 
                        onClick={() => setShowAnalysisModal(true)}
                        className="w-full py-3 bg-white text-red-500 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-50 shadow-sm transition-colors"
                    >
                        View Full Analysis
                    </button>
                </div>
           </div>
       </div>

        {/* Mock Analysis Modal */}
        <AnimatePresence>
            {showAnalysisModal && (
                <MotionDiv 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                >
                    <MotionDiv className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl border border-red-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="text-red-500" /> Scam Analysis
                            </h3>
                            <button onClick={() => setShowAnalysisModal(false)}><X className="text-slate-400 hover:text-slate-900" /></button>
                        </div>
                        <div className="space-y-4 text-slate-600 text-sm">
                            <p><strong>Course:</strong> 100% Placement Bootcamp</p>
                            <p><strong>Detection confidence:</strong> 98%</p>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                                "The domain was registered 2 days ago. The 'testimonials' are stock photos. No verifiable LinkedIn profiles for alumni."
                            </div>
                            <p className="mt-4">Recommendation: <strong>Do not proceed.</strong></p>
                        </div>
                        <button onClick={() => setShowAnalysisModal(false)} className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold">Close Report</button>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Courses;
