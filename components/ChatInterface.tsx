import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Mic, Volume2, StopCircle } from 'lucide-react';
import { AgentType, ChatMessage } from '../types';
import { generateAgentResponse } from '../services/geminiService';
import { useAuth } from '../App';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { GlassCard } from './ui/Visuals';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

const AGENTS = [
  { id: AgentType.CAREER_GUIDE, label: 'Career Guide', color: 'border-primary text-primary bg-blue-50' },
  { id: AgentType.RESUME_WIZARD, label: 'Resume Wizard', color: 'border-secondary text-secondary bg-sky-50' },
  { id: AgentType.INTERVIEW_COACH, label: 'Interview Coach', color: 'border-accent text-accent bg-indigo-50' },
  { id: AgentType.SALARY_NEGOTIATOR, label: 'Salary Negotiator', color: 'border-slate-400 text-slate-600 bg-slate-50' },
];

const INITIAL_MESSAGES: Record<AgentType, string> = {
    [AgentType.CAREER_GUIDE]: "Hello! I'm your Career Guide. How can I help you navigate your professional journey today?",
    [AgentType.RESUME_WIZARD]: "I'm the Resume Wizard. Paste your resume text here, and I'll analyze it for ATS optimization and impact.",
    [AgentType.INTERVIEW_COACH]: "Ready to practice? Tell me which role you are interviewing for, and I'll start a mock interview.",
    [AgentType.SALARY_NEGOTIATOR]: "Salary negotiation can be tricky. Tell me your current offer and role, and I'll help you counter."
};

const ChatInterface = () => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(AgentType.CAREER_GUIDE);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      content: INITIAL_MESSAGES[AgentType.CAREER_GUIDE],
      timestamp: Date.now(),
      agent: AgentType.CAREER_GUIDE
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, isSpeaking, transcript, startListening, stopListening, speak, supported } = useVoiceAssistant();

  useEffect(() => {
    if (transcript) {
        setInputValue(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAgentSwitch = (agent: AgentType) => {
      setSelectedAgent(agent);
      // Reset chat to clear context and show specific greeting
      setMessages([{
          id: Date.now().toString(),
          role: 'model',
          content: INITIAL_MESSAGES[agent],
          timestamp: Date.now(),
          agent: agent
      }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (isListening) stopListening();

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const responseText = await generateAgentResponse(newUserMsg.content, selectedAgent, history);

    const newAiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: Date.now(),
      agent: selectedAgent
    };

    setMessages(prev => [...prev, newAiMsg]);
    setIsTyping(false);
    
    if (isListening || transcript) {
        speak(responseText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-[2rem] glass-panel-premium overflow-hidden relative bg-white/60">
      {/* Header / Agent Selector */}
      <div className="p-4 border-b border-slate-200 bg-white/50 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentSwitch(agent.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                selectedAgent === agent.id 
                  ? `${agent.color} shadow-sm` 
                  : 'bg-transparent border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Bot size={14} />
              {agent.label}
            </button>
          ))}
        </div>
        {isSpeaking && (
            <div className="flex items-center gap-2 text-primary text-xs font-bold animate-pulse bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                <Volume2 size={14} /> Speaking...
            </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth relative">
        <AnimatePresence>
            {messages.map((msg) => (
            <MotionDiv
                key={msg.id}
                initial={{ opacity: 0, y: 15, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-white/50 ${
                    msg.role === 'user' ? 'bg-white text-slate-700' : 'bg-primary text-white shadow-neon'
                }`}>
                    {msg.role === 'user' ? <UserIcon size={18} /> : <Sparkles size={18} />}
                </div>
                
                <div className={`p-5 rounded-3xl shadow-sm border ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white border-primary shadow-md rounded-tr-none' 
                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                }`}>
                    {msg.agent && msg.role === 'model' && (
                    <div className="text-[10px] font-bold mb-2 opacity-60 uppercase tracking-widest text-primary">{msg.agent}</div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                    {msg.content}
                    </div>
                </div>
                </div>
            </MotionDiv>
            ))}
        </AnimatePresence>
        
        {isTyping && (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
             <div className="flex max-w-[70%] gap-4">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white shadow-neon">
                 <Bot size={18} />
               </div>
               <div className="p-4 rounded-3xl bg-white border border-slate-100 rounded-tl-none flex items-center gap-3 shadow-sm">
                 <Loader2 size={18} className="animate-spin text-primary" />
                 <span className="text-xs text-slate-500 font-bold tracking-wide">Processing...</span>
               </div>
             </div>
          </MotionDiv>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white/80 border-t border-slate-200 backdrop-blur-xl">
        <div className={`relative flex items-end gap-2 bg-white p-2 rounded-[1.5rem] border transition-all duration-300 ${isListening ? 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-slate-200 focus-within:border-primary/50 focus-within:shadow-md'}`}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : `Ask ${selectedAgent}...`}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm p-3.5 max-h-32 min-h-[52px] resize-none outline-none overflow-y-auto font-medium"
            rows={1}
          />
          {supported && (
              <button 
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-xl transition-all ${
                    isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Voice Input"
              >
                {isListening ? <StopCircle size={22} /> : <Mic size={22} />}
              </button>
          )}
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              inputValue.trim() && !isTyping
                ? 'bg-primary text-white hover:bg-blue-700 shadow-md' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;