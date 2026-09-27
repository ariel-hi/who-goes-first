import { test, expect } from '@playwright/test';

test('team generation explains overflow and preserves every name at the limit', async ({ page }) => {
  await page.goto('/random-team-generator/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  const tool = page.locator('.team-tool');
  const input = page.locator('#team-names');
  const names = Array.from({ length: 201 }, (_, i) => 'Player ' + (i + 1));
  await input.fill(names.slice(0, 200).join('\n'));
  await tool.getByRole('button', { name: 'Make teams', exact: true }).click();
  await expect(tool.locator('.team-list li')).toHaveCount(2);

  // A larger pasted roster must not silently keep an old result or omit Player 201.
  await input.fill(names.join('\n'));
  await expect(tool.getByRole('alert')).toHaveText('Add up to 200 names. Remove the extra names to make teams.');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-describedby', 'team-error');
  await expect(tool.getByRole('button', { name: 'Make teams', exact: true })).toBeDisabled();
  await expect(tool.locator('.team-list')).toHaveCount(0);
  await expect(tool.getByRole('button', { name: 'Copy teams', exact: true })).toHaveCount(0);
  await expect(tool.getByText('More than 200 names', { exact: true })).toBeVisible();

  await input.fill(names.slice(0, 200).join('\n'));
  await expect(tool.getByRole('alert')).toHaveCount(0);
  await expect(input).toHaveAttribute('aria-invalid', 'false');
  await expect(input).not.toHaveAttribute('aria-describedby', 'team-error');
  await tool.getByRole('button', { name: 'Make teams', exact: true }).click();
  await expect(tool.locator('.team-list li')).toHaveCount(2);
  const actual = (await tool.locator('.team-list li p').allTextContents()).flatMap(team => team.split(', '));
  expect(actual.sort()).toEqual(names.slice(0, 200).sort());
  await page.locator('#team-count').selectOption('4');
  await expect(tool.locator('.team-list')).toHaveCount(0);
  await expect(tool.getByRole('button', { name: 'Copy teams', exact: true })).toHaveCount(0);
  await tool.getByRole('button', { name: 'Make teams', exact: true }).click();
  await expect(tool.locator('.team-list li')).toHaveCount(4);
  const resized = (await tool.locator('.team-list li p').allTextContents()).map(team => team.split(', '));
  expect(resized.map(team => team.length)).toEqual([50, 50, 50, 50]);
  expect(resized.flat().sort()).toEqual(names.slice(0, 200).sort());
});

type CopyFixture = { pending: { text: string; finish: () => void }[]; settled: number };

test('editing or reshuffling teams cannot inherit an earlier pending copy confirmation', async ({ page }) => {
  await page.addInitScript(() => {
    const fixture: CopyFixture = { pending: [], settled: 0 };
    Object.defineProperty(window, '__teamCopyProof', { value: fixture });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: (text: string) => new Promise<void>(resolve => fixture.pending.push({
        text, finish: () => { fixture.settled++; resolve(); },
      })),
    } });
  });
  await page.goto('/random-team-generator/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  const tool = page.locator('.team-tool');
  const input = page.locator('#team-names');
  await input.fill('王芳\nSam\nSam\n👨‍👩‍👧‍👦');
  await tool.getByRole('button', { name: 'Make teams', exact: true }).click();
  await tool.getByRole('button', { name: 'Copy teams', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __teamCopyProof: CopyFixture }).__teamCopyProof.pending.length)).toBe(1);

  // The original write is still pending while a different roster and count produce new teams.
  await input.fill('Mina\n王芳\nSam\nSam\nLee\nKai');
  await page.locator('#team-count').selectOption('3');
  await expect(tool.locator('.team-list')).toHaveCount(0);
  await tool.getByRole('button', { name: 'Make teams', exact: true }).click();
  await expect(tool.locator('.team-list li')).toHaveCount(3);
  const finishCopy = async () => {
    await page.evaluate(async () => {
      const fixture = (window as unknown as { __teamCopyProof: CopyFixture }).__teamCopyProof;
      const pending = fixture.pending.shift();
      if (!pending) throw new Error('Expected an owned pending clipboard write');
      pending.finish();
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
  };
  await finishCopy();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __teamCopyProof: CopyFixture }).__teamCopyProof.settled)).toBe(1);
  await expect(tool.getByRole('button', { name: 'Copy teams', exact: true })).toBeVisible();
  await expect(tool.getByRole('button', { name: 'Copied', exact: true })).toHaveCount(0);

  // A write of the current teams still receives its normal confirmation.
  await tool.getByRole('button', { name: 'Copy teams', exact: true }).click();
  await finishCopy();
  await expect(tool.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  await page.locator('#team-count').selectOption('2');
  await expect(tool.locator('.team-list')).toHaveCount(0);
  await expect(tool.getByRole('button', { name: 'Copied', exact: true })).toHaveCount(0);
});
