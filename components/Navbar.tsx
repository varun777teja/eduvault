
import React, { useState, useEffect } from 'react';
import { Search, Bell, X, User, Cloud, CloudOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase.ts';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, onSearchChange, syncStatus = 'synced' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
    };
    fetchUser();
  }, []);

  const handleSearchFocus = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
            <img
              src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png"
              alt="AI EduVault Logo"
              className="w-full h-full object-contain p-1.5"
              onError={(e) => {
                e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter leading-none shimmer-text">
              AI EduVault
            </h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Real-time AI</span>
          </div>
        </Link>

        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
          {syncStatus === 'syncing' ? (
            <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
          ) : syncStatus === 'error' ? (
            <CloudOff className="w-3 h-3 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'Database Live'}
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <img src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png" alt="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 object-contain opacity-50 text-slate-400 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            value={searchTerm}
            onFocus={handleSearchFocus}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Global search..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all outline-none font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <NavLink
          to="/notifications"
          className={({ isActive }) => `p-2 rounded-full transition-all relative group ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
        >
          <Bell className="w-5 h-5 group-hover:animate-icon-wiggle" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </NavLink>
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <button
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-all group ${location.pathname === '/profile' ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <span className={`text-sm font-bold hidden sm:block ${location.pathname === '/profile' ? 'text-indigo-600' : 'text-slate-600'}`}>{userName}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
