
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Trash2, ExternalLink, BookOpen, 
  Clock, LayoutGrid, List, FileSearch, Sparkles,
  Plus, X, FileText, Upload, Loader2, Check,
  Camera, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { scanDocumentImage } from '../services/geminiService';

interface LibraryViewProps {
  documents: Document[];
  onRemove: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ documents, onRemove }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    content: ''
  });

  const categories = [
    'All', 'Computer Science', 'Physics', 'Biology', 
    'Chemistry', 'Mathematics', 'Literature', 'History', 'Engineering'
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                           doc.author.toLowerCase().includes(localSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [documents, selectedCategory, localSearch]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    stopCamera();

    try {
      const result = await scanDocumentImage(base64Image);
      setNewDoc({
        title: result.title || "Scanned Notes",
        category: result.category || "General",
        content: result.content || "",
        author: "AI Scan"
      });
      setIsAddModalOpen(true);
    } catch (err) {
      alert("AI Scanning failed. Please try again or upload manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setNewDoc(prev => ({ ...prev, title: file.name.replace('.pdf', '').replace('.txt', '') }));
    
    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedarray = new Uint8Array(reader.result as ArrayBuffer);
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
          }
          setNewDoc(prev => ({ ...prev, content: fullText }));
          setIsUploading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const text = await file.text();
        setNewDoc(prev => ({ ...prev, content: text }));
        setIsUploading(false);
      }
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content) return;

    const docToSave = {
      ...newDoc,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0],
      coverUrl: `https://picsum.photos/seed/${newDoc.title.substring(0, 5)}/300/400`
    };

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('documents').insert([{
            user_id: user.id,
            title: docToSave.title,
            author: docToSave.author || 'Me',
            category: docToSave.category,
            content: docToSave.content,
            cover_url: docToSave.coverUrl
          }]);
          if (error) throw error;
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const savedDocs = JSON.parse(localStorage.getItem('eduvault_docs') || '[]');
      localStorage.setItem('eduvault_docs', JSON.stringify([...savedDocs, docToSave]));
      window.location.reload();
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 pb-32 max-w-7xl mx-auto relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Knowledge Vault
          </h1>
          <p className="text-slate-500 font-medium mt-1">Intelligent document management for elite students.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <Camera className="w-4 h-4 text-indigo-600" /> Scan Notes
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Manually
          </button>
        </div>
      </header>

      {cameraActive && (
        <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none border-[30px] border-slate-950/40"></div>
              {/* Scanning Laser Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_#818cf8] animate-[scan_2.5s_ease-in-out_infinite]"></div>
              
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> AI Document Scanner Active
              </div>

              <div className="absolute bottom-10 left-0 w-full px-10 flex items-center justify-between">
                <button onClick={stopCamera} className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={captureAndScan}
                  disabled={isScanning}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-indigo-100 disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /> : <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Zap className="w-8 h-8" /></div>}
                </button>
                <div className="w-14"></div> {/* Spacer */}
              </div>
           </div>
           <canvas ref={canvasRef} className="hidden" />
           <p className="mt-8 text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Align notes within frame for best results</p>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl mr-1">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><LayoutGrid className="w-5 h-5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><List className="w-5 h-5" /></button>
            </div>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className={`flex items-center transition-all duration-500 overflow-hidden ${isSearchVisible ? 'max-w-md ml-2' : 'max-w-0 ml-0'}`}>
              <input type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search vault..." className="w-64 lg:w-80 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white outline-none" />
              <button onClick={() => { setLocalSearch(''); setIsSearchVisible(false); }} className="ml-2 p-2 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            {!isSearchVisible && <button onClick={() => setIsSearchVisible(true)} className="p-3 text-slate-400 hover:text-indigo-600"><Search className="w-6 h-6" /></button>}
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-8`}>
            {filteredDocs.map((doc) => (
              <div key={doc.id} className={`group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 flex ${viewMode === 'list' ? 'flex-row h-44' : 'flex-col'}`}>
                <div className={`relative ${viewMode === 'list' ? 'w-44' : 'aspect-[3/4]'} bg-slate-100 overflow-hidden shrink-0`}>
                  <img src={doc.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-indigo-900/40 flex items-center justify-center transition-all">
                    <button onClick={() => navigate(`/reader/${doc.id}`)} className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                      <BookOpen className="w-4 h-4" /> Start Reading
                    </button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 line-clamp-2 text-[16px] group-hover:text-indigo-600 transition-colors leading-tight">{doc.title}</h3>
                      <button onClick={() => onRemove(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{doc.author}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.uploadDate}</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-500">{doc.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white border border-slate-100 rounded-[3rem] shadow-inner">
            <FileSearch className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-300 tracking-tight">Empty Vault Section</h3>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl animate-in fade-in" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[3.5rem] p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden border border-white/20">
            <header className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vault Entry</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Initialize new study resource</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
            </header>

            <form onSubmit={handleAddDocument} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block px-1">Resource Title</label>
                    <input type="text" required value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block px-1">Academic Category</label>
                    <select value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[15px] font-bold focus:bg-white focus:border-indigo-400 outline-none transition-all">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block px-1">Source File</label>
                  <div className="flex-1 relative group">
                    <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="h-full border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-8 bg-slate-50 group-hover:bg-indigo-50/50 group-hover:border-indigo-200 transition-all text-center">
                      {isUploading ? (
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      ) : newDoc.content ? (
                        <div className="animate-in zoom-in duration-300">
                           <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-sm"><Check className="w-8 h-8" /></div>
                           <span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Document Parsed</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Drop PDF or Click to Select</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 block px-1">Raw Content Analysis</label>
                <textarea required value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})} className="w-full h-40 px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-[14px] font-medium focus:bg-white outline-none resize-none custom-scrollbar" placeholder="Analysis of the document content will appear here..."></textarea>
              </div>

              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                 Finalize Storage <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LibraryView;
