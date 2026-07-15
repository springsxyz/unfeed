# Pack UnFeed for Chrome Web Store upload
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$zipName = "unfeed-$version.zip"
$zipPath = Join-Path $dist $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$stage = Join-Path $dist "stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

$include = @(
  "manifest.json",
  "background.js",
  "privacy.html",
  "content",
  "styles",
  "popup",
  "shared",
  "icons"
)

foreach ($item in $include) {
  $src = Join-Path $root $item
  $dst = Join-Path $stage $item
  if (-not (Test-Path $src)) {
    throw "Missing required path: $item"
  }
  Copy-Item -Path $src -Destination $dst -Recurse -Force
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath -Force
Remove-Item $stage -Recurse -Force

Write-Output "Created $zipPath"
Get-Item $zipPath | Format-List FullName, Length, LastWriteTime
