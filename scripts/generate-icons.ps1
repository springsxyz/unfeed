# UnFeed icon — polished gradient squircle + face (Awesome Screenshot–style clarity)
Add-Type -AssemblyName System.Drawing

$base = Join-Path (Split-Path $PSScriptRoot -Parent) "icons"
New-Item -ItemType Directory -Force -Path $base | Out-Null

function New-RoundedRectPath([System.Drawing.RectangleF]$r, [float]$radius) {
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $gp.AddArc($r.X, $r.Y, $d, $d, 180, 90)
  $gp.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
  $gp.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
  $gp.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  return $gp
}

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.PixelOffsetMode = "HighQuality"
  $g.CompositingQuality = "HighQuality"
  $g.Clear([System.Drawing.Color]::Transparent)

  $radius = [Math]::Max(2.0, $size * 0.22)
  $bounds = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $tile = New-RoundedRectPath $bounds $radius

  # Diagonal brand gradient: deep slate → mist → lime (not rainbow clone)
  $c1 = [System.Drawing.Color]::FromArgb(255, 28, 42, 54)
  $c2 = [System.Drawing.Color]::FromArgb(255, 90, 140, 130)
  $c3 = [System.Drawing.Color]::FromArgb(255, 200, 224, 70)
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend
  $blend.Colors = [System.Drawing.Color[]]@($c1, $c2, $c3)
  $blend.Positions = [float[]]@(0.0, 0.45, 1.0)
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, $size),
    (New-Object System.Drawing.Point $size, 0),
    $c1,
    $c3
  )
  $grad.InterpolationColors = $blend
  $g.FillPath($grad, $tile)

  # Soft highlight at top-left (lens polish)
  $hi = New-Object System.Drawing.Drawing2D.GraphicsPath
  $hi.AddEllipse(-$size * 0.15, -$size * 0.2, $size * 0.85, $size * 0.7)
  $hiBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush $hi
  $hiBrush.CenterColor = [System.Drawing.Color]::FromArgb(70, 255, 255, 255)
  $hiBrush.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
  $g.SetClip($tile)
  $g.FillPath($hiBrush, $hi)
  $g.ResetClip()

  # White ring (like camera bezel) + dark lens
  $cx = $size * 0.5
  $cy = $size * 0.5
  $outerR = $size * 0.34
  $ringW = [Math]::Max(1.8, $size * 0.055)
  $innerR = $outerR - $ringW

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
  $lens = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 18, 22, 28))
  $g.FillEllipse($white, [float]($cx - $outerR), [float]($cy - $outerR), [float](2 * $outerR), [float](2 * $outerR))
  $g.FillEllipse($lens, [float]($cx - $innerR), [float]($cy - $innerR), [float](2 * $innerR), [float](2 * $innerR))

  # Tiny blue glint (Awesome Screenshot–style) — upper-left of lens, not a nose
  $glintR = [Math]::Max(1.0, $size * 0.04)
  $glint = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 160, 200, 230))
  $g.FillEllipse(
    $glint,
    [float]($cx - $innerR * 0.45 - $glintR),
    [float]($cy - $innerR * 0.4 - $glintR),
    [float](2 * $glintR),
    [float](2 * $glintR)
  )

  # Face on the lens — lime for brand, not white camera
  $face = [System.Drawing.Color]::FromArgb(255, 200, 224, 70)
  $faceBrush = New-Object System.Drawing.SolidBrush $face
  $facePen = New-Object System.Drawing.Pen $face, ([float]([Math]::Max(1.4, $size * 0.045)))
  $facePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $facePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $eyeR = [Math]::Max(1.1, $innerR * 0.11)
  $eyeY = $cy - $innerR * 0.18
  $eyeSpread = $innerR * 0.32
  $g.FillEllipse($faceBrush, [float]($cx - $eyeSpread - $eyeR), [float]($eyeY - $eyeR), [float](2 * $eyeR), [float](2 * $eyeR))
  $g.FillEllipse($faceBrush, [float]($cx + $eyeSpread - $eyeR), [float]($eyeY - $eyeR), [float](2 * $eyeR), [float](2 * $eyeR))

  $smilePad = $innerR * 0.42
  $smileTop = $cy - $innerR * 0.05
  $smileH = $innerR * 0.95
  $g.DrawArc(
    $facePen,
    [float]($cx - $smilePad),
    [float]$smileTop,
    [float](2 * $smilePad),
    [float]$smileH,
    20,
    140
  )

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $grad.Dispose()
  $tile.Dispose()
  $hi.Dispose()
  $hiBrush.Dispose()
  $white.Dispose()
  $lens.Dispose()
  $glint.Dispose()
  $faceBrush.Dispose()
  $facePen.Dispose()
}

New-Icon 16 (Join-Path $base "icon16.png")
New-Icon 48 (Join-Path $base "icon48.png")
New-Icon 128 (Join-Path $base "icon128.png")
Write-Output "Created polished face icons in $base"
Get-ChildItem $base | ForEach-Object { "$($_.Name) $($_.Length)" }
