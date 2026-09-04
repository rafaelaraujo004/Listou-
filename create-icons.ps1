# Script PowerShell para criar icones PNG validos

Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$Size,
        [string]$OutputPath,
        [bool]$IsMaskable = $false
    )
    
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    if ($IsMaskable) {
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
    } else {
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    }
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)
    
    $font = New-Object System.Drawing.Font("Arial", [Math]::Max(12, $Size / 8), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
    if ($IsMaskable) {
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    }
    
    $text = "L"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($Size - $textSize.Width) / 2
    $y = ($Size - $textSize.Height) / 2
    
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    
    Write-Host "Criado: $OutputPath ($Size x $Size)"
}

$basePath = Get-Location

Create-Icon -Size 72 -OutputPath "$basePath\icon-72.png"
Create-Icon -Size 96 -OutputPath "$basePath\icon-96.png"
Create-Icon -Size 128 -OutputPath "$basePath\icon-128.png"
Create-Icon -Size 144 -OutputPath "$basePath\icon-144.png"
Create-Icon -Size 152 -OutputPath "$basePath\icon-152.png"
Create-Icon -Size 192 -OutputPath "$basePath\icon-192.png"
Create-Icon -Size 384 -OutputPath "$basePath\icon-384.png"
Create-Icon -Size 512 -OutputPath "$basePath\icon-512.png"
Create-Icon -Size 192 -OutputPath "$basePath\icon-192-maskable.png" -IsMaskable $true
Create-Icon -Size 512 -OutputPath "$basePath\icon-512-maskable.png" -IsMaskable $true

Write-Host "Todos os icones criados com sucesso!"
