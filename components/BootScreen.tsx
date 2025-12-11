import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from './ui/Visuals';

export const BootScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Neural Core...");

  useEffect(() => {
    // Use requestAnimationFrame for smoother animations
    let animationFrameId: number;
    let startTime = Date.now();
    const duration = 2000; // 2 seconds total duration
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      // Update status text based on progress
      if (newProgress < 25) {
        setStatusText("Initializing Neural Core...");
      } else if (newProgress < 50) {
        setStatusText("Loading User Preferences...");
      } else if (newProgress < 75) {
        setStatusText("Connecting to Gemini 2.5...");
      } else if (newProgress < 95) {
        setStatusText("Calibrating Voice Agents...");
      } else {
        setStatusText("Finalizing Workspace...");
      }
      
      if (newProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F8FAFC] overflow-hidden font-display text-slate-900">
      <AuroraBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
         {/* App Title */}
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
         >
            <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-700 to-indigo-500 mb-4 font-display">
                QUANTUM
            </h1>
            <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase opacity-90">
                AI Career Architecture
            </p>
         </motion.div>

         {/* Dynamic Status Text */}
         <motion.div className="h-6 mb-4 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.p 
                    key={statusText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-slate-500 font-medium font-sans tracking-wide"
                >
                    {statusText}
                </motion.p>
            </AnimatePresence>
         </motion.div>

         {/* Optimized Progress Bar */}
         <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden relative">
             <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
             />
         </div>
      </div>
    </div>
  );
};