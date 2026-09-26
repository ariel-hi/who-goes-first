// Rebuild the three original, site-owned Pinterest images with:
// node marketing/create-pins.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';

const output = new URL('../public/pins/', import.meta.url);
await mkdir(output, { recursive: true });

const pins = [
  {
    slug: 'first-player-picker', kicker: 'FOR YOUR NEXT GAME NIGHT',
    heading: 'Who goes first?', subheading: 'Let everyone have a fair shot.',
    art: `<div class="token-row"><span>1</span><span>2</span><span>3</span><span>4</span></div>
      <div class="art-title">One tap. One fair draw.</div>
      <div class="art-copy">Use names or numbered seats for 2–50 players.</div>
      <div class="fake-action">Pick a player <b>↗</b></div>`,
    foot: 'FREE FIRST-PLAYER PICKER', color: '#f0eaf0',
  },
  {
    slug: 'starting-rules', kicker: 'CHECK THE RULEBOOK',
    heading: 'Who starts in your game?', subheading: 'Find the publisher’s rule.',
    art: `<div class="book"><div class="book-page left"><span class="book-small">YOUR GAME</span><div class="book-line"></div><div class="book-line short"></div><div class="book-line"></div><div class="book-line short"></div></div><div class="book-page right"><span class="book-small">STARTING PLAYER</span><strong>Who goes first?</strong><div class="book-check">✓</div></div></div>
      <div class="art-copy">Search by game and edition. See the publisher source on every answer.</div>`,
    foot: 'PUBLISHER-CHECKED STARTING RULES', color: '#f2e8d6',
  },
  {
    slug: 'fun-questions', kicker: 'A PLAYFUL WAY TO START',
    heading: 'Make the first turn fun.', subheading: 'Draw a house-rule question.',
    art: `<div class="prompt-card"><span>GAME NIGHT PROMPT</span><strong>Who goes first?</strong><div class="question-mark">?</div></div>
      <div class="step-row"><span>Draw a question</span><i>→</i><span>Choose together</span></div>
      <div class="art-copy">Original prompts for casual groups. Break ties with the fair picker.</div>`,
    foot: 'ORIGINAL HOUSE-RULE QUESTIONS', color: '#efe3eb',
  },
];

const browser = await chromium.launch({ headless: true });
try {
  for (const pin of pins) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}html,body{margin:0;width:1000px;height:1500px}body{font-family:Arial,Helvetica,sans-serif;color:#39343b;background:#f5f0ed}
      .page{position:relative;width:1000px;height:1500px;overflow:hidden;padding:68px 72px 58px;background:radial-gradient(circle at 95% 11%,${pin.color} 0 21%,transparent 21.2%),#f5f0ed}
      .brand{display:flex;align-items:center;gap:16px;font-family:Georgia,serif;font-size:27px;font-weight:bold;letter-spacing:-.6px}
      .mark{display:block;width:48px;height:48px}
      .rule{height:2px;margin:34px 0 55px;background:#e2dae0}
      .kicker{color:#62506f;font-size:21px;font-weight:800;letter-spacing:3.2px}
      h1{font-family:Georgia,serif;font-weight:normal;font-size:88px;letter-spacing:-3px;line-height:1.07;margin:22px 0 20px;max-width:850px}
      .sub{font-size:36px;line-height:1.3;color:#716873;margin:0}
      .art{position:absolute;top:565px;left:72px;right:72px;height:720px;border:2px solid #e2dae0;border-radius:34px;background:#fffdf9;box-shadow:0 22px 0 #e8e1e7;padding:76px 70px;text-align:center}
      .token-row{display:flex;justify-content:space-between;margin:4px 0 90px}.token-row span{display:grid;place-items:center;width:140px;height:140px;border-radius:50%;font-family:Georgia,serif;font-size:59px;color:#415b49;background:#e5eadf;box-shadow:0 11px 0 #d1dbca}
      .token-row span:nth-child(2){background:#f0e7cf;box-shadow:0 11px 0 #e4d7b4}.token-row span:nth-child(3){background:#e0e8ec;box-shadow:0 11px 0 #cddbe2}.token-row span:nth-child(4){background:#f0dfd6;box-shadow:0 11px 0 #e4cbbd}
      .art-title{font-family:Georgia,serif;font-size:46px;line-height:1.2}.art-copy{font-size:27px;line-height:1.35;color:#716873;max-width:620px;margin:32px auto 0}
      .fake-action{display:flex;justify-content:space-between;align-items:center;width:100%;height:90px;padding:0 34px;margin-top:78px;border-radius:13px;background:#62506f;color:white;text-align:left;font-size:31px;font-weight:bold}.fake-action b{font-size:38px}
      .book{display:flex;height:375px;margin:-6px -22px 62px;filter:drop-shadow(0 15px 9px #e2dae0)}.book-page{width:50%;padding:32px 27px;background:#f9f7ee;border:1px solid #ccd3c7}.book-page.left{border-radius:8px 0 0 8px;transform:skewY(-2deg)}.book-page.right{border-radius:0 8px 8px 0;transform:skewY(2deg);background:#fffdf7}.book-small{font-size:16px;letter-spacing:2.4px;font-weight:bold;color:#716873}.book-line{height:15px;margin-top:25px;border-radius:8px;background:#d8ded4}.book-line.short{width:70%}.book-page strong{display:block;font-family:Georgia,serif;font-size:38px;font-weight:normal;line-height:1.16;margin-top:37px}.book-check{display:grid;place-items:center;width:96px;height:96px;margin:28px auto;background:#62506f;color:white;border-radius:50%;font-size:65px}
      .prompt-card{height:330px;width:530px;margin:0 auto 62px;padding:35px;border-radius:26px;background:#efe3eb;border:2px solid #e1ccdb;transform:rotate(-4deg);box-shadow:0 18px 0 #e1d5df}.prompt-card span{display:block;font-size:17px;letter-spacing:3px;font-weight:bold;color:#6f4c68}.prompt-card strong{display:block;font-family:Georgia,serif;font-size:52px;font-weight:normal;margin-top:30px}.question-mark{font-family:Georgia,serif;font-size:112px;color:#795171;line-height:1}.step-row{display:flex;align-items:center;justify-content:center;gap:16px;font-size:22px;font-weight:bold;color:#62506f}.step-row span{padding:16px 20px;border:2px solid #dbcadd;border-radius:100px}.step-row i{font-style:normal;font-size:30px}
      .footer{position:absolute;bottom:54px;left:72px;right:72px;display:flex;align-items:end;justify-content:space-between;border-top:2px solid #e2dae0;padding-top:33px}.footer strong{display:block;font-size:25px;color:#62506f}.footer span{font-size:19px;letter-spacing:1.7px;font-weight:bold;color:#716873}
    </style></head><body><div class="page"><div class="brand"><svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#62506f"/><g fill="white"><circle cx="15" cy="15" r="3.2"/><circle cx="33" cy="15" r="3.2"/><circle cx="24" cy="24" r="3.2"/><circle cx="15" cy="33" r="3.2"/><circle cx="33" cy="33" r="3.2"/></g></svg>Who Goes First?</div><div class="rule"></div><div class="kicker">${pin.kicker}</div><h1>${pin.heading}</h1><p class="sub">${pin.subheading}</p><div class="art">${pin.art}</div><div class="footer"><strong>whogoesfirst.fun</strong><span>${pin.foot}</span></div></div></body></html>`);
    await page.screenshot({ path: fileURLToPath(new URL(`${pin.slug}.png`, output)), fullPage: false });
    await page.close();
  }
} finally {
  await browser.close();
}
