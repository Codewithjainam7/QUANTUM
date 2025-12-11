import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X, Rocket, Shield, Globe, Activity, Brain, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuroraBackground, NeonButton, GlassCard, CareerBackground } from './ui/Visuals';
import { AuthModal } from './AuthModal';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
const MotionP = motion.p as any;

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden font-sans selection:bg-blue-200">
      <AuroraBackground />
      <CareerBackground />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass-panel-premium rounded-2xl px-8 py-5 bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="font-display font-bold text-2xl tracking-tight text-slate-900">Quantum</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                {['Solutions', 'Pricing', 'About'].map((item) => (
                    <Link key={item} to={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors relative group">
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
                <NeonButton onClick={() => setShowAuthModal(true)} variant="secondary">Log In</NeonButton>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-900">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <MotionDiv 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden absolute top-24 left-4 right-4 glass-panel-premium rounded-2xl p-6 shadow-2xl flex flex-col gap-4 z-50 bg-white/95 backdrop-blur-xl border border-white/20"
            >
                <Link to="/features" className="text-slate-600 font-medium p-2">Solutions</Link>
                <Link to="/pricing" className="text-slate-600 font-medium p-2">Pricing</Link>
                <Link to="/how-it-works" className="text-slate-600 font-medium p-2">About</Link>
                <div className="h-px bg-slate-200 w-full" />
                <NeonButton onClick={() => setShowAuthModal(true)} className="w-full">Log In</NeonButton>
            </MotionDiv>
        )}
      </nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 flex flex-col items-center pt-32 pb-20 text-center perspective-1000">
        
        {/* Decorative Static Elements */}
        <div className="absolute top-1/3 left-[10%] w-24 h-24 hidden lg:flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-lg rotate-12 z-0">
             <Rocket size={40} className="text-primary drop-shadow-sm" />
        </div>
        <div className="absolute bottom-1/4 right-[10%] w-32 h-32 hidden lg:flex items-center justify-center bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-lg -rotate-6 z-20">
             <Globe size={50} className="text-secondary drop-shadow-sm" />
        </div>
        <div className="absolute top-40 right-[20%] w-16 h-16 hidden lg:flex items-center justify-center bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-lg rotate-45 z-0">
             <Shield size={24} className="text-accent" />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 px-4 mt-12">
            <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center gap-3 mb-6"
            >
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-primary" />
                <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase drop-shadow-sm">Precision. Speed. Intelligence.</span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-primary" />
            </MotionDiv>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter leading-none text-slate-900">
                <MotionDiv
                    initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1.2, delay: 0.1 }}
                >
                    CAREER
                </MotionDiv>
                
                <MotionDiv 
                    initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1.2, delay: 0.3 }}
                >
                    <MotionSpan
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-[length:200%_auto]"
                    >
                        COPILOT
                    </MotionSpan>
                </MotionDiv>
            </h1>

            <MotionP 
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1.2, delay: 0.5 }}
                className="text-xl md:text-2xl text-slate-500 font-light tracking-wide max-w-3xl mx-auto"
            >
                Stop Guessing. <span className="text-primary font-medium">Start Scaling.</span>
            </MotionP>
            
            <MotionDiv 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.7 }}
                className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16"
            >
                <NeonButton onClick={() => setShowAuthModal(true)} className="px-10 py-5 text-lg rounded-2xl shadow-xl shadow-blue-500/20">
                    Build My Growth Engine <ArrowRight size={20} />
                </NeonButton>
                
                <Link to="/features" className="text-slate-500 hover:text-primary font-medium text-sm tracking-widest uppercase border-b border-transparent hover:border-primary transition-all pb-1">
                    See Solutions
                </Link>
            </MotionDiv>
        </div>

        {/* Intelligence Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-6 relative z-10">
            {[
                { title: "Neural Voice Core", desc: "Low-latency audio processing for human-like interview simulations.", icon: Activity, color: "text-secondary" },
                { title: "Predictive Engine", desc: "Real-time analysis of 50M+ job data points for salary benchmarking.", icon: Globe, color: "text-primary" },
                { title: "Strategic Mapping", desc: "Graph-based algorithms to find the shortest path to your target role.", icon: Brain, color: "text-accent" }
            ].map((feature, i) => (
                <MotionDiv
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, type: "spring", stiffness: 50 }}
                >
                    <GlassCard className="p-8 h-full flex flex-col items-center text-center hover:border-primary/30 transition-colors group bg-white/80">
                        <div className={`w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                            <feature.icon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                        <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                    </GlassCard>
                </MotionDiv>
            ))}
        </div>

        {/* About Us Section */}
        <div className="mt-40 w-full max-w-7xl mx-auto px-6 relative z-10">
            <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-blue-50/50 blur-[100px] -z-10"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <MotionDiv 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Mission & Vision
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                            The Operating System for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">Your Career Growth</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-6">
                            The modern career landscape is chaotic. Generic advice doesn't work, and executive coaching is inaccessible to most. We are building the bridge between where you are and where you deserve to be.
                        </p>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            By combining <span className="text-primary font-medium">real-time labor market data</span> with <span className="text-primary font-medium">generative AI</span>, Quantum provides the strategic foresight previously available only to C-suite executives.
                        </p>

                        <div className="flex flex-wrap gap-8">
                            <div>
                                <h4 className="text-3xl font-display font-bold text-slate-900">10x</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Faster Progression</p>
                            </div>
                            <div className="w-px bg-slate-200 h-12"></div>
                            <div>
                                <h4 className="text-3xl font-display font-bold text-slate-900">24/7</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">AI Availability</p>
                            </div>
                        </div>
                    </MotionDiv>

                    <MotionDiv 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <GlassCard className="p-1 border-white/60 bg-white/50">
                            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[1.8rem] space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                                
                                <div className="relative z-10 flex gap-5">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">The Problem</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Professionals are flying blind. Salary data is opaque, skills become obsolete overnight, and "networking" feels transactional.
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                                <div className="relative z-10 flex gap-5">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-sm">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Our Solution</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            A dynamic navigation system. We analyze millions of data points to map the most efficient path to your income and role goals, updating in real-time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </MotionDiv>
                </div>
            </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 w-full border-y border-white/50 bg-white/30 backdrop-blur-sm py-16">
            <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24">
                {[
                    { label: "Active Simulations", value: "10k+" },
                    { label: "Career Data Points", value: "50M+" },
                    { label: "Placement Rate", value: "94%" }
                ].map((stat, i) => (
                    <MotionDiv 
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className="text-center"
                    >
                        <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">{stat.value}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </MotionDiv>
                ))}
            </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#F8FAFC] to-transparent z-20 pointer-events-none" />
      </main>

    </div>
  );
};

export default Landing;
