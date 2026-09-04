export type ThemeMode = 'cyber-dark' | 'midnight-oled' | 'nordic-light';

export interface TranscriptSegment {
  id: string;
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface AudioRecording {
  id: string;
  title: string;
  date: string;
  duration: number; // seconds
  audioUrl?: string;
  fileName?: string;
  transcript: string;
  segments: TranscriptSegment[];
}

export type NoteTemplateId = 
  | 'executive-brief' 
  | 'action-items' 
  | 'study-flashcards' 
  | 'meeting-minutes' 
  | 'mind-map' 
  | 'custom-prompt';

export interface NoteTemplate {
  id: NoteTemplateId;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface MindMapNode {
  id: string;
  title: string;
  children?: MindMapNode[];
}

export interface CustomNote {
  id: string;
  recordingId: string;
  title: string;
  date: string;
  templateId: NoteTemplateId;
  summary: string;
  contentMarkdown: string;
  actionItems?: ActionItem[];
  flashcards?: Flashcard[];
  mindMap?: MindMapNode[];
  tags: string[];
  customPrompt?: string;
}

export interface SampleRecording {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'Business Strategy' | 'Academia & Physics' | 'Agile Team Standup';
  audioUrl?: string;
  transcript: string;
  segments: TranscriptSegment[];
}
