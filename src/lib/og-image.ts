import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Bundled OFL fonts make images identical on every build machine; the pages
// themselves still use system fonts only.
const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`));
let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  return fonts ??= [
    ...['latin', 'latin-ext'].map(subset => ({ name: 'Serif', data: font('source-serif-4', `source-serif-4-${subset}-400-normal.woff`), weight: 400 as const, style: 'normal' as const })),
    ...['latin', 'latin-ext'].map(subset => ({ name: 'Sans', data: font('source-sans-3', `source-sans-3-${subset}-400-normal.woff`), weight: 400 as const, style: 'normal' as const })),
    ...['latin', 'latin-ext'].map(subset => ({ name: 'Sans', data: font('source-sans-3', `source-sans-3-${subset}-600-normal.woff`), weight: 600 as const, style: 'normal' as const })),
  ];
}

/** Shortens at a word boundary; the full answer is always on the page itself. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1); const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, '')}…`;
}

type Node = { type: string; props: { style?: Record<string, string | number>; children?: Node | Node[] | string } };
const el = (type: string, style: Record<string, string | number>, children?: Node | Node[] | string): Node => ({ type, props: { style, children } });

export async function renderRuleImage(gameName: string, answer: string, host: string): Promise<Buffer> {
  const title = clip(gameName, 60);
  const body = clip(answer, 190);
  const titleSize = title.length > 38 ? 54 : 66;
  const bodySize = body.length > 130 ? 34 : 40;
  const dots = [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]].map(([x, y]) => el('div', { position: 'absolute', left: x! - 3, top: y! - 3, width: 6, height: 6, borderRadius: 3, background: '#fffef9' }));
  const tree = el('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#f5f0ed', padding: '64px 88px', fontFamily: 'Sans', color: '#39343b' }, [
    el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
      el('div', { position: 'relative', width: 48, height: 48, borderRadius: 10, background: '#62506f', display: 'flex', transform: 'rotate(-6deg)' }, dots),
      el('div', { fontFamily: 'Serif', fontSize: 30, color: '#62506f' }, 'Who goes first?'),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, [
      el('div', { fontFamily: 'Serif', fontSize: titleSize, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 26 }, `Who goes first in ${title}?`),
      el('div', { fontSize: bodySize, lineHeight: 1.35, color: '#4d4550' }, body),
    ]),
    el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2dae0', paddingTop: 26, fontSize: 24, color: '#62506f' }, [
      el('div', { fontWeight: 600 }, 'From the publisher’s rulebook'),
      el('div', {}, host),
    ]),
  ]);
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
