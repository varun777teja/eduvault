
import React, { useState, useEffect, useRef } from 'react';
import { 
  AudioLines, Play, Pause, Brain, Sparkles, 
  MessageSquare, Layout, Share2, Download,
  Layers, Search, Zap, Globe, MessageCircle,
  TrendingUp, Users, ChevronRight, BookOpen,
  History, Loader2, Link2, Volume2, RefreshCw, X
} from 'lucide-react';
import { Document } from '../types';
import { generateAudioOverview, getSemanticMap, getPerspectiveDebate } from '../services/geminiService';

interface AIPageProps {
  documents: Document[];
}

const AIPage: React.FC<AIPageProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'graph' | 'debate'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [debateText, setDebateText] = useState<string | null>(null);

  const startAudioOverview = async () => {
    if (documents.length === 0) return;
    setIsGenerating(true);
    try {
      const content = documents.map(d => d.content).join('\n\n');
      const { script, base64Audio } = await generateAudioOverview(content);
      setPodcastScript(script);
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const wavHeader = createWavHeader(bytes.length, 24000);
        const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const createWavHeader = (dataLen: number, sampleRate: number) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataLen, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLen, true);
    return buffer;
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const loadSemanticGraph = async () => {
    setIsGenerating(true);
    try { const data = await getSemanticMap(documents); setGraphData(data); }
    catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const loadDebate = async () => {
    if (documents.length === 0) return;
    setIsGenerating(true);
    try { setDebateText(await getPerspectiveDebate(documents[0].title, documents[0].content)); }
    catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center p-2"><img src="https://i.ibb.co/TBWnWGyv/image.png" className="w-full h-full object-contain brightness-0 invert" /></div>
          <div><h1 className="text-2xl font-black text-slate-900 tracking-tighter">AI Knowledge Vault</h1></div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['overview', 'chat', 'graph', 'debate'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 rounded-[4rem] p-10 lg:p-20 text-white relative overflow-hidden shadow-2xl text-center">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10"><Volume2 className="w-12 h-12 text-indigo-400" /></div>
              <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tighter">Audio Overview</h2>
              {!audioUrl ? (
                <button onClick={startAudioOverview} disabled={isGenerating} className="px-12 py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-4 mx-auto disabled:opacity-50">
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />} Generate Podcast
                </button>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  <button onClick={togglePlayback} className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>
                  <p className="text-xs font-black uppercase text-indigo-400 tracking-[0.3em]">Deep Dive: Joe & Jane</p>
                </div>
              )}
            </div>
            {podcastScript && (
              <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Transcript Analysis</h3>
                <div className="prose prose-slate max-w-none text-slate-700 italic text-lg leading-relaxed whitespace-pre-wrap">{podcastScript}</div>
              </div>
            )}
          </div>
        )}
        {/* ... Rest of components ... */}
      </div>
    </div>
  );
};

export default AIPage;
