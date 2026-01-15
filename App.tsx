
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Reader from './components/Reader.tsx';
import Notifications from './components/Notifications.tsx';
import Stats from './components/Stats.tsx';
import Planner from './components/Planner.tsx';
import MobileBottomNav from './components/MobileBottomNav.tsx';
import SearchView from './components/SearchView.tsx';
import LibraryViewComponent from './components/LibraryView.tsx';
import ProfileView from './components/ProfileView.tsx';
import LoginView from './components/LoginView.tsx';
import NotificationSystem from './components/NotificationSystem.tsx';
import { Document, AppNotification } from './types.ts';
import { soundService } from './services/soundService.ts';
import { supabase, isSupabaseConfigured } from './services/supabase.ts';

const INITIAL_DOCS: Document[] = [
  {
    id: '1',
    title: 'Introduction to Quantum Physics',
    author: 'Richard Feynman',
    category: 'Science',
    uploadDate: '2024-03-15',
    content: 'Quantum mechanics is a fundamental theory in physics...',
    coverUrl: 'https://picsum.photos/seed/physics/300/400'
  },
  {
    id: '2',
    title: 'The Great Gatsby - Chapter 1 Notes',
    author: 'F. Scott Fitzgerald',
    category: 'Literature',
    uploadDate: '2024-03-10',
    content: 'In my younger and more vulnerable years...',
    coverUrl: 'https://picsum.photos/seed/gatsby/300/400'
  }
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLocalMode, setIsLocalMode] = useState(!isSupabaseConfigured);

  // Check auth session
  useEffect(() => {
    const initSession = async () => {
      if (!isSupabaseConfigured) {
        const localAuth = localStorage.getItem('eduvault_local_auth');
        if (localAuth === 'true') {
          setSession({ user: { id: 'local-user', email: 'guest@eduvault.local' } });
        }
        setIsAuthLoading(false);
        return;
      }

      try {
        // Explicitly refresh session on mount to catch OAuth redirects
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error) {
        console.error('Failed to initialize Supabase session:', error);
        // Don't force local mode yet, auth state listener might catch it
      } finally {
        setIsAuthLoading(false);
      }
    };

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          setIsLocalMode(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Fetch documents (Supabase or Local)
  useEffect(() => {
    if (session) {
      if (isLocalMode) {
        const saved = localStorage.getItem('eduvault_docs');
        setDocuments(saved ? JSON.parse(saved) : INITIAL_DOCS);
      } else {
        fetchDocumentsFromSupabase();
      }
    }
  }, [session, isLocalMode]);

  const fetchDocumentsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // If we can't fetch, we might still have a session but RLS/DB is broken
    }
  };

  const handleLogout = async () => {
    if (isLocalMode) {
      localStorage.removeItem('eduvault_local_auth');
      setSession(null);
    } else {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Logout error:', error);
        setSession(null);
      }
    }
  };

  const addNotification = useCallback((type: AppNotification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { id, type, title, message, timestamp: new Date() };
    setNotifications(prev => [newNotif, ...prev]);
    
    if (type === 'success' || type === 'task') soundService.playSuccess();
    else soundService.playAlert();

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeDocument = async (id: string) => {
    if (isLocalMode) {
      setDocuments(prev => {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem('eduvault_docs', JSON.stringify(updated));
        return updated;
      });
      addNotification('success', 'Document Removed', 'The item was deleted from your local vault.');
    } else {
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);
        
        if (error) throw error;

        setDocuments(prev => prev.filter(d => d.id !== id));
        addNotification('success', 'Document Removed', 'The item was deleted from your cloud vault.');
      } catch (error) {
        console.error('Error removing document:', error);
        addNotification('alert', 'Error', 'Failed to remove the document.');
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Unlocking Vault...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={
            <LoginView onLogin={() => {
              if (isLocalMode) {
                localStorage.setItem('eduvault_local_auth', 'true');
                setSession({ user: { id: 'local-user' } });
              }
            }} />
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
        <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {isLocalMode && (
              <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center flex items-center justify-center gap-2">
                <span className="animate-pulse">●</span> Local Vault Mode: Data is saved to your browser only
              </div>
            )}
            <Routes>
              <Route path="/" element={<div className="p-6 lg:p-10"><Dashboard /></div>} />
              <Route path="/search" element={<SearchView documents={documents} searchTerm={searchTerm} onSearchChange={setSearchTerm} />} />
              <Route path="/library" element={<LibraryViewComponent documents={documents} onRemove={removeDocument} />} />
              <Route path="/reader/:id" element={<Reader documents={documents} />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/stats" element={<Stats documents={documents} />} />
              <Route path="/planner" element={<Planner onNotify={addNotification} />} />
              <Route path="/profile" element={<ProfileView documents={documents} onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <MobileBottomNav searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
