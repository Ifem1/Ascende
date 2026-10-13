$ErrorActionPreference = 'Stop'
Write-Host 'ASCENDE — STABLE STUDIO NET 61999 PREFLIGHT'
Write-Host 'Repo:' (Get-Location)
Write-Host 'Node:' (node --version)
Write-Host 'npm:' (npm --version)
Write-Host 'Python:' (python --version)
if (Test-Path './node_modules/.bin/genlayer') { Write-Host 'Repo-local CLI:'; & ./node_modules/.bin/genlayer --version }
else { Write-Host 'Repo-local CLI missing: install verified stable 0.39.1 if compatible, do NOT use global RC.' }
Write-Host 'Chain requirement: 61999 (0xF22F) RPC https://studio.genlayer.com/api'
Write-Host 'No deployment or wallet activity is performed by this preflight.'
