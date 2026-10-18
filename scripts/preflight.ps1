$ErrorActionPreference = 'Stop'
Write-Host 'ASCENDE — STABLE STUDIO NET 61999 PREFLIGHT'
Write-Host 'Repo:' (Get-Location)
Write-Host 'Node:' (node --version)
Write-Host 'npm:' (npm --version)
Write-Host 'Python:' (python --version)
if (-not (Test-Path './node_modules/.bin/genlayer.cmd')) { throw 'Repository-pinned GenLayer CLI is missing. Run npm ci.' }
$cliVersion = (& npx --no-install genlayer --version).Trim()
if ($cliVersion -ne '0.39.1') { throw "Expected repository-pinned GenLayer CLI 0.39.1, got $cliVersion" }
Write-Host 'Repo-local CLI:' $cliVersion
& npx --no-install genlayer network set studionet
$network = (& npx --no-install genlayer network info | Out-String)
if ($network -notmatch '61999') { throw 'GenLayer CLI is not configured for stable Studionet 61999.' }
Write-Host $network
Write-Host 'Chain requirement: 61999 (0xF22F) RPC https://studio.genlayer.com/api'
Write-Host 'No deployment or wallet activity is performed by this preflight.'
