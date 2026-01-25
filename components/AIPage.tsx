
import React from 'react';
import { 
  Sparkles, Rocket, Zap, BrainCircuit, 
  ArrowUpRight, Globe, ShieldCheck, Cpu,
  ExternalLink, Bot, Terminal, Command
} from 'lucide-react';
import { Document } from '../types.ts';

interface AIPageProps {
  documents: Document[];
}

const AIPage: React.FC<AIPageProps> = ({ documents }) => {
  const externalLink = "https://brahma-ai-vert.vercel.app/";

  const features = [
    { icon: BrainCircuit, title: "Neural Synthesis", desc: "Advanced cross-document reasoning engines." },
    { icon: Zap, title: "Rapid Summarization", desc: "Condense 100-page research into 5-minute digests." },
    { icon: Globe, title: "Global Context", desc: "Real-time web grounding for academic accuracy." },
    { icon: ShieldCheck, title: "Secure Vault", desc: "Institutional-grade data isolation." }
  ];

  return (
    <div className="min-h-full bg-slate-950 text-white overflow-y-auto custom-scrollbar selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 px-6 lg:px-20 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-600/20 to-transparent blur-[120px] pointer-events-none"></div>
        <div className="absolute top-40 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            Brahma Intelligence Core v3.1
          </div>

          <h1 className="text-6xl lg:text-9xl font-black tracking-tighter mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Beyond <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent shimmer-text">Ordinary AI.</span>
          </h1>

          <p className="text-slate-400 text-lg lg:text-2xl max-w-3xl mx-auto leading-relaxed mb-14 animate-in fade-in duration-1000 delay-300">
            Unleash the full potential of your academic research. Connect your library to the next-generation Brahma AI ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-700 delay-500">
            <a 
              href={externalLink}
              target="_blank"
              rel="noreferrer"
              className="group relative px-12 py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
            >
              Launch Brahma AI <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </a>
            
            <button className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-white/10 transition-all flex items-center gap-3">
              <Terminal className="w-5 h-5 text-indigo-400" /> API Access
            </button>
          </div>
        </div>

        {/* Futuristic Grid Divider */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-8 text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-3 text-white">{f.title}</h3>
              <p className="text-base text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Integration Callout */}
        <div className="mt-32 p-16 bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-[5rem] border border-white/5 text-center relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
               <Bot className="w-12 h-12 text-indigo-400 animate-bounce-subtle" />
            </div>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter mb-6 text-white">Universal Library Sync</h3>
            <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
              Your EduVault library is natively compatible with Brahma AI. Simply authorize your vault to begin cross-document synthesis and automated syllabus generation.
            </p>
            <a 
              href={externalLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.3em] text-indigo-400 hover:text-white transition-all group/link"
            >
              Start Integration Protocol <Command className="w-5 h-5 group-hover/link:rotate-90 transition-transform" />
            </a>
          </div>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
