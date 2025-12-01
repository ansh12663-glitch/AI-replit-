import React, { useState } from 'react';
import { FileCode, FileJson, FileType, Plus, Trash2 } from 'lucide-react';
import { FileSystem } from '../types';

interface FileTreeProps {
  files: FileSystem;
  activeFile: string | null;
  onSelectFile: (filename: string) => void;
  onCreateFile: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, activeFile, onSelectFile, onCreateFile, onDeleteFile }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const getIcon = (name: string) => {
    if (name.endsWith('.html')) return <FileCode className="w-4 h-4 text-orange-400" />;
    if (name.endsWith('.css')) return <FileType className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.js') || name.endsWith('.ts')) return <FileCode className="w-4 h-4 text-yellow-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-green-400" />;
    return <FileType className="w-4 h-4 text-gray-400" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 text-gray-300">
      <div className="p-3 border-b border-dark-700 flex justify-between items-center">
        <span className="font-semibold text-sm">Files</span>
        <button 
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-dark-700 rounded transition-colors"
            title="New File"
        >
            <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="px-2 py-1">
            <input
              autoFocus
              type="text"
              className="w-full bg-dark-900 border border-fiesta-500 rounded px-2 py-1 text-xs focus:outline-none text-white"
              placeholder="filename.ext"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => setIsCreating(false)}
            />
          </form>
        )}

        {Object.keys(files).map((filename) => (
          <div
            key={filename}
            className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors text-sm ${
              activeFile === filename ? 'bg-dark-700 text-white border-l-2 border-fiesta-500' : 'hover:bg-dark-700/50'
            }`}
            onClick={() => onSelectFile(filename)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {getIcon(filename)}
              <span className="truncate">{filename}</span>
            </div>
            {filename !== 'index.html' && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFile(filename); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTree;
