
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Sparkles, MessageSquare, 
  BookOpen, Quote, Info, Loader2, Wand2, 
  ClipboardCheck, Map, RefreshCw, ChevronRight, ChevronLeft,
  Maximize2, Minimize2, ExternalLink, Globe, Link2
} from 'lucide-react';
import { Document, ChatMessage } from '../types';
import { explainConcept, streamChat, generateQuiz, createStudyRoadmap, clearChatSession } from '../services/geminiService';

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
  
  const [quiz, setQuiz] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [labLoading, setLabLoading] = useState<'quiz' | 'roadmap' | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doc) return;
    const history = JSON.parse(localStorage.getItem('eduvault_history') || '[]');
    const newEntry = { id: doc.id, title: doc.title, category: doc.category, timestamp: Date.now(), coverUrl: doc.coverUrl };
    localStorage.setItem('eduvault_history', JSON.stringify([newEntry, ...history.filter((h: any) => h.id !== doc.id)].slice(0, 10)));
  }, [doc]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => { if (id) clearChatSession(id); };
  }, [id]);

  if (!doc) {
    return <div className="h-screen flex items-center justify-center text-slate-400">Document not found.</div>;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: inputText, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg = { id: aiMsgId, role: 'model' as const, text: '', timestamp: new Date(), sources: [] };
    setChatMessages(prev => [...prev, aiMsg]);

    try {
      let fullResponse = "";
      const streamer = streamChat(doc.id, inputText, doc.content);
      for await (const chunk of streamer) {
        fullResponse += chunk.text;
        setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullResponse, sources: chunk.sources } : m));
      }
    } catch (err) {
      setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "Error: AI Tutor is currently unreachable." } : m));
    } finally {
      setIsAiLoading(false);
    }
  };

  const explainSelection = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection?.trim()) return;

    setIsAiLoading(true);
    setIsSidebarOpen(true);
    setActiveSidePanel('chat');
    
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: `Explain: "${selection}"`, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const explanation = await explainConcept(selection, doc.content.substring(0, 1000));
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'model' as const, text: explanation.text, timestamp: new Date(), sources: explanation.sources };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden bg-slate-50">
      {/* Reader Panel */}
      <div className={`flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-700 ease-in-out ${isFocusMode ? 'lg:mx-32' : ''}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-500 hover:scale-110 active:scale-90">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight truncate max-w-sm">{doc.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{doc.category}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-400">{doc.author}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-3 rounded-2xl transition-all ${isFocusMode ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}>
              {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={explainSelection} className="hidden md:flex px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all items-center gap-2 shadow-xl active:scale-95">
              <div className="w-4 h-4">
                <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              Ask AI Tutor
            </button>
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-20 custom-scrollbar bg-slate-50/20">
          <div className={`max-w-3xl mx-auto bg-white p-8 sm:p-14 lg:p-20 shadow-2xl rounded-[3rem] min-h-full border border-slate-100 transition-all duration-700 ${isFocusMode ? 'shadow-indigo-500/10' : ''}`}>
            <article onMouseUp={(e) => {}} className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900 font-serif antialiased">
              {doc.content}
            </article>
          </div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className={`fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 w-[90vw] sm:w-80 lg:w-[450px] flex flex-col transition-all duration-500 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 pointer-events-none'}`}>
        <div className="h-full bg-white border border-slate-200 lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-slate-100 p-2">
            <button onClick={() => setIsSidebarOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="flex-1 flex px-2 gap-1">
              {[
                { id: 'chat', label: 'Tutor', icon: MessageSquare, color: 'indigo' },
                { id: 'lab', label: 'Practice', icon: Sparkles, color: 'purple' },
                { id: 'info', label: 'Metadata', icon: Info, color: 'slate' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveSidePanel(tab.id as any)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-b-2 transition-all ${
                    activeSidePanel === tab.id ? `border-${tab.color}-600 text-${tab.color}-600` : 'border-transparent text-slate-400'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
            {activeSidePanel === 'chat' && (
              <div className="space-y-6">
                {chatMessages.length === 0 && (
                  <div className="text-center py-16 px-6 animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-white border border-indigo-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl animate-icon-pulse overflow-hidden p-4">
                      <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="AI Assistant" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Academic Intelligence</h3>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
                      Highlight document text or ask anything. Gemini uses Google Search to ground your studies in verified facts.
                    </p>
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}>
                    <div className={`max-w-[90%] p-5 rounded-[2rem] text-[14px] shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none ring-1 ring-slate-50'
                    }`}>
                      <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                        {msg.text || (msg.role === 'model' && <Loader2 className="w-4 h-4 animate-spin inline" />)}
                      </div>
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                           <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-2 flex items-center gap-1">
                             <Globe className="w-3 h-3" /> Verifiable Sources
                           </p>
                           <div className="flex flex-wrap gap-2">
                             {msg.sources.map((source, idx) => (
                               <a 
                                 key={idx} 
                                 href={source.uri} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95"
                               >
                                 <Link2 className="w-3 h-3" /> {source.title.substring(0, 20)}...
                               </a>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeSidePanel === 'lab' && (
              <div className="space-y-6">
                <button 
                  onClick={() => {}} 
                  className="w-full py-10 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="w-10 h-10 mb-2">
                    <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="AI Lab" className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Generate Mastery Quiz</span>
                </button>
              </div>
            )}
          </div>

          {activeSidePanel === 'chat' && (
            <div className="p-6 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Inquire about this document..."
                  className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={isAiLoading || !inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-xl active:scale-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reader;
