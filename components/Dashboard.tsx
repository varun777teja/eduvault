
import React, { useState } from 'react';
import { 
  Sparkles, Send, BrainCircuit, Briefcase, 
  Globe, Cpu, BookOpen, GraduationCap, 
  ChevronRight, ArrowUpRight, Clock,
  TrendingUp, Newspaper, Cloud, CloudOff
} from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { isSupabaseConfigured } from '../services/supabase';

const Dashboard: React.FC = () => {
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
      setQuickResult(res);
    } catch (err) {
      setQuickResult("Error connecting to tutor.");
    } finally {
      setIsQuickLoading(false);
    }
  };

  const jobUpdates = [
    { title: "Junior Frontend Engineer", company: "TechFlow", type: "Full-time", location: "Remote", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Data Analyst Intern", company: "Quantico", type: "Internship", location: "New York", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "AI Research Assistant", company: "DeepMind Lab", type: "Part-time", location: "London", icon: Cpu, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const aiNews = [
    { title: "Gemini 3.0 sets new benchmarks in Socratic teaching", source: "AI Daily", time: "2h ago" },
    { title: "How generative AI is reshaping the 2025 curriculum", source: "EduTech", time: "5h ago" },
  ];

  const newBooks = [
    { title: "The Art of Learning", author: "Josh Waitzkin", category: "Psychology", cover: "https://picsum.photos/seed/learn/200/300" },
    { title: "Calculus Reimagined", author: "Dr. Smith", category: "Mathematics", cover: "https://picsum.photos/seed/math/200/300" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-8 lg:p-16 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6 gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span>EduVault Discovery Hub</span>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${isSupabaseConfigured ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              {isSupabaseConfigured ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
              <span>{isSupabaseConfigured ? 'Cloud Sync Active' : 'Local Storage Mode'}</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight leading-tight">
            Discover your next <span className="text-indigo-400">opportunity</span>.
          </h1>

          <form onSubmit={handleQuickAsk} className="relative group/ask max-w-xl mx-auto">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-3xl opacity-0 group-focus-within/ask:opacity-100 transition-all"></div>
            <div className="relative flex items-center">
              <BrainCircuit className="absolute left-5 w-6 h-6 text-slate-400 group-focus-within/ask:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                value={quickQuery}
                onChange={e => setQuickQuery(e.target.value)}
                placeholder="Ask about careers, news, or books..." 
                className="w-full pl-14 pr-16 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] text-lg font-medium placeholder:text-slate-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={isQuickLoading || !quickQuery.trim()}
                className="absolute right-3 p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-50"
              >
                {isQuickLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </form>

          {quickResult && (
             <div className="mt-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-in zoom-in-95 duration-300 text-left">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <TrendingUp className="w-3 h-3" /> AI Insight
                </div>
                <p className="text-base font-medium leading-relaxed text-slate-200">"{quickResult}"</p>
                <button onClick={() => setQuickResult(null)} className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Dismiss</button>
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
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                  Career Pipeline
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Jobs & Internships for you</p>
              </div>
              <button className="text-xs font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">View All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobUpdates.map((job, idx) => (
                <div key={idx} className="group p-6 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-500">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${job.bg} ${job.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <job.icon className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-tight">{job.type}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{job.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{job.company} • {job.location}</p>
                  <button className="mt-6 w-full py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-900 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                    Apply Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                  New in Library
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Recently added resources</p>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {newBooks.map((book, idx) => (
                <div key={idx} className="flex-none w-48 group">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-slate-100 mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{book.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{book.category}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white border border-slate-200 rounded-[3rem] p-8 h-full shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Feed</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global AI & Edu News</p>
              </div>
            </div>

            <div className="space-y-8">
              {aiNews.map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                    <Clock className="w-3 h-3" /> {item.time}
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-relaxed mb-1">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{item.source}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="h-px bg-slate-50 w-full mt-6"></div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-3xl">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Trending Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {['#LLM', '#FutureOfWork', '#Quantum', '#Socratic'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600">{tag}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
