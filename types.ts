// File System Types
export interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  children?: FileNode[];
  path: string;
}

// AST Types for Universal Mapping
export enum NodeType {
  PROGRAM = 'PROGRAM',
  FUNCTION = 'FUNCTION',
  CLASS = 'CLASS',
  IF_STATEMENT = 'IF_STATEMENT',
  LOOP = 'LOOP',
  VARIABLE_DEF = 'VARIABLE_DEF',
  RETURN = 'RETURN',
  RAW_CODE = 'RAW_CODE', // Fallback for complex/unknown syntax
  BLOCK_GROUP = 'BLOCK_GROUP' // Generic container
}

export interface ASTNode {
  id: string;
  type: NodeType;
  label?: string; // Function name, variable name, etc.
  content?: string; // Raw code content or condition string
  children: ASTNode[];
  startLine?: number;
  endLine?: number;
}

// Blockly Types (Global form loaded via script)
declare global {
  interface Window {
    Blockly: any;
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'unknown';

export type Language = 'zh-TW' | 'en';
