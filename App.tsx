
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reader from './components/Reader';
import Notifications from './components/Notifications';
import Stats from './components/Stats';
import Planner from './components/Planner';
import MobileBottomNav from './components/MobileBottomNav';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import NotificationSystem from './components/NotificationSystem';
import { Document, AppNotification } from './types';
import { soundService } from './services/soundService';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Check auth session
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Failed to initialize Supabase session:', error);
        // We stay in a "logged out" state if the session check fails (e.g., misconfigured URL)
        setSession(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch documents from Supabase when session changes
  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Only show notification if we are actually trying to reach a real Supabase instance
      if (!process.env.SUPABASE_URL?.includes('placeholder')) {
        addNotification('alert', 'Connection Error', 'Could not fetch your documents from the vault.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setSession(null); // Force clear session state anyway
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
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== id));
      addNotification('success', 'Document Removed', 'The item was deleted from your vault.');
    } catch (error) {
      console.error('Error removing document:', error);
      addNotification('alert', 'Error', 'Failed to remove the document.');
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
          <Route path="/login" element={<LoginView onLogin={() => {}} />} />
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
            <Routes>
              <Route path="/" element={<div className="p-6 lg:p-10"><Dashboard /></div>} />
              <Route path="/search" element={<SearchView documents={documents} searchTerm={searchTerm} onSearchChange={setSearchTerm} />} />
              <Route path="/library" element={<LibraryView documents={documents} onRemove={removeDocument} />} />
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
