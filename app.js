// ===== Sistema de Sons =====
// Sons sintetizados na hora (Web Audio): nitidos em qualquer aparelho, sem
// arquivos e sem atraso. Os antigos eram WAV de 8 bits, e "click" e
// "notification" eram arquivos vazios que nao tocavam nada.
const Sons = (() => {
  const CHAVE = 'listou.sons.v1';
  let ligado = true;
  try { ligado = localStorage.getItem(CHAVE) !== '0'; } catch (e) {}
  let ctx = null, mestre = null;

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      // compressor suave: varias notas juntas nunca estouram
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 4;
      mestre = ctx.createGain(); mestre.gain.value = 0.55;
      mestre.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // O navegador so libera audio depois de um toque: prepara no primeiro.
  ['pointerdown', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => { if (ligado) contexto(); }, { once: true, passive: true }));

  // Uma nota com ataque rapido e queda exponencial (som de "gota", nao de buzina).
  function nota(freq, inicio, dur, vol, tipo, deslize) {
    const c = ctx, t = c.currentTime + inicio;
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (deslize) o.frequency.exponentialRampToValueAtTime(deslize, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mestre);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Brilho de sino: fundamental + harmonico agudo bem baixo.
  function sino(freq, inicio, dur, vol) {
    nota(freq, inicio, dur, vol, 'sine');
    nota(freq * 2.01, inicio, dur * 0.6, vol * 0.18, 'sine');
  }

  const efeitos = {
    click:   () => nota(1800, 0, 0.035, 0.05, 'triangle', 1200),
    open:    () => { nota(520, 0, 0.09, 0.07, 'sine', 780); },
    success: () => { sino(880, 0, 0.16, 0.16); sino(1318.5, 0.07, 0.22, 0.13); },          // item adicionado
    check:   () => { nota(660, 0, 0.07, 0.12, 'sine', 990); sino(1318.5, 0.05, 0.2, 0.1); }, // item marcado
    uncheck: () => nota(740, 0, 0.11, 0.09, 'sine', 440),
    delete:  () => { nota(520, 0, 0.14, 0.1, 'triangle', 180); },
    undo:    () => { nota(440, 0, 0.08, 0.08, 'sine', 660); sino(880, 0.06, 0.14, 0.09); },
    error:   () => { nota(330, 0, 0.12, 0.11, 'triangle'); nota(262, 0.13, 0.18, 0.11, 'triangle'); },
    done:    () => [784, 988, 1175, 1568].forEach((f, i) => sino(f, i * 0.07, 0.35, 0.11)),   // lista toda marcada
    complete:() => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => sino(f, i * 0.09, 0.5, 0.12));
                     sino(1568, 0.4, 0.7, 0.07); },                                           // compra concluida
    notification: () => { sino(988, 0, 0.18, 0.12); sino(1318.5, 0.1, 0.25, 0.1); },
  };
  // Vibracao curta acompanha os sons principais (Android).
  const vibracao = { success: 12, check: 10, delete: 18, error: [20, 60, 20], done: [12, 50, 12], complete: [15, 60, 15, 60, 30] };

  function tocar(nome) {
    if (!ligado) return;
    try {
      if (vibracao[nome] && navigator.vibrate) navigator.vibrate(vibracao[nome]);
      if (!efeitos[nome] || !contexto()) return;
      efeitos[nome]();
    } catch (e) {}
  }
  function definir(v) {
    ligado = !!v;
    try { localStorage.setItem(CHAVE, ligado ? '1' : '0'); } catch (e) {}
    if (ligado) tocar('success');
  }
  return { tocar, definir, ligado: () => ligado };
})();

// Função auxiliar para tocar sons
function playSound(soundName) { Sons.tocar(soundName); }

// ===== Números no formato brasileiro =====
// "1.234,56" -> 1234.56 | "24,90" -> 24.9 | "1.5" -> 1.5 | "1.500" -> 1500.
// Antes cada ponto do app fazia replace(',', '.') e "1.234,56" virava 1.234.
function numBR(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  let t = String(v == null ? '' : v).trim().replace(/[^\d.,-]/g, '');
  if (!t) return 0;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

// Exibicao no padrao brasileiro: 1,5 kg e 5,20 (antes aparecia 1.5 e 5.2).
function fmtQtd(v) {
  return numBR(v).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
function fmtPreco(v) {
  const n = numBR(v);
  return n ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
}

// ===== Botão voltar (Android) =====
// Sem isto o voltar do aparelho fechava o app mesmo com a folha, o menu ou uma
// confirmacao abertos. Cada camada aberta empilha uma entrada no historico; o
// voltar fecha a de cima, e so com tudo fechado o app sai.
const pilhaVoltar = [];
let popsIgnorados = 0;
function empilharVoltar(nome, fechar) {
  pilhaVoltar.push({ nome, fechar });
  history.pushState({ listou: nome }, '');
}
// Chamado quando a camada fecha pela propria interface (X, toque fora...).
function desempilharVoltar(nome) {
  let i = -1;
  for (let k = pilhaVoltar.length - 1; k >= 0; k--) if (pilhaVoltar[k].nome === nome) { i = k; break; }
  if (i < 0) return;
  pilhaVoltar.splice(i, 1);
  popsIgnorados++;
  history.back();
}
window.addEventListener('popstate', () => {
  if (popsIgnorados > 0) { popsIgnorados--; return; }
  const topo = pilhaVoltar.pop();
  if (topo) topo.fechar();
});
if (history.state && history.state.listou) history.replaceState(null, '');

// ===== Toasts e diálogos =====
// alert/confirm/prompt nativos aparecem como "localhost diz:" no app empacotado,
// então a UI usa toasts e modais próprios. toast() substitui alert();
// uiConfirm()/uiPrompt() são assíncronos e devolvem Promise.
function toast(message, type = 'info', duration = 3200, acao = null) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
                 '<span class="toast-msg"></span>';
  el.querySelector('.toast-msg').textContent = message;
  if (acao) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toast-acao';
    b.textContent = acao.rotulo;
    b.addEventListener('click', ev => { ev.stopPropagation(); playSound('undo'); acao.aoTocar(); el.remove(); });
    el.appendChild(b);
  }
  host.appendChild(el);
  const visiveis = host.querySelectorAll('.toast:not(.leaving)');
  if (visiveis.length > 2) visiveis[0].remove();
  const remove = () => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 200);
  };
  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// Modal genérico. Resolve com o valor de confirmação (ou null se cancelado).
function openModal({ message, okLabel = 'OK', cancelLabel = 'Cancelar', danger = false, input = null, placeholder = '' }) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal-box" role="dialog" aria-modal="true">' +
        '<div class="modal-msg"></div>' +
        (input === null ? '' : '<input class="modal-input" type="text">') +
        '<div class="modal-actions">' +
          '<button type="button" class="modal-cancel"></button>' +
          '<button type="button" class="modal-ok' + (danger ? ' danger' : '') + '"></button>' +
        '</div>' +
      '</div>';
    backdrop.querySelector('.modal-msg').textContent = message;
    backdrop.querySelector('.modal-cancel').textContent = cancelLabel;
    backdrop.querySelector('.modal-ok').textContent = okLabel;
    const field = backdrop.querySelector('.modal-input');
    if (field) { field.value = input; field.placeholder = placeholder; }

    const close = value => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      desempilharVoltar('modal');
      resolve(value);
    };
    const onKey = e => {
      if (e.key === 'Escape') close(input === null ? false : null);
      if (e.key === 'Enter' && field) close(field.value);
    };
    backdrop.querySelector('.modal-ok').addEventListener('click', () =>
      close(input === null ? true : field.value));
    backdrop.querySelector('.modal-cancel').addEventListener('click', () =>
      close(input === null ? false : null));
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) close(input === null ? false : null);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(backdrop);
    empilharVoltar('modal', () => close(input === null ? false : null));
    (field || backdrop.querySelector('.modal-ok')).focus();
  });
}

function uiConfirm(message, { okLabel = 'Confirmar', danger = false } = {}) {
  return openModal({ message, okLabel, danger });
}

function uiPrompt(message, defaultValue = '', okLabel = 'Salvar', placeholder = '') {
  return openModal({ message, okLabel, input: defaultValue, placeholder });
}


// ===== Sistema de Controle de Versão e Atualização Automática =====
(function() {
  const CURRENT_VERSION = '1.0.1';
  const VERSION_KEY = 'listou.app.version';
  
  // Verificar se é uma nova versão
  const savedVersion = localStorage.getItem(VERSION_KEY);
  
  if (savedVersion !== CURRENT_VERSION) {
    console.log(`[App] Atualização detectada: ${savedVersion} -> ${CURRENT_VERSION}`);
    
    // Limpar cache do navegador
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (key.startsWith('listou-') && key !== `listou-v${CURRENT_VERSION}`) {
            console.log(`[App] Limpando cache antigo: ${key}`);
            caches.delete(key);
          }
        });
      });
    }
    
    // Atualizar versão salva
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    
    // Exibir versão nos elementos da página
    setTimeout(() => {
      document.querySelectorAll('#appVersion, #appVersionSide, #appVersionTop').forEach(el => {
        if (el) el.textContent = CURRENT_VERSION;
      });
    }, 100);
    
    console.log(`[App] App atualizado para versão ${CURRENT_VERSION}`);
  } else {
    // Exibir versão nos elementos da página
    setTimeout(() => {
      document.querySelectorAll('#appVersion, #appVersionSide, #appVersionTop').forEach(el => {
        if (el) el.textContent = CURRENT_VERSION;
      });
    }, 100);
  }
})();

// Importação automática de lista compartilhada via URL (?lista=... ou ?l=...)
(function () {
  const params = new URLSearchParams(window.location.search);
  // Formato novo comprimido (?l=...)
  if (params.has('l')) {
    try {
      const compressed = params.get('l');
      const decompressed = LZString?.decompressFromEncodedURIComponent(compressed);
      if (decompressed) {
        const minimalData = JSON.parse(decompressed);
        // Expandir dados minimizados
        const lista = minimalData.map(i => ({
          name: i.n,
          category: i.c,
          unit: i.u || 'un',
          qty: i.q || 1,
          price: i.p || 0,
          done: false,
          createdAt: Date.now()
        }));
        if (Array.isArray(lista) && lista.length) {
          localStorage.setItem('listou.items.v3', JSON.stringify(lista));
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => toast('Lista de compras importada com sucesso!', 'success'), 300);
          if (typeof render === 'function') render();
        }
      }
    } catch (e) {
      console.error('Erro ao importar lista comprimida:', e);
    }
  }
  // Formato antigo (?lista=...)
  else if (params.has('lista')) {
    try {
      const lista = JSON.parse(decodeURIComponent(params.get('lista')));
      if (Array.isArray(lista) && lista.length) {
        localStorage.setItem('listou.items.v3', JSON.stringify(lista));
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => toast('Lista de compras importada com sucesso!', 'success'), 300);
        if (typeof render === 'function') render();
      }
    } catch (e) {
      toast('Não foi possível importar a lista compartilhada.', 'error');
    }
  }
})();
// Adiciona blur na main quando sidebar está aberta no mobile
document.addEventListener('DOMContentLoaded', function() {
  var sidebar = document.getElementById('sidebar');
  var toggleSidebar = document.getElementById('toggleSidebar');
  var closeSidebar = document.getElementById('closeSidebar');
  if (toggleSidebar) {
    toggleSidebar.addEventListener('click', function() {
      sidebar.classList.remove('hidden');
      document.body.classList.add('sidebar-open');
      if (closeSidebar) closeSidebar.classList.remove('hidden');
    });
  }
  if (closeSidebar) {
    closeSidebar.addEventListener('click', function() {
      sidebar.classList.add('hidden');
      document.body.classList.remove('sidebar-open');
      closeSidebar.classList.add('hidden');
    });
  }
  // O fechamento por clique fora fica a cargo do handler da barra inferior.
});
  // Função para limpar todos os dados do usuário
  async function clearAllUserData() {
    if (await uiConfirm('Tem certeza que deseja remover todos os dados? Esta ação não pode ser desfeita.', { okLabel: 'Remover tudo', danger: true })) {
      localStorage.clear();
      location.reload();
    }
  }

(function(){
// Botão de tema na seção histórico
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('themeToggleHistorico');
  if (btn) btn.addEventListener('click', toggleTheme);
});
  'use strict';
    // ===== Histórico de Compras =====
    // Compras agrupadas por mes, do mais recente para o mais antigo.
    // "Repetir" abre a mesma folha de escolha das listas prontas; antes, "Usar"
    // trocava a lista inteira e trazia os itens ja marcados como comprados.
    function renderHistorico() {
      const list = document.getElementById('historicoList');
      const vazio = document.getElementById('historicoVazio');
      const resumo = document.getElementById('histResumo');
      if (!list || !vazio) return;
      const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const totalDe = h => (h.items || []).reduce((s2, it) => s2 + numBR(it.qty) * numBR(it.price), 0);

      if (!history.length) {
        list.innerHTML = '';
        vazio.hidden = false;
        if (resumo) resumo.hidden = true;
        return;
      }
      vazio.hidden = true;

      const ordenado = history.slice().sort((a, b) => (b.at || 0) - (a.at || 0));
      const geral = ordenado.reduce((s2, h) => s2 + totalDe(h), 0);
      if (resumo) {
        resumo.hidden = false;
        resumo.innerHTML = '<div><b>' + ordenado.length + '</b><span>' + (ordenado.length === 1 ? 'compra' : 'compras') + '</span></div>'
          + '<div><b>' + money(geral) + '</b><span>gasto no total</span></div>'
          + '<div><b>' + money(geral / ordenado.length) + '</b><span>por compra</span></div>';
      }

      const grupos = [];
      ordenado.forEach(h => {
        const d = new Date(h.at);
        const chave = isNaN(d) ? 'sem-data' : d.getFullYear() + '-' + d.getMonth();
        let g = grupos.find(x => x.chave === chave);
        if (!g) {
          const rot = isNaN(d) ? 'Sem data' : d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          g = { chave, rotulo: rot.charAt(0).toUpperCase() + rot.slice(1), itens: [], total: 0 };
          grupos.push(g);
        }
        g.itens.push(h); g.total += totalDe(h);
      });

      list.innerHTML = grupos.map(g => `
        <li class="hs-grupo">
          <div class="hs-mes"><span>${esc(g.rotulo)}</span><b>${money(g.total)}</b></div>
          <div class="hs-cartoes">${g.itens.map(h => {
            const d = new Date(h.at);
            const hora = isNaN(d) ? '' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dia = isNaN(d) ? '' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).replace('.', '');
            const mercado = h.market || h.mercado || '';
            const titulo = h.name || (mercado ? 'Compra no ' + mercado : 'Compra');
            const n = (h.items || []).length;
            const previa = (h.items || []).slice(0, 4).map(i => esc(i.name)).join(', ') + (n > 4 ? ' e mais ' + (n - 4) : '');
            return `<div class="hs-card">
              <div class="hs-dia"><b>${isNaN(d) ? '—' : d.getDate()}</b><span>${isNaN(d) ? '' : esc(dia.split(' ')[0].replace(/[.,]/g, ''))}</span></div>
              <div class="hs-info">
                <div class="hs-topo"><b>${esc(titulo)}</b><em>${money(totalDe(h))}</em></div>
                <span class="hs-meta">${n} ${n === 1 ? 'item' : 'itens'}${h.name && mercado ? ' · ' + esc(mercado) : ''}${hora && hora !== '00:00' ? ' · ' + hora : ''}</span>
                <span class="hs-previa">${previa}</span>
                <div class="hs-acoes">
                  <button class="hs-repetir" data-restore="${esc(h.id)}">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>
                    Repetir compra</button>
                  <button class="hs-excluir" data-del-hist="${esc(h.id)}" aria-label="Excluir do histórico">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </div>
            </div>`;
          }).join('')}</div>
        </li>`).join('');

      list.querySelectorAll('button[data-del-hist]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-del-hist');
          const pos = history.findIndex(h => h.id === id);
          if (pos < 0) return;
          if (!await uiConfirm('Excluir esta compra do histórico? Ela deixa de contar nos relatórios.', { okLabel: 'Excluir', danger: true })) return;
          const [removida] = history.splice(pos, 1);
          save(); renderHistorico(); renderReports();
          toast('Compra excluída', 'info', 5000, { rotulo: 'Desfazer',
            aoTocar: () => { history.splice(pos, 0, removida); save(); renderHistorico(); renderReports(); } });
        });
      });
      list.querySelectorAll('button[data-restore]').forEach(btn => {
        btn.addEventListener('click', () => {
          const h = history.find(x => x.id === btn.getAttribute('data-restore'));
          if (!h || !window.abrirPreviaItens) return;
          const itens = (h.items || []).map(i => ({ name: i.name, category: i.category || 'Outros', unit: i.unit || 'un',
                                                    qty: numBR(i.qty) || 1, price: numBR(i.price), done: false }));
          const titulo = h.name || ((h.market || h.mercado) ? 'Compra no ' + (h.market || h.mercado) : 'Compra');
          window.abrirPreviaItens(titulo, '🧾', itens, titulo);
        });
      });
    }

  // ===== Utilitários =====
  const K = {
    ITEMS: 'listou.items.v3',
    HISTORY: 'listou.history.v2',
    SUG: 'listou.suggestions.v1',
    PRICEH: 'listou.pricehist.v1',
    USERLISTS: 'listou.userlists.v1',
    MARKET: 'listou.market.v1',
    THEME: 'listou.theme.v1',
    PRODUCTS: 'listou.products.v1'
  };

  const $ = (sel)=>document.querySelector(sel);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));
  const money = (n)=> (Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const genId = ()=> (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

  // ===== Estado =====
  let items = JSON.parse(localStorage.getItem(K.ITEMS) || '[]');
  let history = JSON.parse(localStorage.getItem(K.HISTORY) || '[]');
  let suggestions = JSON.parse(localStorage.getItem(K.SUG) || '{}');
  let priceHistory = JSON.parse(localStorage.getItem(K.PRICEH) || '{}');
  let userLists = JSON.parse(localStorage.getItem(K.USERLISTS) || '[]');
  let currentMarket = (localStorage.getItem(K.MARKET) || '').trim();
  let customProducts = JSON.parse(localStorage.getItem(K.PRODUCTS) || '[]');

  function save(){
    localStorage.setItem(K.ITEMS, JSON.stringify(items));
    localStorage.setItem(K.HISTORY, JSON.stringify(history));
    localStorage.setItem(K.SUG, JSON.stringify(suggestions));
    localStorage.setItem(K.PRICEH, JSON.stringify(priceHistory));
    localStorage.setItem(K.USERLISTS, JSON.stringify(userLists));
    localStorage.setItem(K.MARKET, currentMarket || '');
    localStorage.setItem(K.PRODUCTS, JSON.stringify(customProducts));
  }

  // ===== Theme Management =====
  let currentTheme = localStorage.getItem(K.THEME) || 'dark';
  
  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(K.THEME, theme);
    updateThemeLabel();
  }
  
  function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Os graficos guardam as cores de quando foram criados: refaz com o tema novo.
    if (window.aplicarTemaGraficos) {
      window.aplicarTemaGraficos();
      try { renderInsights(); renderReports(); } catch (e) {}
    }
    
    // Add spin animation to theme icon
    const themeIcon = $('#themeIcon');
    if (themeIcon) {
      themeIcon.classList.add('spin');
      setTimeout(() => themeIcon.classList.remove('spin'), 300);
    }
  }
  
  function updateThemeLabel() {
    document.querySelectorAll('[data-tema]').forEach(b =>
      b.setAttribute('aria-checked', String(b.getAttribute('data-tema') === currentTheme)));
    document.getElementById('cfSons')?.setAttribute('aria-checked', String(Sons.ligado()));
  }
  document.addEventListener('click', e => {
    const sw = e.target.closest('#cfSons');
    if (sw) { Sons.definir(!Sons.ligado()); sw.setAttribute('aria-checked', String(Sons.ligado())); return; }
    const b = e.target.closest('[data-tema]');
    if (b && b.getAttribute('data-tema') !== currentTheme) toggleTheme();
  });
  
  // Initialize theme
  setTheme(currentTheme);
        // ===== Sugestão "leitura de pensamento" =====
        renderMindReadingSuggestions();

  // ===== Tabs =====
  // Adiciona evento ao botão de limpar dados
  window.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('clearAllData');
    if(btn) btn.addEventListener('click', clearAllUserData);
    
    // Theme toggle buttons
    const themeToggle = document.getElementById('themeToggle');
    const themeToggle2 = document.getElementById('themeToggle2');
    if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if(themeToggle2) themeToggle2.addEventListener('click', toggleTheme);
  });
  function setTab(id){
    if (id !== 'lista' && !pilhaVoltar.some(o => o.nome === 'aba')) empilharVoltar('aba', () => irParaAba('lista'));
    if (id === 'lista') desempilharVoltar('aba');
    $$('.tab-section').forEach(s=>s.classList.add('hidden'));
    const sec = $('#tab-'+id);
    sec?.classList.remove('hidden');
    $$('#bottomNav .bnav-item').forEach(b =>
      b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === id)));
    $$('.tab-btn').forEach(b =>
      b.classList.toggle('tab-btn-active', b.getAttribute('data-tab') === id));
    if (!sec) return;
    // Os gráficos nascem com a aba ainda em display:none, quando o container
    // mede 0px, e o Chart.js não se reajusta sozinho ao reaparecer. Recalcular
    // aqui também garante que os dados refletem a lista atual.
    if (id === 'insights') renderInsights();
    if (id === 'relatorios') renderReports();
    if (id === 'sugestoes' && window.renderSugestoes) window.renderSugestoes();
    if (id === 'config') renderResumoDados();
    if (window.Chart) {
      requestAnimationFrame(()=> sec.querySelectorAll('canvas').forEach(c => {
        const chart = Chart.getChart(c);
        if (chart) chart.resize();
      }));
    }
  }
  $$('.tab-btn').forEach(btn=>btn.addEventListener('click', ()=> {
    setTab(btn.getAttribute('data-tab'));
    // Esconde a sidebar em telas pequenas
    const sidebar = $('#sidebar');
    const toggleSidebarBtn = $('#toggleSidebar');
    const closeSidebarBtn = $('#closeSidebar');
    if(sidebar && window.innerWidth < 900) {
      sidebar.classList.add('hidden');
      document.body.classList.remove('sidebar-open');
      if (closeSidebarBtn) closeSidebarBtn.classList.add('hidden');
      if (toggleSidebarBtn) toggleSidebarBtn.style.display = '';
      desempilharVoltar('menu');
    }
    // Alterna exibição da seção Histórico (agora no main)
    if (btn.getAttribute('data-tab') === 'historico') {
      renderHistorico();
    }
  }));
  // A barra inferior delega no botao equivalente da sidebar, que ja tem toda a logica.
  $$('#bottomNav .bnav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => {
      const alvo = $$('.tab-btn').find(b => b.getAttribute('data-tab') === item.getAttribute('data-tab'));
      if (alvo) alvo.click(); else setTab(item.getAttribute('data-tab'));
    });
  });
  // Resumo do que esta guardado no aparelho, na aba Ajustes.
  function renderResumoDados(){
    const box = $('#cfDados'); if (!box) return;
    const n = (v, um, varios) => v + ' ' + (v === 1 ? um : varios);
    box.innerHTML = [
      [items.length, 'item na lista', 'itens na lista'],
      [history.length, 'compra no histórico', 'compras no histórico'],
      [customProducts.length, 'produto cadastrado', 'produtos cadastrados'],
      [userLists.length, 'lista salva', 'listas salvas'],
    ].map(([v, um, varios]) => '<div><b>' + v + '</b><span>' + n(v, um, varios).replace(/^\d+ /, '') + '</span></div>').join('');
  }

  // Ponte para painel.js (Insights e Relatorios).
  window.__listouDados = { items: () => items, history: () => history, priceHistory: () => priceHistory };

  // Ponte para sugestoes.js: le os dados atuais e usa as mesmas acoes da lista.
  window.__listouSug = {
    items: () => items,
    suggestions: () => suggestions,
    userLists: () => userLists,
    adicionar: it => upsertItem(Object.assign({}, it)),
    removerLista: i => { userLists.splice(i, 1); save(); },
    salvarListaAtual: nome => {
      const copia = items.map(i => ({ name: i.name, category: i.category, unit: i.unit, qty: numBR(i.qty) || 1, price: numBR(i.price) }));
      userLists.unshift({ name: nome, items: copia, at: Date.now() });
      save();
      return copia.length;
    },
    irParaLista: () => irParaAba('lista'),
  };

  // Volta para uma aba passando pelo mesmo caminho do toque no menu.
  function irParaAba(id){
    const alvo = $$('.tab-btn').find(b => b.getAttribute('data-tab') === id);
    if (alvo) alvo.click(); else setTab(id);
  }
  // "Mais" abre a sidebar, onde ficam as abas que nao couberam na barra.
  function abrirMenu(){
    const sb = $('#sidebar');
    if (!sb) return;
    if (!sb.classList.contains('hidden')) return;
    sb.classList.remove('hidden');
    document.body.classList.add('sidebar-open');
    $('#closeSidebar')?.classList.remove('hidden');
    empilharVoltar('menu', fecharMenu);
  }
  function fecharMenu(){
    const sb = $('#sidebar');
    if (!sb) return;
    sb.classList.add('hidden');
    document.body.classList.remove('sidebar-open');
    desempilharVoltar('menu');
  }
  $('#bnavMore')?.addEventListener('click', () => { playSound('click'); abrirMenu(); });
  $('#closeSidebar')?.addEventListener('click', fecharMenu);
  // Tocar fora do drawer fecha, como se espera de um menu lateral.
  document.addEventListener('click', e => {
    if (!document.body.classList.contains('sidebar-open')) return;
    if (e.target.closest('#sidebar') || e.target.closest('#bnavMore')) return;
    fecharMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

  // Folha de novo item: o formulario so ocupa a tela quando e chamado.
  const addSheet = $('#addSheet');
  function abrirSheet(){
    if (!addSheet || addSheet.classList.contains('is-open')) return;
    addSheet.hidden = false;
    empilharVoltar('sheet', fecharSheet);
    requestAnimationFrame(()=> addSheet.classList.add('is-open'));
    document.body.classList.add('sheet-open');
    // Sem foco automatico: ele abriria a lista de sugestoes por cima do formulario.
  }
  function fecharSheet(){
    if (!addSheet || !addSheet.classList.contains('is-open')) return;
    addSheet.classList.remove('is-open');
    desempilharVoltar('sheet');
    document.body.classList.remove('sheet-open');
    window.limparRecentesFolha && window.limparRecentesFolha();
    // espera a animacao antes de tirar do fluxo
    setTimeout(()=> { addSheet.hidden = true; }, 220);
  }
  $('#fabAdd')?.addEventListener('click', ()=> { playSound('open'); abrirSheet(); });
  addSheet?.querySelectorAll('[data-close-sheet]').forEach(el =>
    el.addEventListener('click', fecharSheet));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && addSheet && !addSheet.hidden) fecharSheet();
  });
  window.fecharSheetNovoItem = fecharSheet;

  // O botao de tema da barra superior faz o mesmo que o da sidebar.
  $('#themeToggleTop')?.addEventListener('click', toggleTheme);

  // Os graficos vinham com as cores padrao do Chart.js, que destoavam do app.
  // Aqui eles passam a ler a paleta e a fonte do tema atual.
  function aplicarTemaGraficos(){
    if (!window.Chart) return;
    const css = getComputedStyle(document.documentElement);
    const tok = n => css.getPropertyValue(n).trim();
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = tok('--ink-3');
    Chart.defaults.borderColor = tok('--line');
    Chart.defaults.plugins.legend.labels.color = tok('--ink-2');
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.backgroundColor = tok('--s2');
    Chart.defaults.plugins.tooltip.titleColor = tok('--ink');
    Chart.defaults.plugins.tooltip.bodyColor = tok('--ink-2');
    Chart.defaults.plugins.tooltip.borderColor = tok('--line-strong');
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.displayColors = false;
    // Paleta usada quando o grafico nao define cor propria.
    const paleta = [tok('--brand'), tok('--info'), '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
    Chart.defaults.datasets.bar.backgroundColor = paleta[0];
    Chart.defaults.datasets.bar.borderRadius = 8;
    Chart.defaults.datasets.bar.borderSkipped = false;
    Chart.defaults.datasets.bar.maxBarThickness = 46;
    Chart.defaults.datasets.line.borderColor = paleta[0];
    Chart.defaults.datasets.line.backgroundColor = tok('--brand-soft');
    Chart.defaults.datasets.line.pointBackgroundColor = paleta[0];
    Chart.defaults.datasets.line.pointRadius = 3;
    Chart.defaults.datasets.line.fill = true;
    Chart.defaults.datasets.doughnut.backgroundColor = paleta;
    Chart.defaults.datasets.doughnut.borderColor = tok('--s1');
    Chart.defaults.datasets.doughnut.borderWidth = 2;
    Chart.defaults.scale.grid.color = tok('--line');
    Chart.defaults.scale.grid.drawTicks = false;
    Chart.defaults.scale.border.display = false;
    Chart.defaults.scale.ticks.padding = 6;
  }
  aplicarTemaGraficos();
  window.aplicarTemaGraficos = aplicarTemaGraficos;


  setTab('lista');

    // Sidebar mobile
  const toggleSidebarBtn = $('#toggleSidebar');
  const closeSidebarBtn = $('#closeSidebar');
  const sidebar = $('#sidebar');

  function updateSidebarButtons() {
    if (!sidebar) return;
    if (window.innerWidth < 900) {
      if (sidebar.classList.contains('hidden')) {
        if (toggleSidebarBtn) toggleSidebarBtn.style.display = '';
        if (closeSidebarBtn) closeSidebarBtn.classList.add('hidden');
      } else {
        if (toggleSidebarBtn) toggleSidebarBtn.style.display = 'none';
        if (closeSidebarBtn) closeSidebarBtn.classList.remove('hidden');
      }
    } else {
      if (toggleSidebarBtn) toggleSidebarBtn.style.display = '';
      if (closeSidebarBtn) closeSidebarBtn.classList.add('hidden');
    }
  }

  toggleSidebarBtn?.addEventListener('click', ()=> {
    if (sidebar) {
      sidebar.classList.toggle('hidden');
      setTimeout(updateSidebarButtons, 10);
    }
  });
  closeSidebarBtn?.addEventListener('click', ()=> {
    if (sidebar) {
      sidebar.classList.add('hidden');
      setTimeout(updateSidebarButtons, 10);
    }
  });
  window.addEventListener('resize', updateSidebarButtons);
  // Inicializa estado correto dos botões
  updateSidebarButtons();


  // ===== Gradiente por categoria dominante =====
  const CAT_GRADS = {
    'Mercearia':['#34d399','#065f46'],
    'Laticínios':['#93c5fd','#1e3a8a'],
    'Hortifruti':['#86efac','#14532d'],
    'Limpeza':['#c4b5fd','#4c1d95'],
    'Higiene':['#fca5a5','#7f1d1d'],
    'Bebidas':['#fcd34d','#92400e'],
    'Carnes':['#fda4af','#7f1d1d'],
    'Outros':['#94a3b8','#0f172a']
  };
  function dominantCategory(){
    if(!items.length) return null;
    const totals = {};
    items.forEach(i=>{
      const k=i.category||'Outros';
      totals[k]=(totals[k]||0)+ (Number(i.qty)||0)*(Number(i.price)||0);
    });
    return Object.keys(totals).sort((a,b)=>totals[b]-totals[a])[0] || 'Outros';
  }
  function updateGradient(){ /* tema estável: usa --bg vars do tema */ }

  // ===== ZXing (scanner) =====
  // Seção de scanner removida

  // ===== Aprendizado e sugestões =====
  function learnFromItem(it){
    if(!it.name) return;
    const key = it.name;
    const s = suggestions[key] || { count:0 };
    s.count = (s.count||0)+1;
    s.lastPrice = it.price;
    s.lastCategory = it.category;
    s.lastUnit = it.unit;
    s.exampleBarcode = it.barcode || s.exampleBarcode || null;
    s.lastAt = Date.now();
    suggestions[key] = s; save(); renderQuickChips();
  }

  function scoreSuggestion(name, meta){
    let s = 0;
    s += (meta.count||0) * 3;
    if(meta.lastPrice>0) s += 2;
    if(meta.lastAt){ const days = (Date.now()-meta.lastAt)/86400000; s += Math.max(0, 5 - Math.min(5, Math.floor(days))); }
    if(priceHistory[name] && currentMarket && priceHistory[name][currentMarket]) s += 2;
    return s;
  }
  function renderQuickChips(){
    const entries = Object.entries(suggestions)
      .map(([n,m])=>[n,m,scoreSuggestion(n,m)])
      .sort((a,b)=>b[2]-a[2])
      .slice(0,8);
    const wrap = $('#quickChips'); if(!wrap) return; wrap.innerHTML='';
    entries.forEach(([rawName, meta])=>{
      const displayName = (window.__RUNNING_TESTS? rawName : rawName.replace(/^\s*(Teste|DEV|TMP)\s+/i,''));
      const hint = meta.lastPrice? (' • '+money(meta.lastPrice)) : '';
      const card = document.createElement('div');
      card.className = 'suggestion-card flex flex-col gap-1 p-2 mb-2 rounded shadow';
      card.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="font-medium flex-1">${displayName}</span>
          <button class="edit-btn" title="Editar">✏️</button>
          <button class="remove-btn" title="Remover">🗑️</button>
        </div>
        <div class="list-meta text-xs">${(meta.lastUnit||'un')} • ${(meta.lastCategory||'Outros')} ${hint}</div>
        <div class="suggest-actions flex gap-2 mt-1">
          <button class="save-btn">Adicionar</button>
        </div>
      `;
      // Adicionar evento de adicionar
      card.querySelector('.save-btn').onclick = ()=> upsertItem({ name:rawName, category: meta.lastCategory||'Outros', unit: meta.lastUnit||'un', qty: 1, price: meta.lastPrice||0 });
      // Evento de remover sugestão
      card.querySelector('.remove-btn').onclick = async ()=> {
        if (await uiConfirm('Remover sugestão?', { okLabel: 'Remover', danger: true })) {
          delete suggestions[rawName];
          save();
          renderQuickChips();
        }
      };
      // Evento de editar sugestão
      card.querySelector('.edit-btn').onclick = ()=> {
        // Troca para modo edição inline
        card.innerHTML = `
          <div class="flex items-center gap-2">
            <input type="text" class="w-32" value="${displayName}" id="editName">
            <input type="text" class="w-12" value="${meta.lastUnit||'un'}" id="editUnit">
            <input type="text" class="w-20" value="${meta.lastCategory||'Outros'}" id="editCategory">
            <input type="number" class="w-20" value="${meta.lastPrice||0}" id="editPrice" min="0" step="0.01">
          </div>
          <div class="suggest-actions flex gap-2 mt-1">
            <button class="save-btn">Salvar</button>
            <button class="cancel-btn">Cancelar</button>
          </div>
        `;
        card.querySelector('.save-btn').onclick = ()=> {
          const newName = card.querySelector('#editName').value.trim();
          const newUnit = card.querySelector('#editUnit').value.trim();
          const newCat = card.querySelector('#editCategory').value.trim();
          const newPrice = Number(card.querySelector('#editPrice').value);
          if(!newName) return toast('Nome obrigatório', 'error');
          // Atualiza sugestão
          delete suggestions[rawName];
          suggestions[newName] = { lastUnit: newUnit, lastCategory: newCat, lastPrice: newPrice };
          save();
          renderQuickChips();
        };
        card.querySelector('.cancel-btn').onclick = ()=> renderQuickChips();
      };
      wrap.appendChild(card);
    });
  }

  // Sugestões de digitação
  const nameInput = $('#name');
  nameInput?.addEventListener('focus', (e)=> { if (e.target.value.trim()) showSuggestions(e.target.value); });
  nameInput?.addEventListener('input', (e)=> { showSuggestions(e.target.value); mostrarCategoriaAuto(); });
  document.addEventListener('click', (e)=>{ const box=$('#suggestions'); const nm=$('#name'); if(box && !box.contains(e.target) && e.target!==nm) box.classList.add('hidden'); });
  function showSuggestions(query){
    const box = $('#suggestions'); if(!box) return;
    const q = (query||'').toLowerCase();
    // Catálogo fixo de produtos populares
    const catalogo = [
      'Arroz', 'Feijão', 'Açúcar', 'Café', 'Leite', 'Óleo', 'Sal', 'Macarrão', 'Farinha de trigo', 'Farinha de mandioca',
      'Pão', 'Manteiga', 'Margarina', 'Queijo', 'Presunto', 'Frango', 'Carne bovina', 'Carne suína', 'Peito de frango',
      'Ovos', 'Batata', 'Cebola', 'Alho', 'Tomate', 'Alface', 'Cenoura', 'Refrigerante', 'Suco', 'Água mineral',
      'Cerveja', 'Vinho', 'Sabonete', 'Shampoo', 'Condicionador', 'Papel higiênico', 'Detergente', 'Sabão em pó',
      'Desinfetante', 'Amaciante', 'Escova de dente', 'Creme dental', 'Desodorante', 'Fralda', 'Absorvente', 'Biscoito',
      'Chocolate', 'Iogurte', 'Maionese', 'Ketchup', 'Mostarda', 'Molho de tomate', 'Milho', 'Ervilha', 'Atum', 'Sardinha',
      'Massa de tomate', 'Picles', 'Azeite', 'Vinagre', 'Chá', 'Granola', 'Aveia', 'Leite condensado', 'Creme de leite',
      'Gelatina', 'Pudim', 'Sorvete', 'Pizza', 'Hambúrguer', 'Salsicha', 'Mortadela', 'Peito de peru', 'Peixe', 'Camarão',
      'Laranja', 'Banana', 'Maçã', 'Uva', 'Pera', 'Abacaxi', 'Melancia', 'Mamão', 'Limão', 'Morango', 'Coco', 'Abacate',
      'Requeijão', 'Ricota', 'Cream cheese', 'Molho inglês', 'Molho shoyu', 'Molho pimenta', 'Tempero pronto', 'Caldo de galinha',
      'Caldo de carne', 'Fermento', 'Leite em pó', 'Leite fermentado', 'Bebida láctea', 'Cereal', 'Barra de cereal', 'Granulado',
      'Leite vegetal', 'Tofu', 'Hambúrguer vegetal', 'Proteína de soja', 'Quinoa', 'Chia', 'Linhaça', 'Castanha', 'Nozes', 'Amêndoas'
    ];
    // Produtos cadastrados filtrados (prioridade máxima)
    const customSugs = customProducts
      .filter(p=> !q || p.name.toLowerCase().includes(q))
      .map(p => ({ name: p.name, meta: { lastUnit: p.unit, lastCategory: p.category, lastPrice: p.price, brand: p.brand }, isCustom: true }));
    // Sugestões do usuário filtradas
    const userSugs = Object.keys(suggestions)
      .filter(n=> !/^\s*(teste|dev|tmp)\b/i.test(n))
      .filter(n=> !q || n.toLowerCase().includes(q))
      .map(n => ({ name: n, meta: suggestions[n] || {}, isCustom: false }));
    // Catálogo filtrado
    const catSugs = catalogo
      .filter(n=> !q || n.toLowerCase().includes(q))
      .map(n => ({ name: n, meta: {}, isCustom: false }));
    // Unir (produtos customizados primeiro) e limitar sugestões
    const all = [...customSugs, ...userSugs, ...catSugs].slice(0, 20);
    box.innerHTML='';
    if(!all.length){ box.classList.add('hidden'); return; }
    all.forEach(item=>{
      const n = item.name;
      const m = item.meta;
      const isCustom = item.isCustom;
      const display = n;
      const row = document.createElement('button'); row.type='button';
      row.className='w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2';
      const badge = isCustom ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-600/80 text-white ml-1">★</span>' : '';
      const brandInfo = m.brand ? ' • ' + m.brand : '';
      const catSug = m.lastCategory || suggestCategory(n) || 'Outros';
      const precoSug = Number(m.lastPrice) > 0 ? ' • ' + money(m.lastPrice) : '';
      row.innerHTML = '<span class="font-medium">'+display+badge+'</span><span class="text-[11px] muted">'+catSug+brandInfo+precoSug+'</span>';
      row.addEventListener('click', ()=>{
        $('#name').value = n;
        $('#category').value = catSug;
        $('#unit').value = m.lastUnit || 'un';
        if (Number(m.lastPrice) > 0) $('#price').value = String(m.lastPrice).replace('.', ',');
        box.classList.add('hidden');
        mostrarCategoriaAuto();
        $('#qty')?.focus();
      });
      box.appendChild(row);
    });
    box.classList.remove('hidden');
  }

  // ===== CRUD Lista =====
  const listEl = $('#list');

  
function upsertItem(partial){
      // Merge por nome (case-insensitive)
      if(partial && partial.name){
        var normName = (partial.name||'').trim().toLowerCase();
        var e = items.find(function(i){ return (i.name||'').trim().toLowerCase() === normName; });
        if(e){
          // Se já existe, soma a quantidade
          let addQty = Number(partial.qty) || 1;
          e.qty = (Number(e.qty) || 0) + addQty;
          if(Number(partial.price) > 0) e.price = partial.price;
          if(partial.category && !e.category) e.category = partial.category;
          if(partial.unit && !e.unit) e.unit = partial.unit;
          render(); return;
        }
      }
      // Merge by same name (case-insensitive) and same price
      var normName = (partial.name||'').trim().toLowerCase();
      var price = Number(partial.price||0);
      var same = items.find(function(i){
        return (i.name||'').trim().toLowerCase()===normName && Number(i.price||0)===price;
      });
      if(same){
        // Se já existe, soma a quantidade
        let addQty = Number(partial.qty) || 1;
        same.qty = (Number(same.qty) || 0) + addQty;
        if(partial.category && !same.category) same.category = partial.category;
        if(partial.unit && !same.unit) same.unit = partial.unit;
        render(); return;
      }
      var obj = { name:'', category:'Outros', unit:'un', qty:1, price:0, done:false, createdAt:Date.now() };
      for(var k in partial){ if(Object.prototype.hasOwnProperty.call(partial,k)) obj[k]=partial[k]; }
      items.unshift(obj);
    learnFromItem(obj);
    render();
  }

  function trackPriceForHistory(it){
    if(!currentMarket) return;
  const key = it.name || '—';
    priceHistory[key] = priceHistory[key] || {};
    priceHistory[key][currentMarket] = priceHistory[key][currentMarket] || [];
    const arr = priceHistory[key][currentMarket];
    const now = Date.now();
    const last = arr[arr.length-1];
    const price = Number(it.price)||0;
    const sameDay = (ts)=>{ const d1=new Date(ts), d2=new Date(now); return d1.getFullYear()==d2.getFullYear() && d1.getMonth()==d2.getMonth() && d1.getDate()==d2.getDate(); };
    if(!last || last.price !== price || !sameDay(last.at)){ arr.push({ at: now, price }); }
  }

  // Itens com os campos de edicao abertos (por nome, que sobrevive ao re-render).
  const expandidos = new Set();
  function render(){
  const sortSel = $('#sort'); const sort = sortSel ? sortSel.value : 'recent';
    const catSel = $('#categoryFilter');
    // Gera lista de categorias presentes
    const categoriasPresentes = Array.from(new Set(items.map(i => i.category || 'Outros')));
    // Atualiza opções do filtro de categoria
    if (catSel) {
      const catAtual = catSel.value;
      catSel.innerHTML = '<option value="">Todas as categorias</option>' +
        categoriasPresentes.map(cat => `<option value="${cat}">${cat}</option>`).join('');
      // Mantém seleção se possível
      if (categoriasPresentes.includes(catAtual)) catSel.value = catAtual;
    }
    const catFilter = catSel ? catSel.value : '';
  // Separar itens não comprados e comprados, filtrando por categoria se necessário
  let notDone = items.filter(i => !i.done && (!catFilter || (i.category||'Outros') === catFilter));
  let done = items.filter(i => i.done && (!catFilter || (i.category||'Outros') === catFilter));
  
  // Aplicar ordenação baseada na seleção do usuário
  if (sort === 'name') {
    notDone.sort((a, b) => (a.name||'').localeCompare(b.name||''));
    done.sort((a, b) => (a.name||'').localeCompare(b.name||''));
  } else if (sort === 'price') {
    notDone.sort((a, b) => {
      const priceA = numBR(a.price);
      const priceB = numBR(b.price);
      return priceA - priceB;
    });
    done.sort((a, b) => {
      const priceA = numBR(a.price);
      const priceB = numBR(b.price);
      return priceA - priceB;
    });
  } else if (sort === 'subtotal') {
    notDone.sort((a, b) => {
      const qtyA = numBR(a.qty);
      const priceA = numBR(a.price);
      const qtyB = numBR(b.qty);
      const priceB = numBR(b.price);
      return (qtyA * priceA) - (qtyB * priceB);
    });
    done.sort((a, b) => {
      const qtyA = numBR(a.qty);
      const priceA = numBR(a.price);
      const qtyB = numBR(b.qty);
      const priceB = numBR(b.price);
      return (qtyA * priceA) - (qtyB * priceB);
    });
  } else {
    // Ordenação padrão: por ordem de adição (mais antigos primeiro)
    notDone.sort((a, b) => (a.createdAt||0) - (b.createdAt||0));
  }

    listEl.innerHTML='';
    // Valor previsto: soma de todos os itens, independente do status
    let previsto = items.reduce((sum, it) => {
      // Garante que preço e quantidade com vírgula sejam convertidos corretamente
      let qty = numBR(it.qty);
      let price = numBR(it.price);
      return sum + ((qty||0)*(price||0));
    }, 0);
    let realizado = 0;

    // Markup de um item da lista. Um bloco so para comprados e nao comprados
    // (antes eram dois quase iguais, com o botao de remover duplicado).
    // A linha fica compacta e os campos de edicao aparecem ao expandir, para
    // caber mais itens na tela.
    const UNIDADES = ['un','kg','g','L','ml','pct'];
    const CATEGORIAS = ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Cereais','Outros'];
    const num = numBR;
    const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const opcoes = (lista, atual) => lista
      .map(v => '<option' + (v === atual ? ' selected' : '') + '>' + v + '</option>').join('');

    function itemCard(it, idx) {
      const subtotal = num(it.qty) * num(it.price);
      const aberto = expandidos.has(it.name);
      const resumo = fmtQtd(it.qty) + ' ' + (it.unit || 'un') +
        (num(it.price) ? ' × ' + money(num(it.price)) : '');

      const card = document.createElement('div');
      card.className = 'item-row' + (it.done ? ' is-done' : '') + (aberto ? ' is-open' : '');
      card.innerHTML =
        '<label class="item-check">'
        +   '<input type="checkbox" data-i="' + idx + '" data-act="toggle"' + (it.done ? ' checked' : '') + '>'
        +   '<span class="check-mark" aria-hidden="true"></span>'
        + '</label>'
        + '<div class="item-main">'
        +   '<span class="item-name" data-i="' + idx + '" data-act="toggleByName">' + esc(it.name || 'Item sem nome') + '</span>'
        +   '<span class="item-summary">' + esc(resumo) + '</span>'
        + '</div>'
        + '<span class="item-subtotal">' + money(subtotal) + '</span>'
        + '<button class="item-expand" data-expand="' + esc(it.name) + '" aria-expanded="' + aberto + '" aria-label="Editar ' + esc(it.name || 'item') + '">'
        +   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
        + '</button>'
        + '<div class="item-edit">'
        +   '<div class="item-fields">'
        +     '<span class="field field-nome"><span class="field-label">Nome</span>'
        +       '<input type="text" autocomplete="off" value="' + esc(it.name || '') + '" data-i="' + idx + '" data-f="name"></span>'
        +     '<span class="field"><span class="field-label">Qtd</span>'
        +       '<input type="text" inputmode="decimal" autocomplete="off" value="' + esc(fmtQtd(it.qty)) + '" data-i="' + idx + '" data-f="qty"></span>'
        +     '<span class="field"><span class="field-label">Preço</span>'
        +       '<input type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(fmtPreco(it.price)) + '" data-i="' + idx + '" data-f="price"></span>'
        +     '<span class="field"><span class="field-label">Un</span>'
        +       '<select data-i="' + idx + '" data-f="unit">' + opcoes(UNIDADES, it.unit || 'un') + '</select></span>'
        +     '<span class="field field-cat"><span class="field-label">Categoria</span>'
        +       '<select data-i="' + idx + '" data-f="category">' + opcoes(CATEGORIAS, it.category || 'Outros') + '</select></span>'
        +   '</div>'
        +   '<button data-del="' + idx + '" class="item-del" aria-label="Remover ' + esc(it.name || 'item') + '">'
        +     '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
        +     '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg><span>Remover</span>'
        +   '</button>'
        + '</div>';
      return card;
    }

    notDone.forEach(it => listEl.appendChild(itemCard(it, items.indexOf(it))));
    done.forEach(it => {
      realizado += num(it.qty) * num(it.price);
      listEl.appendChild(itemCard(it, items.indexOf(it)));
    });

    const btnConcluir = $('#finalizar');
    if (btnConcluir) btnConcluir.hidden = !items.length;
    // Sem itens a área ficava simplesmente em branco.
    if (!notDone.length && !done.length) {
      const vazio = document.createElement('div');
      vazio.className = 'empty-state';
      vazio.innerHTML =
        '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>'
        + '<circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/></svg>'
        + '<p class="empty-title">' + (catFilter ? 'Nada em "' + catFilter + '"' : 'Sua lista está vazia') + '</p>'
        + '<p class="empty-hint">' + (catFilter ? 'Troque o filtro para ver os outros itens.' : 'Toque no botão + para adicionar, ou use uma lista pronta em Sugestões.') + '</p>';
      listEl.appendChild(vazio);
    }

    // O estado aberto vive fora do render, que recria a lista inteira.
    listEl.querySelectorAll('[data-expand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nome = btn.getAttribute('data-expand');
        if (expandidos.has(nome)) expandidos.delete(nome); else expandidos.add(nome);
        const linha = btn.closest('.item-row');
        linha.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(linha.classList.contains('is-open')));
      });
    });

  // Atualiza contador para mostrar quantos itens estão sendo exibidos
  $('#count') && ($('#count').textContent = (notDone.length + done.length) + ' itens' + (catFilter ? ' ('+catFilter+')' : ''));
    // Progresso da compra no painel de resumo.
    const totalItens = items.length;
    const feitos = items.filter(i => i.done).length;
    const pct = totalItens ? Math.round((feitos / totalItens) * 100) : 0;
    $('#heroBarFill') && ($('#heroBarFill').style.width = pct + '%');
    $('#heroCount') && ($('#heroCount').textContent =
      totalItens ? feitos + ' de ' + totalItens + (totalItens === 1 ? ' item' : ' itens') : 'Nenhum item ainda');
    $('#progress') && ($('#progress').textContent = '');
    $('#kpiPrevisto') && ($('#kpiPrevisto').textContent = money(previsto));
    $('#kpiRealizado') && ($('#kpiRealizado').textContent = money(realizado));
  save();
  renderInsights();
  updateGradient();
  }

  // Atualiza lista ao mudar filtro de categoria
  $('#categoryFilter') && $('#categoryFilter').addEventListener('change', render);
  // Atualiza lista ao mudar ordenação
  $('#sort') && $('#sort').addEventListener('change', render);
  // Adiciona rolagem horizontal no filtro de categoria no mobile
  const catFilterEl = $('#categoryFilter');
  if (catFilterEl) {
    catFilterEl.style.maxWidth = '100vw';
    catFilterEl.style.overflowX = 'auto';
    catFilterEl.style.display = 'block';
    catFilterEl.style.whiteSpace = 'nowrap';
  }
  listEl.addEventListener('input', (e)=>{
    const i = Number(e.target.getAttribute('data-i'));
    const f = e.target.getAttribute('data-f');
    if(!Number.isFinite(i) || !f) return;
    let val = e.target.value;
    let inputEl = e.target;
    let cursorPos = inputEl.selectionStart;
    if(f==='qty' || f==='price') {
      // Permite campo vazio, vírgula ou ponto como separador decimal, e só aceita números
      if(val === '') {
        items[i][f] = '';
      } else {
        const limpo = val.replace(/[^0-9.,]/g, '');
        if (limpo !== val) {
          inputEl.value = limpo;
          try { inputEl.setSelectionRange(cursorPos - 1, cursorPos - 1); } catch(e){}
        }
        items[i][f] = numBR(limpo);
      }
      const linha = inputEl.closest('.item-row');
      if (linha) {
        const it = items[i];
        const sub = linha.querySelector('.item-subtotal');
        if (sub) sub.textContent = money(numBR(it.qty) * numBR(it.price));
        const res = linha.querySelector('.item-summary');
        if (res) res.textContent = fmtQtd(it.qty) + ' ' + (it.unit || 'un') + (numBR(it.price) ? ' × ' + money(numBR(it.price)) : '');
      }
      let previsto = items.reduce((sum, it) => sum + numBR(it.qty) * numBR(it.price), 0);
      $('#kpiPrevisto') && ($('#kpiPrevisto').textContent = money(previsto));
    } else {
      items[i][f] = val;
      if (f === 'name') {
        const titulo = e.target.closest('.item-row')?.querySelector('.item-name');
        if (titulo) titulo.textContent = val.trim() || 'Item sem nome';
      }
    }
    if(f==='price' && items[i][f] !== ''){ trackPriceForHistory(items[i]); }
    if((f==='name' || f==='category' || f==='unit' || f==='price') && items[i][f] !== '') learnFromItem(items[i]);
    save();
    // Não chama render() aqui para não perder o foco do input
  });
  listEl.addEventListener('change', (e)=>{
    const campo = e.target.getAttribute('data-f');
    if (campo === 'name') {
      const i = Number(e.target.getAttribute('data-i'));
      if (items[i]) {
        const novo = String(items[i].name || '').trim();
        items[i].name = novo || 'Item sem nome';
        expandidos.add(items[i].name); // continua aberto depois do render
        save(); render();
      }
      return;
    }
    if (campo === 'qty' || campo === 'price') {
      const i = Number(e.target.getAttribute('data-i'));
      if (items[i]) {
        if (campo === 'qty' && !(numBR(items[i].qty) > 0)) items[i].qty = 1;
        if (campo === 'price') items[i].price = Math.max(0, numBR(items[i].price));
        save(); render();
      }
      return;
    }
    if(e.target.getAttribute('data-act')==='toggle'){
      const i = Number(e.target.getAttribute('data-i')); items[i].done = !!e.target.checked; somAoMarcar(items[i].done); save(); render();
    }
  });
  // Marcar o ultimo item da lista ganha um som de conclusao.
  function somAoMarcar(marcado) {
    if (!marcado) return playSound('uncheck');
    playSound(items.length > 1 && items.every(x => x.done) ? 'done' : 'check');
  }
  listEl.addEventListener('click', (e)=>{
    const btnDel = e.target.closest('[data-del]');
    if(btnDel){
      // Um toque errado nao pode custar o item: remove na hora e oferece desfazer.
      const pos = Number(btnDel.getAttribute('data-del'));
      const [removido] = items.splice(pos, 1);
      playSound('delete');
      save(); render();
      if (removido) {
        toast((removido.name || 'Item') + ' removido', 'info', 5000, {
          rotulo: 'Desfazer',
          aoTocar: () => { items.splice(Math.min(pos, items.length), 0, removido); save(); render(); }
        });
      }
      return;
    }
    const alvo = e.target.closest('[data-act]');
    const act = alvo && alvo.getAttribute('data-act');
    if(act==='toggleByName'){
      // Clique no nome do item: marcar como selecionado
      const i = Number(alvo.getAttribute('data-i'));
      if(!Number.isFinite(i)) return;
      items[i].done = !items[i].done;
      somAoMarcar(items[i].done);
      save(); render(); return;
    }
  });
  // Mapeamento inteligente de produtos para categorias
  const productCategoryMap = {
    // Cereais
    'arroz': 'Cereais', 'arroz integral': 'Cereais', 'arroz parboilizado': 'Cereais',
    'aveia': 'Cereais', 'granola': 'Cereais', 'quinoa': 'Cereais', 'chia': 'Cereais',
    'linhaça': 'Cereais', 'cereal': 'Cereais', 'corn flakes': 'Cereais', 'flocos': 'Cereais',
    'trigo': 'Cereais', 'farinha de trigo': 'Cereais', 'centeio': 'Cereais', 'cevada': 'Cereais',
    // Laticínios
    'leite': 'Laticínios', 'iogurte': 'Laticínios', 'queijo': 'Laticínios', 'manteiga': 'Laticínios',
    'margarina': 'Laticínios', 'requeijão': 'Laticínios', 'cream cheese': 'Laticínios',
    'nata': 'Laticínios', 'creme de leite': 'Laticínios', 'leite condensado': 'Laticínios',
    // Hortifruti
    'alface': 'Hortifruti', 'tomate': 'Hortifruti', 'cebola': 'Hortifruti', 'batata': 'Hortifruti',
    'cenoura': 'Hortifruti', 'brócolis': 'Hortifruti', 'couve': 'Hortifruti', 'banana': 'Hortifruti',
    'maçã': 'Hortifruti', 'laranja': 'Hortifruti', 'mamão': 'Hortifruti', 'abacaxi': 'Hortifruti',
    'melancia': 'Hortifruti', 'uva': 'Hortifruti', 'morango': 'Hortifruti', 'limão': 'Hortifruti',
    'pimentão': 'Hortifruti', 'pepino': 'Hortifruti', 'abobrinha': 'Hortifruti',
    // Carnes
    'carne': 'Carnes', 'frango': 'Carnes', 'peixe': 'Carnes', 'picanha': 'Carnes',
    'costela': 'Carnes', 'linguiça': 'Carnes', 'bacon': 'Carnes', 'salsicha': 'Carnes',
    'presunto': 'Carnes', 'peito de frango': 'Carnes', 'file': 'Carnes', 'filé': 'Carnes',
    // Bebidas
    'refrigerante': 'Bebidas', 'suco': 'Bebidas', 'água': 'Bebidas', 'cerveja': 'Bebidas',
    'vinho': 'Bebidas', 'café': 'Bebidas', 'chá': 'Bebidas', 'energético': 'Bebidas',
    // Limpeza
    'detergente': 'Limpeza', 'sabão': 'Limpeza', 'água sanitária': 'Limpeza', 'desinfetante': 'Limpeza',
    'amaciante': 'Limpeza', 'alvejante': 'Limpeza', 'esponja': 'Limpeza', 'pano': 'Limpeza',
    // Higiene
    'shampoo': 'Higiene', 'condicionador': 'Higiene', 'sabonete': 'Higiene', 'pasta de dente': 'Higiene',
    'escova de dente': 'Higiene', 'desodorante': 'Higiene', 'papel higiênico': 'Higiene',
    // Mercearia
    'feijão': 'Mercearia', 'macarrão': 'Mercearia', 'óleo': 'Mercearia', 'açúcar': 'Mercearia',
    'sal': 'Mercearia', 'pão': 'Mercearia', 'biscoito': 'Mercearia', 'bolacha': 'Mercearia'
  };

  // Mostra, na propria opcao "Automática", qual categoria sera usada.
  function mostrarCategoriaAuto() {
    const sel = $('#category'); if (!sel || !sel.options.length) return;
    const nome = ($('#name')?.value || '').trim();
    const cat = nome ? suggestCategory(nome) : null;
    sel.options[0].textContent = cat ? 'Automática (' + cat + ')' : 'Automática';
  }

  // Itens adicionados enquanto a folha esta aberta, como confirmacao visivel.
  const recentesNaFolha = new Map();
  function registrarRecente(nome) {
    const chave = nome.trim().toLowerCase();
    const atual = recentesNaFolha.get(chave);
    recentesNaFolha.delete(chave); // reinsere no fim: o ultimo tocado aparece por ultimo
    recentesNaFolha.set(chave, { nome, vezes: atual ? atual.vezes + 1 : 1 });
    const box = $('#sheetRecentes'); if (!box) return;
    const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    box.hidden = false;
    box.innerHTML = '<span class="recentes-rot">Adicionados · ' + recentesNaFolha.size + '</span>' +
      [...recentesNaFolha.values()].reverse().map(r => '<span class="recente-chip">' + esc(r.nome) +
        (r.vezes > 1 ? ' <b>×' + r.vezes + '</b>' : '') + '</span>').join('');
  }
  window.limparRecentesFolha = () => {
    recentesNaFolha.clear();
    const box = $('#sheetRecentes'); if (box) { box.hidden = true; box.innerHTML = ''; }
  };

  function suggestCategory(productName) {
    const nameLower = productName.toLowerCase().trim();
    // Busca exata
    if (productCategoryMap[nameLower]) return productCategoryMap[nameLower];
    // Busca parcial (se o nome do produto contém alguma palavra-chave)
    for (const [key, category] of Object.entries(productCategoryMap)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return category;
      }
    }
    return null;
  }

  // Form adicionar
  const addForm = $('#addForm');
  addForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const categoryValue = $('#category')?.value?.trim() || '';
    const productName = $('#name')?.value?.trim() || '';
    const it = {
      name: productName,
      category: categoryValue,
      unit: $('#unit')?.value || 'un',
      qty: numBR($('#qty')?.value) > 0 ? numBR($('#qty')?.value) : 1,
      price: Math.max(0, numBR($('#price')?.value))
    };
    
    if(!it.name){ playSound('error'); toast('Digite o nome do item.', 'error'); $('#name')?.focus(); return; }
    // Sem escolha manual, a categoria vem do nome do produto.
    if(!it.category) it.category = suggestCategory(productName) || 'Outros';

    const jaExistia = items.some(i => (i.name||'').trim().toLowerCase() === it.name.toLowerCase());
    upsertItem(it);
    playSound('success');
    registrarRecente(it.name, jaExistia);

    // A folha fica aberta para o proximo item: e assim que se monta uma lista.
    addForm.reset();
    $('#qty') && ($('#qty').value = '');
    $('#unit') && ($('#unit').value = 'un');
    $('#category') && ($('#category').selectedIndex = 0);
    $('#suggestions')?.classList.add('hidden');
    mostrarCategoriaAuto();
    $('#name')?.focus();
  });

  // Templates prontas
  $$('.tpl').forEach(btn=> btn.addEventListener('click', ()=>{
    playSound('click');
    const arr = JSON.parse(btn.getAttribute('data-template') || '[]');
    arr.forEach(it=> upsertItem(it));
    playSound('success');
    toast('Lista adicionada à sua lista atual!', 'success');
  }));

  // Botões de editar templates
  $$('.edit-tpl').forEach(btn=> btn.addEventListener('click', ()=>{
    const arr = JSON.parse(btn.getAttribute('data-template') || '[]');
    openTemplateEditModal(arr);
  }));

  // Função para abrir modal de edição de template
  function openTemplateEditModal(templateItems) {
    const modal = document.createElement('div');
    modal.id = 'editTemplateModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-slate-900 rounded-2xl p-4 md:p-6 w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl relative border border-slate-700">
        <button id="closeEditTemplateModal" class="absolute top-3 right-3 text-2xl px-2 py-1 rounded-lg hover:bg-white/10 transition-colors z-10">✕</button>
        <h2 class="text-xl font-bold mb-4 pr-8 flex items-center gap-2">
          <span class="text-2xl">📝</span>
          <span>Editar lista</span>
        </h2>
        <div id="editTemplateItemsBox" class="space-y-3 mb-4"></div>
        <div class="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-900">
          <button id="addEditTemplateBtn" class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg transition-all">
            ✅ Adicionar à lista
          </button>
          <button id="cancelEditTemplateBtn" class="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all">
            Cancelar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    let tempItems = templateItems.map(i => ({...i}));
    const itemsBox = modal.querySelector('#editTemplateItemsBox');
    const closeBtn = modal.querySelector('#closeEditTemplateModal');
    const addBtn = modal.querySelector('#addEditTemplateBtn');
    const cancelBtn = modal.querySelector('#cancelEditTemplateBtn');

    function renderTemplateEditItems() {
      const unidades = ['un','kg','g','L','ml','pct'];
      const categorias = ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Cereais','Outros'];
      itemsBox.innerHTML = tempItems.map((it, i) => `
        <div class='relative bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:border-slate-600 transition-all'>
          <button class='remove-template-item absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-sm shadow-lg transition-all z-10' data-i='${i}' title='Remover'>✕</button>
          
          <div class='space-y-2'>
            <input type='text' class='w-full px-3 py-2.5 rounded-lg bg-slate-900 text-white text-base border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all' value='${it.name||''}' data-i='${i}' data-f='name' placeholder='🛒 Nome do produto'>
            
            <div class='grid grid-cols-2 gap-2'>
              <div>
                <label class='text-xs text-slate-400 mb-1 block'>Quantidade</label>
                <input type='number' class='w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-base border border-slate-700 focus:border-blue-500 outline-none transition-all' value='${it.qty||1}' min='0.01' step='0.01' data-i='${i}' data-f='qty' placeholder='0'>
              </div>
              <div>
                <label class='text-xs text-slate-400 mb-1 block'>Unidade</label>
                <select class='w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-base border border-slate-700 focus:border-blue-500 outline-none transition-all' data-i='${i}' data-f='unit'>
                  ${unidades.map(u=>`<option value='${u}'${(it.unit||'un')===u?' selected':''}>${u}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class='grid grid-cols-2 gap-2'>
              <div>
                <label class='text-xs text-slate-400 mb-1 block'>Preço (R$)</label>
                <input type='number' class='w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-base border border-slate-700 focus:border-blue-500 outline-none transition-all' value='${it.price||0}' min='0' step='0.01' data-i='${i}' data-f='price' placeholder='0.00'>
              </div>
              <div>
                <label class='text-xs text-slate-400 mb-1 block'>Categoria</label>
                <select class='w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-base border border-slate-700 focus:border-blue-500 outline-none transition-all' data-i='${i}' data-f='category'>
                  ${categorias.map(c=>`<option value='${c}'${(it.category||'Outros')===c?' selected':''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>
      `).join('') + `
        <button class='add-template-item w-full px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-emerald-500 text-white font-semibold transition-all flex items-center justify-center gap-2'>
          <span class='text-xl'>+</span>
          <span>Adicionar novo item</span>
        </button>
      `;
      
      const firstInput = itemsBox.querySelector('input');
      if(firstInput) setTimeout(()=>firstInput.focus(), 100);
      
      const addNewBtn = itemsBox.querySelector('.add-template-item');
      if(addNewBtn) addNewBtn.onclick = ()=>{
        tempItems.push({name:'', qty:1, unit:'un', price:0, category:'Outros'});
        renderTemplateEditItems();
      };
    }

    renderTemplateEditItems();

    itemsBox.oninput = (ev) => {
      const t = ev.target;
      const i = Number(t.getAttribute('data-i'));
      const f = t.getAttribute('data-f');
      if (!Number.isFinite(i) || !f) return;
      let val = t.value;
      if (f === 'qty' || f === 'price') val = Number(val);
      tempItems[i][f] = val;
    };

    itemsBox.onclick = (ev) => {
      const t = ev.target;
      if (t.classList.contains('remove-template-item')) {
        const i = Number(t.getAttribute('data-i'));
        if (Number.isFinite(i)) {
          tempItems.splice(i, 1);
          renderTemplateEditItems();
        }
      }
    };

    addBtn.onclick = () => {
      const validItems = tempItems.filter(it => it.name && it.qty > 0);
      if(validItems.length === 0) {
        toast('Adicione pelo menos um item válido!', 'error');
        return;
      }
      validItems.forEach(it=> upsertItem(it));
      toast(`${validItems.length} ite${validItems.length > 1 ? 'ns adicionados' : 'm adicionado'} à sua lista!`, 'success');
      modal.remove();
    };

    closeBtn.onclick = () => { modal.remove(); };
    cancelBtn.onclick = () => { modal.remove(); };

    modal.onclick = (ev) => {
      if (ev.target === modal) modal.remove();
    };
  }

  // Copiar lista
  $('#copyList')?.addEventListener('click', ()=>{
    playSound('click');
    const lines = items
      .filter(i => i.name && i.qty > 0)
      .map(i => {
        const nome = i.name;
        const qtd = i.qty;
        const unidade = i.unit || '';
        return `• ${nome} — ${qtd} ${unidade}`.replace(/\s+/g, ' ').trim();
      });
    const text = lines.join('\n');
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(text).then(()=>{
        playSound('success');
        toast('Lista copiada!', 'success');
      }).catch(()=>{
        playSound('error');
        fallbackCopy(text);
      });
    } else {
      playSound('success');
      fallbackCopy(text);
    }
  });
  function fallbackCopy(text){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Lista copiada!', 'success'); }

  // Compressão LZString simplificada para encurtar URLs
  const LZString={compressToEncodedURIComponent:function(e){if(null==e)return"";return this._compress(e,6,function(e){return"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(e)})},decompressFromEncodedURIComponent:function(e){return null==e?"":""==e?null:(e=e.replace(/ /g,"+"),this._decompress(e.length,32,function(t){return"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(e.charAt(t))}))},_compress:function(e,t,n){if(null==e)return"";var r,i,o,a={},s={},c="",l="",u="",p=2,f=3,d=2,h=[],m=0,g=0;for(o=0;o<e.length;o+=1)if(c=e.charAt(o),Object.prototype.hasOwnProperty.call(a,c)||(a[c]=f++,s[c]=!0),l=u+c,Object.prototype.hasOwnProperty.call(a,l))u=l;else{if(Object.prototype.hasOwnProperty.call(s,u)){if(u.charCodeAt(0)<256){for(r=0;r<d;r++)m<<=1,g==t-1?(g=0,h.push(n(m)),m=0):g++;for(i=u.charCodeAt(0),r=0;r<8;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1}else{for(i=1,r=0;r<d;r++)m=m<<1|i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i=0;for(i=u.charCodeAt(0),r=0;r<16;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1}0==--p&&(p=Math.pow(2,d),d++),delete s[u]}else for(i=a[u],r=0;r<d;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1;0==--p&&(p=Math.pow(2,d),d++),a[l]=f++,u=String(c)}if(""!==u){if(Object.prototype.hasOwnProperty.call(s,u)){if(u.charCodeAt(0)<256){for(r=0;r<d;r++)m<<=1,g==t-1?(g=0,h.push(n(m)),m=0):g++;for(i=u.charCodeAt(0),r=0;r<8;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1}else{for(i=1,r=0;r<d;r++)m=m<<1|i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i=0;for(i=u.charCodeAt(0),r=0;r<16;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1}0==--p&&(p=Math.pow(2,d),d++),delete s[u]}else for(i=a[u],r=0;r<d;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1;0==--p&&(p=Math.pow(2,d),d++)}for(i=2,r=0;r<d;r++)m=m<<1|1&i,g==t-1?(g=0,h.push(n(m)),m=0):g++,i>>=1;for(;;){if(m<<=1,g==t-1){h.push(n(m));break}g++}return h.join("")},_decompress:function(e,t,n){var r,i,o,a,s,c,l,u=[],p=4,f=4,d=3,h="",m=[],g={val:n(0),position:t,index:1};for(r=0;r<3;r+=1)u[r]=r;for(o=0,s=Math.pow(2,2),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;switch(o){case 0:for(o=0,s=Math.pow(2,8),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;l=String.fromCharCode(o);break;case 1:for(o=0,s=Math.pow(2,16),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;l=String.fromCharCode(o);break;case 2:return""}for(u[3]=l,i=l,m.push(l);;){if(g.index>e)return"";for(o=0,s=Math.pow(2,d),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;switch(l=o){case 0:for(o=0,s=Math.pow(2,8),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;u[f++]=String.fromCharCode(o),l=f-1,p--;break;case 1:for(o=0,s=Math.pow(2,16),c=1;c!=s;)a=g.val&g.position,g.position>>=1,0==g.position&&(g.position=t,g.val=n(g.index++)),o|=(a>0?1:0)*c,c<<=1;u[f++]=String.fromCharCode(o),l=f-1,p--;break;case 2:return m.join("")}if(0==p&&(p=Math.pow(2,d),d++),u[l])h=u[l];else{if(l!==f)return null;h=i+i.charAt(0)}m.push(h),u[f++]=i+h.charAt(0),i=h,0==--p&&(p=Math.pow(2,d),d++)}}};

  // Compartilhar lista
  $('#shareList')?.addEventListener('click', async ()=>{
    playSound('click');
    if(!items.length) {
      playSound('error');
      return toast('Sua lista está vazia.', 'error');
    }
    // Reduz dados ao mínimo necessário para compartilhamento
    const minimalData = items.map(i => ({
      n: i.name,
      c: i.category,
      u: i.unit || 'un',
      q: i.qty || 1,
      p: i.price || 0
    }));
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(minimalData));
    const urlBase = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    const linkLista = urlBase + '?l=' + compressed;
    const linkApp = urlBase;
    const texto = `Confira minha lista de compras no Listou!\n\nAcesse: ${linkLista}\n\nOu utilize o app: ${linkApp}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lista de Compras', text: texto, url: linkLista });
        playSound('success');
      } catch (e) { 
        playSound('error');
        toast('Não foi possível compartilhar: ' + e.message, 'error'); 
      }
    } else {
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(texto);
        playSound('success');
        toast('Link da lista copiado!', 'success');
      } else {
        playSound('success');
        fallbackCopy(texto);
      }
    }
  });

  // Finalizar compra
  $('#finalizar')?.addEventListener('click', async ()=>{
    playSound('click');
    if(!items.length) {
      playSound('error');
      return toast('Sua lista está vazia.', 'error');
    }
    // Se não houver nenhum item marcado como comprado, não faz nada
    const comprados = items.filter(i => !!i.done);
    if (!comprados.length) {
      playSound('error');
      return toast('Marque os itens comprados para finalizar a compra.', 'error');
    }
    const qtdComprados = items.filter(i => i.done).length;
    const nome = await uiPrompt('Concluir a compra com ' + qtdComprados + (qtdComprados === 1 ? ' item marcado?' : ' itens marcados?') +
      '\nSe quiser, dê um nome a ela (opcional).', '', 'Concluir', 'Ex.: Compra do mês');
    if (nome === null) return; // cancelou: nada muda
    // Pega o valor do campo de mercado
    let mercado = '';
    const marketInput = document.getElementById('market');
    if (marketInput && marketInput.value) mercado = marketInput.value.trim();
    else if (typeof currentMarket === 'string' && currentMarket) mercado = currentMarket;
    // Salva apenas os itens comprados no histórico
    const entry = { id: genId(), at: Date.now(), name: nome ? nome.trim() : undefined, market: mercado, items: comprados.map(i=>{ const o={}; Object.keys(i).forEach(k=> o[k]=i[k]); return o; }) };
    history.unshift(entry);
    entry.items.forEach(trackPriceForHistory);
    // Remove apenas os itens comprados da lista, mantendo os não comprados
    items = items.filter(i => !i.done);
    save(); render(); renderReports(); renderHistorico(); 
    playSound('complete');
    toast('Compra finalizada! Os itens não marcados continuam na lista.', 'success', 4200);
  });

  // ===== Insights =====
  let chartCategorias=null, chartABC=null;
  // Desenhado por painel.js; aqui so repassa (render() chama isto a cada mudanca).
  function renderInsights(){ window.Painel && window.Painel.insights(); }

  // ===== Relatórios =====
  let chartMes=null, chartFreq=null, chartItemMarket=null, chartRankingVar=null;

  function refreshReportItemSelect(){
    const sel = $('#reportItemSelect'); if(!sel) return;
    const set = new Set(); history.forEach(h=> h.items.forEach(i=> i.name && set.add(i.name) )); items.forEach(i=> i.name && set.add(i.name));
    const names = Array.from(set).sort(); sel.innerHTML=''; names.forEach(n=>{ const o=document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o); });
    if(!sel.value && names.length) sel.value = names[0];
  }
  function renderMarketComparison(){
    const sel = $('#reportItemSelect'); if(!sel) return;
    const name = sel.value; if(!name) return;
    const markets = priceHistory[name] ? Object.keys(priceHistory[name]) : [];
    const labels = markets;
    const data = markets.map(m=>{ const arr = priceHistory[name][m]||[]; const last = arr[arr.length-1]; return last? last.price: 0; });
    const ctx = $('#chartItemMarket');
    if(ctx){ chartItemMarket?.destroy(); chartItemMarket = new Chart(ctx,{ type:'bar', data:{ labels, datasets:[{ label:'Preço mais recente', data }] }, options:{ plugins:{ legend:{ position:'bottom' }}, scales:{ y:{ beginAtZero:true }}} }); }
  }
  function computeVariationRanking(){
    const entries = [];
    Object.keys(priceHistory).forEach(name=>{
      const markets = priceHistory[name];
      const lastVals=[], prevVals=[];
      Object.keys(markets).forEach(m=>{ const arr=markets[m]; if(arr.length){ lastVals.push(arr[arr.length-1].price); if(arr.length>1) prevVals.push(arr[arr.length-2].price); } });
      if(lastVals.length && prevVals.length){
        const lastAvg = lastVals.reduce((a,b)=>a+b,0)/lastVals.length;
        const prevAvg = prevVals.reduce((a,b)=>a+b,0)/prevVals.length;
        if(prevAvg>0){ const delta = (lastAvg-prevAvg)/prevAvg*100; entries.push([name, delta]); }
      }
    });
    entries.sort((a,b)=> Math.abs(b[1]) - Math.abs(a[1]) );
    return entries.slice(0,10);
  }
  function renderRankingVar(){
    const top = computeVariationRanking();
    const labels = top.map(x=>x[0]);
    const data = top.map(x=> Number(x[1].toFixed(1)));
    const ctx = $('#chartRankingVar');
    if(ctx){ chartRankingVar?.destroy(); chartRankingVar = new Chart(ctx,{ type:'bar', data:{ labels, datasets:[{ label:'∆% (último vs anterior)', data }] }, options:{ plugins:{ legend:{ position:'bottom' }}, scales:{ y:{ beginAtZero:true }}} }); }
  }

  function renderReports(){ window.Painel && window.Painel.relatorios(); }

  // ===== Mercado =====
  const marketInput = $('#market'); const saveMarketBtn = $('#saveMarket');
  if(marketInput) marketInput.value = currentMarket || '';
  // O mercado era salvo so pelo botao de confirmar; quem digitava e seguia
  // em frente perdia o texto. Agora salva tambem ao sair do campo ou no Enter.
  function salvarMercado(avisar){
    const novo = (marketInput.value||'').trim();
    if (novo === currentMarket) return;
    currentMarket = novo; save();
    if (avisar) toast(novo ? 'Mercado: ' + novo : 'Mercado removido', 'success', 2000);
  }
  saveMarketBtn?.addEventListener('click', ()=>{ salvarMercado(true); marketInput.blur(); });
  marketInput?.addEventListener('change', ()=> salvarMercado(true));
  marketInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); marketInput.blur(); } });

  // ===== User Lists =====
  function renderUserLists(){
    const box = $('#userLists'); if(!box) return;
    box.innerHTML = '';
    userLists.forEach((ulist, idx) => {
      const div = document.createElement('div');
      div.className = 'user-list-entry flex flex-col gap-1 mb-2 p-3 rounded shadow';
      div.innerHTML = `
        <div class="flex items-center gap-2 justify-between">
          <span class="list-title flex-1">${ulist.name || 'Sem nome'}</span>
          <div class="list-actions">
            <button class="save-btn" data-load="${idx}">Carregar</button>
            <button class="edit-btn" data-edit="${idx}">Editar</button>
            <button class="remove-btn" data-remove="${idx}">Remover</button>
          </div>
        </div>
        <div class="list-meta">${ulist.items.length} itens</div>
      `;
      box.appendChild(div);
    });
    // Eventos para carregar/remover/editar listas salvas
    box.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = Number(btn.getAttribute('data-load'));
        if (!Number.isFinite(idx) || !userLists[idx]) return;
        if (!await uiConfirm('Substituir a lista atual pela lista salva?', { okLabel: 'Substituir' })) return;
        items = userLists[idx].items.map(i => Object.assign({}, i));
        save(); render();
        setTab('lista');
      });
    });
    box.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-edit'));
        if (!Number.isFinite(idx) || !userLists[idx]) return;
        // Abrir modal de edição de itens
        const modal = document.getElementById('editUserListModal');
        const closeBtn = document.getElementById('closeEditUserListModal');
        const itemsBox = document.getElementById('editUserListItemsBox');
        const saveBtn = document.getElementById('saveEditUserListBtn');
        if (!modal || !closeBtn || !itemsBox || !saveBtn) return;
        modal.classList.remove('hidden');
        // Renderiza os itens para edição (inputs maiores, foco, atalhos)
        let tempItems = userLists[idx].items.map(i => ({...i}));
        function renderEditItems() {
          const unidades = ['un','kg','g','L','ml','pct'];
          const categorias = ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Cereais','Outros'];
          itemsBox.innerHTML = tempItems.map((it, i) => `
            <div class='flex flex-col md:flex-row gap-2 items-center mb-2 p-3 rounded-lg shadow suggestion-card'>
              <div class='flex-1 flex flex-col md:flex-row gap-2 items-center'>
                <input type='text' class='px-3 py-2 rounded bg-slate-800 text-white w-full md:w-40 text-base' value='${it.name||''}' data-i='${i}' data-f='name' placeholder='Nome do item 🛒'>
                <input type='number' class='px-3 py-2 rounded bg-slate-800 text-white w-20 text-base' value='${it.qty||1}' min='1' data-i='${i}' data-f='qty' placeholder='Qtd'>
                <select class='px-3 py-2 rounded bg-slate-800 text-white w-20 text-base' data-i='${i}' data-f='unit'>
                  ${unidades.map(u=>`<option value='${u}'${(it.unit||'un')===u?' selected':''}>${u}</option>`).join('')}
                </select>
                <input type='number' class='px-3 py-2 rounded bg-slate-800 text-white w-24 text-base' value='${it.price||0}' min='0' step='0.01' data-i='${i}' data-f='price' placeholder='Preço R$'>
                <select class='px-3 py-2 rounded bg-slate-800 text-white w-32 text-base' data-i='${i}' data-f='category'>
                  ${categorias.map(c=>`<option value='${c}'${(it.category||'Outros')===c?' selected':''}>${c}</option>`).join('')}
                </select>
              </div>
              <button class='remove-edit-item px-2 py-2 rounded bg-rose-700 text-white text-lg' data-i='${i}' title='Remover'>🗑️</button>
            </div>
          `).join('') + `
            <div class='flex gap-2 mt-2'>
              <button class='add-edit-item px-4 py-2 rounded bg-emerald-700 text-white font-semibold' title='Adicionar novo item'>+ Adicionar item</button>
            </div>
          `;
          // Foco automático no primeiro campo
          const firstInput = itemsBox.querySelector('input');
          if(firstInput) setTimeout(()=>firstInput.focus(), 100);
          // Botão de adicionar novo item
          const addBtn = itemsBox.querySelector('.add-edit-item');
          if(addBtn) addBtn.onclick = ()=>{
            tempItems.push({name:'', qty:1, unit:'un', price:0, category:'Outros'});
            renderEditItems();
          };
        }
        renderEditItems();
        // Eventos de edição
        itemsBox.oninput = (ev) => {
          const t = ev.target;
          const i = Number(t.getAttribute('data-i'));
          const f = t.getAttribute('data-f');
          if (!Number.isFinite(i) || !f) return;
          let val = t.value;
          if (f === 'qty' || f === 'price') val = Number(val);
          tempItems[i][f] = val;
        };
        // Atalho: Enter para salvar, Esc para cancelar
        itemsBox.onkeydown = (ev) => {
          if(ev.key === 'Enter') { saveBtn.click(); ev.preventDefault(); }
          if(ev.key === 'Escape') { closeBtn.click(); ev.preventDefault(); }
        };
        itemsBox.onclick = (ev) => {
          const t = ev.target;
          if (t.classList.contains('remove-edit-item')) {
            const i = Number(t.getAttribute('data-i'));
            if (Number.isFinite(i)) {
              tempItems.splice(i, 1);
              renderEditItems();
            }
          }
        };
        // Salvar alterações com feedback visual
        saveBtn.onclick = () => {
          userLists[idx].items = tempItems.filter(it => it.name && it.qty > 0);
          save();
          renderUserLists();
          saveBtn.textContent = 'Salvo!';
          setTimeout(()=>{ modal.classList.add('hidden'); saveBtn.textContent = 'Salvar alterações'; }, 700);
        };
        // Fechar modal
        closeBtn.onclick = () => { modal.classList.add('hidden'); };
      });
    });
    box.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = Number(btn.getAttribute('data-remove'));
        if (!Number.isFinite(idx) || !userLists[idx]) return;
        if (!await uiConfirm('Remover esta lista salva?', { okLabel: 'Remover', danger: true })) return;
        userLists.splice(idx, 1);
        save(); renderUserLists();
      });
    });
  }
  // ...função de salvar lista atual removida...

  // ===== Produtos Cadastrados =====
  // ===== Produtos cadastrados =====
  // Lista primeiro; o formulario abre numa folha para cadastrar ou editar.
  // Antes, "Editar" apagava o produto na hora e so o recriava ao salvar: quem
  // desistia no meio perdia o produto.
  const CORES_PROD = { 'Mercearia':'#f59f00','Cereais':'#e8590c','Laticínios':'#4dabf7','Hortifruti':'#40c057',
    'Carnes':'#fa5252','Bebidas':'#845ef7','Limpeza':'#15aabf','Higiene':'#e64980','Outros':'#868e96' };
  const escP = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let editandoProduto = -1;
  let buscaProduto = '';

  function renderProducts(){
    const list = $('#productsList'); const empty = $('#productsEmpty'); const count = $('#productCount');
    if(!list || !empty) return;
    if (count) count.textContent = customProducts.length + (customProducts.length === 1 ? ' produto' : ' produtos');
    const busca = $('#prodBusca');
    if (busca) busca.closest('.pd-busca').hidden = customProducts.length < 6;

    const q = buscaProduto.trim().toLowerCase();
    const visiveis = customProducts
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => !q || (p.name + ' ' + (p.brand||'') + ' ' + (p.category||'')).toLowerCase().includes(q))
      .sort((a, b) => a.p.name.localeCompare(b.p.name, 'pt-BR'));

    if(!customProducts.length){
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    if (!visiveis.length) { list.innerHTML = '<div class="pd-semres">Nenhum produto com "' + escP(buscaProduto) + '".</div>'; return; }

    list.innerHTML = visiveis.map(({ p, idx }) => {
      const cor = CORES_PROD[p.category] || CORES_PROD.Outros;
      const meta = [p.brand, p.category, p.unit].filter(Boolean).map(escP).join(' · ');
      return `<div class="pd-item">
          <span class="pd-avatar" style="--pd-cor:${cor}">${escP((p.name||'?').charAt(0).toUpperCase())}</span>
          <button class="pd-info" data-pd-editar="${idx}" aria-label="Editar ${escP(p.name)}">
            <b>${escP(p.name)}</b><span>${meta}</span>
          </button>
          <span class="pd-preco">${Number(p.price) > 0 ? money(p.price) : ''}</span>
          <button class="pd-add" data-pd-add="${idx}" aria-label="Adicionar ${escP(p.name)} à lista">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>`;
    }).join('');
  }

  $('#prodBusca')?.addEventListener('input', e => { buscaProduto = e.target.value; renderProducts(); });

  $('#productsList')?.addEventListener('click', e => {
    const add = e.target.closest('[data-pd-add]');
    if (add) {
      const p = customProducts[Number(add.dataset.pdAdd)]; if (!p) return;
      upsertItem({ name: p.name, category: p.category, unit: p.unit, qty: 1, price: p.price || 0 });
      playSound('success');
      add.classList.add('is-ok');
      setTimeout(() => add.classList.remove('is-ok'), 900);
      toast(p.name + ' adicionado à lista', 'success', 2600, { rotulo: 'Ver lista', aoTocar: () => irParaAba('lista') });
      return;
    }
    const ed = e.target.closest('[data-pd-editar]');
    if (ed) abrirFolhaProduto(Number(ed.dataset.pdEditar));
  });

  // Folha do formulario
  const prodSheet = $('#prodSheet');
  function abrirFolhaProduto(idx){
    if (!prodSheet || prodSheet.classList.contains('is-open')) return;
    editandoProduto = Number.isFinite(idx) ? idx : -1;
    const p = customProducts[editandoProduto];
    $('#prodSheetTitulo').textContent = p ? 'Editar produto' : 'Novo produto';
    $('#productName').value = p ? p.name : '';
    $('#productCategory').value = p ? (p.category || '') : '';
    $('#productUnit').value = p ? (p.unit || 'un') : 'un';
    $('#productPrice').value = p && Number(p.price) > 0 ? fmtPreco(p.price) : '';
    $('#productBrand').value = p ? (p.brand || '') : '';
    $('#prodExcluir').hidden = !p;
    $('#prodSalvar').lastChild.textContent = p ? ' Salvar alterações' : ' Cadastrar produto';
    prodSheet.hidden = false;
    requestAnimationFrame(() => prodSheet.classList.add('is-open'));
    document.body.classList.add('sheet-open');
    empilharVoltar('prodSheet', fecharFolhaProduto);
  }
  function fecharFolhaProduto(){
    if (!prodSheet || !prodSheet.classList.contains('is-open')) return;
    prodSheet.classList.remove('is-open');
    document.body.classList.remove('sheet-open');
    desempilharVoltar('prodSheet');
    setTimeout(() => { prodSheet.hidden = true; }, 220);
  }
  $('#prodNovo')?.addEventListener('click', () => abrirFolhaProduto(-1));
  $('#prodNovoVazio')?.addEventListener('click', () => abrirFolhaProduto(-1));
  prodSheet?.querySelectorAll('[data-prod-fechar]').forEach(el => el.addEventListener('click', fecharFolhaProduto));
  $('#productName')?.addEventListener('input', () => {
    // categoria sugerida pelo nome enquanto o usuario nao escolhe uma
    const sel = $('#productCategory'); if (!sel || sel.dataset.manual) return;
    const cat = suggestCategory($('#productName').value || '');
    if (cat) sel.value = cat;
  });
  $('#productCategory')?.addEventListener('change', e => { e.target.dataset.manual = '1'; });

  $('#prodExcluir')?.addEventListener('click', async () => {
    const p = customProducts[editandoProduto]; if (!p) return;
    if (!await uiConfirm('Excluir "' + p.name + '" dos seus produtos?', { okLabel: 'Excluir', danger: true })) return;
    const [removido] = customProducts.splice(editandoProduto, 1);
    const pos = editandoProduto;
    save(); fecharFolhaProduto(); renderProducts();
    toast(removido.name + ' excluído', 'info', 5000, { rotulo: 'Desfazer',
      aoTocar: () => { customProducts.splice(pos, 0, removido); save(); renderProducts(); } });
  });

  const addProductForm = $('#addProductForm');
  addProductForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#productName')?.value?.trim();
    const category = $('#productCategory')?.value?.trim() || suggestCategory(name || '') || 'Outros';
    const unit = $('#productUnit')?.value || 'un';
    const price = Math.max(0, numBR($('#productPrice')?.value));
    const brand = $('#productBrand')?.value?.trim() || '';
    if(!name){ playSound('error'); toast('Digite o nome do produto.', 'error'); $('#productName')?.focus(); return; }

    const duplicado = customProducts.findIndex((p, i) => i !== editandoProduto && p.name.toLowerCase() === name.toLowerCase());
    if (duplicado >= 0) {
      if (!await uiConfirm('Já existe um produto chamado "' + name + '". Substituir?', { okLabel: 'Substituir' })) return;
    }
    const dados = { name, category, unit, price, brand };
    if (editandoProduto >= 0 && customProducts[editandoProduto]) customProducts[editandoProduto] = dados;
    else customProducts.push(dados);
    if (duplicado >= 0) customProducts.splice(duplicado, 1);

    // tambem alimenta as sugestoes de digitacao da lista
    suggestions[name] = { count: (suggestions[name]?.count || 0) + 1, lastPrice: price, lastCategory: category, lastUnit: unit, lastAt: Date.now() };
    save();
    const editou = editandoProduto >= 0;
    fecharFolhaProduto();
    delete $('#productCategory').dataset.manual;
    renderProducts();
    playSound('success');
    toast(editou ? 'Produto atualizado' : name + ' cadastrado', 'success', 2400);
  });

  // ===== Inicialização =====
  function init(){
    renderQuickChips();
    render();
    renderReports();
    renderUserLists();
    renderHistorico();
    renderProducts();
    // testes simples de sanidade (dev)
    window.__listou = { items, history, suggestions, priceHistory, render, renderReports };
  }
    // Sugestão "leitura de pensamento" baseada em padrões do usuário e itens atuais
    function renderMindReadingSuggestions() {
      let box = document.getElementById('mindReadingSuggestions');
      if (!box) {
        box = document.createElement('div');
        box.id = 'mindReadingSuggestions';
        box.className = 'p-3 my-3 rounded-lg bg-emerald-900/10 text-emerald-900';
        const parent = document.getElementById('listContainer') || listEl.parentElement;
        if (parent) parent.insertBefore(box, parent.firstChild);
      }
      // Coletar nomes dos itens já na lista
      const currentNames = new Set(items.map(i => (i.name||'').toLowerCase()));
      // Frequência histórica dos itens
        const freq = {};
        history.forEach(h => h.items.forEach(i => {
          const k = (i.name||'').toLowerCase();
          if (!currentNames.has(k)) freq[k] = (freq[k]||0) + 1;
        }));
        // Exibe "lendo sua memória de compras..." com bola de cristal
        box.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-size:15px;">'
          +'<span style="font-size:1.6em;">🔮</span>'
          +' <span class="muted">lendo sua memória de compras...</span>'
          +'</div>';
        setTimeout(()=>{
          if (allSugs.length === 0) {
            box.innerHTML = '';
            return;
          }
          box.innerHTML = '<b>🔮 Lendo sua mente com base no seu padrão de compras...</b><br>' +
            allSugs.map(n => {
              const meta = suggestions[n] || {};
              const display = n.charAt(0).toUpperCase() + n.slice(1);
              const hint = meta.lastPrice ? (' • ' + money(meta.lastPrice)) : '';
              return `<button class=\"px-3 py-1 m-1 rounded-full bg-white/20 hover:bg-white/40\" style=\"font-size:13px;\" onclick=\"window.upsertItemFromSuggestion && window.upsertItemFromSuggestion('${n.replace(/'/g,"\\'")}')\">+ ${display}${hint}</button>`;
            }).join(' ');
        }, 900);
      // Itens mais frequentes não presentes na lista atual
      const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
      // Também sugerir itens "combinados" (comprados juntos)
      const combos = {};
      history.forEach(h => {
        const names = h.items.map(i => (i.name||'').toLowerCase());
        names.forEach(n1 => {
          if (!currentNames.has(n1)) {
            names.forEach(n2 => {
              if (currentNames.has(n2) && n1 !== n2) {
                combos[n1] = (combos[n1]||0) + 1;
              }
            });
          }
        });
      });
      const comboTop = Object.entries(combos).sort((a,b)=>b[1]-a[1]).slice(0,3);
      // Unir sugestões
      const allSugs = [...new Set([...top.map(x=>x[0]), ...comboTop.map(x=>x[0])])].filter(n=>n);
      if (allSugs.length === 0) {
        box.innerHTML = '';
        return;
      }
      box.innerHTML = '<b>💡 Sugestões para você (baseado no seu histórico):</b><br>' +
        allSugs.map(n => {
          const meta = suggestions[n] || {};
          const display = n.charAt(0).toUpperCase() + n.slice(1);
          const hint = meta.lastPrice ? (' • ' + money(meta.lastPrice)) : '';
          return `<button class="px-3 py-1 m-1 rounded-full bg-white/20 hover:bg-white/40" style="font-size:13px;" onclick="window.upsertItemFromSuggestion && window.upsertItemFromSuggestion('${n.replace(/'/g,"\\'")}')">+ ${display}${hint}</button>`;
        }).join(' ');
    }
    // Função global para adicionar sugestão
    window.upsertItemFromSuggestion = function(name) {
      const meta = suggestions[name] || {};
      upsertItem({ name, category: meta.lastCategory||'Outros', unit: meta.lastUnit||'un', qty: 1, price: meta.lastPrice||0 });
    }
  init();

})();