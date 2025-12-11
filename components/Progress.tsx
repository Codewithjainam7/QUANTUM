import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';
import { fetchProgressStats } from '../services/mockApi';

const Progress = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchProgressStats().then(setStats);
    }, []);

    const data = [
        { name: 'Week 1', score: 40 },
        { name: 'Week 2', score: 55 },
        { name: 'Week 3', score: 50 },
        { name: 'Week 4', score: 70 },
        { name: 'Week 5', score: 85 },
    ];

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">My Progress</h1>
                <p className="text-slate-500">Tracking your journey towards your target role.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card-3d p-6 rounded-[2rem]"
                >
                    <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100"><TrendingUp size={20} /></div>
                         <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">Projected Salary</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">₹{(stats?.projectedSalary / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100">+15% from start</p>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card-3d p-6 rounded-[2rem]"
                >
                    <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100"><Award size={20} /></div>
                         <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">Skills Mastered</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats?.skillsMastered || 0}</p>
                    <p className="text-xs text-slate-500 font-bold mt-3 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">Next: System Design</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card-3d p-6 rounded-[2rem]"
                >
                    <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-sm border border-purple-100"><CheckCircle size={20} /></div>
                         <h3 className="font-bold text-slate-600 text-sm uppercase tracking-wide">Action Items</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">8/12</p>
                    <p className="text-xs text-slate-500 font-bold mt-3 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">Completed this month</p>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card-3d p-8 rounded-[2rem]"
            >
                <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
                    Readiness Score Trend
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <defs>
                                <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.5)" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderColor: '#fff', color: '#1e293b', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#6366f1' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="url(#lineColor)" 
                                strokeWidth={4} 
                                dot={{r: 4, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2}} 
                                activeDot={{r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2}} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default Progress;