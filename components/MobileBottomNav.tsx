
import React, { useState } from 'react';
import { Search, Sparkles, Home, Book, X, Send, Loader2, BrainCircuit, BarChart3, Library } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { chatWithAI } from '../services/geminiService';

const MobileBottomNav: React.FC<{ searchTerm: string, onSearchChange: (v: string) => void }> = ({ searchTerm, onSearchChange }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isLoading) return;
    setIsLoading(true);
    setAiResponse(null);
    try {
      const result = await chatWithAI(aiQuery);
      setAiResponse(result.text || "I couldn't find an answer for that.");
    } catch (err) {
      setAiResponse("Sorry, there was an error processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
    setIsSearchOpen(!isSearchOpen);
    setIsAiModalOpen(false);
  };

  const isHome = location.pathname === '/';
  const isLibrary = location.pathname === '/library';
  const isStats = location.pathname === '/stats';
  const isSearch = location.pathname === '/search';

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pointer-events-none">
        <div className="max-w-md mx-auto h-20 bg-white/95 backdrop-blur-3xl border border-slate-200/50 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-around px-4 pointer-events-auto relative">
          
          {/* Home */}
          <NavLink 
            to="/" 
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

          {/* Improved AI "Place" - The Central Dock */}
          <div className="relative -top-10 group">
            {/* The "Dock" Base */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full p-2 shadow-xl ring-1 ring-slate-100 flex items-center justify-center">
              <div className="w-full h-full bg-slate-50 rounded-full border border-dashed border-slate-200 animate-aura opacity-50"></div>
            </div>
            
            {/* The Floating Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse ${isAiModalOpen ? 'scale-150 opacity-60' : 'scale-110'}`}></div>
            
            {/* The Button */}
            <button 
              onClick={() => { setIsAiModalOpen(!isAiModalOpen); setIsSearchOpen(false); }}
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
