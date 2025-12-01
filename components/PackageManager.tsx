import React, { useState } from 'react';
import { Package, Plus, Trash2, Box } from 'lucide-react';
import { Package as PackageType } from '../types';

interface PackageManagerProps {
  packages: PackageType[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ packages, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 text-gray-300">
      <div className="p-3 border-b border-dark-700 flex items-center gap-2">
        <Box className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-sm">Packages (NPM)</span>
      </div>

      <div className="p-3 border-b border-dark-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white"
            placeholder="e.g. react, lodash, three"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-gray-500 mt-2">
            Packages are loaded via esm.sh. Use ES modules in your code.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {packages.length === 0 && (
            <div className="text-center text-gray-600 text-xs mt-4">No packages added</div>
        )}
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className="flex items-center justify-between px-3 py-2 bg-dark-700/50 rounded text-sm group"
          >
            <span className="font-mono text-xs text-blue-300">{pkg.name}</span>
            <button 
                onClick={() => onRemove(pkg.name)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
                <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageManager;