#!/usr/bin/env node
/*
 Cross-platform Git push script.
 - Stages all changes
 - Uses commit message from CLI arg or prompts
 - Creates main branch if missing
 - Pushes to origin main
*/

const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

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

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  // Verify git exists
  try {
    run('git --version');
  } catch (e) {
    console.error('Git is not installed or not in PATH. Please install Git and try again.');
    process.exit(1);
  }

  // Check if inside a git repo
  const inside = safeRun('git rev-parse --is-inside-work-tree');
  if (inside !== 'true') {
    console.error('This directory is not a Git repository. Run: git init');
    process.exit(1);
  }

  // Ensure main branch exists
  const currentBranch = safeRun('git branch --show-current');
  if (!currentBranch) {
    // Detached or no commits; ensure initial commit path
    const hasCommits = safeRun('git rev-parse --verify HEAD');
    if (!hasCommits) {
      console.log('Creating initial commit on main...');
      safeRun('git checkout -b main');
    }
  }

  // Stage changes
  run('git add .');

  // If no changes, exit
  const status = run('git status --porcelain');
  if (!status) {
    console.log('No changes to commit.');
    return;
  }

  // Commit message
  let commitMessage = process.argv.slice(2).join(' ').trim();
  if (!commitMessage) {
    commitMessage = await prompt('Enter commit message: ');
  }
  if (!commitMessage) {
    console.error('Commit message is required.');
    process.exit(1);
  }

  // Commit
  run(`git commit -m ${JSON.stringify(commitMessage)}`);

  // Ensure origin exists
  const remotes = safeRun('git remote -v');
  if (!remotes.includes('origin')) {
    console.error('Remote "origin" is not set. Run: git remote add origin <git-url>');
    process.exit(1);
  }

  // Ensure branch is main
  const branch = safeRun('git branch --show-current') || 'main';
  if (branch !== 'main') {
    console.log(`Switching to main branch from ${branch}...`);
    safeRun('git checkout main');
  }

  // Push
  try {
    console.log('Pushing to origin main...');
    run('git push -u origin main');
  } catch (e) {
    // Fallback: try to set upstream
    console.log('Push failed. Attempting to create main and set upstream...');
    safeRun('git checkout -B main');
    run('git push -u origin main');
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});


