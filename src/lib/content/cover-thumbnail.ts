import type { RuleImage } from './schema';

export function coverThumbnailPath(image: RuleImage): string {
  if (image.presentation !== 'cover') return image.file;
  return image.file.replace('/images/games/', '/images/games/thumbs/').replace(/\.[a-z0-9]+$/, '.webp');
}
