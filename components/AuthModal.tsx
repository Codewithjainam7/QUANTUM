import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, User, ShieldCheck, GraduationCap } from 'lucide-react';
import { GlassCard, NeonButton } from './ui/Visuals';
import { supabase } from '../services/supabaseClient';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Google Logo Component
const GoogleLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'student' | 'admin'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    // We can't easily force metadata here for existing users, but new users might miss role.
                    // For the demo, we rely on the email/password toggle for explicit Admin creation.
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setErrorMsg(err.message || "Google Sign-In failed");
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role, // Save selected role to metadata
                        },
                    },
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <MotionDiv
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <GlassCard className="overflow-hidden border-white/60 shadow-2xl">
                        {/* Header */}
                        <div className="p-6 pb-0">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-bold text-slate-900">
                                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Role Toggle */}
                            <div className="bg-slate-100/80 p-1 rounded-xl flex mb-2 relative">
                                <button 
                                    onClick={() => setRole('student')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                                        role === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <GraduationCap size={16} /> Student
                                </button>
                                <button 
                                    onClick={() => setRole('admin')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${
                                        role === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <ShieldCheck size={16} /> Admin
                                </button>
                            </div>
                        </div>

                        {/* Login Form */}
                        <div className="p-8 pt-6">
                             {errorMsg && (
                                 <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 font-bold border border-red-100 flex items-start gap-2">
                                     <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                     {errorMsg}
                                 </div>
                             )}

                             <form onSubmit={handleAuth} className="space-y-4">
                                {isSignUp && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                                                required={isSignUp}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="alex@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={isSignUp ? "Create a strong password" : "••••••••"}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <NeonButton 
                                    disabled={loading}
                                    className="w-full mt-2"
                                >
                                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')} <ArrowRight size={18} />
                                </NeonButton>
                             </form>

                             <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#FFFFFF]/90 px-2 text-slate-400 font-bold tracking-wider">Or continue with</span>
                                </div>
                             </div>

                             {/* Google Login Button */}
                             <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3"
                             >
                                <GoogleLogo />
                                <span>Google</span>
                             </button>

                             <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                                 <p className="text-xs text-slate-500 font-medium">
                                     {isSignUp ? "Already have an account?" : "New user?"}{" "}
                                     <button 
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-primary font-bold hover:underline ml-1"
                                     >
                                         {isSignUp ? "Log In" : "Sign Up"}
                                     </button>
                                 </p>
                             </div>
                        </div>
                    </GlassCard>
                </MotionDiv>
            </MotionDiv>
        </AnimatePresence>
    );
};
