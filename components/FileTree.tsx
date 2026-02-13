import React, { useState } from 'react';
import { FileNode } from '../types';

interface FileTreeProps {
  node: FileNode;
  onSelectFile: (node: FileNode) => void;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ node, onSelectFile, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (node.kind === 'directory') {
      setExpanded(!expanded);
    } else {
      onSelectFile(node);
    }
  };

  const isDir = node.kind === 'directory';
  const paddingLeft = `${level * 12 + 12}px`;

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`flex items-center py-1 cursor-pointer hover:bg-gray-700 transition-colors text-sm
          ${!isDir ? 'text-gray-300' : 'text-blue-300 font-medium'}
        `}
        style={{ paddingLeft }}
      >
        <span className="mr-2 opacity-70 w-4 text-center">
          {isDir ? (expanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      
      {isDir && expanded && node.children && (
        <div className="border-l border-gray-700 ml-4">
          {node.children.map((child) => (
            <FileTree 
              key={child.path} 
              node={child} 
              onSelectFile={onSelectFile} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};