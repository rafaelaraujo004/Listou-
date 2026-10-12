// ===== Abas Insights e Relatórios =====
// Insights = retrato da lista atual. Relatórios = o que o histórico ensina.
// Substitui a versão antiga, que tinha três problemas de conta além do visual:
//   - "Gastos por mês" somava h.total, campo que nunca é gravado (sempre vazio);
//   - o comparativo de mercados somava todos os preços de cada mercado, então
//     quem tinha menos produtos registrados parecia mais barato;
//   - "Frequência" somava quantidades de unidades diferentes (kg + L + un).
// Os dados chegam por window.__listouDados (exposto em app.js).

(function () {
  'use strict';

  const CORES_CAT = {
    'Mercearia': '#f59f00', 'Cereais': '#e8590c', 'Laticínios': '#4dabf7',
    'Hortifruti': '#40c057', 'Carnes': '#fa5252', 'Bebidas': '#845ef7',
    'Limpeza': '#15aabf', 'Higiene': '#e64980', 'Outros': '#868e96',
  };
  const corCat = c => CORES_CAT[c] || CORES_CAT.Outros;

  const esc = t => String(t == null ? '' : t)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pct = n => (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%';
  const num = v => (typeof numBR === 'function' ? numBR(v) : Number(v) || 0);
  const sub = i => num(i.qty) * num(i.price);
  const dados = () => window.__listouDados;
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  let graficoCat = null, graficoMes = null;

  // ---------- pecas reutilizaveis ----------
  const bloco = (titulo, subtitulo, corpo, extra = '') => `
    <section class="pn-bloco">
      <div class="pn-cab"><h3>${titulo}</h3>${subtitulo ? `<span>${subtitulo}</span>` : ''}${extra}</div>
      ${corpo}
    </section>`;

  const vazio = (titulo, texto) =>
    `<div class="pn-vazio"><b>${titulo}</b><span>${texto}</span></div>`;

  // Barras horizontais em HTML: rotulo legivel e valor alinhado.
  const barras = (linhas, maximo) => `<div class="pn-barras">${linhas.map(l => `
      <div class="pn-barra${l.destaque ? ' is-top' : ''}">
        <div class="pn-barra-topo"><span class="pn-barra-nome">${esc(l.nome)}</span><b>${l.valor}</b></div>
        <div class="pn-barra-trilho"><span style="width:${Math.max(3, (l.medida / (maximo || 1)) * 100)}%;${l.cor ? 'background:' + l.cor : ''}"></span></div>
        ${l.nota ? `<small>${l.nota}</small>` : ''}
      </div>`).join('')}</div>`;

  const kpi = (rotulo, valor, detalhe, tom = '') =>
    `<div class="pn-kpi${tom ? ' ' + tom : ''}"><span>${rotulo}</span><b>${valor}</b>${detalhe ? `<small>${detalhe}</small>` : ''}</div>`;

  const visivel = id => { const s = document.getElementById(id); return s && !s.classList.contains('hidden'); };

  // ================= INSIGHTS =================
  function insights() {
    const raiz = document.getElementById('insRaiz');
    if (!raiz || !dados() || !visivel('tab-insights')) return;
    const itens = dados().items();

    if (!itens.length) {
      graficoCat?.destroy(); graficoCat = null;
      raiz.innerHTML = vazio('Sua lista está vazia', 'Adicione itens na aba Lista para ver o resumo dos gastos aqui.');
      return;
    }

    const total = itens.reduce((s, i) => s + sub(i), 0);
    const feitos = itens.filter(i => i.done);
    const noCarrinho = feitos.reduce((s, i) => s + sub(i), 0);
    const semPreco = itens.filter(i => !num(i.price)).length;
    const maisCaro = itens.slice().sort((a, b) => sub(b) - sub(a))[0];

    const kpis = `<div class="pn-kpis">
      ${kpi('Total previsto', money(total), itens.length + (itens.length === 1 ? ' item' : ' itens'), 'is-destaque')}
      ${kpi('No carrinho', money(noCarrinho), total ? pct(noCarrinho / total * 100) + ' do total' : feitos.length + ' marcados')}
      ${kpi('Falta comprar', money(total - noCarrinho), (itens.length - feitos.length) + ' itens')}
      ${kpi('Maior gasto', maisCaro && sub(maisCaro) ? money(sub(maisCaro)) : '—', maisCaro && sub(maisCaro) ? esc(maisCaro.name) : 'sem preços')}
    </div>`;

    const aviso = semPreco ? `<div class="pn-aviso">${semPreco} ${semPreco === 1 ? 'item está' : 'itens estão'} sem preço e não entram nas contas.</div>` : '';

    // por categoria: rosca + legenda em lista
    const porCat = {};
    itens.forEach(i => { const c = i.category || 'Outros'; porCat[c] = (porCat[c] || 0) + sub(i); });
    const cats = Object.entries(porCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const catHtml = cats.length ? `
      <div class="pn-rosca">
        <div class="pn-rosca-graf"><canvas id="pnCat" width="200" height="200"></canvas>
          <div class="pn-rosca-centro"><small>total</small><b>${money(total)}</b></div></div>
        <ul class="pn-legenda">${cats.map(([c, v]) => `
          <li><i style="background:${corCat(c)}"></i><span>${esc(c)}</span><em>${pct(v / total * 100)}</em><b>${money(v)}</b></li>`).join('')}
        </ul>
      </div>` : vazio('Sem preços ainda', 'Informe o preço dos itens para ver a divisão por categoria.');

    // onde vai o dinheiro (curva ABC em barras)
    const top = itens.filter(i => sub(i) > 0).sort((a, b) => sub(b) - sub(a)).slice(0, 8);
    let acumulado = 0;
    const abc = top.length ? barras(top.map((i, k) => {
      acumulado += sub(i);
      return { nome: i.name, valor: money(sub(i)), medida: sub(i), destaque: k === 0,
               cor: corCat(i.category), nota: pct(acumulado / total * 100) + ' do total até aqui' };
    }), sub(top[0])) : '';

    raiz.innerHTML = kpis + aviso
      + bloco('Gasto por categoria', '', catHtml)
      + (abc ? bloco('Onde vai seu dinheiro', 'itens que mais pesam', abc) : '');

    graficoCat?.destroy(); graficoCat = null;
    const cv = document.getElementById('pnCat');
    if (cv && window.Chart) {
      graficoCat = new Chart(cv, {
        type: 'doughnut',
        data: { labels: cats.map(c => c[0]), datasets: [{ data: cats.map(c => c[1]), backgroundColor: cats.map(c => corCat(c[0])), borderColor: tok('--s1'), borderWidth: 3, hoverOffset: 6 }] },
        options: { cutout: '68%', responsive: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + c.label + ': ' + money(c.raw) } } } },
      });
    }
  }

  // ================= RELATORIOS =================
  function totalCompra(h) { return (h.items || []).reduce((s, i) => s + sub(i), 0); }

  // Comparacao justa: so conta produtos com preco em todos os mercados
  // comparados. Sem cesta em comum, compara item a item (indice de preco).
  function compararMercados(ph) {
    const porMercado = {};
    Object.entries(ph).forEach(([item, mercados]) => {
      Object.entries(mercados).forEach(([m, arr]) => {
        if (arr && arr.length) (porMercado[m] = porMercado[m] || {})[item] = num(arr[arr.length - 1].price);
      });
    });
    const mercados = Object.keys(porMercado);
    if (mercados.length < 2) return null;

    const comuns = Object.keys(porMercado[mercados[0]]).filter(it => mercados.every(m => porMercado[m][it] > 0));
    if (comuns.length) {
      const linhas = mercados.map(m => ({ m, total: comuns.reduce((s, it) => s + porMercado[m][it], 0) })).sort((a, b) => a.total - b.total);
      return { tipo: 'cesta', n: comuns.length, linhas, economia: linhas[linhas.length - 1].total - linhas[0].total };
    }
    // indice: preco do mercado / menor preco do item, na media dos itens que ele tem
    const idx = mercados.map(m => {
      const razoes = Object.entries(porMercado[m]).map(([it, p]) => {
        const menor = Math.min(...mercados.map(x => porMercado[x][it]).filter(v => v > 0));
        return mercados.filter(x => porMercado[x][it] > 0).length > 1 && menor > 0 ? p / menor : null;
      }).filter(v => v != null);
      return { m, indice: razoes.length ? razoes.reduce((a, b) => a + b, 0) / razoes.length : null };
    }).filter(x => x.indice != null).sort((a, b) => a.indice - b.indice);
    return idx.length > 1 ? { tipo: 'indice', linhas: idx } : null;
  }

  function relatorios() {
    const raiz = document.getElementById('relRaiz');
    if (!raiz || !dados() || !visivel('tab-relatorios')) return;
    const hist = dados().history();
    const ph = dados().priceHistory();

    if (!hist.length && !Object.keys(ph).length) {
      graficoMes?.destroy(); graficoMes = null;
      raiz.innerHTML = vazio('Ainda não há compras concluídas',
        'Quando você concluir uma compra, os relatórios mostram quanto gastou por mês, qual mercado sai mais barato e quais preços mudaram.');
      return;
    }

    let html = '';

    // 1. mercado mais barato
    const comp = compararMercados(ph);
    if (comp) {
      const melhor = comp.linhas[0];
      const frase = comp.tipo === 'cesta'
        ? `Nos ${comp.n} produtos que você comprou em todos eles, a mesma cesta sai <b>${money(comp.economia)} mais barata</b> lá.`
        : `Comparando item a item, os preços lá são em média os menores.`;
      const max = comp.tipo === 'cesta' ? comp.linhas[comp.linhas.length - 1].total : comp.linhas[comp.linhas.length - 1].indice;
      html += `<section class="pn-hero">
          <span class="pn-hero-rot">Mercado mais barato</span>
          <b class="pn-hero-nome">${esc(melhor.m)}</b>
          <p>${frase}</p>
        </section>`;
      html += bloco('Comparativo de mercados', comp.tipo === 'cesta' ? 'mesma cesta de produtos' : 'índice de preço',
        barras(comp.linhas.map((l, k) => comp.tipo === 'cesta'
          ? { nome: l.m, valor: money(l.total), medida: l.total, destaque: k === 0, cor: k === 0 ? tok('--brand') : tok('--ink-3') }
          : { nome: l.m, valor: k === 0 ? 'mais barato' : '+' + pct((l.indice - 1) * 100), medida: l.indice, destaque: k === 0, cor: k === 0 ? tok('--brand') : tok('--ink-3') }), max));
    }

    // 2. gastos por mes
    const porMes = {};
    hist.forEach(h => {
      const d = new Date(h.at); if (isNaN(d)) return;
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      porMes[k] = (porMes[k] || 0) + totalCompra(h);
    });
    const meses = Object.keys(porMes).sort().slice(-6);
    if (meses.length) {
      const valores = meses.map(k => porMes[k]);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const ultimo = valores[valores.length - 1];
      const anterior = valores.length > 1 ? valores[valores.length - 2] : null;
      const variacao = anterior ? (ultimo - anterior) / anterior * 100 : null;
      html += bloco('Gastos por mês', 'últimos ' + meses.length + (meses.length === 1 ? ' mês' : ' meses'), `
        <div class="pn-kpis pn-kpis-2">
          ${kpi('Este mês', money(ultimo), variacao == null ? 'primeiro mês registrado' : Math.abs(variacao) < 0.5 ? 'igual ao mês anterior' : (variacao > 0 ? '▲ ' : '▼ ') + pct(Math.abs(variacao)) + ' vs. mês anterior', variacao > 0.5 ? 'is-alta' : (variacao < -0.5 ? 'is-baixa' : ''))}
          ${kpi('Média mensal', money(media), hist.length + (hist.length === 1 ? ' compra' : ' compras'))}
        </div>
        <div class="pn-graf"><canvas id="pnMes" height="190"></canvas></div>`);
    }

    // 3. onde cada item sai mais barato
    const ondeComprar = Object.entries(ph).map(([item, mercados]) => {
      const precos = Object.entries(mercados).map(([m, arr]) => [m, arr && arr.length ? num(arr[arr.length - 1].price) : 0]).filter(x => x[1] > 0);
      if (precos.length < 2) return null;
      precos.sort((a, b) => a[1] - b[1]);
      const [mercado, menor] = precos[0]; const maior = precos[precos.length - 1][1];
      return { item, mercado, menor, dif: maior - menor };
    }).filter(Boolean).sort((a, b) => b.dif - a.dif).slice(0, 8);
    if (ondeComprar.length) {
      html += bloco('Onde cada item sai mais barato', 'maior diferença primeiro', `<ul class="pn-lista">${ondeComprar.map(o => `
        <li><div><b>${esc(o.item)}</b><span>${esc(o.mercado)} · ${money(o.menor)}</span></div>
            <em class="is-baixa">economia de ${money(o.dif)}</em></li>`).join('')}</ul>`);
    }

    // 4. precos que mais mudaram (ultimo vs anterior, mesmo mercado)
    const mudancas = [];
    Object.entries(ph).forEach(([item, mercados]) => Object.entries(mercados).forEach(([m, arr]) => {
      if (arr && arr.length > 1) {
        const a = num(arr[arr.length - 2].price), b = num(arr[arr.length - 1].price);
        if (a > 0 && b > 0 && a !== b) mudancas.push({ item, m, a, b, d: (b - a) / a * 100 });
      }
    }));
    mudancas.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    if (mudancas.length) {
      html += bloco('Preços que mais mudaram', 'última compra vs. anterior', `<ul class="pn-lista">${mudancas.slice(0, 8).map(x => `
        <li><div><b>${esc(x.item)}</b><span>${esc(x.m)} · ${money(x.a)} → ${money(x.b)}</span></div>
            <em class="${x.d > 0 ? 'is-alta' : 'is-baixa'}">${x.d > 0 ? '▲' : '▼'} ${pct(Math.abs(x.d))}</em></li>`).join('')}</ul>`);
    }

    // 5. mais comprados (vezes, nao quantidade: unidades diferentes nao somam)
    const vezes = {};
    hist.forEach(h => (h.items || []).forEach(i => { const k = (i.name || '').trim(); if (k) vezes[k] = (vezes[k] || 0) + 1; }));
    const top = Object.entries(vezes).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (top.length) {
      html += bloco('Mais comprados', 'vezes em que entrou numa compra',
        barras(top.map(([n, v], k) => ({ nome: n, valor: v + (v === 1 ? ' vez' : ' vezes'), medida: v, destaque: k === 0 })), top[0][1]));
    }

    raiz.innerHTML = html;

    graficoMes?.destroy(); graficoMes = null;
    const cv = document.getElementById('pnMes');
    if (cv && window.Chart && meses.length) {
      const rotulo = k => { const [a, m] = k.split('-'); return new Date(+a, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''); };
      graficoMes = new Chart(cv, {
        type: 'bar',
        data: { labels: meses.map(rotulo), datasets: [{ data: meses.map(k => porMes[k]),
          backgroundColor: meses.map((_, i) => i === meses.length - 1 ? tok('--brand') : tok('--brand-soft')),
          borderRadius: 8, maxBarThickness: 44 }] },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + money(c.raw) } } },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + Number(v).toLocaleString('pt-BR') } } } },
      });
    }
  }

  window.Painel = { insights, relatorios };
})();
