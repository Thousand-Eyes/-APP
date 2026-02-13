import { Language } from '../types';

export const translations = {
  'en': {
    appTitle: 'CodeTransmute',
    openProject: 'Open Project',
    export: 'Export',
    abstraction: 'Abstraction',
    projectExplorer: 'Project Explorer',
    generatedCodePreview: 'GENERATED CODE PREVIEW',
    loading: 'Folder loaded successfully',
    errorRead: 'Error reading file content',
    demoMsg: 'Browser blocked file access. Loaded DEMO PROJECT.',
    clickToOpen: 'Click "Open Project" to select a source folder.',
    securityNote: 'If browser blocks file access, a demo project will load.',
    levels: {
      1: 'ARCH',
      2: 'LOGIC',
      3: 'RAW'
    },
    // Blockly Categories & Blocks
    toolbox: {
      universal: 'Universal',
      logic: 'Logic',
      raw: 'Raw'
    },
    blocks: {
      func: 'Func',
      class: 'Class',
      control: 'Control',
      code: 'Code',
      hidden: '... (Hidden Implementation)',
      tooltipFunc: 'A generic function definition',
      tooltipRaw: 'Raw source code line'
    }
  },
  'zh-TW': {
    appTitle: '程式轉譯機',
    openProject: '開啟專案',
    export: '匯出專案',
    abstraction: '抽象層級',
    projectExplorer: '專案瀏覽器',
    generatedCodePreview: '代碼生成預覽',
    loading: '資料夾載入成功',
    errorRead: '讀取檔案內容失敗',
    demoMsg: '瀏覽器阻擋了檔案存取，已載入範例專案。',
    clickToOpen: '點擊「開啟專案」選擇原始碼資料夾。',
    securityNote: '若瀏覽器安全性設定阻擋存取，將自動載入範例。',
    levels: {
      1: '架構',
      2: '邏輯',
      3: '原始'
    },
    // Blockly Categories & Blocks
    toolbox: {
      universal: '通用結構',
      logic: '邏輯控制',
      raw: '原始代碼'
    },
    blocks: {
      func: '函式',
      class: '類別',
      control: '控制',
      code: '代碼',
      hidden: '... (隱藏實作細節)',
      tooltipFunc: '通用函式定義',
      tooltipRaw: '原始程式碼行'
    }
  }
};

export const getTranslation = (lang: Language) => translations[lang];
