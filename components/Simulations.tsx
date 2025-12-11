import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, Layers, Sparkles, MessageSquare, Send, Bot, X, Edit3, Trash2 } from 'lucide-react';
import { fetchSimulations } from '../services/mockApi';
import { Simulation } from '../types';
import { GlassCard, NeonButton } from './ui/Visuals';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

// Extended Interface for local state usage
interface DetailedStep {
    id: string;
    phase: string;
    duration: string;
    items: string[];
    priority: 'High' | 'Medium' | 'Low';
    status: 'pending' | 'completed';
}

const Simulations = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

  // Roadmap State
  const [activeTab, setActiveTab] = useState<'timeline' | 'matrix'>('timeline');
  const [roadmapSteps, setRoadmapSteps] = useState<DetailedStep[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSimulations().then(data => {
      setSimulations(data);
      setLoading(false);
    });
  }, []);

  // Initialize detailed roadmap when a simulation is selected
  useEffect(() => {
    if (selectedSim) {
        setChatMessages([{ role: 'ai', text: `I've generated a strategic roadmap for the **${selectedSim.role}** path. \n\nYou can ask me to modify it (e.g., "Remove Rust", "Focus on Leadership", "Shorten timeline").` }]);
        
        // Mock generating detailed steps based on the simple simulation data
        const generatedSteps: DetailedStep[] = [
            {
                id: '1',
                phase: 'Foundations & Gaps',
                duration: 'Month 1-3',
                items: selectedSim.requirements.slice(0, 2),
                priority: 'High',
                status: 'pending'
            },
            {
                id: '2',
                phase: 'Advanced Specialization',
                duration: 'Month 4-9',
                items: [selectedSim.requirements[2] || "Advanced Architecture", "System Design Patterns"],
                priority: 'High',
                status: 'pending'
            },
            {
                id: '3',
                phase: 'Leadership & Strategy',
                duration: 'Month 10-18',
                items: ["Team Mentorship", "Stakeholder Management", "Strategic Planning"],
                priority: 'Medium',
                status: 'pending'
            },
            {
                id: '4',
                phase: 'Market Execution',
                duration: 'Month 19-24',
                items: ["Mock Interviews", "Salary Negotiation", "Final Portfolio Review"],
                priority: 'Low',
                status: 'pending'
            }
        ];
        setRoadmapSteps(generatedSteps);
        setShowChat(false);
    }
  }, [selectedSim]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleActivate = (id: string) => {
      setActivatedPlan(id);
      setTimeout(() => {
          setSelectedSim(null);
      }, 1500);
  };

  const handleAiCommand = (input: string) => {
      if (!input.trim()) return;

      const userMsg = { role: 'user' as const, text: input };
      setChatMessages(prev => [...prev, userMsg]);
      setChatInput("");

      // SIMULATED AI LOGIC TO MODIFY STATE
      setTimeout(() => {
          let aiResponse = "";
          let updatedSteps = [...roadmapSteps];
          const lowerInput = input.toLowerCase();

          if (lowerInput.includes("remove") || lowerInput.includes("delete")) {
             // Logic to remove items
             const term = input.split("remove")[1]?.trim() || input.split("delete")[1]?.trim();
             if (term) {
                 updatedSteps = updatedSteps.map(step => ({
                     ...step,
                     items: step.items.filter(i => !i.toLowerCase().includes(term.toLowerCase()))
                 }));
                 aiResponse = `I've removed **"${term}"** from your roadmap. The timeline has been adjusted to reflect the reduced workload.`;
             }
          } 
          else if (lowerInput.includes("add") || lowerInput.includes("include")) {
             const term = input.split("add")[1]?.trim() || input.split("include")[1]?.trim();
              if (term) {
                 updatedSteps[0].items.push(term);
                 aiResponse = `I've added **"${term}"** to the Foundation phase. It's crucial to start this early.`;
              }
          }
          else if (lowerInput.includes("shorter") || lowerInput.includes("faster")) {
              updatedSteps = updatedSteps.map(step => ({
                  ...step,
                  duration: step.duration.replace(/Month (\d+)-(\d+)/, (match, p1, p2) => {
                      return `Month ${p1}-${Math.floor(parseInt(p2)*0.8)}`;
                  })
              }));
              aiResponse = "I've compressed the timeline by 20% by increasing weekly intensity. Check the new duration.";
          }
          else if (lowerInput.includes("already know") || lowerInput.includes("skip")) {
             const term = input.includes("know") ? input.split("know")[1]?.trim() : input.split("skip")[1]?.trim();
             if (term) {
                  updatedSteps = updatedSteps.map(step => ({
                     ...step,
                     items: step.items.filter(i => !i.toLowerCase().includes(term.toLowerCase()))
                 }));
                 aiResponse = `Great! Since you already know **"${term}"**, I've removed it. We can focus more on the gaps.`;
             }
          }
          else {
              aiResponse = "I can help adjust your roadmap. Try saying 'Remove Rust', 'Add Python', or 'Make it faster'.";
          }

          setRoadmapSteps(updatedSteps);
          setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      }, 800);
  };

  if (loading) return (
      <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-8">
           <div className="p-3.5 bg-white/50 backdrop-blur-md rounded-2xl text-indigo-600 shadow-glass border border-white">
               <Map size={24} />
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Career Path Simulations</h1>
               <p className="text-slate-500">Compare different futures based on current market data.</p>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {simulations.map((sim, index) => (
             <MotionDiv
                key={sim.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                onClick={() => setSelectedSim(sim)}
                className={`glass-card-3d p-7 rounded-[2rem] group cursor-pointer relative overflow-hidden ${activatedPlan === sim.id ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}
             >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={100} />
                </div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                   {sim.matchScore > 80 ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">Recommended</span>
                   ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100/50 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-sm">Alternative</span>
                   )}
                   <span className="text-slate-400 text-xs flex items-center gap-1 font-bold bg-white/50 px-2 py-1 rounded-lg">
                       <Clock size={12} /> {sim.yearsToGoal} Years
                   </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors relative z-10">{sim.role}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed relative z-10">{sim.description}</p>
                
                <div className="space-y-3 mb-6 bg-white/40 p-5 rounded-2xl border border-white/60 relative z-10 backdrop-blur-sm">
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Salary Potential</span>
                       <span className="text-slate-900 font-bold">₹{(sim.salaryRange[0]/100000).toFixed(0)}L - ₹{(sim.salaryRange[1]/100000).toFixed(0)}L</span>
                   </div>
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Skill Gap</span>
                       <span className={`font-bold ${
                           sim.skillGap === 'Low' ? 'text-emerald-600' : sim.skillGap === 'Medium' ? 'text-amber-500' : 'text-red-500'
                       }`}>{sim.skillGap}</span>
                   </div>
                </div>

                <button className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 relative z-10 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                   {activatedPlan === sim.id ? "Plan Active" : "View Detailed Roadmap"} <ArrowRight size={16} />
                </button>
             </MotionDiv>
           ))}
       </div>

       {/* Detailed Modal */}
       <AnimatePresence>
           {selectedSim && (
               <MotionDiv 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4"
                 onClick={() => setSelectedSim(null)}
               >
                   <MotionDiv 
                     initial={{ scale: 0.95, y: 20 }} 
                     animate={{ scale: 1, y: 0 }} 
                     exit={{ scale: 0.95, y: 20 }}
                     className="glass-panel w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/80 flex flex-col md:flex-row bg-[#F8FAFC]"
                     onClick={(e) => e.stopPropagation()}
                   >
                       {/* Left Panel: Content */}
                       <div className="flex-1 flex flex-col h-full overflow-hidden">
                           {/* Modal Header */}
                           <div className="p-6 md:p-8 border-b border-slate-200 bg-white/50 flex justify-between items-start sticky top-0 z-20">
                               <div>
                                   <div className="flex items-center gap-2 mb-2">
                                       <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">Simulation</span>
                                       <span className="text-slate-400 text-xs font-bold">•</span>
                                       <span className="text-slate-500 text-xs font-bold">{selectedSim.yearsToGoal} Year Plan</span>
                                   </div>
                                   <h2 className="text-3xl font-display font-bold text-slate-900 leading-tight">{selectedSim.role}</h2>
                               </div>
                               <div className="flex gap-2">
                                    <NeonButton 
                                        variant="secondary"
                                        onClick={() => setShowChat(!showChat)}
                                        className={`!py-2 !px-4 !text-xs ${showChat ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
                                    >
                                        <Sparkles size={14} /> {showChat ? 'Hide AI' : 'Customize with AI'}
                                    </NeonButton>
                                    <button onClick={() => setSelectedSim(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors">
                                        <X size={20} />
                                    </button>
                               </div>
                           </div>

                           {/* Tabs */}
                           <div className="px-8 pt-4 pb-0 flex gap-6 border-b border-slate-200 bg-white/30">
                               <button 
                                   onClick={() => setActiveTab('timeline')}
                                   className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'timeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                               >
                                   <Calendar size={16} /> Timeline View
                               </button>
                               <button 
                                   onClick={() => setActiveTab('matrix')}
                                   className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'matrix' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                               >
                                   <Layers size={16} /> Strategy Matrix
                               </button>
                           </div>

                           {/* Tab Content */}
                           <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                               <AnimatePresence mode="wait">
                                   {activeTab === 'timeline' && (
                                       <MotionDiv 
                                            key="timeline"
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                            className="space-y-8 relative"
                                       >
                                           <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                                           {roadmapSteps.map((step, idx) => (
                                               <div key={step.id} className="relative pl-12 group">
                                                   {/* Node */}
                                                   <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${
                                                       step.priority === 'High' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'
                                                   }`}>
                                                       <span className="font-bold text-sm">{idx + 1}</span>
                                                   </div>

                                                   {/* Card */}
                                                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-200">
                                                       <div className="flex justify-between items-start mb-4">
                                                           <div>
                                                               <h4 className="text-lg font-bold text-slate-900">{step.phase}</h4>
                                                               <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 mt-1 inline-block">{step.duration}</span>
                                                           </div>
                                                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                               step.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                           }`}>
                                                               {step.priority} Priority
                                                           </span>
                                                       </div>
                                                       
                                                       <ul className="space-y-3">
                                                           {step.items.map((item, i) => (
                                                               <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                                   <div className="w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center text-transparent hover:text-indigo-500 cursor-pointer hover:border-indigo-500 transition-all bg-slate-50">
                                                                       <CheckCircle size={14} />
                                                                   </div>
                                                                   {item}
                                                               </li>
                                                           ))}
                                                       </ul>
                                                   </div>
                                               </div>
                                           ))}
                                       </MotionDiv>
                                   )}

                                   {activeTab === 'matrix' && (
                                       <MotionDiv 
                                            key="matrix"
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="h-full grid grid-cols-2 grid-rows-2 gap-4 min-h-[500px]"
                                       >
                                            <MatrixQuad title="Quick Wins" desc="High Impact, Low Effort" color="bg-emerald-50 border-emerald-100 text-emerald-800" items={roadmapSteps[0].items} />
                                            <MatrixQuad title="Major Projects" desc="High Impact, High Effort" color="bg-indigo-50 border-indigo-100 text-indigo-800" items={roadmapSteps[1].items} />
                                            <MatrixQuad title="Fill-ins" desc="Low Impact, Low Effort" color="bg-slate-50 border-slate-200 text-slate-600" items={["Portfolio Polish", "Networking"]} />
                                            <MatrixQuad title="Thankless Tasks" desc="Low Impact, High Effort" color="bg-red-50 border-red-100 text-red-800" items={["Legacy Code Study"]} />
                                       </MotionDiv>
                                   )}
                               </AnimatePresence>
                           </div>

                           {/* Footer Actions */}
                           <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center z-10">
                                <div className="text-xs text-slate-400 font-medium">
                                    Last updated: Just now
                                </div>
                                <div className="flex gap-4">
                                   <button 
                                        onClick={() => setSelectedSim(null)} 
                                        className="px-6 py-3 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
                                    >
                                        Close
                                    </button>
                                   <button 
                                        onClick={() => handleActivate(selectedSim.id)}
                                        disabled={activatedPlan === selectedSim.id}
                                        className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${activatedPlan === selectedSim.id ? 'bg-emerald-500 text-white cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}
                                   >
                                       {activatedPlan === selectedSim.id ? <><CheckCircle size={18} /> Plan Active</> : "Activate This Plan"}
                                   </button>
                               </div>
                           </div>
                       </div>

                       {/* Right Panel: AI Chat (Collapsible) */}
                       <AnimatePresence>
                           {showChat && (
                               <MotionDiv 
                                   initial={{ width: 0, opacity: 0 }}
                                   animate={{ width: 320, opacity: 1 }}
                                   exit={{ width: 0, opacity: 0 }}
                                   className="border-l border-slate-200 bg-white flex flex-col shadow-inner relative"
                               >
                                   <div className="p-4 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
                                       <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                           <Bot size={16} className="text-indigo-600" /> Roadmap Architect
                                       </h3>
                                       <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
                                           <X size={16} />
                                       </button>
                                   </div>
                                   
                                   <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                                       {chatMessages.map((msg, i) => (
                                           <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                               <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                                                   msg.role === 'user' 
                                                   ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                                                   : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                                               }`}>
                                                   {msg.text.split('\n').map((line, l) => <p key={l} className="mb-1 last:mb-0">{line}</p>)}
                                               </div>
                                           </div>
                                       ))}
                                       <div ref={chatEndRef} />
                                   </div>

                                   <div className="p-4 border-t border-slate-100 bg-white">
                                       <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                           <input 
                                               type="text" 
                                               value={chatInput}
                                               onChange={(e) => setChatInput(e.target.value)}
                                               onKeyDown={(e) => e.key === 'Enter' && handleAiCommand(chatInput)}
                                               placeholder="Type 'Remove Rust'..."
                                               className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none pl-1"
                                           />
                                           <button 
                                               onClick={() => handleAiCommand(chatInput)}
                                               className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                           >
                                               <Send size={14} />
                                           </button>
                                       </div>
                                       <div className="mt-2 flex gap-1 flex-wrap">
                                            {["Remove Rust", "Make it faster", "Add Python"].map(hint => (
                                                <button 
                                                    key={hint} 
                                                    onClick={() => handleAiCommand(hint)}
                                                    className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    {hint}
                                                </button>
                                            ))}
                                       </div>
                                   </div>
                               </MotionDiv>
                           )}
                       </AnimatePresence>
                   </MotionDiv>
               </MotionDiv>
           )}
       </AnimatePresence>
    </div>
  );
};

// Helper for Matrix View
const MatrixQuad = ({ title, desc, color, items }: any) => (
    <div className={`p-5 rounded-2xl border ${color} bg-opacity-40 flex flex-col`}>
        <h4 className="font-bold text-sm mb-0.5">{title}</h4>
        <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider mb-4">{desc}</p>
        <ul className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
            {items.map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default Simulations;