
import React, { useState } from 'react';
import { 
  Sparkles, Send, BrainCircuit, Briefcase, 
  Globe, Cpu, BookOpen, GraduationCap, 
  ChevronRight, ArrowUpRight, Clock,
  TrendingUp, Newspaper, Cloud, CloudOff,
  Loader2
} from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { isSupabaseConfigured } from '../services/supabase';
import { Document } from '../types';

interface DashboardProps {
  documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResult, setQuickResult] = useState<string | null>(null);
  const [isQuickLoading, setIsQuickLoading] = useState(false);

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim() || isQuickLoading) return;
    setIsQuickLoading(true);
    setQuickResult(null);
    try {
      const res = await chatWithAI(quickQuery);
      setQuickResult(res.text);
    } catch (err) {
      setQuickResult("Error connecting to tutor.");
    } finally {
      setIsQuickLoading(false);
    }
  };

  const jobUpdates = [
    { title: "Junior Frontend Engineer", company: "TechFlow", type: "Full-time", location: "Remote", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "AI Research Assistant", company: "DeepMind Lab", type: "Internship", location: "London", icon: Cpu, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-8 lg:p-16 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6 gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>EduVault Live</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight leading-tight">
            Knowledge, in <span className="text-indigo-400">sync</span>.
          </h1>

          <form onSubmit={handleQuickAsk} className="relative group/ask max-w-xl mx-auto">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-3xl opacity-0 group-focus-within/ask:opacity-100 transition-all"></div>
            <div className="relative flex items-center">
              <BrainCircuit className="absolute left-5 w-6 h-6 text-slate-400 group-focus-within/ask:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                value={quickQuery}
                onChange={e => setQuickQuery(e.target.value)}
                placeholder="Ask your academic assistant..." 
                className="w-full pl-14 pr-16 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] text-lg font-medium placeholder:text-slate-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={isQuickLoading || !quickQuery.trim()}
                className="absolute right-3 p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-50"
              >
                {/* Loader2 fixed by import */}
                {isQuickLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </form>

          {quickResult && (
             <div className="mt-8 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] animate-in zoom-in-95 duration-300 text-left">
                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <TrendingUp className="w-3 h-3" /> Assistant Insight
                </div>
                <p className="text-base font-medium leading-relaxed text-slate-200">{quickResult}</p>
                <button onClick={() => setQuickResult(null)} className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Close Dialogue</button>
             </div>
          )}
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[140px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Live Vault History
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Library Feed</p>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
              {documents.length > 0 ? documents.slice(0, 6).map((doc) => (
                <div key={doc.id} className="flex-none w-48 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={doc.coverUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{doc.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.category}</p>
                </div>
              )) : (
                <div className="w-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                   <img 
                    src="https://i.ibb.co/zhbHCxnh/logo.png" 
                    className="w-12 h-12 opacity-20 mx-auto mb-4 grayscale" 
                    alt="Empty Vault"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                   />
                   <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                   <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Documents Synced</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                  Career Opportunities
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobUpdates.map((job, idx) => (
                <div key={idx} className="group p-6 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${job.bg} ${job.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <job.icon className="w-7 h-7" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{job.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{job.company}</p>
                  <button className="mt-6 w-full py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-900 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                    Inquire <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Newspaper className="w-6 h-6 text-indigo-600" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Intelligence</h2>
              </div>
              <div className="space-y-6">
                 {[
                   { title: "Quantum Computing sets new records in lab", time: "1h ago" },
                   { title: "AI regulation updates for 2025", time: "4h ago" }
                 ].map((n, i) => (
                   <div key={i} className="group cursor-pointer">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{n.time}</p>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{n.title}</h3>
                      <div className="h-px bg-slate-50 w-full mt-6"></div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
