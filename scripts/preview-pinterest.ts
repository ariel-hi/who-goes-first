import { mkdirSync, writeFileSync } from 'node:fs';
import { renderPinImage } from '../src/lib/og-image';
import { sceneCampaigns } from '../src/lib/pinterest-scenes';

const draft = process.argv.includes('--draft');
const output = `artifacts/pinterest-scenes${draft ? '/drafts' : ''}`;
mkdirSync(output, { recursive: true });
for (const pin of sceneCampaigns) {
  writeFileSync(`${output}/${pin.id}.png`, await renderPinImage(pin.art, 'whogoesfirst.fun', { draftScene: draft }));
}
console.log(`Rendered ${sceneCampaigns.length} ${draft ? 'UNREVIEWED DRAFT' : 'reviewed'} scene Pins to ${output}. Inspect at full size and mobile scale before release.`);
