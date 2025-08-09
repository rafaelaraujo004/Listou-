## Listou

Base PWA simples de lista de compras.

### Logo / Ícones
Logo principal: `logo.svg`.

Gerar PNGs para manifest (necessário para instalação em Android / Chrome):

PowerShell (requer Inkscape ou ImageMagick instalado):
```
# Exemplo usando ImageMagick
magick convert logo.svg -resize 192x192 icon-192.png
magick convert logo.svg -resize 512x512 icon-512.png
```

### Roadmap breve
- Leitura de QRCode (NFC-e) via ZXing / jsQR
- Merge de itens da nota
- Recursos premium (sync, múltiplos perfis, backup)
- Build APK com Capacitor

### Capacitor (futuro)
```
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init listou com.seu.dominio.listou
# Configurar webDir para a pasta atual
```

### Desenvolvimento
Abra com um Live Server / http-server simples e teste offline (instale como PWA).
