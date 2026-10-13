#!/usr/bin/env bash
set -euo pipefail
printf 'ASCENDE — STABLE STUDIONET 61999 PREFLIGHT\n'
node --version
npm --version
python --version
if [ -x ./node_modules/.bin/genlayer ]; then ./node_modules/.bin/genlayer --version; else echo 'No repo-local CLI. Verify stable candidate 0.39.1 before install; never use global RC.'; fi
printf 'Target 61999 / 0xF22F / https://studio.genlayer.com/api\nNo deployment or wallet action performed.\n'
