
import React, { useState, useEffect, useRef } from 'react';
import { 
  AudioLines, Play, Pause, Brain, Sparkles, 
  MessageSquare, Layout, Share2, Download,
  Layers, Search, Zap, Globe, MessageCircle,
  TrendingUp, Users, ChevronRight, BookOpen,
  History, Loader2, Link2, Volume2, RefreshCw
} from 'lucide-react';
import { Document } from '../types';
import { 
  generateAudioOverview, 
  getSemanticMap, 
  getPerspectiveDebate, 
  chatWithAI 
} from '../services/geminiService';

interface AIPageProps {
  documents: Document[];
}

const AIPage: React.FC<AIPageProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'graph' | 'debate'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Audio State
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Graph State
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });

  // Debate State
  const [debateText, setDebateText] = useState<string | null>(null);

  const startAudioOverview = async () => {
    if (documents.length === 0) return;
    setIsGenerating(true);
    try {
      const content = documents.map(d => d.content).join('\n\n');
      const { script, base64Audio } = await generateAudioOverview(content);
      setPodcastScript(script);
      
      if (base64Audio) {
        const blob = await fetch(`data:audio/pcm;base64,${base64Audio}`).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSemanticGraph = async () => {
    setIsGenerating(true);
    try {
      const data = await getSemanticMap(documents);
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadDebate = async () => {
    if (documents.length === 0) return;
    setIsGenerating(true);
    try {
      const topic = documents[0].title;
      const res = await getPerspectiveDebate(topic, documents[0].content);
      setDebateText(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-slate-200 group">
             <img src="https://i.ibb.co/TBWnWGyv/image.png" className="w-full h-full object-contain brightness-0 invert group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">AI Knowledge Vault</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Autonomous intelligence layer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'overview', icon: AudioLines, label: 'Overview' },
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'graph', icon: Brain, label: 'Semantic Map' },
              { id: 'debate', icon: Users, label: 'Debate' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:block">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Source Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto hidden xl:flex">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Context ({documents.length})</h3>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Link URL</button>
          </div>
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{doc.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold line-clamp-2 leading-relaxed">
                  {doc.content.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="max-w-4xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-slate-900 rounded-[4rem] p-10 lg:p-20 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-aura">
                       <Volume2 className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter">Audio Overview</h2>
                    <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto mb-12">
                      Generate a deep-dive podcast where Joe and Jane discuss your sources with natural banter and analogies.
                    </p>
                    
                    {!podcastScript ? (
                      <button 
                        onClick={startAudioOverview}
                        disabled={isGenerating}
                        className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-4 mx-auto"
                      >
                        {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                        Generate Deep Dive
                      </button>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 max-w-2xl mx-auto flex flex-col items-center gap-6">
                         <div className="flex items-center gap-6">
                            <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-2xl hover:scale-105 active:scale-90 transition-all">
                               <Play className="w-8 h-8 fill-current" />
                            </button>
                            <div className="text-left">
                               <p className="text-xs font-black uppercase text-indigo-400 tracking-widest">Now Ready</p>
                               <h4 className="text-xl font-bold">The Source Podcast</h4>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Duration: ~8 mins • Joe & Jane</p>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -ml-48 -mb-48"></div>
               </div>

               {podcastScript && (
                 <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                      <Layout className="w-5 h-5 text-indigo-600" />
                      Transcript Analysis
                    </h3>
                    <div className="prose prose-slate max-w-none text-slate-700 font-serif leading-relaxed text-lg italic whitespace-pre-wrap">
                      {podcastScript}
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'graph' && (
             <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-700">
                <div className="flex items-center justify-between mb-10">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Semantic Concept Mapping</h2>
                     <p className="text-sm text-slate-500 font-medium">Graphing the relationships between your sources</p>
                   </div>
                   <button 
                     onClick={loadSemanticGraph}
                     disabled={isGenerating}
                     className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                   >
                     {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Recalculate Map
                   </button>
                </div>
                
                <div className="flex-1 bg-white border border-slate-200 rounded-[3rem] shadow-inner relative flex items-center justify-center p-10">
                   {graphData.nodes.length > 0 ? (
                     <svg className="w-full h-full min-h-[500px]" viewBox="0 0 800 600">
                        {graphData.links.map((link, i) => (
                           <line key={i} x1="400" y1="300" x2={400 + Math.cos(i) * 200} y2={300 + Math.sin(i) * 200} stroke="#e2e8f0" strokeWidth="1" />
                        ))}
                        {graphData.nodes.map((node, i) => (
                           <g key={i} transform={`translate(${400 + Math.cos(i) * 200}, ${300 + Math.sin(i) * 200})`} className="group cursor-pointer">
                              <circle r="40" className="fill-indigo-50 stroke-indigo-100 group-hover:fill-indigo-600 group-hover:stroke-indigo-600 transition-all" />
                              <text textAnchor="middle" dy="5" className="text-[10px] font-black uppercase tracking-tighter fill-slate-900 group-hover:fill-white transition-colors">{node.label}</text>
                           </g>
                        ))}
                     </svg>
                   ) : (
                     <div className="text-center">
                        <Brain className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Generate semantic map to visualize knowledge</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'debate' && (
            <div className="max-w-4xl mx-auto w-full space-y-10 animate-in fade-in duration-700">
               <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                     <Users className="w-8 h-8 text-indigo-600" />
                     Multi-Perspective Debate
                  </h2>
                  <button onClick={loadDebate} className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">Start Discussion</button>
               </div>
               
               {debateText ? (
                 <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm prose prose-lg prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-800 font-medium">
                   {debateText}
                 </div>
               ) : (
                 <div className="py-32 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compare perspectives from expert personas</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPage;
