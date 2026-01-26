
import React, { useState, useRef } from 'react';
import { Source, SourceType } from '../types';
import { gemini } from '../geminiService';

interface SidebarProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onDeleteSource: (id: string) => void;
  onToggleSource: (id: string) => void;
  onRefreshInsights: () => void;
  isLoading: boolean;
  apiError?: string | null;
  onClose?: () => void;
}

declare const pdfjsLib: any;

const Sidebar: React.FC<SidebarProps> = ({ sources, onAddSource, onDeleteSource, onToggleSource, onRefreshInsights, isLoading, apiError, onClose }) => {
  const [newSourceText, setNewSourceText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'text' | 'file' | 'youtube'>('file');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = sources.filter(s => s.selected).length;

  const handleSelectAll = () => {
    sources.forEach(s => { if (!s.selected) onToggleSource(s.id); });
  };

  const handleClearAll = () => {
    sources.forEach(s => { if (s.selected) onToggleSource(s.id); });
  };

  const handleAddQuickText = () => {
    if (!newSourceText.trim()) return;
    onAddSource({
      id: Math.random().toString(36).substr(2, 9),
      title: "Note: " + (newSourceText.split('\n')[0].substring(0, 20) || "Untitled"),
      type: 'text',
      content: newSourceText,
      selected: true
    });
    setNewSourceText('');
    setShowAddModal(false);
  };

  const handleAddYoutube = async () => {
    if (!youtubeUrl.trim()) return;
    setIsProcessingFile(true);
    try {
      const result = await gemini.processYouTubeUrl(youtubeUrl);
      onAddSource({
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || "YouTube Video",
        type: 'youtube',
        content: result.transcript,
        selected: true,
        metadata: { url: youtubeUrl }
      });
      setYoutubeUrl('');
      setShowAddModal(false);
    } catch (error) {
      console.error("YouTube processing error:", error);
      alert("Failed to analyze YouTube video. Check URL or try again.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (e) {
      console.error("PDF Extraction error", e);
      return "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Fixed the handleFileChange function to explicitly type the files array as File[] to resolve TS unknown errors
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const files = Array.from(fileList) as File[];

    setIsProcessingFile(true);
    try {
      for (const file of files) {
        let content = '';
        let type: SourceType = 'text';
        let originalData = '';

        if (file.type === 'application/pdf') {
          content = await extractPdfText(file);
          originalData = await fileToBase64(file);
          type = 'pdf';
        } else {
          content = await file.text();
          type = 'text';
        }

        if (content.trim()) {
          onAddSource({
            id: Math.random().toString(36).substr(2, 9),
            title: file.name,
            type: type,
            content: content,
            selected: true,
            originalData: originalData
          });
        }
      }
      setShowAddModal(false);
    } catch (error) {
      console.error("Batch processing error:", error);
      alert("Some files could not be ingested.");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getSourceIcon = (type: SourceType) => {
    switch(type) {
      case 'pdf': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
      case 'youtube': return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>;
      case 'text': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
      default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>;
    }
  };

  return (
    <aside className="w-[85vw] md:w-72 h-full flex flex-col bg-[#fcfdfe] border-r border-slate-200 shrink-0">
      <div className="p-5 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Library</h2>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">{selectedCount} Sources Active</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleSelectAll} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">Select All</button>
          <div className="w-[1px] h-3 bg-slate-200 my-auto"></div>
          <button onClick={handleClearAll} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600">Clear</button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-pulse">
            <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest leading-relaxed">
              {apiError}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-6">
          {sources.length === 0 ? (
            <div className="text-center py-20 px-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library Empty</p>
            </div>
          ) : (
            sources.map(source => (
              <div 
                key={source.id} 
                onClick={() => onToggleSource(source.id)}
                className={`group relative bg-white p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  source.selected 
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500/5' 
                    : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  source.selected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-slate-50'
                }`}>
                  {source.selected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={source.selected ? 'text-blue-600' : 'text-slate-400'}>{getSourceIcon(source.type)}</span>
                    <h3 className="text-xs font-bold text-slate-700 truncate">{source.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteSource(source.id); }}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-5 bg-white border-t border-slate-100">
        <button 
          onClick={onRefreshInsights}
          disabled={selectedCount < 1 || isLoading}
          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-30 shadow-xl"
        >
          {isLoading ? 'Syncing...' : 'Re-Analyze Selection'}
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-md p-0 md:p-4">
          <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Knowledge</h3>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex bg-slate-50/50">
              {['file', 'youtube', 'text'].map(t => (
                <button 
                  key={t}
                  onClick={() => setModalTab(t as any)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${modalTab === t ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-8">
              {modalTab === 'file' && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group text-center"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <p className="font-black text-slate-900 tracking-tight uppercase text-xs">Drop Research PDF</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2">Max 28k characters per batch</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".pdf,.txt,.md" className="hidden" />
                </div>
              )}

              {modalTab === 'youtube' && (
                <div className="animate-fade-in space-y-6">
                  <input 
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm"
                  />
                  <button 
                    onClick={handleAddYoutube}
                    disabled={!youtubeUrl.trim() || isProcessingFile}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-600 disabled:opacity-20 transition-all"
                  >
                    Ingest Video Transcript
                  </button>
                </div>
              )}

              {modalTab === 'text' && (
                <div className="animate-fade-in space-y-6">
                  <textarea 
                    value={newSourceText}
                    onChange={(e) => setNewSourceText(e.target.value)}
                    placeholder="Paste research notes or raw text here..."
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium text-sm"
                  ></textarea>
                  <button 
                    onClick={handleAddQuickText}
                    disabled={!newSourceText.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-600 disabled:opacity-20 transition-all"
                  >
                    Import Text
                  </button>
                </div>
              )}
            </div>

            {isProcessingFile && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Neural Framing</h4>
                <p className="text-xs text-slate-500 mt-2">Integrating knowledge into semantic layer...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
