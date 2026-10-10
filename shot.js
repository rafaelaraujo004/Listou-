// Captura telas do app num viewport de celular de verdade.
// Uso: node shot.js [aba] [tema] [saida.png]
// O Chrome headless sozinho ignora --window-size (usa 500px de largura), por
// isso o controle de viewport vem do Puppeteer.
const puppeteer = require('puppeteer-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.LISTOU_URL || 'http://localhost:5174';

const DADOS = [
  { name: 'Arroz branco 5kg', category: 'Mercearia', unit: 'un', qty: 2, price: 24.9, done: false, createdAt: 1 },
  { name: 'Feijão carioca 1kg', category: 'Mercearia', unit: 'un', qty: 3, price: 8.5, done: false, createdAt: 2 },
  { name: 'Leite integral', category: 'Laticínios', unit: 'L', qty: 6, price: 5.2, done: false, createdAt: 3 },
  { name: 'Peito de frango', category: 'Carnes', unit: 'kg', qty: 1.5, price: 18.9, done: false, createdAt: 4 },
  { name: 'Detergente neutro', category: 'Limpeza', unit: 'un', qty: 4, price: 2.7, done: true, createdAt: 5 },
  { name: 'Banana prata', category: 'Hortifruti', unit: 'kg', qty: 2, price: 6.4, done: true, createdAt: 6 },
];

(async () => {
  const [aba = 'lista', tema = 'dark', saida = 'shot.png'] = process.argv.slice(2);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--disable-gpu', '--hide-scrollbars', '--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.evaluate((itens, tema) => {
    localStorage.setItem('listou.items.v3', JSON.stringify(itens));
    localStorage.setItem('listou.market.v1', 'Atacadão');
    localStorage.setItem('listou.theme.v1', tema);
    const ph = {}, mk = (i, m, p) => { ph[i] = ph[i] || {}; ph[i][m] = p.map((x, k) => ({ price: x, date: new Date(2026, 3 + k, 10).toISOString() })); };
    mk('Arroz branco 5kg', 'Atacadão', [22.9, 23.5, 24.9]); mk('Arroz branco 5kg', 'Assaí', [23.9, 24.2, 25.9]);
    mk('Leite integral', 'Atacadão', [4.9, 5.0, 5.2]); mk('Leite integral', 'Assaí', [5.4, 5.3, 5.1]);
    mk('Detergente neutro', 'Atacadão', [2.4, 2.5, 2.7]); mk('Detergente neutro', 'Assaí', [2.2, 2.3, 2.4]);
    localStorage.setItem('listou.pricehist.v1', JSON.stringify(ph));
    localStorage.setItem('listou.history.v2', JSON.stringify([1, 2, 3, 4].map(i => ({
      id: 'h' + i, at: new Date(2026, 4 + i, 15).getTime(),
      market: i % 2 ? 'Atacadão' : 'Assaí', items: itens.map(x => ({ ...x, done: true })),
    }))));
    localStorage.setItem('listou.products.v1', JSON.stringify([
      { name: 'Azeite português', category: 'Mercearia', unit: 'un', price: 29.9, brand: 'Gallo' },
      { name: 'Café torrado', category: 'Bebidas', unit: 'pct', price: 18.5, brand: 'Melitta' },
    ]));
  }, DADOS, tema);

  await page.reload({ waitUntil: 'networkidle2' });
  await page.evaluate(aba => {
    const b = [...document.querySelectorAll('.tab-btn')].find(x => x.dataset.tab === aba);
    if (b) b.click();
  }, aba);
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: saida });
  await browser.close();
  console.log('captura: ' + saida + ' (' + aba + ', ' + tema + ')');
})();
