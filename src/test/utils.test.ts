import { describe, it, expect } from 'vitest';
import { generateStateHash, shouldUseIndexedDB } from '@/hooks/useAutoSave';
import type { UIComponent } from '@/types';

describe('useAutoSave utilities', () => {
  const mockComponent = (id: string, type = 'box'): UIComponent => ({
    id,
    type: type as UIComponent['type'],
    props: {},
    styles: {},
    metadata: { name: `Component ${id}`, isVisible: true, isLocked: false },
    children: [],
    parent: null,
  });

  it('generateStateHash produces consistent hashes', () => {
    const components: Record<string, UIComponent> = {
      a: { ...mockComponent('a'), children: ['b'] },
      b: { ...mockComponent('b') },
    };
    const hash1 = generateStateHash(components);
    const hash2 = generateStateHash(components);
    expect(hash1).toBe(hash2);
  });

  it('generateStateHash changes when component props change', () => {
    const components: Record<string, UIComponent> = { a: mockComponent('a') };
    const hash1 = generateStateHash(components);
    const modified: Record<string, UIComponent> = {
      a: { ...mockComponent('a'), props: { text: 'hello' } },
    };
    const hash2 = generateStateHash(modified);
    expect(hash1).not.toBe(hash2);
  });

  it('shouldUseIndexedDB returns true for data > 1MB', () => {
    expect(shouldUseIndexedDB(1024 * 1024 + 1)).toBe(true);
  });

  it('shouldUseIndexedDB returns false for data <= 1MB', () => {
    expect(shouldUseIndexedDB(1024 * 1024)).toBe(false);
    expect(shouldUseIndexedDB(0)).toBe(false);
  });
});
