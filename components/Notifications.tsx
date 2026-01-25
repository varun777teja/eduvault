
import React, { useState, useMemo } from 'react';
import {
  Bell, Sparkles, CheckCircle2, Clock, Trash2,
  ArrowLeft, Info, Eye, EyeOff, Filter,
  Search, Settings, BookOpen, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotifType = 'ai' | 'sync' | 'reminder' | 'info';

interface NotificationItem {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'ai',
    title: 'Quiz Ready!',
    description: 'A practice quiz is ready for your "Quantum Physics" document. Start testing your knowledge now.',
    time: '2 mins ago',
    read: false,
  },
  {
    id: '2',
    type: 'sync',
    title: 'Google Drive Synced',
    description: 'Successfully imported "History of Rome" and 2 other PDFs from your Student Drive.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'ai',
    title: 'New Study Roadmap',
    description: 'AI has finished building your learning path for "The Great Gatsby".',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Exam Countdown',
    description: 'Literature exam in 3 days. We recommend reviewing your starred documents.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Feature Update',
    description: 'AI EduVault now supports streaming chat for faster responses.',
    time: '1 day ago',
    read: true,
  }
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ai'>('all');

  const filteredNotifs = useMemo(() => {
    switch (filter) {
      case 'unread': return notifs.filter(n => !n.read);
      case 'ai': return notifs.filter(n => n.type === 'ai');
      default: return notifs;
    }
  }, [notifs, filter]);

  const toggleRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifs([]);
    }
  };

  const getIcon = (type: NotifType) => {
    switch (type) {
      case 'ai': return { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'sync': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'reminder': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 transition-all hover:scale-110 active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                {notifs.filter(n => !n.read).length} New
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Stay updated with your study progress and AI insights</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Read
          </button>
          <button
            onClick={clearAll}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === 'unread' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'ai' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Insights
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 min-h-[400px]">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            const style = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`group p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${!notif.read ? 'border-l-4 border-l-indigo-500 ring-1 ring-indigo-50' : 'border-slate-100 opacity-80 hover:opacity-100'
                  }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.color} ${style.border} group-hover:scale-110 transition-transform`}>
                  <style.icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className={`text-base font-bold text-slate-900 truncate tracking-tight ${!notif.read ? 'text-indigo-950' : ''}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-tighter">{notif.time}</span>
                      {!notif.read && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>}
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${!notif.read ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {notif.description}
                  </p>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleRead(notif.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1.5"
                    >
                      {notif.read ? <><EyeOff className="w-3 h-3" /> Mark Unread</> : <><Eye className="w-3 h-3" /> Mark Read</>}
                    </button>
                    <button
                      onClick={() => deleteNotif(notif.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 relative">
              <Bell className="w-10 h-10 text-slate-300" />
              <div className="absolute top-0 right-0 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">You're all caught up!</h3>
            <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed mb-8">
              No new notifications for your current filters. We'll let you know when your AI insights are ready.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Tip Card */}
      {notifs.length > 0 && (
        <div className="mt-12 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <AlertCircle className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Study Tip</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Documents you haven't reviewed in 7 days will automatically appear here to help you maintain consistent recall.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
