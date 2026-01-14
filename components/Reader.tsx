
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Sparkles, MessageSquare, 
  BookOpen, Quote, Info, Loader2, Wand2, 
  ClipboardCheck, Map, RefreshCw, ChevronRight, ChevronLeft,
  Maximize2, Minimize2
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
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'lab' | 'info'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [quiz, setQuiz] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [labLoading, setLabLoading] = useState<'quiz' | 'roadmap' | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stats Tracking: Study Time & History
  useEffect(() => {
    if (!doc) return;
    const startTime = Date.now();
    
    // Log this document to history
    const updateHistory = () => {
      const history = JSON.parse(localStorage.getItem('eduvault_history') || '[]');
      const newEntry = {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        timestamp: Date.now(),
        coverUrl: doc.coverUrl
      };
      // Keep only last 10 unique entries
      const filteredHistory = [newEntry, ...history.filter((h: any) => h.id !== doc.id)].slice(0, 10);
      localStorage.setItem('eduvault_history', JSON.stringify(filteredHistory));
    };
    updateHistory();

    const interval = setInterval(() => {
      const currentStats = JSON.parse(localStorage.getItem('eduvault_stats') || '{"minutes":0, "ai_hits":0}');
      currentStats.minutes += 1;
      localStorage.setItem('eduvault_stats', JSON.stringify(currentStats));
    }, 60000);

    return () => clearInterval(interval);
  }, [doc]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      if (id) clearChatSession(id);
    };
  }, [id]);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>Document not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-medium">Back to Home</button>
      </div>
    );
  }

  const trackAiHit = () => {
    const currentStats = JSON.parse(localStorage.getItem('eduvault_stats') || '{"minutes":0, "ai_hits":0}');
    currentStats.ai_hits += 1;
    localStorage.setItem('eduvault_stats', JSON.stringify(currentStats));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiLoading) return;

    trackAiHit();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiMsg]);

    try {
      let fullResponse = "";
      const streamer = streamChat(doc.id, inputText, doc.content);
      
      for await (const chunk of streamer) {
        fullResponse += chunk;
        setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullResponse } : m));
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "Error: Could not connect to the AI." } : m));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    trackAiHit();
    setLabLoading('quiz');
    try {
      const result = await generateQuiz(doc.content);
      setQuiz(result || "Failed to generate quiz.");
    } catch (err) {
      setQuiz("Error generating quiz.");
    } finally {
      setLabLoading(null);
    }
  };

  const handleGenerateRoadmap = async () => {
    trackAiHit();
    setLabLoading('roadmap');
    try {
      const result = await createStudyRoadmap(doc.content);
      setRoadmap(result || "Failed to generate roadmap.");
    } catch (err) {
      setRoadmap("Error generating roadmap.");
    } finally {
      setLabLoading(null);
    }
  };

  const explainSelection = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection || selection.trim().length < 5) {
      alert("Highlight some text first!");
      return;
    }

    trackAiHit();
    setIsAiLoading(true);
    setIsSidebarOpen(true);
    setActiveSidePanel('chat');
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `Explain this highlighted section: "${selection}"`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const explanation = await explainConcept(selection, doc.content.substring(0, 800));
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: explanation,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-4 overflow-hidden bg-slate-50">
      <div className={`flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-500 ease-in-out ${isFocusMode ? 'lg:px-20' : ''}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500 hover:scale-110 active:scale-90"
              title="Exit Reader"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="max-w-[200px] sm:max-w-md">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate group cursor-default">
                {doc.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">By {doc.author} • {doc.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`p-2 rounded-lg transition-all ${isFocusMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={explainSelection}
              className="hidden md:flex px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all items-center gap-2 shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask About Highlight
            </button>
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all ml-1"
                title="Open Assistant"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 custom-scrollbar bg-slate-50/20">
          <div className={`max-w-3xl mx-auto bg-white p-6 sm:p-10 lg:p-14 shadow-sm rounded-2xl min-h-full border border-slate-100/50 transition-all duration-500 ${isFocusMode ? 'shadow-indigo-100/50 ring-1 ring-indigo-50' : ''}`}>
            <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900 font-serif antialiased">
              {doc.content}
            </article>
          </div>
        </div>
      </div>

      <div 
        className={`fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 w-[85vw] sm:w-80 lg:w-96 flex flex-col transition-all duration-500 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full lg:h-full bg-white border border-slate-200 lg:rounded-2xl shadow-2xl lg:shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-slate-100 p-1">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
              title="Collapse"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex">
              <button 
                onClick={() => setActiveSidePanel('chat')}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeSidePanel === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Tutor
              </button>
              <button 
                onClick={() => setActiveSidePanel('lab')}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeSidePanel === 'lab' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Lab
              </button>
              <button 
                onClick={() => setActiveSidePanel('info')}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeSidePanel === 'info' ? 'border-slate-600 text-slate-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                Docs
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
            {activeSidePanel === 'chat' && (
              <div className="space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 px-4 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm animate-icon-pulse">
                      <Sparkles className="w-8 h-8 text-indigo-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">EduVault Assistant</p>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Highlight any text to get a deep explanation, or type your question below.
                    </p>
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] p-3.5 rounded-2xl text-[13px] shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none ring-1 ring-slate-50'
                    }`}>
                      <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
                        {msg.text || (msg.role === 'model' && <Loader2 className="w-3 h-3 animate-spin inline" />)}
                      </div>
                    </div>
                  </div>
                ))}
                {isAiLoading && chatMessages[chatMessages.length-1]?.text === "" && (
                   <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeSidePanel === 'lab' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <ClipboardCheck className="w-3 h-3" /> Practice Tools
                  </h4>
                  {quiz ? (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-[13px] prose prose-sm max-w-none shadow-sm animate-in zoom-in-95">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black text-purple-500 uppercase tracking-tight">AI Quiz Results</span>
                         <button onClick={handleGenerateQuiz} className="p-1 hover:bg-slate-50 rounded text-slate-400 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                         </button>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                        {quiz}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateQuiz}
                      disabled={!!labLoading}
                      className="w-full py-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/20 transition-all group flex flex-col items-center gap-3"
                    >
                      {labLoading === 'quiz' ? (
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      ) : (
                        <ClipboardCheck className="w-7 h-7 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
                      )}
                      <div className="text-center">
                        <span className="text-xs font-bold block">Generate Practice Quiz</span>
                        <span className="text-[10px] opacity-60">Test your mastery of this content</span>
                      </div>
                    </button>
                  )}
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Map className="w-3 h-3" /> Knowledge Map
                  </h4>
                  {roadmap ? (
                    <div className="p-4 bg-white border border-indigo-100 rounded-xl text-[13px] prose prose-sm max-w-none shadow-sm animate-in zoom-in-95">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tight">AI Study Roadmap</span>
                         <button onClick={handleGenerateRoadmap} className="p-1 hover:bg-slate-50 rounded text-indigo-400 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                         </button>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                        {roadmap}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateRoadmap}
                      disabled={!!labLoading}
                      className="w-full py-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group flex flex-col items-center gap-3"
                    >
                      {labLoading === 'roadmap' ? (
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      ) : (
                        <Map className="w-7 h-7 group-hover:scale-110 group-hover:-rotate-3 transition-transform" />
                      )}
                      <div className="text-center">
                        <span className="text-xs font-bold block">Create Study Roadmap</span>
                        <span className="text-[10px] opacity-60">Get a step-by-step learning path</span>
                      </div>
                    </button>
                  )}
                </section>
              </div>
            )}

            {activeSidePanel === 'info' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                    <Quote className="w-3 h-3" /> Metadata
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="text-[9px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Subject Domain</div>
                      <div className="text-sm font-bold text-slate-800">{doc.category}</div>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="text-[9px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Lexical Density</div>
                      <div className="text-sm font-bold text-slate-800">{doc.content.split(/\s+/).length} Words</div>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="text-[9px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Storage ID</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">{doc.id}</div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          {activeSidePanel === 'chat' && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="relative group">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl text-[13px] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium placeholder:text-slate-400 shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={isAiLoading || !inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Reader;
