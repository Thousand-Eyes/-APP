import React, { useEffect, useRef } from 'react';
import { initBlocklyDefinitions } from '../services/blocklyManager';
import { Language } from '../types';
import { getTranslation } from '../services/translations';

interface BlocklyEditorProps {
  xmlContent: string;
  onCodeChange: (code: string) => void;
  language: Language;
}

export const BlocklyEditor: React.FC<BlocklyEditorProps> = ({ xmlContent, onCodeChange, language }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  // Initialize and manage Blockly instance
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const t = getTranslation(language);

    // Re-initialize block definitions with current language labels
    initBlocklyDefinitions(t.blocks);

    const Blockly = window.Blockly;
    
    // If workspace doesn't exist, create it
    if (!workspaceRef.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxXml(t),
        scrollbars: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#333',
          snap: true
        },
        theme: Blockly.Theme.defineTheme('dark', {
          'base': Blockly.Themes.Classic,
          'componentStyles': {
            'workspaceBackgroundColour': '#1e1e1e',
            'toolboxBackgroundColour': '#252526',
            'toolboxForegroundColour': '#fff',
            'flyoutBackgroundColour': '#252526',
            'flyoutForegroundColour': '#ccc',
            'flyoutOpacity': 1,
            'scrollbarColour': '#797979',
            'insertionMarkerColour': '#fff',
            'insertionMarkerOpacity': 0.3,
            'scrollbarOpacity': 0.4,
            'cursorColour': '#d0d0d0',
            'blackBackground': '#333'
          }
        })
      });

      const updateCode = () => {
        const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
        onCodeChange(code);
      };

      workspaceRef.current.addChangeListener(updateCode);

      // Initial resize to fit container
      const resizeObserver = new ResizeObserver(() => {
          Blockly.svgResize(workspaceRef.current);
      });
      resizeObserver.observe(blocklyDiv.current);

      return () => {
        // Cleanup if needed, though usually we keep workspace in this single page app
        resizeObserver.disconnect();
      };
    } else {
       // If workspace exists, update the Toolbox and Labels without destroying the workspace
       workspaceRef.current.updateToolbox(getToolboxXml(t));
       
       // Force refresh of blocks on workspace to pick up new labels? 
       // Blockly doesn't natively support hot-swapping block definitions for existing blocks easily without reloading xml.
       // We reload the XML to force redraw with new definitions.
       if (xmlContent) {
           workspaceRef.current.clear();
           const dom = Blockly.utils.xml.textToDom(xmlContent);
           Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
       }
    }
  }, [language]); // Re-run when language changes

  // Handle XML updates (Loading files or changing abstraction level)
  useEffect(() => {
    if (workspaceRef.current && xmlContent) {
        const Blockly = window.Blockly;
        workspaceRef.current.clear();
        const dom = Blockly.utils.xml.textToDom(xmlContent);
        Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
    }
  }, [xmlContent]);

  const getToolboxXml = (t: any) => `
    <xml>
      <category name="${t.toolbox.universal}" colour="230">
        <block type="universal_function"></block>
        <block type="universal_class"></block>
      </category>
      <category name="${t.toolbox.logic}" colour="290">
          <block type="universal_control"></block>
      </category>
      <category name="${t.toolbox.raw}" colour="0">
          <block type="raw_code"></block>
      </category>
    </xml>
  `;

  return (
    <div className="w-full h-full relative">
      <div ref={blocklyDiv} className="absolute inset-0" />
    </div>
  );
};
