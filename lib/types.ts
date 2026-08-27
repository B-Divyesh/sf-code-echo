export type Theme = 'paper' | 'night' | 'contrast';
export type ChunkMode = 'syntax' | 'words' | 'line';
export type IdentifierMode = 'split' | 'literal' | 'spell';

export interface EchoSettings {
  rate: number;
  volume: number;
  textSize: number;
  theme: Theme;
  chunkMode: ChunkMode;
  identifierMode: IdentifierMode;
  spokenPunctuation: string[];
  dictionary: Record<string, string>;
  syncEnabled: boolean;
}

export interface EchoHistoryItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface LicenseState {
  token?: string;
  valid: boolean;
  checkedAt: number;
  reason?: string;
}

export const DEFAULT_SETTINGS: EchoSettings = {
  rate: 0.9,
  volume: 1,
  textSize: 24,
  theme: 'paper',
  chunkMode: 'syntax',
  identifierMode: 'split',
  spokenPunctuation: ['(', ')', '{', '}', '.', '=', '=>'],
  dictionary: {},
  syncEnabled: false
};

export const PUNCTUATION_LABELS: Record<string, string> = {
  '(': 'open parenthesis',
  ')': 'close parenthesis',
  '[': 'open bracket',
  ']': 'close bracket',
  '{': 'open brace',
  '}': 'close brace',
  '.': 'dot',
  ',': 'comma',
  ':': 'colon',
  ';': 'semicolon',
  '=': 'equals',
  '=>': 'arrow',
  '==': 'equals equals',
  '===': 'strictly equals',
  '!=': 'not equals',
  '!==': 'strictly not equals',
  '+': 'plus',
  '-': 'minus',
  '*': 'asterisk',
  '/': 'slash',
  '\\': 'backslash',
  '<': 'less than',
  '>': 'greater than',
  '<=': 'less than or equal to',
  '>=': 'greater than or equal to',
  '?': 'question mark',
  '!': 'bang',
  '&': 'ampersand',
  '&&': 'and and',
  '|': 'pipe',
  '||': 'or or',
  '_': 'underscore',
  '#': 'hash',
  '@': 'at sign'
};

export const LANGUAGE_PACKS = {
  javascript: {
    label: 'JavaScript + TypeScript',
    dictionary: { async: 'ay sink', await: 'await', typeof: 'type of', instanceof: 'instance of', useEffect: 'use effect' }
  },
  python: {
    label: 'Python',
    dictionary: { __init__: 'dunder init', __name__: 'dunder name', elif: 'else if', kwargs: 'keyword args', isinstance: 'is instance' }
  },
  git: {
    label: 'Git + review',
    dictionary: { HEAD: 'head', SHA: 'shah', rebase: 're base', cherryPick: 'cherry pick', LGTM: 'looks good to me' }
  }
} as const;
