# Script PowerShell para gerar todos os ícones do app a partir de uma imagem base usando ImageMagick
# Salve este script como gerar-icones.ps1 na raiz do projeto e execute no PowerShell
# Certifique-se de que o ImageMagick está instalado e disponível no PATH

# Caminho da imagem base
$baseImage = "C:\Users\rafae\Downloads\Listou--main\Listou--main\Ícone de lista de compras.png"
# Pasta de destino dos ícones
$iconsDir = "C:\Users\rafae\Downloads\Listou--main\Listou--main\icons"

# Lista de tamanhos e nomes dos ícones
$icons = @(
    @{name="icon-48x48.png"; size=48},
    @{name="icon-72x72.png"; size=72},
    @{name="icon-96x96.png"; size=96},
    @{name="icon-128x128.png"; size=128},
    @{name="icon-144x144.png"; size=144},
    @{name="icon-152x152.png"; size=152},
    @{name="icon-180x180.png"; size=180},
    @{name="icon-192x192.png"; size=192},
    @{name="icon-256x256.png"; size=256},
    @{name="icon-384x384.png"; size=384},
    @{name="icon-512x512.png"; size=512},
    @{name="icon-1024x1024.png"; size=1024},
    @{name="icon-maskable-192x192.png"; size=192},
    @{name="icon-maskable-512x512.png"; size=512}
)

# Cria a pasta de ícones se não existir
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

# Gera cada ícone
foreach ($icon in $icons) {
    $output = Join-Path $iconsDir $icon.name
    magick convert $baseImage -resize "$($icon.size)x$($icon.size)" $output
    Write-Host "Gerado: $output"
}

Write-Host "Todos os ícones foram gerados com sucesso!"
