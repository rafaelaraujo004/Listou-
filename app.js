// app.js - Lógica principal da UI do Listou
// v2: Sistema inteligente com categorias, sugestões, análise de padrões e preços

import { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate } from './db.js';
import { scanQRCode } from './qr.js';
import { IntelligenceManager } from './intelligence.js';
import { AnalyticsManager } from './analytics.js';
import { NotificationManager } from './notifications.js';

// Elementos DOM
const itemInput = document.getElementById('item-input');
const addItemBtn = document.getElementById('add-item-btn');
const categorySelect = document.getElementById('category-select');
const shoppingList = document.getElementById('shopping-list');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const autocompleteList = document.getElementById('autocomplete-list');
const suggestionsSection = document.getElementById('smart-suggestions');
const suggestionsList = document.getElementById('suggestions-list');
const templateBtns = document.querySelectorAll('.template-btn');
const scanQRBtn = document.getElementById('scan-qr-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const shareLinkBtn = document.getElementById('share-link-btn');
const exportListBtn = document.getElementById('export-list-btn');
const importListBtn = document.getElementById('import-list-btn');

// Analytics elements (não implementados no HTML ainda)
// const showReportBtn = document.getElementById('show-report-btn');
// const showPatternsBtn = document.getElementById('show-patterns-btn');
// const showSavingsBtn = document.getElementById('show-savings-btn');
// const analyticsContent = document.getElementById('analytics-content');

// Settings elements (não implementados no HTML ainda)
// const notificationsEnabled = document.getElementById('notifications-enabled');
// const smartSuggestionsEnabled = document.getElementById('smart-suggestions-enabled');
// const priceTrackingEnabled = document.getElementById('price-tracking-enabled');
// const autoCategoryEnabled = document.getElementById('auto-category-enabled');

// Stats elements
const totalItemsEl = document.getElementById('total-items');
const completedItemsEl = document.getElementById('completed-items');
const estimatedPriceEl = document.getElementById('estimated-price');

// Inicializar sistemas
const intelligence = new IntelligenceManager();
const analytics = new AnalyticsManager();
const notifications = new NotificationManager();
let currentItems = [];
let filteredItems = [];

// Debounce para otimizar performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Renderiza a lista com todas as informações inteligentes
function renderList(items = filteredItems) {
    shoppingList.innerHTML = '';
    
    if (items.length === 0) {
        shoppingList.innerHTML = '<li class="empty-state">📝 Sua lista está vazia. Adicione alguns itens!</li>';
        return;
    }

    items.forEach(item => {
        const isFavorite = intelligence.isFavorite(item.name);
        const estimatedPrice = intelligence.getEstimatedPrice(item.name);
        const categoryIcon = getCategoryIcon(item.category);
        
        const li = document.createElement('li');
        li.className = 'shopping-item' + (item.bought ? ' item-bought' : '');
        li.innerHTML = `
            <div class="item-info">
                <div class="item-name">
                    ${categoryIcon} ${item.name}
                    <span class="item-favorite ${isFavorite ? 'active' : ''}" data-id="${item.id}" title="Favoritar">
                        ${isFavorite ? '⭐' : '☆'}
                    </span>
                </div>
                <div class="item-details">
                    <span class="item-category">${item.category || 'outros'}</span>
                    ${estimatedPrice > 0 ? `<span class="item-price">~R$ ${(estimatedPrice * item.qty).toFixed(2)}</span>` : ''}
                </div>
            </div>
            <input class="item-qty" type="number" min="1" value="${item.qty}" data-id="${item.id}">
            <div class="item-actions">
                <button class="plus1-btn" data-id="${item.id}" title="Adicionar 1">+1</button>
                <button class="plus5-btn" data-id="${item.id}" title="Adicionar 5">+5</button>
                <button class="bought-btn ${item.bought ? 'active' : ''}" data-id="${item.id}" title="Marcar como comprado">
                    ${item.bought ? '✅' : '✓'}
                </button>
                <button class="delete-btn" data-id="${item.id}" title="Remover item">🗑️</button>
            </div>
        `;
        shoppingList.appendChild(li);
    });
    
    updateStats();
}

// Obtém ícone da categoria
function getCategoryIcon(category) {
    const icons = {
        'frutas': '🍎',
        'verduras': '🥬',
        'carnes': '🥩',
        'laticínios': '🥛',
        'padaria': '🍞',
        'limpeza': '🧽',
        'higiene': '🧴',
        'bebidas': '🥤',
        'outros': '📦'
    };
    return icons[category] || '📦';
}

// Atualiza estatísticas
function updateStats() {
    const total = currentItems.length;
    const completed = currentItems.filter(item => item.bought).length;
    const totalPrice = currentItems.reduce((sum, item) => {
        const price = intelligence.getEstimatedPrice(item.name);
        return sum + (price * item.qty);
    }, 0);
    
    totalItemsEl.textContent = total;
    completedItemsEl.textContent = completed;
    estimatedPriceEl.textContent = `R$ ${totalPrice.toFixed(2)}`;
}

// Atualiza lista filtrada
function updateFilteredList() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryFilter = filterCategory.value;
    const statusFilter = filterStatus.value;
    
    filteredItems = currentItems.filter(item => {
        const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'pending' && !item.bought) ||
                            (statusFilter === 'bought' && item.bought);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderList();
}

// Carrega e atualiza a lista
async function refreshList() {
    currentItems = await dbGetItems();
    updateFilteredList();
    updateSmartSuggestions();
}

// Adiciona novo item com inteligência
async function handleAddItem() {
    const name = itemInput.value.trim();
    if (!name) return;
    
    const category = categorySelect.value || intelligence.detectCategory(name);
    const estimatedPrice = intelligence.getEstimatedPrice(name);
    
    const newItem = {
        name,
        category,
        qty: 1,
        bought: false,
        price: estimatedPrice,
        addedAt: new Date().toISOString()
    };
    
    await dbAddItem(newItem);
    itemInput.value = '';
    categorySelect.value = '';
    hideAutocomplete();
    refreshList();
}

// Sistema de autocomplete
function showAutocomplete(suggestions) {
    if (suggestions.length === 0) {
        hideAutocomplete();
        return;
    }
    
    autocompleteList.innerHTML = '';
    suggestions.forEach((suggestion, index) => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `
            <span>${suggestion.icon} ${suggestion.name}</span>
            <small>${suggestion.category} ${suggestion.price > 0 ? `• R$ ${suggestion.price.toFixed(2)}` : ''}</small>
        `;
        div.addEventListener('click', () => {
            itemInput.value = suggestion.name;
            categorySelect.value = suggestion.category;
            hideAutocomplete();
            handleAddItem();
        });
        autocompleteList.appendChild(div);
    });
    
    autocompleteList.classList.remove('autocomplete-hidden');
}

function hideAutocomplete() {
    autocompleteList.classList.add('autocomplete-hidden');
}

// Atualiza sugestões inteligentes
function updateSmartSuggestions() {
    const suggestions = intelligence.getSmartSuggestions();
    
    if (suggestions.length === 0) {
        suggestionsSection.style.display = 'none';
        return;
    }
    
    suggestionsSection.style.display = 'block';
    suggestionsList.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion-item';
        button.innerHTML = `
            <span class="suggestion-icon">${suggestion.icon}</span>
            <span>${suggestion.name}</span>
        `;
        button.title = suggestion.reason;
        button.addEventListener('click', async () => {
            const newItem = {
                name: suggestion.name,
                category: suggestion.category,
                qty: 1,
                bought: false,
                price: intelligence.getEstimatedPrice(suggestion.name),
                addedAt: new Date().toISOString()
            };
            await dbAddItem(newItem);
            refreshList();
        });
        suggestionsList.appendChild(button);
    });
}

// Event Listeners
itemInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        const suggestions = intelligence.getAutocompleteSuggestions(query);
        showAutocomplete(suggestions);
    } else {
        hideAutocomplete();
    }
}, 300));

itemInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddItem();
    } else if (e.key === 'Escape') {
        hideAutocomplete();
    }
});

// Clique fora do autocomplete
document.addEventListener('click', (e) => {
    if (!e.target.closest('#add-item-section')) {
        hideAutocomplete();
    }
});

addItemBtn.addEventListener('click', handleAddItem);

// Filtros
searchInput.addEventListener('input', debounce(updateFilteredList, 300));
filterCategory.addEventListener('change', updateFilteredList);
filterStatus.addEventListener('change', updateFilteredList);

// Ações da lista
shoppingList.addEventListener('click', async e => {
    const id = e.target.dataset.id;
    if (!id) return;
    
    const item = currentItems.find(item => item.id === parseInt(id));
    if (!item) return;
    
    if (e.target.classList.contains('plus1-btn')) {
        await dbUpdateItem(id, { $inc: { qty: 1 } });
    } else if (e.target.classList.contains('plus5-btn')) {
        await dbUpdateItem(id, { $inc: { qty: 5 } });
    } else if (e.target.classList.contains('bought-btn')) {
        const bought = !item.bought;
        await dbUpdateItem(id, { bought });
        
        // Adiciona ao histórico quando marcado como comprado
        if (bought) {
            intelligence.addToPurchaseHistory({
                ...item,
                bought: true,
                price: item.price || intelligence.getEstimatedPrice(item.name)
            });
        }
    } else if (e.target.classList.contains('delete-btn')) {
        if (confirm('Remover este item da lista?')) {
            await dbDeleteItem(id);
        }
    } else if (e.target.classList.contains('item-favorite')) {
        const isFavorite = intelligence.toggleFavorite(item.name);
        e.target.textContent = isFavorite ? '⭐' : '☆';
        e.target.classList.toggle('active', isFavorite);
    }
    
    refreshList();
});

// Mudança de quantidade
shoppingList.addEventListener('change', async e => {
    if (e.target.classList.contains('item-qty')) {
        const id = e.target.dataset.id;
        const qty = parseInt(e.target.value, 10) || 1;
        await dbUpdateItem(id, { qty });
        updateStats(); // Atualiza stats imediatamente
    }
});

// Templates
templateBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const template = btn.dataset.template;
        const items = intelligence.getTemplate(template);
        
        if (items.length === 0) {
            alert('Template vazio ou não encontrado!');
            return;
        }
        
        // Confirma se deve limpar a lista atual
        if (currentItems.length > 0) {
            if (!confirm('Isso irá substituir sua lista atual. Continuar?')) {
                return;
            }
            // Remove todos os itens atuais
            for (const item of currentItems) {
                await dbDeleteItem(item.id);
            }
        }
        
        // Adiciona itens do template
        for (const item of items) {
            await dbAddItem({
                ...item,
                price: intelligence.getEstimatedPrice(item.name),
                addedAt: new Date().toISOString()
            });
        }
        
        refreshList();
    });
});

// Funcionalidades de compartilhamento
shareLinkBtn.addEventListener('click', async () => {
    const items = currentItems.map(item => ({
        name: item.name,
        category: item.category,
        qty: item.qty
    }));
    
    const shareData = {
        version: '1.0',
        items,
        createdAt: new Date().toISOString()
    };
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(btoa(JSON.stringify(shareData)))}`;
    
    try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link de compartilhamento copiado para a área de transferência!');
    } catch {
        prompt('Copie este link para compartilhar sua lista:', shareUrl);
    }
});

exportListBtn.addEventListener('click', () => {
    const listText = currentItems
        .map(item => `${item.bought ? '✅' : '☐'} ${item.name} (${item.qty}x)`)
        .join('\n');
    
    try {
        navigator.clipboard.writeText(listText);
        alert('Lista copiada para a área de transferência!');
    } catch {
        prompt('Copie sua lista:', listText);
    }
});

importListBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            let items = [];
            
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(text);
                items = data.items || data;
            } else {
                // Parse de texto simples
                items = text.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const qty = (line.match(/\((\d+)x\)/) || [null, '1'])[1];
                        const name = line.replace(/^[✅☐]\s*/, '').replace(/\s*\(\d+x\).*$/, '').trim();
                        return {
                            name,
                            category: intelligence.detectCategory(name),
                            qty: parseInt(qty)
                        };
                    });
            }
            
            if (items.length === 0) {
                alert('Nenhum item válido encontrado no arquivo.');
                return;
            }
            
            if (currentItems.length > 0 && !confirm('Isso irá adicionar itens à sua lista atual. Continuar?')) {
                return;
            }
            
            for (const item of items) {
                await dbAddItem({
                    ...item,
                    bought: false,
                    price: intelligence.getEstimatedPrice(item.name),
                    addedAt: new Date().toISOString()
                });
            }
            
            refreshList();
            alert(`${items.length} itens importados com sucesso!`);
        } catch (error) {
            alert('Erro ao importar arquivo. Verifique o formato.');
        }
    };
    input.click();
});

// Tema
// O event listener do tema está no final do arquivo

// QR Code (placeholder)
scanQRBtn.addEventListener('click', () => {
    scanQRCode().then(result => {
        if (result) {
            // Implementar parsing de NFC-e ou QR codes de produtos
            console.log('QR Code result:', result);
        }
    }).catch(error => {
        console.error('QR Code error:', error);
        alert('Erro ao escanear QR code ou recurso não disponível.');
    });
});

// Carrega tema salvo
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('listou-theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('theme-light');
    }
    
    // Verifica se há lista compartilhada na URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');
    if (sharedData) {
        try {
            const data = JSON.parse(atob(sharedData));
            if (data.items && confirm('Carregar lista compartilhada?')) {
                data.items.forEach(async item => {
                    await dbAddItem({
                        ...item,
                        bought: false,
                        price: intelligence.getEstimatedPrice(item.name),
                        addedAt: new Date().toISOString()
                    });
                });
                setTimeout(refreshList, 500);
            }
        } catch (error) {
            console.error('Erro ao carregar lista compartilhada:', error);
        }
        // Remove parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    refreshList();
});

// QRCode
scanQRBtn.addEventListener('click', () => {
    scanQRCode();
});

// Autocomplete (simples)
itemInput.addEventListener('input', async () => {
    // TODO: Buscar sugestões do IndexedDB
});

// PWA: registrar service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

refreshList();

// TODO: Integrar Capacitor para build Android e acesso à câmera
// https://capacitorjs.com/docs/apis/camera

// ===== Tema (dark / light) =====
const THEME_KEY = 'listou-theme';

function updateMetaThemeColor(theme){
    const meta = document.getElementById('meta-theme-color');
    if(!meta) return;
    meta.setAttribute('content', theme === 'light' ? '#f8f9fa' : '#252830');
}

function applyTheme(theme, {persist=true, animate=true} = {}){
    const root = document.documentElement;
    console.log('Aplicando tema:', theme);
    if(animate) root.classList.add('theme-transition');
    if(theme === 'light') root.classList.add('theme-light'); else root.classList.remove('theme-light');
    if(persist) localStorage.setItem(THEME_KEY, theme);
    updateMetaThemeColor(theme);
    
    // Atualizar botão se existir
    if(themeToggleBtn) {
        if(theme === 'light') {
            themeToggleBtn.textContent = '☀️';
            themeToggleBtn.setAttribute('aria-label','Alternar para modo noturno');
            themeToggleBtn.dataset.mode = 'light';
        } else {
            themeToggleBtn.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label','Alternar para modo claro');
            themeToggleBtn.dataset.mode = 'dark';
        }
        console.log('Botão atualizado para:', theme, 'ícone:', themeToggleBtn.textContent);
    }
    
    // Remover classe de transição após animação
    clearTimeout(applyTheme._t);
    applyTheme._t = setTimeout(()=> root.classList.remove('theme-transition'), 500);
}

function detectPreferredTheme(){
    const stored = localStorage.getItem(THEME_KEY);
    if(stored) return stored;
    return 'light'; // Padrão sempre claro
}

// Evita flash inicial
document.documentElement.classList.add('theme-preload');
const initialTheme = detectPreferredTheme();
applyTheme(initialTheme, {persist:false, animate:false});
requestAnimationFrame(()=> document.documentElement.classList.remove('theme-preload'));

// Event listener do botão (só adiciona se o botão existir)
if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', ()=>{
        const current = localStorage.getItem(THEME_KEY) || 'light';
        console.log('Tema atual:', current, 'Alternando para:', current === 'dark' ? 'light' : 'dark');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
} else {
    console.error('Botão theme-toggle não encontrado!');
}
