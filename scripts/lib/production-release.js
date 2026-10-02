// Plain JavaScript: the publication guard runs before setup-node/npm ci.
// GitHub's unpaginated comparison returns at most 250 commits and 300 files.
// Reject incomplete or potentially truncated data instead of assuming omitted changes
// are harmless. Only the demand-report directory is independent of the site.
const isSha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const isDemandPath = value => typeof value === 'string' && value.startsWith('research/demand/')
  && !value.split('/').some(part => part === '.' || part === '..' || !part);

export function isResearchOnlyAdvance(comparison, releaseSha, mainSha) {
  if (!comparison || !isSha(releaseSha) || !isSha(mainSha)
    || comparison.status !== 'ahead' || comparison.behind_by !== 0
    || comparison.base_commit?.sha !== releaseSha || comparison.merge_base_commit?.sha !== releaseSha
    || !Number.isSafeInteger(comparison.total_commits) || comparison.total_commits < 1 || comparison.total_commits > 250
    || comparison.ahead_by !== comparison.total_commits
    || !Array.isArray(comparison.commits) || comparison.commits.length !== comparison.total_commits
    || !comparison.commits.some(commit => commit?.sha === mainSha)
    || !Array.isArray(comparison.files) || comparison.files.length >= 300) return false;
  return comparison.files.every(file => file && isDemandPath(file.filename)
    && ['added', 'removed', 'modified', 'renamed', 'copied', 'changed', 'unchanged'].includes(file.status)
    && (file.status !== 'renamed' || isDemandPath(file.previous_filename))
    && (file.previous_filename === undefined || isDemandPath(file.previous_filename)));
}

export async function isProductionReleaseCurrent(github, repo, releaseSha) {
  if (!isSha(releaseSha)) return false;
  try {
    const main = await github.rest.repos.getCommit({ ...repo, ref: 'main' });
    const mainSha = main.data.sha;
    if (!isSha(mainSha)) return false;
    if (mainSha === releaseSha) return true;
    // Pin both endpoints, so a branch update during the comparison cannot
    // silently change the revision whose ancestry and changed files we checked.
    const comparison = await github.rest.repos.compareCommits({ ...repo, base: releaseSha, head: mainSha });
    return isResearchOnlyAdvance(comparison.data, releaseSha, mainSha);
  } catch {
    return false;
  }
}
