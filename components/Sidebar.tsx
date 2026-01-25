
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Book, Layers, Zap,
  BrainCircuit, ChevronRight, ExternalLink,
  Cloud, BarChart3, Sparkles, CalendarDays,
  User, ShieldAlert, ArrowUpRight, BookText
} from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin }) => {
  const location = useLocation();

  const mainLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Feed' },
    { to: '/library', icon: Book, label: 'Vault Library' },
    {
      to: '/ai-future',
      label: 'AI Future',
      icon: (props: any) => (
        <img
          src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png"
          alt="AI"
          className={`${props.className} object-contain`}
        />
      )
    },
    { to: '/planner', icon: CalendarDays, label: 'Planner' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/stats', icon: BarChart3, label: 'Insights' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden">
      <div className="p-8 pb-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white border border-slate-100 shadow-xl rounded-2xl flex items-center justify-center p-1 group-hover:scale-110 transition-transform duration-500">
            <img src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">AI EduVault</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Smart E-Library</p>
          </div>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-10">
        {isAdmin && (
          <section className="bg-slate-900 mx-2 p-1 rounded-2xl">
            <NavLink to="/admin" className="flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white">
              <span>Admin Terminal</span>
              <ArrowUpRight className="w-3 h-3" />
            </NavLink>
          </section>
        )}

        <section>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Discovery</div>
          <nav className="space-y-1.5">
            {mainLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-bold transition-all group ${isActive ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <link.icon className={`w-4 h-4 transition-transform ${location.pathname === link.to ? 'rotate-3' : 'group-hover:rotate-12'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
              </NavLink>
            ))}
          </nav>
        </section>
      </div>

      <div className="p-6 border-t border-slate-100">
        <NavLink to="/profile" className="flex items-center gap-4 w-full group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">JD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">Jane Student</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI EduVault Pro</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
