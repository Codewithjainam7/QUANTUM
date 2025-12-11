import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Volume2, User, Lock, Download, AlertTriangle, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';
import { GlassCard, NeonButton } from './ui/Visuals';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

const Settings = () => {
    const { user, profile } = useAuth();
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const executeExport = () => {
        try {
            if (!user) throw new Error("User session not found.");

            const csvRows = [
                ['Category', 'Key', 'Value'],
                ['Account', 'Name', user.name || 'N/A'],
                ['Account', 'Email', user.email || 'N/A'],
                ['Profile', 'Current Title', profile?.title || 'N/A'],
                ['Profile', 'Target Role', profile?.targetRole || 'N/A'],
                ['Profile', 'Location', profile?.location || 'N/A'],
                ['Profile', 'Skills', (profile?.skills || []).join('; ')],
                ['Profile', 'Experience', `${profile?.experienceYears || 0} Years`],
                ['Progress', 'Projected Salary', '2200000'], // Mocked from progress
                ['Progress', 'Skills Mastered', '4'],
            ];

            const csvContent = "data:text/csv;charset=utf-8," 
                + csvRows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `quantum_career_data_${user.name.split(' ')[0].toLowerCase()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setShowExportConfirm(false);
            showToast("Data exported successfully.", "success");
        } catch (error) {
            console.error("Export failed:", error);
            setShowExportConfirm(false);
            showToast("Failed to generate export file. Please try again.", "error");
        }
    };

    const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>, settingName: string) => {
        // Simulate saving preference
        showToast(`${settingName} updated to ${e.target.value}`, "success");
    };

    const handleDeleteAccount = () => {
        // Simulated error for safety/demo
        showToast("Action restricted: Please cancel active subscriptions first.", "error");
    };

  return (
    <div className="max-w-3xl relative mx-auto pb-20">
       {/* Toast Notification */}
       <AnimatePresence>
           {notification && (
               <MotionDiv
                   initial={{ opacity: 0, y: -20, x: '-50%' }}
                   animate={{ opacity: 1, y: 0, x: '-50%' }}
                   exit={{ opacity: 0, y: -20, x: '-50%' }}
                   className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-bold text-sm ${
                       notification.type === 'success' 
                       ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' 
                       : 'bg-red-50/90 border-red-200 text-red-700'
                   }`}
               >
                   {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                   {notification.message}
               </MotionDiv>
           )}
       </AnimatePresence>

       <div className="flex items-center gap-3 mb-8">
           <div className="p-3.5 bg-white rounded-2xl text-primary shadow-sm border border-slate-200">
               <SettingsIcon size={24} />
           </div>
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
               <p className="text-slate-500">Manage your preferences and account.</p>
           </div>
       </div>

       <div className="space-y-6">
           {/* Section 1 - Profile */}
           <GlassCard className="overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <User size={18} className="text-secondary" /> Profile Settings
                   </h3>
               </div>
               <div className="p-6 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Display Name</label>
                           <input type="text" value={user?.name} className="w-full mt-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-primary/50 shadow-sm cursor-not-allowed opacity-70" readOnly title="Contact support to change name" />
                       </div>
                       <div>
                           <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</label>
                           <input type="email" value={user?.email} className="w-full mt-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-primary/50 shadow-sm cursor-not-allowed opacity-70" readOnly title="Email cannot be changed" />
                       </div>
                   </div>
               </div>
           </GlassCard>

           {/* Section 2 - Voice */}
           <GlassCard className="overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <Volume2 size={18} className="text-accent" /> Voice & Audio
                   </h3>
               </div>
               <div className="p-6 space-y-6">
                   <div className="flex items-center justify-between">
                       <div>
                           <p className="text-slate-900 font-bold">CoPilot Voice</p>
                           <p className="text-xs text-slate-500 font-medium">Choose the persona for your AI counsellor.</p>
                       </div>
                       <select 
                           onChange={(e) => handlePreferenceChange(e, "Voice Persona")}
                           className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm cursor-pointer"
                       >
                           <option>Kore (Neutral)</option>
                           <option>Puck (Energetic)</option>
                           <option>Fenrir (Deep)</option>
                       </select>
                   </div>
                   <div className="flex items-center justify-between">
                       <div>
                           <p className="text-slate-900 font-bold">Input Language</p>
                           <p className="text-xs text-slate-500 font-medium">Primary language for voice recognition.</p>
                       </div>
                       <select 
                           onChange={(e) => handlePreferenceChange(e, "Input Language")}
                           className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm cursor-pointer"
                       >
                           <option>English (US)</option>
                           <option>English (IN)</option>
                           <option>Hindi</option>
                       </select>
                   </div>
               </div>
           </GlassCard>

           {/* Section 3 - Notifications */}
            <GlassCard className="overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <Bell size={18} className="text-emerald-500" /> Notifications
                   </h3>
               </div>
               <div className="p-6 space-y-4">
                   {['Job Alerts', 'Course Price Drops', 'Weekly Progress Report'].map(item => (
                       <div key={item} className="flex items-center justify-between group cursor-pointer" onClick={() => showToast(`${item} preference saved`, "success")}>
                           <span className="text-slate-600 font-medium group-hover:text-primary transition-colors">{item}</span>
                           <div className="w-10 h-6 bg-primary rounded-full relative shadow-sm transition-colors">
                               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                           </div>
                       </div>
                   ))}
               </div>
           </GlassCard>

           {/* Section 4 - Data Export */}
           <GlassCard className="overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <Download size={18} className="text-blue-500" /> Data & Privacy
                   </h3>
               </div>
               <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-900 font-bold">Export My Data</p>
                            <p className="text-xs text-slate-500 font-medium">Download all your career data in CSV format.</p>
                        </div>
                        <NeonButton onClick={() => setShowExportConfirm(true)} variant="secondary" className="px-4 py-2 text-xs">
                            <Download size={14} /> Export CSV
                        </NeonButton>
                    </div>
               </div>
           </GlassCard>

            {/* Section 5 - Danger Zone */}
           <GlassCard className="overflow-hidden border-red-200 bg-red-50/30">
               <div className="p-4 border-b border-red-100 bg-red-50">
                   <h3 className="font-bold text-red-600 flex items-center gap-2">
                       <AlertTriangle size={18} /> Danger Zone
                   </h3>
               </div>
               <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-900 font-bold">Delete Account</p>
                            <p className="text-xs text-slate-500 font-medium">Permanently remove all your data.</p>
                        </div>
                        <button 
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                            Delete Account
                        </button>
                    </div>
               </div>
           </GlassCard>
       </div>

       {/* Export Modal */}
       <AnimatePresence>
           {showExportConfirm && (
               <MotionDiv 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
               >
                   <GlassCard className="max-w-md w-full p-8 border-white/60">
                       <div className="text-center mb-6">
                           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary border border-blue-100 shadow-sm">
                               <FileText size={32} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Export?</h3>
                           <p className="text-slate-500 text-sm">We'll compile your profile, progress, and preferences into a CSV file.</p>
                       </div>
                       <div className="flex gap-4">
                           <button onClick={() => setShowExportConfirm(false)} className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold transition-colors shadow-sm">Cancel</button>
                           <NeonButton onClick={executeExport} className="flex-1">Download</NeonButton>
                       </div>
                   </GlassCard>
               </MotionDiv>
           )}
       </AnimatePresence>
    </div>
  );
};

export default Settings;