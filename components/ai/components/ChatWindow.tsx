
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Source, SourceType } from '../types';
import { gemini } from '../geminiService';
import { HighlightedText } from './LearningHub';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onAddSource: (source: Source) => void;
  isLoading: boolean;
}

declare const pdfjsLib: any;

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, onAddSource, isLoading }) => {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let content = file.type === 'application/pdf' ? await extractPdfText(file) : await file.text();
        if (content.trim()) {
          onAddSource({
            id: Math.random().toString(36).substr(2, 9),
            title: file.name,
            type: file.type === 'application/pdf' ? 'pdf' : 'text',
            content: content,
            selected: true
          });
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const aiIconUrl = "https://i.ibb.co/6JbSBhjt/logobrahma.png";

  return (
    <div className="flex flex-col h-full bg-white relative">
      {isUploading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-slate-800">Processing sources...</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar mobile-scroller p-4 md:p-6 lg:p-10 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
             <div className="w-20 h-20 mb-6 animate-float">
               <img src={aiIconUrl} alt="Brahma" className="w-full h-full object-contain" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Brahma Engine</h2>
             <p className="text-slate-500 text-base max-w-sm font-medium leading-relaxed">
               Ground your conversation in documents to get focused, accurate insights and pattern detection.
             </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex items-start gap-4 w-full md:max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 shadow-sm border ${
                  msg.role === 'user' ? 'bg-[#1a1c23]' : 'bg-white'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                  ) : (
                    <img src={aiIconUrl} alt="AI" className="w-full h-full object-contain p-0.5" />
                  )}
                </div>
                <div className={`flex-1 rounded-3xl px-6 py-5 ${
                  msg.role === 'user' ? 'bg-[#1a1c23] text-white' : 'bg-[#f4f4f5] text-slate-800'
                }`}>
                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.role === 'assistant' ? (
                      <HighlightedText text={msg.content} variant="blue" />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-4 items-start w-full">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border bg-white flex items-center justify-center animate-pulse">
                  <img src={aiIconUrl} alt="Thinking" className="w-full h-full object-contain p-0.5 opacity-30" />
                </div>
                <div className="bg-[#f4f4f5] rounded-3xl px-6 py-5 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6 bg-white shrink-0 border-t border-slate-50">
        <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto flex items-center gap-4">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.md" className="hidden" multiple />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-[#f4f4f5] text-slate-600 rounded-full shrink-0 flex items-center justify-center transition-all hover:bg-slate-200 active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          </button>
          
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#f4f4f5] border-none rounded-full py-4 pl-6 pr-14 outline-none placeholder:text-slate-500 text-sm md:text-base font-bold transition-all focus:bg-[#efeff0]"
              placeholder="Ask Brahma a question"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#d1d5db] text-slate-800 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 active:scale-90 shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
