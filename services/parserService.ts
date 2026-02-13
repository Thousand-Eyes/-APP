import { ASTNode, NodeType, SupportedLanguage } from '../types';

/**
 * NOTE: In a full production environment, this service would import 'web-tree-sitter'.
 * 
 * Input: Source Code String
 * Output: Unified AST (Abstract Syntax Tree)
 * 
 * Since we cannot load WASM files in this demo environment easily, 
 * this class implements a "Heuristic Parser" that mimics Tree-sitter's output 
 * by using Regex to detect functions, classes, and control flow.
 */

export class UniversalParser {
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public parse(code: string, language: SupportedLanguage): ASTNode {
    const lines = code.split('\n');
    const root: ASTNode = {
      id: 'root',
      type: NodeType.PROGRAM,
      children: [],
      label: 'Main Program'
    };

    let currentParent: ASTNode = root;
    let stack: { node: ASTNode; indent: number }[] = [{ node: root, indent: -1 }];

    // Heuristic parsing logic (Simplified for demo purposes)
    // This allows the UI to demonstrate the "Abstraction" and "Blockly" features 
    // without crashing due to missing .wasm files.
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      const indent = line.search(/\S|$/);
      
      // Determine parent based on indentation (Python-style logic applied loosely to all for demo)
      // or simplistic brace counting for JS/Java.
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      currentParent = stack[stack.length - 1].node;

      let newNode: ASTNode | null = null;

      // Detection Logic
      if (this.isFunction(trimmed, language)) {
        newNode = {
          id: this.generateId(),
          type: NodeType.FUNCTION,
          label: this.extractName(trimmed, 'function'),
          children: [],
          startLine: index
        };
      } else if (this.isClass(trimmed, language)) {
        newNode = {
          id: this.generateId(),
          type: NodeType.CLASS,
          label: this.extractName(trimmed, 'class'),
          children: [],
          startLine: index
        };
      } else if (this.isControlFlow(trimmed)) {
        newNode = {
          id: this.generateId(),
          type: trimmed.startsWith('for') || trimmed.startsWith('while') ? NodeType.LOOP : NodeType.IF_STATEMENT,
          content: trimmed,
          children: [],
          startLine: index
        };
      } else {
        // Raw Code Line
        newNode = {
          id: this.generateId(),
          type: NodeType.RAW_CODE,
          content: trimmed,
          children: [],
          startLine: index
        };
      }

      if (newNode) {
        currentParent.children.push(newNode);
        // If it's a container type, push to stack
        if ([NodeType.FUNCTION, NodeType.CLASS, NodeType.IF_STATEMENT, NodeType.LOOP].includes(newNode.type)) {
          stack.push({ node: newNode, indent });
        }
      }
    });

    return root;
  }

  private isFunction(line: string, lang: SupportedLanguage): boolean {
    if (lang === 'python') return line.startsWith('def ');
    return line.includes('function ') || (line.includes('(') && line.includes(')') && (line.includes('{') || line.endsWith(':')));
  }

  private isClass(line: string, lang: SupportedLanguage): boolean {
    return line.startsWith('class ');
  }

  private isControlFlow(line: string): boolean {
    return line.startsWith('if ') || line.startsWith('for ') || line.startsWith('while ') || line.startsWith('else');
  }

  private extractName(line: string, kind: 'function' | 'class'): string {
    // Simple regex extraction for demo
    const match = line.match(/(?:def|class|function)\s+([a-zA-Z0-9_]+)/);
    return match ? match[1] : (kind === 'function' ? 'anonymous' : 'Class');
  }
}

export const parserInstance = new UniversalParser();