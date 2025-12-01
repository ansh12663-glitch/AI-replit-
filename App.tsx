import React, { useState } from 'react';
import { Play, MessageSquare, Files as FilesIcon, Package as PackageIcon, LayoutTemplate, Settings } from 'lucide-react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Chat from './components/Chat';
import Terminal from './components/Terminal';
import PackageManager from './components/PackageManager';
import { generateResponse, simulateTerminalOutput, explainCode, fixCode } from './services/geminiService';
import { FileSystem, Message, Tab, Package, TerminalLog } from './types';

const INITIAL_FILES: FileSystem = {
  'index.html': {
    name: 'index.html',
    language: 'html',
    content: '<div class="container">\n  <h1>Hello RepliFiesta! 🪅</h1>\n  <p>Ask the AI to change this page.</p>\n  <button id="confetti-btn">Party Time!</button>\n  <div id="log-output"></div>\n</div>'
  },
  'style.css': {
    name: 'style.css',
    language: 'css',
    content: 'body {\n  font-family: "Inter", sans-serif;\n  background: #111;\n  color: white;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n.container {\n  text-align: center;\n  padding: 3rem;\n  border: 2px solid #ec4899;\n  border-radius: 1rem;\n  background: #1f1f1f;\n  box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.4);\n}\nbutton {\n  background: #ec4899;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  color: white;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-weight: 800;\n  margin-top: 1.5rem;\n  transition: all 0.2s;\n}\nbutton:hover {\n  background: #db2777;\n  transform: scale(1.05);\n}'
  },
  'script.js': {
    name: 'script.js',
    language: 'javascript',
    content: 'import confetti from "https://esm.sh/canvas-confetti";\n\nconsole.log("System initialized...");\n\ndocument.getElementById("confetti-btn").addEventListener("click", () => {\n  console.log("Party button clicked!");\n  confetti({\n    particleCount: 100,\n    spread: 70,\n    origin: { y: 0.6 }\n  });\n});'
  }
};

const App: React.FC = () => {
  const [files, setFiles] = useState<FileSystem>(INITIAL_FILES);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>('index.html');
  const [messages, setMessages] = useState<Message[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [fiestaMode, setFiestaMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FILES);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // --- LOGGING & TERMINAL ---
  const addLog = (type: 'info' | 'error' | 'warn' | 'success' | 'system', message: string) => {
    setTerminalLogs(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        type,
        message,
        timestamp: Date.now()
    }]);
  };

  const handleClearTerminal = () => setTerminalLogs([]);

  // --- FILE OPERATIONS ---
  const handleFileChange = (newContent: string) => {
    if (!activeFile) return;
    setFiles(prev => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], content: newContent }
    }));
  };

  const handleCreateFile = (filename: string) => {
    const ext = filename.split('.').pop() || 'txt';
    let lang: any = 'markdown';
    if (ext === 'js') lang = 'javascript';
    if (ext === 'html') lang = 'html';
    if (ext === 'css') lang = 'css';
    if (ext === 'json') lang = 'json';
    if (ext === 'py') lang = 'python';
    if (ext === 'java') lang = 'java';

    setFiles(prev => ({
      ...prev,
      [filename]: { name: filename, language: lang, content: '' }
    }));
    setActiveFile(filename);
    addLog('system', `Created file: ${filename}`);
  };

  const handleDeleteFile = (filename: string) => {
    const newFiles = { ...files };
    delete newFiles[filename];
    setFiles(newFiles);
    if (activeFile === filename) setActiveFile(Object.keys(newFiles)[0] || null);
    addLog('system', `Deleted file: ${filename}`);
  };

  // --- PACKAGE OPERATIONS ---
  const handleAddPackage = (name: string) => {
      if (!packages.find(p => p.name === name)) {
          setPackages(prev => [...prev, { name }]);
          addLog('success', `Added package: ${name}`);
      }
  };

  const handleRemovePackage = (name: string) => {
      setPackages(prev => prev.filter(p => p.name !== name));
      addLog('system', `Removed package: ${name}`);
  };

  // --- AI OPERATIONS ---
  const extractCodeFromResponse = (text: string) => {
      const regex = /```(\w+)\n([\s\S]*?)```/g;
      let match;
      let newFiles = { ...files };
      let updated = false;

      while ((match = regex.exec(text)) !== null) {
          const lang = match[1];
          const content = match[2];
          
          // Heuristics for file matching
          let targetFile = activeFile;
          if (lang === 'html') targetFile = 'index.html';
          if (lang === 'css') targetFile = 'style.css';
          if (lang === 'javascript' || lang === 'js') targetFile = 'script.js';
          if (lang === 'python') targetFile = 'main.py';

          if (targetFile && newFiles[targetFile]) {
              newFiles[targetFile] = { ...newFiles[targetFile], content };
              updated = true;
              addLog('success', `AI updated ${targetFile}`);
          }
      }

      if (updated) {
          setFiles(newFiles);
          setRefreshTrigger(prev => prev + 1);
      }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setActiveTab(Tab.CHAT);

    try {
      const responseText = await generateResponse(messages, text, files, fiestaMode);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
      extractCodeFromResponse(responseText);
    } catch (err) {
      addLog('error', 'AI Failed to respond');
    } finally {
      setIsThinking(false);
    }
  };

  const handleAiAction = async (action: 'explain' | 'fix' | 'document', selection: string) => {
      setIsThinking(true);
      setActiveTab(Tab.CHAT);
      
      let prompt = "";
      if (action === 'explain') prompt = `Explain this code:\n\`\`\`\n${selection}\n\`\`\``;
      if (action === 'fix') prompt = `Fix this code:\n\`\`\`\n${selection}\n\`\`\``;
      if (action === 'document') prompt = `Add documentation/comments to this code:\n\`\`\`\n${selection}\n\`\`\``;
      
      // Add a user message to chat to show what happened
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: prompt, timestamp: Date.now() }]);

      try {
          // Use specific services for better quality, or fallback to general chat
          let responseText = "";
          if (action === 'explain') responseText = await explainCode(selection, activeFile || '');
          else if (action === 'fix') responseText = await fixCode(selection, "Potential bug or improvement needed");
          else responseText = await generateResponse(messages, prompt, files, fiestaMode);

          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
          }]);
          
          if (action !== 'explain') extractCodeFromResponse(responseText);

      } catch (e) {
          addLog('error', `AI Action ${action} failed`);
      } finally {
          setIsThinking(false);
      }
  };

  const handleRun = async () => {
    addLog('system', '--- Executing ---');
    
    // Web Project
    if (files['index.html']) {
        setRefreshTrigger(prev => prev + 1);
        addLog('success', 'Preview refreshed');
    }

    // Backend Simulation for non-web files
    if (activeFile) {
        const file = files[activeFile];
        if (['python', 'java'].includes(file.language)) {
             addLog('system', `Compiling ${file.name} (Simulated)...`);
             const output = await simulateTerminalOutput(file.content, file.language);
             addLog('info', output);
        }
    }
  };

  // --- LAYOUT RENDER ---
  return (
    <div className={`flex h-screen w-full overflow-hidden bg-dark-900 text-gray-100 font-sans ${fiestaMode ? 'selection:bg-fiesta-500 selection:text-white' : ''}`}>
      
      {/* 1. LEFT ICON BAR */}
      <div className="w-14 flex flex-col items-center py-4 bg-dark-900 border-r border-dark-800 gap-4 z-20 flex-none">
         <div className="p-2 bg-gradient-to-br from-fiesta-500 to-purple-600 rounded-lg shadow-lg mb-2 cursor-pointer" onClick={() => setFiestaMode(!fiestaMode)}>
            <LayoutTemplate className={`w-5 h-5 text-white ${fiestaMode ? 'animate-spin-slow' : ''}`} />
         </div>
         
         <TabButton icon={<FilesIcon />} active={activeTab === Tab.FILES} onClick={() => setActiveTab(Tab.FILES)} tooltip="Files" />
         <TabButton icon={<PackageIcon />} active={activeTab === Tab.PACKAGES} onClick={() => setActiveTab(Tab.PACKAGES)} tooltip="Packages" />
         <TabButton icon={<MessageSquare />} active={activeTab === Tab.CHAT} onClick={() => setActiveTab(Tab.CHAT)} tooltip="AI Chat" />
         
         <div className="mt-auto flex flex-col gap-4">
             <TabButton icon={<Settings />} active={activeTab === Tab.SETTINGS} onClick={() => setActiveTab(Tab.SETTINGS)} tooltip="Settings" />
         </div>
      </div>

      {/* 2. SECONDARY SIDEBAR (Contextual) */}
      <div className={`flex flex-col border-r border-dark-800 bg-dark-800 z-10 transition-all duration-300 ease-in-out flex-none ${activeTab === Tab.CHAT ? 'w-80' : 'w-64'}`}>
          {activeTab === Tab.FILES && (
              <FileTree 
                files={files} 
                activeFile={activeFile} 
                onSelectFile={setActiveFile} 
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
              />
          )}
          {activeTab === Tab.PACKAGES && (
              <PackageManager packages={packages} onAdd={handleAddPackage} onRemove={handleRemovePackage} />
          )}
          {activeTab === Tab.CHAT && (
              <Chat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isThinking={isThinking}
                fiestaMode={fiestaMode}
              />
          )}
           {activeTab === Tab.SETTINGS && (
              <div className="p-4 text-gray-400 text-sm">
                  <h3 className="font-bold text-white mb-4">Settings</h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                          <span>Fiesta Mode</span>
                          <button onClick={() => setFiestaMode(!fiestaMode)} className={`w-8 h-4 rounded-full ${fiestaMode ? 'bg-fiesta-500' : 'bg-gray-600'} transition-colors relative`}>
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${fiestaMode ? 'left-4.5' : 'left-0.5'}`} />
                          </button>
                      </div>
                      <p className="text-xs opacity-60">
                          {fiestaMode ? "AI persona is fun and energetic. Visuals are enhanced." : "AI persona is strict and professional."}
                      </p>
                  </div>
              </div>
          )}
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
        
        {/* Top Navigation Bar */}
        <div className="h-12 border-b border-dark-800 flex items-center justify-between px-4 bg-dark-900 flex-none z-10">
           <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-300">{activeFile || 'Welcome'}</span>
              {activeFile && <span className="text-xs px-2 py-0.5 rounded bg-dark-800 text-gray-500">{files[activeFile].language}</span>}
           </div>
           
           <button 
                onClick={handleRun}
                className={`flex items-center gap-2 px-6 py-1.5 text-xs font-bold rounded transition-all shadow-lg
                ${fiestaMode 
                    ? 'bg-gradient-to-r from-fiesta-600 to-purple-600 hover:from-fiesta-500 hover:to-purple-500 text-white animate-pulse-slow' 
                    : 'bg-green-700 hover:bg-green-600 text-white'}`}
            >
                <Play className="w-3 h-3 fill-current" />
                RUN
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            {/* Editor Pane */}
            <div className={`flex-1 border-r border-dark-800 relative flex flex-col min-w-[300px]`}>
                {activeFile ? (
                    <Editor 
                        value={files[activeFile].content}
                        onChange={handleFileChange}
                        language={files[activeFile].language}
                        onAiAction={handleAiAction}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                        <FilesIcon className="w-16 h-16 opacity-20" />
                        <p>Select a file to start coding</p>
                    </div>
                )}
            </div>

            {/* Preview & Terminal Pane (Split Vertical) */}
            <div className="w-[45%] flex flex-col min-w-[300px] bg-dark-900 border-l border-dark-800">
                {/* Preview Top */}
                <div className={`flex flex-col relative transition-all duration-300 ${isTerminalOpen ? 'h-[60%]' : 'flex-1 h-full'}`}>
                    <div className="h-8 bg-dark-800 border-b border-dark-700 flex items-center px-3 gap-2 flex-none">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                         </div>
                         <div className="ml-2 flex-1 text-center">
                            <span className="text-[10px] text-gray-500 font-mono bg-dark-900 px-3 py-0.5 rounded-full">RepliFiesta Preview</span>
                         </div>
                    </div>
                    
                    {/* Preview Container - Flex Grow to fill space */}
                    <div className="flex-1 min-h-0 relative bg-white overflow-hidden">
                        <Preview 
                            files={files} 
                            packages={packages} 
                            refreshTrigger={refreshTrigger} 
                            onLog={addLog}
                        />
                         {fiestaMode && <div className="absolute inset-0 pointer-events-none border-[6px] border-fiesta-500/10 z-50"></div>}
                    </div>
                </div>
                
                {/* Terminal Bottom */}
                <div className={`transition-all duration-300 flex flex-col ${isTerminalOpen ? 'h-[40%] border-t border-dark-700' : 'h-10 flex-none'}`}>
                     <Terminal 
                        logs={terminalLogs} 
                        onClear={handleClearTerminal} 
                        isOpen={isTerminalOpen}
                        onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
                     />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ icon, active, onClick, tooltip }: any) => (
    <button 
        onClick={onClick}
        title={tooltip}
        className={`p-2.5 rounded-xl transition-all duration-200 group relative ${active ? 'bg-dark-700 text-fiesta-400 shadow-inner' : 'text-gray-500 hover:text-gray-300 hover:bg-dark-800'}`}
    >
        {React.cloneElement(icon, { className: "w-5 h-5" })}
    </button>
);

export default App;