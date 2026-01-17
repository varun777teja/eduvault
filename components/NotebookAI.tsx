
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit3, Save, 
  BookOpen, Wand2, Zap, ArrowRight, Loader2,
  ChevronRight, BrainCircuit, FileText, Search,
  X, Check, ChevronLeft
} from 'lucide-react';
import { Note } from '../types';
import { improveNoteContent, generateNoteSummary, generateFlashcards } from '../services/geminiService';

const NotebookAI: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiPortal, setShowAiPortal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  
  // Mobile view state: 'list' or 'editor'
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

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
    setMobileView('editor');
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
    if (activeNote?.id === id) {
        setActiveNote(null);
        setMobileView('list');
    }
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

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setMobileView('editor');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile when editor is active */}
      <div className={`w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
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
              onClick={() => selectNote(note)}
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

      {/* Main Editor - Hidden on mobile when list is active */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white relative transition-all ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
        {activeNote ? (
          <>
            <div className="p-4 lg:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setMobileView('list')} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <input 
                  value={activeNote.title}
                  onChange={e => updateActiveNote({ title: e.target.value })}
                  className="text-xl lg:text-3xl font-black text-slate-900 bg-transparent outline-none tracking-tighter flex-1 truncate"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 lg:p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl lg:rounded-2xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="hidden lg:block w-px h-6 bg-slate-200 mx-2"></div>
                <button 
                  disabled={isAiProcessing}
                  onClick={() => handleAiAction('improve')}
                  className="flex items-center gap-2 px-3 lg:px-5 py-2 lg:py-2.5 bg-indigo-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAiProcessing ? <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" /> : <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />}
                  <span className="hidden sm:inline">AI Improve</span>
                  <span className="sm:hidden">Improve</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 lg:p-20 overflow-y-auto custom-scrollbar">
              <textarea 
                value={activeNote.content}
                onChange={e => updateActiveNote({ content: e.target.value })}
                placeholder="Start writing..."
                className="w-full h-full text-base lg:text-xl text-slate-700 leading-relaxed outline-none resize-none placeholder:text-slate-300 font-serif pb-32"
              />
            </div>

            {/* AI Floating Toolbox - Adjusted for mobile position and scale */}
            <div className="fixed lg:absolute bottom-28 lg:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-slate-950 text-white rounded-full lg:rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-xl z-40 scale-90 lg:scale-100">
               <div className="flex items-center gap-2 px-2 lg:px-3 border-r border-white/10 mr-1 lg:mr-2">
                 <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-indigo-400">Notebook AI</span>
               </div>
               <button onClick={() => handleAiAction('summarize')} className="px-3 lg:px-4 py-2 hover:bg-white/10 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all">Summarize</button>
               <button onClick={() => handleAiAction('flashcards')} className="px-3 lg:px-4 py-2 hover:bg-white/10 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all">Flashcards</button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
             <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-50 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center mb-6 lg:mb-8 border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-slate-300" />
             </div>
             <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Select a Notebook</h2>
             <p className="text-slate-500 max-w-xs mt-2 text-sm lg:text-base">Open an existing note or create a new one to start working.</p>
             <button onClick={createNote} className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-full lg:rounded-[2rem] font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Start Writing</button>
          </div>
        )}
      </div>

      {/* AI Portal Overlay */}
      {showAiPortal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowAiPortal(false)}></div>
           <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 lg:-mr-32 lg:-mt-32"></div>
              <header className="flex items-center justify-between mb-6 lg:mb-8">
                 <div className="flex items-center gap-3">
                    <div>
                       <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tighter">AI Suggestion</h2>
                       <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Notebook Intelligence</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAiPortal(false)} className="p-2 lg:p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X className="w-5 h-5 lg:w-6 lg:h-6" /></button>
              </header>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl lg:rounded-[2rem] p-5 lg:p-8 max-h-[300px] lg:max-h-[400px] overflow-y-auto custom-scrollbar">
                 <p className="text-sm lg:text-base text-slate-800 leading-relaxed whitespace-pre-wrap">{aiSuggestions}</p>
              </div>
              <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row gap-3">
                 <button 
                  onClick={() => { updateActiveNote({ content: aiSuggestions || activeNote?.content }); setShowAiPortal(false); }}
                  className="flex-1 py-4 lg:py-5 bg-indigo-600 text-white rounded-2xl lg:rounded-[2rem] font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                 >
                   <Check className="w-4 h-4 lg:w-5 lg:h-5" /> Replace Content
                 </button>
                 <button 
                  onClick={() => setShowAiPortal(false)}
                  className="flex-1 py-4 lg:py-5 bg-slate-100 text-slate-900 rounded-2xl lg:rounded-[2rem] font-black text-[10px] lg:text-xs uppercase tracking-widest"
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
