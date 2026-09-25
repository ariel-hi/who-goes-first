import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { showAllMethods } from './helpers';
import { readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { contentRevision, ruleSchema } from '../../src/lib/content/schema';

test('actual dev preview hydrates and supports all reveals, names and preferences', async ({ page }) => {
  test.setTimeout(90000);
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('button', { name: 'Pick a player' })).toBeEnabled();
  await page.getByRole('button', { name: 'Add a player' }).click();
  await expect(page.locator('.player')).toHaveCount(5);
  await page.getByRole('button', { name: 'Paste a list' }).click();
  await page.getByLabel('Player names').fill('Mina\nAlex\nJo');
  await showAllMethods(page);
  for (const mode of ['Instant', 'Quick', 'Spinner', 'Card Draw', 'Balloon Rise', 'Towers', 'Shortest Match', 'Dice Roll', 'Coin Flip', 'Shell Game']) {
    await page.getByRole('radio', { name: new RegExp(`^${mode}`) }).check();
    await page.getByRole('button', { name: 'Pick a player' }).click();
    await expect(page.locator('.winner-announcement')).toContainText(/(Mina|Alex|Jo) goes first/);
    // The double-activation guard is intentional for successive immediate picks.
    await page.waitForTimeout(500);
  }
  await page.getByRole('button', { name: 'Preferences' }).click();
  await page.getByLabel('Remember this group').check();
  await page.reload();
  await expect(page.getByLabel('Name for player 1', { exact: true })).toHaveValue('Mina'); await expect(page.getByLabel('Name for player 3', { exact: true })).toHaveValue('Jo');
  await page.getByRole('link', { name: 'Game rules', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4321/dev/games/');
  await page.getByRole('searchbox').fill('TTR');
  // The abbreviation matches the original game and two researched Europe editions.
  await expect(page.locator('.game-list li:visible')).toHaveCount(3);
  await page.locator('.game-list li:visible a').filter({ hasText: '7281N' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ticket to Ride');
  await expect(page.locator('.rule-answer')).toContainText('chooses its own method');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('link', { name: 'Game rules', exact: true }).click();
  await page.getByRole('link', { name: 'Try the original house rules' }).click();
  await page.getByRole('button', { name: 'Choose a question' }).click();
  const prompt = await page.locator('[data-prompt]').textContent();
  await page.getByRole('button', { name: 'Another question' }).click();
  await expect(page.locator('[data-prompt]')).not.toHaveText(prompt!);
  expect(failures).toEqual([]);
});

test('the full researched catalog is listed and representative sourced pages work', async ({ page, request }) => {
  test.setTimeout(90000);
  const count = readdirSync('research/games').filter(name => name.endsWith('.json')).length;
  await page.goto('http://127.0.0.1:4321/dev/games/');
  await expect(page.getByText(`Local preview · ${count} game rules`)).toBeVisible();
  await expect(page.locator('.game-list li')).toHaveCount(count);
  const links = await page.locator('.game-list a').evaluateAll(items => items.map(item => (item as HTMLAnchorElement).href));
  const samples = [...new Set([links[0]!, links[Math.floor(links.length / 2)]!, links.at(-1)!])];
  for (const url of samples) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    const html = await response.text();
    expect(html).toContain(url.includes('/dev/rules/') ? 'Draft rule · not approved' : 'From the publisher’s rulebook');
    expect(html).toContain('rule-answer');
    expect(html).toMatch(/Source (?:&|&amp;) edition/);
    expect(html).not.toContain('astro-island');
  }
  await page.getByRole('searchbox').fill('Seven Wonders');
  await expect(page.locator('.game-list li:visible')).toHaveCount(1);
  await page.locator('.game-list li:visible a').click();
  await expect(page.locator('.rule-answer')).toContainText('no single starting player');
  await expect(page.getByRole('link', { name: 'Read the publisher' })).toHaveAttribute('href', /^https:\/\//);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  for (const path of ['/dev/games/', '/dev/house-rules/', '/dev/coverage/']) {
    expect((await request.get(`http://127.0.0.1:4322${path}`)).status()).toBe(404);
  }
  // A reviewed record can move into the public catalog without weakening the
  // exclusion check for the remaining drafts.
  const approvedFiles = new Set(readdirSync('src/content/games'));
  const remainingDraft = readdirSync('research/games').find(file => file.endsWith('.json') && !approvedFiles.has(file));
  if (remainingDraft) {
    const draft = ruleSchema.parse(JSON.parse(readFileSync(`research/games/${remainingDraft}`, 'utf8')));
    expect((await request.get(`http://127.0.0.1:4322/games/${draft.slug}/`)).status()).toBe(404);
  }
});

test('full discovery inventory is searchable and never counted as finished rules', async ({ page }) => {
  const inventory = JSON.parse(readFileSync('research/coverage/discovery-index.json', 'utf8'));
  await page.goto('http://127.0.0.1:4321/dev/coverage/');
  await expect(page.locator('.coverage-list li')).toHaveCount(inventory.games.length);
  await expect(page.getByText('Game identities are not verified starting rules.')).toBeVisible();
  await page.getByRole('searchbox').fill('265736');
  await expect(page.locator('.coverage-list li:visible')).toHaveCount(1);
  await expect(page.locator('.coverage-list li:visible')).toContainText('Tiny Towns');
  await page.locator('.coverage-list li:visible a[href$="/tiny-towns-base-en/"]').click();
  await expect(page.locator('.rule-answer')).toContainText('Master Builder');
  await page.goBack();
  await page.getByRole('searchbox').fill('377449');
  await expect(page.locator('.coverage-list li:visible')).toHaveCount(1);
  await expect(page.locator('.coverage-list li:visible')).toContainText('Allplay dinosaur');
  await expect(page.locator('.coverage-list li:visible')).not.toContainText('Gamewright');
  await page.getByRole('searchbox').fill('369899');
  await expect(page.locator('.coverage-list li:visible')).toHaveCount(1);
  await expect(page.locator('.coverage-list li:visible')).toContainText('Allplay');
  await expect(page.locator('.coverage-list li:visible')).not.toContainText('Gamewright');
  await page.getByRole('searchbox').fill('no such game qzx');
  await expect(page.getByText('No matching game in this inventory.')).toBeVisible();
  await page.getByRole('searchbox').fill('');
  const pendingCount = await page.locator('.coverage-list li[data-status=pending]').count();
  await page.getByLabel('Research status').selectOption('pending');
  await expect(page.locator('.coverage-list li:visible')).toHaveCount(pendingCount);
  await expect(page.locator('.coverage-list li[data-status=researched]:visible')).toHaveCount(0);
});

test('random-rule controls wait for their script and recover from unavailable randomness', async ({ page }) => {
  let release!: () => void;
  const loaded = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/src\/components\/RandomRule\.astro\?/, async route => { await loaded; await route.continue(); });
  await page.goto('http://127.0.0.1:4321/dev/games/', { waitUntil: 'commit' });
  try { await expect(page.getByRole('button', { name: 'Pick a rule' })).toBeDisabled(); }
  finally { release(); }
  await expect(page.getByRole('button', { name: 'Pick a rule' })).toBeEnabled();
  await page.evaluate(() => { Object.defineProperty(crypto, 'getRandomValues', { value: () => { throw new Error('Test-only unavailable RNG'); } }); });
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a rule from the list');
  await expect(page.locator('[data-rule-result]')).toBeHidden();
  expect(await page.locator('.game-list a').count()).toBeGreaterThan(0);
});

test('random game rule redraw and source navigation work without treating a rule as an equal-chance draw', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { name: 'Playing a specific game?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse game rules' })).toHaveAttribute('href', '/dev/games/');
  await page.getByRole('link', { name: 'Try a random rule' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4321/dev/games/#random-rule');
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  const answer = await page.locator('[data-rule-answer]').textContent();
  const priorLink = await page.locator('[data-rule-link]').getAttribute('href');
  await expect(page.locator('[data-rule-answer]')).not.toBeEmpty();
  await expect(page.getByText('These criteria give people different chances.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip this rule' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Another rule' }).click();
  await expect(page.locator('[data-rule-link]')).not.toHaveAttribute('href', priorLink!);
  // Different games may legitimately share the same rule; compare identity too.
  const nextName = await page.locator('[data-rule-game]').textContent();
  await page.getByRole('link', { name: 'Source & details' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(nextName!);
  expect(answer?.length).toBeGreaterThan(0);
});

test('all researched games are searchable but only reviewed portable rules enter the random mix', async ({ page }) => {
  await page.goto('http://127.0.0.1:4321/dev/games/');
  const choices = JSON.parse((await page.locator('[data-random-rule]').getAttribute('data-choices'))!) as { id: string; name: string; rule: string; href: string }[];
  expect(choices.length).toBeGreaterThan(50);
  expect(new Set(choices.map(choice => choice.id)).size).toBe(choices.length);
  expect(await page.locator('.game-list li').count()).toBeGreaterThan(choices.length);
  for (const id of ['sushi-go-2014-en', '7-wonders-2020-en', 'codenames-2025-en', 'pandemic-2013-en', 'the-crew-2019-en', 'wingspan-online-en']) expect(choices.some(choice => choice.id === id), id).toBe(false);
  await page.getByRole('searchbox').fill('Forbidden');
  expect(await page.locator('.game-list li:visible').count()).toBeGreaterThanOrEqual(4);
  await page.getByRole('searchbox').fill('Imagine');
  await page.locator('.game-list li:visible a').click();
  await expect(page.getByRole('heading', { name: 'Official tie-break or fallback' }).locator('..')).toContainText('youngest');
  await page.goto('http://127.0.0.1:4321/games/targi/');
  await expect(page.locator('.rule-answer')).toContainText('If neither player has ever eaten dates');
  await page.goto('http://127.0.0.1:4321/dev/games/');
  await page.getByRole('searchbox').fill('Spin Circus');
  await expect(page.locator('.game-list li:visible')).toHaveCount(2);
  await page.getByRole('link', { name: /Spin Circus US English/ }).click();
  await expect(page.locator('.rule-answer')).toContainText('acrobat');
  await page.goBack();
  await page.getByRole('searchbox').fill('Spin Circus');
  await page.getByRole('link', { name: /Spin Circus UK English/ }).click();
  await expect(page.locator('.rule-answer')).toContainText('stage');
  await page.goto('http://127.0.0.1:4321/dev/games/');
  // Force the final index, beyond the picker roster limit. This catches truncation
  // or accidentally using the player RNG helper for the much larger compendium.
  await page.evaluate(word => {
    Object.defineProperty(crypto, 'getRandomValues', { value: (array: Uint32Array) => { array[0] = word; return array; } });
  }, choices.length - 1);
  await page.getByRole('button', { name: 'Pick a rule' }).click();
  const last = choices.at(-1)!;
  await expect(page.locator('[data-rule-game]')).toHaveText(last.name);
  await expect(page.locator('[data-rule-answer]')).toHaveText(last.rule);
  await page.getByRole('link', { name: 'Source & details' }).click();
  await expect(page.locator('.rule-answer')).toHaveText(last.rule);
});

test('draft additions, edits and removal are available without restarting the dev server', async ({ request, browserName }) => {
  const slug = `automated-live-route-fixture-${browserName}`;
  const path = `research/games/${slug}.json`;
  const url = `http://127.0.0.1:4321/dev/rules/${slug}/`;
  expect((await request.get(url)).status()).toBe(404);
  const first = readdirSync('research/games').find(name => name.endsWith('.json'))!;
  const fixture = { ...JSON.parse(readFileSync(`research/games/${first}`, 'utf8')), id: slug, slug,
    gameName: 'AUTOMATED LIVE-ROUTE TEST FIXTURE', aliases: [],
    firstPlayerRule: 'Synthetic initial answer for a development routing test.',
    status: 'draft', approvedBy: null, approvedRevision: null, publishedAt: null, materiallyUpdatedAt: null,
  };
  // Exclusive creation protects any existing file; the finally block removes
  // only this test's synthetic, never-approved record.
  writeFileSync(path, JSON.stringify(fixture), { flag: 'wx' });
  try {
    const added = await request.get(url);
    expect(added.status()).toBe(200);
    expect(await added.text()).toContain(fixture.firstPlayerRule);
    fixture.firstPlayerRule = 'Synthetic revised answer for a development routing test.';
    writeFileSync(path, JSON.stringify(fixture));
    expect(await (await request.get(url)).text()).toContain(fixture.firstPlayerRule);
  } finally { unlinkSync(path); }
  const removed = await request.get(url);
  expect(removed.status()).toBe(404);
  expect(await removed.text()).toContain('Page not found');
});

test('reviewed catalog additions, edits and removal work without restarting development', async ({ request, browserName }) => {
  const slug = `automated-live-approved-fixture-${browserName}`;
  const path = `src/content/games/${slug}.json`;
  const url = `http://127.0.0.1:4321/games/${slug}/`;
  expect((await request.get(url)).status()).toBe(404);
  const first = readdirSync('research/games').find(name => name.endsWith('.json'))!;
  const date = new Date().toISOString().slice(0, 10);
  const fixture = ruleSchema.parse({ ...JSON.parse(readFileSync(`research/games/${first}`, 'utf8')), id: slug, slug,
    gameName: 'AUTOMATED LIVE APPROVED-ROUTE TEST FIXTURE', aliases: [],
    firstPlayerRule: 'Synthetic reviewed answer for a development routing test.',
    internalEvidence: 'PRIVATE_LIVE_APPROVED_FIXTURE — automated test only, no factual review claim.',
    status: 'approved', approvedBy: 'AUTOMATED FIXTURE ONLY — NOT REAL EDITORIAL APPROVAL',
    approvedRevision: null, publishedAt: date, materiallyUpdatedAt: date,
  });
  fixture.approvedRevision = contentRevision(fixture);
  writeFileSync(path, JSON.stringify(fixture), { flag: 'wx' });
  try {
    const added = await request.get(url);
    expect(added.status()).toBe(200);
    const html = await added.text();
    expect(html).toContain(fixture.firstPlayerRule);
    expect(html).not.toContain('PRIVATE_LIVE_APPROVED_FIXTURE');
    fixture.firstPlayerRule = 'Synthetic updated reviewed answer for the same live route.';
    fixture.approvedRevision = contentRevision(fixture);
    writeFileSync(path, JSON.stringify(fixture));
    expect(await (await request.get(url)).text()).toContain(fixture.firstPlayerRule);
  } finally { unlinkSync(path); }
  const removed = await request.get(url);
  expect(removed.status()).toBe(404);
  expect(await removed.text()).toContain('Page not found');
});
