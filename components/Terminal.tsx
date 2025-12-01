import React, { useEffect, useRef } from 'react';
import { TerminalLog } from '../types';
import { Terminal as TerminalIcon, XCircle, Trash2 } from 'lucide-react';

interface TerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear, isOpen, onToggle }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) {
      return (
          <button 
            onClick={onToggle}
            className="absolute bottom-4 right-4 bg-dark-800 text-gray-300 p-2 rounded-full shadow-lg border border-dark-600 hover:text-white hover:border-fiesta-500 transition-all z-50"
          >
              <TerminalIcon className="w-5 h-5" />
          </button>
      )
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm border-t border-dark-700">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700 select-none">
        <div className="flex items-center gap-2 text-gray-400">
          <TerminalIcon className="w-4 h-4" />
          <span className="font-semibold text-xs tracking-wider uppercase">Console</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onClear} className="p-1 hover:text-red-400 transition-colors" title="Clear Console">
                <Trash2 className="w-3 h-3" />
            </button>
            <button onClick={onToggle} className="p-1 hover:text-white transition-colors">
                <XCircle className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.length === 0 && (
            <div className="text-gray-600 italic text-xs">Console is ready. Logs will appear here...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 break-all">
            <span className="opacity-50 text-[10px] min-w-[50px]">{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}</span>
            <span className={`
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'system' ? 'text-blue-400 italic' : ''}
            `}>
                {log.type === 'error' && '❌ '}
                {log.type === 'warn' && '⚠️ '}
                {log.type === 'success' && '✅ '}
                {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;