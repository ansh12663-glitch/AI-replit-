import React, { useEffect, useRef, useState } from 'react';
import { FileSystem, Package } from '../types';

interface PreviewProps {
  files: FileSystem;
  packages: Package[];
  refreshTrigger: number;
  onLog: (type: 'info' | 'error' | 'warn', message: string) => void;
}

const Preview: React.FC<PreviewProps> = ({ files, packages, refreshTrigger, onLog }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Safety: escape closing script tags in content to prevent breaking the HTML parser
    const safeContent = (content: string) => content.replace(/<\/script>/g, '<\\/script>');

    const htmlFile = safeContent(files['index.html']?.content || '<h1>No index.html found</h1>');
    const cssFile = safeContent(files['style.css']?.content || '');
    const jsFile = safeContent(files['script.js']?.content || '');

    // Construct Import Map for packages
    const imports = packages.reduce((acc, pkg) => {
        acc[pkg.name] = `https://esm.sh/${pkg.name}${pkg.version ? '@'+pkg.version : ''}`;
        return acc;
    }, {} as Record<string, string>);

    const importMap = JSON.stringify({ imports }, null, 2);

    // Console interceptor script
    const consoleInterceptor = `
      <script>
        (function() {
          const oldLog = console.log;
          const oldError = console.error;
          const oldWarn = console.warn;
          
          function sendToParent(type, args) {
             try {
               const message = args.map(arg => {
                 if (typeof arg === 'object') return JSON.stringify(arg);
                 return String(arg);
               }).join(' ');
               window.parent.postMessage({ type: 'CONSOLE_LOG', logType: type, message }, '*');
             } catch (e) {}
          }

          console.log = function(...args) {
            oldLog.apply(console, args);
            sendToParent('info', args);
          };
          console.error = function(...args) {
            oldError.apply(console, args);
            sendToParent('error', args);
          };
          console.warn = function(...args) {
            oldWarn.apply(console, args);
            sendToParent('warn', args);
          };
          
          window.onerror = function(msg, url, line) {
            sendToParent('error', [msg + ' (line ' + line + ')']);
            return false;
          };
        })();
      </script>
    `;

    // Bundling
    // We use srcdoc instead of blob url to avoid some sandbox restrictions
    const combinedContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>${cssFile}</style>
          <script type="importmap">${importMap}</script>
          ${consoleInterceptor}
        </head>
        <body>
          ${htmlFile}
          <script type="module">
            try {
              ${jsFile}
            } catch (err) {
              console.error(err);
            }
          </script>
        </body>
      </html>
    `;

    // Set srcdoc directly
    iframeRef.current.srcdoc = combinedContent;

  }, [files, packages, refreshTrigger]);

  useEffect(() => {
      const handler = (event: MessageEvent) => {
          if (event.data && event.data.type === 'CONSOLE_LOG') {
              onLog(event.data.logType, event.data.message);
          }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
  }, [onLog]);

  return (
    <div className="preview-wrapper w-full h-full flex flex-col bg-white overflow-hidden relative">
      <iframe
        ref={iframeRef}
        title="Live Preview"
        className="preview-iframe absolute inset-0 w-full h-full border-none block bg-white"
        sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default Preview;