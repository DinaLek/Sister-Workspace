param(
  [Parameter(Mandatory = $true)][string[]]$Inputs,
  [Parameter(Mandatory = $true)][string]$OutputDirectory
)

Add-Type -AssemblyName System.Drawing

function Save-CoverImage {
  param([string]$InputPath, [string]$OutputPath)

  $source = [System.Drawing.Image]::FromFile($InputPath)
  try {
    $targetWidth = 1080
    $targetHeight = 1920
    $scale = [Math]::Max($targetWidth / $source.Width, $targetHeight / $source.Height)
    $drawWidth = [int][Math]::Round($source.Width * $scale)
    $drawHeight = [int][Math]::Round($source.Height * $scale)
    $x = [int][Math]::Round(($targetWidth - $drawWidth) / 2)
    $y = [int][Math]::Round(($targetHeight - $drawHeight) / 2)

    $canvas = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    try {
      $canvas.SetResolution(96, 96)
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, $x, $y, $drawWidth, $drawHeight)
      }
      finally {
        $graphics.Dispose()
      }
      $canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $canvas.Dispose()
    }
  }
  finally {
    $source.Dispose()
  }
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

for ($index = 0; $index -lt $Inputs.Count; $index++) {
  $name = '{0:D2}.png' -f ($index + 1)
  Save-CoverImage -InputPath $Inputs[$index] -OutputPath (Join-Path $OutputDirectory $name)
}

$sheetWidth = 1800
$thumbWidth = 360
$thumbHeight = 640
$labelHeight = 56
$sheetHeight = $thumbHeight + $labelHeight
$sheet = New-Object System.Drawing.Bitmap($sheetWidth, $sheetHeight)
try {
  $sheet.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(28, 28, 28))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $font = New-Object System.Drawing.Font('Arial', 22, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    try {
      for ($index = 0; $index -lt 5; $index++) {
        $path = Join-Path $OutputDirectory ('{0:D2}.png' -f ($index + 1))
        $image = [System.Drawing.Image]::FromFile($path)
        try {
          $x = $index * $thumbWidth
          $graphics.DrawImage($image, $x, 0, $thumbWidth, $thumbHeight)
          $label = '{0:D2}' -f ($index + 1)
          $size = $graphics.MeasureString($label, $font)
          $graphics.DrawString($label, $font, $brush, $x + (($thumbWidth - $size.Width) / 2), $thumbHeight + 10)
        }
        finally {
          $image.Dispose()
        }
      }
    }
    finally {
      $brush.Dispose()
      $font.Dispose()
    }
  }
  finally {
    $graphics.Dispose()
  }

  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
  $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, [long]92)
  try {
    $sheet.Save((Join-Path $OutputDirectory 'contact-sheet.jpg'), $jpegCodec, $encoderParameters)
  }
  finally {
    $encoderParameters.Dispose()
  }
}
finally {
  $sheet.Dispose()
}
