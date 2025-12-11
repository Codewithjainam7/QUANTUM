import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, PhoneOff, Activity, Disc, Settings2, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getLiveClient } from '../services/geminiService';

// Fix for framer-motion type issues
const MotionDiv = motion.div as any;

const ELEVEN_LABS_KEY = "sk_7f594a6cee71755bc9550696841d94bdbc6718a6f5d22ed7";

// Voice Configuration
const VOICES = [
  { id: 'Kore', label: 'Kore (Neutral)', type: 'Gemini' },
  { id: 'Puck', label: 'Puck (Energetic)', type: 'Gemini' },
  { id: 'Fenrir', label: 'Fenrir (Deep)', type: 'Gemini' },
  { id: 'Charon', label: 'Charon (Firm)', type: 'Gemini' },
  { id: 'Zephyr', label: 'Zephyr (Calm)', type: 'Gemini' },
  { id: 'bIHbv24MWmeRgasZH58o', label: 'EL - Fin (ElevenLabs)', type: 'ElevenLabs' },
  { id: 'nPczCjzI2devNBz1zQrb', label: 'EL - Adam (ElevenLabs)', type: 'ElevenLabs' },
];

// Audio Helpers from Documentation
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const createBlob = (data: Float32Array): { data: string, mimeType: string } => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const LiveInterview = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  
  // Refs for Audio Contexts and Stream
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Refs for ElevenLabs
  const currentTranscriptRef = useRef<string>("");

  const playElevenLabsAudio = async (text: string, voiceId: string) => {
    if (!text.trim() || !outputAudioContextRef.current) return;
    
    setIsGeneratingTTS(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.7 }
        }),
      });

      if (!response.ok) throw new Error("ElevenLabs API Error");

      const arrayBuffer = await response.arrayBuffer();
      const ctx = outputAudioContextRef.current;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsGeneratingTTS(false);
      source.start();
      
    } catch (err) {
      console.error("ElevenLabs TTS Error:", err);
      setIsGeneratingTTS(false);
    }
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setErrorMessage('');
      const ai = getLiveClient();

      const isElevenLabs = VOICES.find(v => v.id === selectedVoice)?.type === 'ElevenLabs';

      // Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // If using Gemini voice, connect through a gain node. If EL, we play directly to destination in playElevenLabsAudio
      if (!isElevenLabs) {
          const outputNode = outputAudioContextRef.current!.createGain();
          outputNode.connect(outputAudioContextRef.current!.destination);
      }

      // Check for media device support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support audio input.");
      }

      // Get Mic Stream
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message.includes('Permission denied')) {
            throw new Error("Microphone permission denied. Please allow microphone access in your browser settings.");
        }
        throw err;
      }
      streamRef.current = stream;

      // Reset transcript buffer
      currentTranscriptRef.current = "";

      // Connect to Gemini Live
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Session Opened');
            setStatus('connected');
            setIsActive(true);

            // Audio Processing Setup
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
               const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
               // Calculate volume for UI
               let sum = 0;
               for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
               setVolume(Math.sqrt(sum / inputData.length) * 100);

               const pcmBlob = createBlob(inputData);
               
               sessionPromiseRef.current?.then((session: any) => {
                  session.sendRealtimeInput({ media: pcmBlob });
               });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle ElevenLabs Logic: Ignore Gemini Audio, Capture Text, Generate EL Audio
             if (isElevenLabs) {
                 if (message.serverContent?.outputTranscription) {
                     currentTranscriptRef.current += message.serverContent.outputTranscription.text;
                 }

                 if (message.serverContent?.turnComplete) {
                     const fullText = currentTranscriptRef.current;
                     console.log("Turn complete. Generating audio for:", fullText);
                     if (fullText) {
                        playElevenLabsAudio(fullText, selectedVoice);
                        currentTranscriptRef.current = "";
                     }
                 }
                 return; // Skip standard Gemini audio processing
             }

             // Handle Standard Gemini Voice Logic
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputAudioContextRef.current) {
                 const ctx = outputAudioContextRef.current;
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                 
                 const audioBuffer = await decodeAudioData(
                     decode(base64Audio),
                     ctx,
                     24000,
                     1
                 );
                 
                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(ctx.destination);
                 source.addEventListener('ended', () => {
                     sourcesRef.current.delete(source);
                 });
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
             }

             if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
                 currentTranscriptRef.current = ""; // Clear EL buffer on interrupt
                 setIsGeneratingTTS(false);
             }
          },
          onclose: () => {
             console.log('Session Closed');
             setStatus('idle');
             setIsActive(false);
          },
          onerror: (e) => {
             console.error(e);
             setStatus('error');
             setErrorMessage("Connection to AI service failed. Please check your network.");
             setIsActive(false);
          }
        },
        config: {
            responseModalities: [Modality.AUDIO], // Must be AUDIO to start the session, even if we use EL
            // If EL is selected, we enable transcription to get the text, but we don't need a voiceConfig for Gemini
            // If Gemini is selected, we set the specific voice
            speechConfig: isElevenLabs ? undefined : {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
            },
            // Enable transcription if using ElevenLabs so we can get text to send to EL API
            outputAudioTranscription: isElevenLabs ? { model: "gemini-2.5-flash" } : undefined,
            systemInstruction: "You are an expert technical interviewer for a senior software engineer role. Ask a challenging question about system design, wait for the user to answer, and then provide feedback. Keep your responses concise and conversational."
        }
      });

    } catch (e: any) {
      console.error("Failed to start session", e);
      let msg = "Connection Failed";
      if (e.message) msg = e.message;
      if (msg.includes("Permission denied")) msg = "Microphone access denied. Please allow microphone access.";
      
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const endSession = () => {
     if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
     }
     if (inputAudioContextRef.current) inputAudioContextRef.current.close();
     if (outputAudioContextRef.current) outputAudioContextRef.current.close();
     
     setIsActive(false);
     setStatus('idle');
     setVolume(0);
     window.location.reload(); 
  };

  const currentVoiceObj = VOICES.find(v => v.id === selectedVoice);
  const isEL = currentVoiceObj?.type === 'ElevenLabs';

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <MotionDiv 
          layout
          className={`relative rounded-[2rem] overflow-hidden shadow-glass transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/60 ${
            isActive ? 'ring-4 ring-blue-100' : ''
          }`}
        >
          {/* Status Bar */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {status === 'connected' ? 'Live Session' : 'Ready'}
              </span>
            </div>
            {isActive && (
              <div className="px-3 py-1 rounded-full bg-white/50 backdrop-blur-md text-xs font-mono text-primary border border-white/50 shadow-sm flex items-center gap-2">
                 Voice: {currentVoiceObj?.label.split('(')[0]}
                 {isGeneratingTTS && <Loader2 size={10} className="animate-spin" />}
              </div>
            )}
          </div>

          {/* Main Visualizer Area */}
          <div className="h-96 flex flex-col items-center justify-center relative bg-gradient-to-b from-white/0 to-blue-50/50">
             {status === 'error' && (
                 <div className="text-red-500 text-center px-6 bg-red-50 py-6 rounded-2xl border border-red-100 max-w-xs mx-auto shadow-sm">
                     <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
                     <p className="font-bold text-slate-900 mb-1">Connection Error</p>
                     <p className="text-xs text-slate-600 leading-relaxed">{errorMessage}</p>
                     <button onClick={() => setStatus('idle')} className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-colors">
                        Try Again
                     </button>
                 </div>
             )}

             {status === 'idle' && (
                 <div className="text-center space-y-6 w-full px-10">
                     <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-primary border border-blue-100 shadow-sm relative">
                         <Mic size={36} />
                         <div className="absolute inset-0 rounded-full border border-blue-200 animate-ping opacity-20"></div>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-900">Start Interview</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                            Connect with our AI interviewer for a real-time voice practice session.
                        </p>
                     </div>
                     
                     {/* Voice Selector */}
                     <div className="relative inline-block w-full max-w-[200px]">
                        <select 
                          value={selectedVoice}
                          onChange={(e) => setSelectedVoice(e.target.value)}
                          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-4 pr-8 rounded-xl focus:outline-none focus:border-primary/50 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-center"
                        >
                          {VOICES.map(v => (
                            <option key={v.id} value={v.id}>{v.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                          <ChevronDown size={14} />
                        </div>
                     </div>
                     
                     {isEL && (
                         <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-100 inline-block">
                            Uses ElevenLabs (Slight Latency)
                         </p>
                     )}
                 </div>
             )}

             {status === 'connecting' && (
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                     <p className="text-sm font-medium text-slate-500">Connecting to Neural Core...</p>
                 </div>
             )}

             {status === 'connected' && (
                 <div className="relative w-full h-full flex items-center justify-center">
                    {/* Abstract Voice Visualizer */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[1, 2, 3].map((i) => (
                             <MotionDiv
                               key={i}
                               animate={{ 
                                   scale: [1, 1.2 + (volume/50), 1],
                                   opacity: [0.1, 0, 0.1]
                               }}
                               transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                               className={`absolute border rounded-full w-32 h-32 ${isEL ? 'border-indigo-500' : 'border-primary'}`}
                             />
                        ))}
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl z-10 relative bg-gradient-to-br ${
                             isEL 
                             ? 'from-indigo-600 to-purple-600 shadow-indigo-500/30' 
                             : 'from-primary to-blue-500 shadow-blue-500/30'
                        }`}>
                             {isGeneratingTTS ? (
                                 <Loader2 className="text-white w-12 h-12 animate-spin" />
                             ) : (
                                 <Activity className="text-white w-12 h-12" />
                             )}
                             <MotionDiv 
                                animate={{ scale: 1 + (volume/100) }}
                                className="absolute inset-0 bg-white/30 rounded-full -z-10"
                             />
                        </div>
                    </div>
                 </div>
             )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-white/50 backdrop-blur-md border-t border-white/50 flex justify-center gap-6">
            {!isActive ? (
               <button 
                  onClick={startSession}
                  disabled={status === 'connecting'}
                  className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
               >
                   <Mic size={20} />
                   Start Session
               </button>
            ) : (
                <button 
                   onClick={endSession}
                   className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-bold hover:bg-red-100 transition-colors"
                >
                    <PhoneOff size={20} />
                    End Call
                </button>
            )}
          </div>
        </MotionDiv>
        
        <p className="text-center text-xs text-slate-400 mt-6 max-w-md mx-auto font-medium">
            Powered by Gemini Live API & ElevenLabs. Use headphones for best results.
        </p>
      </div>
    </div>
  );
};

export default LiveInterview;
