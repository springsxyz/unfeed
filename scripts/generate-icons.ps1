# Generate UnFeed icon — lime tile + refined black face
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
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $gp.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $gp.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $gp.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $gp.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  $g.FillPath($bg, $gp)

  $inkBrush = New-Object System.Drawing.SolidBrush $ink
  $penW = [Math]::Max(1.6, $size * 0.1)
  $pen = New-Object System.Drawing.Pen $ink, ([float]$penW)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  # Eyes
  $eyeR = [Math]::Max(1.2, $size * 0.07)
  $eyeY = $size * 0.38
  $eyeSpread = $size * 0.16
  $g.FillEllipse(
    $inkBrush,
    [float]($size * 0.5 - $eyeSpread - $eyeR),
    [float]($eyeY - $eyeR),
    [float](2 * $eyeR),
    [float](2 * $eyeR)
  )
  $g.FillEllipse(
    $inkBrush,
    [float]($size * 0.5 + $eyeSpread - $eyeR),
    [float]($eyeY - $eyeR),
    [float](2 * $eyeR),
    [float](2 * $eyeR)
  )

  # Smile arc
  $smilePad = $size * 0.26
  $smileTop = $size * 0.42
  $smileH = $size * 0.38
  $g.DrawArc(
    $pen,
    [float]$smilePad,
    [float]$smileTop,
    [float]($size - 2 * $smilePad),
    [float]$smileH,
    15,
    150
  )

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $bg.Dispose()
  $inkBrush.Dispose()
  $pen.Dispose()
  $gp.Dispose()
}

New-Icon 16 (Join-Path $base "icon16.png")
New-Icon 48 (Join-Path $base "icon48.png")
New-Icon 128 (Join-Path $base "icon128.png")
Write-Output "Created face icons in $base"
Get-ChildItem $base | ForEach-Object { "$($_.Name) $($_.Length)" }
