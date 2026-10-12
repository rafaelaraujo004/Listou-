// ===== Aba Sugestões =====
// Substitui a versão antiga (12 blocos de HTML fixos, sem conteúdo visível e
// com "Minhas listas" quebrado). Tudo aqui é desenhado a partir dos dados:
//   1. "Compre de novo": itens que você já comprou e não estão na lista;
//   2. "Minhas listas": listas que você salvou para reaproveitar;
//   3. "Listas prontas": modelos por ocasião, com prévia antes de adicionar.
// Depende do que app.js expõe em window.__listouSug (dados e ações da lista).

(function () {
  'use strict';

  const LISTAS_PRONTAS = [
    { id: 'basico', emoji: '🛒', titulo: 'Básico do mês', cor: '#12b886', itens: [
      ['Arroz 5kg', 'Cereais', 'un', 1], ['Feijão carioca 1kg', 'Cereais', 'un', 2],
      ['Açúcar 1kg', 'Mercearia', 'un', 1], ['Café 500g', 'Bebidas', 'un', 1],
      ['Óleo de soja', 'Mercearia', 'un', 2], ['Sal 1kg', 'Mercearia', 'un', 1],
      ['Macarrão', 'Mercearia', 'un', 3], ['Leite integral', 'Laticínios', 'L', 6],
      ['Farinha de trigo', 'Mercearia', 'un', 1], ['Molho de tomate', 'Mercearia', 'un', 3] ] },
    { id: 'churrasco', emoji: '🔥', titulo: 'Churrasco', cor: '#f76707', itens: [
      ['Picanha', 'Carnes', 'kg', 1.5], ['Linguiça toscana', 'Carnes', 'kg', 1],
      ['Coxinha da asa', 'Carnes', 'kg', 1], ['Pão de alho', 'Outros', 'pct', 2],
      ['Carvão', 'Outros', 'kg', 5], ['Sal grosso', 'Mercearia', 'un', 1],
      ['Farofa pronta', 'Mercearia', 'pct', 1], ['Tomate', 'Hortifruti', 'kg', 1],
      ['Cebola', 'Hortifruti', 'kg', 1], ['Refrigerante 2L', 'Bebidas', 'un', 2],
      ['Cerveja', 'Bebidas', 'un', 12], ['Gelo', 'Outros', 'pct', 2] ] },
    { id: 'cafe', emoji: '☕', titulo: 'Café da manhã', cor: '#a0522d', itens: [
      ['Pão francês', 'Outros', 'un', 10], ['Café 500g', 'Bebidas', 'un', 1],
      ['Leite integral', 'Laticínios', 'L', 2], ['Manteiga', 'Laticínios', 'un', 1],
      ['Queijo muçarela', 'Laticínios', 'kg', 0.3], ['Presunto', 'Carnes', 'kg', 0.3],
      ['Requeijão', 'Laticínios', 'un', 1], ['Mamão', 'Hortifruti', 'un', 1] ] },
    { id: 'feira', emoji: '🥬', titulo: 'Feira da semana', cor: '#2f9e44', itens: [
      ['Banana prata', 'Hortifruti', 'kg', 1], ['Maçã', 'Hortifruti', 'kg', 1],
      ['Laranja', 'Hortifruti', 'kg', 2], ['Tomate', 'Hortifruti', 'kg', 1],
      ['Alface', 'Hortifruti', 'un', 1], ['Cenoura', 'Hortifruti', 'kg', 0.5],
      ['Batata', 'Hortifruti', 'kg', 1], ['Cebola', 'Hortifruti', 'kg', 1],
      ['Alho', 'Hortifruti', 'un', 1] ] },
    { id: 'limpeza', emoji: '🧽', titulo: 'Limpeza da casa', cor: '#1c7ed6', itens: [
      ['Detergente', 'Limpeza', 'un', 3], ['Sabão em pó', 'Limpeza', 'un', 1],
      ['Amaciante', 'Limpeza', 'un', 1], ['Água sanitária', 'Limpeza', 'L', 1],
      ['Desinfetante', 'Limpeza', 'un', 1], ['Esponja', 'Limpeza', 'pct', 1],
      ['Saco de lixo', 'Limpeza', 'pct', 1], ['Papel toalha', 'Limpeza', 'pct', 1] ] },
    { id: 'higiene', emoji: '🧴', titulo: 'Higiene pessoal', cor: '#ae3ec9', itens: [
      ['Papel higiênico', 'Higiene', 'pct', 1], ['Sabonete', 'Higiene', 'un', 4],
      ['Shampoo', 'Higiene', 'un', 1], ['Condicionador', 'Higiene', 'un', 1],
      ['Creme dental', 'Higiene', 'un', 2], ['Escova de dente', 'Higiene', 'un', 1],
      ['Desodorante', 'Higiene', 'un', 1] ] },
    { id: 'fit', emoji: '🥗', titulo: 'Semana fit', cor: '#37b24d', itens: [
      ['Peito de frango', 'Carnes', 'kg', 2], ['Ovos', 'Outros', 'un', 30],
      ['Batata doce', 'Hortifruti', 'kg', 2], ['Arroz integral', 'Cereais', 'un', 1],
      ['Brócolis', 'Hortifruti', 'un', 2], ['Aveia', 'Cereais', 'un', 1],
      ['Iogurte natural', 'Laticínios', 'un', 4], ['Banana', 'Hortifruti', 'kg', 1] ] },
    { id: 'festa', emoji: '🎉', titulo: 'Festa de aniversário', cor: '#e64980', itens: [
      ['Refrigerante 2L', 'Bebidas', 'un', 4], ['Salgadinhos', 'Outros', 'pct', 4],
      ['Bolo', 'Outros', 'un', 1], ['Brigadeiro', 'Outros', 'un', 50],
      ['Copos descartáveis', 'Outros', 'pct', 2], ['Pratos descartáveis', 'Outros', 'pct', 2],
      ['Guardanapo', 'Outros', 'pct', 2], ['Velas', 'Outros', 'un', 1] ] },
    { id: 'pet', emoji: '🐾', titulo: 'Pet', cor: '#f59f00', itens: [
      ['Ração', 'Outros', 'kg', 3], ['Petisco', 'Outros', 'pct', 2],
      ['Areia higiênica', 'Outros', 'pct', 1], ['Tapete higiênico', 'Outros', 'pct', 1],
      ['Shampoo pet', 'Outros', 'un', 1] ] },
    { id: 'escola', emoji: '🎒', titulo: 'Lanche da escola', cor: '#4263eb', itens: [
      ['Suco de caixinha', 'Bebidas', 'un', 10], ['Biscoito', 'Mercearia', 'pct', 3],
      ['Bisnaguinha', 'Outros', 'pct', 2], ['Iogurte', 'Laticínios', 'un', 6],
      ['Fruta', 'Hortifruti', 'un', 6], ['Barra de cereal', 'Cereais', 'un', 6] ] },
    { id: 'acougue', emoji: '🥩', titulo: 'Açougue', cor: '#c92a2a', itens: [
      ['Carne moída', 'Carnes', 'kg', 1], ['Bife de alcatra', 'Carnes', 'kg', 1],
      ['Frango inteiro', 'Carnes', 'kg', 2], ['Linguiça', 'Carnes', 'kg', 1],
      ['Costela', 'Carnes', 'kg', 1.5] ] },
    { id: 'doces', emoji: '🍰', titulo: 'Sobremesas', cor: '#d6336c', itens: [
      ['Leite condensado', 'Laticínios', 'un', 2], ['Creme de leite', 'Laticínios', 'un', 2],
      ['Chocolate em pó', 'Mercearia', 'un', 1], ['Gelatina', 'Mercearia', 'un', 3],
      ['Sorvete', 'Laticínios', 'un', 1], ['Morango', 'Hortifruti', 'un', 1] ] },
  ];

  const esc = t => String(t == null ? '' : t)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const qtdTxt = (q, u) => (Number(q) || 1).toLocaleString('pt-BR', { maximumFractionDigits: 3 }) + ' ' + (u || 'un');
  const api = () => window.__listouSug;

  // ---------- 1. Compre de novo ----------
  function compreDeNovo() {
    const a = api(); if (!a) return [];
    const naLista = new Set(a.items().map(i => (i.name || '').trim().toLowerCase()));
    return Object.entries(a.suggestions())
      .filter(([nome]) => nome && !naLista.has(nome.trim().toLowerCase()))
      .filter(([nome]) => !/^\s*(teste|dev|tmp)\b/i.test(nome))
      .map(([nome, m]) => ({ nome, m, peso: (m.count || 0) * 3 + (m.lastAt ? Math.max(0, 30 - (Date.now() - m.lastAt) / 864e5) / 6 : 0) }))
      .sort((x, y) => y.peso - x.peso)
      .slice(0, 12);
  }

  function blocoCompreDeNovo() {
    const lista = compreDeNovo();
    if (!lista.length) return '';
    return `
      <section class="sg-bloco">
        <div class="sg-cab"><h3>Compre de novo</h3><span class="sg-sub">do seu histórico</span></div>
        <div class="sg-chips">
          ${lista.map(({ nome, m }) => `
            <button class="sg-chip" data-novo="${esc(nome)}" aria-label="Adicionar ${esc(nome)}">
              <span class="sg-chip-nome">${esc(cap(nome))}</span>
              ${Number(m.lastPrice) > 0 ? `<span class="sg-chip-preco">${money(m.lastPrice)}</span>` : ''}
              <span class="sg-chip-mais" aria-hidden="true">+</span>
            </button>`).join('')}
        </div>
      </section>`;
  }

  // ---------- 2. Minhas listas ----------
  function blocoMinhasListas() {
    const a = api(); const listas = a ? a.userLists() : [];
    const temItens = a && a.items().length > 0;
    const cartoes = listas.map((l, i) => {
      const itens = l.items || [];
      const previa = itens.slice(0, 3).map(x => esc(x.name)).join(', ') + (itens.length > 3 ? '…' : '');
      return `
        <div class="sg-minha">
          <div class="sg-minha-info">
            <b>${esc(l.name || 'Lista sem nome')}</b>
            <span>${itens.length} ${itens.length === 1 ? 'item' : 'itens'}${previa ? ' · ' + previa : ''}</span>
          </div>
          <button class="sg-acao" data-usar-minha="${i}">Usar</button>
          <button class="sg-icone" data-del-minha="${i}" aria-label="Excluir lista ${esc(l.name || '')}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>`;
    }).join('');
    return `
      <section class="sg-bloco">
        <div class="sg-cab"><h3>Minhas listas</h3>
          ${temItens ? '<button class="sg-link" data-salvar-atual>+ Salvar lista atual</button>' : ''}
        </div>
        ${cartoes || `<div class="sg-vazio">
            <b>Nenhuma lista salva ainda</b>
            <span>${temItens ? 'Salve sua lista atual para repetir a compra quando quiser.'
                             : 'Monte uma lista e salve-a aqui para repetir a compra quando quiser.'}</span>
          </div>`}
      </section>`;
  }

  // ---------- 3. Listas prontas ----------
  function blocoProntas() {
    return `
      <section class="sg-bloco">
        <div class="sg-cab"><h3>Listas prontas</h3><span class="sg-sub">toque para ver e escolher</span></div>
        <div class="sg-grade">
          ${LISTAS_PRONTAS.map(l => `
            <button class="sg-card" data-pronta="${l.id}" style="--sg-cor:${l.cor}">
              <span class="sg-card-emoji" aria-hidden="true">${l.emoji}</span>
              <b class="sg-card-titulo">${esc(l.titulo)}</b>
              <span class="sg-card-qtd">${l.itens.length} itens</span>
              <span class="sg-card-previa">${l.itens.slice(0, 3).map(x => esc(x[0])).join(' · ')}</span>
            </button>`).join('')}
        </div>
      </section>`;
  }

  function cap(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }

  // ---------- Folha de prévia ----------
  // Mostra os itens com caixas marcadas; o usuário desmarca o que não quer.
  function abrirPrevia(titulo, emoji, itens, aoConfirmar) {
    let sheet = document.getElementById('sgSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'sgSheet';
      sheet.className = 'sheet';
      sheet.hidden = true;
      sheet.innerHTML = `
        <div class="sheet-backdrop" data-sg-fechar></div>
        <div class="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sgSheetTitulo">
          <div class="sheet-grip"></div>
          <div class="sheet-head">
            <h3 id="sgSheetTitulo"></h3>
            <button class="icon-btn" data-sg-fechar aria-label="Fechar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="sg-prev-topo">
            <span class="sg-prev-cont"></span>
            <button class="sg-link" data-sg-todos></button>
          </div>
          <div class="sg-prev-lista"></div>
          <button class="btn-primary btn-block" data-sg-confirmar></button>
        </div>`;
      document.body.appendChild(sheet);
      sheet.addEventListener('click', e => {
        if (e.target.closest('[data-sg-fechar]')) fechar();
      });
    }

    const estado = itens.map(() => true);
    const lista = sheet.querySelector('.sg-prev-lista');
    const btn = sheet.querySelector('[data-sg-confirmar]');
    const todos = sheet.querySelector('[data-sg-todos]');
    const cont = sheet.querySelector('.sg-prev-cont');
    sheet.querySelector('#sgSheetTitulo').textContent = (emoji ? emoji + '  ' : '') + titulo;

    const naLista = new Set(api().items().map(i => (i.name || '').trim().toLowerCase()));
    lista.innerHTML = itens.map((it, i) => `
      <label class="sg-prev-item">
        <input type="checkbox" data-i="${i}" checked>
        <span class="check-mark" aria-hidden="true"></span>
        <span class="sg-prev-nome">${esc(it.name)}${naLista.has(it.name.trim().toLowerCase()) ? '<em>já na lista</em>' : ''}</span>
        <span class="sg-prev-q">${qtdTxt(it.qty, it.unit)}</span>
      </label>`).join('');

    const atualizar = () => {
      const n = estado.filter(Boolean).length;
      cont.textContent = n + ' de ' + itens.length + ' selecionados';
      btn.textContent = n ? 'Adicionar ' + n + (n === 1 ? ' item' : ' itens') + ' à lista' : 'Selecione ao menos um item';
      btn.disabled = !n;
      todos.textContent = n === itens.length ? 'Desmarcar todos' : 'Marcar todos';
    };
    lista.onchange = e => { const i = Number(e.target.dataset.i); if (Number.isFinite(i)) { estado[i] = e.target.checked; atualizar(); } };
    todos.onclick = () => {
      const marcar = estado.some(v => !v);
      estado.fill(marcar);
      lista.querySelectorAll('input').forEach(c => { c.checked = marcar; });
      atualizar();
    };
    btn.onclick = () => {
      const escolhidos = itens.filter((_, i) => estado[i]);
      if (!escolhidos.length) return;
      aoConfirmar(escolhidos);
      fechar();
    };
    atualizar();

    function fechar() {
      if (!sheet.classList.contains('is-open')) return;
      sheet.classList.remove('is-open');
      document.body.classList.remove('sheet-open');
      if (typeof desempilharVoltar === 'function') desempilharVoltar('sgSheet');
      setTimeout(() => { sheet.hidden = true; }, 220);
    }
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    document.body.classList.add('sheet-open');
    if (typeof empilharVoltar === 'function') empilharVoltar('sgSheet', fechar);
  }

  // ---------- Montagem e eventos ----------
  function render() {
    const raiz = document.getElementById('sugRaiz');
    if (!raiz || !api()) return;
    raiz.innerHTML = blocoCompreDeNovo() + blocoMinhasListas() + blocoProntas();
  }

  function adicionar(lista, origem) {
    const a = api();
    const novos = lista.filter(it => !a.items().some(x => (x.name || '').trim().toLowerCase() === it.name.trim().toLowerCase())).length;
    lista.forEach(it => a.adicionar(it));
    const n = lista.length;
    toast(n + (n === 1 ? ' item' : ' itens') + ' de "' + origem + '" ' + (novos < n ? 'adicionados (quantidades somadas nos repetidos)' : 'adicionados à lista'),
          'success', 3000, { rotulo: 'Ver lista', aoTocar: () => a.irParaLista() });
    render();
  }

  document.addEventListener('click', async e => {
    const raiz = document.getElementById('sugRaiz');
    if (!raiz || !raiz.contains(e.target)) return;
    const a = api();

    const chip = e.target.closest('[data-novo]');
    if (chip) {
      const nome = chip.dataset.novo; const m = a.suggestions()[nome] || {};
      a.adicionar({ name: cap(nome), category: m.lastCategory || 'Outros', unit: m.lastUnit || 'un', qty: 1, price: Number(m.lastPrice) || 0 });
      chip.classList.add('sg-chip-ok');
      chip.querySelector('.sg-chip-mais').textContent = '✓';
      chip.disabled = true;
      toast(cap(nome) + ' adicionado à lista', 'success', 1800);
      return;
    }

    const pronta = e.target.closest('[data-pronta]');
    if (pronta) {
      const l = LISTAS_PRONTAS.find(x => x.id === pronta.dataset.pronta);
      const itens = l.itens.map(([name, category, unit, qty]) => ({ name, category, unit, qty, price: 0 }));
      abrirPrevia(l.titulo, l.emoji, itens, escolhidos => adicionar(escolhidos, l.titulo));
      return;
    }

    const usar = e.target.closest('[data-usar-minha]');
    if (usar) {
      const l = a.userLists()[Number(usar.dataset.usarMinha)]; if (!l) return;
      const itens = (l.items || []).map(x => ({ name: x.name, category: x.category || 'Outros', unit: x.unit || 'un', qty: Number(x.qty) || 1, price: Number(x.price) || 0 }));
      abrirPrevia(l.name || 'Minha lista', '📋', itens, escolhidos => adicionar(escolhidos, l.name || 'Minha lista'));
      return;
    }

    const del = e.target.closest('[data-del-minha]');
    if (del) {
      const i = Number(del.dataset.delMinha); const l = a.userLists()[i]; if (!l) return;
      if (!await uiConfirm('Excluir a lista "' + (l.name || 'sem nome') + '"?', { okLabel: 'Excluir', danger: true })) return;
      a.removerLista(i); render();
      toast('Lista excluída', 'info', 2500);
      return;
    }

    if (e.target.closest('[data-salvar-atual]')) {
      const nome = await uiPrompt('Dê um nome para esta lista. Ela fica guardada para você repetir a compra.', '', 'Salvar', 'Ex.: Compra do mês');
      if (nome === null) return;
      const n = a.salvarListaAtual(nome.trim() || 'Minha lista');
      render();
      toast('Lista salva com ' + n + (n === 1 ? ' item' : ' itens'), 'success', 2500);
    }
  });

  window.renderSugestoes = render;
  // usada tambem pelo Historico para repetir uma compra
  window.abrirPreviaItens = (titulo, emoji, itens, origem) => abrirPrevia(titulo, emoji, itens, escolhidos => adicionar(escolhidos, origem));
})();
