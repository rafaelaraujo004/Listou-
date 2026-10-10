// Gera todos os ícones do app a partir de logo.svg (vetor).
// Uso: node gen-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RES = path.join('android', 'app', 'src', 'main', 'res');
const png = (entrada, tamanho) => sharp(entrada).resize(tamanho, tamanho).png({ compressionLevel: 9 });

// Ícones do PWA / Play Store.
const PWA = [72, 96, 128, 144, 152, 192, 384, 512];

// Densidades do Android. O ícone legado (API < 26) usa o desenho inteiro;
// a camada frontal do adaptativo é maior porque o sistema recorta as bordas.
const ANDROID = {
  'mipmap-mdpi':    { legado: 48,  frente: 108 },
  'mipmap-hdpi':    { legado: 72,  frente: 162 },
  'mipmap-xhdpi':   { legado: 96,  frente: 216 },
  'mipmap-xxhdpi':  { legado: 144, frente: 324 },
  'mipmap-xxxhdpi': { legado: 192, frente: 432 },
};

(async () => {
  for (const t of PWA) {
    await png('logo.svg', t).toFile(`icon-${t}.png`);
    await png('logo.svg', t).toFile(`icon-${t}x${t}.png`);
  }
  // Maskable: a máscara come as bordas, então o desenho entra menor, sobre a
  // cor de fundo da marca.
  for (const t of [192, 512]) {
    const interno = Math.round(t * 0.78);
    const margem = Math.round((t - interno) / 2);
    const simbolo = await sharp('logo.svg').resize(interno, interno).png().toBuffer();
    await sharp({ create: { width: t, height: t, channels: 4,
                            background: { r: 0x12, g: 0xb8, b: 0x86, alpha: 1 } } })
      .composite([{ input: simbolo, left: margem, top: margem }])
      .png().toFile(`icon-${t}-maskable.png`);
    fs.copyFileSync(`icon-${t}-maskable.png`, `icon-${t}x${t}-maskable.png`);
  }
  fs.copyFileSync('icon-512-maskable.png', 'icon-maskable-512x512.png');
  fs.copyFileSync('icon-512.png', 'logo-listou.png');
  fs.copyFileSync('icon-512.png', 'logo.png');
  fs.copyFileSync('icon-512.png', 'Ícone de lista de compras.png');

  for (const [dir, sizes] of Object.entries(ANDROID)) {
    const out = path.join(RES, dir);
    fs.mkdirSync(out, { recursive: true });
    await png('logo.svg', sizes.legado).toFile(path.join(out, 'ic_launcher.png'));
    await png('logo.svg', sizes.legado).toFile(path.join(out, 'ic_launcher_round.png'));
    await png('logo-foreground.svg', sizes.frente).toFile(path.join(out, 'ic_launcher_foreground.png'));
  }

  // Splash: o símbolo sozinho, que o tema desenha sobre a cor da marca.
  await png('logo.svg', 320).toFile(path.join(RES, 'drawable', 'splash.png'));

  console.log('ícones gerados a partir de logo.svg');
})();
