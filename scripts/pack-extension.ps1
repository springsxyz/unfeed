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
  "popup"
)

foreach ($item in $include) {
  $src = Join-Path $root $item
  $dst = Join-Path $stage $item
  if (-not (Test-Path $src)) {
    throw "Missing required path: $item"
  }
  Copy-Item -Path $src -Destination $dst -Recurse -Force
}

$stageShared = Join-Path $stage "shared"
New-Item -ItemType Directory -Force -Path $stageShared | Out-Null
foreach ($sharedFile in @("config.js", "site.js")) {
  Copy-Item -LiteralPath (Join-Path $root "shared/$sharedFile") -Destination (Join-Path $stageShared $sharedFile) -Force
}

# Only ship icons referenced by the manifest. Design explorations and source
# artwork make the store archive much larger and substantially slow packaging.
$stageIcons = Join-Path $stage "icons"
New-Item -ItemType Directory -Force -Path $stageIcons | Out-Null
foreach ($icon in @("icon16.png", "icon48.png", "icon128.png")) {
  Copy-Item -LiteralPath (Join-Path $root "icons/$icon") -Destination (Join-Path $stageIcons $icon) -Force
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath -Force
Remove-Item $stage -Recurse -Force

Write-Output "Created $zipPath"
Get-Item $zipPath | Format-List FullName, Length, LastWriteTime
