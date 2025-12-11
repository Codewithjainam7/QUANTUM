import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UploadCloud, FileText, X, Play, Settings2, 
    CheckCircle, AlertTriangle, Shield, User, 
    Users, Brain, Gavel, FileCheck, FileX, Loader2, Sparkles, AlertCircle, Download 
} from 'lucide-react';
import { GlassCard, NeonButton } from './ui/Visuals';
import { Candidate, ScannerCriteria } from '../types';
import { analyzeCandidateResume } from '../services/geminiService';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

interface AdminResumeScannerProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_ROLES = ["Frontend Developer", "Backend Developer", "Data Scientist", "Product Manager", "DevOps Engineer", "Full Stack Engineer"];

export const AdminResumeScanner: React.FC<AdminResumeScannerProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [criteria, setCriteria] = useState<ScannerCriteria>({
        role: 'Frontend Developer',
        minExp: 2,
        maxExp: 10,
        customPrompt: '',
        filterDuplicates: true,
        filterBias: true
    });

    // Processing State
    const [processedCount, setProcessedCount] = useState(0);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [logs, setLogs] = useState<{agent: string, message: string, color: string}[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const processingRef = useRef(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setFiles([]);
            setIsDragging(false);
            setProcessedCount(0);
            setCandidates([]);
            setLogs([]);
            setNotification(null);
            processingRef.current = false;
        }
    }, [isOpen]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleFilesAdded = (addedFiles: FileList | null) => {
        if (!addedFiles) return;
        
        let validFiles: File[] = [];
        let invalidCount = 0;
        
        Array.from(addedFiles).forEach(file => {
            const isValid = file.type === 'application/pdf' || 
                            file.type === 'application/msword' || 
                            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            /\.(pdf|doc|docx)$/i.test(file.name);
            
            if (isValid) {
                validFiles.push(file);
            } else {
                invalidCount++;
            }
        });

        if (invalidCount > 0) {
            showNotification(`Skipped ${invalidCount} invalid file(s). Only PDF/DOCX allowed.`, 'error');
        }

        if (validFiles.length > 0) {
             setFiles(prev => [...prev, ...validFiles]);
             showNotification(`${validFiles.length} file(s) added to queue.`, 'success');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFilesAdded(e.target.files);
        e.target.value = ''; // Reset input
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesAdded(e.dataTransfer.files);
    };

    // --- Helper: Read File as Base64 ---
    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the Data URL prefix to send just base64 to Gemini
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // --- Helper: Download CSV Report ---
    const handleDownloadReport = () => {
        if (candidates.length === 0) return;

        const headers = ['Candidate ID', 'Name', 'Current Role', 'Experience (Yrs)', 'Match Score', 'Status', 'Flags', 'Screener Note', 'Bias Check', 'Tech Skills', 'Referee Verdict'];
        const rows = candidates.map(c => [
            c.id,
            `"${c.name}"`,
            `"${c.role}"`,
            c.experience,
            c.matchScore,
            c.status,
            `"${c.flags.join(', ')}"`,
            `"${c.agentNotes.screener?.replace(/"/g, '""')}"`,
            `"${c.agentNotes.biasCheck?.replace(/"/g, '""')}"`,
            `"${c.agentNotes.tech?.replace(/"/g, '""')}"`,
            `"${c.agentNotes.referee?.replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `quantum_resume_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification("Report downloaded successfully.", "success");
    };

    // --- REAL PROCESSING LOGIC (PARALLELIZED) ---
    const processSingleFile = async (file: File) => {
        if (!processingRef.current) return;

        try {
            // Log start
            setLogs(prev => [...prev, { agent: "System", message: `Processing ${file.name}...`, color: "text-slate-400" }]);

            // 1. Read File
            const base64Data = await readFileAsBase64(file);
            
            // 2. Send to Gemini
            const result = await analyzeCandidateResume(base64Data, file.type, criteria);
            
            // 3. Update Candidates State
            setCandidates(prev => [result, ...prev]);
            setProcessedCount(prev => prev + 1);

            // 4. Update Logs
            const newLogs = [];
            
            // Structure Agent
            if (result.agentNotes.screener) {
                newLogs.push({ agent: "Structure", message: result.agentNotes.screener.substring(0, 50) + "...", color: "text-blue-500" });
            }
            
            // Verdict
            const verdictIcon = result.status === 'passed' ? "✅" : "❌";
            newLogs.push({ 
                agent: "REFEREE", 
                message: `${verdictIcon} ${result.name}: ${result.status.toUpperCase()} (${result.matchScore}%)`, 
                color: result.status === 'passed' ? "text-emerald-600 font-bold" : "text-red-500 font-bold" 
            });

            setLogs(prev => [...prev.slice(-8), ...newLogs]); // Keep UI fast by limiting log history

        } catch (err) {
            console.error(`Error processing ${file.name}`, err);
            setLogs(prev => [...prev, { agent: "Error", message: `Failed: ${file.name}`, color: "text-red-500" }]);
            setProcessedCount(prev => prev + 1); // Increment count even on error to unblock
        }
    };

    const startProcessing = async () => {
        if (files.length === 0) return;
        setStep('processing');
        processingRef.current = true;
        setProcessedCount(0);
        setCandidates([]);
        setLogs([]);

        // Batch processing to respect rate limits but maximize speed
        // Batch size of 5 allows concurrent processing
        const BATCH_SIZE = 5;
        
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            if (!processingRef.current) break;
            
            const batch = files.slice(i, i + BATCH_SIZE);
            // Process batch in parallel
            await Promise.all(batch.map(file => processSingleFile(file)));
        }

        // Slight delay before showing results to ensure animations finish
        if (processingRef.current) {
            setTimeout(() => setStep('results'), 800);
        }
    };

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Portal content
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    key="scanner-modal"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                >
                    <MotionDiv 
                        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-7xl h-full max-h-[90vh] bg-[#F8FAFC] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/50"
                    >
                        {/* Notification Toast */}
                        <AnimatePresence>
                            {notification && (
                                <MotionDiv
                                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                                    className={`absolute top-6 left-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-bold text-sm ${
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

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-200 bg-white/60 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-900">Resume Neural Scanner</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Multi-Agent Consensus Engine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {step === 'results' && (
                                    <NeonButton onClick={handleDownloadReport} variant="secondary" className="!py-2 !px-4 !text-xs !rounded-lg">
                                        <Download size={16} /> Export Report
                                    </NeonButton>
                                )}
                                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* --- STEP 1: UPLOAD & CONFIG --- */}
                        {step === 'upload' && (
                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">
                                {/* Left: Upload */}
                                <div className="space-y-6">
                                    <div 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-4 border-dashed rounded-[2rem] h-64 md:h-80 flex flex-col items-center justify-center transition-all group cursor-pointer relative overflow-hidden ${
                                            isDragging 
                                            ? 'bg-blue-50 border-blue-400 scale-[1.02]' 
                                            : 'border-slate-200 bg-white/50 hover:bg-blue-50 hover:border-blue-300'
                                        }`}
                                    >
                                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                                        <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm transition-transform ${isDragging ? 'scale-110 text-blue-500' : 'text-slate-400 group-hover:scale-110'}`}>
                                            <UploadCloud size={32} />
                                        </div>
                                        <h3 className={`text-xl font-bold ${isDragging ? 'text-blue-600' : 'text-slate-700'}`}>
                                            {isDragging ? 'Drop Files Here' : 'Drag & Drop Resumes'}
                                        </h3>
                                        <p className="text-slate-500 mt-2 font-medium">or click to browse (PDF, DOCX)</p>
                                        {files.length > 0 && (
                                            <div className="mt-6 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold flex items-center gap-2">
                                                <CheckCircle size={16} /> {files.length} Files Queued
                                            </div>
                                        )}
                                    </div>
                                    {files.length > 0 && (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Queue</p>
                                            {files.map((f, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                                                    <span className="truncate max-w-[80%] text-slate-700">{f.name}</span>
                                                    <span className="text-slate-400 text-xs">{(f.size/1024).toFixed(0)}kb</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Config */}
                                <div className="space-y-6 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings2 size={20} className="text-slate-400" />
                                        <h3 className="text-lg font-bold text-slate-900">Scanning Parameters</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-sm flex-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Role</label>
                                                <input 
                                                    type="text"
                                                    value={criteria.role}
                                                    onChange={(e) => setCriteria({...criteria, role: e.target.value})}
                                                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                                                    list="roles"
                                                />
                                                <datalist id="roles">
                                                    {MOCK_ROLES.map(r => <option key={r} value={r} />)}
                                                </datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Exp Range (Yrs)</label>
                                                <div className="flex gap-2 mt-1">
                                                    <input 
                                                        type="number" 
                                                        value={criteria.minExp} 
                                                        onChange={e => setCriteria({...criteria, minExp: +e.target.value})} 
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center" 
                                                    />
                                                    <span className="self-center text-slate-400 font-bold">-</span>
                                                    <input 
                                                        type="number" 
                                                        value={criteria.maxExp} 
                                                        onChange={e => setCriteria({...criteria, maxExp: +e.target.value})} 
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Custom Agent Prompt</label>
                                            <textarea 
                                                value={criteria.customPrompt}
                                                onChange={(e) => setCriteria({...criteria, customPrompt: e.target.value})}
                                                placeholder="e.g. Look for candidates who have led teams of 5+ or contributed to Open Source..."
                                                className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${criteria.filterDuplicates ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${criteria.filterDuplicates ? 'translate-x-4' : ''}`} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Filter Duplicates</span>
                                                <input type="checkbox" className="hidden" checked={criteria.filterDuplicates} onChange={() => setCriteria({...criteria, filterDuplicates: !criteria.filterDuplicates})} />
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${criteria.filterBias ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${criteria.filterBias ? 'translate-x-4' : ''}`} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Anti-Bias Filter</span>
                                                <input type="checkbox" className="hidden" checked={criteria.filterBias} onChange={() => setCriteria({...criteria, filterBias: !criteria.filterBias})} />
                                            </label>
                                        </div>
                                    </div>

                                    <NeonButton 
                                        onClick={startProcessing}
                                        disabled={files.length === 0}
                                        className="w-full py-4 text-lg rounded-2xl shadow-xl shadow-indigo-500/20"
                                    >
                                        <Sparkles size={20} /> Initialize Agents ({files.length})
                                    </NeonButton>
                                </div>
                            </div>
                        )}

                        {/* --- STEP 2: PROCESSING (THE TWIST) --- */}
                        {step === 'processing' && (
                            <div className="flex-1 flex flex-col items-center p-8 relative overflow-y-auto custom-scrollbar">
                                 {/* Background Animation */}
                                 <div className="absolute inset-0 z-0 pointer-events-none">
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
                                 </div>

                                 <div className="w-full flex flex-col items-center min-h-min py-8">
                                    {/* Neural Grid */}
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-32 mt-8">
                                        {/* Agent 1 */}
                                        <AgentCard 
                                            name="Structure Analyst" 
                                            icon={FileText} 
                                            color="text-blue-500" 
                                            bg="bg-blue-50" 
                                            status="Parallel Scanning..." 
                                        />
                                        {/* Agent 2 */}
                                        <AgentCard 
                                            name="Fairness Watchdog" 
                                            icon={Shield} 
                                            color="text-pink-500" 
                                            bg="bg-pink-50" 
                                            status={criteria.filterBias ? "Checking Bias..." : "Idle"} 
                                        />
                                        {/* Agent 3 */}
                                        <AgentCard 
                                            name="Skill Scout" 
                                            icon={Brain} 
                                            color="text-emerald-500" 
                                            bg="bg-emerald-50" 
                                            status="Extracting Skills..." 
                                        />
                                    </div>
                                    
                                    {/* Referee & Progress */}
                                    <div className="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 shadow-2xl text-center mb-10">
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl -mt-16 border-4 border-[#F8FAFC]">
                                            <Gavel size={32} />
                                        </div>
                                        <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">High-Speed Processing</h3>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                                            <motion.div 
                                                className="h-full bg-indigo-600"
                                                animate={{ width: `${(processedCount / files.length) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 mb-4">
                                            Analyzed {processedCount} of {files.length} candidates
                                        </p>
                                        
                                        {/* Live Terminal */}
                                        <div className="h-40 bg-slate-900 rounded-xl p-4 text-left overflow-hidden relative font-mono text-xs">
                                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />
                                            <div className="space-y-2">
                                                {logs.map((log, i) => (
                                                    <motion.div 
                                                        key={i} 
                                                        initial={{ opacity: 0, x: -10 }} 
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`flex gap-2 ${log.color}`}
                                                    >
                                                        <span className="opacity-50">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                                        <span className="font-bold">[{log.agent}]:</span>
                                                        <span className="text-slate-300">{log.message}</span>
                                                    </motion.div>
                                                ))}
                                                <div ref={logsEndRef} />
                                            </div>
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        )}

                        {/* --- STEP 3: RESULTS --- */}
                        {step === 'results' && (
                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* Passed Column */}
                                <div className="flex-1 bg-emerald-50/30 p-6 flex flex-col border-r border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><FileCheck size={20} /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Passed</h3>
                                        </div>
                                        <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm">
                                            {candidates.filter(c => c.status === 'passed').length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {candidates.filter(c => c.status === 'passed').map(c => (
                                            <ResultCard key={c.id} candidate={c} />
                                        ))}
                                    </div>
                                </div>

                                {/* Failed Column */}
                                <div className="flex-1 bg-red-50/30 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 text-red-700 rounded-lg"><FileX size={20} /></div>
                                            <h3 className="text-xl font-bold text-slate-900">Failed / Flagged</h3>
                                        </div>
                                        <span className="text-red-700 font-bold bg-red-100 px-3 py-1 rounded-full text-sm">
                                            {candidates.filter(c => c.status === 'failed').length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {candidates.filter(c => c.status === 'failed').map(c => (
                                            <ResultCard key={c.id} candidate={c} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>,
        document.body
    );
};

const AgentCard = ({ name, icon: Icon, color, bg, status }: any) => (
    <GlassCard className="p-6 flex items-center gap-4 relative overflow-hidden">
        <div className={`p-4 rounded-full ${bg} ${color} shadow-sm relative z-10`}>
            <Icon size={24} />
        </div>
        <div className="relative z-10">
            <h4 className="font-bold text-slate-900">{name}</h4>
            <p className={`text-xs font-bold uppercase tracking-wider ${status === 'Idle' ? 'text-slate-400' : 'text-indigo-600 animate-pulse'}`}>
                {status}
            </p>
        </div>
    </GlassCard>
);

const ResultCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h4 className="font-bold text-slate-900">{candidate.name}</h4>
                <p className="text-xs text-slate-500">{candidate.role} • {candidate.experience}y Exp</p>
            </div>
            <div className={`text-sm font-bold ${candidate.matchScore > 80 ? 'text-emerald-600' : 'text-slate-600'}`}>
                {candidate.matchScore}%
            </div>
        </div>
        
        {/* Flags */}
        {candidate.flags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
                {candidate.flags.map((flag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-100 flex items-center gap-1">
                        <AlertTriangle size={10} /> {flag}
                    </span>
                ))}
            </div>
        )}
        
        {/* Referee Note */}
        {candidate.status === 'passed' && (
            <div className="mt-2 text-[10px] text-slate-400 font-medium">
                Referee: "Strong context match."
            </div>
        )}
    </div>
);
