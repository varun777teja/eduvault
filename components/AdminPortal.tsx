
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Database, Globe, Lock, 
  Trash2, Edit3, Search, Filter,
  CheckCircle2, AlertTriangle, ArrowLeft,
  ChevronRight, MoreVertical, BookOpen,
  ArrowUpRight, Download, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types.ts';
import { supabase } from '../services/supabase.ts';

interface AdminPortalProps {
  documents: Document[];
  onRemove: (id: string) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ documents, onRemove }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  const stats = useMemo(() => ({
    total: documents.length,
    public: documents.filter(d => (d as any).is_public).length,
    private: documents.filter(d => !(d as any).is_public).length,
  }), [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'public' && (d as any).is_public) || 
                           (filter === 'private' && !(d as any).is_public);
      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  const togglePublicStatus = async (doc: Document) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_public: !(doc as any).is_public })
        .eq('id', doc.id);
      
      if (error) throw error;
      window.location.reload(); // Refresh to sync
    } catch (err) {
      alert("Failed to update status. Check Admin permissions.");
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-6 lg:p-12 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <ShieldAlert className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Admin Terminal</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Global Library Command & Control</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
           {[
             { label: 'Total Books', val: stats.total, icon: Database, color: 'text-indigo-400' },
             { label: 'Public Hub', val: stats.public, icon: Globe, color: 'text-emerald-400' },
             { label: 'Vault Items', val: stats.private, icon: Users, color: 'text-amber-400' }
           ].map((s, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{s.label}</span>
                </div>
                <p className="text-xl font-black">{s.val}</p>
             </div>
           ))}
        </div>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center gap-6 justify-between bg-white/[0.02]">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Query database..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === 'all' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('public')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === 'public' ? 'bg-emerald-50 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Public
              </button>
              <button 
                onClick={() => setFilter('private')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === 'private' ? 'bg-indigo-50 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Vault
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01]">
                   <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Document</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Author</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Visibility</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Created</th>
                   <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.03] transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-white/10">
                              <img src={doc.coverUrl} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{doc.title}</p>
                              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">{doc.category}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-sm text-slate-400 font-medium">{doc.author}</td>
                     <td className="px-8 py-6">
                        <button 
                          onClick={() => togglePublicStatus(doc)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                            (doc as any).is_public 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {(doc as any).is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {(doc as any).is_public ? 'Public Library' : 'Private Vault'}
                        </button>
                     </td>
                     <td className="px-8 py-6 text-xs text-slate-500 font-mono">{doc.uploadDate}</td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button className="p-2 text-slate-500 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                           <button 
                             onClick={() => onRemove(doc.id)}
                             className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
        
        {filteredDocs.length === 0 && (
          <div className="p-20 text-center">
             <Database className="w-12 h-12 text-slate-800 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No entries match your query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
