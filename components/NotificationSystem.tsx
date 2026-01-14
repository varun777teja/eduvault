
import React from 'react';
import { Sparkles, Bell, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationSystemProps {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-20 right-4 z-[60] w-full max-w-sm pointer-events-none flex flex-col gap-3">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl p-4 flex gap-4 animate-in slide-in-from-right-10 duration-500 overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 animate-[shimmer_5s_linear_forwards]" style={{ width: '100%' }}></div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
            n.type === 'alert' ? 'bg-rose-50 text-rose-600' :
            'bg-indigo-50 text-indigo-600'
          }`}>
            {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {n.type === 'alert' && <AlertCircle className="w-5 h-5" />}
            {n.type === 'task' && <Sparkles className="w-5 h-5" />}
            {n.type === 'info' && <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-slate-900 leading-tight">{n.title}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
          </div>
          <button 
            onClick={() => removeNotification(n.id)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 self-start transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
