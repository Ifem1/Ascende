#!/usr/bin/env bash
set -euo pipefail
printf 'ASCENDE — STABLE STUDIONET 61999 PREFLIGHT\n'
node --version
npm --version
python --version
npx --no-install genlayer --version | grep -qx '0.39.1'
npx --no-install genlayer network set studionet
npx --no-install genlayer network info
printf 'Target 61999 / 0xF22F / https://studio.genlayer.com/api\nNo deployment or wallet action performed.\n'
