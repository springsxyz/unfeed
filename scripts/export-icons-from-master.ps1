# Resize AI master icon → icons/icon{16,48,128}.png
# Usage: powershell -File scripts\export-icons-from-master.ps1 [-Master path]
param(
  [string]$Master = ""
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root "icons"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (-not $Master) {
  $candidates = @(
    (Join-Path $root "assets\unfeed-icon-master.png"),
    (Join-Path $root "icons\unfeed-icon-master.png"),
    (Join-Path $env:USERPROFILE ".cursor\projects\c-Users-raipa-Desktop-COM-Equities-Ventures-Springs-XYZ-unfeed\assets\unfeed-icon-master.png")
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { $Master = $c; break }
  }
}

if (-not $Master -or -not (Test-Path $Master)) {
  throw "Master icon not found. Pass -Master path\to\unfeed-icon-master.png"
}

$repoMaster = Join-Path $outDir "unfeed-icon-master.png"
Copy-Item -Path $Master -Destination $repoMaster -Force

$src = [System.Drawing.Image]::FromFile((Resolve-Path $repoMaster).Path)

function Export-Size([int]$size, [string]$dest) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CompositingQuality = "HighQuality"
  $g.InterpolationMode = "HighQualityBicubic"
  $g.SmoothingMode = "HighQuality"
  $g.PixelOffsetMode = "HighQuality"
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, 0, 0, $size, $size)
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Export-Size 16 (Join-Path $outDir "icon16.png")
Export-Size 48 (Join-Path $outDir "icon48.png")
Export-Size 128 (Join-Path $outDir "icon128.png")
$src.Dispose()

Write-Output "Exported from $repoMaster"
Get-ChildItem $outDir -Filter "icon*.png" | ForEach-Object { "$($_.Name) $($_.Length)" }
