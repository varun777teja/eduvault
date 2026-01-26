
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { gemini } from '../geminiService';
import { Source } from '../types';
import { HighlightedText } from './LearningHub';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

interface AudioOverviewProps {
  sources: Source[];
}

declare const pdfjsLib: any;

const API_KEY = process.env.API_KEY;

// Audio Helpers for Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  type?: 'chat' | 'tutor' | 'solution';
}

const IntegratedPdfViewer: React.FC<{ 
  source: Source, 
  zoom: number,
  onPageChange: (page: number, total: number) => void,
  currentPage: number,
  isSelectionEnabled: boolean,
  onSelectionComplete: (rect: SelectionRect, canvas: HTMLCanvasElement) => void
}> = ({ source, zoom, onPageChange, currentPage, isSelectionEnabled, onSelectionComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRect | null>(null);

  useEffect(() => {
    let mounted = true;
    const renderPdf = async () => {
      const container = containerRef.current;
      if (!source.originalData || !container) return;
      
      setLoading(true);
      container.innerHTML = ''; 

      try {
        const base64Data = source.originalData.includes(',') ? source.originalData.split(',')[1] : source.originalData;
        const binaryStr = atob(base64Data);
        const uint8Array = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) uint8Array[i] = binaryStr.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        const baseWidth = container.clientWidth || 800;
        const width = (baseWidth - 48) * zoom;

        observer.current = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const p = parseInt(entry.target.getAttribute('data-page') || '1');
              onPageChange(p, pdf.numPages);
            }
          });
        }, { threshold: 0.3 });

        for (let i = 1; i <= pdf.numPages; i++) {
          if (!mounted) break;
          const page = await pdf.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = width / baseViewport.width;
          const viewport = page.getViewport({ scale });
          
          const wrapper = document.createElement('div');
          wrapper.className = 'relative mb-12 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] mx-auto rounded-sm overflow-hidden border border-slate-200 transition-transform duration-300 select-none';
          wrapper.id = `pdf-page-${i}`;
          wrapper.setAttribute('data-page', i.toString());
          wrapper.style.width = `${viewport.width}px`;
          wrapper.style.height = `${viewport.height}px`;
          
          const canvas = document.createElement('canvas');
          const dpr = window.devicePixelRatio || 1;
          canvas.height = viewport.height * dpr;
          canvas.width = viewport.width * dpr;
          canvas.style.height = `${viewport.height}px`;
          canvas.style.width = `${viewport.width}px`;
          wrapper.appendChild(canvas);
          container.appendChild(wrapper);
          observer.current.observe(wrapper);

          const context = canvas.getContext('2d');
          if (context) {
            context.scale(dpr, dpr);
            await page.render({ canvasContext: context, viewport: viewport }).promise;
          }
        }
      } catch (err) {
        console.error("PDF Render Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    renderPdf();
    return () => { mounted = false; observer.current?.disconnect(); };
  }, [source, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelectionEnabled) return;
    const wrapper = (e.target as HTMLElement).closest('[data-page]');
    if (!wrapper) return;
    
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pageNum = parseInt(wrapper.getAttribute('data-page') || '1');

    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0, pageNumber: pageNum });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPos || !currentRect || !isSelectionEnabled) return;

    const wrapper = document.getElementById(`pdf-page-${currentRect.pageNumber}`);
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCurrentRect({
      ...currentRect,
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (!isSelectionEnabled) return;
    if (currentRect && currentRect.width > 10 && currentRect.height > 10) {
      const wrapper = document.getElementById(`pdf-page-${currentRect.pageNumber}`);
      const canvas = wrapper?.querySelector('canvas');
      if (canvas) {
        onSelectionComplete(currentRect, canvas);
      }
    }
    setStartPos(null);
    setCurrentRect(null);
  };

  return (
    <div 
      className={`w-full h-full relative ${isSelectionEnabled ? 'cursor-crosshair' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preparing Document</p>
        </div>
      )}
      <div ref={containerRef} className="w-full flex flex-col items-center py-8"></div>
      
      {currentRect && (
        <div 
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50 rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          style={{
            left: (document.getElementById(`pdf-page-${currentRect.pageNumber}`)?.offsetLeft || 0) + currentRect.x,
            top: (document.getElementById(`pdf-page-${currentRect.pageNumber}`)?.offsetTop || 0) + currentRect.y,
            width: currentRect.width,
            height: currentRect.height
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-transparent animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

const AudioOverview: React.FC<AudioOverviewProps> = ({ sources }) => {
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState({ current: 1, total: 1 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Floating Button State
  const [floatingPos, setFloatingPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSolverMode, setIsSolverMode] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, btnX: 0, btnY: 0 });

  // AI States
  const [aiModal, setAiModal] = useState<{ open: boolean; initialContent: string; initialImage?: string; mode?: 'chat' | 'solver' | 'tutor' }>({ open: false, initialContent: '' });
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Live Voice Link States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState<{ user: string; ai: string }>({ user: '', ai: '' });
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const pdfSources = useMemo(() => sources.filter(s => s.type === 'pdf' && s.originalData), [sources]);
  const activePdf = pdfSources.find(s => s.id === selectedPdfId) || pdfSources[0];

  useEffect(() => {
    if (pdfSources.length > 0 && !selectedPdfId) setSelectedPdfId(pdfSources[0].id);
  }, [pdfSources]);

  const jumpToPage = (n: number) => {
    const el = document.getElementById(`pdf-page-${n}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Live Session Start
  const startLiveVoiceLink = async () => {
    if (isLiveActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsLiveActive(true);
            setIsMenuOpen(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Playback
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = audioContextRef.current!.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Transcription
            if (message.serverContent?.inputTranscription) {
              setLiveTranscription(prev => ({ ...prev, user: prev.user + message.serverContent!.inputTranscription!.text }));
            }
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(prev => ({ ...prev, ai: prev.ai + message.serverContent!.outputTranscription!.text }));
            }
            if (message.serverContent?.turnComplete) {
              setLiveTranscription({ user: '', ai: '' });
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopLiveVoiceLink(),
          onerror: () => stopLiveVoiceLink(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Brahma Live Agent. You have access to this document: ${activePdf?.title}. 
          Answer questions about the document in a concise, conversational tone. 
          Focus on identifying patterns and providing research-grade insights. Context:\n${activePdf?.content.substring(0, 15000)}`
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live Voice Error:", err);
      alert("Microphone access denied or connection failed.");
    }
  };

  const stopLiveVoiceLink = () => {
    setIsLiveActive(false);
    setLiveTranscription({ user: '', ai: '' });
    if (liveSessionRef.current) {
        liveSessionRef.current.close();
    }
    if (audioContextRef.current) {
        audioContextRef.current.input.close();
        audioContextRef.current.output.close();
    }
    audioContextRef.current = null;
    liveSessionRef.current = null;
  };

  // Draggable Logic
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      btnX: floatingPos.x,
      btnY: floatingPos.y
    };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setFloatingPos({
        x: dragStartRef.current.btnX + dx,
        y: dragStartRef.current.btnY + dy
      });
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSelectionComplete = (rect: SelectionRect, canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rect.width * dpr;
    tempCanvas.height = rect.height * dpr;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas, 
        rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr,
        0, 0, rect.width * dpr, rect.height * dpr
      );
      const imageData = tempCanvas.toDataURL('image/png');
      const mode = isSolverMode ? 'solver' : 'chat';
      setAiModal({ open: true, initialContent: '', initialImage: imageData, mode: mode });
      setChatHistory([]); 
      setIsSelectionMode(false);
      setIsSolverMode(false);
    }
  };

  const startTutorMode = async () => {
    setIsThinking(true);
    setAiModal({ open: true, initialContent: '', mode: 'tutor' });
    setChatHistory([]);
    try {
      const question = await gemini.generateTutorQuestion(activePdf ? [activePdf] : []);
      setChatHistory([{ role: 'assistant', text: question, type: 'tutor' }]);
    } catch (e) {
      setChatHistory([{ role: 'assistant', text: "Brahma Tutor is currently recalibrating its neural network. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleContextAi = async (q: string) => {
    if (!q.trim() || isThinking) return;
    
    const newUserMessage: ChatHistoryItem = { 
      role: 'user', 
      text: q, 
      image: chatHistory.length === 0 ? aiModal.initialImage : undefined 
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setCurrentInput('');
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      let responseText = '';
      
      if (aiModal.mode === 'solver' && chatHistory.length === 0) {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [
            { inlineData: { mimeType: 'image/png', data: aiModal.initialImage!.split(',')[1] } },
            { text: `SOLVE THIS PROBLEM: ${q}\n\nAnalyze the visual context and provide a step-by-step rigorous solution.` }
          ]},
          config: {
            systemInstruction: "You are Brahma Solver. Break down complex problems into logical steps with precision.",
            temperature: 0.1
          }
        });
        responseText = result.text || "";
      } else if (chatHistory.length === 0 && aiModal.initialImage) {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [
            { inlineData: { mimeType: 'image/png', data: aiModal.initialImage.split(',')[1] } },
            { text: `CONTEXTUAL QUERY: ${q}\n\nAnalyze document regions with academic precision.` }
          ]},
          config: {
            systemInstruction: "You are Brahma, an elite research engine.",
            temperature: 0.2
          }
        });
        responseText = result.text || "";
      } else {
        const result = await gemini.chat(q, activePdf ? [activePdf] : []);
        responseText = result.text || "";
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', text: responseText, type: aiModal.mode === 'solver' ? 'solution' : 'chat' }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "Neural synchronization lost. Re-establishing link..." }]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]);

  const aiLogo = "https://i.ibb.co/6JbSBhjt/logobrahma.png";

  return (
    <div className={`h-full bg-[#f1f3f5] flex flex-col relative transition-all ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>
      
      {/* Top Reader Toolbar */}
      <div className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-200">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Zoom</span>
            </div>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path></svg></button>
            <span className="text-[10px] font-black text-slate-700 w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg></button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={currentPage.current}
              onChange={(e) => jumpToPage(parseInt(e.target.value))}
              className="w-10 h-8 bg-slate-50 border border-slate-200 rounded-md text-center text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {currentPage.total}</span>
          </div>
        </div>

        <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Contents</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {Array.from({ length: currentPage.total }, (_, i) => (
                <button 
                  key={i}
                  onClick={() => jumpToPage(i + 1)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                    currentPage.current === i + 1 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                    currentPage.current === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[11px] font-bold">Page Reference</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Draggable AI Button */}
        <div 
          className="fixed z-[70] transition-all duration-75"
          style={{ 
            left: `${floatingPos.x}px`, 
            top: `${floatingPos.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Menu Options */}
          {isMenuOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col gap-2 animate-scale-in">
              <button 
                onClick={(e) => { e.stopPropagation(); startLiveVoiceLink(); }}
                className="whitespace-nowrap flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full shadow-2xl border border-slate-800 hover:bg-blue-600 transition-all group"
              >
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Neural Voice Link</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSelectionMode(true); setIsSolverMode(false); setIsMenuOpen(false); }}
                className="whitespace-nowrap flex items-center gap-3 px-4 py-2 bg-white text-slate-900 rounded-full shadow-2xl border border-slate-100 hover:bg-slate-50 transition-all group"
              >
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Marker Tool</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSolverMode(true); setIsSelectionMode(true); setIsMenuOpen(false); }}
                className="whitespace-nowrap flex items-center gap-3 px-4 py-2 bg-white text-slate-900 rounded-full shadow-2xl border border-slate-100 hover:bg-slate-50 transition-all group"
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest pr-2">Problem Solver</span>
              </button>
            </div>
          )}

          <button 
            onMouseDown={handleDragStart}
            onClick={() => !isDragging && setIsMenuOpen(!isMenuOpen)}
            className={`w-14 h-14 bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group overflow-hidden border-2 ${
              isMenuOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-800'
            } ${isThinking || isLiveActive ? 'animate-speaking-pulse ring-4 ring-blue-500/30' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src={aiLogo} className={`w-7 h-7 invert relative z-10 transition-opacity ${isThinking || isLiveActive ? 'opacity-50' : 'opacity-100'}`} />
            {(isThinking || isLiveActive) && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
          </button>
          
          {(isSelectionMode || isSolverMode) && (
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 ${isSolverMode ? 'bg-emerald-600' : 'bg-blue-600'} text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl animate-bounce`}>
              {isSolverMode ? 'Targeting Problem Area...' : 'Selection Active - Drag Area'}
            </div>
          )}
        </div>

        {/* Reader Stage */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] scroll-smooth p-4 md:p-8">
          {activePdf ? (
            <div className="max-w-4xl mx-auto relative">
              <IntegratedPdfViewer 
                source={activePdf} 
                zoom={zoom} 
                currentPage={currentPage.current}
                isSelectionEnabled={isSelectionMode || isSolverMode}
                onPageChange={(c, t) => setCurrentPage({ current: c, total: t })} 
                onSelectionComplete={handleSelectionComplete}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center opacity-40">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Improved Neural Link Voice Overlay with 3D Effects */}
      {isLiveActive && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-fade-in select-none">
          {/* Immersive Background Environment */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:1.5s]"></div>
            
            {/* 3D Grid Floor */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
                backgroundSize: '100px 100px',
                transform: 'perspective(1000px) rotateX(70deg) translateY(50px) scale(3)'
              }}
            ></div>
          </div>

          <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
            {/* 3D Simulated Neural Core */}
            <div className="w-64 h-64 relative mb-20 [perspective:1000px]">
               {/* 3D Orbital Rings */}
               <div className="absolute inset-[-40px] border border-blue-500/20 rounded-full [transform:rotateX(60deg)_rotateY(30deg)] animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-[-60px] border border-purple-500/10 rounded-full [transform:rotateX(30deg)_rotateY(60deg)] animate-[spin_15s_linear_infinite_reverse]"></div>
               <div className="absolute inset-[-80px] border border-blue-500/5 rounded-full [transform:rotateX(45deg)_rotateY(45deg)] animate-[spin_20s_linear_infinite]"></div>

               {/* Inner Glow Field */}
               <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${liveTranscription.ai ? 'bg-blue-600/30' : 'bg-slate-800/20'}`}></div>
               
               {/* The Core Orb */}
               <div className={`w-full h-full bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.3)] border-2 border-white/10 relative z-20 overflow-hidden group transition-transform duration-500 ${liveTranscription.ai ? 'scale-110 shadow-[0_0_150px_rgba(37,99,235,0.5)]' : 'scale-100'}`}>
                 {/* Core Texture/Gradients */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-950"></div>
                 <div className={`absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)] transition-opacity ${liveTranscription.ai ? 'animate-pulse' : ''}`}></div>
                 
                 {/* Brahma Logo with Floating Effect */}
                 <img src={aiLogo} className={`w-28 h-28 invert relative z-10 transition-all duration-700 ${liveTranscription.ai ? 'opacity-100 scale-105' : 'opacity-40 scale-100'} animate-float`} />
                 
                 {/* Reactive Particle Waveform (Simulated with simple CSS) */}
                 {liveTranscription.ai && (
                   <div className="absolute inset-0 flex items-end justify-around pb-8 px-8 opacity-60">
                     {[...Array(8)].map((_, i) => (
                       <div 
                         key={i} 
                         className="w-1.5 bg-white/30 rounded-full animate-[pulse_1s_infinite_ease-in-out]" 
                         style={{ height: `${20 + Math.random() * 40}%`, animationDelay: `${i * 0.1}s` }}
                       ></div>
                     ))}
                   </div>
                 )}
               </div>

               {/* 3D Shadow Plate beneath orb */}
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/60 blur-xl rounded-[100%]"></div>
            </div>

            <div className="text-center space-y-10 w-full">
              <div className="px-6 relative">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">Neural Link Synchronized</p>
                </div>

                <div className="min-h-[160px] flex flex-col justify-start items-center space-y-6">
                  {liveTranscription.user && (
                    <div className="max-w-[80%] bg-white/5 border border-white/10 px-6 py-3 rounded-2xl animate-slide-up backdrop-blur-md">
                       <p className="text-slate-300 text-sm font-medium italic">"{liveTranscription.user}"</p>
                    </div>
                  )}
                  
                  {liveTranscription.ai && (
                    <div className="max-w-[90%] animate-fade-in">
                       <p className="text-white text-xl md:text-2xl font-bold tracking-tight leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                         {liveTranscription.ai}
                       </p>
                    </div>
                  )}

                  {!liveTranscription.user && !liveTranscription.ai && (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Waiting for Research Directive</p>
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Action Button */}
              <div className="relative pt-10">
                <div className="absolute inset-0 bg-rose-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button 
                  onClick={stopLiveVoiceLink}
                  className="relative group w-24 h-24 bg-rose-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(225,29,72,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-rose-400/20"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity"></div>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <p className="mt-4 text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">Terminate Link</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModal.open && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setAiModal({ open: false, initialContent: '' })}
        >
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                   aiModal.mode === 'solver' ? 'bg-emerald-600' : aiModal.mode === 'tutor' ? 'bg-purple-600' : 'bg-slate-900'
                 }`}>
                   <img src={aiLogo} className="w-6 h-6 invert" />
                 </div>
                 <div>
                   <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest leading-none">
                     {aiModal.mode === 'solver' ? 'Brahma Solver' : aiModal.mode === 'tutor' ? 'Brahma Tutor' : 'Neural Insight'}
                   </h4>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Active Cognitive Stream</p>
                 </div>
               </div>
               <button 
                 onClick={() => setAiModal({ open: false, initialContent: '' })} 
                 className="p-2 text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
                 aria-label="Close"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            <div 
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar scroll-smooth bg-slate-50/30"
            >
              {aiModal.initialImage && chatHistory.length === 0 && (
                <div className="w-full flex flex-col items-center mb-4">
                  <div className="p-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-[200px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-center">Reference Analysis</p>
                    <img src={aiModal.initialImage} className="max-h-32 rounded-lg border border-slate-100 mx-auto" />
                  </div>
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-3xl p-5 md:p-6 shadow-sm border ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-white border-slate-800 rounded-tr-sm' 
                    : msg.type === 'solution' 
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-100 rounded-tl-sm' 
                    : msg.type === 'tutor'
                    ? 'bg-purple-50 text-purple-950 border-purple-100 rounded-tl-sm'
                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-sm'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} className="max-h-32 rounded-lg mb-4 border border-white/10" />
                    )}
                    <HighlightedText 
                      text={msg.text} 
                      variant={msg.role === 'user' ? 'yellow' : msg.type === 'solution' ? 'green' : 'blue'} 
                      className="text-sm leading-relaxed" 
                    />
                  </div>
                  <span className="mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {msg.role === 'user' ? 'Scholar' : msg.type === 'solution' ? 'Solver Protocol' : 'Neural Core'}
                  </span>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s] mx-0.5"></div>
                     <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Brahma Thinking...</span>
                </div>
              )}
            </div>

            {/* Sticky Input Field */}
            <div className="shrink-0 p-6 md:p-8 bg-white border-t border-slate-100">
              <div className="relative">
                <input 
                  autoFocus
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleContextAi(currentInput); }}
                  placeholder={aiModal.mode === 'solver' ? "Describe the problem to solve..." : "Respond to the tutor or ask anything..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  disabled={isThinking}
                />
                <button 
                  onClick={() => handleContextAi(currentInput)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    currentInput.trim() && !isThinking ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300'
                  }`}
                  disabled={!currentInput.trim() || isThinking}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioOverview;
