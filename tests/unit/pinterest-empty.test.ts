import { expect, test, vi } from 'vitest';

vi.mock('../../src/lib/content/catalog', () => ({ getCatalog: () => [] }));
import { pinQueue } from '../../src/lib/pinterest-pins';

test('empty and synthetic catalogs can build the tool and scene queue without real game slots', () => {
  const queue = pinQueue();
  expect(queue.some(pin => pin.id.startsWith('game-'))).toBe(false);
  expect(queue.filter(pin => pin.art.scene)).toHaveLength(3);
  expect(new Set(queue.map(pin => pin.id)).size).toBe(queue.length);
  for (const date of new Set(queue.map(pin => pin.date))) {
    expect(queue.filter(pin => pin.date === date).length).toBeLessThanOrEqual(5);
  }
});
