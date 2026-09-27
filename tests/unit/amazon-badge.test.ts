import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';

test('the Amazon badge stays byte-identical to the official supplied asset', () => {
  const badge = readFileSync('public/brand/available-at-amazon.png');
  expect(createHash('sha256').update(badge).digest('hex')).toBe('0f3e8dac9e68f7739b589fb005c4e69ca079c3d8596171d76c1be083b4f6a795');
  expect(badge.readUInt32BE(16)).toBe(1500);
  expect(badge.readUInt32BE(20)).toBe(723);
});
