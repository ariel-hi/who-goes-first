import { expect, test } from 'vitest';
import { changedPublishedPages, latestAcknowledgedPages, publishedDigestAlgorithm, publishedPage, unacknowledgedPublishedPages } from '../../scripts/lib/publish-pages';
import { pageContentDigest } from '../../scripts/lib/indexnow';
const html = (answer: string, robots = 'index, follow', css = 'one.css') => `<html><head><title>A rule</title><meta name="robots" content="${robots}"><meta name="description" content="Reviewed rule"><link rel="canonical" href="https://whogoesfirst.fun/games/test/"><link rel="stylesheet" href="${css}"></head><body><main><p>${answer}</p><a href="https://publisher.test/rules.pdf#page=2">Source</a></main></body></html>`;
test('publish notifications select changed answers and sources, excluding cosmetic changes and noindex pages', () => {
  const before = publishedPage(html('Youngest starts'))!;
  expect(publishedPage(html('Youngest starts', 'index, follow', 'two.css'))).toEqual(before);
  expect(publishedPage(html('Youngest starts').replace('</main>', '<aside class="rule-ad">Advertisement<ins data-ad-slot="12345"></ins></aside></main>'))).toEqual(before);
  expect(publishedPage(html('Youngest starts', 'noindex, follow'))).toBeUndefined();
  expect(publishedPage(html('Youngest starts').replace('#page=2', '#page=3'))!.digest).not.toBe(before.digest);
  const after = publishedPage(html('Oldest starts'))!;
  expect(changedPublishedPages(new Map([[before.url, before.digest]]), new Map([[after.url, after.digest]]))).toEqual([after.url]);
  expect(changedPublishedPages(new Map([[before.url, before.digest]]), new Map([[before.url, before.digest]]))).toEqual([]);
});
test('Cloudflare email encoding does not masquerade as an undeployed editorial change', () => {
  const email = 'editor@example.com?subject=Rule correction';
  const encoded = (seed: number) => `/cdn-cgi/l/email-protection#${Buffer.from([seed, ...Buffer.from(email).map(byte => byte ^ seed)]).toString('hex')}`;
  const original = html('Youngest starts').replace('</main>', `<a href="mailto:${email}">Correction</a></main>`);
  const live = (seed: number) => original.replace(`mailto:${email}`, encoded(seed));
  expect(publishedPage(live(10))).toEqual(publishedPage(original));
  expect(publishedPage(live(139))).toEqual(publishedPage(original));
  expect(publishedPage(original.replace('editor@example.com', 'other@example.com'))).not.toEqual(publishedPage(original));
});
test('partial editorial acknowledgments survive cosmetic releases while changed answers remain pending', () => {
  const a = html('Youngest starts', 'index, follow', 'a.css');
  const b = html('Youngest starts', 'index, follow', 'b.css');
  const c = html('Oldest starts', 'index, follow', 'b.css');
  const acknowledged = { url: publishedPage(a)!.url, digest: pageContentDigest(a), editorialDigest: publishedPage(a)!.digest, editorialDigestAlgorithm: publishedDigestAlgorithm };
  const plan = (body: string) => [{ url: acknowledged.url, digest: pageContentDigest(body) }];
  const current = (body: string) => new Map([[acknowledged.url, publishedPage(body)!.digest]]);
  expect(plan(b)[0]!.digest).not.toBe(acknowledged.digest);
  expect(unacknowledgedPublishedPages(plan(b), [acknowledged], current(b))).toEqual([]);
  expect(unacknowledgedPublishedPages(plan(c), [acknowledged], current(c))).toEqual([acknowledged.url]);
  const later = { url: acknowledged.url, digest: pageContentDigest(c), editorialDigest: publishedPage(c)!.digest, editorialDigestAlgorithm: publishedDigestAlgorithm };
  expect(unacknowledgedPublishedPages(plan(a), [acknowledged, later], current(a))).toEqual([acknowledged.url]);
  expect(latestAcknowledgedPages([acknowledged, later])).toEqual([later]);
  const legacy = { url: acknowledged.url, digest: acknowledged.digest };
  expect(unacknowledgedPublishedPages(plan(a), [legacy], current(a))).toEqual([]);
  expect(unacknowledgedPublishedPages(plan(b), [legacy], current(b))).toEqual([acknowledged.url]);
});
test('visible About contact email is decoded semantically without changing the raw receipt algorithm', () => {
  const email = 'editor@example.com';
  const raw = html('Contact').replace('</main>', `<a href="mailto:${email}">${email}</a></main>`);
  const live = (destination: string, seed: number, spanSeed = seed) => {
    const hex = (value: number) => Buffer.from([value, ...Buffer.from(destination).map(byte => byte ^ value)]).toString('hex');
    return raw.replace(`<a href="mailto:${email}">${email}</a>`, `<a href="/cdn-cgi/l/email-protection#${hex(seed)}"><span class="__cf_email__" data-cfemail="${hex(spanSeed)}">[email&#160;protected]</span></a>`);
  };
  expect(publishedPage(live(email, 10))).toEqual(publishedPage(raw));
  expect(publishedPage(live(email, 139, 10))).toEqual(publishedPage(raw));
  expect(publishedPage(live('other@example.com', 10))).not.toEqual(publishedPage(raw));
  expect(publishedPage(live(email, 10).replace(/data-cfemail="[a-f0-9]+"/, 'data-cfemail="invalid"'))).not.toEqual(publishedPage(raw));
  expect(pageContentDigest(live(email, 10))).not.toBe(pageContentDigest(raw));
});
