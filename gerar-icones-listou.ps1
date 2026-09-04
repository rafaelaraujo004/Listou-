# Script PowerShell para gerar ícones do app Listou — Lista de Compras
# Requer: PowerShell 5+, ImageMagick instalado (comando 'magick')

$baseImage = "logo-listou.png"
$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $iconSizes) {
    $output = "icon-$size.png"
    magick convert "$baseImage" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} "$output"
    Write-Host "Gerado: $output"
}

# Ícones maskable
magick convert "$baseImage" -resize 192x192 -background none -gravity center -extent 192x192 "icon-192-maskable.png"
magick convert "$baseImage" -resize 512x512 -background none -gravity center -extent 512x512 "icon-512-maskable.png"
magick convert "$baseImage" -resize 512x512 -background none -gravity center -extent 512x512 "icon-maskable-512x512.png"

Write-Host "Todos os ícones foram gerados!"