
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Sparkles, Book, Briefcase, 
  Cpu, ArrowRight, History, TrendingUp,
  X, BrainCircuit, ExternalLink, Filter,
  FileText, GraduationCap, Loader2, Send,
  MessageSquare, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document, ChatMessage } from '../types';
import { chatWithAI, explainConcept } from '../services/geminiService';

interface SearchViewProps {
  documents: Document[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ documents, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'docs' | 'ai' | 'careers' | 'chat'>('all');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Search Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated search history
  const history = ['Quantum State', 'Feynman Lectures', 'React Internships', 'Literature Notes'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Reset chat when search term changes significantly
  useEffect(() => {
    if (searchTerm) {
      setChatMessages([]);
      setAiInsight(null);
    }
  }, [searchTerm]);

  // AI Spotlight Trigger: If search term is a concept
  useEffect(() => {
    const fetchAiSpotlight = async () => {
      if (searchTerm.length < 4 || activeTab === 'chat') {
        return;
      }
      setIsAiLoading(true);
      try {
        const res = await chatWithAI(`Provide a very concise (max 2 sentences) overview or definition for: ${searchTerm}`);
        // Fix: Assign res.text to string state
        setAiInsight(res.text);
      } catch (err) {
        setAiInsight(null);
      } finally {
        setIsAiLoading(false);
      }
    };

    const timer = setTimeout(fetchAiSpotlight, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const filteredDocs = useMemo(() => {
    if (!searchTerm) return [];
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const jobSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return [
      { title: "AI Intern", company: "BrainLab", type: "Remote" },
      { title: "Content Writer", company: "Edutext", type: "Full-time" },
      { title: "Software Engineer", company: "EduVault", type: "Hybrid" }
    ].filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm.toLowerCase().includes('job') || searchTerm.toLowerCase().includes('career'));
  }, [searchTerm]);

  const handleStartChat = () => {
    setActiveTab('chat');
    if (aiInsight && chatMessages.length === 0) {
      setChatMessages([
        { id: 'initial-ai', role: 'model', text: aiInsight, timestamp: new Date() }
      ]);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Use general AI chat for the search page
      const response = await chatWithAI(`Regarding the search topic "${searchTerm}": ${userMsg.text}`);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        // Fix: Use response.text string instead of the whole result object
        text: response.text,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        text: "I'm having trouble connecting to the network. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Search Header (Mobile Only, Desktop uses Navbar) */}
      <div className="lg:hidden mb-8">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents, concepts, jobs..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-lg font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      {!searchTerm ? (
        <div className="space-y-12 py-10">
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Recent Searches
            </h2>
            <div className="flex flex-wrap gap-3">
              {history.map(item => (
                <button 
                  key={item}
                  onClick={() => onSearchChange(item)}
                  className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center gap-2 group"
                >
                  {item}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Trending in EduVault
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Generative AI in Physics', count: '1.2k views', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Internship Guide 2025', count: '850 views', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Mastering React', count: '2.4k views', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50' }
              ].map((item, idx) => (
                <button key={idx} onClick={() => onSearchChange(item.label)} className="p-6 bg-white border border-slate-100 rounded-3xl text-left hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all group">
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-slate-900 leading-tight mb-1">{item.label}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.count}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Advanced Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
            {[
              { id: 'all', label: 'All Results', icon: Filter },
              { id: 'chat', label: 'AI Conversation', icon: MessageSquare },
              { id: 'docs', label: 'Vault Documents', icon: FileText },
              { id: 'careers', label: 'Opportunities', icon: Briefcase }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI Spotlight Section (Visible in 'all' tab) */}
          {activeTab === 'all' && (
            <section className="animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 animate-icon-pulse">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Quick Answer</span>
                  </div>
                  
                  {isAiLoading ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <p className="text-lg font-medium opacity-80 italic">Synthesizing insight for "{searchTerm}"...</p>
                    </div>
                  ) : aiInsight ? (
                    <div className="space-y-4">
                      <p className="text-xl lg:text-2xl font-bold leading-tight">
                        {aiInsight}
                      </p>
                      <div className="flex gap-3">
                         <button 
                           onClick={handleStartChat}
                           className="px-6 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                         >
                           <MessageSquare className="w-4 h-4" /> Start AI Chat
                         </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg opacity-60">Searching for AI definitions... Type a concept like "Neural Networks".</p>
                  )}
                </div>
                {/* Decorative background orbs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              </div>
            </section>
          )}

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[500px]">
            
            {/* Dedicated Chat Interface */}
            {activeTab === 'chat' && (
              <div className="lg:col-span-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col overflow-hidden h-[600px] animate-in slide-in-from-right-4">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Socratic Assistant</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Topic: {searchTerm}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 && !isChatLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                       <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 animate-bounce-subtle">
                         <Sparkles className="w-8 h-8" />
                       </div>
                       <h4 className="text-lg font-black text-slate-900">Ask the Academic Assistant</h4>
                       <p className="text-sm text-slate-500 max-w-xs mt-2">I'm here to help you understand "{searchTerm}" in-depth. What would you like to know?</p>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-white'}`}>
                           {msg.role === 'user' ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                         </div>
                         <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                           msg.role === 'user' 
                             ? 'bg-indigo-600 text-white rounded-tr-none' 
                             : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                         }`}>
                           {msg.text}
                         </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                           <BrainCircuit className="w-4 h-4" />
                         </div>
                         <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Assistant is thinking...</span>
                         </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <form onSubmit={handleChatSubmit} className="relative group">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={`Ask anything about ${searchTerm}...`}
                      className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg active:scale-90"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {(activeTab === 'all' || activeTab === 'docs') && (
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Matching Documents
                  </h2>
                  <span className="text-[10px] font-black text-slate-400">{filteredDocs.length} Found</span>
                </div>
                
                {filteredDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => navigate(`/reader/${doc.id}`)}
                        className="group bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer flex gap-4 items-center"
                      >
                        <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                          <img src={doc.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{doc.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{doc.author}</p>
                          <div className="mt-3 inline-flex px-2 py-0.5 bg-slate-50 rounded text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {doc.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">No matching documents in your vault.</p>
                    <button className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Upload "{searchTerm}"</button>
                  </div>
                )}
              </div>
            )}

            {/* Sidebar Results (Careers/Opportunities) */}
            {(activeTab === 'all' || activeTab === 'careers') && (
              <div className="lg:col-span-4 space-y-8">
                <section>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Career Match
                  </h2>
                  <div className="space-y-4">
                    {jobSuggestions.length > 0 ? jobSuggestions.map((job, i) => (
                      <div key={i} className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{job.company} • {job.type}</p>
                      </div>
                    )) : (
                      <div className="p-8 bg-slate-50 rounded-[2rem] text-center border border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching careers</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
