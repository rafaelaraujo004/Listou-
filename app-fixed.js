// app.js - Lógica principal da UI do Listou
// v2: Sistema inteligente com categorias, sugestões, análise de padrões e preços
// v3: Interface com sidebar moderna e navegação por seções

// Import com tratamento de erro
async function loadModules() {
    try {
        const { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate, 
                dbAddSupermarket, dbGetSupermarkets, dbUpdateSupermarket, dbDeleteSupermarket, dbGetSupermarketById } = await import('./db.js');
        const { scanQRCode } = await import('./qr.js');
        const { IntelligenceManager } = await import('./intelligence.js');
        const { AnalyticsManager } = await import('./analytics.js');
        const { NotificationManager } = await import('./notifications.js');
        
        return {
            dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate,
            dbAddSupermarket, dbGetSupermarkets, dbUpdateSupermarket, dbDeleteSupermarket, dbGetSupermarketById,
            scanQRCode, IntelligenceManager, AnalyticsManager, NotificationManager
        };
    } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        return null;
    }
}

// Variáveis globais
let currentItems = [];
let intelligence, analytics, notifications;
let supermarkets = [];
let currentSupermarket = null;

// Variáveis DOM globais
let itemInput, categorySelect, addItemBtn, autocompleteList;

// Carrega módulos e inicializa o app
async function initApp() {
    try {
        console.log('🚀 Inicializando Listou...');
        
        const modules = await loadModules();
        if (!modules) {
            console.error('❌ Falha ao carregar módulos');
            return;
        }

        // Torna as funções do banco globais
        window.dbAddItem = modules.dbAddItem;
        window.dbGetItems = modules.dbGetItems;
        window.dbUpdateItem = modules.dbUpdateItem;
        window.dbDeleteItem = modules.dbDeleteItem;
        window.dbGetTemplates = modules.dbGetTemplates;
        window.dbLoadTemplate = modules.dbLoadTemplate;
        window.dbAddSupermarket = modules.dbAddSupermarket;
        window.dbGetSupermarkets = modules.dbGetSupermarkets;
        window.dbUpdateSupermarket = modules.dbUpdateSupermarket;
        window.dbDeleteSupermarket = modules.dbDeleteSupermarket;
        window.dbGetSupermarketById = modules.dbGetSupermarketById;
        window.scanQRCode = modules.scanQRCode;

        // Inicializa managers
        intelligence = new modules.IntelligenceManager();
        analytics = new modules.AnalyticsManager();
        notifications = new modules.NotificationManager();

        console.log('✅ Módulos carregados com sucesso');
        
        // Inicializa interface
        initInterface();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
}

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

// Adiciona novo item com inteligência
async function handleAddItem() {
    console.log('handleAddItem chamada');
    
    if (!itemInput) {
        console.error('itemInput não encontrado');
        return;
    }
    
    const name = itemInput.value.trim();
    console.log('Nome do item:', name);
    
    if (!name) {
        console.log('Nome vazio, retornando');
        return;
    }

    console.log('Adicionando item:', name);

    const category = categorySelect?.value || (intelligence ? intelligence.detectCategory(name) : 'outros');
    console.log('Categoria detectada:', category);
    
    const priceInput = document.getElementById('item-price-input');
    const qtyInput = document.getElementById('item-qty-input');
    let price = priceInput && priceInput.value ? parseFloat(priceInput.value.replace(',', '.')) : undefined;
    if (isNaN(price)) price = undefined;
    let qty = qtyInput && qtyInput.value ? parseInt(qtyInput.value, 10) : 1;
    if (isNaN(qty) || qty < 1) qty = 1;

    try {
        // Verifica se já existe um item igual (case-insensitive)
        const existing = currentItems.find(i => i.name.trim().toLowerCase() === name.toLowerCase());
        
        if (existing) {
            // Soma a quantidade
            const novaQtd = (parseInt(existing.qty, 10) || 1) + qty;
            await window.dbUpdateItem(existing.id, { qty: novaQtd });
            // Atualiza preço se informado
            if (price !== undefined && !isNaN(price)) {
                await window.dbUpdateItem(existing.id, { price });
            }
        } else {
            const newItem = {
                name,
                category,
                qty,
                bought: false,
                addedAt: new Date().toISOString(),
                price
            };
            await window.dbAddItem(newItem);
        }

        // Limpa os campos
        itemInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (priceInput) priceInput.value = '';
        if (qtyInput) qtyInput.value = '';
        
        hideAutocomplete();
        await refreshList();
        console.log('✅ Item adicionado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao adicionar item:', error);
        alert('Erro ao adicionar item. Tente novamente.');
    }
}

// Atualiza lista de itens
async function refreshList() {
    try {
        console.log('🔄 Atualizando lista...');
        currentItems = await window.dbGetItems();
        
        const shoppingList = document.getElementById('shopping-list');
        if (!shoppingList) {
            console.error('Elemento shopping-list não encontrado');
            return;
        }

        if (currentItems.length === 0) {
            shoppingList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <h3>Sua lista está vazia</h3>
                    <p>Adicione itens acima para começar sua lista de compras</p>
                </div>
            `;
            updateStats();
            return;
        }

        shoppingList.innerHTML = '';
        
        currentItems.forEach(item => {
            const li = document.createElement('li');
            li.className = `list-item ${item.bought ? 'purchased' : ''}`;
            li.setAttribute('data-id', item.id);
            
            const price = item.price !== undefined && item.price !== null ? 
                `R$ ${parseFloat(item.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 
                'R$ --';
            
            li.innerHTML = `
                <div class="item-checkbox ${item.bought ? 'checked' : ''}" onclick="toggleItemBought(${item.id})">
                    <span class="checkmark">✓</span>
                </div>
                <div class="item-content">
                    <span class="item-name">${item.name}</span>
                    <div class="item-details">
                        <span class="item-qty">Qtd: ${item.qty}</span>
                        <span class="item-price">${price}</span>
                        <span class="item-category">${item.category || 'outros'}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" onclick="editItem(${item.id})" title="Editar">✏️</button>
                    <button class="btn-icon" onclick="deleteItem(${item.id})" title="Remover">🗑️</button>
                </div>
            `;
            
            shoppingList.appendChild(li);
        });
        
        updateStats();
        console.log('✅ Lista atualizada');
        
    } catch (error) {
        console.error('❌ Erro ao carregar lista:', error);
    }
}

// Alterna estado de comprado do item
async function toggleItemBought(itemId) {
    try {
        const item = currentItems.find(i => i.id === itemId);
        if (!item) return;
        
        const newState = !item.bought;
        await window.dbUpdateItem(itemId, { bought: newState });
        
        // Atualiza no array local
        item.bought = newState;
        
        // Atualiza visualmente
        const listItem = document.querySelector(`[data-id="${itemId}"]`);
        if (listItem) {
            listItem.classList.toggle('purchased', newState);
            const checkbox = listItem.querySelector('.item-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', newState);
            }
        }
        
        updateStats();
        console.log(`Item ${newState ? 'marcado' : 'desmarcado'} como comprado`);
        
    } catch (error) {
        console.error('Erro ao alterar status do item:', error);
    }
}

// Remove item da lista
async function deleteItem(itemId) {
    try {
        const item = currentItems.find(i => i.id === itemId);
        if (!item) return;
        
        if (confirm(`Remover "${item.name}" da lista?`)) {
            await window.dbDeleteItem(itemId);
            await refreshList();
            console.log('Item removido');
        }
    } catch (error) {
        console.error('Erro ao remover item:', error);
    }
}

// Atualiza estatísticas
function updateStats() {
    const totalItems = currentItems.length;
    const completedItems = currentItems.filter(item => item.bought).length;
    const totalValue = currentItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.qty) || 1;
        return sum + (price * qty);
    }, 0);
    
    // Atualiza elementos da interface
    const statsElements = {
        'total-items': totalItems,
        'completed-items': completedItems,
        'total-value': `R$ ${totalValue.toFixed(2).replace('.', ',')}`
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Mostra autocomplete
function showAutocomplete(suggestions) {
    if (!autocompleteList || suggestions.length === 0) {
        hideAutocomplete();
        return;
    }
    
    autocompleteList.innerHTML = '';
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            itemInput.value = suggestion;
            hideAutocomplete();
            handleAddItem();
        });
        autocompleteList.appendChild(item);
    });
    
    autocompleteList.classList.remove('autocomplete-hidden');
}

// Esconde autocomplete
function hideAutocomplete() {
    if (autocompleteList) {
        autocompleteList.classList.add('autocomplete-hidden');
    }
}

// Alternância de tema claro/escuro
function setTheme(theme) {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f8f9fa' : '#0a0b0d');
    localStorage.setItem('listou-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.classList.contains('theme-light') ? 'light' : 'dark';
    setTheme(current === 'light' ? 'dark' : 'light');
}

function initInterface() {
    console.log('🎯 Inicializando interface...');
    
    // Busca elementos DOM
    itemInput = document.getElementById('item-input');
    categorySelect = document.getElementById('category-select');
    addItemBtn = document.getElementById('add-item-btn');
    autocompleteList = document.getElementById('autocomplete-list');
    
    if (!itemInput) {
        console.error('❌ Elemento item-input não encontrado!');
        return;
    }
    
    console.log('✅ Elementos DOM encontrados');
    
    // Event listeners para adicionar itens
    if (itemInput) {
        itemInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 2 && intelligence) {
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
    }

    if (addItemBtn) {
        addItemBtn.addEventListener('click', (e) => {
            console.log('🔘 Botão + clicado');
            e.preventDefault();
            handleAddItem();
        });
    }

    // Clique fora do autocomplete
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#add-item-section')) {
            hideAutocomplete();
        }
    });

    // Aplica o tema salvo
    const saved = localStorage.getItem('listou-theme');
    setTheme(saved === 'light' ? 'light' : 'dark');

    // Carrega dados e inicia app
    refreshList();
    
    console.log('✅ Interface inicializada');
}

// Torna funções globais
window.toggleItemBought = toggleItemBought;
window.deleteItem = deleteItem;
window.editItem = function(itemId) {
    const item = currentItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newName = prompt('Novo nome:', item.name);
    if (newName && newName.trim() !== item.name) {
        window.dbUpdateItem(itemId, { name: newName.trim() }).then(() => {
            refreshList();
        });
    }
};

// Inicialização principal
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM carregado, iniciando app...');
    await initApp();
});

console.log('📱 Listou carregado!');
