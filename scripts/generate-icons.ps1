# UnFeed extension icon � paper field + lime stacked wordmark
# Regenerate: powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function Test-FamilyStyle([string]$familyName, [System.Drawing.FontStyle]$style) {
  try {
    $ff = New-Object System.Drawing.FontFamily $familyName
    if ($ff.IsStyleAvailable($style)) { return $true }
  } catch {}
  return $false
}

function Resolve-WordmarkFont {
  $candidates = @(
    @{ Family = "Space Grotesk"; Style = [System.Drawing.FontStyle]::Bold; Label = "Space Grotesk Bold" },
    @{ Family = "Space Grotesk"; Style = [System.Drawing.FontStyle]::Regular; Label = "Space Grotesk Regular" },
    @{ Family = "Segoe UI Black"; Style = [System.Drawing.FontStyle]::Regular; Label = "Segoe UI Black" },
    @{ Family = "Arial Black"; Style = [System.Drawing.FontStyle]::Regular; Label = "Arial Black" },
    @{ Family = "Arial"; Style = [System.Drawing.FontStyle]::Bold; Label = "Arial Bold" }
  )
  foreach ($c in $candidates) {
    if (Test-FamilyStyle $c.Family $c.Style) {
      return [PSCustomObject]@{ Used = $c.Label; Family = $c.Family; Style = $c.Style }
    }
  }
  return [PSCustomObject]@{ Used = "Arial Bold"; Family = "Arial"; Style = [System.Drawing.FontStyle]::Bold }
}

function Get-TypoFormat {
  $sf = [System.Drawing.StringFormat]::GenericTypographic.Clone()
  $sf.FormatFlags = $sf.FormatFlags -bor [System.Drawing.StringFormatFlags]::MeasureTrailingSpaces
  $sf.Alignment = [System.Drawing.StringAlignment]::Near
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
  return $sf
}

function Measure-Text(
  [System.Drawing.Graphics]$g,
  [string]$text,
  [System.Drawing.Font]$font,
  [System.Drawing.StringFormat]$sf
) {
  return $g.MeasureString($text, $font, [System.Drawing.PointF]::Empty, $sf)
}

function Draw-TightString(
  [System.Drawing.Graphics]$g,
  [string]$text,
  [System.Drawing.Font]$font,
  [System.Drawing.Brush]$brush,
  [float]$left,
  [float]$top,
  [float]$trackPx,
  [System.Drawing.StringFormat]$sf
) {
  $x = $left
  foreach ($ch in $text.ToCharArray()) {
    $s = [string]$ch
    $g.DrawString($s, $font, $brush, $x, $top, $sf)
    $w = (Measure-Text $g $s $font $sf).Width
    $x += $w + $trackPx
  }
}

function Get-FontLineHeight([System.Drawing.Font]$font) {
  $ff = $font.FontFamily
  $style = $font.Style
  $em = $ff.GetEmHeight($style)
  $ascent = $ff.GetCellAscent($style)
  return [float]($font.Size * ($ascent / $em))
}

function Get-TrackedSize(
  [System.Drawing.Graphics]$g,
  [string]$text,
  [System.Drawing.Font]$font,
  [float]$trackPx,
  [System.Drawing.StringFormat]$sf
) {
  $chars = $text.ToCharArray()
  $w = 0.0
  $h = 0.0
  for ($i = 0; $i -lt $chars.Length; $i++) {
    $sz = Measure-Text $g ([string]$chars[$i]) $font $sf
    $w += $sz.Width
    if ($sz.Height -gt $h) { $h = $sz.Height }
    if ($i -lt $chars.Length - 1) { $w += $trackPx }
  }
  return [PSCustomObject]@{ Width = $w; Height = $h }
}

function New-UnFeedIcon {
  param(
    [int]$Size,
    [string]$OutPath,
    [System.Drawing.Color]$Paper,
    [System.Drawing.Color]$Lime,
    [string]$Family,
    [System.Drawing.FontStyle]$Style
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear($Paper)

  $sf = Get-TypoFormat
  $line1 = "UN"
  $line2 = "FEED"
  # Same optical size � FEED is not a caption under UN
  $feedRatio = 1.0
  $marginPct = 0.14
  $content = [double]($Size * (1.0 - 2.0 * $marginPct))
  # Tight tracking + tight stack
  $trackFactor = -0.10
  $lineGapFactor = 0.02

  $bestUn = 10.0
  $low = 8.0
  $high = [double]($Size * 0.48)

  while (($high - $low) -gt 0.2) {
    $mid = ($low + $high) / 2.0
    $fontUn = New-Object System.Drawing.Font $Family, $mid, $Style, ([System.Drawing.GraphicsUnit]::Pixel)
    $fontFeed = New-Object System.Drawing.Font $Family, ($mid * $feedRatio), $Style, ([System.Drawing.GraphicsUnit]::Pixel)
    $trackUn = [float]($mid * $trackFactor)
    $trackFeed = [float](($mid * $feedRatio) * $trackFactor)

    $s1 = Get-TrackedSize $g $line1 $fontUn $trackUn $sf
    $s2 = Get-TrackedSize $g $line2 $fontFeed $trackFeed $sf
    $gap = [Math]::Max(1.0, $mid * $lineGapFactor)
    $blockW = [Math]::Max($s1.Width, $s2.Width)
        $lineHUn = Get-FontLineHeight $fontUn
    $lineHFeed = Get-FontLineHeight $fontFeed
    $blockH = $lineHUn + $gap + $lineHFeed

    $fontUn.Dispose()
    $fontFeed.Dispose()

    if ($blockW -le $content -and $blockH -le $content) {
      $bestUn = $mid
      $low = $mid
    } else {
      $high = $mid
    }
  }

  $fontUnFinal = New-Object System.Drawing.Font $Family, $bestUn, $Style, ([System.Drawing.GraphicsUnit]::Pixel)
  $fontFeedFinal = New-Object System.Drawing.Font $Family, ($bestUn * $feedRatio), $Style, ([System.Drawing.GraphicsUnit]::Pixel)
  $trackUnF = [float]($bestUn * $trackFactor)
  $trackFeedF = [float](($bestUn * $feedRatio) * $trackFactor)

  $s1f = Get-TrackedSize $g $line1 $fontUnFinal $trackUnF $sf
  $s2f = Get-TrackedSize $g $line2 $fontFeedFinal $trackFeedF $sf
  $gapF = [Math]::Max(1.0, $bestUn * $lineGapFactor)
    $lineHUnF = Get-FontLineHeight $fontUnFinal
  $lineHFeedF = Get-FontLineHeight $fontFeedFinal
  $blockHf = $lineHUnF + $gapF + $lineHFeedF

  $brush = New-Object System.Drawing.SolidBrush $Lime
  $topY = [float](($Size - $blockHf) / 2.0)
  $x1 = [float](($Size - $s1f.Width) / 2.0)
  $x2 = [float](($Size - $s2f.Width) / 2.0)
  $y2 = [float]($topY + $lineHUnF + $gapF)

  Draw-TightString $g $line1 $fontUnFinal $brush $x1 $topY $trackUnF $sf
  Draw-TightString $g $line2 $fontFeedFinal $brush $x2 $y2 $trackFeedF $sf

  $dir = Split-Path -Parent $OutPath
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $sf.Dispose()
  $brush.Dispose()
  $fontUnFinal.Dispose()
  $fontFeedFinal.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

$root = Split-Path $PSScriptRoot -Parent
$iconsDir = Join-Path $root "icons"
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

$paper = [System.Drawing.Color]::FromArgb(255, 0xF4, 0xF2, 0xEC)
$lime = [System.Drawing.Color]::FromArgb(255, 0xC8, 0xE0, 0x46)
$res = Resolve-WordmarkFont

$outputs = @(
  @{ Size = 1024; Name = "unfeed-icon-master.png" },
  @{ Size = 16; Name = "icon16.png" },
  @{ Size = 48; Name = "icon48.png" },
  @{ Size = 128; Name = "icon128.png" }
)

foreach ($o in $outputs) {
  New-UnFeedIcon -Size $o.Size -OutPath (Join-Path $iconsDir $o.Name) -Paper $paper -Lime $lime -Family $res.Family -Style $res.Style
}

Write-Output "FONT_USED: $($res.Used)"
Write-Output "COLORS: paper #f4f2ec lime #c8e046"
Write-Output "TYPE: UN=FEED size, tight track, tight stack"
Get-ChildItem $iconsDir -Filter "*.png" | ForEach-Object { "$($_.Name) $($_.Length)" }
