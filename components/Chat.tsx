import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Code2 } from 'lucide-react';
import { Message } from '../types';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  fiestaMode: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isThinking, fiestaMode }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 text-gray-200">
      <div className={`p-4 border-b border-dark-700 flex justify-between items-center ${fiestaMode ? 'bg-gradient-to-r from-dark-800 to-purple-900/30' : ''}`}>
        <div className="flex items-center gap-2">
            <Bot className={`w-5 h-5 ${fiestaMode ? 'text-fiesta-400 animate-pulse' : 'text-blue-400'}`} />
            <span className="font-bold tracking-tight">RepliFiesta Chat</span>
        </div>
        {fiestaMode && <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Code2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Start coding or ask a question!</p>
            <p className="text-xs mt-2 opacity-60">Try "Create a simple calculator" or "Explain index.html"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-fiesta-600 text-white rounded-br-sm'
                  : 'bg-dark-700 text-gray-100 rounded-bl-sm border border-dark-600'
              } ${msg.isError ? 'bg-red-900/50 border-red-500' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                 {msg.role === 'user' ? <User className="w-3 h-3"/> : <Bot className="w-3 h-3"/>}
                 <span>{msg.role === 'user' ? 'You' : 'AI'}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
             <div className="bg-dark-700 rounded-2xl rounded-bl-sm px-4 py-3 border border-dark-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-fiesta-400" />
                <span className="text-xs text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-700 bg-dark-900/50">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-dark-900 border border-dark-600 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-fiesta-500 transition-colors text-white"
            placeholder="Ask AI to generate code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1.5 p-1.5 bg-fiesta-600 hover:bg-fiesta-500 disabled:bg-gray-700 text-white rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
