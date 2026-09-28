# Nineteen SimplyFun product identities — 2026-09-28

The reviewed registry at `c404916` listed 5,166 game identities. This batch adds 19 distinct current SimplyFun physical products, taking that baseline to 5,185. It adds identities only; it does not infer a starting-player rule or a BoardGameGeek ID. Rules remain pending until an exact-edition manual is reviewed.

The discovery queue came from the [SimplyFun game sitemap](https://simplyfun.com/pages/sitemap). For each title, the original publisher product response returned HTTP 200 at its canonical URL. Its H1 and Product JSON-LD agree on the title; the structured data names the SimplyFun brand and identifies the product by SKU and GTIN. The product page also describes included physical game components and a rules booklet. Each response's SHA-256 and byte count are bound to the accepted record in `publisher-identities.json`; complete bodies and retrieval receipts are preserved in the local `artifacts/simplyfun-next19-sep28/` evidence packet. Only identity facts, not publisher descriptions or imagery, enter the site.

| Product | SKU | Publisher source |
| --- | --- | --- |
| Bug Crafts | SF215 | [Product](https://simplyfun.com/products/bug-crafts) |
| Crystal Cup Rally | SF180 | [Product](https://simplyfun.com/products/crystal-cup-rally) |
| Digger's Garden Match | SF058 | [Product](https://simplyfun.com/products/diggers-garden-match) |
| Dreaming Dragon | SF082 | [Product](https://simplyfun.com/products/dreaming-dragon) |
| Glow Spotters | SF184 | [Product](https://simplyfun.com/products/glow-spotters) |
| Ice Tumble | SF177 | [Product](https://simplyfun.com/products/ice-tumble) |
| Is or Isn't | SF192 | [Product](https://simplyfun.com/products/is-or-isnt) |
| Math Medalist | SF162 | [Product](https://simplyfun.com/products/math-medalist) |
| Math Room | SF093 | [Product](https://simplyfun.com/products/math-room) |
| Nebulous Connections | SF219 | [Product](https://simplyfun.com/products/nebulous-connections) |
| Owl Solve That! | SF169 | [Product](https://simplyfun.com/products/owl-solve-that) |
| Poles Apart | SF217 | [Product](https://simplyfun.com/products/poles-apart) |
| Prickly Path | SF207 | [Product](https://simplyfun.com/products/prickly-path) |
| SavannaScapes | SF197 | [Product](https://simplyfun.com/products/savannascapes) |
| Sumology | SF070 | [Product](https://simplyfun.com/products/sumology) |
| Team Digger | SF186F | [Product](https://simplyfun.com/products/team-digger) |
| The Climbing Knights | SF142 | [Product](https://simplyfun.com/products/the-climbing-knights) |
| Time Jumpers | SF203 | [Product](https://simplyfun.com/products/time-jumpers) |
| Trifusion | SF085 | [Product](https://simplyfun.com/products/trifusion) |

Before acceptance, the candidate records passed the publisher identity schema, content-bound acceptance revision checks, exact normalized-name and source-URL collision checks against the current registry, and a full in-memory registry merge. A separate content validation passed with 1,111 approved game-rule records. The later release build and live checks are recorded with the deployed commit.
