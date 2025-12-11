import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Users, Mic, Award, ArrowLeft, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuroraBackground, GlassCard } from './ui/Visuals';

interface LightLayoutProps {
    children?: React.ReactNode;
    title: string;
    subtitle: string;
}

const LightLayout = ({ children, title, subtitle }: LightLayoutProps) => (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden relative">
        <AuroraBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
            {/* Header */}
            <div className="text-center space-y-6 mb-20">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft size={16} /> Back to Mission Control
                </Link>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 drop-shadow-sm"
                >
                    {title}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-slate-500 max-w-2xl mx-auto font-light"
                >
                    {subtitle}
                </motion.p>
            </div>

            {children}
        </div>
    </div>
);

export const Features = () => {
    return (
        <LightLayout title="CORE SYSTEMS" subtitle="Advanced neural modules designed to accelerate your career trajectory.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Voice Neural Core", desc: "Real-time, low-latency voice interaction with specialized AI agents.", icon: Mic },
                    { title: "Resume Parser", desc: "Extract skills and optimize ATS compatibility instantly.", icon: Shield },
                    { title: "ROI Calculator", desc: "Deep analysis of course value and fraud detection.", icon: Award },
                    { title: "Market Benchmarking", desc: "Real-time salary data streams vs living costs.", icon: Zap },
                    { title: "Simulated Interview", desc: "Adaptive difficulty interviews with behavioral analysis.", icon: Users },
                    { title: "Migration Index", desc: "Geographic arbitrage engine for living costs.", icon: Check }
                ].map((f, i) => (
                    <GlassCard 
                        key={i}
                        className="p-8 group hover:border-primary/50 transition-colors bg-white/70"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform border border-blue-100 shadow-sm">
                            <f.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                    </GlassCard>
                ))}
            </div>
        </LightLayout>
    );
};

export const Pricing = () => {
    return (
        <LightLayout title="ACCESS TIERS" subtitle="Invest in your future infrastructure. Scalable plans for every stage.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {[
                    { name: "Scout", price: "Free", feats: ["Basic Chat", "Resume Scan", "1 Interview/mo"] },
                    { name: "Navigator", price: "$9/mo", feats: ["Unlimited Voice", "Advanced ROI", "Full Simulations"], popular: true },
                    { name: "Commander", price: "$29/mo", feats: ["Admin Dashboard", "Team Analytics", "API Access"] }
                ].map((p, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className={`glass-panel-premium p-8 rounded-[2.5rem] relative flex flex-col h-full bg-white/80 ${
                            p.popular 
                            ? 'border-primary shadow-xl scale-105 z-10' 
                            : 'border-slate-200 hover:border-primary/30'
                        }`}
                    >
                        {p.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{p.name}</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight font-display">{p.price}</div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {p.feats.map(f => (
                                <li key={f} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                                    <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 border border-emerald-200">
                                        <Check size={12} />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md ${
                            p.popular 
                            ? 'bg-primary text-white hover:bg-blue-700' 
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}>
                            Select {p.name}
                        </button>
                    </motion.div>
                ))}
            </div>
        </LightLayout>
    );
};

export const HowItWorks = () => {
    return (
        <LightLayout title="PROTOCOL" subtitle="From confusion to clarity. The sequence for upgrading your career.">
            <div className="space-y-12 relative max-w-4xl mx-auto">
                <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent hidden md:block"></div>
                {[
                    { step: 1, title: "Initialize Profile", desc: "Input your goals, salary expectations, and risk tolerance matrix." },
                    { step: 2, title: "Scan & Analyze", desc: "Upload your resume. Our agents scan for skill gaps and market anomalies." },
                    { step: 3, title: "Navigate & Execute", desc: "Use voice commands to practice interviews, check course ROI, and deploy applications." }
                ].map((s, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="flex gap-6 md:gap-10"
                    >
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border border-blue-200 shadow-lg flex items-center justify-center font-bold text-xl text-primary relative z-10 font-display">
                            {s.step}
                        </div>
                        <GlassCard className="p-8 flex-1 hover:border-primary/30 transition-colors bg-white/70">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{s.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{s.desc}</p>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </LightLayout>
    );
};