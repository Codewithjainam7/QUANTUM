import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { useAuth } from '../App';
import { OnboardingPreferences } from '../types';
import { AuroraBackground, GlassCard, NeonButton } from './ui/Visuals';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const INTERESTS = [
  "Frontend Dev", "Backend Dev", "Full-Stack", "Data Science", "AI/ML", 
  "UI/UX Design", "Cybersecurity", "Cloud/DevOps", "Product Mgmt", 
  "Digital Marketing", "Finance", "Govt Exams"
];

const CITIES = [
  "Bangalore", "Pune", "Hyderabad", "Mumbai", "Delhi NCR", "Chennai", 
  "Remote", "Stay in Hometown"
];

const LEARNING_STYLES = [
  "Videos & Visuals", "Text Summaries", "Practice Questions", 
  "Mock Interviews", "Projects"
];

const Onboarding = () => {
  const { user, completeOnboarding, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<OnboardingPreferences>({
    interests: [],
    cities: [],
    migrationWillingness: 'Medium',
    salaryTarget: 600000,
    salaryGoal2Year: 1200000,
    riskTolerance: 'Balanced',
    learningStyles: [],
    language: 'English'
  });

  const toggleSelection = (key: keyof OnboardingPreferences, value: string) => {
    setPrefs(prev => {
      const list = prev[key] as string[];
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter(i => i !== value) };
      } else {
        return { ...prev, [key]: [...list, value] };
      }
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = () => {
    completeOnboarding(prefs);
  };

  const StepTitle = ({ title, desc }: { title: string, desc: string }) => (
    <div className="text-center mb-12 mt-4">
      <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">{title}</h2>
      <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden font-sans flex flex-col items-center justify-center p-6">
      <AuroraBackground />

      {/* Close/Logout Button */}
      <button 
        onClick={logout} 
        className="absolute top-8 right-8 p-3 rounded-full bg-white/50 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white transition-all z-50 hover:rotate-90 duration-300 group"
        title="Exit Setup"
      >
        <X size={24} className="group-hover:text-red-500 transition-colors" />
      </button>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 max-w-xs w-full">
            {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-primary shadow-sm' : 'bg-slate-200'}`} />
            ))}
        </div>

        <AnimatePresence mode="wait">
            
            {/* STEP 1: INTERESTS */}
            {step === 0 && (
                <MotionDiv 
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                >
                    <StepTitle title="What interests you?" desc="Pick the fields you're curious about. Select at least one." />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {INTERESTS.map(item => (
                            <MotionButton
                                key={item}
                                onClick={() => toggleSelection('interests', item)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ 
                                    backgroundColor: prefs.interests.includes(item) ? "rgba(37, 99, 235, 0.05)" : "rgba(255, 255, 255, 0.6)",
                                    borderColor: prefs.interests.includes(item) ? "rgba(37, 99, 235, 0.5)" : "rgba(226, 232, 240, 0.8)",
                                }}
                                transition={{ duration: 0.2 }}
                                className="p-6 rounded-2xl border text-left relative overflow-hidden group shadow-sm backdrop-blur-md"
                            >
                                <span className={`font-semibold text-lg relative z-10 ${prefs.interests.includes(item) ? 'text-primary' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                    {item}
                                </span>
                                {prefs.interests.includes(item) && (
                                    <MotionDiv layoutId="check" className="absolute top-4 right-4 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                        <Check size={12} strokeWidth={4} />
                                    </MotionDiv>
                                )}
                            </MotionButton>
                        ))}
                    </div>
                </MotionDiv>
            )}

            {/* STEP 2: CITIES */}
            {step === 1 && (
                <MotionDiv 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                >
                    <StepTitle title="Where do you want to work?" desc="We'll analyze Living Costs vs Salary (FEI) for these locations." />
                    
                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl mb-10">
                        {CITIES.map(city => (
                            <MotionButton
                                key={city}
                                onClick={() => toggleSelection('cities', city)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ 
                                    backgroundColor: prefs.cities.includes(city) ? "#EFF6FF" : "rgba(255, 255, 255, 0.5)",
                                    color: prefs.cities.includes(city) ? "#2563EB" : "#64748B",
                                }}
                                className={`px-6 py-3 rounded-full border border-slate-200 text-sm font-bold transition-all shadow-sm ${
                                    prefs.cities.includes(city) ? 'shadow-md border-primary' : 'hover:bg-white hover:text-slate-900'
                                }`}
                            >
                                {city}
                            </MotionButton>
                        ))}
                    </div>

                    <GlassCard className="w-full max-w-md p-6 border-slate-200">
                        <label className="text-xs text-slate-400 uppercase font-bold mb-4 block tracking-wider">Willingness to Migrate</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                            {['Low', 'Medium', 'High'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setPrefs({...prefs, migrationWillingness: opt as any})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                        prefs.migrationWillingness === opt
                                        ? 'bg-white text-primary shadow-sm border border-slate-200' 
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </MotionDiv>
            )}

            {/* STEP 3: SALARY */}
            {step === 2 && (
                <MotionDiv 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                >
                    <StepTitle title="Financial Goals" desc="Help us plan your growth path." />
                    
                    <GlassCard className="w-full max-w-lg space-y-10 p-10 border-slate-200">
                        <div>
                             <div className="flex justify-between mb-4">
                                <label className="text-slate-400 font-bold uppercase text-xs tracking-wider">Target Starting Salary</label>
                                <span className="text-primary font-bold text-lg font-display">₹{(prefs.salaryTarget/100000).toFixed(1)}L</span>
                             </div>
                             <input 
                                type="range" 
                                min="300000" max="5000000" step="100000"
                                value={prefs.salaryTarget}
                                onChange={(e) => setPrefs({...prefs, salaryTarget: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                             />
                        </div>

                        <div>
                             <div className="flex justify-between mb-4">
                                <label className="text-slate-400 font-bold uppercase text-xs tracking-wider">Goal in 2 Years</label>
                                <span className="text-secondary font-bold text-lg font-display">₹{(prefs.salaryGoal2Year/100000).toFixed(1)}L</span>
                             </div>
                             <input 
                                type="range" 
                                min="600000" max="8000000" step="100000"
                                value={prefs.salaryGoal2Year}
                                onChange={(e) => setPrefs({...prefs, salaryGoal2Year: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                             />
                        </div>

                        <div>
                            <label className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-4 block">Risk Tolerance</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Very Safe', 'Balanced', 'Aggressive'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setPrefs({...prefs, riskTolerance: opt as any})}
                                        className={`py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-all ${
                                            prefs.riskTolerance === opt
                                            ? 'border-primary bg-blue-50 text-primary shadow-sm' 
                                            : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center font-medium leading-relaxed">
                                {prefs.riskTolerance === 'Aggressive' ? 'Focus on high-growth startups & equity.' : 
                                 prefs.riskTolerance === 'Very Safe' ? 'Focus on MNCs and Government roles.' : 
                                 'A mix of stability and growth opportunities.'}
                            </p>
                        </div>
                    </GlassCard>
                </MotionDiv>
            )}

            {/* STEP 4: LEARNING & LANGUAGE */}
            {step === 3 && (
                <MotionDiv 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                >
                    <StepTitle title="How do you learn best?" desc="Customize your CoPilot's teaching style." />
                    
                    <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl mb-12">
                        {LEARNING_STYLES.map(style => (
                            <MotionButton
                                key={style}
                                onClick={() => toggleSelection('learningStyles', style)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ 
                                    backgroundColor: prefs.learningStyles.includes(style) ? "rgba(37, 99, 235, 0.05)" : "rgba(255, 255, 255, 0.6)",
                                    borderColor: prefs.learningStyles.includes(style) ? "rgba(37, 99, 235, 0.6)" : "rgba(226, 232, 240, 0.8)",
                                }}
                                className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all shadow-sm backdrop-blur-sm ${
                                    prefs.learningStyles.includes(style)
                                    ? 'text-primary' 
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {style}
                            </MotionButton>
                        ))}
                    </div>

                    <div className="w-full max-w-md text-center">
                        <h3 className="text-slate-400 font-bold mb-6 text-sm uppercase tracking-widest">Preferred CoPilot Language</h3>
                        <div className="grid grid-cols-3 gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                            {['English', 'Hindi', 'Hinglish'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setPrefs({...prefs, language: lang as any})}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${
                                        prefs.language === lang
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </MotionDiv>
            )}

            {/* STEP 5: SUMMARY */}
            {step === 4 && (
                <MotionDiv 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center w-full max-w-2xl"
                >
                     <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-blue-100 text-primary relative">
                        <Check size={48} strokeWidth={3} className="relative z-10" />
                     </div>
                     <h2 className="text-4xl font-display font-bold text-slate-900 mb-2">You're all set, {user?.name.split(' ')[0]}!</h2>
                     <p className="text-slate-500 mb-10 text-lg">We've configured your personal Career CoPilot.</p>

                     <GlassCard className="w-full p-8 space-y-5 mb-10 border-slate-200 bg-white">
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 font-medium">Focus Areas</span>
                            <span className="text-slate-900 font-bold text-right">{prefs.interests.join(', ') || 'General'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 font-medium">Target Cities</span>
                            <span className="text-slate-900 font-bold text-right">{prefs.cities.join(', ') || 'Anywhere'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-4">
                            <span className="text-slate-500 font-medium">Salary Goal</span>
                            <span className="text-primary font-bold text-right">₹{(prefs.salaryGoal2Year/100000).toFixed(1)}L / yr</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Learning Style</span>
                            <span className="text-slate-900 font-bold text-right">{prefs.learningStyles[0] || 'Adaptive'}</span>
                        </div>
                     </GlassCard>
                </MotionDiv>
            )}
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center w-full px-4 md:px-20">
            {step > 0 ? (
                <button 
                    onClick={prevStep}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium px-4 py-2"
                >
                    <ChevronLeft size={20} /> Back
                </button>
            ) : <div />}

            {step < 4 ? (
                <NeonButton 
                    onClick={nextStep}
                    className="px-8 py-3 rounded-xl"
                    disabled={step === 0 && prefs.interests.length === 0}
                >
                    Continue <ChevronRight size={20} />
                </NeonButton>
            ) : (
                 <NeonButton 
                    onClick={handleFinish}
                    className="px-10 py-4 rounded-xl text-lg shadow-lg"
                >
                    Launch CoPilot <ChevronRight size={20} />
                </NeonButton>
            )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;