// app.js - Aplicativo de Lista de Compras Moderno
// Inspirado em apps populares: Bring!, AnyList, Out of Milk, Listonic

// ===== CONSTANTES E CONFIGURAÇÕES =====
const APP_CONFIG = {
    version: '2.3.0',
    name: 'Listou',
    features: {
        notifications: 'Notification' in window,
        sharing: 'share' in navigator,
        camera: 'mediaDevices' in navigator,
        geolocation: 'geolocation' in navigator
    },
    limits: {
        maxItemsPerList: 500,
        maxListNameLength: 50,
        maxItemNameLength: 100
    }
};

// ===== CATEGORIAS INTELIGENTES (inspirado no Bring!) =====
const SMART_CATEGORIES = {
    'frutas': { icon: '🍎', color: '#ff6b6b', keywords: ['maçã', 'banana', 'laranja', 'uva', 'pêra', 'manga', 'abacaxi', 'morango', 'kiwi', 'limão'] },
    'vegetais': { icon: '🥕', color: '#4ecdc4', keywords: ['cenoura', 'alface', 'tomate', 'cebola', 'batata', 'abobrinha', 'pepino', 'brócolis', 'couve'] },
    'carnes': { icon: '🥩', color: '#e74c3c', keywords: ['carne', 'frango', 'peixe', 'porco', 'linguiça', 'salsicha', 'hambúrguer', 'bacon'] },
    'laticínios': { icon: '🥛', color: '#f39c12', keywords: ['leite', 'queijo', 'iogurte', 'manteiga', 'cream cheese', 'requeijão', 'nata'] },
    'grãos': { icon: '🌾', color: '#d4a574', keywords: ['arroz', 'feijão', 'lentilha', 'grão', 'quinoa', 'aveia', 'granola'] },
    'bebidas': { icon: '🥤', color: '#3498db', keywords: ['água', 'suco', 'refrigerante', 'cerveja', 'vinho', 'café', 'chá'] },
    'limpeza': { icon: '🧽', color: '#9b59b6', keywords: ['detergente', 'sabão', 'amaciante', 'desinfetante', 'papel higiênico', 'sabonete'] },
    'higiene': { icon: '🧴', color: '#1abc9c', keywords: ['shampoo', 'condicionador', 'pasta de dente', 'escova', 'desodorante', 'creme'] },
    'padaria': { icon: '🍞', color: '#f1c40f', keywords: ['pão', 'bolo', 'biscoito', 'torrada', 'croissant', 'doce'] },
    'outros': { icon: '📦', color: '#95a5a6', keywords: [] }
};

// ===== VARIÁVEIS GLOBAIS =====
let currentItems = [];
let intelligence = null;
let analytics = null;
let notifications = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} iniciando...`);
    
    // Verificar compatibilidade
    checkBrowserCompatibility();
    
    // SETUP IMEDIATO DO SIDEBAR
    setupSidebarImmediate();
    
    // Carregar módulos
    const modules = await loadModules();
    if (!modules) {
        showError('Erro ao carregar componentes do aplicativo');
        return;
    }
    
    await initializeApp(modules);
});

// ===== SETUP IMEDIATO DO SIDEBAR =====
function setupSidebarImmediate() {
    console.log('🔧 Setup imediato do sidebar...');
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        console.log('✅ Elementos encontrados, configurando...');
        
        sidebarToggle.onclick = function(e) {
            e.preventDefault();
            console.log('🍔 CLIQUE DIRETO NO HAMBURGER!');
            
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebar.classList.add('closed');
                document.body.style.overflow = '';
                console.log('Sidebar fechada');
            } else {
                sidebar.classList.add('open');
                sidebar.classList.remove('closed');
                document.body.style.overflow = 'hidden';
                console.log('Sidebar aberta');
            }
        };
        
        console.log('✅ Event listener onclick adicionado!');
    } else {
        console.error('❌ Elementos não encontrados:', { sidebarToggle: !!sidebarToggle, sidebar: !!sidebar });
    }
}

// Backup para garantir inicialização em caso de problemas
window.addEventListener('load', () => {
    // Verificar se o sidebar ainda não foi configurado
    setTimeout(() => {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle && !sidebarToggle.hasAttribute('data-configured')) {
            console.log('Configurando sidebar via backup...');
            setupSidebar();
            sidebarToggle.setAttribute('data-configured', 'true');
        }
    }, 1000);
});

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
async function loadModules() {
    try {
        const modules = await Promise.all([
            import('./db.js'),
            import('./intelligence.js'),
            import('./analytics.js'),
            import('./notifications.js')
        ]);
        
        return {
            db: modules[0],
            intelligence: modules[1].IntelligenceManager,
            analytics: modules[2].AnalyticsManager,
            notifications: modules[3].NotificationManager
        };
    } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        
        // Retornar módulos básicos para não quebrar a aplicação
        return {
            db: await import('./db.js'),
            intelligence: null,
            analytics: null,
            notifications: null
        };
    }
}

function checkBrowserCompatibility() {
    const features = APP_CONFIG.features;
    console.log('Recursos disponíveis:', features);
    
    // Avisos para recursos não disponíveis
    if (!features.notifications) {
        console.warn('Notificações não suportadas neste navegador');
    }
}

async function initializeApp(modules) {
    const { db, intelligence: IntelligenceManager, analytics: AnalyticsManager, notifications: NotificationManager } = modules;
    
    // Inicializar sistemas (com verificação de disponibilidade)
    if (IntelligenceManager) {
        intelligence = new IntelligenceManager();
    }
    if (AnalyticsManager) {
        analytics = new AnalyticsManager();
    }
    if (NotificationManager) {
        notifications = new NotificationManager();
    }
    
    // Configurar eventos
    setupEventListeners(db);
    setupSidebar();
    setupKeyboardShortcuts();
    
    // Carregar dados iniciais
    await loadInitialData(db);
    
    // Configurar PWA
    setupPWA();
    
    console.log('App inicializado com sucesso!');
}

// ===== CARREGAMENTO INICIAL DE DADOS =====
async function loadInitialData(db) {
    try {
        currentItems = await db.dbGetItems();
        await refreshList(db);
        updateStats();
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showError('Erro ao carregar dados salvos');
    }
}

async function refreshList(db) {
    const shoppingList = document.getElementById('shopping-list');
    if (!shoppingList) return;
    
    currentItems = await db.dbGetItems();
    
    if (currentItems.length === 0) {
        shoppingList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Sua lista está vazia</p>
                <p class="empty-state-subtitle">Adicione itens usando o campo acima</p>
            </div>
        `;
    } else {
        shoppingList.innerHTML = currentItems.map(item => createItemElement(item).outerHTML).join('');
    }
    
    updateStats();
}

function updateStats() {
    const totalItems = currentItems.length;
    const completedItems = currentItems.filter(item => item.bought).length;
    const totalValue = currentItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    
    const totalItemsEl = document.getElementById('total-items');
    const completedItemsEl = document.getElementById('completed-items');
    const totalValueEl = document.getElementById('total-value');
    const mainListCountEl = document.getElementById('main-list-count');
    
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (completedItemsEl) completedItemsEl.textContent = completedItems;
    if (totalValueEl) totalValueEl.textContent = `R$ ${totalValue.toFixed(2)}`;
    if (mainListCountEl) mainListCountEl.textContent = totalItems;
}

function handleItemToggle(db) {
    return async (e) => {
        if (e.target.classList.contains('item-checkbox')) {
            const itemId = e.target.dataset.itemId;
            const checked = e.target.checked;
            
            try {
                await db.dbUpdateItem(itemId, { bought: checked });
                
                // Atualizar visual do item
                const itemEl = e.target.closest('.shopping-item');
                if (itemEl) {
                    itemEl.classList.toggle('completed', checked);
                    const itemName = itemEl.querySelector('.item-name');
                    if (itemName) {
                        if (checked) {
                            itemName.style.textDecoration = 'line-through';
                            itemName.style.opacity = '0.6';
                        } else {
                            itemName.style.textDecoration = 'none';
                            itemName.style.opacity = '1';
                        }
                    }
                }
                
                updateStats();
                
                if (analytics) {
                    analytics.trackItemToggle(itemId, checked);
                }
                
            } catch (error) {
                console.error('Erro ao atualizar item:', error);
                e.target.checked = !checked; // Reverter estado
                showError('Erro ao atualizar item');
            }
        }
    };
}

function handleItemActions(db) {
    return async (e) => {
        const deleteBtn = e.target.closest('.delete-item-btn');
        const editBtn = e.target.closest('.edit-item-btn');
        
        if (deleteBtn) {
            const itemId = deleteBtn.dataset.itemId;
            if (confirm('Deseja remover este item da lista?')) {
                try {
                    await db.dbDeleteItem(itemId);
                    await refreshList(db);
                    showSuccessToast('Item removido da lista');
                } catch (error) {
                    console.error('Erro ao remover item:', error);
                    showError('Erro ao remover item');
                }
            }
        }
        
        if (editBtn) {
            const itemId = editBtn.dataset.itemId;
            await editItem(db, itemId);
        }
    };
}

async function editItem(db, itemId) {
    const item = await db.dbGetItemById(itemId);
    if (!item) return;
    
    const newName = prompt('Editar item:', item.name);
    if (newName && newName.trim() && newName.trim() !== item.name) {
        try {
            await db.dbUpdateItem(itemId, { name: newName.trim() });
            await refreshList(db);
            showSuccessToast('Item atualizado');
        } catch (error) {
            console.error('Erro ao editar item:', error);
            showError('Erro ao editar item');
        }
    }
}

async function clearAllItems(db) {
    if (!db && typeof dbDeleteItem === 'undefined') {
        console.error('Banco de dados não disponível');
        showError('Erro: banco de dados não disponível');
        return;
    }
    
    if (currentItems.length === 0) {
        showSuccessToast('Lista já está vazia');
        return;
    }
    
    if (confirm('Deseja limpar toda a lista? Esta ação não pode ser desfeita.')) {
        try {
            for (const item of currentItems) {
                if (db) {
                    await db.dbDeleteItem(item.id);
                } else {
                    await dbDeleteItem(item.id);
                }
            }
            
            currentItems = [];
            await refreshList(db);
            showSuccessToast('Lista limpa com sucesso');
            
            if (analytics) {
                analytics.trackListClear();
            }
        } catch (error) {
            console.error('Erro ao limpar lista:', error);
            showError('Erro ao limpar lista');
        }
    }
}

// ===== GERENCIAMENTO DE ITENS INTELIGENTE =====
function categorizeItem(itemName) {
    const name = itemName.toLowerCase();
    
    for (const [category, data] of Object.entries(SMART_CATEGORIES)) {
        if (data.keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }
    
    return 'outros';
}

function getSmartSuggestions(input) {
    if (!input || input.length < 2) return [];
    
    const suggestions = [];
    const inputLower = input.toLowerCase();
    
    // Sugestões de inteligência artificial
    if (intelligence) {
        suggestions.push(...intelligence.getSuggestions(input));
    }
    
    // Sugestões baseadas em categorias
    for (const [category, data] of Object.entries(SMART_CATEGORIES)) {
        const matches = data.keywords.filter(keyword => 
            keyword.includes(inputLower) || inputLower.includes(keyword)
        );
        suggestions.push(...matches);
    }
    
    // Remover duplicatas e limitar
    return [...new Set(suggestions)].slice(0, 8);
}

// ===== INTERFACE DE USUÁRIO MODERNA =====
function createItemElement(item) {
    const itemEl = document.createElement('div');
    itemEl.className = `shopping-item ${item.bought ? 'completed' : ''}`;
    itemEl.dataset.itemId = item.id;
    
    const category = SMART_CATEGORIES[item.category] || SMART_CATEGORIES.outros;
    
    itemEl.innerHTML = `
        <div class="item-checkbox-wrapper">
            <input type="checkbox" 
                   class="item-checkbox" 
                   ${item.bought ? 'checked' : ''} 
                   data-item-id="${item.id}">
        </div>
        <div class="item-content">
            <div class="item-header">
                <span class="item-category-icon">${category.icon}</span>
                <span class="item-name" ${item.bought ? 'style="text-decoration: line-through; opacity: 0.6;"' : ''}>${item.name}</span>
                ${item.priority === 'high' ? '<span class="priority-badge">!</span>' : ''}
            </div>
            <div class="item-details">
                <span class="item-category">${item.category}</span>
                <span class="item-quantity">Qtd: ${item.qty || 1}</span>
                ${item.price ? `<span class="item-price">R$ ${item.price.toFixed(2)}</span>` : ''}
            </div>
        </div>
        <div class="item-actions">
            <button class="edit-item-btn" data-item-id="${item.id}" title="Editar">✏️</button>
            <button class="delete-item-btn" data-item-id="${item.id}" title="Remover">🗑️</button>
        </div>
    `;
    
    return itemEl;
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners(db) {
    // Input principal
    const itemInput = document.getElementById('item-input');
    const addBtn = document.getElementById('add-item-btn');
    
    if (itemInput) {
        itemInput.addEventListener('input', handleInputChange);
        itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItemFromInput(db);
        });
        
        // Dica na primeira vez que focar no input
        let firstFocus = true;
        itemInput.addEventListener('focus', () => {
            if (firstFocus) {
                showSuccessToast('💡 Dica: Digite qualquer produto e clique nas sugestões para adicionar rapidamente!');
                firstFocus = false;
            }
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', () => addItemFromInput(db));
    }
    
    // Eventos de lista
    const shoppingList = document.getElementById('shopping-list');
    if (shoppingList) {
        shoppingList.addEventListener('change', handleItemToggle(db));
        shoppingList.addEventListener('click', handleItemActions(db));
    }
    
    // Botões de ação rápida
    setupQuickActions(db);
}

function handleInputChange(e) {
    const input = e.target.value;
    const suggestions = getSmartSuggestions(input);
    showSuggestions(suggestions);
}

function showSuggestions(suggestions) {
    const autocompleteList = document.getElementById('autocomplete-list');
    if (!autocompleteList) return;
    
    if (suggestions.length === 0) {
        autocompleteList.style.display = 'none';
        return;
    }
    
    autocompleteList.innerHTML = suggestions.map((suggestion, index) => 
        `<div class="autocomplete-item" data-suggestion="${suggestion}" data-index="${index}" tabindex="0" title="Clique para adicionar à lista">
            <span class="suggestion-text">📦 ${suggestion}</span>
            <span class="suggestion-add-btn" title="Adicionar à lista">+</span>
         </div>`
    ).join('');
    
    autocompleteList.style.display = 'block';
    
    // Eventos de sugestões - adicionar automaticamente à lista
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
        // Evento de clique
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const suggestionText = item.dataset.suggestion;
            console.log('� Adicionando sugestão à lista:', suggestionText);
            
            // Visual feedback - mostrar que está sendo processado
            item.style.opacity = '0.6';
            item.style.pointerEvents = 'none';
            
            try {
                // Adicionar diretamente à lista
                await addSuggestionToList(suggestionText);
                
                // Feedback visual de sucesso
                item.style.backgroundColor = '#22c55e';
                item.style.color = 'white';
                setTimeout(() => {
                    // Limpar input e esconder sugestões
                    const itemInput = document.getElementById('item-input');
                    if (itemInput) {
                        itemInput.value = '';
                    }
                    autocompleteList.style.display = 'none';
                }, 300);
                
            } catch (error) {
                // Restaurar estado em caso de erro
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
                item.style.backgroundColor = '#fee2e2';
                item.style.color = '#dc2626';
                
                setTimeout(() => {
                    item.style.backgroundColor = '';
                    item.style.color = '';
                }, 2000);
            }
        });
        
        // Evento de teclado (Enter)
        item.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const suggestionText = item.dataset.suggestion;
                console.log('⌨️ Sugestão selecionada via Enter:', suggestionText);
                
                await addSuggestionToList(suggestionText);
                
                const itemInput = document.getElementById('item-input');
                if (itemInput) {
                    itemInput.value = '';
                    itemInput.focus();
                }
                autocompleteList.style.display = 'none';
            }
        });
    });
    
    // Navegação por teclado nas sugestões
    setupSuggestionNavigation(autocompleteList);
}

// Função para navegação por teclado nas sugestões
function setupSuggestionNavigation(autocompleteList) {
    const itemInput = document.getElementById('item-input');
    if (!itemInput) return;
    
    let currentSuggestionIndex = -1;
    const suggestions = autocompleteList.querySelectorAll('.autocomplete-item');
    
    // Remover event listeners anteriores para evitar duplicação
    itemInput.removeEventListener('keydown', handleSuggestionNavigation);
    
    function handleSuggestionNavigation(e) {
        if (autocompleteList.style.display === 'none' || suggestions.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
                updateSuggestionHighlight();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
                updateSuggestionHighlight();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentSuggestionIndex >= 0 && currentSuggestionIndex < suggestions.length) {
                    const selectedSuggestion = suggestions[currentSuggestionIndex];
                    selectedSuggestion.click();
                }
                break;
                
            case 'Escape':
                autocompleteList.style.display = 'none';
                currentSuggestionIndex = -1;
                break;
        }
    }
    
    function updateSuggestionHighlight() {
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('active', index === currentSuggestionIndex);
        });
        
        if (currentSuggestionIndex >= 0) {
            suggestions[currentSuggestionIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    
    itemInput.addEventListener('keydown', handleSuggestionNavigation);
}

// Nova função para adicionar sugestão diretamente à lista
async function addSuggestionToList(suggestionText) {
    console.log('🛒 Processando adição de:', suggestionText);
    
    try {
        // Importar módulo db
        const db = await import('./db.js');
        
        // Verificar se o item já existe na lista
        const existingItems = await db.dbGetItems();
        const itemExists = existingItems.some(item => 
            item.name.toLowerCase() === suggestionText.toLowerCase() && !item.bought
        );
        
        if (itemExists) {
            showSuccessToast(`"${suggestionText}" já está na lista`);
            console.log('⚠️ Item já existe na lista:', suggestionText);
            return;
        }
        
        const category = categorizeItem(suggestionText);
        
        const newItem = {
            name: suggestionText,
            category: category,
            qty: 1,
            bought: false,
            addedAt: new Date().toISOString(),
            priority: 'normal'
        };
        
        // Adicionar item ao banco de dados
        await db.dbAddItem(newItem);
        
        // Atualizar a lista de itens atual
        currentItems = await db.dbGetItems();
        
        // Feedback de sucesso
        showSuccessToast(`✅ "${suggestionText}" adicionado à lista`);
        
        // Atualizar interface
        await refreshList(db);
        
        // Registrar analytics se disponível
        if (analytics) {
            analytics.trackItemAdd(newItem);
        }
        
        console.log('✅ Item adicionado com sucesso:', newItem);
        
    } catch (error) {
        console.error('❌ Erro ao adicionar sugestão à lista:', error);
        showError(`Erro ao adicionar "${suggestionText}" à lista`);
        throw error; // Re-throw para que o caller possa lidar com o erro
    }
}

async function addItemFromInput(db) {
    const itemInput = document.getElementById('item-input');
    
    if (!itemInput || !itemInput.value.trim()) return;
    
    const itemName = itemInput.value.trim();
    const category = categorizeItem(itemName);
    
    const newItem = {
        name: itemName,
        category: category,
        qty: 1,
        bought: false,
        addedAt: new Date().toISOString(),
        priority: 'normal'
    };
    
    try {
        await db.dbAddItem(newItem);
        
        // Feedback de sucesso
        showSuccessToast(`"${itemName}" adicionado à lista`);
        
        // Limpar input
        itemInput.value = '';
        const autocompleteList = document.getElementById('autocomplete-list');
        if (autocompleteList) {
            autocompleteList.style.display = 'none';
        }
        
        // Atualizar interface
        await refreshList(db);
        
        // Registrar analytics
        if (analytics) {
            analytics.trackItemAdd(newItem);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        showError('Erro ao adicionar item à lista');
    }
}

// ===== FUNÇÕES DE FEEDBACK =====
function showSuccessToast(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Buscar ou criar container de toasts
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Adicionar ao container
    toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONALIDADES AVANÇADAS =====
function setupQuickActions(db) {
    // Botão de limpar lista
    const clearBtn = document.getElementById('clear-all-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearAllItems(db));
    }
    
    // Botão de exportar
    const exportBtn = document.getElementById('export-list-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportList);
    }
    
    // Botão de compartilhar
    const shareBtn = document.getElementById('share-list-btn');
    if (shareBtn && APP_CONFIG.features.sharing) {
        shareBtn.addEventListener('click', shareList);
    }
}

async function shareList() {
    const listText = currentItems.map(item => 
        `${item.bought ? '✅' : '☐'} ${item.name} (${item.qty || 1})`
    ).join('\n');
    
    const shareData = {
        title: 'Minha Lista de Compras - Listou',
        text: `Lista de Compras:\n\n${listText}\n\nCriado com Listou`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: copiar para clipboard
            await navigator.clipboard.writeText(shareData.text);
            showSuccessToast('Lista copiada para a área de transferência');
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
        showError('Erro ao compartilhar lista');
    }
}

function exportList() {
    const data = {
        listName: 'Lista de Compras',
        exportDate: new Date().toISOString(),
        items: currentItems,
        version: APP_CONFIG.version
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-compras-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccessToast('Lista exportada com sucesso');
}

// ===== CONFIGURAÇÃO PWA =====
function setupPWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.error('Erro ao registrar Service Worker:', error);
            });
    }
    
    // Prompt de instalação
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    function showInstallPrompt() {
        const installBtn = document.getElementById('install-app-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const result = await deferredPrompt.userChoice;
                    console.log('Resultado da instalação:', result);
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            });
        }
    }
}

// ===== CONTROLE DA SIDEBAR =====
function setupSidebar() {
    console.log('setupSidebar iniciado');
    
    // Usar timeout para garantir que DOM está totalmente carregado
    setTimeout(() => {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarClose = document.getElementById('sidebar-close');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        // Debug: verificar se os elementos existem
        console.log('Elementos encontrados:', {
            sidebarToggle: !!sidebarToggle,
            sidebar: !!sidebar,
            sidebarClose: !!sidebarClose,
            sidebarOverlay: !!sidebarOverlay
        });

        if (!sidebarToggle) {
            console.error('ERRO: Botão sidebar-toggle não encontrado!');
            return;
        }

        if (!sidebar) {
            console.error('ERRO: Elemento sidebar não encontrado!');
            return;
        }

        function toggleSidebar() {
            console.log('toggleSidebar chamado');
            
            const isOpen = sidebar.classList.contains('open');
            console.log('Sidebar está aberta:', isOpen);
            
            if (isOpen) {
                // Fechar sidebar
                sidebar.classList.remove('open');
                sidebar.classList.add('closed');
                if (sidebarOverlay) sidebarOverlay.classList.remove('show');
                document.body.style.overflow = '';
                if (sidebarToggle) sidebarToggle.classList.remove('hidden');
            } else {
                // Abrir sidebar
                sidebar.classList.add('open');
                sidebar.classList.remove('closed');
                if (sidebarOverlay) sidebarOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
                if (sidebarToggle) sidebarToggle.classList.add('hidden');
            }
            
            console.log('Sidebar classes após toggle:', Array.from(sidebar.classList));
        }

        function closeSidebar() {
            console.log('closeSidebar chamado');
            sidebar.classList.remove('open');
            sidebar.classList.add('closed');
            if (sidebarOverlay) sidebarOverlay.classList.remove('show');
            document.body.style.overflow = '';
            if (sidebarToggle) sidebarToggle.classList.remove('hidden');
        }

        // Tornar funções globais
        window.closeSidebar = closeSidebar;
        window.toggleSidebar = toggleSidebar;

        // Adicionar event listener principal
        console.log('Adicionando event listener ao botão hamburger...');
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🍔 BOTÃO HAMBURGER CLICADO!');
            toggleSidebar();
        });

        // Adicionar múltiplos tipos de eventos para garantir funcionamento
        sidebarToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            console.log('Touch start no botão hamburger');
            toggleSidebar();
        });

        sidebarToggle.addEventListener('mousedown', function(e) {
            console.log('Mouse down no botão hamburger');
        });

        // Event listener para fechar sidebar
        if (sidebarClose) {
            sidebarClose.addEventListener('click', closeSidebar);
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Marcar como configurado
        sidebarToggle.setAttribute('data-configured', 'true');
        console.log('✅ Sidebar configurado com sucesso!');
        
        // Teste inicial
        console.log('Testando visibilidade do botão:', {
            display: window.getComputedStyle(sidebarToggle).display,
            visibility: window.getComputedStyle(sidebarToggle).visibility,
            opacity: window.getComputedStyle(sidebarToggle).opacity,
            zIndex: window.getComputedStyle(sidebarToggle).zIndex
        });

    }, 100);

    // Event delegation para navegação da sidebar
    document.body.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.hasAttribute('data-section')) {
            e.preventDefault();
            const sectionId = navItem.getAttribute('data-section');
            if (sectionId && window.innerWidth < 1024) {
                if (window.closeSidebar) {
                    window.closeSidebar();
                }
            }
        }
    });
}

// ===== ATALHOS DE TECLADO =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', async (e) => {
        // Ctrl/Cmd + N: Novo item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('item-input')?.focus();
        }
        
        // Ctrl/Cmd + K: Limpar lista
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const db = await import('./db.js');
            await clearAllItems(db);
        }
        
        // Escape: Fechar sugestões/modal
        if (e.key === 'Escape') {
            const autocompleteList = document.getElementById('autocomplete-list');
            if (autocompleteList) {
                autocompleteList.style.display = 'none';
            }
            if (typeof closeSidebar === 'function') {
                closeSidebar();
            }
        }
    });
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.ListouApp = {
    addItem: addItemFromInput,
    clearList: clearAllItems,
    shareList,
    exportList,
    toggleSidebar: () => {
        if (window.toggleSidebar) {
            window.toggleSidebar();
        } else {
            console.error('toggleSidebar não está disponível');
        }
    },
    testSidebar: () => {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        console.log('Teste do Sidebar:', {
            toggleButton: !!sidebarToggle,
            sidebar: !!sidebar,
            toggleVisible: sidebarToggle ? window.getComputedStyle(sidebarToggle).display !== 'none' : false,
            sidebarClasses: sidebar ? Array.from(sidebar.classList) : 'N/A'
        });
        
        if (sidebarToggle) {
            console.log('Simulando clique no botão...');
            sidebarToggle.click();
        }
    }
};

console.log('Listou App carregado com sucesso!');

// ===== FUNÇÃO DE TESTE GLOBAL =====
window.testSidebarDirect = function() {
    console.log('🧪 Teste direto do sidebar...');
    
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    if (!sidebar) {
        console.error('❌ Sidebar não encontrada!');
        alert('Erro: Sidebar não encontrada!');
        return;
    }
    
    console.log('Estado atual da sidebar:', {
        classes: Array.from(sidebar.classList),
        isOpen: sidebar.classList.contains('open')
    });
    
    // Toggle direto
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        document.body.style.overflow = '';
        alert('Sidebar fechada!');
    } else {
        sidebar.classList.add('open');
        sidebar.classList.remove('closed');
        document.body.style.overflow = 'hidden';
        alert('Sidebar aberta!');
    }
    
    // Informações sobre o botão hamburger
    if (sidebarToggle) {
        const computedStyle = window.getComputedStyle(sidebarToggle);
        console.log('Estado do botão hamburger:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position,
            top: computedStyle.top,
            left: computedStyle.left
        });
    }
};

// ===== FUNÇÃO DE TESTE PARA SUGESTÕES =====
window.testSuggestions = function() {
    console.log('🧪 Teste das sugestões automáticas...');
    
    const itemInput = document.getElementById('item-input');
    if (!itemInput) {
        console.error('❌ Input não encontrado!');
        alert('Erro: Campo de entrada não encontrado!');
        return;
    }
    
    // Focar no input
    itemInput.focus();
    
    // Simular digitação para mostrar sugestões
    const testWords = ['ban', 'arr', 'car', 'lei'];
    const randomWord = testWords[Math.floor(Math.random() * testWords.length)];
    
    itemInput.value = randomWord;
    itemInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log(`✅ Simulando digitação de "${randomWord}"`);
    alert(`Teste iniciado! Digite "${randomWord}" e veja as sugestões aparecerem.\n\nClique em qualquer sugestão para adicionar automaticamente à lista!`);
    
    setTimeout(() => {
        const autocompleteList = document.getElementById('autocomplete-list');
        if (autocompleteList && autocompleteList.style.display !== 'none') {
            const suggestions = autocompleteList.querySelectorAll('.autocomplete-item');
            console.log('✅ Lista de sugestões está visível');
            console.log(`📝 ${suggestions.length} sugestões encontradas`);
            
            if (suggestions.length > 0) {
                // Destacar a primeira sugestão como exemplo
                suggestions[0].style.border = '2px solid #3b82f6';
                suggestions[0].style.animation = 'pulse 2s infinite';
                
                console.log('� Dica: Clique na primeira sugestão destacada!');
            }
        } else {
            console.log('❌ Lista de sugestões não está visível');
            alert('Nenhuma sugestão encontrada. Tente digitar uma palavra como "banana", "arroz" ou "carne".');
        }
    }, 500);
};

// Adicionar animação pulse no CSS se não existir
if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
    `;
    document.head.appendChild(style);
}
