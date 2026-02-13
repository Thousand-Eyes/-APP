import React, { useState, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { FileTree } from './components/FileTree';
import { BlocklyEditor } from './components/BlocklyEditor';
import { FileNode, SupportedLanguage, Language } from './types';
import { parserInstance } from './services/parserService';
import { generateBlocklyXML } from './services/blocklyMapper';
import { getTranslation } from './services/translations';

// Mock data for environments where File System API is blocked (e.g. iframes)
const MOCK_PROJECT_ROOT: FileNode = {
  name: 'demo-project',
  kind: 'directory',
  handle: {} as any, 
  path: 'demo-project/',
  children: [
    {
      name: 'math_utils.py',
      kind: 'file',
      handle: {
        kind: 'file',
        getFile: async () => new File([`
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

class Calculator:
    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            return None
        return a / b
`], 'math_utils.py')
      } as any,
      path: 'demo-project/math_utils.py'
    },
    {
      name: 'app.js',
      kind: 'file',
      handle: {
        kind: 'file',
        getFile: async () => new File([`
function initApp() {
  console.log("App starting...");
  const user = authenticate();
  if (user) {
    loadDashboard();
  } else {
    redirectToLogin();
  }
}

class UserManager {
  createUser(name) {
    // Create logic
    return { name: name };
  }
}
`], 'app.js')
      } as any,
      path: 'demo-project/app.js'
    },
    {
      name: 'logic',
      kind: 'directory',
      handle: {} as any,
      path: 'demo-project/logic/',
      children: [
         {
            name: 'core.ts',
            kind: 'file',
            handle: {
                kind: 'file',
                getFile: async () => new File([`
function coreLoop() {
  while (true) {
    update();
    render();
  }
}
`], 'core.ts')
            } as any,
            path: 'demo-project/logic/core.ts'
         }
      ]
    }
  ]
};

export default function App() {
  const [rootNode, setRootNode] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('// Select a file to view blocks');
  const [abstractionLevel, setAbstractionLevel] = useState<number>(3); // 1: Arch, 2: Logic, 3: Raw
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('zh-TW'); // Default to Traditional Chinese

  const t = getTranslation(language);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenFolder = async () => {
    try {
      // Check if API is available
      if (!window.showDirectoryPicker) {
         throw new Error("File System Access API not supported");
      }
      
      const dirHandle = await window.showDirectoryPicker();
      const node = await processDirectory(dirHandle);
      setRootNode(node);
      showNotification(t.loading);
    } catch (err: any) {
      console.warn("File System Error or Cancelled:", err);
      
      // Fallback for iframe/security restrictions or cancellation
      const isSecurityError = err.name === 'SecurityError' || (err.message && (err.message.includes('Cross origin') || err.message.includes('security')));
      const isNotSupported = !window.showDirectoryPicker || (err.message && err.message.includes('not supported'));

      // In this demo context, if it fails, we load the demo project so the user can verify functionality.
      if (isSecurityError || isNotSupported || err.name !== 'AbortError') {
        setRootNode(MOCK_PROJECT_ROOT);
        showNotification(t.demoMsg);
      }
    }
  };

  const processDirectory = async (handle: FileSystemDirectoryHandle, path = ''): Promise<FileNode> => {
    const node: FileNode = {
      name: handle.name,
      kind: 'directory',
      handle,
      children: [],
      path: path + handle.name + '/'
    };
    
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        node.children?.push(await processDirectory(entry as FileSystemDirectoryHandle, node.path));
      } else {
        node.children?.push({
          name: entry.name,
          kind: 'file',
          handle: entry as FileSystemFileHandle,
          path: node.path + entry.name
        });
      }
    }
    // Sort directories first
    node.children?.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'directory' ? -1 : 1));
    return node;
  };

  const handleSelectFile = async (node: FileNode) => {
    setSelectedFile(node);
    
    try {
        const file = await (node.handle as FileSystemFileHandle).getFile();
        const text = await file.text();
        
        // Guess language
        let lang: SupportedLanguage = 'unknown';
        if (node.name.endsWith('.py')) lang = 'python';
        if (node.name.endsWith('.js')) lang = 'javascript';
        if (node.name.endsWith('.ts')) lang = 'typescript';
        if (node.name.endsWith('.java')) lang = 'java';
        
        // Parse using our service
        const ast = parserInstance.parse(text, lang);
        
        // Convert AST to XML based on abstraction
        const xml = generateBlocklyXML(ast, abstractionLevel);
        setXmlContent(xml);
    } catch (e) {
        console.error("Error reading file", e);
        showNotification(t.errorRead);
    }
  };

  // Re-generate XML when slider changes (if file is selected)
  React.useEffect(() => {
    if (selectedFile) {
        handleSelectFile(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abstractionLevel]);

  const handleSave = () => {
    alert("Export feature would write back: \n\n" + generatedCode);
    // In a real app:
    // const writable = await (selectedFile.handle as FileSystemFileHandle).createWritable();
    // await writable.write(generatedCode);
    // await writable.close();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden font-sans">
      <Toolbar 
        onOpenFolder={handleOpenFolder} 
        onSave={handleSave} 
        abstractionLevel={abstractionLevel}
        setAbstractionLevel={setAbstractionLevel}
        fileName={selectedFile?.name}
        language={language}
        setLanguage={setLanguage}
      />
      
      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-20 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'w-64' : 'w-0'} 
          bg-gray-850 border-r border-gray-700 transition-all duration-300 flex flex-col
        `}>
          <div className="p-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
            <span>{t.projectExplorer}</span>
            <button onClick={() => setSidebarOpen(false)} className="hover:text-white">«</button>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {rootNode ? (
              <FileTree node={rootNode} onSelectFile={handleSelectFile} />
            ) : (
              <div className="text-gray-500 text-sm text-center mt-10 p-4">
                <p className="mb-2">{t.clickToOpen}</p>
                <p className="text-xs text-gray-600">{t.securityNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle (Visible when closed) */}
        {!sidebarOpen && (
          <div 
            className="w-8 bg-gray-800 border-r border-gray-700 cursor-pointer flex items-center justify-center hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            »
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col relative">
           {/* Blockly Area */}
           <div className="flex-1 relative bg-gray-100">
             <BlocklyEditor xmlContent={xmlContent} onCodeChange={setGeneratedCode} language={language} />
           </div>
           
           {/* Code Preview (Bottom Panel) */}
           <div className="h-48 bg-gray-950 border-t border-gray-700 flex flex-col">
             <div className="bg-gray-800 px-4 py-1 text-xs text-gray-400 font-mono border-b border-gray-700">
               {t.generatedCodePreview}
             </div>
             <pre className="flex-1 p-4 overflow-auto text-sm font-mono text-green-400">
               {generatedCode}
             </pre>
           </div>
        </div>
      </div>
    </div>
  );
}
