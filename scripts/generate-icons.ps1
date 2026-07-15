# Generate UnFeed toolbar/store icons — crossed feed (card stack + slash)
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

  # Stacked feed cards: avatar circle + text lines per row
  $inkBrush = New-Object System.Drawing.SolidBrush $ink
  $pad = $size * 0.2
  $rowH = ($size - 2 * $pad) / 3.15
  $gap = $rowH * 0.18

  for ($i = 0; $i -lt 3; $i++) {
    $y = $pad + $i * ($rowH + $gap)
    $avatar = [Math]::Max(2, $rowH * 0.55)
    $cx = $pad + $avatar * 0.5
    $cy = $y + $rowH * 0.45
    $g.FillEllipse($inkBrush, [float]($cx - $avatar / 2), [float]($cy - $avatar / 2), [float]$avatar, [float]$avatar)

    $lineH = [Math]::Max(1.5, $size * 0.055)
    $lineX = $pad + $avatar + $size * 0.06
    $lineW = $size - $lineX - $pad
    $g.FillRectangle($inkBrush, [float]$lineX, [float]($y + $rowH * 0.18), [float]$lineW, [float]$lineH)
    $g.FillRectangle($inkBrush, [float]$lineX, [float]($y + $rowH * 0.52), [float]($lineW * 0.62), [float]$lineH)
  }

  # Diagonal slash through the feed
  $penW = [Math]::Max(1.8, $size * 0.11)
  $pen = New-Object System.Drawing.Pen $ink, ([float]$penW)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  # White understroke so slash reads on top of dark bars
  $under = New-Object System.Drawing.Pen $lime, ([float]($penW * 1.55))
  $under.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $under.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $x1 = [float]($size * 0.16)
  $y1 = [float]($size * 0.82)
  $x2 = [float]($size * 0.84)
  $y2 = [float]($size * 0.18)
  $g.DrawLine($under, $x1, $y1, $x2, $y2)
  $g.DrawLine($pen, $x1, $y1, $x2, $y2)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $bg.Dispose()
  $inkBrush.Dispose()
  $pen.Dispose()
  $under.Dispose()
  $pathRounded.Dispose()
}

New-Icon 16 (Join-Path $base "icon16.png")
New-Icon 48 (Join-Path $base "icon48.png")
New-Icon 128 (Join-Path $base "icon128.png")
Write-Output "Created crossed-feed icons in $base"
Get-ChildItem $base | ForEach-Object { "$($_.Name) $($_.Length)" }
