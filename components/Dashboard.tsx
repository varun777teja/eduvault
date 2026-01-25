
import React from 'react';
import {
  Briefcase,
  Cpu, BookOpen,
  TrendingUp, Newspaper
} from 'lucide-react';
import { Document } from '../types';

interface DashboardProps {
  documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      {/* Hero Section - Optimized for Mobile */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] lg:rounded-[3.5rem] p-6 lg:p-16 text-white shadow-2xl border border-white/5 mx-2 lg:mx-0">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl lg:text-6xl font-black mb-6 lg:mb-8 tracking-tight leading-tight px-2">
            Knowledge, in <span className="text-indigo-400">sync</span>.
          </h1>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[140px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-2 lg:px-0">
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 lg:mb-6 px-2">
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 lg:gap-3">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                  Live Vault History
                </h2>
                <p className="text-[9px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Library Feed</p>
              </div>
            </div>

            <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 no-scrollbar -mx-2 px-4 lg:px-2">
              {documents.length > 0 ? documents.slice(0, 6).map((doc) => (
                <div key={doc.id} className="flex-none w-40 lg:w-48 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="aspect-[3/4] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 mb-3 lg:mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                    <img src={doc.coverUrl} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs lg:text-sm line-clamp-1">{doc.title}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.category}</p>
                </div>
              )) : (
                <div className="w-full py-12 lg:py-16 text-center bg-white border border-dashed border-slate-200 rounded-[2rem] lg:rounded-[3rem]">
                  <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-slate-200 mx-auto mb-3 lg:mb-4" />
                  <p className="text-[9px] lg:text-xs font-black text-slate-300 uppercase tracking-widest">No Documents Synced</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 lg:mb-6 px-2">
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 lg:gap-3">
                  <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                  Career Ops
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Junior Frontend Engineer",
                  company: "TechFlow",
                  type: "Full-time",
                  location: "Remote",
                  icon: Briefcase,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                  link: "https://example.com/jobs/frontend"
                },
                {
                  title: "AI Research Assistant",
                  company: "DeepMind Lab",
                  type: "Internship",
                  location: "London",
                  icon: Cpu,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                  link: "https://deepmind.google/careers/"
                },
                {
                  title: "Data Analyst Fellow",
                  company: "DataCorp",
                  type: "Fellowship",
                  location: "New York",
                  icon: TrendingUp,
                  color: "text-orange-500",
                  bg: "bg-orange-50",
                  link: "https://example.com/careers/data"
                },
              ].map((job, idx) => (
                <div key={idx} className="group p-5 lg:p-6 bg-white border border-slate-200 rounded-[2rem] lg:rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="flex items-start justify-between mb-4 lg:mb-6">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 ${job.bg} ${job.color} rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <job.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wide">{job.type}</span>
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{job.title}</h3>
                  <p className="text-xs lg:text-sm font-medium text-slate-500 mt-1">{job.company} • {job.location}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          <section className="bg-white border border-slate-200 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 rounded-xl lg:rounded-2xl flex items-center justify-center">
                <Newspaper className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
              </div>
              <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">Intelligence</h2>
            </div>
            <div className="space-y-6">
              {[
                { title: "Quantum Computing sets new records in lab", time: "1h ago" },
                { title: "AI regulation updates for 2025", time: "4h ago" }
              ].map((n, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-[8px] lg:text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{n.time}</p>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-xs lg:text-sm">{n.title}</h3>
                  <div className="h-px bg-slate-50 w-full mt-5 lg:mt-6"></div>
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
