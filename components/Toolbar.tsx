import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../services/translations';

interface ToolbarProps {
  onOpenFolder: () => void;
  onSave: () => void;
  abstractionLevel: number;
  setAbstractionLevel: (level: number) => void;
  fileName?: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onOpenFolder, 
  onSave, 
  abstractionLevel, 
  setAbstractionLevel,
  fileName,
  language,
  setLanguage
}) => {
  const t = getTranslation(language);

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-blue-400 tracking-wider">
          <span className="text-white">Code</span>Transmute
        </h1>
        <div className="h-6 w-px bg-gray-600 mx-2"></div>
        <button 
          onClick={onOpenFolder}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          {t.openProject}
        </button>
        <button 
          onClick={onSave}
          disabled={!fileName}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          {t.export}
        </button>
      </div>

      <div className="flex items-center gap-6">
        {fileName && <span className="text-gray-400 text-sm font-mono">{fileName}</span>}
        
        {/* Language Selector */}
        <div className="flex bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <button 
            onClick={() => setLanguage('zh-TW')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${language === 'zh-TW' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            繁中
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            EN
          </button>
        </div>

        {/* Abstraction Slider */}
        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
          <span className="text-xs text-gray-400 uppercase tracking-wide">{t.abstraction}</span>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="1"
            value={abstractionLevel}
            onChange={(e) => setAbstractionLevel(parseInt(e.target.value))}
            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs font-mono text-blue-300 w-16 text-right">
            {t.levels[abstractionLevel as 1 | 2 | 3]}
          </span>
        </div>
      </div>
    </div>
  );
};
