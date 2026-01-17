
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Trash2, BookOpen, Clock, LayoutGrid, List, FileSearch, Sparkles,
  Plus, X, Upload, Loader2, Check, Camera, Zap, ArrowRight, ShieldCheck, ImagePlus,
  AlertTriangle, Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { scanDocumentImage, generateBookCover } from '../services/geminiService';

interface LibraryViewProps {
  documents: Document[];
  onRemove: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ documents, onRemove }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    content: '',
    coverUrl: ''
  });

  const categories = ['All', 'Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics', 'Literature', 'History', 'Engineering'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(localSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [documents, selectedCategory, localSearch]);

  const handleAiCover = async () => {
    if (!newDoc.title) return alert("Enter a title first");
    setIsGeneratingCover(true);
    try {
      const url = await generateBookCover(newDoc.title, newDoc.category);
      if (url) setNewDoc(prev => ({ ...prev, coverUrl: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content) return;
    const docToSave = { ...newDoc, id: Date.now().toString(), uploadDate: new Date().toISOString().split('T')[0], coverUrl: newDoc.coverUrl || `https://picsum.photos/seed/${newDoc.title}/300/400` };
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('documents').insert([{ user_id: user.id, title: docToSave.title, author: docToSave.author || 'Me', category: docToSave.category, content: docToSave.content, cover_url: docToSave.coverUrl }]);
        window.location.reload();
      }
    } else {
      const savedDocs = JSON.parse(localStorage.getItem('eduvault_docs') || '[]');
      localStorage.setItem('eduvault_docs', JSON.stringify([...savedDocs, docToSave]));
      window.location.reload();
    }
  };

  const confirmDelete = (id: string) => {
    onRemove(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in pb-32 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><BookOpen className="w-8 h-8 text-indigo-600" /> Knowledge Vault</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCameraActive(true)} className="flex items-center gap-2 px-6 py-3 bg-white border rounded-2xl font-black text-xs uppercase tracking-widest"><Camera className="w-4 h-4 text-indigo-600" /> Scan Notes</button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"><Plus className="w-4 h-4" /> Add Manually</button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all h-[400px] flex flex-col relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id); }}
              className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
              <img src={doc.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
              <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <button onClick={() => navigate(`/reader/${doc.id}`)} className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-xl"><BookOpen className="w-4 h-4" /> Start Reading</button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 truncate text-[16px]">{doc.title}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{doc.author}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.uploadDate}</span>
                 <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{doc.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-rose-100 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-2">Delete Book?</h2>
            <p className="text-slate-500 text-sm text-center mb-8">This action is irreversible and will remove all study history associated with this document.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => confirmDelete(confirmDeleteId)}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[3.5rem] p-10 lg:p-14 shadow-2xl overflow-hidden">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vault Entry</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
            </header>
            <form onSubmit={handleAddDocument} className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Title</label>
                    <input type="text" required value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Category</label>
                    <select value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold outline-none">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Book Cover</label>
                  <div className="flex-1 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 relative group overflow-hidden">
                    {newDoc.coverUrl ? (
                      <img src={newDoc.coverUrl} className="w-full h-full object-cover rounded-[2rem]" />
                    ) : (
                      <div className="text-center">
                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Cover Selected</span>
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={handleAiCover}
                      disabled={isGeneratingCover || !newDoc.title}
                      className="absolute bottom-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate with AI
                    </button>
                  </div>
                </div>
              </div>
              <textarea required value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})} className="w-full h-40 px-6 py-5 bg-slate-50 border rounded-[2rem] text-sm outline-none resize-none" placeholder="Paste document text..."></textarea>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl">Finalize Storage</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
