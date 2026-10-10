// Gera os icones do launcher Android a partir do icone 512 do PWA.
// Uso: node gen-android-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'icon-512.png';
const SRC_MASKABLE = 'icon-512-maskable.png';
const RES = path.join('android', 'app', 'src', 'main', 'res');

// ic_launcher/ic_launcher_round sao o icone legado (API < 26);
// ic_launcher_foreground e a camada do adaptive icon e precisa da safe zone,
// por isso sai do maskable.
const DENSITIES = {
  'mipmap-mdpi': { legacy: 48, foreground: 108 },
  'mipmap-hdpi': { legacy: 72, foreground: 162 },
  'mipmap-xhdpi': { legacy: 96, foreground: 216 },
  'mipmap-xxhdpi': { legacy: 144, foreground: 324 },
  'mipmap-xxxhdpi': { legacy: 192, foreground: 432 },
};

(async () => {
  for (const [dir, sizes] of Object.entries(DENSITIES)) {
    const out = path.join(RES, dir);
    fs.mkdirSync(out, { recursive: true });
    await sharp(SRC).resize(sizes.legacy, sizes.legacy).png()
      .toFile(path.join(out, 'ic_launcher.png'));
    await sharp(SRC).resize(sizes.legacy, sizes.legacy).png()
      .toFile(path.join(out, 'ic_launcher_round.png'));
    await sharp(SRC_MASKABLE).resize(sizes.foreground, sizes.foreground).png()
      .toFile(path.join(out, 'ic_launcher_foreground.png'));
  }
  console.log('icones do launcher gerados');
})();
