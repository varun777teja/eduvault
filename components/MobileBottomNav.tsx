
import React from 'react';
import {
  Search, Home, BarChart3, Library
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const MobileBottomNav: React.FC<{ searchTerm: string, onSearchChange: (v: string) => void }> = ({ searchTerm, onSearchChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const isHome = location.pathname === '/';
  const isLibrary = location.pathname === '/library';
  const isStats = location.pathname === '/stats';
  const isSearch = location.pathname === '/search';

  return (
    <>
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[110] px-4 pb-4 pointer-events-none ${location.pathname.includes('ai-future') ? 'hidden' : ''}`}>
        <div className="max-w-md mx-auto h-16 bg-white/95 backdrop-blur-3xl border border-slate-200/50 rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-between px-2 pointer-events-auto relative">

          {/* Home */}
          <NavLink
            to="/"
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

          {/* Library */}
          <NavLink
            to="/library"
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isActive ? 'text-amber-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isLibrary ? 'bg-amber-50 shadow-inner' : ''}`}>
              <Library className={`w-5 h-5 ${isLibrary ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`} />
            </div>
          </NavLink>

          {/* AI Future */}
          <NavLink
            to="/ai-future"
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 p-2 transition-all duration-300 ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${location.pathname === '/ai-future' ? 'bg-purple-50 shadow-inner' : ''}`}>
              <img
                src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png"
                alt="AI"
                className={`w-8 h-8 object-contain ${location.pathname === '/ai-future' ? 'animate-elastic-pop drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]' : ''}`}
              />
            </div>
          </NavLink>

          {/* Stats */}
          <NavLink
            to="/stats"
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
