
export interface Document {
  id: string;
  title: string;
  author: string;
  category: string;
  uploadDate: string;
  content: string;
  coverUrl?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  category: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  time: string; // 24h format HH:mm
  duration: number; // in minutes
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'alert' | 'task';
  title: string;
  message: string;
  timestamp: Date;
}

export enum LibraryView {
  DASHBOARD = 'dashboard',
  READER = 'reader',
  SETTINGS = 'settings',
  NOTEBOOK = 'notebook'
}
