Add-Type -AssemblyName System.Drawing

$base = Join-Path (Split-Path $PSScriptRoot -Parent) "icons"
New-Item -ItemType Directory -Force -Path $base | Out-Null

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.Clear([System.Drawing.Color]::FromArgb(255, 15, 17, 20))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 232, 228, 220))
  $m = [Math]::Max(1, [int]($size / 16))
  $g.FillEllipse($brush, $m, $m, $size - 2 * $m, $size - 2 * $m)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 15, 17, 20), [Math]::Max(2, [int]($size / 10)))
  $pad = $size * 0.28
  $g.DrawArc($pen, [float]$pad, [float]($pad * 0.9), [float]($size - 2 * $pad), [float]($size * 0.55), 0, 180)
  $g.DrawLine($pen, [float]$pad, [float]($pad * 0.95), [float]$pad, [float]($size * 0.42))
  $g.DrawLine($pen, [float]($size - $pad), [float]($pad * 0.95), [float]($size - $pad), [float]($size * 0.42))
  $pen2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 61, 154, 106), [Math]::Max(2, [int]($size / 12)))
  $y = $size * 0.72
  $g.DrawLine($pen2, [float]($pad * 0.85), [float]$y, [float]($size - $pad * 0.85), [float]$y)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

New-Icon 16 (Join-Path $base "icon16.png")
New-Icon 48 (Join-Path $base "icon48.png")
New-Icon 128 (Join-Path $base "icon128.png")
Write-Output "Created icons in $base"
Get-ChildItem $base | ForEach-Object { "$($_.Name) $($_.Length)" }
