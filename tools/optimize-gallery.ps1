# Rebuild web copies without changing the original wedding photos.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$variants = @(@{Name='thumb';Size=240;Quality=82}, @{Name='slide';Size=1440;Quality=87}, @{Name='large';Size=2160;Quality=90})
foreach ($variant in $variants) { New-Item -ItemType Directory -Force (Join-Path $root "gallery/web/$($variant.Name)") | Out-Null }
foreach ($number in 1..30) {
    $original = [Drawing.Image]::FromFile((Join-Path $root "gallery/$number.jpg"), $true)
    try {
        if ($original.PropertyIdList -contains 274) {
            $orientation = $original.GetPropertyItem(274).Value[0]
            $rotations = @{2='RotateNoneFlipX';3='Rotate180FlipNone';4='Rotate180FlipX';5='Rotate90FlipX';6='Rotate90FlipNone';7='Rotate270FlipX';8='Rotate270FlipNone'}
            if ($rotations.ContainsKey([int]$orientation)) { $original.RotateFlip([Drawing.RotateFlipType]::$($rotations[[int]$orientation])) }
        }
        foreach ($variant in $variants) {
            $ratio = [Math]::Min(1.0, $variant.Size / [Math]::Max($original.Width, $original.Height))
            $bitmap = New-Object Drawing.Bitmap ([int][Math]::Round($original.Width*$ratio)), ([int][Math]::Round($original.Height*$ratio))
            $graphics = [Drawing.Graphics]::FromImage($bitmap)
            $parameters = New-Object Drawing.Imaging.EncoderParameters 1
            try {
                $graphics.Clear([Drawing.Color]::White)
                $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($original, 0, 0, $bitmap.Width, $bitmap.Height)
                $parameters.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), ([long]$variant.Quality)
                $bitmap.Save((Join-Path $root "gallery/web/$($variant.Name)/$number.jpg"), $encoder, $parameters)
            } finally { $parameters.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
        }
    } finally { $original.Dispose() }
}
Get-ChildItem (Join-Path $root 'gallery/web') -Directory | ForEach-Object { [pscustomobject]@{Variant=$_.Name;Files=(Get-ChildItem $_.FullName).Count;MB=[Math]::Round(((Get-ChildItem $_.FullName | Measure-Object Length -Sum).Sum / 1MB),2)} }
