
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit3, Save, 
  BookOpen, Wand2, Zap, ArrowRight, Loader2,
  ChevronRight, BrainCircuit, FileText, Search,
  X, Check
} from 'lucide-react';
import { Note } from '../types';
import { improveNoteContent, generateNoteSummary, generateFlashcards } from '../services/geminiService';

const NotebookAI: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiPortal, setShowAiPortal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('eduvault_notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('eduvault_notes', JSON.stringify(updated));
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Study Note',
      content: '',
      lastEdited: new Date().toISOString(),
      category: 'General',
      tags: []
    };
    saveNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...updates, lastEdited: new Date().toISOString() };
    setActiveNote(updated);
    saveNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeNote?.id === id) setActiveNote(null);
  };

  const handleAiAction = async (action: 'improve' | 'summarize' | 'flashcards') => {
    if (!activeNote || !activeNote.content) return;
    setIsAiProcessing(true);
    setAiSuggestions(null);
    try {
      if (action === 'improve') {
        const result = await improveNoteContent(activeNote.content, "Make this note more professional and academic.");
        setAiSuggestions(result);
      } else if (action === 'summarize') {
        const result = await generateNoteSummary(activeNote.content);
        setAiSuggestions(result || "Could not generate summary.");
      } else if (action === 'flashcards') {
        const result = await generateFlashcards(activeNote.content);
        setAiSuggestions(JSON.stringify(result, null, 2));
      }
      setShowAiPortal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" /> Notebook AI
          </h2>
          <button onClick={createNote} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          {notes.map(note => (
            <button 
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`w-full text-left p-4 rounded-3xl transition-all border ${activeNote?.id === note.id ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-100'}`}
            >
              <h3 className={`font-bold text-sm mb-1 truncate ${activeNote?.id === note.id ? 'text-white' : 'text-slate-900'}`}>{note.title}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${activeNote?.id === note.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(note.lastEdited).toLocaleDateString()}
              </p>
            </button>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-20 opacity-30">
               <FileText className="w-8 h-8 mx-auto mb-2" />
               <p className="text-xs font-black uppercase tracking-widest">No Notes Yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {activeNote ? (
          <>
            <div className="p-6 lg:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
              <input 
                value={activeNote.title}
                onChange={e => updateActiveNote({ title: e.target.value })}
                className="text-3xl font-black text-slate-900 bg-transparent outline-none tracking-tighter flex-1 mr-4"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button 
                  disabled={isAiProcessing}
                  onClick={() => handleAiAction('improve')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAiProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI Improve
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-10 lg:p-20 overflow-y-auto custom-scrollbar">
              <textarea 
                value={activeNote.content}
                onChange={e => updateActiveNote({ content: e.target.value })}
                placeholder="Start writing your research notes here..."
                className="w-full h-full text-xl text-slate-700 leading-relaxed outline-none resize-none placeholder:text-slate-300 font-serif"
              />
            </div>

            {/* AI Floating Toolbox */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-slate-950 text-white rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-2">
                 <img src="https://i.ibb.co/TBWnWGyv/image.png" className="w-5 h-5 brightness-0 invert" alt="AI" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Notebook AI</span>
               </div>
               <button onClick={() => handleAiAction('summarize')} className="px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Summarize</button>
               <button onClick={() => handleAiAction('flashcards')} className="px-4 py-2 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Flashcards</button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select a Notebook</h2>
             <p className="text-slate-500 max-w-xs mt-2">Open an existing note or create a new one to start working with your AI academic assistant.</p>
             <button onClick={createNote} className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Start Writing</button>
          </div>
        )}
      </div>

      {/* AI Portal Overlay */}
      {showAiPortal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowAiPortal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <header className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-2.5">
                       <img src="https://i.ibb.co/TBWnWGyv/image.png" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-900 tracking-tighter">AI Suggestion</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notebook Intelligence</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAiPortal(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><X className="w-6 h-6" /></button>
              </header>
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                 <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{aiSuggestions}</p>
              </div>
              <div className="mt-8 flex gap-3">
                 <button 
                  onClick={() => { updateActiveNote({ content: aiSuggestions || activeNote?.content }); setShowAiPortal(false); }}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                 >
                   <Check className="w-5 h-5" /> Replace Content
                 </button>
                 <button 
                  onClick={() => setShowAiPortal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest"
                 >
                   Dismiss
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NotebookAI;
