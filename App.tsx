
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
import NotificationSystem from './components/NotificationSystem';
import { Document, AppNotification } from './types';
import { soundService } from './services/soundService';

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
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('eduvault_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('eduvault_docs', JSON.stringify(documents));
  }, [documents]);

  const addNotification = useCallback((type: AppNotification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { id, type, title, message, timestamp: new Date() };
    setNotifications(prev => [newNotif, ...prev]);
    
    if (type === 'success' || type === 'task') soundService.playSuccess();
    else soundService.playAlert();

    // Auto remove after 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const removeDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

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
              <Route path="/profile" element={<ProfileView documents={documents} />} />
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
