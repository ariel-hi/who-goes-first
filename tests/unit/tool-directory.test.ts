import { describe, expect, it } from 'vitest';
import { relatedTools, toolDirectory } from '../../src/lib/tool-directory';

describe('contextual tool discovery', () => {
  it('gives each tool three distinct destinations without recommending itself', () => {
    const destinations = new Set(toolDirectory.map(tool => tool.href));
    for (const tool of toolDirectory) {
      const next = relatedTools(tool.href);
      expect(next).toHaveLength(3);
      expect(new Set(next.map(item => item.href)).size).toBe(3);
      expect(next.every(item => destinations.has(item.href) && item.href !== tool.href)).toBe(true);
    }
  });

  it('pairs the letter generator with a timer for word games', () => {
    expect(relatedTools('/random-letter-generator/').map(tool => tool.href)).toContain('/turn-timer/');
  });
});
