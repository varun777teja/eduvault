
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Source, ChatMessage, Flashcard, QuizQuestion, MindMapData } from './types';
import { gemini } from './geminiService';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LearningHub from './components/LearningHub';
import MindMap from './components/MindMap';
import AudioOverview from './components/AudioOverview';
import LoadingScreen from './components/LoadingScreen';

interface ExternalDoc {
  id: string;
  title: string;
  content: string;
  category?: string;
}

interface AppProps {
  externalDocs?: ExternalDoc[];
}

const App: React.FC<AppProps> = ({ externalDocs = [] }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'learning' | 'mindmap' | 'audio'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [learningData, setLearningData] = useState<{ flashcards: Flashcard[], quiz: QuizQuestion[] } | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync external docs
  useEffect(() => {
    if (externalDocs.length > 0) {
      setSources(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSources = externalDocs
          .filter(d => !existingIds.has(d.id))
          .map(d => ({
            id: d.id,
            title: d.title, // Fixed: removed .substring(0, 30) to keep full title
            type: 'text' as const,
            content: d.content || `(No content available for ${d.title})`,
            selected: true,
            metadata: { category: d.category }
          }));

        if (newSources.length === 0) return prev;
        return [...prev, ...newSources];
      });
    }
  }, [externalDocs]);

  const lastAutoRefreshRef = useRef<string>("");

  const selectedSources = sources.filter(s => s.selected);

  const handleAddSource = (source: Source) => {
    setSources(prev => [...prev, { ...source, selected: true }]);
  };

  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const refreshInsights = useCallback(async () => {
    if (selectedSources.length < 1) {
      setLearningData(null);
      setMindMapData(null);
      return;
    }

    const currentContextKey = selectedSources.map(s => s.id).sort().join(',');
    if (lastAutoRefreshRef.current === currentContextKey && !apiError) return;

    setIsGlobalLoading(true);
    setApiError(null);
    try {
      // Run sequential rather than parallel to avoid 429 peak concurrency issues
      const learning = await gemini.generateLearningMaterials(selectedSources);
      setLearningData(learning);

      const mindmap = await gemini.generateMindMap(selectedSources);
      setMindMapData(mindmap);

      lastAutoRefreshRef.current = currentContextKey;
    } catch (error: any) {
      console.error("Refresh failed", error);
      const errorMsg = error?.message?.toLowerCase() || "";
      if (errorMsg.includes('429') || errorMsg.includes('resource_exhausted')) {
        setApiError("Neural cooling in progress... (Rate Limit reached). Retrying shortly.");
      } else {
        setApiError("Analysis failed. Please verify source content.");
      }
    } finally {
      setIsGlobalLoading(false);
    }
  }, [selectedSources, apiError]);

  useEffect(() => {
    if (selectedSources.length >= 1) {
      // Increase debounce to 3 seconds to avoid spamming the API while toggling sources
      const timeoutId = setTimeout(() => {
        refreshInsights();
      }, 3000);
      return () => clearTimeout(timeoutId);
    } else {
      setLearningData(null);
      setMindMapData(null);
      lastAutoRefreshRef.current = "";
    }
  }, [selectedSources.length, refreshInsights]);

  const handleSendMessage = async (content: string) => {
    if (selectedSources.length === 0) {
      alert("Please select at least one source.");
      return;
    }

    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await gemini.chat(content, selectedSources);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        citations: response.citations
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const aiLogo = "https://i.ibb.co/6JbSBhjt/logobrahma.png";

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden relative">
      {isGlobalLoading && <LoadingScreen />}

      <div className={`
        absolute inset-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0 md:flex
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          sources={sources}
          onAddSource={handleAddSource}
          onDeleteSource={handleDeleteSource}
          onToggleSource={handleToggleSource}
          onRefreshInsights={refreshInsights}
          isLoading={isLoading || isGlobalLoading}
          apiError={apiError}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div
          className={`md:hidden absolute inset-0 bg-black/20 -z-10 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-white relative h-full">
        <header className="safe-area-pt bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0 z-40">
          <div className="h-14 md:h-16 flex items-center justify-between px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            <div className="flex items-center justify-center gap-2 -ml-2">
              <img src={aiLogo} alt="Brahma" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
              <span className="font-black tracking-tighter text-sm md:text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
                Brahma AI
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-3.5 md:w-12 md:h-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-full shadow-sm"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden pb-16 md:pb-0 h-full">
          {activeTab === 'chat' && (
            <ChatWindow messages={messages} onSendMessage={handleSendMessage} onAddSource={handleAddSource} isLoading={isLoading} />
          )}
          {activeTab === 'learning' && (
            <LearningHub data={learningData} sources={selectedSources} onAddSource={handleAddSource} />
          )}
          {activeTab === 'mindmap' && <MindMap data={mindMapData} />}
          {activeTab === 'audio' && <AudioOverview sources={selectedSources} />}
        </div>

        <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around h-16 z-40 px-2 safe-area-pb md:relative md:h-16 md:bg-white md:border-t md:shadow-none">
          {[
            { id: 'chat', label: 'Chat', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg> },
            { id: 'learning', label: 'Learning', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> },
            { id: 'mindmap', label: 'Map', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L10 7l6-3 5.447 2.724a1 1 0 01.553.894v10.764a1 1 0 01-1.447.894L15 17l-6 3z"></path></svg> },
            { id: 'audio', label: 'Reader', icon: <img src={aiLogo} alt="Reader" className={`w-6 h-6 object-contain transition-all ${activeTab === 'audio' ? 'brightness-100' : 'brightness-50 grayscale opacity-70'}`} /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
            >
              {item.icon}
              <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
