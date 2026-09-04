// Monta a pasta www/ usada pelo Capacitor a partir dos assets da raiz.
// Uso: node build-www.js
const fs = require('fs');
const path = require('path');

const root = __dirname;
const www = path.join(root, 'www');

// vendor/ fica na raiz (versionado) e e copiado para dentro de www/.
const ASSETS = [
  'index.html', 'app.js', 'styles.css', 'theme.css', 'manifest.json', 'sw.js',
  'Ícone de lista de compras.png',
];
const ICON_GLOB = /^icon-.*\.png$/;

fs.mkdirSync(www, { recursive: true });

for (const f of ASSETS) {
  fs.copyFileSync(path.join(root, f), path.join(www, f));
}
for (const f of fs.readdirSync(root)) {
  if (ICON_GLOB.test(f)) fs.copyFileSync(path.join(root, f), path.join(www, f));
}
fs.cpSync(path.join(root, "vendor"), path.join(www, "vendor"), { recursive: true });

// Troca as CDNs por copias locais e desativa o service worker dentro do app nativo.
let html = fs.readFileSync(path.join(www, 'index.html'), 'utf8');
const swaps = [
  [/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/, ''],
  [/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/, ''],
  [/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/,
   '<link href="./vendor/fonts/inter.css" rel="stylesheet">'],
  [/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/,
   '<script src="./vendor/tailwind.js"></script>'],
  [/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js"><\/script>/,
   '<script src="./vendor/chart.umd.js"></script>'],
];
for (const [re, to] of swaps) {
  if (!re.test(html)) throw new Error('Padrao nao encontrado em index.html: ' + re);
  html = html.replace(re, to);
}

// O service worker so faz sentido na versao web; dentro do APK os assets ja sao locais
// e o fetch network-first deixaria o app em branco sem internet.
html = html.replace(
  "navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })",
  "!window.Capacitor && navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })"
);

fs.writeFileSync(path.join(www, 'index.html'), html);
console.log('www/ gerado com sucesso');
