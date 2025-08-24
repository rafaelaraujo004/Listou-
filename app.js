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
  // Fecha sidebar ao clicar fora dela (mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 900 && document.body.classList.contains('sidebar-open')) {
      if (!sidebar.contains(e.target) && !toggleSidebar.contains(e.target)) {
        sidebar.classList.add('hidden');
        document.body.classList.remove('sidebar-open');
        if (closeSidebar) closeSidebar.classList.add('hidden');
      }
    }
  });
});
  // Função para limpar todos os dados do usuário
  function clearAllUserData() {
    if(confirm('Tem certeza que deseja remover todos os dados? Esta ação não pode ser desfeita.')) {
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
    function renderHistorico() {
      const list = document.getElementById('historicoList');
      const vazio = document.getElementById('historicoVazio');
      if (!list || !vazio) return;
      list.innerHTML = '';
      if (!history.length) {
        vazio.style.display = '';
        return;
      }
      vazio.style.display = 'none';
      history.forEach(entry => {
        const li = document.createElement('li');
        const data = new Date(entry.at);
        const nome = entry.name || data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR').slice(0,5);
        // Calcula total da compra
        const total = (entry.items||[]).reduce((sum, it) => sum + ((Number(it.qty)||0)*(Number(it.price)||0)), 0);
        // Mercado salvo
        const mercado = entry.market || entry.mercado || '—';
        li.className = 'flex items-center justify-between bg-white/10 rounded p-2';
        li.innerHTML = `<div><b>${nome}</b><br><span class='text-xs muted'>${data.toLocaleString('pt-BR')}</span><br><span class='text-xs'>Mercado: <b>${mercado}</b></span><br><span class='text-xs'>Total: <b>${money(total)}</b></span></div>
          <button class='px-2 py-1 ml-2 rounded bg-blue-600 hover:bg-blue-700 text-xs' data-restore='${entry.id}'>Usar</button>`;
        list.appendChild(li);
      });
      // Evento para restaurar lista
      list.querySelectorAll('button[data-restore]').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = btn.getAttribute('data-restore');
          const entry = history.find(h => h.id === id);
          if (!entry) return;
          if (!confirm('Deseja substituir sua lista atual por esta do histórico?')) return;
          items = entry.items.map(i => Object.assign({}, i));
          save();
          render();
          setTab('lista');
          alert('Lista restaurada do histórico!');
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
    THEME: 'listou.theme.v1'
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

  function save(){
    localStorage.setItem(K.ITEMS, JSON.stringify(items));
    localStorage.setItem(K.HISTORY, JSON.stringify(history));
    localStorage.setItem(K.SUG, JSON.stringify(suggestions));
    localStorage.setItem(K.PRICEH, JSON.stringify(priceHistory));
    localStorage.setItem(K.USERLISTS, JSON.stringify(userLists));
    localStorage.setItem(K.MARKET, currentMarket || '');
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
    
    // Add spin animation to theme icon
    const themeIcon = $('#themeIcon');
    if (themeIcon) {
      themeIcon.classList.add('spin');
      setTimeout(() => themeIcon.classList.remove('spin'), 300);
    }
  }
  
  function updateThemeLabel() {
    const label = $('#themeLabel');
    if (label) {
      label.textContent = currentTheme === 'light' ? 'Modo claro' : 'Modo escuro';
    }
  }
  
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
    $$('.tab-section').forEach(s=>s.classList.add('hidden'));
    $('#tab-'+id)?.classList.remove('hidden');
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
    }
    // Alterna exibição da seção Histórico (agora no main)
    if (btn.getAttribute('data-tab') === 'historico') {
      renderHistorico();
    }
  }));
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
      card.querySelector('.remove-btn').onclick = ()=> {
        if(confirm('Remover sugestão?')) {
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
          if(!newName) return alert('Nome obrigatório');
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
  nameInput?.addEventListener('focus', ()=> showSuggestions(''));
  nameInput?.addEventListener('input', (e)=> showSuggestions(e.target.value));
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
    // Sugestões do usuário filtradas
    const userSugs = Object.keys(suggestions)
      .filter(n=> !/^\s*(teste|dev|tmp)\b/i.test(n))
      .filter(n=> !q || n.toLowerCase().includes(q));
    // Catálogo filtrado
    const catSugs = catalogo.filter(n=> !q || n.toLowerCase().includes(q));
    // Unir e limitar sugestões
    const all = [...new Set([...userSugs, ...catSugs])].slice(0, 20);
    box.innerHTML='';
    if(!all.length){ box.classList.add('hidden'); return; }
    all.forEach(n=>{
      const m = suggestions[n] || {};
      const display = n;
      const row = document.createElement('button'); row.type='button';
      row.className='w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2';
      row.innerHTML = '<span class="font-medium">'+display+'</span><span class="text-[11px] muted">'+(m.lastUnit||'un')+' • '+(m.lastCategory||'Outros')+' • '+money(m.lastPrice||0)+'</span>';
      row.addEventListener('click', ()=>{ upsertItem({ name:n, category:m.lastCategory||'Outros', unit:m.lastUnit||'un', qty:1, price:m.lastPrice||0 }); box.classList.add('hidden'); });
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
          if(partial.price!=null) e.price = partial.price;
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
  // Ordenar: não comprados por ordem de adição (mais antigos no final), comprados pode manter ordem atual
  notDone.sort((a, b) => (a.createdAt||0) - (b.createdAt||0));

    listEl.innerHTML='';
    // Valor previsto: soma de todos os itens, independente do status
    let previsto = items.reduce((sum, it) => sum + ((Number(it.qty)||0)*(Number(it.price)||0)), 0);
    let realizado = 0;

    // Renderizar não comprados
    notDone.forEach((it)=>{
      const idx = items.indexOf(it);
      const card = document.createElement('div');
      card.className = 'shopping-card rounded-lg p-3 flex flex-col gap-2 shadow-sm border min-h-[80px]';
      card.innerHTML =
        '<div class="flex items-start justify-between gap-2">'
        + '<div class="flex items-center gap-1 flex-1 min-w-0">'
        + '<button data-del="'+idx+'" class="delete-btn ml-1 p-0.5 w-7 h-7 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors text-xs flex-shrink-0" title="Remover" style="min-width:24px;min-height:24px;max-width:24px;max-height:24px;">🗑️</button>'
        + '<input type="checkbox" data-i="'+idx+'" data-act="toggle" '+(it.done?'checked':'')+' class="accent-emerald-500 w-4 h-4 flex-shrink-0">'
        + '<span class="item-name flex-1 text-sm word-break-all '+(it.done?'line-through opacity-80 text-emerald-600 selected-item':'')+'" style="font-weight:bold; cursor:pointer;" data-i="'+idx+'" data-act="toggleByName">'+(it.name||'Item sem nome')+'</span>'
        + '</div>'
        + '<div class="item-actions">'
        + '<button data-del="'+idx+'" class="delete-btn ml-1 p-0.5 w-7 h-7 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors text-xs flex-shrink-0" title="Remover" style="min-width:24px;min-height:24px;max-width:24px;max-height:24px;">🗑️</button>'
        + '</div>'
        + '</div>'
  + '<div class="item-info-compact text-xs flex flex-col gap-1 items-center w-full">'
  +   '<div class="flex flex-row gap-4 w-full justify-center">'
  +     '<span class="flex flex-col items-center"><span class="label">Quantidade</span> <input type="text" pattern="[0-9.,]*" inputmode="decimal" placeholder="Quantidade" autocomplete="off" value="'+it.qty+'" data-i="'+idx+'" data-f="qty" class="w-12 text-xs ml-1 text-center" /></span>'
  +     '<span class="flex flex-col items-center"><span class="label">Preço</span> <input type="text" pattern="[0-9.,]*" inputmode="decimal" placeholder="Preço" autocomplete="off" value="'+it.price+'" data-i="'+idx+'" data-f="price" class="w-14 text-xs ml-1 text-center" /></span>'
  +   '</div>'
  +   '<div class="flex flex-row gap-4 w-full justify-center">'
  +     '<span class="flex flex-col items-center"><span class="label">Unidade</span> <select data-i="'+idx+'" data-f="unit" class="text-xs w-12 ml-1 text-center">'+
  ['un','kg','g','L','ml','pct'].map(u=>'<option '+(u===(it.unit||'un')?'selected':'')+'>'+u+'</option>').join('')+
  '  </select></span>'
  +     '<span class="flex flex-col items-center"><span class="label">Categoria</span> <select data-i="'+idx+'" data-f="category" class="text-xs w-20 ml-1 text-center">'+
  ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Outros'].map(c=>'<option '+(c===(it.category||'Outros')?'selected':'')+'>'+c+'</option>').join('')+
  '  </select></span>'
  +   '</div>'
  + '</div>';
      listEl.appendChild(card);
    });

    // Renderizar comprados
    done.forEach((it)=>{
      const idx = items.indexOf(it);
      const subtotal = (Number(it.qty)||0)*(Number(it.price)||0);
      realizado+=subtotal;
      const card = document.createElement('div');
      card.className = 'shopping-card rounded-lg p-3 flex flex-col gap-2 shadow-sm border min-h-[80px] opacity-70';
      card.innerHTML =
        '<div class="flex items-start justify-between gap-2">'
        + '<div class="flex items-center gap-1 flex-1 min-w-0">'
        + '<button data-del="'+idx+'" class="delete-btn ml-1 p-0.5 w-7 h-7 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors text-xs flex-shrink-0" title="Remover" style="min-width:24px;min-height:24px;max-width:24px;max-height:24px;">🗑️</button>'
        + '<input type="checkbox" data-i="'+idx+'" data-act="toggle" '+(it.done?'checked':'')+' class="accent-emerald-500 w-4 h-4 flex-shrink-0">'
        + '<span class="item-name flex-1 text-sm word-break-all '+(it.done?'line-through opacity-80 text-emerald-600 selected-item':'')+'" style="font-weight:bold; cursor:pointer;" data-i="'+idx+'" data-act="toggleByName">'+(it.name||'Item sem nome')+'</span>'
        + '</div>'
        + '<div class="item-actions">'
        + '<button data-del="'+idx+'" class="delete-btn ml-1 p-0.5 w-7 h-7 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors text-xs flex-shrink-0" title="Remover" style="min-width:24px;min-height:24px;max-width:24px;max-height:24px;">🗑️</button>'
        + '</div>'
        + '</div>'
  + '<div class="item-info-compact text-xs flex flex-col gap-1 items-center w-full">'
  +   '<div class="flex flex-row gap-4 w-full justify-center">'
  +     '<span class="flex flex-col items-center"><span class="label">Qtd:</span> <input type="number" min="0.01" step="0.01" value="'+it.qty+'" data-i="'+idx+'" data-f="qty" class="w-12 text-xs ml-1 text-center" /></span>'
  +     '<span class="flex flex-col items-center"><span class="label">Preço:</span> <input type="number" step="0.01" min="0" value="'+it.price+'" data-i="'+idx+'" data-f="price" class="w-14 text-xs ml-1 text-center" /></span>'
  +   '</div>'
  +   '<div class="flex flex-row gap-4 w-full justify-center">'
  +     '<span class="flex flex-col items-center"><span class="label">Un.:</span> <select data-i="'+idx+'" data-f="unit" class="text-xs w-12 ml-1 text-center">'+
  ['un','kg','g','L','ml','pct'].map(u=>'<option '+(u===(it.unit||'un')?'selected':'')+'>'+u+'</option>').join('')+
  '  </select></span>'
  +     '<span class="flex flex-col items-center"><span class="label">Cat.:</span> <select data-i="'+idx+'" data-f="category" class="text-xs w-20 ml-1 text-center">'+
  ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Outros'].map(c=>'<option '+(c===(it.category||'Outros')?'selected':'')+'>'+c+'</option>').join('')+
  '  </select></span>'
  +   '</div>'
  + '</div>';
      listEl.appendChild(card);
    });

  // Atualiza contador para mostrar quantos itens estão sendo exibidos
  $('#count') && ($('#count').textContent = (notDone.length + done.length) + ' itens' + (catFilter ? ' ('+catFilter+')' : ''));
    $('#progress') && ($('#progress').textContent = '');
    $('#kpiPrevisto') && ($('#kpiPrevisto').textContent = money(previsto));
    $('#kpiRealizado') && ($('#kpiRealizado').textContent = money(realizado));
  save();
  renderInsights();
  updateGradient();
  }

  // Atualiza lista ao mudar filtro de categoria
  $('#categoryFilter') && $('#categoryFilter').addEventListener('change', render);
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
        // Remove tudo que não for número, vírgula ou ponto, mas mantém a vírgula digitada
        let before = inputEl.value;
        let beforeCursor = cursorPos;
        val = val.replace(/[^0-9.,]/g, '');
        // Corrige posição do cursor se vírgula foi digitada
        let after = val;
        let diff = after.length - before.length;
        let newCursor = beforeCursor + diff;
        items[i][f] = val;
        setTimeout(()=>{
          inputEl.value = items[i][f];
          try { inputEl.setSelectionRange(newCursor, newCursor); } catch(e){}
        }, 0);
      }
  // Atualiza valor previsto ao digitar
  let previsto = items.reduce((sum, it) => sum + ((Number(it.qty)||0)*(Number(it.price)||0)), 0);
  $('#kpiPrevisto') && ($('#kpiPrevisto').textContent = money(previsto));
    } else {
      items[i][f] = val;
    }
    if(f==='price' && items[i][f] !== ''){ trackPriceForHistory(items[i]); }
    if((f==='name' || f==='category' || f==='unit' || f==='price') && items[i][f] !== '') learnFromItem(items[i]);
    save();
    // Não chama render() aqui para não perder o foco do input
  });
  listEl.addEventListener('change', (e)=>{
    if(e.target.getAttribute('data-act')==='toggle'){
      const i = Number(e.target.getAttribute('data-i')); items[i].done = !!e.target.checked; save(); render();
    }
  });
  listEl.addEventListener('click', (e)=>{
    const del = e.target.getAttribute('data-del');
    if(del!=null){ items.splice(Number(del),1); save(); render(); return; }
    const act = e.target.getAttribute('data-act');
    if(act==='toggleByName'){
      // Clique no nome do item: marcar como selecionado
      const i = Number(e.target.getAttribute('data-i'));
      if(!Number.isFinite(i)) return;
      items[i].done = !items[i].done;
      save(); render(); return;
    }
  });
  // Form adicionar
  const addForm = $('#addForm');
  addForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const it = {
      name: $('#name')?.value?.trim() || '',
      category: $('#category')?.value || 'Outros',
      unit: $('#unit')?.value || 'un',
      qty: parseFloat($('#qty')?.value?.replace(',','.')) || 1,
      price: parseFloat($('#price')?.value?.replace(',','.')) || 0
    };
    if(!it.name){ alert('Dê um nome ao item.'); $('#name')?.focus(); return; }
    upsertItem(it); addForm.reset(); $('#qty') && ($('#qty').value=1); $('#unit') && ($('#unit').value='un'); $('#name')?.focus();
  });

  // Templates prontas
  $$('.tpl').forEach(btn=> btn.addEventListener('click', ()=>{
    const arr = JSON.parse(btn.getAttribute('data-template') || '[]');
    arr.forEach(it=> upsertItem(it));
    alert('Lista adicionada à sua lista atual!');
  }));

  // Copiar lista
  $('#copyList')?.addEventListener('click', ()=>{
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
      navigator.clipboard.writeText(text).then(()=>alert('Lista copiada!')).catch(()=>fallbackCopy(text));
    } else fallbackCopy(text);
  });
  function fallbackCopy(text){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); alert('Lista copiada!'); }

  // Finalizar compra
  $('#finalizar')?.addEventListener('click', ()=>{
  if(!items.length) return alert('Sua lista está vazia.');
  // Se não houver nenhum item marcado como comprado, não faz nada
  const comprados = items.filter(i => !!i.done);
  if (!comprados.length) return alert('Marque os itens comprados para finalizar a compra.');
  const nome = prompt('Deseja dar um nome para este histórico? (opcional)','');
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
  save(); render(); renderReports(); renderHistorico(); alert('Compra finalizada! Apenas os itens marcados foram considerados comprados. Os demais permanecem na lista.');
  });

  // ===== Insights =====
  let chartCategorias=null, chartABC=null;
  function renderInsights(){
    const total = items.reduce((s,i)=> s + i.qty*i.price, 0);
    const kpiItens = items.length; const ticket = kpiItens? total/kpiItens : 0; const doneVal = items.filter(i=>!!i.done).reduce((s,i)=> s + i.qty*i.price, 0);
    $('#kpiTotal') && ($('#kpiTotal').textContent = money(total));
    $('#kpiItens') && ($('#kpiItens').textContent = String(kpiItens));
    $('#kpiTicket') && ($('#kpiTicket').textContent = money(ticket));
    $('#kpiDone') && ($('#kpiDone').textContent = money(doneVal));

    const catMap={}; items.forEach(i=>{ const c=i.category||'Outros'; catMap[c]=(catMap[c]||0)+i.qty*i.price; });
    const labels=Object.keys(catMap); const data=Object.values(catMap);
    const catCanvas = $('#chartCategorias');
    if(catCanvas){ chartCategorias?.destroy(); chartCategorias = new Chart(catCanvas,{ type:'doughnut', data:{ labels, datasets:[{ data }] }, options:{ plugins:{ legend:{ position:'bottom' }}}}); }

    const sorted = items.slice().sort((a,b)=> (b.qty*b.price)-(a.qty*a.price)).slice(0,8);
    const abcCanvas = $('#chartABC');
    if(abcCanvas){ chartABC?.destroy(); chartABC = new Chart(abcCanvas,{ type:'bar', data:{ labels: sorted.map(i=> i.name||'—'), datasets:[{ data: sorted.map(i=> i.qty*i.price) }] }, options:{ plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true }}}}); }
  }

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

  function renderReports(){
    refreshReportItemSelect();
    const sel=$('#reportItemSelect'); if(sel){ sel.onchange = ()=>{ renderMarketComparison(); }; }
    renderMarketComparison(); renderRankingVar();

    // Comparação automática do supermercado mais barato
    const cheapestBox = document.getElementById('cheapestMarketBox');
    if (cheapestBox) {
      let marketTotals = {};
      // Soma todos os preços mais recentes de cada item por mercado
      Object.keys(priceHistory).forEach(itemName => {
        const markets = priceHistory[itemName];
        Object.keys(markets).forEach(market => {
          const arr = markets[market];
          if (arr && arr.length) {
            const last = arr[arr.length-1];
            marketTotals[market] = (marketTotals[market]||0) + (last.price||0);
          }
        });
      });
      let cheapest = null;
      let cheapestValue = null;
      Object.entries(marketTotals).forEach(([market, total]) => {
        if (cheapestValue === null || total < cheapestValue) {
          cheapest = market;
          cheapestValue = total;
        }
      });
      if (cheapest) {
        cheapestBox.innerHTML = `<div class="p-3 rounded-lg bg-emerald-900/60 text-emerald-200 flex items-center gap-2"><span class="font-bold">Supermercado mais barato:</span> <span class="font-semibold">${cheapest}</span> <span class="ml-2 text-xs">(total estimado: <b>${money(cheapestValue)}</b>)</span></div>`;
      } else {
        cheapestBox.innerHTML = '<div class="p-3 rounded-lg bg-slate-800/60 text-slate-300">Não há dados suficientes para comparar supermercados.</div>';
      }
    }
      const chartMarketsTotalCanvas = document.getElementById('chartMarketsTotal');
      const cheapestProductsBox = document.getElementById('cheapestProductsBox');
      let marketProducts = {};
      // Soma todos os preços mais recentes de cada item por mercado
      Object.keys(priceHistory).forEach(itemName => {
        const markets = priceHistory[itemName];
        Object.keys(markets).forEach(market => {
          const arr = markets[market];
          if (arr && arr.length) {
            const last = arr[arr.length-1];
            marketTotals[market] = (marketTotals[market]||0) + (last.price||0);
            if (!marketProducts[market]) marketProducts[market] = [];
            marketProducts[market].push({ name: itemName, price: last.price });
          }
        });
      });
      // Gráfico de barras dos mercados
      if (chartMarketsTotalCanvas) {
        if (window.chartMarketsTotal) window.chartMarketsTotal.destroy();
        const labels = Object.keys(marketTotals);
        const data = Object.values(marketTotals);
        const bgColors = labels.map(m => m === cheapest ? 'rgba(16,185,129,0.7)' : 'rgba(59,130,246,0.5)');
        window.chartMarketsTotal = new Chart(chartMarketsTotalCanvas, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Total estimado', data, backgroundColor: bgColors }] },
          options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }
      // Produtos mais baratos por mercado
      if (cheapestProductsBox) {
        let html = '';
        Object.entries(marketProducts).forEach(([market, prods]) => {
          prods.sort((a,b)=>a.price-b.price);
          html += `<div class="mb-2"><span class="font-bold">${market}:</span> `;
          html += prods.slice(0,5).map(p=> `<span class="inline-block bg-white/10 rounded px-2 py-1 mx-1 text-xs">${p.name} <b>${money(p.price)}</b></span>`).join('');
          html += '</div>';
        });
        cheapestProductsBox.innerHTML = html || '<span class="muted">Sem dados de produtos.</span>';
      }

    const byMonth = {};
    history.forEach(h=>{ const d=new Date(h.at); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); byMonth[k]=(byMonth[k]||0)+h.total; });
    const mLabels = Object.keys(byMonth).sort(); const mData = mLabels.map(k=> byMonth[k]);
    const mesCanvas = $('#chartGastosMes');
    if(mesCanvas){ chartMes?.destroy(); chartMes = new Chart(mesCanvas,{ type:'line', data:{ labels:mLabels, datasets:[{ label:'Gastos (R$)', data:mData, tension:0.2 }] }, options:{ plugins:{ legend:{ position:'bottom' }}}}); }

    const freq = {};
    history.forEach(h=> h.items.forEach(i=>{ const k=i.name||'—'; freq[k]=(freq[k]||0)+i.qty; }));
    const fEntries = Object.entries(freq).sort((a,b)=> b[1]-a[1]).slice(0,10);
    const fLabels = fEntries.map(x=>x[0]); const fData = fEntries.map(x=>x[1]);
    const freqCanvas = $('#chartFreq');
    if(freqCanvas){ chartFreq?.destroy(); chartFreq = new Chart(freqCanvas,{ type:'bar', data:{ labels:fLabels, datasets:[{ label:'Frequência', data:fData }] }, options:{ plugins:{ legend:{ position:'bottom' }}, scales:{ y:{ beginAtZero:true }}}}); }
  }

  // ===== Mercado =====
  const marketInput = $('#market'); const saveMarketBtn = $('#saveMarket');
  if(marketInput) marketInput.value = currentMarket || '';
  saveMarketBtn?.addEventListener('click', ()=>{ currentMarket = (marketInput.value||'').trim(); save(); alert('Mercado salvo: '+(currentMarket||'—')); });

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
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-load'));
        if (!Number.isFinite(idx) || !userLists[idx]) return;
        if (!confirm('Substituir a lista atual pela lista salva?')) return;
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
          const categorias = ['Mercearia','Laticínios','Hortifruti','Limpeza','Higiene','Bebidas','Carnes','Outros'];
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
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-remove'));
        if (!Number.isFinite(idx) || !userLists[idx]) return;
        if (!confirm('Remover esta lista salva?')) return;
        userLists.splice(idx, 1);
        save(); renderUserLists();
      });
    });
  }
  // ...função de salvar lista atual removida...

  // ===== Inicialização =====
  function init(){
    renderQuickChips();
    render();
    renderReports();
    renderUserLists();
  renderHistorico();
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
            box.innerHTML = '<span class="muted">Nenhuma sugestão de compra baseada no seu histórico.</span>';
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
        box.innerHTML = '<span class="muted">Nenhuma sugestão de compra baseada no seu histórico.</span>';
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