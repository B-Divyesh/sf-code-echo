import { PUNCTUATION_LABELS, type EchoSettings } from './types';

const OPERATORS = ['===', '!==', '=>', '==', '!=', '<=', '>=', '&&', '||', '?.', '??', '++', '--', '**'];

export function cleanSelection(input: string): string {
  return input.replace(/\u00a0/g, ' ').replace(/\r\n?/g, '\n').trim().slice(0, 4000);
}

export function splitIdentifier(value: string): string[] {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[_-]+|\s+/)
    .filter(Boolean);
}

export function tokenizeSyntax(input: string): string[] {
  const operators = OPERATORS.map(escapeRegExp).join('|');
  const pattern = new RegExp(`("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`|//[^\\n]*|/\\*[\\s\\S]*?\\*/|${operators}|[A-Za-z_$][\\w$-]*|\\d+(?:\\.\\d+)?|[^\\s])`, 'g');
  return input.match(pattern) ?? [];
}

export function chunkCode(input: string, mode: EchoSettings['chunkMode']): string[] {
  const clean = cleanSelection(input);
  if (!clean) return [];
  if (mode === 'line') return clean.split('\n').map((line) => line.trim()).filter(Boolean);
  if (mode === 'words') return clean.split(/\s+/).filter(Boolean);
  return tokenizeSyntax(clean);
}

export function pronounceToken(token: string, settings: EchoSettings): string {
  const direct = settings.dictionary[token] ?? settings.dictionary[token.toLowerCase()];
  if (direct) return direct;

  const punctuation = PUNCTUATION_LABELS[token];
  if (punctuation) return settings.spokenPunctuation.includes(token) ? punctuation : '';

  if (/^[A-Za-z_$][\w$-]*$/.test(token)) {
    if (settings.identifierMode === 'literal') return token;
    if (settings.identifierMode === 'spell') return token.split('').join(' ');
    return splitIdentifier(token).join(' ');
  }

  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")) || (token.startsWith('`') && token.endsWith('`'))) {
    const inner = token.slice(1, -1);
    return `quote ${inner} end quote`;
  }

  return token;
}

export function spokenChunk(chunk: string, settings: EchoSettings): string {
  if (settings.chunkMode === 'syntax') return pronounceToken(chunk, settings);
  return tokenizeSyntax(chunk).map((token) => pronounceToken(token, settings)).filter(Boolean).join(' ');
}

export function buildReading(input: string, settings: EchoSettings): Array<{ visual: string; spoken: string }> {
  return chunkCode(input, settings.chunkMode)
    .map((visual) => ({ visual, spoken: spokenChunk(visual, settings) }))
    .filter((part) => part.spoken.length > 0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
