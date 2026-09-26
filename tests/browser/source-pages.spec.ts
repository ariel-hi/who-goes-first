import { test, expect } from '@playwright/test';

test('Brass exposes its setup and round pages without changing the query or top shortcut', async ({ page }) => {
  await page.goto('/games/brass-birmingham-roxley-en/');
  const source = page.locator('.source-list > li').first();
  const documentHref = await source.locator('.source-document').getAttribute('href');
  expect(new URL(documentHref!).search).toBe('?v=1758826281');
  await expect(source.locator('.source-cited-pages a')).toHaveText(['PDF page 1', 'PDF page 3', 'PDF page 4']);
  for (const number of [1, 3, 4]) {
    await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${documentHref}#page=${number}`);
  }
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 1)', exact: true })).toHaveAttribute('href', `${documentHref}#page=1`);
  await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', documentHref!);
});

test('Uprising exposes all cited pages in their source order', async ({ page }) => {
  await page.goto('/games/dune-imperium-uprising-dire-wolf-en-2023/');
  const source = page.locator('.source-list > li').first();
  const documentHref = await source.locator('.source-document').getAttribute('href');
  await expect(source.locator('.source-cited-pages a')).toHaveText(['PDF page 5', 'PDF page 8', 'PDF page 15', 'PDF page 19', 'PDF page 1']);
  for (const number of [8, 15]) {
    await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${documentHref}#page=${number}`);
  }
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 5)', exact: true })).toHaveAttribute('href', `${documentHref}#page=5`);
});

test('a second PDF source gets its own pages while a hosted viewer keeps its original URL', async ({ page }) => {
  await page.goto('/games/icecool-brain-games-en/');
  const sources = page.locator('.source-list > li');
  await expect(sources).toHaveCount(2);
  await expect(sources.first().locator('.source-document')).toHaveAttribute('href', 'https://drive.google.com/file/d/1OqHjZSI14QHhd8Kao6-bNImQnZyW7BK4/view?usp=sharing');
  await expect(sources.first().locator('.source-cited-pages')).toHaveCount(0);
  const second = sources.nth(1);
  const documentHref = await second.locator('.source-document').getAttribute('href');
  await expect(second.locator('.source-cited-pages a')).toHaveText(['PDF page 3', 'PDF page 5', 'PDF page 11']);
  for (const number of [3, 5, 11]) {
    await expect(second.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${documentHref}#page=${number}`);
  }
});

test('a reviewed Google download retains its complete URL and gains cited page links', async ({ page }) => {
  await page.goto('/games/copper-country-cmx-en/');
  const source = page.locator('.source-list > li').first();
  const documentHref = 'https://drive.google.com/uc?export=download&id=1ujQziJLbT6wjLUUrwtOk-G6VWaGsT0Cl';
  await expect(source.locator('.source-document')).toHaveAttribute('href', documentHref);
  await expect(source.locator('.source-cited-pages a')).toHaveText(['PDF page 5', 'PDF page 6']);
  for (const number of [5, 6]) {
    await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${documentHref}#page=${number}`);
  }
  await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', documentHref);
});

test('Stonesaga preserves both suffixless PDF URLs and their exact cited page order', async ({ page }) => {
  await page.goto('/games/stonesaga-open-owl-en-rulebook-1-1/');
  const documents = [
    {
      href: 'https://drive.usercontent.google.com/download?id=14EfqsIbeFudnJltnWzlNq3hKV3uuoxwW&export=download&confirm=t',
      pages: [24, 6, 7, 8, 9, 10, 11, 98, 100, 101, 107],
    },
    {
      href: 'https://docs.google.com/document/d/17SKgAs0-sOVsJ03L0mYUAiabDA3JsLKqkCtT7zXqsj8/export?format=pdf',
      pages: [2, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  ];
  const sources = page.locator('.source-list > li');
  await expect(sources).toHaveCount(documents.length);
  for (const [index, document] of documents.entries()) {
    const source = sources.nth(index);
    await expect(source.locator('.source-document')).toHaveAttribute('href', document.href);
    await expect(source.locator('.source-cited-pages a')).toHaveText(document.pages.map(number => `PDF page ${number}`));
    for (const number of document.pages) {
      await expect(source.getByRole('link', { name: `PDF page ${number}`, exact: true })).toHaveAttribute('href', `${document.href}#page=${number}`);
    }
  }
  await expect(page.getByRole('link', { name: 'View cited page (PDF page 24)', exact: true })).toHaveAttribute('href', `${documents[0]!.href}#page=24`);
  await expect(page.getByRole('link', { name: 'Read the publisher’s rulebook', exact: true })).toHaveAttribute('href', documents[0]!.href);
});

test('source pages are ordinary touch-sized links without JavaScript, and HTML sources get no PDF shortcuts', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 750 } });
  try {
    const page = await context.newPage();
    for (const slug of ['brass-birmingham-roxley-en', 'dune-imperium-uprising-dire-wolf-en-2023', 'stonesaga-open-owl-en-rulebook-1-1']) {
      await page.goto(`/games/${slug}/`);
      const links = page.locator('.source-list a');
      expect(await links.count()).toBeGreaterThan(2);
      for (const link of await links.all()) {
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await expect(link).toHaveAttribute('href', /^https:\/\//);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.goto('/games/backgammon-usbgf-basics-standard-en/');
    await expect(page.locator('.source-cited-pages')).toHaveCount(0);
    await expect(page.locator('.source-document')).toHaveAttribute('href', 'https://usbgf.org/backgammon-basics-how-to-play/');
    await expect(page.getByRole('link', { name: 'Read the source rules', exact: true })).toHaveAttribute('href', 'https://usbgf.org/backgammon-basics-how-to-play/');
  } finally {
    await context.close();
  }
});
