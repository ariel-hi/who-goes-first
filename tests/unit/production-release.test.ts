import { describe, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { isProductionReleaseCurrent, isResearchOnlyAdvance } from '../../scripts/lib/production-release.js';

const release = 'a'.repeat(40);
const main = 'b'.repeat(40);
const comparison = () => ({
  status: 'ahead', behind_by: 0, ahead_by: 1, total_commits: 1,
  base_commit: { sha: release }, merge_base_commit: { sha: release },
  commits: [{ sha: main }], files: [{ filename: 'research/demand/weekly-report.md', status: 'modified' }],
});

describe('production release guard', () => {
  test('allows only a proven descendant with a complete report-only diff', () => {
    expect(isResearchOnlyAdvance(comparison(), release, main)).toBe(true);
    const multiple = { ...comparison(), ahead_by: 2, total_commits: 2, commits: [{ sha: 'c'.repeat(40) }, { sha: main }], files: [
      { filename: 'research/demand/weekly-report.md', status: 'modified' },
      { filename: 'research/demand/indexing.json', status: 'added' },
    ] };
    expect(isResearchOnlyAdvance(multiple, release, main)).toBe(true);
    expect(isResearchOnlyAdvance({ ...comparison(), files: [] }, release, main)).toBe(true);
  });

  test('rejects app edits and renames that remove content outside the report directory', () => {
    for (const filename of ['src/pages/index.astro', 'public/analytics-consent.js', 'research/coverage/discovery-index.json', '.github/workflows/growth.yml', 'research/demand-other/report.md', 'research/demand/../coverage/report.md']) {
      expect(isResearchOnlyAdvance({ ...comparison(), files: [{ filename, status: 'modified' }] }, release, main)).toBe(false);
    }
    expect(isResearchOnlyAdvance({ ...comparison(), files: [{ filename: 'research/demand/report.md', status: 'renamed', previous_filename: 'src/pages/index.astro' }] }, release, main)).toBe(false);
    expect(isResearchOnlyAdvance({ ...comparison(), files: [{ filename: 'research/demand/report.md', status: 'renamed' }] }, release, main)).toBe(false);
    expect(isResearchOnlyAdvance({ ...comparison(), files: [{ filename: 'research/demand/report.md', status: 'renamed', previous_filename: 'research/demand/old-report.md' }] }, release, main)).toBe(true);
  });

  test('fails closed on rewritten history, missing data and either API truncation boundary', () => {
    for (const update of [
      { status: 'diverged' }, { behind_by: 1 }, { base_commit: { sha: main } }, { merge_base_commit: { sha: main } },
      { commits: [] }, { commits: [{ sha: 'c'.repeat(40) }] }, { total_commits: 251 }, { files: undefined },
      { files: [{ filename: 'research/demand/report.md' }] },
      { files: Array.from({ length: 300 }, (_, i) => ({ filename: `research/demand/${i}.json`, status: 'modified' })) },
    ]) expect(isResearchOnlyAdvance({ ...comparison(), ...update }, release, main)).toBe(false);
  });

  test('accepts the exact release and pins comparisons to the observed main SHA', async () => {
    const getCommit = vi.fn().mockResolvedValue({ data: { sha: release } });
    const compareCommits = vi.fn().mockResolvedValue({ data: comparison() });
    const github = { rest: { repos: { getCommit, compareCommits } } };
    const repo = { owner: 'owner', repo: 'repo' };
    expect(await isProductionReleaseCurrent(github, repo, release)).toBe(true);
    expect(compareCommits).not.toHaveBeenCalled();
    getCommit.mockResolvedValue({ data: { sha: main } });
    expect(await isProductionReleaseCurrent(github, repo, release)).toBe(true);
    expect(compareCommits).toHaveBeenCalledWith({ ...repo, base: release, head: main });
    compareCommits.mockRejectedValue(new Error('API unavailable'));
    expect(await isProductionReleaseCurrent(github, repo, release)).toBe(false);
    getCommit.mockRejectedValue(new Error('API unavailable'));
    expect(await isProductionReleaseCurrent(github, repo, release)).toBe(false);
  });

  test('uses the guard at both workflow checkpoints while requiring the exact deployed revision', () => {
    const workflow = readFileSync('.github/workflows/notify-publish.yml', 'utf8');
    expect(workflow.match(/isProductionReleaseCurrent\(github, context\.repo, sha\)/g)).toHaveLength(2);
    expect(workflow.match(/\(await live\.json\(\)\)\.commit === sha/g)).toHaveLength(2);
    expect(workflow).toContain("if: steps.current.outputs.ready == 'true'");
  });
});
