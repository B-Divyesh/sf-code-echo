import { describe, expect, it } from 'vitest';
import { buildReading, chunkCode, cleanSelection, pronounceToken, splitIdentifier, tokenizeSyntax } from '../lib/reader';
import { DEFAULT_SETTINGS } from '../lib/types';

describe('selection cleanup', () => {
  it('normalizes spaces and newlines without changing internal code', () => {
    expect(cleanSelection('  const\u00a0x = 1;\r\nnext(x)  ')).toBe('const x = 1;\nnext(x)');
  });

  it('limits unusually large selections', () => {
    expect(cleanSelection('a'.repeat(5000))).toHaveLength(4000);
  });
});

describe('code chunking', () => {
  it('keeps multi-character operators and string literals together', () => {
    expect(tokenizeSyntax('value === "hello world" => next_value')).toEqual([
      'value', '===', '"hello world"', '=>', 'next_value'
    ]);
  });

  it('offers syntax, words, and line modes', () => {
    expect(chunkCode('foo(bar)', 'syntax')).toEqual(['foo', '(', 'bar', ')']);
    expect(chunkCode('foo bar\nbaz', 'words')).toEqual(['foo', 'bar', 'baz']);
    expect(chunkCode('foo bar\nbaz', 'line')).toEqual(['foo bar', 'baz']);
  });
});

describe('pronunciation', () => {
  it('splits camel case, acronyms, snake case, and kebab case', () => {
    expect(splitIdentifier('parseHTTPResponse_value-id')).toEqual(['parse', 'HTTP', 'Response', 'value', 'id']);
  });

  it('uses an exact pronunciation override first', () => {
    const settings = { ...DEFAULT_SETTINGS, dictionary: { useEffect: 'use effect' } };
    expect(pronounceToken('useEffect', settings)).toBe('use effect');
  });

  it('only speaks punctuation the user selected', () => {
    const settings = { ...DEFAULT_SETTINGS, spokenPunctuation: ['=>'] };
    expect(pronounceToken('=>', settings)).toBe('arrow');
    expect(pronounceToken('{', settings)).toBe('');
  });

  it('removes silent punctuation chunks from a reading', () => {
    const settings = { ...DEFAULT_SETTINGS, spokenPunctuation: [] };
    expect(buildReading('fn(x);', settings).map((part) => part.visual)).toEqual(['fn', 'x']);
  });
});
