
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
import AdminPortal from './components/AdminPortal.tsx';

import { Document, AppNotification, Task } from './types.ts';
import { soundService } from './services/soundService.ts';
import { supabase, isSupabaseConfigured } from './services/supabase.ts';

const INITIAL_DOCS: Document[] = [
  {
    id: '1',
    title: 'Introduction to Quantum Physics',
    author: 'Richard Feynman',
    category: 'Physics',
    uploadDate: '2024-03-15',
    content: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
    coverUrl: 'https://picsum.photos/seed/physics/300/400'
  },
  {
    id: '2',
    title: 'CMOS VLSI Design',
    author: 'Weste & Harris',
    category: 'Engineering',
    uploadDate: '2024-01-20',
    content: 'A Circuits and Systems Perspective',
    coverUrl: 'https://picsum.photos/seed/cmos/300/400',
    fileUrl: '/books/CMOS VLSI Design A Circuits and Systems Perspective.pdf'
  },
  {
    id: '3',
    title: 'Communication Systems (Analog and Digital)',
    author: 'Dr. Sanjay Sharma',
    category: 'Engineering',
    uploadDate: '2024-01-21',
    content: 'Comprehensive guide to communication systems.',
    coverUrl: 'https://picsum.photos/seed/comm1/300/400',
    fileUrl: '/books/Communication system (Analog and Digital) -- Dr.Sanjay Sharma -- ( WeLib.org ).pdf'
  },
  {
    id: '4',
    title: 'Communication Systems (4th Ed)',
    author: 'Simon Haykin',
    category: 'Engineering',
    uploadDate: '2024-01-22',
    content: 'Standard text on communication systems with solutions.',
    coverUrl: 'https://picsum.photos/seed/comm2/300/400',
    fileUrl: '/books/CommunicationSystems4thEditionSimonHaykinWithSolutionsManual.pdf'
  },
  {
    id: '5',
    title: 'Electronic Devices and Circuit Theory',
    author: 'Boylestad',
    category: 'Engineering',
    uploadDate: '2024-01-23',
    content: 'Fundamental concepts of electronic devices.',
    coverUrl: 'https://picsum.photos/seed/devices1/300/400',
    fileUrl: '/books/Electronic Devices and Circuit Theory.pdf'
  },
  {
    id: '6',
    title: 'Electronic Devices',
    author: 'Millman & Halkias',
    category: 'Engineering',
    uploadDate: '2024-01-24',
    content: 'Classic text on electronic devices.',
    coverUrl: 'https://picsum.photos/seed/devices2/300/400',
    fileUrl: '/books/Electronic-Devices-Millman_Halkias.pdf'
  },
  {
    id: '7',
    title: 'Elements of Electromagnetics',
    author: 'Sadiku',
    category: 'Physics',
    uploadDate: '2024-01-25',
    content: 'Electromagnetic field theory.',
    coverUrl: 'https://picsum.photos/seed/elem/300/400',
    fileUrl: '/books/Elements_of_Electromagnetics_Sadiku.pdf'
  },
  {
    id: '8',
    title: 'Signal & Systems Textbook',
    author: 'Unknown',
    category: 'Engineering',
    uploadDate: '2024-01-26',
    content: 'Textbook on signals and systems.',
    coverUrl: 'https://picsum.photos/seed/signals/300/400',
    fileUrl: '/books/Final_Signal-System-text-book.pdf'
  },
  {
    id: '9',
    title: 'Probability & Random Variables',
    author: 'Papoulis',
    category: 'Mathematics',
    uploadDate: '2024-01-27',
    content: 'Stochastic processes and probability.',
    coverUrl: 'https://picsum.photos/seed/prob/300/400',
    fileUrl: '/books/PROBABILITY_RANDOM_VARIABLES_AND_STOCHAS.pdf'
  },
  {
    id: '10',
    title: 'Introduction to Python',
    author: 'Daniel Liang',
    category: 'Computer Science',
    uploadDate: '2024-01-28',
    content: 'Introduction to programming using Python.',
    coverUrl: 'https://picsum.photos/seed/python/300/400',
    fileUrl: '/books/Python_Daniel_Liang.pdf'
  },
  {
    id: '11',
    title: 'Fundamentals of Digital Circuits',
    author: 'Anand Kumar',
    category: 'Engineering',
    uploadDate: '2024-01-29',
    content: 'Digital circuit design fundamentals.',
    coverUrl: 'https://picsum.photos/seed/digital/300/400',
    fileUrl: '/books/fundementals-of-digital-circuits(DCD).pdf'
  },
  {
    id: '12',
    title: 'Signals and Systems',
    author: 'Ananda Kumar',
    category: 'Engineering',
    uploadDate: '2024-01-30',
    content: 'Comprehensive coverage of signals and systems.',
    coverUrl: 'https://picsum.photos/seed/signals2/300/400',
    fileUrl: '/books/signals-and-systems-by-ananda-kumar-pdf-free.pdf'
  },
  {
    id: '13',
    title: 'Unit -1 - ES Material',
    author: 'Unknown',
    category: 'Engineering',
    uploadDate: '2024-02-01',
    content: 'Unit 1 study material for ES.',
    coverUrl: 'https://picsum.photos/seed/esmat/300/400',
    fileUrl: '/books/Unit -1 - ES Material-1.pdf'
  },
  {
    id: '14',
    title: 'Digital Communication Systems',
    author: 'Sanjay Sharma',
    category: 'Engineering',
    uploadDate: '2024-02-02',
    content: 'In-depth guide to digital communication systems.',
    coverUrl: 'https://picsum.photos/seed/digicomm/300/400',
    fileUrl: '/books/pdfcoffee.com_digital-communication-system-by-sanjay-sharma-pdf-free.pdf'
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

  const isAdmin = session?.user?.user_metadata?.is_admin === true;

  useEffect(() => {
    const initSession = async () => {
      if (!isSupabaseConfigured) {
        const localAuth = localStorage.getItem('eduvault_local_auth');
        if (localAuth === 'true') setSession({ user: { id: 'local-user', email: 'guest@eduvault.local' } });
        setIsAuthLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch { setSession(null); }
      finally { setIsAuthLoading(false); }
    };
    initSession();
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) setIsLocalMode(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
      const today = new Date().toISOString().split('T')[0];
      if (isLocalMode) {
        const stats = JSON.parse(localStorage.getItem('eduvault_study_stats') || '{}');
        stats[today] = (stats[today] || 0) + 1;
        localStorage.setItem('eduvault_study_stats', JSON.stringify(stats));
      } else {
        const { data: existing } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('date', today)
          .single();

        if (existing) {
          await supabase.from('study_sessions').update({ minutes: existing.minutes + 1 }).eq('id', existing.id);
        } else {
          await supabase.from('study_sessions').insert([{ user_id: session.user.id, date: today, minutes: 1 }]);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [session, isLocalMode]);

  useEffect(() => {
    if (!session) return;
    if (isLocalMode) {
      const savedDocs = localStorage.getItem('eduvault_docs_v4');
      const savedTasks = localStorage.getItem('eduvault_tasks');
      setDocuments(savedDocs ? JSON.parse(savedDocs) : INITIAL_DOCS);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    } else {
      fetchInitialData();
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
    } catch { setSyncStatus('error'); }
  };

  const handleDeleteDocument = async (id: string) => {
    setSyncStatus('syncing');
    try {
      if (isLocalMode) {
        const updated = documents.filter(d => d.id !== id);
        setDocuments(updated);
        localStorage.setItem('eduvault_docs_v4', JSON.stringify(updated));
      } else {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) throw error;
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
      addNotification('success', 'Deleted', 'Document removed from vault.');
      setSyncStatus('synced');
    } catch {
      addNotification('alert', 'Error', 'Failed to delete document.');
      setSyncStatus('error');
    }
  };

  const handleLogout = async () => {
    if (isLocalMode) { localStorage.removeItem('eduvault_local_auth'); setSession(null); }
    else { await supabase.auth.signOut(); setSession(null); }
  };

  const addNotification = useCallback((type: AppNotification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [{ id, type, title, message, timestamp: new Date() }, ...prev]);
    if (type === 'success' || type === 'task') soundService.playSuccess();
    else soundService.playAlert();
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

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

  if (!session) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginView onLogin={() => {
            if (!isSupabaseConfigured) { localStorage.setItem('eduvault_local_auth', 'true'); setSession({ user: { id: 'local-user' } }); }
            else { supabase.auth.getSession().then(({ data: { session } }) => setSession(session)); }
          }} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
        <NotificationSystem notifications={notifications} removeNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} syncStatus={syncStatus} />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Routes>
              <Route path="/" element={<div className="p-6 lg:p-10"><Dashboard documents={documents} /></div>} />
              <Route path="/search" element={<SearchView documents={documents} searchTerm={searchTerm} onSearchChange={setSearchTerm} />} />
              <Route path="/library" element={<LibraryViewComponent documents={documents} onRemove={handleDeleteDocument} />} />
              <Route path="/reader/:id" element={<Reader documents={documents} />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/stats" element={<Stats documents={documents} tasks={tasks} />} />
              <Route path="/planner" element={<Planner onNotify={addNotification} initialTasks={tasks} />} />
              <Route path="/profile" element={<ProfileView documents={documents} onLogout={handleLogout} />} />
              <Route path="/admin" element={isAdmin ? <AdminPortal documents={documents} onRemove={handleDeleteDocument} /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes >
          </main >
          <MobileBottomNav searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div >
      </div >
    </HashRouter >
  );
};

export default App;
