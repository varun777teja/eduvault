
import React, { useState, useMemo } from 'react';
import {
  BookOpen, Plus, X, ImagePlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface LibraryViewProps {
  documents: Document[];
  onRemove: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ documents, onRemove }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newDoc, setNewDoc] = useState<{
    title: string;
    author: string;
    category: string;
    content: string;
    coverUrl: string;
    fileUrl?: string; // Add this
  }>({
    title: '',
    author: '',
    category: 'Computer Science',
    content: '',
    coverUrl: '',
    fileUrl: ''
  });

  const categories = ['All', 'Computer Science', 'Physics', 'Biology', 'Chemistry', 'Mathematics', 'Literature', 'History', 'Engineering'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(localSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [documents, selectedCategory, localSearch]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || (!newDoc.content && !newDoc.fileUrl)) return; // Check for content OR PDF
    const docToSave = { ...newDoc, id: Date.now().toString(), uploadDate: new Date().toISOString().split('T')[0], coverUrl: newDoc.coverUrl || `https://picsum.photos/seed/${newDoc.title}/300/400`, fileUrl: newDoc.fileUrl };
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('documents').insert([{ user_id: user.id, title: docToSave.title, author: docToSave.author || 'Me', category: docToSave.category, content: docToSave.content, cover_url: docToSave.coverUrl, file_url: docToSave.fileUrl }]);
        window.location.reload();
      }
    } else {
      const savedDocs = JSON.parse(localStorage.getItem('eduvault_docs_v2') || '[]');
      localStorage.setItem('eduvault_docs_v2', JSON.stringify([...savedDocs, docToSave]));
      window.location.reload();
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in pb-32 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><BookOpen className="w-8 h-8 text-indigo-600" /> Knowledge Vault</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"><Plus className="w-4 h-4" /> Add Manually</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all h-[400px] flex flex-col">
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
                    <input type="text" required value={newDoc.title} onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Category</label>
                    <select value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold outline-none">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Import PDF (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewDoc({ ...newDoc, title: newDoc.title || file.name.replace('.pdf', ''), fileUrl: `/books/${file.name}` });
                            alert(`File selected! Please manually move "${file.name}" to the "public/books" folder for it to work locally.`);
                          } else {
                            setNewDoc({ ...newDoc, fileUrl: '' }); // Clear fileUrl if no file is selected
                          }
                        }}
                        className="w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-[10px] text-slate-400 mt-2 ml-2 italic">Note: For local use, place the file in public/books/ folder.</p>
                    </div>
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
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Content or Description</label>
                <textarea
                  value={newDoc.content}
                  onChange={e => setNewDoc({ ...newDoc, content: e.target.value })}
                  className="w-full h-40 px-6 py-5 bg-slate-50 border rounded-[2rem] text-sm outline-none resize-none"
                  placeholder="Paste document text or a brief description if utilizing a PDF..."
                  required={!newDoc.fileUrl} // Required only if no fileUrl is provided
                ></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl">Finalize Storage</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryView;
