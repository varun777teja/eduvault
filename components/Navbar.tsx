
import React from 'react';
import { Search, Bell, X, User } from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchFocus = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <Link to="/" className="flex items-center gap-3 shrink-0 group">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
           <img 
             src="logo.png" 
             alt="EduVault Logo" 
             className="w-full h-full object-contain p-0.5 group-hover:rotate-6 transition-transform" 
             onError={(e) => {
               e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
             }} 
           />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter leading-none shimmer-text">
            EduVault
          </h1>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">AI Library</span>
        </div>
      </Link>

      <div className="hidden md:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onFocus={handleSearchFocus}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents, concepts, careers..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all outline-none font-medium placeholder:text-slate-400"
          />
          {searchTerm && location.pathname === '/search' && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <NavLink 
          to="/notifications" 
          className={({ isActive }) => `p-2 rounded-full transition-all relative group ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
        >
          <Bell className="w-5 h-5 group-hover:animate-[icon-wiggle_0.4s_ease-in-out_infinite]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
        </NavLink>
        <div className="flex items-center gap-2 pl-2 lg:pl-4 border-l border-slate-200">
          <button 
            onClick={() => navigate('/profile')}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-all group ${location.pathname === '/profile' ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer group-hover:scale-110 active:scale-95 transition-all shadow-sm">
              JD
            </div>
            <span className={`text-sm font-semibold hidden sm:block ${location.pathname === '/profile' ? 'text-indigo-600' : 'text-slate-700'}`}>Jane Student</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
