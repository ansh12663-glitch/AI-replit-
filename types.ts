export interface FileData {
  name: string;
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'python' | 'java';
  content: string;
}

export interface FileSystem {
  [filename: string]: FileData;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface TerminalLog {
  id: string;
  type: 'info' | 'error' | 'warn' | 'system' | 'success';
  message: string;
  timestamp: number;
}

export interface Package {
  name: string;
  version?: string;
}

export type ViewMode = 'editor' | 'preview' | 'split';

export enum Tab {
  FILES = 'FILES',
  PACKAGES = 'PACKAGES',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
}

export interface AppState {
  files: FileSystem;
  packages: Package[];
  activeFile: string | null;
  messages: Message[];
  terminalLogs: TerminalLog[];
  isThinking: boolean;
  fiestaMode: boolean;
  activeTab: Tab;
}