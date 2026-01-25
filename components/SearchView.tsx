
import React, { useState, useMemo } from 'react';
import {
  Search, Book, Briefcase,
  Cpu, ArrowRight, History, TrendingUp,
  FileText, GraduationCap, ExternalLink, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';

interface SearchViewProps {
  documents: Document[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ documents, searchTerm, onSearchChange }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'docs' | 'careers'>('all');

  // Simulated search history
  const history = ['Quantum State', 'Feynman Lectures', 'React Internships', 'Literature Notes'];

  const filteredDocs = useMemo(() => {
    if (!searchTerm) return [];
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const jobSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return [
      { title: "AI Intern", company: "BrainLab", type: "Remote" },
      { title: "Content Writer", company: "Edutext", type: "Full-time" },
      { title: "Software Engineer", company: "AI EduVault", type: "Hybrid" }
    ].filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm.toLowerCase().includes('job') || searchTerm.toLowerCase().includes('career'));
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Search Header (Mobile Only) */}
      <div className="lg:hidden mb-8">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents, concepts, jobs..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-lg font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      {!searchTerm ? (
        <div className="space-y-12 py-10">
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Recent Searches
            </h2>
            <div className="flex flex-wrap gap-3">
              {history.map(item => (
                <button
                  key={item}
                  onClick={() => onSearchChange(item)}
                  className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center gap-2 group"
                >
                  {item}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Trending in AI EduVault
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Generative AI in Physics', count: '1.2k views', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Internship Guide 2025', count: '850 views', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Mastering React', count: '2.4k views', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50' }
              ].map((item, idx) => (
                <button key={idx} onClick={() => onSearchChange(item.label)} className="p-6 bg-white border border-slate-100 rounded-3xl text-left hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all group">
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-slate-900 leading-tight mb-1">{item.label}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.count}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Advanced Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
            {[
              { id: 'all', label: 'All Results', icon: Filter },
              { id: 'docs', label: 'Vault Documents', icon: FileText },
              { id: 'careers', label: 'Opportunities', icon: Briefcase }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[500px]">
            {(activeTab === 'all' || activeTab === 'docs') && (
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Matching Documents
                  </h2>
                  <span className="text-[10px] font-black text-slate-400">{filteredDocs.length} Found</span>
                </div>

                {filteredDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => navigate(`/reader/${doc.id}`)}
                        className="group bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer flex gap-4 items-center"
                      >
                        <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100">
                          <img src={doc.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{doc.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{doc.author}</p>
                          <div className="mt-3 inline-flex px-2 py-0.5 bg-slate-50 rounded text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {doc.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">No matching documents in your vault.</p>
                    <button className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Upload "{searchTerm}"</button>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'careers') && (
              <div className="lg:col-span-4 space-y-8">
                <section>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Career Match
                  </h2>
                  <div className="space-y-4">
                    {jobSuggestions.length > 0 ? jobSuggestions.map((job, i) => (
                      <div key={i} className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{job.company} • {job.type}</p>
                      </div>
                    )) : (
                      <div className="p-8 bg-slate-50 rounded-[2rem] text-center border border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching careers</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
