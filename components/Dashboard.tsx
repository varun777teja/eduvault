
import React, { useState } from 'react';
import {
  Briefcase,
  BookOpen,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Document } from '../types';
import { INTERNSHIPS, COURSES, AI_TOOLS } from '../constants/resources';
import PdfThumbnail from './PdfThumbnail';

interface DashboardProps {
  documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState<'internships' | 'courses' | 'ai'>('internships');

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] lg:rounded-[3.5rem] p-6 lg:p-16 text-white shadow-2xl border border-white/5 mx-2 lg:mx-0">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl lg:text-6xl font-black mb-6 lg:mb-8 tracking-tight leading-tight px-2">
            Knowledge, in <span className="text-indigo-400">sync</span>.
          </h1>
          <p className="text-slate-400 text-sm lg:text-lg font-medium max-w-xl mx-auto">
            Your centralized hub for academic resources, career opportunities, and cutting-edge tools.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[140px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Live Vault History Section */}
      <section className="px-2 lg:px-0">
        <div className="flex items-center justify-between mb-4 lg:mb-6 px-2">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 lg:gap-3">
              <img src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png" alt="Library" className="w-5 h-5 lg:w-6 lg:h-6 object-contain" />
              Live Vault History
            </h2>
            <p className="text-[9px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Library Feed</p>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 no-scrollbar -mx-2 px-4 lg:px-2">
          {documents.length > 0 ? documents.slice(0, 6).map((doc) => (
            <div key={doc.id} className="flex-none w-40 lg:w-48 group cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="aspect-[3/4] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-xl border border-white/20 mb-3 lg:mb-4 group-hover:-translate-y-2 transition-transform duration-500 relative bg-slate-100">
                <PdfThumbnail
                  fileUrl={doc.fileUrl || ''}
                  coverUrl={doc.coverUrl}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-[10px] text-white font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">Read Now</span>
                </div>
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

      {/* Resources Hub */}
      <div className="px-2 lg:px-0">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('internships')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'internships' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <Briefcase className="w-4 h-4" /> Internships
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <GraduationCap className="w-4 h-4" /> Top Courses
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            <img src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png" alt="AI" className="w-5 h-5 object-contain" /> AI Tools
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'internships' && INTERNSHIPS.map((item) => (
            <a href={item.link} target="_blank" rel="noopener noreferrer" key={item.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors">{item.domain}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{item.title}</h3>
              <p className="text-xs font-medium text-slate-500">{item.org}</p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Apply Now</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </a>
          ))}

          {activeTab === 'courses' && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-10">
              {['Government', 'Tech Giant', 'University'].map((category) => {
                const categoryCourses = COURSES.filter((c: any) => c.category === category);
                if (categoryCourses.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-orange-500" />
                      {category === 'Government' ? 'Indian Government & IITs' : category === 'Tech Giant' ? 'Global Tech Giants' : 'Prestigious Universities'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryCourses.map((item) => (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" key={item.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-orange-600 group-hover:text-white transition-colors">{item.domain}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-1">{item.title}</h3>
                          <p className="text-xs font-medium text-slate-500">{item.provider}</p>
                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 gap-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Start Learning</span>
                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'ai' && AI_TOOLS.map((item) => (
            <a href={item.link} target="_blank" rel="noopener noreferrer" key={item.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden p-2">
                  <img src="https://i.ibb.co/s9RWGZ5Q/Gemini-Generated-Image-laanrxlaanrxlaan-removebg-preview.png" alt="AI" className="w-full h-full object-contain" />
                </div>
                <span className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-colors">{item.purpose}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">{item.name}</h3>
              <p className="text-xs font-medium text-slate-500 italic">{item.tip}</p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Try Tool</span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
