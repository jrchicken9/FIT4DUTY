Local Backup Usage
===================

Create a timestamped backup zip of the project (excluding node_modules, .git, builds), plus an optional copy of .env:

1) Run:

   npm run backup

2) Output:

   - backups/app_backup_YYYYMMDD_HHMMSS.zip
   - backups/.env_YYYYMMDD_HHMMSS.backup (if .env exists)

Restore Instructions
--------------------

1) Close any running dev servers.
2) Extract the desired zip into a new folder.
3) Copy back the saved .env if needed (rename to .env and place in project root).
4) Install dependencies:

   npm install --legacy-peer-deps

5) Start:

   npx expo start --clear --tunnel


