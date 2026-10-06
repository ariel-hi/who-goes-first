import { expect, test } from 'vitest';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { pinQueue, releasedPins } from '../../src/lib/pinterest-pins';
import { renderPinImage } from '../../src/lib/og-image';
import { sceneCampaigns } from '../../src/lib/pinterest-scenes';

test('scene launch respects the daily cap and does not release scenes early', () => {
  const queue = pinQueue();
  for (const line of readFileSync('research/pinterest/released.txt', 'utf8').trim().split(/\r?\n/)) {
    const [date, id] = line.split(' ');
    expect(queue.find(pin => pin.id === id)?.date).toBe(date);
  }
  expect(new Set(queue.map(pin => pin.id)).size).toBe(queue.length);
  const days = new Map<string, number>();
  for (const pin of queue) days.set(pin.date, (days.get(pin.date) ?? 0) + 1);
  expect([...days.values()].every(count => count <= 5)).toBe(true);
  expect(queue.filter(pin => pin.art.scene).map(pin => pin.date)).toEqual(['2026-10-07', '2026-10-10', '2026-10-13']);
  expect(releasedPins(new Date('2026-10-06T23:59:59Z')).some(pin => pin.art.scene)).toBe(false);
  expect(releasedPins(new Date('2026-10-07T13:07:00Z')).filter(pin => pin.art.scene)).toHaveLength(1);
  for (const id of ['game-love-letter-2025-en', 'game-hanabi-rnr-en', 'game-spirit-island-gtg-en']) {
    expect(queue.find(pin => pin.id === id)!.date >= '2026-10-23').toBe(true);
  }
});

test('reviewed scenes render as portrait PNGs and changed copy is rejected', async () => {
  for (const pin of sceneCampaigns) {
    const image = await renderPinImage(pin.art, 'whogoesfirst.fun');
    const metadata = await sharp(image).metadata();
    expect([metadata.width, metadata.height, metadata.format]).toEqual([1000, 1500, 'png']);
    expect(pin.description).toContain('AI-created');
    await expect(renderPinImage({ ...pin.art, title: 'Unreviewed copy' }, 'whogoesfirst.fun')).rejects.toThrow('changed since visual review');
  }
});
