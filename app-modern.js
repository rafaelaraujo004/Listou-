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
    
    // Carregar módulos
    const modules = await loadModules();
    if (!modules) {
        showError('Erro ao carregar componentes do aplicativo');
        return;
    }
    
    await initializeApp(modules);
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
        return null;
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
    
    // Inicializar sistemas
    intelligence = new IntelligenceManager();
    analytics = new AnalyticsManager();
    notifications = new NotificationManager();
    
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
    
    autocompleteList.innerHTML = suggestions.map(suggestion => 
        `<div class="autocomplete-item" data-suggestion="${suggestion}">${suggestion}</div>`
    ).join('');
    
    autocompleteList.style.display = 'block';
    
    // Eventos de sugestões
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('item-input').value = item.dataset.suggestion;
            autocompleteList.style.display = 'none';
        });
    });
}

async function addItemFromInput(db) {
    const itemInput = document.getElementById('item-input');
    const categorySelect = document.getElementById('category-select');
    
    if (!itemInput || !itemInput.value.trim()) return;
    
    const itemName = itemInput.value.trim();
    const category = categorySelect?.value || categorizeItem(itemName);
    
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
        document.getElementById('autocomplete-list').style.display = 'none';
        
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
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
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
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        console.log('toggleSidebar chamado - abrindo sidebar');
        sidebar.classList.toggle('open');
        sidebar.classList.remove('closed');
        sidebarOverlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        
        // Esconde o botão quando a sidebar está aberta
        if (sidebar.classList.contains('open')) {
            sidebarToggle.classList.add('hidden');
        }
    }

    function closeSidebar() {
        console.log('closeSidebar chamado - fechando sidebar');
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
        
        // Mostra o botão quando a sidebar é fechada
        sidebarToggle.classList.remove('hidden');
    }

    // Torna a função global para ser acessível de outros arquivos
    window.closeSidebar = closeSidebar;

    // Event listeners para sidebar
    sidebarToggle?.addEventListener('click', () => {
        console.log('Botão hamburger clicado!');
        toggleSidebar();
    });

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            closeSidebar();
        });
    }

    sidebarOverlay?.addEventListener('click', () => {
        console.log('Overlay clicado!');
        closeSidebar();
    });

    // Event delegation para navegação da sidebar
    document.body.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.hasAttribute('data-section')) {
            e.preventDefault();
            const sectionId = navItem.getAttribute('data-section');
            if (sectionId) {
                // Fecha sidebar no mobile
                if (window.innerWidth < 1024) {
                    closeSidebar();
                }
            }
        }
    });
}

// ===== ATALHOS DE TECLADO =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: Novo item
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('item-input')?.focus();
        }
        
        // Ctrl/Cmd + K: Limpar lista
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearAllItems();
        }
        
        // Escape: Fechar sugestões/modal
        if (e.key === 'Escape') {
            document.getElementById('autocomplete-list').style.display = 'none';
            closeSidebar();
        }
    });
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.ListouApp = {
    addItem: addItemFromInput,
    clearList: clearAllItems,
    shareList,
    exportList
};

console.log('Listou App carregado com sucesso!');
