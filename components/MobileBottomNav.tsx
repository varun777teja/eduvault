
import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Home, Book, X, Send, 
  Loader2, BrainCircuit, BarChart3, Library,
  Zap, Volume2, Network, MessageSquare,
  ArrowRight, Mic, BookOpen, Quote
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { chatWithAI, getDailyAcademicInsight } from '../services/geminiService';

const MobileBottomNav: React.FC<{ searchTerm: string, onSearchChange: (v: string) => void }> = ({ searchTerm, onSearchChange }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string>('Loading academic insight...');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAiModalOpen) {
      fetchInsight();
    }
  }, [isAiModalOpen]);

  const fetchInsight = async () => {
    setIsInsightLoading(true);
    const insight = await getDailyAcademicInsight();
    setDailyInsight(insight);
    setIsInsightLoading(false);
  };

  const handleSearchClick = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
    setIsAiModalOpen(false);
  };

  const isHome = location.pathname === '/';
  const isLibrary = location.pathname === '/library';
  const isStats = location.pathname === '/stats';
  const isSearch = location.pathname === '/search';

  const aiFutures = [
    { 
      label: 'AI Vault', 
      desc: 'Smart Document Analysis', 
      icon: Network, 
      to: '/ai-vault', 
      color: 'bg-indigo-500' 
    },
    { 
      label: 'Summarizer', 
      desc: 'Quick Academic Recap', 
      icon: Zap, 
      to: '/ai-vault', // Assuming summarizer is part of AI vault view
      color: 'bg-amber-500' 
    },
    { 
      label: 'Audio Podcast', 
      desc: 'Joe & Jane Deep Dive', 
      icon: Volume2, 
      to: '/ai-vault', 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Study Chat', 
      desc: 'Ask your AI Tutor', 
      icon: MessageSquare, 
      to: '/search', 
      color: 'bg-purple-500' 
    }
  ];

  return (
    <>
      {/* AI Futures Menu Overlay */}
      {isAiModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            onClick={() => setIsAiModalOpen(false)}
          ></div>
          
          <div className="absolute bottom-28 left-4 right-4 bg-white rounded-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
            
            <header className="relative mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center p-3 shadow-xl">
                  <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="AI" className="w-full h-full object-contain brightness-0 invert" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">AI Futures</h2>
              <div className="mt-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 justify-center">
                  <Sparkles className="w-3 h-3" /> Daily Academic Insight
                </div>
                <p className="text-xs font-bold text-slate-700 italic leading-relaxed">
                  {isInsightLoading ? 'Generating insight...' : `"${dailyInsight}"`}
                </p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {aiFutures.map((future, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    navigate(future.to);
                    setIsAiModalOpen(false);
                  }}
                  className="p-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-left hover:bg-slate-100 transition-all group"
                >
                  <div className={`w-10 h-10 ${future.color} text-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <future.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{future.label}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{future.desc}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                navigate('/ai-vault');
                setIsAiModalOpen(false);
              }}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group shadow-xl"
            >
              Open Full Intelligence Hub
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] px-4 pb-6 pointer-events-none">
        <div className="max-w-md mx-auto h-20 bg-white/95 backdrop-blur-3xl border border-slate-200/50 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-around px-4 pointer-events-auto relative">
          
          {/* Home */}
          <NavLink 
            to="/" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${isHome ? 'bg-indigo-50 shadow-inner' : ''}`}>
              <Home className={`w-6 h-6 ${isHome ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]' : ''}`} />
            </div>
            {isHome && <span className="text-[9px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1">Home</span>}
          </NavLink>

          {/* Search */}
          <button 
            onClick={handleSearchClick}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isSearch ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${isSearch ? 'bg-emerald-50 shadow-inner' : ''}`}>
              <Search className={`w-6 h-6 ${isSearch ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`} />
            </div>
            {isSearch && <span className="text-[9px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1">Search</span>}
          </button>

          {/* The Central Dock AI Icon */}
          <div className="relative -top-10 group">
            {/* The "Dock" Base */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full p-2 shadow-xl ring-1 ring-slate-100 flex items-center justify-center">
              <div className={`w-full h-full bg-slate-50 rounded-full border border-dashed border-slate-200 animate-aura opacity-50 ${isAiModalOpen ? 'animate-none opacity-100 border-indigo-500' : ''}`}></div>
            </div>
            
            {/* The Floating Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse ${isAiModalOpen ? 'scale-150 opacity-60' : 'scale-110'}`}></div>
            
            {/* The Button */}
            <button 
              onClick={() => { setIsAiModalOpen(!isAiModalOpen); }}
              className={`relative w-16 h-16 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl shadow-indigo-300/50 flex items-center justify-center text-white transition-all duration-500 active:scale-90 hover:scale-105 hover:-translate-y-1 ${isAiModalOpen ? 'rotate-[135deg] rounded-[2rem]' : 'animate-bounce-subtle'} overflow-hidden`}
            >
              {isAiModalOpen ? (
                <X className="w-8 h-8 -rotate-[135deg]" />
              ) : (
                <div className="w-9 h-9">
                   <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="AI" className="w-full h-full object-contain brightness-0 invert" />
                </div>
              )}
              {!isAiModalOpen && (
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-aura pointer-events-none"></div>
              )}
            </button>
          </div>

          {/* Library */}
          <NavLink 
            to="/library" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${isLibrary ? 'bg-amber-50 shadow-inner' : ''}`}>
              <Library className={`w-6 h-6 ${isLibrary ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`} />
            </div>
            {isLibrary && <span className="text-[9px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1">Books</span>}
          </NavLink>

          {/* Stats */}
          <NavLink 
            to="/stats" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-rose-600' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${isStats ? 'bg-rose-50 shadow-inner' : ''}`}>
              <BarChart3 className={`w-6 h-6 ${isStats ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]' : ''}`} />
            </div>
            {isStats && <span className="text-[9px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1">Stats</span>}
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
