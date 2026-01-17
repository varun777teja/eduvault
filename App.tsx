
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
import AIPage from './components/AIPage.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import { Document, AppNotification, Task } from './types.ts';
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
  }
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLocalMode, setIsLocalMode] = useState(!isSupabaseConfigured);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Admin Check
  const isAdmin = session?.user?.user_metadata?.is_admin === true;

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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error) {
        console.error('Failed to initialize Supabase session:', error);
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

  // Fetch initial data
  useEffect(() => {
    if (!session) return;

    if (isLocalMode) {
      const savedDocs = localStorage.getItem('eduvault_docs');
      const savedTasks = localStorage.getItem('eduvault_tasks');
      setDocuments(savedDocs ? JSON.parse(savedDocs) : INITIAL_DOCS);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    } else {
      fetchInitialData();
      
      const docChannel = supabase
        .channel('realtime_documents')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, (payload) => {
          setSyncStatus('syncing');
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new as Document, ...prev]);
            addNotification('success', 'New Document Added', `"${payload.new.title}" is now available in your vault.`);
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(d => d.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(d => d.id === payload.new.id ? payload.new as Document : d));
          }
          setTimeout(() => setSyncStatus('synced'), 1000);
        })
        .subscribe();

      const taskChannel = supabase
        .channel('realtime_tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
          setSyncStatus('syncing');
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
          }
          setTimeout(() => setSyncStatus('synced'), 1000);
        })
        .subscribe();

      return () => {
        docChannel.unsubscribe();
        taskChannel.unsubscribe();
      };
    }
  }, [session, isLocalMode]);

  const fetchInitialData = async () => {
    setSyncStatus('syncing');
    try {
      const [docsRes, tasksRes] = await Promise.all([
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('time', { ascending: true })
      ]);
      if (docsRes.data) setDocuments(docsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
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
    setSyncStatus('syncing');
    if (isLocalMode) {
      const updated = documents.filter(d => d.id !== id);
      setDocuments(updated);
      localStorage.setItem('eduvault_docs', JSON.stringify(updated));
      addNotification('success', 'Document Removed', 'Item deleted from local vault.');
      setSyncStatus('synced');
    } else {
      try {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) throw error;
        addNotification('success', 'Document Removed', 'Vault item deleted successfully.');
      } catch (error) {
        setSyncStatus('error');
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Knowledge Base...</p>
        </div>
      </div>
    );
  }

  const needsProfileSetup = session?.user?.user_metadata && 
                           (!session.user.user_metadata.roll_number || !session.user.user_metadata.profile_completed);

  if (!session || (needsProfileSetup && isSupabaseConfigured)) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={
            <LoginView onLogin={() => {
              if (!isSupabaseConfigured) {
                localStorage.setItem('eduvault_local_auth', 'true');
                setSession({ user: { id: 'local-user' } });
              } else {
                supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
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
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} syncStatus={syncStatus} />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {isLocalMode && (
              <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center flex items-center justify-center gap-2">
                Offline Mode: Data saved to device only
              </div>
            )}
            <Routes>
              <Route path="/" element={<div className="p-6 lg:p-10"><Dashboard documents={documents} /></div>} />
              <Route path="/search" element={<SearchView documents={documents} searchTerm={searchTerm} onSearchChange={setSearchTerm} />} />
              <Route path="/library" element={<LibraryViewComponent documents={documents} onRemove={removeDocument} />} />
              <Route path="/reader/:id" element={<Reader documents={documents} />} />
              <Route path="/ai-vault" element={<AIPage documents={documents} />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/stats" element={<Stats documents={documents} tasks={tasks} />} />
              <Route path="/planner" element={<Planner onNotify={addNotification} initialTasks={tasks} />} />
              <Route path="/profile" element={<ProfileView documents={documents} onLogout={handleLogout} />} />
              
              {/* Admin Protected Route */}
              <Route 
                path="/admin" 
                element={isAdmin ? <AdminPortal documents={documents} onRemove={removeDocument} /> : <Navigate to="/" replace />} 
              />

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
