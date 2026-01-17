
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Document } from '../types';

interface AIPageProps {
  documents: Document[];
}

const AIPage: React.FC<AIPageProps> = ({ documents }) => {
  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden items-center justify-center p-8">
      <div className="text-center animate-in fade-in zoom-in duration-1000">
        <div className="w-24 h-24 bg-white border border-slate-200 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Sparkles className="w-10 h-10 text-indigo-400 opacity-20" />
        </div>
        <h1 className="text-2xl font-black text-slate-300 tracking-tighter uppercase">AI Vault</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Intelligence modules cleared.</p>
      </div>
    </div>
  );
};

export default AIPage;
