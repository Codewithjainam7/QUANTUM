import React, { useState } from 'react';
import { useAuth } from '../App';
import { Save, UserCircle, UploadCloud, FileText, CheckCircle, X, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseResumeWithGemini } from '../services/geminiService';

// Fix for framer-motion type issues
const MotionForm = motion.form as any;

const ProfileBuilder = () => {
  const { profile, updateProfile, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: profile?.title || '',
    targetRole: profile?.targetRole || '',
    skills: profile?.skills.join(', ') || '',
    location: profile?.location || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploading(true);
          setResumeName(file.name);

          try {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async () => {
                  const base64String = (reader.result as string).split(',')[1];
                  const mimeType = file.type;
                  
                  const extractedData = await parseResumeWithGemini(base64String, mimeType);
                  
                  if (extractedData) {
                      setFormData(prev => ({
                          ...prev,
                          title: extractedData.currentTitle || prev.title,
                          targetRole: extractedData.targetRole || prev.targetRole,
                          skills: extractedData.skills || prev.skills,
                          location: extractedData.location || prev.location
                      }));
                  }
                  setUploading(false);
              };
              reader.onerror = (error) => {
                  console.error("Error reading file:", error);
                  setUploading(false);
              };
          } catch (error) {
              console.error("Upload failed:", error);
              setUploading(false);
          }
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...profile!,
      title: formData.title,
      targetRole: formData.targetRole,
      skills: formData.skills.split(',').map(s => s.trim()),
      location: formData.location
    });
    alert("Profile saved!");
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar / Resume Section */}
      <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/50 text-center shadow-glass">
             <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white mb-4 shadow-md bg-slate-100 flex items-center justify-center">
                {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User size={48} className="text-slate-300" />
                )}
             </div>
             <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
             <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 border-dashed">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <FileText size={18} className="text-primary" /> Resume Parser
              </h3>
              <p className="text-xs text-slate-500 mb-4">Upload your CV to auto-fill skills and get a personalized analysis.</p>
              
              {!resumeName ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-white rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 size={24} className="text-primary animate-spin mb-2" />
                            <span className="text-xs text-slate-500 font-medium">Analyzing...</span>
                        </div>
                    ) : (
                        <>
                            <UploadCloud size={32} className="text-slate-400 mb-2" />
                            <span className="text-xs text-slate-500 font-medium">Click to upload PDF</span>
                        </>
                    )}
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} />
                  </label>
              ) : (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{resumeName}</p>
                          <p className="text-xs text-emerald-600">{uploading ? 'Processing...' : 'Parsed Successfully'}</p>
                      </div>
                      <button onClick={() => setResumeName(null)} className="text-slate-400 hover:text-slate-700" disabled={uploading}>
                        <X size={16} />
                      </button>
                  </div>
              )}
          </div>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-2">
        <MotionForm 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-6 bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-white/50 shadow-glass"
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-900">Career Details</h2>
                <span className="text-xs text-slate-500 font-medium">* Required</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider text-[10px]">Current Job Title</label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider text-[10px]">Target Role</label>
                <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                />
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider text-[10px]">Target Location</label>
            <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
            />
            </div>

            <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider text-[10px]">Skills (comma separated)</label>
            <div className="relative">
                <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, Leadership"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                />
                {resumeName && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded">
                        Auto-filled
                    </span>
                )}
            </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
            <button type="button" className="px-6 py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors">Cancel</button>
            <button 
                type="submit" 
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
                <Save size={18} />
                Save Profile
            </button>
            </div>
        </MotionForm>
      </div>
    </div>
  );
};

export default ProfileBuilder;