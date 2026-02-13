import { translations } from './translations';

/**
 * Initializes Blockly Custom Blocks and Generators
 */
export const initBlocklyDefinitions = (labels: typeof translations['en']['blocks']) => {
  const Blockly = window.Blockly;
  if (!Blockly) return;

  // 1. Universal Function Block
  Blockly.Blocks['universal_function'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(labels.func)
          .appendField(new Blockly.FieldTextInput("funcName"), "NAME");
      this.appendStatementInput("BODY")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip(labels.tooltipFunc);
    }
  };

  // 2. Universal Class Block
  Blockly.Blocks['universal_class'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(labels.class)
          .appendField(new Blockly.FieldTextInput("ClassName"), "NAME");
      this.appendStatementInput("BODY")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
    }
  };

  // 3. Logic/Control Flow Abstraction
  Blockly.Blocks['universal_control'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldLabelSerializable(labels.control), "TYPE")
          .appendField(new Blockly.FieldTextInput("condition"), "CONDITION");
      this.appendStatementInput("BODY")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    }
  };

  // 4. Raw Code Block (Fallback)
  Blockly.Blocks['raw_code'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(labels.code)
          .appendField(new Blockly.FieldTextInput("code..."), "CODE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip(labels.tooltipRaw);
    }
  };
  
  // 5. Collapsed/Abstracted Block
  Blockly.Blocks['abstracted_logic'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(labels.hidden);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#555555');
    }
  };

  // --- Generators (Simple Text Export) ---
  
  // Ensure we have a generator reference. 
  // In script-tag loaded Blockly, it's usually Blockly.JavaScript.
  // In some environments, we might need to look for it elsewhere.
  let Generator = Blockly.JavaScript;
  if (!Generator && (window as any).javascriptGenerator) {
      Generator = (window as any).javascriptGenerator;
      Blockly.JavaScript = Generator;
  }

  if (!Generator) {
      console.warn("Blockly.JavaScript generator not found. Creating a stub.");
      Generator = new Blockly.Generator('JavaScript');
      Blockly.JavaScript = Generator;
  }

  Generator['universal_function'] = function(block: any) {
    const name = block.getFieldValue('NAME');
    const statements = Generator.statementToCode(block, 'BODY');
    return `function ${name}() {\n${statements}}\n`;
  };

  Generator['universal_class'] = function(block: any) {
    const name = block.getFieldValue('NAME');
    const statements = Generator.statementToCode(block, 'BODY');
    return `class ${name} {\n${statements}}\n`;
  };

  Generator['universal_control'] = function(block: any) {
    const condition = block.getFieldValue('CONDITION');
    const statements = Generator.statementToCode(block, 'BODY');
    return `control (${condition}) {\n${statements}}\n`;
  };

  Generator['raw_code'] = function(block: any) {
    const code = block.getFieldValue('CODE');
    return `${code}\n`;
  };
  
  Generator['abstracted_logic'] = function(block: any) {
    return `// ... implementation hidden ...\n`;
  };
};
