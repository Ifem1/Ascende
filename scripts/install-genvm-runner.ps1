$ErrorActionPreference = "Stop"

$version = "v0.2.16"
$expectedSha256 = "4F0B358EC98EC148BE9B95CDFB0F0E1A6CBE64DA0194FDFAC3FFFC6F5D1D93E2"
$cacheDirectory = Join-Path $env:USERPROFILE ".cache\gltest-direct"
$archivePath = Join-Path $cacheDirectory "genvm-universal-$version.tar.xz"
$downloadUrl = "https://github.com/genlayerlabs/genvm/releases/download/$version/genvm-universal.tar.xz"

New-Item -ItemType Directory -Force -Path $cacheDirectory | Out-Null
if (-not (Test-Path -LiteralPath $archivePath)) {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath
}

$actualSha256 = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
if ($actualSha256 -ne $expectedSha256) {
    throw "GenVM $version checksum mismatch: expected $expectedSha256, received $actualSha256"
}
Write-Host "GenVM $version artifact verified ($actualSha256)."
