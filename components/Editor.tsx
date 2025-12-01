import React, { useState } from 'react';
import { Sparkles, Bug, BookOpen, Wand2 } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  onAiAction: (action: 'explain' | 'fix' | 'document', selection: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, language, readOnly, onAiAction }) => {
  const [selection, setSelection] = useState('');

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
    setSelection(selectedText);
  };

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden flex flex-col group">
       {/* Editor Toolbar */}
       <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700 select-none">
         <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-fiesta-400 uppercase font-bold tracking-wider">{language}</span>
            <span className="text-xs text-gray-500">| {value.split('\n').length} lines</span>
         </div>
         
         {/* AI Actions Floating Menu (Visible when selection or always for file) */}
         <div className="flex items-center gap-1">
             <button 
                onClick={() => onAiAction('explain', selection || value)}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-dark-700 text-xs text-gray-300 rounded transition-colors"
                title="Explain Code"
             >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Explain</span>
             </button>
             <button 
                onClick={() => onAiAction('fix', selection || value)}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-dark-700 text-xs text-gray-300 rounded transition-colors"
                title="Find Bugs"
             >
                <Bug className="w-3 h-3" />
                <span className="hidden sm:inline">Debug</span>
             </button>
             <button 
                onClick={() => onAiAction('document', selection || value)}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-dark-700 text-xs text-fiesta-400 rounded transition-colors"
                title="Auto Complete / Magic"
             >
                <Wand2 className="w-3 h-3" />
                <span className="hidden sm:inline">Magic</span>
             </button>
         </div>
       </div>

      <div className="relative flex-1">
        {/* Simple Line Numbers (Visual only, aligned with textarea) */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-dark-900 border-r border-dark-800 pt-4 text-right pr-2 select-none overflow-hidden text-gray-600 font-mono text-sm leading-relaxed hidden sm:block">
            {value.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
        </div>

        <textarea
            className="absolute inset-0 w-full h-full p-4 sm:pl-12 bg-transparent text-gray-100 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-fiesta-900 selection:text-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            spellCheck={false}
            readOnly={readOnly}
            style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
};

export default Editor;