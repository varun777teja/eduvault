
export type SourceType = 'pdf' | 'url' | 'text' | 'youtube';

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  content: string;
  isQuestionPaper?: boolean;
  selected: boolean; // New property for source filtering
  metadata?: any;
  originalData?: string; // Base64 encoded original file data (for PDFs)
}

export interface Citation {
  sourceId: string;
  quote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  thinking?: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  group: number;
  importance: number; // 1-10
  keyPoints: string[];
}

export interface MindMapLink {
  source: string;
  target: string;
  value: number;
}

export interface RoadmapStep {
  title: string;
  description: string;
  topics: string[];
  isFuture?: boolean;
}

export interface MindMapData {
  nodes: MindMapNode[];
  links: MindMapLink[];
  roadmap: RoadmapStep[];
}
