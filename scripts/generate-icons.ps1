# Generate UnFeed Signal Cut toolbar/store icons
Add-Type -AssemblyName System.Drawing

$base = Join-Path (Split-Path $PSScriptRoot -Parent) "icons"
New-Item -ItemType Directory -Force -Path $base | Out-Null

$lime = [System.Drawing.Color]::FromArgb(255, 200, 224, 70)
$ink = [System.Drawing.Color]::FromArgb(255, 10, 10, 10)

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.PixelOffsetMode = "HighQuality"
  $g.Clear([System.Drawing.Color]::Transparent)

  $bg = New-Object System.Drawing.SolidBrush $lime
  $radius = [Math]::Max(2, [int]($size * 0.22))
  $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $pathRounded = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $pathRounded.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $pathRounded.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $pathRounded.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $pathRounded.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $pathRounded.CloseFigure()
  $g.FillPath($bg, $pathRounded)

  # Four signal bars (ascending), then a slash cut
  $inkBrush = New-Object System.Drawing.SolidBrush $ink
  $padX = $size * 0.22
  $padBottom = $size * 0.22
  $barGap = $size * 0.06
  $barW = ($size - 2 * $padX - 3 * $barGap) / 4
  $maxH = $size * 0.52
  $heights = @(0.35, 0.55, 0.75, 1.0)

  for ($i = 0; $i -lt 4; $i++) {
    $h = $maxH * $heights[$i]
    $x = $padX + $i * ($barW + $barGap)
    $y = $size - $padBottom - $h
    $g.FillRectangle($inkBrush, [float]$x, [float]$y, [float]$barW, [float]$h)
  }

  $penW = [Math]::Max(1.5, $size * 0.1)
  $pen = New-Object System.Drawing.Pen $ink, ([float]$penW)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine(
    $pen,
    [float]($size * 0.18),
    [float]($size * 0.78),
    [float]($size * 0.82),
    [float]($size * 0.22)
  )

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $bg.Dispose()
  $inkBrush.Dispose()
  $pen.Dispose()
  $pathRounded.Dispose()
}

New-Icon 16 (Join-Path $base "icon16.png")
New-Icon 48 (Join-Path $base "icon48.png")
New-Icon 128 (Join-Path $base "icon128.png")
Write-Output "Created Signal Cut icons in $base"
Get-ChildItem $base | ForEach-Object { "$($_.Name) $($_.Length)" }
