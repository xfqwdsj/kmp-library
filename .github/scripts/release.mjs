import { setTimeout as delay } from 'node:timers/promises';

export function checkVersion(tag, properties) {
  const version = /^version\s*=\s*(\S+)\s*$/m.exec(properties)?.[1];
  if (!version || tag.replace(/^v/, '') !== version) {
    throw new Error('The release tag must match the version in gradle.properties.');
  }
  return version;
}

/** Requires the latest push CI for this commit; pending runs are observed without dispatching tests. */
export async function requirePassingTests(github, repo, sha, {
  timeoutMs = 20 * 60 * 1000, pollMs = 20000, now = Date.now, wait = delay,
} = {}) {
  const deadline = now() + timeoutMs;
  for (;;) {
    const { data } = await github.rest.actions.listWorkflowRuns({
      ...repo, workflow_id: 'test.yml', head_sha: sha, event: 'push', per_page: 100,
    });
    const run = data.workflow_runs.filter(run => run.head_sha === sha && run.event === 'push')
      .sort((a, b) => b.id - a.id)[0];
    if (!run) throw new Error('No push Test CI exists for the release commit; let normal CI run before publishing.');
    if (run.status === 'completed') {
      if (run.conclusion !== 'success') throw new Error(`Test CI has not passed: ${run.conclusion}.`);
      return run;
    }
    const remaining = deadline - now();
    if (remaining <= 0) throw new Error('Timed out waiting for the release commit to pass Test CI.');
    await wait(Math.min(pollMs, remaining));
  }
}

/** Creates generated notes once; resuming a draft preserves the owner's edits. */
export async function prepareDraft(github, repo, tag, previousTag, target, properties) {
  const version = checkVersion(tag, properties);
  const releases = await github.paginate(github.rest.repos.listReleases, { ...repo, per_page: 100 });
  if (releases.some(release => release.tag_name.replace(/^v/, '') === version && release.tag_name !== tag)) {
    throw new Error('This artifact version already has a release under another tag.');
  }
  const existing = releases.find(release => release.tag_name === tag);
  if (existing) {
    if (!existing.draft) throw new Error('Only a draft can be resumed.');
    return existing;
  }
  const { data: notes } = await github.rest.repos.generateReleaseNotes({
    ...repo, tag_name: tag, target_commitish: target,
    ...(previousTag ? { previous_tag_name: previousTag } : {}),
  });
  const { data } = await github.rest.repos.createRelease({
    ...repo, tag_name: tag, target_commitish: target, name: notes.name,
    draft: true, prerelease: version.includes('-'), body: notes.body,
  });
  return data;
}
