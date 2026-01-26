
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [status, setStatus] = useState(message || "Synthesizing Library");
  const statuses = [
    "Analyzing Document Patterns",
    "Extracting Semantic Relationships",
    "Synthesizing Core Concepts",
    "Building Neural Research Map",
    "Generating Interactive Insights",
    "Finalizing Knowledge Graph"
  ];

  useEffect(() => {
    if (message) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatus(statuses[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [message]);

  const aiLogo = "https://i.ibb.co/6JbSBhjt/logobrahma.png";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-12">
        <div className="absolute inset-0 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-4 border-b-2 border-l-2 border-purple-500 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '6s' }}></div>
        
        <div className="relative w-28 h-28 bg-white rounded-[2.5rem] p-1.5 shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-float flex items-center justify-center border-4 border-slate-900 overflow-hidden">
          <img 
            src={aiLogo} 
            alt="Brahma AI" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2103/2103633.png";
            }}
          />
        </div>

        <div className="absolute -top-4 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/4 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
      </div>

      <div className="text-center relative z-10 px-6">
        <h2 className="text-white text-3xl font-black tracking-tighter mb-4 animate-pulse">Brahma Thinking</h2>
        <div className="flex flex-col items-center gap-2">
          <div className="px-5 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-blue-400 text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
            {status}
          </div>
          <div className="mt-4 flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" 
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <p className="absolute bottom-10 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
        Neural Processing Layer Active
      </p>
    </div>
  );
};

export default LoadingScreen;
