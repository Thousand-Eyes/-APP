import { ASTNode, NodeType } from '../types';

/**
 * Maps the generic AST to Blockly XML format.
 * Implements the "Abstraction Level" logic.
 * 
 * Level 1: High Abstraction (Architecture only: Classes, Functions).
 * Level 2: Medium Abstraction (Includes Control Flow, hides implementation details).
 * Level 3: Low Abstraction (Full Detail, includes raw code lines).
 */
export const generateBlocklyXML = (root: ASTNode, abstractionLevel: number): string => {
  
  // Re-write traversal to handle the "Next" chain correctly for Blockly XML
  const buildChain = (nodes: ASTNode[]): string => {
    if (nodes.length === 0) return '';
    
    const [current, ...rest] = nodes;
    
    let blockXml = '';
    let childrenXml = '';

    // Logic to determine if we render this node based on abstraction
    const shouldRender = (
      abstractionLevel === 3 ||
      (abstractionLevel === 2 && current.type !== NodeType.RAW_CODE) ||
      (abstractionLevel === 1 && (current.type === NodeType.FUNCTION || current.type === NodeType.CLASS))
    );

    if (!shouldRender) {
      return buildChain(rest); // Skip this node, process next
    }

    // Inner content traversal
    if (current.children && current.children.length > 0) {
      if (abstractionLevel === 1 && current.type === NodeType.FUNCTION) {
        childrenXml = `<block type="abstracted_logic"></block>`;
      } else {
        childrenXml = buildChain(current.children);
      }
    }

    const nextXml = buildChain(rest);

    switch (current.type) {
      case NodeType.FUNCTION:
        blockXml = `<block type="universal_function">
                      <field name="NAME">${escapeXml(current.label || 'func')}</field>
                      <statement name="BODY">${childrenXml}</statement>
                      <next>${nextXml}</next>
                    </block>`;
        break;
      case NodeType.CLASS:
        blockXml = `<block type="universal_class">
                      <field name="NAME">${escapeXml(current.label || 'Class')}</field>
                      <statement name="BODY">${childrenXml}</statement>
                      <next>${nextXml}</next>
                    </block>`;
        break;
      case NodeType.LOOP:
      case NodeType.IF_STATEMENT:
        blockXml = `<block type="universal_control">
                      <field name="CONDITION">${escapeXml(current.content || '')}</field>
                      <field name="TYPE">${current.type === NodeType.LOOP ? 'Loop' : 'If'}</field>
                      <statement name="BODY">${childrenXml}</statement>
                      <next>${nextXml}</next>
                    </block>`;
        break;
      case NodeType.RAW_CODE:
        blockXml = `<block type="raw_code">
                      <field name="CODE">${escapeXml(current.content || '')}</field>
                      <next>${nextXml}</next>
                    </block>`;
        break;
      default:
        // If unknown, just process next
        return nextXml; 
    }
    return blockXml;
  };

  const innerXML = buildChain(root.children);
  return `<xml xmlns="https://developers.google.com/blockly/xml">${innerXML}</xml>`;
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
    return c;
  });
}