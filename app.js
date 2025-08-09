// app.js - Lógica principal da UI do Listou
// v2: Sistema inteligente com categorias, sugestões, análise de padrões e preços
// v3: Interface com sidebar moderna e navegação por seções

import { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate } from './db.js';
import { scanQRCode } from './qr.js';
import { IntelligenceManager } from './intelligence.js';
import { AnalyticsManager } from './analytics.js';
import { NotificationManager } from './notifications.js';

// ===== ELEMENTOS DOM SIDE}

if (exportListBtn) {
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
}st sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebar-close');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// Elementos DOM principais
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

// Elementos sidebar actions
const sidebarShareBtn = document.getElementById('sidebar-share-btn');
const sidebarExportBtn = document.getElementById('sidebar-export-btn');
const sidebarScanBtn = document.getElementById('sidebar-scan-btn');

// Stats elements (agora duplicados para sidebar)
const totalItemsEl = document.getElementById('total-items');
const completedItemsEl = document.getElementById('completed-items');
const estimatedPriceEl = document.getElementById('estimated-price');
const sidebarTotalItemsEl = document.getElementById('sidebar-total-items');
const sidebarCompletedItemsEl = document.getElementById('sidebar-completed-items');
const sidebarEstimatedPriceEl = document.getElementById('sidebar-estimated-price');

// Elementos de funcionalidades extras que podem não existir no HTML atual
const shareLinkBtn = document.getElementById('share-link-btn');
const exportListBtn = document.getElementById('export-list-btn');
const importListBtn = document.getElementById('import-list-btn');

// ===== CONTROLE DA SIDEBAR =====
function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('show');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

function switchSection(sectionId) {
    // Remove active de todas as seções e nav items
    contentSections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    // Ativa a seção desejada
    const targetSection = document.getElementById(`section-${sectionId}`);
    const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetNavItem) targetNavItem.classList.add('active');
    
    // Fecha sidebar no mobile
    if (window.innerWidth < 1024) {
        closeSidebar();
    }
}

// Event listeners para sidebar
sidebarToggle?.addEventListener('click', toggleSidebar);
sidebarClose?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

// Event listeners para navegação
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.getAttribute('data-section');
        if (sectionId) {
            switchSection(sectionId);
        }
    });
});

// Event listeners para ações da sidebar
sidebarShareBtn?.addEventListener('click', () => shareList());
sidebarExportBtn?.addEventListener('click', () => exportList());
sidebarScanBtn?.addEventListener('click', () => scanQRCode());

// Fechar sidebar com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
    }
});

// Atualizar stats da sidebar quando stats principais mudarem
function updateSidebarStats() {
    if (sidebarTotalItemsEl && totalItemsEl) {
        sidebarTotalItemsEl.textContent = totalItemsEl.textContent;
    }
    if (sidebarCompletedItemsEl && completedItemsEl) {
        sidebarCompletedItemsEl.textContent = completedItemsEl.textContent;
    }
    if (sidebarEstimatedPriceEl && estimatedPriceEl) {
        sidebarEstimatedPriceEl.textContent = estimatedPriceEl.textContent;
    }
}

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
                <div class="item-name" data-id="${item.id}" style="cursor: pointer;" title="Clique para marcar como comprado">
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
    
    // Atualizar também as stats da sidebar
    updateSidebarStats();
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
    
    // Atualiza a seção de listas recentes com o novo item
    updateRecentLists(newItem);
}

// Atualiza a seção de listas recentes no sidebar
function updateRecentLists(newItem) {
    const recentListsContainer = document.getElementById('recent-lists');
    if (!recentListsContainer) return;
    
    // Cria um novo item para a lista recente
    const recentItem = document.createElement('div');
    recentItem.className = 'recent-item';
    
    // Define o ícone baseado na categoria do item
    const categoryIcon = getCategoryIcon(newItem.category);
    const categoryName = getCategoryDisplayName(newItem.category);
    
    recentItem.innerHTML = `
        <span class="recent-icon">${categoryIcon}</span>
        <div class="recent-info">
            <span class="recent-name">${newItem.name}</span>
            <span class="recent-date">${categoryName}</span>
        </div>
    `;
    
    // Remove o primeiro item se já existirem 3 ou mais
    const existingItems = recentListsContainer.querySelectorAll('.recent-item');
    if (existingItems.length >= 3) {
        recentListsContainer.removeChild(existingItems[existingItems.length - 1]);
    }
    
    // Adiciona o novo item no topo
    recentListsContainer.insertBefore(recentItem, recentListsContainer.firstChild);
}

// Obtém o nome amigável da categoria
function getCategoryDisplayName(category) {
    const categoryNames = {
        'frutas': 'Frutas',
        'verduras': 'Verduras',
        'carnes': 'Carnes',
        'laticínios': 'Laticínios',
        'padaria': 'Padaria',
        'limpeza': 'Limpeza',
        'higiene': 'Higiene',
        'bebidas': 'Bebidas',
        'outros': 'Outros'
    };
    return categoryNames[category] || 'Outros';
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
    } else if (e.target.classList.contains('item-name')) {
        // Clique no nome do item - alterna status de comprado
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
if (shareLinkBtn) {
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
}

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

// Carrega configurações salvas
document.addEventListener('DOMContentLoaded', () => {
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
