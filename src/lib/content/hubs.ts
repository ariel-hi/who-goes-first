import type { PublicRule } from './schema';

// Themes group rules by words in the approved starting instruction itself. Hub
// pages always show that exact instruction, so a loose match can never assert a
// rule the rulebook doesn't contain; headings say "rules about", not "games where".
export const themes = [
  { slug: 'youngest-player', title: 'Starting-Player Rules About the Youngest Player', label: 'The youngest player', about: 'the youngest player', pattern: /\byoungest\b/i },
  { slug: 'oldest-player', title: 'Starting-Player Rules About the Oldest Player', label: 'The oldest player', about: 'the oldest player', pattern: /\boldest\b/i },
  { slug: 'birthdays', title: 'Birthday Rules for Who Goes First', label: 'Birthdays', about: 'birthdays', pattern: /\bbirthdays?\b/i },
  { slug: 'food-and-drink', title: 'Food and Drink Rules for Who Goes First', label: 'Food and drink', about: 'food and drink', pattern: /\b(ate|eaten|eats?|food|snacks?|cooked|baked|drank|drinks?|coffee|tea|cheese|fruits?|pizza|candy|chocolate|ice cream|vegetables?|cake|cookies?|breakfast|dinner|lunch)\b/i },
  { slug: 'animals', title: 'Animal Rules for Who Goes First', label: 'Animals', about: 'animals', pattern: /\b(petted|pets?|dogs?|cats?|animals?|birds?|horses?|zoo|farm|fed|insects?|bugs?|frogs?|owls?|dinosaurs?)\b/i },
  { slug: 'travel', title: 'Travel Rules for Who Goes First', label: 'Travel and places', about: 'travel and places', pattern: /\b(visited|travel(l?ed|l?ing)?|trip|flew|flight|vacation|holiday|abroad|boat|ship|train|countr(y|ies)|city|museum|island)\b/i },
  { slug: 'outdoors', title: 'Outdoor Rules for Who Goes First', label: 'The outdoors', about: 'the outdoors', pattern: /\b(hiked?|hiking|garden(ed|ing)?|forest|woods|beach|camping|camped|climbed|trees?|flowers?|plants?|ocean|sea|mountains?|lake|river|swam|swimming|stars?|moon|rain|snow)\b/i },
  { slug: 'most-recently', title: '“Most Recently” Rules for Who Goes First', label: 'Whoever did something most recently', about: 'whoever did something most recently', pattern: /\bmost recent(ly)?\b|\blast (person|player) to\b|\b(who|whoever) (last|was last)\b/i },
  { slug: 'group-choice', title: 'Games That Let the Group Choose Who Goes First', label: 'The group decides', about: 'letting the group decide', pattern: /^(the group (chooses|decides|picks)|(the )?players (choose|decide|agree)|choose (a|the|any) (first|starting|start) player[.;,]|choose who (starts|goes first)|decide who|agree on)/i },
  { slug: 'random', title: 'Starting-Player Rules That Mention a Random Choice', label: 'A random draw', about: 'choosing at random', pattern: /\brandom(ly)?\b/i },
] as const;
export const minimumHubSize = 5;
export const minimumPublisherSize = 3;

export const slugify = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const publisherOf = (rule: PublicRule) => rule.sources[0]!.publisher;

/** Theme hubs with enough rules to be useful pages rather than thin listings. */
export function themeHubs(catalog: PublicRule[]) {
  return themes.map(theme => ({ ...theme, rules: catalog.filter(rule => theme.pattern.test(rule.firstPlayerRule)) })).filter(hub => hub.rules.length >= minimumHubSize);
}

export function publisherHubs(catalog: PublicRule[]) {
  const groups = new Map<string, { name: string; rules: PublicRule[] }>();
  for (const rule of catalog) {
    const name = publisherOf(rule); const slug = slugify(name);
    if (!slug) continue;
    const group = groups.get(slug) ?? { name, rules: [] };
    group.rules.push(rule); groups.set(slug, group);
  }
  return [...groups].map(([slug, group]) => ({ slug, ...group })).filter(hub => hub.rules.length >= minimumPublisherSize).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Up to `count` neighbours in the rule's first qualifying theme. Taking the next
 * entries in name order (wrapping) spreads internal links evenly across a hub
 * instead of pointing every page at the same alphabetically-first games.
 */
export function similarRules(rule: PublicRule, catalog: PublicRule[], exclude: ReadonlySet<string>, count = 5) {
  const hub = themeHubs(catalog).find(candidate => candidate.pattern.test(rule.firstPlayerRule));
  if (!hub) return { hub: undefined, rules: [] };
  const members = hub.rules.toSorted((a, b) => a.gameName.localeCompare(b.gameName) || a.id.localeCompare(b.id));
  const start = members.findIndex(member => member.id === rule.id);
  const rules: PublicRule[] = [];
  for (let step = 1; step < members.length && rules.length < count; step++) {
    const candidate = members[(start + step) % members.length]!;
    if (candidate.id !== rule.id && !exclude.has(candidate.id)) rules.push(candidate);
  }
  return { hub, rules };
}

/** Groups portable criteria for the "ways to pick" page; each rule appears once. */
export function groupByTheme(rules: PublicRule[]) {
  const order = ['food-and-drink', 'animals', 'travel', 'outdoors', 'birthdays', 'youngest-player', 'oldest-player', 'most-recently'];
  const groups = order.map(slug => ({ theme: themes.find(theme => theme.slug === slug)!, rules: [] as PublicRule[] }));
  const other: PublicRule[] = [];
  for (const rule of rules) (groups.find(group => group.theme.pattern.test(rule.firstPlayerRule))?.rules ?? other).push(rule);
  return { groups: groups.filter(group => group.rules.length), other };
}
