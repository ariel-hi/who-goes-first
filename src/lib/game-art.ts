/** Original artwork only: no publisher logos, packaging, or third-party assets. */
export function gameArt(name: string, theme: string) {
  let hash = 2166136261;
  for (const character of name.normalize('NFKC').toLowerCase()) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/u);
  const label = name.length <= 9 ? name : words.slice(0, 3).map(word => Array.from(word)[0]).join('').toUpperCase();
  const motif = /\b(dice|die|roll)\b/i.test(theme) ? 'dice'
    : /\b(cards?|draw|hand)\b/i.test(theme) ? 'cards'
    : /\b(youngest|oldest|birthday|recent|recently|last|time|age)\b/i.test(theme) ? 'clock'
    : /\b(tree|trees|plant|plants|flower|flowers|garden|forest|animal|bird|birds)\b/i.test(theme) ? 'leaf'
    : /\b(king|queen|royal|crown|richest)\b/i.test(theme) ? 'crown' : 'dice';
  return { label, motif, pattern: hash % 3, color: ['#246b5b', '#725339', '#455f79', '#755467', '#58613d'][hash % 5] };
}
