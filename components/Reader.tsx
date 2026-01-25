
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Sparkles, MessageSquare, 
  BookOpen, Quote, Info, Loader2, Wand2, 
  ClipboardCheck, Map, RefreshCw, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, ExternalLink, Globe, Link2, Mic, X, Volume2
} from 'lucide-react';
import { Document, ChatMessage } from '../types.ts';
import { explainConcept, streamChat, clearChatSession, connectLiveAssistant } from '../services/geminiService.ts';

interface ReaderProps {
  documents: Document[];
}

const Reader: React.FC<ReaderProps> = ({ documents }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = documents.find(d => d.id === id);
  
  const [chatMessages, setChatMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'lab' | 'info'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Live Voice Session State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => { 
      if (id) clearChatSession(id); 
      stopLiveSession();
    };
  }, [id]);

  if (!doc) return <div className="h-screen flex items-center justify-center text-slate-400">Document not found.</div>;

  const startLiveSession = async () => {
    try {
      setIsLiveActive(true);
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const sessionPromise = connectLiveAssistant({
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
            sessionPromise.then(session => session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            const binary = atob(audioBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        }
      }, doc.content);
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    outputAudioContextRef.current?.close();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiLoading) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: inputText, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiLoading(true);
    const aiMsgId = (Date.now() + 1).toString();
    setChatMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', timestamp: new Date() }]);
    let fullResponse = "";
    for await (const chunk of streamChat(doc.id, inputText, doc.content)) {
      fullResponse += chunk.text;
      setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullResponse, sources: chunk.sources } : m));
    }
    setIsAiLoading(false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden bg-slate-50">
      <div className={`flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-700 ${isFocusMode ? 'lg:mx-32' : ''}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-black text-slate-900 truncate max-w-sm">{doc.title}</h2>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={isLiveActive ? stopLiveSession : startLiveSession}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isLiveActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              {isLiveActive ? <><X className="w-4 h-4" /> Stop Voice Session</> : <><Mic className="w-4 h-4" /> Live Voice Assistant</>}
            </button>
            <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50"><Maximize2 className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-20 bg-slate-50/20 custom-scrollbar">
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-14 lg:p-20 shadow-2xl rounded-[3rem] border border-slate-100 min-h-full">
            <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-serif">
              {doc.content}
            </article>
          </div>
        </div>
      </div>

      <div className={`fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 w-[90vw] sm:w-80 lg:w-[450px] flex flex-col transition-all duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 pointer-events-none'}`}>
        <div className="h-full bg-white border border-slate-200 lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
            {chatMessages.length === 0 && (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-white border border-indigo-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl animate-icon-pulse overflow-hidden p-4">
                  <img src="https://i.ibb.co/6JbSBhjt/logobrahma.png" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Academic Intelligence</h3>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[90%] p-5 rounded-[2rem] text-[14px] shadow-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {msg.text || (msg.role === 'model' && <Loader2 className="w-4 h-4 animate-spin" />)}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.sources.map((source, i) => (
                        <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5"><Link2 className="w-3 h-3" /> {source.title.substring(0, 20)}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="relative">
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Inquire about this document..." className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:bg-white outline-none" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl"><Send className="w-5 h-5" /></button>
            </form>
          </div>
        </div>
      </div>
      {isLiveActive && (
        <div className="fixed bottom-24 right-8 z-[200] bg-indigo-600 p-6 rounded-[3rem] shadow-2xl flex items-center gap-6 animate-in slide-in-from-right-10">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><Volume2 className="w-6 h-6 text-white" /></div>
           <div className="text-white">
             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Active Voice Session</p>
             <p className="font-bold">Listening to Study Buddy...</p>
           </div>
           <button onClick={stopLiveSession} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white"><X className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export default Reader;
