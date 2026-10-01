import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ruleHeading } from './rule-copy';

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
  return renderCardImage(ruleHeading(gameName, title), answer, 'From the publisher’s rulebook', host, title.length);
}

/** 1200×630 share card; tool pages reuse it with their own heading and footer. Size is keyed to the game name for rule cards. */
export async function renderCardImage(heading: string, text: string, footer: string, host: string, sizingLength = heading.length): Promise<Buffer> {
  const body = clip(text, 190);
  const titleSize = sizingLength > 38 ? 54 : 66;
  const bodySize = body.length > 130 ? 34 : 40;
  const dots = [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]].map(([x, y]) => el('div', { position: 'absolute', left: x! - 3, top: y! - 3, width: 6, height: 6, borderRadius: 3, background: '#fffef9' }));
  const tree = el('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#f5f0ed', padding: '64px 88px', fontFamily: 'Sans', color: '#39343b' }, [
    el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
      el('div', { position: 'relative', width: 48, height: 48, borderRadius: 10, background: '#62506f', display: 'flex', transform: 'rotate(-6deg)' }, dots),
      el('div', { fontFamily: 'Serif', fontSize: 30, color: '#62506f' }, 'Who goes first?'),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, [
      el('div', { fontFamily: 'Serif', fontSize: titleSize, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 26 }, heading),
      el('div', { fontSize: bodySize, lineHeight: 1.35, color: '#4d4550' }, body),
    ]),
    el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2dae0', paddingTop: 26, fontSize: 24, color: '#62506f' }, [
      el('div', { fontWeight: 600 }, footer),
      el('div', {}, host),
    ]),
  ]);
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: loadFonts() });
  // Satori embeds bundled-font glyphs as paths; scanning system fonts is redundant.
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: false } }).render().asPng();
}

export type PinArt = { kicker: string; lead?: string; title: string; body: string; cta: string; seed: string };

// Bold, warm palettes: [background, deep accent, card, piece colours]. Picked
// per pin from its id so a board of Pins looks varied but stays on brand.
const PIN_PALETTES = [
  { bg: '#62506f', ink: '#fffef9', accent: '#f6c453', kickerInk: '#39343b', pip: '#39343b', card: '#fffef9', text: '#39343b', pieces: ['#f6c453', '#ef8a62', '#8fd3c1'] },
  { bg: '#e8673c', ink: '#fffef9', accent: '#2f2a4a', kickerInk: '#fff7ee', pip: '#fff7ee', card: '#fff7ee', text: '#2f2a4a', pieces: ['#2f2a4a', '#f9d36b', '#fffef9'] },
  { bg: '#1f6f78', ink: '#fffef9', accent: '#f9c74f', kickerInk: '#163c41', pip: '#163c41', card: '#f4fbf9', text: '#163c41', pieces: ['#f9c74f', '#f28482', '#fffef9'] },
  { bg: '#f4b942', ink: '#2b2233', accent: '#b23a48', kickerInk: '#fffaf0', pip: '#fffaf0', card: '#fffaf0', text: '#2b2233', pieces: ['#b23a48', '#2b2233', '#fffef9'] },
  { bg: '#3d5a98', ink: '#fffef9', accent: '#ffb4a2', kickerInk: '#22304f', pip: '#22304f', card: '#f6f7fc', text: '#22304f', pieces: ['#ffb4a2', '#ffd166', '#fffef9'] },
  { bg: '#b8476a', ink: '#fffef9', accent: '#ffe08a', kickerInk: '#3b2230', pip: '#3b2230', card: '#fff6f8', text: '#3b2230', pieces: ['#ffe08a', '#7fd1b9', '#fffef9'] },
];
const hash = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

const pips: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
function die(x: number, y: number, size: number, face: number, rotate: number, color: string, pip: string): Node {
  const dot = size * 0.16; const step = (size - dot * 3) / 4;
  return el('div', { position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size * 0.2, background: color, display: 'flex', transform: `rotate(${rotate}deg)`, boxShadow: '0 10px 0 rgba(0,0,0,0.18)' },
    pips[face]!.map(([cx, cy]) => el('div', { position: 'absolute', left: step + cx * (dot + step), top: step + cy * (dot + step), width: dot, height: dot, borderRadius: dot, background: pip })));
}
function pawn(x: number, y: number, size: number, color: string): Node {
  return el('div', { position: 'absolute', left: x, top: y, width: size, height: size * 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }, [
    el('div', { width: size * 0.5, height: size * 0.5, borderRadius: size, background: color }),
    el('div', { width: size * 0.7, height: size * 0.8, marginTop: -size * 0.08, borderRadius: `${size * 0.35}px ${size * 0.35}px ${size * 0.08}px ${size * 0.08}px`, background: color }),
    el('div', { width: size, height: size * 0.2, marginTop: -size * 0.04, borderRadius: size * 0.1, background: color }),
  ]);
}
function card(x: number, y: number, w: number, rotate: number, color: string, mark: string): Node {
  return el('div', { position: 'absolute', left: x, top: y, width: w, height: w * 1.4, borderRadius: w * 0.12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rotate}deg)`, boxShadow: '0 10px 0 rgba(0,0,0,0.15)' },
    el('div', { width: w * 0.36, height: w * 0.36, borderRadius: w, border: `${w * 0.07}px solid ${mark}`, display: 'flex' }));
}

/** Vertical 2:3 Pinterest pin: bold colour, big game name, answer card, game pieces. */
export async function renderPinImage(art: PinArt, host: string): Promise<Buffer> {
  const n = hash(art.seed); const p = PIN_PALETTES[n % PIN_PALETTES.length]!;
  const title = clip(art.title, 48);
  const text = clip(art.body, 230);
  const titleSize = title.length <= 10 ? 150 : title.length <= 18 ? 118 : title.length <= 28 ? 96 : 80;
  const bodySize = text.length > 170 ? 39 : text.length > 110 ? 44 : 50;
  const [a, b, c] = p.pieces as [string, string, string];
  const faces = [(n % 6) + 1, ((n >>> 3) % 6) + 1];
  const tree = el('div', { width: 1000, height: 1500, display: 'flex', flexDirection: 'column', position: 'relative', background: p.bg, fontFamily: 'Sans', color: p.ink, padding: '84px 80px 72px' }, [
    // Soft background shapes give depth without competing with the text.
    el('div', { position: 'absolute', left: -180, top: 980, width: 560, height: 560, borderRadius: 560, background: 'rgba(255,255,255,0.08)' }),
    el('div', { position: 'absolute', left: 700, top: -160, width: 480, height: 480, borderRadius: 480, background: 'rgba(255,255,255,0.08)' }),
    die(770, 92, 136, faces[0]!, 14, a, p.pip),
    card(650, 150, 96, -16, c, b),
    pawn(820, 1130, 104, a),
    die(700, 1210, 96, faces[1]!, -18, c, p.bg),
    el('div', { display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'Serif', fontSize: 38, color: p.ink }, [
      el('div', { width: 18, height: 18, borderRadius: 18, background: p.accent }), 'Who goes first?',
    ]),
    el('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }, [
      el('div', { display: 'flex' }, el('div', { background: p.accent, color: p.kickerInk, fontWeight: 600, fontSize: 30, letterSpacing: 3, padding: '12px 26px', borderRadius: 40, textTransform: 'uppercase' }, art.kicker)),
      ...(art.lead ? [el('div', { fontFamily: 'Serif', fontSize: 58, marginTop: 34, lineHeight: 1.05, opacity: 0.92 }, art.lead)] : []),
      el('div', { fontFamily: 'Serif', fontSize: titleSize, lineHeight: 1.0, letterSpacing: -3, marginTop: art.lead ? 6 : 34, marginBottom: 44, maxWidth: 840 }, title),
      el('div', { display: 'flex', background: p.card, color: p.text, borderRadius: 32, padding: '44px 46px', fontSize: bodySize, lineHeight: 1.36, maxWidth: 840, boxShadow: '0 14px 0 rgba(0,0,0,0.16)' }, text),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', gap: 18 }, [
      el('div', { display: 'flex' }, el('div', { background: p.ink, color: p.bg, fontWeight: 600, fontSize: 34, padding: '20px 34px', borderRadius: 50 }, art.cta)),
      el('div', { fontSize: 32, fontWeight: 600, opacity: 0.9 }, host),
    ]),
  ]);
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1000, height: 1500, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1000 }, font: { loadSystemFonts: false } }).render().asPng();
}
