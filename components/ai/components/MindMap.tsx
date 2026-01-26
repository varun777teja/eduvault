
import React, { useEffect, useRef, useState } from 'react';
import { MindMapData, MindMapNode, RoadmapStep } from '../types';
import { HighlightedText } from './LearningHub';

interface MindMapProps {
  data: MindMapData | null;
}

// Enhanced component to handle text descriptions and extract/format links as high-fidelity resource cards
const RoadmapContent: React.FC<{ step: RoadmapStep }> = ({ step }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = step.description.match(urlRegex) || [];
  
  let cleanDescription = step.description;
  urls.forEach(url => {
    cleanDescription = cleanDescription.replace(url, '').trim();
  });

  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

  return (
    <div className="space-y-4">
      <div className="text-slate-300 text-[12px] leading-relaxed font-medium opacity-90">
        <HighlightedText text={cleanDescription} variant="blue" className="text-slate-200" />
      </div>

      {/* Resource Grid */}
      {urls.length > 0 && (
        <div className="grid gap-3 mt-4">
          {urls.map((url, idx) => {
            const yt = isYouTube(url);
            return (
              <a 
                key={idx}
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group/link relative flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden ${
                  yt 
                  ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10' 
                  : 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10'
                }`}
              >
                {/* Background Glow */}
                <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover/link:opacity-20 transition-opacity ${yt ? 'bg-red-500' : 'bg-blue-500'}`}></div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover/link:rotate-6 ${
                  yt ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {yt ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${yt ? 'text-red-400' : 'text-blue-400'}`}>
                    {yt ? 'Watch Analysis' : 'Expand Research'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-full font-mono font-medium">{url.replace('https://', '')}</p>
                </div>
                
                <div className={`opacity-0 group-hover/link:opacity-100 transition-opacity translate-x-4 group-hover/link:translate-x-0 transition-transform ${yt ? 'text-red-400' : 'text-blue-400'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const width = 1200;
  const height = 1000;

  useEffect(() => {
    if (data && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({
        x: (rect.width / 2) - (width / 2),
        y: (rect.height / 2) - (height / 2)
      });
    }
  }, [data]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.ui-element')) return; 
    
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLastPos({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - lastPos.x;
    const dy = clientY - lastPos.y;
    
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: clientX, y: clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  const resetView = () => {
    setScale(1);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOffset({
        x: (rect.width / 2) - (width / 2),
        y: (rect.height / 2) - (height / 2)
      });
    }
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#f8fafc]">
        <div className="w-24 h-24 bg-white rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-center mb-8 animate-float">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter">Neural Research Graph</h2>
        <p className="text-slate-500 max-w-sm text-sm font-semibold opacity-80 leading-relaxed">
          Mapping the semantic relationships within your library to unlock latent knowledge patterns.
        </p>
      </div>
    );
  }

  const nodes = data.nodes || [];
  const links = data.links || [];

  const positionedNodes = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const radius = nodes.length > 5 ? 320 : 220;
    return {
      ...node,
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle)
    };
  });

  return (
    <div className="h-full bg-slate-950 relative overflow-hidden select-none touch-none">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: `translate(${offset.x % 40}px, ${offset.y % 40}px)`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>

      {/* Graph HUD */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 px-6 py-4 rounded-[2rem] shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h3 className="text-white font-black text-sm tracking-tight">Intelligence Map</h3>
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">{nodes.length} Nodes Identified</p>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <div 
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <svg width={width} height={height} className="block overflow-visible">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Links */}
            {links.map((link, i) => {
              const source = positionedNodes.find(n => n.id === link.source);
              const target = positionedNodes.find(n => n.id === link.target);
              if (!source || !target) return null;
              const isActive = selectedNode?.id === source.id || selectedNode?.id === target.id;
              return (
                <line 
                  key={i}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  stroke={isActive ? '#3b82f6' : '#1e293b'}
                  strokeWidth={isActive ? '3' : '1.5'}
                  strokeDasharray={isActive ? '0' : '4 4'}
                  className="transition-all duration-500"
                  opacity={isActive ? 1 : 0.4}
                />
              );
            })}

            {/* Nodes */}
            {positionedNodes.map((node) => {
              const isActive = selectedNode?.id === node.id;
              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer group"
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                >
                  <circle 
                    cx={node.x} cy={node.y} 
                    r={12 + (node.importance || 5) * 2.5}
                    fill={isActive ? '#60a5fa' : (node.group === 1 ? '#3b82f6' : '#8b5cf6')}
                    className="transition-all duration-300 group-hover:brightness-125"
                    filter="url(#glow)"
                    stroke={isActive ? '#fff' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isActive ? '4' : '2'}
                  />
                  <text 
                    x={node.x} y={node.y + 55 + (node.importance || 5) * 2}
                    textAnchor="middle"
                    fill={isActive ? '#fff' : '#94a3b8'}
                    fontSize="13"
                    fontWeight="900"
                    className="pointer-events-none uppercase tracking-[0.1em] transition-all opacity-80 group-hover:opacity-100"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side HUD Elements */}
      <div className="absolute inset-y-0 right-0 pointer-events-none p-8 flex flex-col items-end gap-6 z-30">
        
        {/* Roadmap Trigger */}
        <button 
          onClick={() => setShowRoadmap(!showRoadmap)}
          className="ui-element pointer-events-auto group relative flex items-center gap-4 px-8 py-5 bg-white text-slate-950 rounded-[2.2rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L10 7l6-3 5.447 2.724a1 1 0 01.553.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z"></path></svg>
             {showRoadmap ? 'Close Intelligence Path' : 'Evolving Roadmap'}
          </div>
        </button>

        {/* Roadmap Detailed Sidebar */}
        {showRoadmap && data.roadmap && (
          <div className="ui-element pointer-events-auto w-[90vw] md:w-[24rem] h-[82vh] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 shadow-[0_50px_150px_rgba(0,0,0,0.9)] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between mb-10 shrink-0">
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"></span>
                  Neural Path
                </h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">Synthesis Protocol v2.4</p>
              </div>
              <button onClick={() => setShowRoadmap(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-16 py-4">
              {data.roadmap.map((step, i) => (
                <div key={i} className="relative group">
                  {/* Neural Connector Line */}
                  {i < data.roadmap.length - 1 && (
                    <div className={`absolute top-12 bottom-[-64px] left-[20px] w-0.5 ${
                      step.isFuture 
                      ? 'bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent border-l border-dashed border-emerald-500/20' 
                      : 'bg-gradient-to-b from-blue-500 to-slate-800'
                    }`}></div>
                  )}
                  
                  {/* Neural Point */}
                  <div className={`absolute top-0 left-0 w-10 h-10 rounded-2xl border-4 border-slate-950 shadow-2xl z-20 flex items-center justify-center text-[11px] font-black transition-transform group-hover:scale-110 ${
                    step.isFuture ? 'bg-emerald-500 text-slate-950' : 'bg-blue-600 text-white'
                  }`}>
                    {i + 1}
                  </div>
                  
                  <div className="pl-16 space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h5 className={`font-black text-sm uppercase tracking-wider leading-tight ${
                          step.isFuture ? 'text-emerald-400' : 'text-blue-400'
                        }`}>
                          {step.title}
                        </h5>
                        {step.isFuture && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">LATEST</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {step.topics.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white/5 rounded-lg text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/5 group-hover:border-white/10 transition-colors">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 group-hover:bg-white/10 transition-all">
                       <RoadmapContent step={step} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5 shrink-0">
              <div className="p-6 bg-blue-600/5 rounded-[2.5rem] border border-blue-600/20 flex gap-5 items-center group/forecast">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl group-hover/forecast:rotate-12 transition-transform">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1">Forecast Active</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed opacity-80">
                    Neural layer is continuously scanning global research databases for supplementary context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Node Focus Card */}
        {selectedNode && (
          <div className="ui-element pointer-events-auto w-[90vw] md:w-[22rem] bg-white rounded-[4rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.1)] animate-scale-in border border-slate-100 flex flex-col">
             <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-900/30">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-.886l-.548-.547z"></path></svg>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             
             <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-3 uppercase leading-none">{selectedNode.label}</h4>
             <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 transition-all duration-1000 ease-out" style={{ width: `${selectedNode.importance * 10}%` }}></div>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Weight: {selectedNode.importance}/10</span>
             </div>

             <div className="space-y-6 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Core Dimensions</p>
                {selectedNode.keyPoints.map((point, i) => (
                  <div key={i} className="flex gap-5 items-start group/point">
                    <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black shrink-0 transition-colors group-hover/point:bg-blue-600 group-hover/point:text-white shadow-sm">0{i+1}</div>
                    <div className="text-sm font-bold text-slate-700 leading-relaxed pt-1.5 opacity-90 group-hover/point:opacity-100">
                      <HighlightedText text={point} variant="slate" />
                    </div>
                  </div>
                ))}
             </div>

             <button 
              className="w-full mt-12 py-6 bg-slate-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Deep-Dive Insight
             </button>
          </div>
        )}
      </div>

      {/* Control Surface */}
      <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-full p-2.5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] ui-element pointer-events-auto">
        <div className="flex gap-1">
          <button onClick={() => handleZoom(0.1)} className="w-14 h-14 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title="Magnify Neural Path">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <button onClick={() => handleZoom(-0.1)} className="w-14 h-14 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title="Collapse Perspective">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path></svg>
          </button>
          <div className="w-[1px] h-8 bg-white/10 my-auto mx-2"></div>
          <button onClick={resetView} className="w-14 h-14 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all active:scale-90" title="Recenter Perspective">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
