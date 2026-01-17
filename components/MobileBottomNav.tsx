
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
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
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
  const isAiVault = location.pathname === '/ai-vault';

  const aiFutures = [
    { 
      label: 'AI Vault', 
      desc: 'Smart Docs', 
      icon: Network, 
      to: '/ai-vault', 
      color: 'bg-indigo-500' 
    },
    { 
      label: 'Summarizer', 
      desc: 'Study Recap', 
      icon: Zap, 
      to: '/ai-vault',
      color: 'bg-amber-500' 
    },
    { 
      label: 'Audio Podcast', 
      desc: 'Joe & Jane', 
      icon: Volume2, 
      to: '/ai-vault', 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Study Chat', 
      desc: 'Ask Tutor', 
      icon: MessageSquare, 
      to: '/search', 
      color: 'bg-purple-500' 
    }
  ];

  return (
    <>
      {/* AI Futures Menu Overlay */}
      {isAiModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            onClick={() => setIsAiModalOpen(false)}
          ></div>
          
          <div className="absolute bottom-24 left-4 right-4 bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
            
            <header className="relative mb-6 text-center shrink-0">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center p-3 shadow-xl border border-white/10 ring-4 ring-indigo-500/10">
                  <img src="https://i.ibb.co/TBWnWGyv/image.png" alt="AI" className="w-full h-full object-contain brightness-0 invert" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">AI Futures</h2>
              <div className="mt-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1 justify-center">
                  <Sparkles className="w-2.5 h-2.5" /> Daily Academic Insight
                </div>
                <p className="text-[10px] font-bold text-slate-700 italic leading-snug">
                  {isInsightLoading ? 'Generating insight...' : `"${dailyInsight}"`}
                </p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-3 mb-6 overflow-y-auto custom-scrollbar flex-1">
              {aiFutures.map((future, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    navigate(future.to);
                    setIsAiModalOpen(false);
                  }}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-slate-100 transition-all group active:scale-95"
                >
                  <div className={`w-8 h-8 ${future.color} text-white rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <future.icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">{future.label}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{future.desc}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={() => {
                navigate('/ai-vault');
                setIsAiModalOpen(false);
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group shadow-xl active:scale-95 shrink-0"
            >
              Open Full intelligence
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar - Now a clean 5-item bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] px-4 pb-4 pointer-events-none">
        <div className="max-w-md mx-auto h-16 bg-white/95 backdrop-blur-3xl border border-slate-200/50 rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-between px-2 pointer-events-auto relative">
          
          {/* Home */}
          <NavLink 
            to="/" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isHome ? 'bg-indigo-50 shadow-inner' : ''}`}>
              <Home className={`w-5 h-5 ${isHome ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]' : ''}`} />
            </div>
          </NavLink>

          {/* Search */}
          <button 
            onClick={handleSearchClick}
            className={`flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isSearch ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isSearch ? 'bg-emerald-50 shadow-inner' : ''}`}>
              <Search className={`w-5 h-5 ${isSearch ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`} />
            </div>
          </button>

          {/* Central AI Hub Access (Simplified) */}
          <button 
            onClick={() => { setIsAiModalOpen(!isAiModalOpen); }}
            className={`flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isAiModalOpen || isAiVault ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isAiModalOpen || isAiVault ? 'bg-indigo-50 shadow-inner' : ''}`}>
              <Sparkles className={`w-5 h-5 ${isAiModalOpen || isAiVault ? 'animate-pulse' : ''}`} />
            </div>
          </button>

          {/* Library */}
          <NavLink 
            to="/library" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isLibrary ? 'bg-amber-50 shadow-inner' : ''}`}>
              <Library className={`w-5 h-5 ${isLibrary ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`} />
            </div>
          </NavLink>

          {/* Stats */}
          <NavLink 
            to="/stats" 
            onClick={() => setIsAiModalOpen(false)}
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isActive ? 'text-rose-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isStats ? 'bg-rose-50 shadow-inner' : ''}`}>
              <BarChart3 className={`w-5 h-5 ${isStats ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]' : ''}`} />
            </div>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
