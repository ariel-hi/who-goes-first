# Scene-led Pinterest production

October 6, 2026. The six previously published tabletop scenes are the visual reference; do not repost them. This release introduces three original scenes generated with the built-in image_gen tool. Source PNGs and their review records live in `src/assets/pinterest/`; exact generation prompts are in `scene-prompts.json` there. The renderer adds bundled-font type, contrast shading, a useful CTA and the domain at build time, producing 1000 × 1500 PNGs.

## Launch schedule

| UTC date | Scene | Destination | Existing rule moved to queue end |
| --- | --- | --- | --- |
| October 7 | Enchanted woodland | First-player picker | Love Letter |
| October 10 | Autumn cabin | Free hosting checklist | Hanabi |
| October 13 | Sky railway | Turn-order generator | Spirit Island |

The three replacement slots were unpublished when prepared. All other dates, published GUIDs, destinations and campaign labels are preserved; no day exceeds five Pins. The displaced rules keep their IDs and copy. The queue now ends October 24. The RSS connection remains the sole automatic publisher. Assets deploy immediately, but scene feed entries appear only on their scheduled days. A live feed does not prove Pinterest published an entry.

## Ongoing creative workflow

During the existing weekly queue review, prepare two or three distinct scene campaigns per week alongside useful rule and tool Pins. Each needs a new composition and a specific destination that fulfills its promise. Append new dates; never replace a released slot or reuse an image with a new ID just to repost it. Keep the five-Pin daily limit. Do not depict imaginary scenes as a commercial game or official publisher artwork. Describe AI-created fantasy artwork honestly in the Pin description.

Generate backgrounds without text; keep quiet space at the top and bottom for the renderer. Favor colorful tactile meeples, atmospheric lighting, depth and a strong focal point. Vary worlds and compositions, not just color. Dice are optional: these three scenes deliberately have none. When present, inspect every visible die at full resolution: real cube geometry, distinct adjacent faces, correct pip counts and layouts, and opposite values summing to seven where visible. Repair inaccurate dice with image_gen and inspect the result again before approval. A hash check cannot judge visual correctness.

Add the campaign in `src/lib/pinterest-scenes.ts` and run `npm run pinterest:preview -- --draft` for visual review. Drafts go to a separate ignored `artifacts/pinterest-scenes/drafts/` folder and bypass approval only in this explicit local preview. Check the full-size image and a phone-size view for text clipping, contrast, spelling, piece geometry and CTA/destination accuracy. Record the reviewed background SHA-256 and `JSON.stringify(art)` SHA-256 in `reviews.json`, with reviewer, date and dice findings. The production build and daily release preflight never use draft mode and reject mismatches; do not update review hashes without inspecting the changed creative. `npm run pinterest:preview` reproduces the reviewed outputs in `artifacts/pinterest-scenes/` and does not publish or approve anything.

The matching picker, checklist and turn-order pages offer these images through their visitor-operated Pinterest save links. Future queued assets are available for voluntary sharing before their RSS release. Source art is build-only and does not load in the ordinary page body.

## Evaluation

Hypothesis: detailed scene artwork with a concise practical hook earns more saves and outbound clicks than the text-heavy templates. No engagement improvement is established yet. Review actual publication links and Pinterest saves/outbound clicks after each new Pin has had at least seven days (earliest complete batch review October 20). Compare similarly aged Pins; keep platform saves, outbound clicks and consented site sessions separate. The three fixed campaign labels are included automatically in the existing consent allowlist. No new visitor tracking or automation is introduced; preserve the October 15 discovery review.
