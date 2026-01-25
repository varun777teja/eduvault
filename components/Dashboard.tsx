
import React, { useState } from 'react';
import { 
  Sparkles, Send, Briefcase, 
  Cpu, BookOpen, 
  ArrowUpRight, 
  Newspaper, 
  Loader2, Search,
  Zap, Rocket, Star, Globe, Building2
} from 'lucide-react';
import { chatWithAI } from '../services/geminiService.ts';
import { Document } from '../types.ts';

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

  const internshipUpdates = [
    { title: "Frontend Intern", company: "Google", type: "Summer 2025", location: "Remote", color: "text-blue-500", bg: "bg-blue-50", link: "https://careers.google.com" },
    { title: "AI Product Design", company: "Meta", type: "12 Weeks", location: "London", color: "text-purple-500", bg: "bg-purple-50", link: "https://metacareers.com" },
    { title: "Data Analytics", company: "Microsoft", type: "Fall Intake", location: "Hyderabad", color: "text-emerald-500", bg: "bg-emerald-50", link: "https://careers.microsoft.com" },
    { title: "ML Engineering", company: "NVIDIA", type: "Research", location: "Remote", color: "text-green-500", bg: "bg-green-50", link: "https://nvidia.com/careers" },
  ];

  const jobUpdates = [
    { title: "Junior Frontend Engineer", company: "TechFlow", type: "Full-time", location: "Remote", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "AI Research Assistant", company: "DeepMind Lab", type: "Internship", location: "London", icon: Cpu, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Cloud Architect Associate", company: "AWS", type: "Full-time", location: "Seattle", icon: Building2, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "Cybersecurity Analyst", company: "CrowdStrike", type: "Full-time", location: "Remote", icon: Star, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-20 text-white shadow-2xl border border-white/5 mx-2 lg:mx-0">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6 lg:mb-8 gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span>EduVault Live Sync</span>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-7xl font-black mb-8 lg:mb-10 tracking-tight leading-none px-2">
            Knowledge, <br/><span className="text-indigo-400">Perfectly Synced.</span>
          </h1>

          <form onSubmit={handleQuickAsk} className="relative group/ask max-w-xl mx-auto">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full opacity-0 group-focus-within/ask:opacity-100 transition-all"></div>
            <div className="relative flex items-center">
              <div className="absolute left-5 lg:left-7 w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center opacity-40 group-focus-within/ask:opacity-100 transition-opacity">
                <Search className="w-full h-full text-slate-300" />
              </div>
              <input 
                type="text" 
                value={quickQuery}
                onChange={e => setQuickQuery(e.target.value)}
                placeholder="Ask your tutor anything..." 
                className="w-full pl-14 lg:pl-16 pr-14 lg:pr-16 py-6 lg:py-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl lg:rounded-[3rem] text-sm lg:text-xl font-medium placeholder:text-slate-500 focus:bg-white/10 focus:ring-8 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={isQuickLoading || !quickQuery.trim()}
                className="absolute right-3 lg:right-4 p-3 lg:p-5 bg-indigo-600 text-white rounded-xl lg:rounded-3xl shadow-2xl hover:bg-indigo-500 transition-all active:scale-90 disabled:opacity-50"
              >
                {isQuickLoading ? <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 animate-spin" /> : <Send className="w-6 h-6 lg:w-7 lg:h-7" />}
              </button>
            </div>
          </form>

          {quickResult && (
             <div className="mt-8 lg:mt-12 p-8 lg:p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] lg:rounded-[3.5rem] animate-in zoom-in-95 duration-500 text-left mx-2 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <div className="w-6 h-6 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div> 
                  Brahma AI Synthesis
                </div>
                <p className="text-base lg:text-xl font-medium leading-relaxed text-slate-200">{quickResult}</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => setQuickResult(null)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Dismiss</button>
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">Save to Notebook <ArrowUpRight className="w-3 h-3" /></button>
                </div>
             </div>
          )}
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[180px] translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>
      </div>

      {/* Internship Updates Marquee-style Cards */}
      <section className="px-2 lg:px-0">
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Rocket className="w-7 h-7 text-indigo-600" />
              Fresh Internships
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct from Top Global Partners</p>
          </div>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline">View All <ArrowUpRight className="w-3 h-3" /></button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar px-4 lg:px-2">
          {internshipUpdates.map((intern, i) => (
            <div key={i} className="flex-none w-[280px] lg:w-[320px] bg-white border border-slate-200 p-6 lg:p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-16 h-16" />
              </div>
              <div className={`w-12 h-12 lg:w-14 lg:h-14 ${intern.bg} ${intern.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">{intern.company}</h4>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{intern.title}</h3>
                <div className="flex items-center gap-3 mt-3">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{intern.type}</span>
                   <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{intern.location}</span>
                </div>
              </div>
              <a 
                href={intern.link} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-900 text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 px-2 lg:px-0">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-indigo-600" />
                  Library Vault
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recently Sync’d Resources</p>
              </div>
            </div>
            
            <div className="flex gap-4 lg:gap-8 overflow-x-auto pb-6 no-scrollbar -mx-2 px-4 lg:px-2">
              {documents.length > 0 ? documents.slice(0, 6).map((doc) => (
                <div key={doc.id} className="flex-none w-44 lg:w-56 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="aspect-[3/4] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 mb-4 group-hover:-translate-y-3 transition-transform duration-700 relative">
                    <img src={doc.coverUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ArrowUpRight className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm lg:text-base line-clamp-1 px-1">{doc.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 px-1">{doc.category}</p>
                </div>
              )) : (
                <div className="w-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3.5rem] shadow-sm">
                   <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Documents Synced Yet</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Briefcase className="w-7 h-7 text-indigo-600" />
                  Career Opportunities
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobUpdates.map((job, idx) => (
                <div key={idx} className="group p-6 lg:p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 border-l-4 border-l-transparent hover:border-l-indigo-600">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${job.bg} ${job.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                      <job.icon className="w-7 h-7" />
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</div>
                  </div>
                  <h3 className="text-lg lg:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">{job.title}</h3>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                     <span>{job.company}</span>
                     <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                     <span>{job.location}</span>
                  </div>
                  <button className="mt-8 w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95">
                    View Details <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8 lg:space-y-10">
           <section className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16"></div>
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Newspaper className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Feed</h2>
              </div>
              <div className="space-y-8 relative z-10">
                 {[
                   { title: "Quantum Computing sets new records in lab", time: "1h ago", category: "Physics" },
                   { title: "AI regulation updates for 2025: What students need to know", time: "4h ago", category: "Ethics" },
                   { title: "The rise of Rust in embedded systems", time: "6h ago", category: "CS" },
                   { title: "Global economy shifts towards sustainable energy", time: "8h ago", category: "Economics" }
                 ].map((n, i) => (
                   <div key={i} className="group cursor-pointer">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{n.category}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.time}</p>
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm lg:text-base leading-snug">{n.title}</h3>
                      {i < 3 && <div className="h-px bg-slate-100 w-full mt-6"></div>}
                   </div>
                 ))}
              </div>
              <button className="mt-10 w-full py-4 border-2 border-slate-100 text-slate-400 text-[10px] font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest">Load More Feed</button>
           </section>

           {/* Newsletter / Subscription Call to action */}
           <section className="bg-indigo-600 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <Star className="w-8 h-8 text-yellow-300 mb-6" />
                <h3 className="text-2xl font-black mb-4 leading-tight">Stay Ahead of the Curve</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-8 opacity-90">Get weekly internship summaries and AI research digests directly in your vault.</p>
                <div className="relative group/mail">
                  <input type="email" placeholder="student@edu.com" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all text-sm font-bold placeholder:text-white/40" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Join</button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
