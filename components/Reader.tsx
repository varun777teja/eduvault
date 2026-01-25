
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import { Document } from '../types';

interface ReaderProps {
  documents: Document[];
}

const Reader: React.FC<ReaderProps> = ({ documents }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = documents.find(d => d.id === id);

  const [isFocusMode, setIsFocusMode] = useState(false);

  if (!doc) return <div className="h-screen flex items-center justify-center text-slate-400">Document not found.</div>;

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden bg-slate-50">
      <div className={`flex-1 flex flex-col bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-700 ${isFocusMode ? 'lg:mx-32' : ''}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-black text-slate-900 truncate max-w-sm">{doc.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50"><Maximize2 className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-slate-50/20 relative">
          {doc.fileUrl ? (
            <iframe
              src={doc.fileUrl}
              className="w-full h-full border-0"
              title={doc.title}
            />
          ) : (
            <div className="h-full overflow-y-auto p-6 sm:p-12 lg:p-20 custom-scrollbar">
              <div className="max-w-3xl mx-auto bg-white p-8 sm:p-14 lg:p-20 shadow-2xl rounded-[3rem] border border-slate-100 min-h-full">
                <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-serif">
                  {doc.content}
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reader;
