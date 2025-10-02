#!/usr/bin/env node
/*
 Cross-platform Git pull script.
 Modes:
  - default (safe): stash local changes, pull with rebase, re-apply stash
  - --mirror: hard reset to origin/<default-branch> and clean untracked files
*/

const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
}

function safeRun(cmd) {
  try {
    return run(cmd);
  } catch (e) {
    return '';
  }
}

function resolveGit() {
  // Try PATH first
  try {
    run('git --version');
    return 'git';
  } catch {}
  // Try common Windows locations
  const pf = process.env['ProgramFiles'];
  const pf86 = process.env['ProgramFiles(x86)'];
  const candidates = [];
  if (pf) candidates.push(`${pf}\\Git\\bin\\git.exe`);
  if (pf86) candidates.push(`${pf86}\\Git\\bin\\git.exe`);
  for (const p of candidates) {
    try {
      run(`"${p}" --version`);
      return `"${p}"`;
    } catch {}
  }
  console.error('Git not found. Please install Git and try again.');
  process.exit(1);
}

function getArgFlag(name) {
  return process.argv.includes(name);
}

function getDefaultRemoteBranch(git) {
  const sym = safeRun(`${git} symbolic-ref --quiet refs/remotes/origin/HEAD`);
  if (sym) {
    const parts = sym.split('/');
    return parts[parts.length - 1] || 'main';
  }
  // Fallback to origin/main if HEAD not set
  return 'main';
}

function ensureRepo(git) {
  const inside = safeRun(`${git} rev-parse --is-inside-work-tree`);
  if (inside !== 'true') {
    console.error('Not a Git repository. Run: git init');
    process.exit(1);
  }
}

function ensureOrigin(git) {
  const remotes = safeRun(`${git} remote -v`);
  if (!remotes.includes('origin')) {
    console.error('Remote "origin" is not set. Run: git remote add origin <git-url>');
    process.exit(1);
  }
}

async function main() {
  const git = resolveGit();
  ensureRepo(git);
  ensureOrigin(git);

  const mirror = getArgFlag('--mirror');
  const yes = getArgFlag('--yes');

  // Figure out default branch
  const defaultBranch = getDefaultRemoteBranch(git);

  // Fetch latest
  console.log('Fetching origin...');
  run(`${git} fetch origin --prune`);

  if (mirror) {
    if (!yes && process.stdout.isTTY) {
      console.log('Mirror mode will reset local state to match origin completely (including deletions).');
      console.log('Run with --yes to skip confirmation.');
      process.exit(1);
    }
    console.log(`Checking out ${defaultBranch}...`);
    safeRun(`${git} checkout -B ${defaultBranch}`);
    console.log(`Hard resetting to origin/${defaultBranch}...`);
    run(`${git} reset --hard origin/${defaultBranch}`);
    console.log('Cleaning untracked files...');
    run(`${git} clean -fdx`);
    console.log('Local repository now mirrors remote.');
    return;
  }

  // Safe mode: stash local changes, pull --rebase, then pop stash
  const status = safeRun(`${git} status --porcelain`);
  let stashed = false;
  if (status) {
    console.log('Stashing local changes...');
    run(`${git} stash push -u -m "auto-stash before pull"`);
    stashed = true;
  }

  // Ensure we are on the default branch to mirror remote updates
  const cur = safeRun(`${git} branch --show-current`);
  if (cur !== defaultBranch) {
    console.log(`Switching to ${defaultBranch}...`);
    safeRun(`${git} checkout -B ${defaultBranch}`);
  }

  console.log('Pulling with rebase...');
  try {
    run(`${git} pull --rebase origin ${defaultBranch}`);
  } catch (e) {
    console.log('Rebase failed, attempting merge fast-forward...');
    safeRun(`${git} rebase --abort`);
    run(`${git} pull --ff-only origin ${defaultBranch}`);
  }

  if (stashed) {
    console.log('Re-applying stashed changes...');
    try {
      run(`${git} stash pop`);
    } catch (e) {
      console.warn('Conflicts occurred when applying stash. Resolve conflicts and commit.');
    }
  }

  console.log('Up to date.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});


