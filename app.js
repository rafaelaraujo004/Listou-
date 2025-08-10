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

document.addEventListener('DOMContentLoaded', async () => {
    // Event listeners para botões principais
    document.body.addEventListener('click', async (e) => {
        // Botão Limpar Lista
        if (e.target && e.target.id === 'clear-all-btn') {
            if (currentItems.length === 0) return;
            if (!confirm('Tem certeza que deseja remover todos os itens da lista?')) return;
            for (const item of currentItems) {
                await dbDeleteItem(item.id);
            }
            refreshList();
        }
        // Botão Finalizar Compra
        if (e.target && e.target.id === 'finish-purchase-btn') {
            await finalizePurchase();
        }
        // Botão Limpar Todos os Dados (configurações)
        if (e.target && e.target.id === 'clear-data-btn') {
            const confirmText = 'OK';
            const userInput = prompt(
                `⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do aplicativo:\n\n` +
                `• Lista atual de compras\n` +
                `• Histórico de compras\n` +
                `• Templates personalizados\n` +
                `• Favoritos\n` +
                `• Configurações\n\n` +
                `Esta ação NÃO PODE ser desfeita!\n\n` +
                `Para confirmar, digite exatamente: OK`
            );
            if (userInput === confirmText) {
                try {
                    for (const item of currentItems) {
                        await dbDeleteItem(item.id);
                    }
                    localStorage.removeItem('listou-favorites');
                    localStorage.removeItem('listou-purchase-history');
                    localStorage.removeItem('listou-analytics');
                    localStorage.removeItem('listou-notifications');
                    localStorage.removeItem('listou-theme');
                    localStorage.removeItem('listou-recent-lists');
                    localStorage.removeItem('listou-user-templates');
                    if ('indexedDB' in window) {
                        const databases = await indexedDB.databases();
                        databases.forEach(db => {
                            if (db.name === 'listou-db') {
                                indexedDB.deleteDatabase(db.name);
                            }
                        });
                    }
                    const templatesGrid = document.querySelector('.templates-grid');
                    if (templatesGrid) {
                        const userTemplates = templatesGrid.querySelectorAll('.template-btn:not([data-template="compra-mes"]):not([data-template="feira"]):not([data-template="limpeza"])');
                        userTemplates.forEach(template => template.remove());
                    }
                    // Limpa listas recentes da sidebar
                    const recentLists = document.getElementById('recent-lists');
                    if (recentLists) {
                        recentLists.innerHTML = '';
                    }
                    refreshList();
                    alert('Todos os dados foram apagados!');
                } catch (err) {
                    alert('Erro ao apagar dados: ' + err.message);
                }
            }
        }
    });
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', async () => {
            if (currentItems.length === 0) return;
            if (!confirm('Tem certeza que deseja remover todos os itens da lista?')) return;
            for (const item of currentItems) {
                await dbDeleteItem(item.id);
            }
            refreshList();
        });
    }

    // Botão Limpar Todos os Dados (configurações)
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', async () => {
            const confirmText = 'OK';
            const userInput = prompt(
                `⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do aplicativo:\n\n` +
                `• Lista atual de compras\n` +
                `• Histórico de compras\n` +
                `• Templates personalizados\n` +
                `• Favoritos\n` +
                `• Configurações\n\n` +
                `Esta ação NÃO PODE ser desfeita!\n\n` +
                `Para confirmar, digite exatamente: OK`
            );
            
            if (userInput === confirmText) {
                try {
                    // Limpar lista atual
                    for (const item of currentItems) {
                        await dbDeleteItem(item.id);
                    }
                    
                    // Limpar localStorage (relatórios, histórico, etc.)
                    localStorage.removeItem('listou-favorites');
                    localStorage.removeItem('listou-purchase-history');
                    localStorage.removeItem('listou-analytics');
                    localStorage.removeItem('listou-notifications');
                    localStorage.removeItem('listou-theme');
                    localStorage.removeItem('listou-recent-lists');
                    localStorage.removeItem('listou-user-templates');
                    
                    // Limpar IndexedDB completamente (templates e dados)
                    if ('indexedDB' in window) {
                        const databases = await indexedDB.databases();
                        databases.forEach(db => {
                            if (db.name === 'listou-db') {
                                indexedDB.deleteDatabase(db.name);
                            }
                        });
                    }
                    
                    // Limpar templates criados pelo usuário da interface
                    const templatesGrid = document.querySelector('.templates-grid');
                    if (templatesGrid) {
                        // Remove apenas templates personalizados (mantém os padrões do sistema)
                        const userTemplates = templatesGrid.querySelectorAll('.template-btn:not([data-template="compra-mes"]):not([data-template="feira"]):not([data-template="limpeza"])');
                        userTemplates.forEach(template => template.remove());
                    }
                    
                    // Limpar listas recentes da sidebar
                    const recentListsContainer = document.getElementById('recent-lists');
                    if (recentListsContainer) {
                        recentListsContainer.innerHTML = '<p style="color: #888; font-style: italic; padding: 1rem; text-align: center;">Nenhuma lista recente</p>';
                    }
                    
                    // Limpar dados dos relatórios na interface
                    const categoryExpenses = document.querySelectorAll('.category-expense');
                    categoryExpenses.forEach(expense => {
                        const valueSpan = expense.querySelector('.category-value');
                        if (valueSpan) valueSpan.textContent = 'R$ 0,00';
                    });
                    
                    const topItems = document.querySelectorAll('.top-item');
                    topItems.forEach(item => {
                        const countSpan = item.querySelector('.item-count');
                        if (countSpan) countSpan.textContent = '0x';
                    });
                    
                    const savingsAmount = document.querySelector('.savings-amount');
                    if (savingsAmount) savingsAmount.textContent = 'R$ 0,00';
                    
                    const savingsDesc = document.querySelector('.savings-desc');
                    if (savingsDesc) savingsDesc.textContent = 'Nenhuma economia registrada';
                    
                    // Resetar estatísticas principais
                    const totalItemsEl = document.getElementById('total-items');
                    const completedItemsEl = document.getElementById('completed-items');
                    const totalValueEl = document.getElementById('total-value');
                    const realizedValueEl = document.getElementById('realized-value');
                    
                    if (totalItemsEl) totalItemsEl.textContent = '0';
                    if (completedItemsEl) completedItemsEl.textContent = '0';
                    if (totalValueEl) totalValueEl.textContent = 'R$ 0,00';
                    if (realizedValueEl) realizedValueEl.textContent = 'R$ 0,00';
                    
                    // Reinicializar sistemas de inteligência
                    if (intelligence) {
                        intelligence.clearAllData();
                    }
                    if (analytics) {
                        analytics.clearAllData();
                    }
                    
                    alert('✅ Todos os dados foram limpos com sucesso!\n\n• Lista atual\n• Histórico de compras\n• Relatórios\n• Listas recentes\n• Templates personalizados\n\nA página será recarregada.');
                    
                    // Recarregar a página
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    console.error('Erro ao limpar dados:', error);
                    alert('❌ Erro ao limpar alguns dados. Verifique o console para mais detalhes.');
                }
            } else if (userInput !== null) {
                alert('❌ Texto de confirmação incorreto. Operação cancelada.\n\nVocê deve digitar exatamente: OK');
            }
        });
    }
    console.log('DOM carregado, iniciando app...');
    
    // Carregar módulos
    const modules = await loadModules();
    if (!modules) {
        console.error('Falha ao carregar módulos');
        return;
    }
    
    const { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, IntelligenceManager, AnalyticsManager, NotificationManager,
            dbAddSupermarket, dbGetSupermarkets, dbUpdateSupermarket, dbDeleteSupermarket, dbGetSupermarketById } = modules;
// ===== ELEMENTOS DOM SIDEBAR =====
const sidebarToggle = document.getElementById('sidebar-toggle');
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
const autocompleteList = document.getElementById('autocomplete-list');
const suggestionsSection = document.getElementById('smart-suggestions');
const suggestionsList = document.getElementById('suggestions-list');
const templateBtns = document.querySelectorAll('.template-btn');

// Elementos sidebar actions
const sidebarShareBtn = document.getElementById('sidebar-share-btn');
const sidebarExportBtn = document.getElementById('sidebar-export-btn');
const sidebarScanBtn = document.getElementById('sidebar-scan-btn');

// Stats elements (principais)
const totalItemsEl = document.getElementById('total-items');
const completedItemsEl = document.getElementById('completed-items');
const totalValueEl = document.getElementById('total-value');
const realizedValueEl = document.getElementById('realized-value');

// Elementos de funcionalidades extras que podem não existir no HTML atual
const shareLinkBtn = document.getElementById('share-link-btn');
const exportListBtn = document.getElementById('export-list-btn');
const importListBtn = document.getElementById('import-list-btn');

// ===== CONTROLE DA SIDEBAR =====
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

function switchSection(sectionId) {
    // Remove active de todas as seções e nav items
    contentSections.forEach(section => section.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));
    
    // Ativa a seção desejada
    const targetSection = document.getElementById(`section-${sectionId}`);
    const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetNavItem) targetNavItem.classList.add('active');
    
    // Atualiza dados quando navegar para analytics
    if (sectionId === 'analytics') {
        updateAnalyticsData();
    }
    
    // Carrega dados quando navegar para supermercados
    if (sectionId === 'supermarkets') {
        loadSupermarkets();
    }
    
    // Fecha sidebar no mobile
    if (window.innerWidth < 1024) {
        closeSidebar();
    }
}

// Event listeners para sidebar
console.log('Configurando event listeners da sidebar...');
console.log('sidebarToggle:', sidebarToggle);
console.log('sidebarClose:', sidebarClose);
console.log('sidebarOverlay:', sidebarOverlay);

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
            switchSection(sectionId);
        }
    }
});

// Event delegation para ações da sidebar
document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'sidebar-share-btn') shareList();
    if (e.target && e.target.id === 'sidebar-export-btn') exportList();
    if (e.target && e.target.id === 'sidebar-scan-btn') scanQRCode();
});

// Event listener para seletor de período dos relatórios
const analyticsPeriodSelect = document.getElementById('analytics-period');
if (analyticsPeriodSelect) {
    analyticsPeriodSelect.addEventListener('change', () => {
        updateAnalyticsData();
    });
}

// Event listeners para novos botões de relatórios comparativos
const exportPngReportBtn = document.getElementById('export-png-report-btn');
if (exportPngReportBtn) {
    exportPngReportBtn.addEventListener('click', exportReportAsPNG);
}

const exportPdfReportBtn = document.getElementById('export-pdf-report-btn');
if (exportPdfReportBtn) {
    exportPdfReportBtn.addEventListener('click', exportReportAsPDF);
}

// Event listener para filtro de supermercado
const supermarketFilter = document.getElementById('supermarket-filter');
if (supermarketFilter) {
    supermarketFilter.addEventListener('change', filterReportsBySupermarket);
}

// Event listener para campo de supermercado
const supermarketInput = document.getElementById('supermarket-name');
if (supermarketInput) {
    supermarketInput.addEventListener('blur', saveSupermarketName);
    supermarketInput.addEventListener('change', saveSupermarketName);
}

// Event listeners para tipo de compra
const changePurchaseTypeBtn = document.getElementById('change-purchase-type-btn');
if (changePurchaseTypeBtn) {
    changePurchaseTypeBtn.addEventListener('click', showPurchaseTypeModal);
}

// Event listeners para modal de tipo de compra
document.addEventListener('click', (e) => {
    if (e.target.matches('.purchase-type-option')) {
        const purchaseType = e.target.getAttribute('data-type');
        selectPurchaseType(purchaseType);
    }
});

// Event listeners para marcar itens como comprados
document.addEventListener('click', (e) => {
    // Clique no nome do item ou no checkbox
    if (e.target.matches('.item-name') || e.target.matches('.item-checkbox')) {
        const listItem = e.target.closest('.list-item');
        if (listItem) {
            toggleItemPurchased(listItem);
        }
    }
});

// Event delegation para criar novo template
document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'create-template-btn') createNewTemplate();
});

// Event listener para limpar histórico de compras
const clearHistoryBtn = document.getElementById('clear-history-btn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        const confirmation = confirm('Tem certeza que deseja limpar todo o histórico de compras?\n\nEsta ação não pode ser desfeita.');
        if (confirmation) {
            if (intelligence) {
                intelligence.clearPurchaseHistory();
                
                // Limpar também os dados analíticos relacionados
                if (analytics && typeof analytics.clearAllPurchaseData === 'function') {
                    analytics.clearAllPurchaseData();
                }
                
                // Limpar visualmente a lista de histórico na interface
                const historyList = document.getElementById('history-list');
                if (historyList) {
                    historyList.innerHTML = '<div class="no-data">Nenhum histórico de compras encontrado</div>';
                }
                
                // Atualizar os dados analíticos também
                updateAnalyticsData();
                
                alert('Histórico de compras limpo com sucesso!');
            } else {
                console.error('Sistema de inteligência não inicializado');
                alert('Erro ao limpar histórico. Tente novamente.');
            }
        }
    });
}

// Fechar sidebar com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
    }
});

// Atualizar stats da sidebar quando stats principais mudarem
// Inicializar sistemas
let intelligence, analytics, notifications;

try {
    intelligence = new IntelligenceManager();
    analytics = new AnalyticsManager();
    notifications = new NotificationManager();
    
    // Disponibiliza funções de supermercado globalmente
    window.dbAddSupermarket = dbAddSupermarket;
    window.dbGetSupermarkets = dbGetSupermarkets;
    window.dbUpdateSupermarket = dbUpdateSupermarket;
    window.dbDeleteSupermarket = dbDeleteSupermarket;
    window.dbGetSupermarketById = dbGetSupermarketById;
    
    console.log('Sistemas inicializados com sucesso');
} catch (error) {
    console.error('Erro ao inicializar sistemas:', error);
}

let currentItems = [];
let filteredItems = [];
let isRecording = false;
let supermarkets = [];
let currentSupermarket = null;

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

    // Agrupa itens por nome e categoria (case-insensitive)
    const grouped = {};
    items.forEach(item => {
        const key = `${item.name.trim().toLowerCase()}|${(item.category||'outros').toLowerCase()}`;
        if (!grouped[key]) {
            grouped[key] = { ...item };
        } else {
            grouped[key].qty += (parseInt(item.qty, 10) || 1);
        }
    });

    Object.values(grouped).forEach(item => {
        const isFavorite = intelligence.isFavorite(item.name);
        const categoryIcon = getCategoryIcon(item.category);
        const li = document.createElement('li');
        li.className = 'shopping-item' + (item.bought ? ' item-bought' : '');
        li.innerHTML = `
            <div class="item-info">
                <div class="item-name" data-id="${item.id}" style="cursor: pointer;" title="${item.bought ? 'Clique para desmarcar como comprado' : 'Clique para marcar como comprado (tachar)'}">
                    ${categoryIcon} ${item.name.toUpperCase()}
                    <span class="item-favorite ${isFavorite ? 'active' : ''}" data-id="${item.id}" title="Favoritar">
                        ${isFavorite ? '⭐' : '☆'}
                    </span>
                </div>
                <div class="item-details">
                    <span class="item-category">${item.category || 'outros'}</span>
                </div>
                <div class="item-extra-details" style="margin-top: 0.1em; font-size: 0.85em; color: #64748b; display: flex; gap: 1rem; align-items: center;">
                    <span title="Quantidade"><strong>Qtd:</strong> ${item.qty}</span>
                    <div class="item-price-container" title="Valor do item">
                        <strong>Valor:</strong> 
                        <span class="price-display" data-id="${item.id}" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; background: #f0f8ff; border: 1px solid #ddd;" title="Clique para editar">
                            R$ ${item.price !== undefined && item.price !== null && item.price !== '' ? Number(item.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--'}
                        </span>
                        <input class="price-input" data-id="${item.id}" type="number" step="0.01" min="0" value="${item.price || ''}" style="display: none; width: 80px; padding: 2px 6px; border: 1px solid #007bff; border-radius: 4px; text-align: right;">
                    </div>
                </div>
            </div>
            <div class="qty-actions-container">
                <input class="item-qty" type="number" min="1" value="${item.qty}" data-id="${item.id}">
                <div class="item-actions">
                    <button class="bought-btn ${item.bought ? 'active' : ''}" data-id="${item.id}" title="Marcar como comprado">
                        ${item.bought ? '✅' : '✓'}
                    </button>
                    <button class="delete-btn" data-id="${item.id}" title="Remover item">🗑️</button>
                </div>
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

    // Soma do valor total previsto (preço x quantidade de todos os itens)
    const totalValue = currentItems.reduce((sum, item) => {
        const price = (item.price !== undefined && item.price !== null && item.price !== '') ? Number(item.price) : 0;
        const qty = (item.qty !== undefined && item.qty !== null && item.qty !== '') ? Number(item.qty) : 1;
        return sum + (price * qty);
    }, 0);

    // Soma do valor realizado (preço x quantidade apenas dos itens comprados)
    const realizedValue = currentItems
        .filter(item => item.bought)
        .reduce((sum, item) => {
            const price = (item.price !== undefined && item.price !== null && item.price !== '') ? Number(item.price) : 0;
            const qty = (item.qty !== undefined && item.qty !== null && item.qty !== '') ? Number(item.qty) : 1;
            return sum + (price * qty);
        }, 0);

    if (totalItemsEl) totalItemsEl.textContent = total;
    if (completedItemsEl) completedItemsEl.textContent = completed;
    if (totalValueEl) totalValueEl.textContent = `R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (realizedValueEl) realizedValueEl.textContent = `R$ ${realizedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// Atualiza dados dos relatórios e análises em tempo real
async function updateAnalyticsData() {
    if (!analytics) return;

    try {
        // Obter dados do histórico de compras local apenas
        const purchaseHistory = JSON.parse(localStorage.getItem('listou-purchase-history') || '[]');
        
        // Obter período selecionado
        const periodSelect = document.getElementById('analytics-period');
        const selectedPeriod = periodSelect ? periodSelect.value : 'month';
        
        // Filtrar dados por período
        const now = new Date();
        let startDate = new Date();
        
        switch (selectedPeriod) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        
        // Filtrar compras do usuário por período
        const filteredPurchases = purchaseHistory.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= startDate;
        });
        
        // Calcular dados agregados apenas dos dados do usuário
        const periodData = {
            categories: {},
            products: {},
            totalSpent: 0,
            supermarkets: {}
        };
        
        filteredPurchases.forEach(purchase => {
            periodData.totalSpent += purchase.totalSpent || 0;
            
            // Agregar por supermercado
            const supermarket = purchase.supermarket || 'Não informado';
            if (!periodData.supermarkets[supermarket]) {
                periodData.supermarkets[supermarket] = { totalSpent: 0, purchaseCount: 0 };
            }
            periodData.supermarkets[supermarket].totalSpent += purchase.totalSpent || 0;
            periodData.supermarkets[supermarket].purchaseCount += 1;
            
            if (purchase.items && Array.isArray(purchase.items)) {
                purchase.items.forEach(item => {
                    const category = item.category || 'outros';
                    const productName = item.name.toLowerCase();
                    
                    // Agregar por categoria
                    if (!periodData.categories[category]) {
                        periodData.categories[category] = { totalSpent: 0, itemCount: 0 };
                    }
                    periodData.categories[category].totalSpent += item.totalPrice || 0;
                    periodData.categories[category].itemCount += item.quantity || 1;
                    
                    // Agregar por produto
                    if (!periodData.products[productName]) {
                        periodData.products[productName] = { count: 0, totalSpent: 0, name: item.name };
                    }
                    periodData.products[productName].count += item.quantity || 1;
                    periodData.products[productName].totalSpent += item.totalPrice || 0;
                });
            }
        });
        
        // Atualiza gastos por categoria - apenas dados do usuário
        const categoryContainer = document.querySelector('.chart-placeholder');
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            
            const sortedCategories = Object.entries(periodData.categories)
                .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                .slice(0, 5);
            
            if (sortedCategories.length === 0) {
                categoryContainer.innerHTML = '<div class="no-data">Nenhuma compra registrada no período</div>';
            } else {
                sortedCategories.forEach(([category, data]) => {
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'category-expense';
                    categoryDiv.innerHTML = `
                        <span class="category-name">${getCategoryIcon(category)} ${formatCategoryName(category)}</span>
                        <span class="category-value">R$ ${data.totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    `;
                    categoryContainer.appendChild(categoryDiv);
                });
            }
        }
        
        // Atualiza itens mais comprados - apenas dados do usuário
        const topItemsContainer = document.querySelector('.top-items');
        if (topItemsContainer) {
            topItemsContainer.innerHTML = '';
            
            const sortedProducts = Object.values(periodData.products)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            if (sortedProducts.length === 0) {
                topItemsContainer.innerHTML = '<div class="no-data">Nenhum histórico de compras no período</div>';
            } else {
                sortedProducts.forEach((product, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'top-item';
                    itemDiv.innerHTML = `
                        <span class="item-rank">${index + 1}</span>
                        <span class="item-name">${product.name.charAt(0).toUpperCase() + product.name.slice(1)}</span>
                        <span class="item-count">${product.count}x</span>
                    `;
                    topItemsContainer.appendChild(itemDiv);
                });
            }
        }
        
        // Atualiza ranking de supermercados - apenas dados do usuário
        const supermarketRanking = document.getElementById('supermarket-ranking');
        if (supermarketRanking) {
            supermarketRanking.innerHTML = '';
            
            const sortedSupermarkets = Object.entries(periodData.supermarkets)
                .sort((a, b) => (a[1].totalSpent / a[1].purchaseCount) - (b[1].totalSpent / b[1].purchaseCount))
                .slice(0, 4);
            
            if (sortedSupermarkets.length === 0) {
                supermarketRanking.innerHTML = '<div class="no-data">Nenhuma compra com supermercado informado</div>';
            } else {
                sortedSupermarkets.forEach(([supermarket, data], index) => {
                    const avgSpent = data.totalSpent / data.purchaseCount;
                    const rankClass = index === 0 ? 'best' : index === 1 ? 'good' : index === 2 ? 'average' : 'expensive';
                    
                    const rankDiv = document.createElement('div');
                    rankDiv.className = `ranking-item ${rankClass}`;
                    rankDiv.innerHTML = `
                        <span class="rank-position">${index + 1}º</span>
                        <span class="supermarket-name">${supermarket}</span>
                        <span class="price-diff">R$ ${avgSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    `;
                    supermarketRanking.appendChild(rankDiv);
                });
            }
        }
        
        // Atualiza economia baseada apenas em dados do usuário
        const savingsAmountEl = document.querySelector('.savings-amount');
        const savingsDescEl = document.querySelector('.savings-desc');
        const monthlySpendingEl = document.getElementById('monthly-spending');
        
        if (savingsAmountEl) {
            if (periodData.totalSpent > 0) {
                savingsAmountEl.textContent = `R$ ${periodData.totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                savingsAmountEl.textContent = 'R$ 0,00';
            }
            
            if (savingsDescEl) {
                if (periodData.totalSpent > 0) {
                    savingsDescEl.textContent = 'Total gasto no período';
                } else {
                    savingsDescEl.textContent = 'Nenhuma compra registrada';
                }
            }
        }
        
        if (monthlySpendingEl) {
            monthlySpendingEl.textContent = `R$ ${periodData.totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        // Remove comparações com dados externos - apenas mostra dados do usuário
        const comparisonValue = document.querySelector('.comparison-value');
        if (comparisonValue) {
            comparisonValue.textContent = `R$ ${periodData.totalSpent.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
    } catch (error) {
        console.error('Erro ao atualizar analytics:', error);
    }
}

// Atualiza relatórios comparativos com outros apps
async function updateCompetitiveReports() {
    try {
        if (!analytics) return;
        
        const competitiveReport = analytics.generateCompetitiveReport();
        
        // Atualizar seção de comparação se existir
        updatePerformanceScores(competitiveReport.performance);
        updateMarketComparison(competitiveReport.marketComparison);
        updateCompetitorComparison(competitiveReport.competitorComparison);
        updateInsights(competitiveReport.insights);
        updateRecommendations(competitiveReport.recommendations);
        
    } catch (error) {
        console.error('Erro ao atualizar relatórios comparativos:', error);
    }
}

function updatePerformanceScores(performance) {
    // Atualizar scores de performance
    const overallScoreEl = document.getElementById('overall-score');
    const savingsScoreEl = document.getElementById('savings-score');
    const efficiencyScoreEl = document.getElementById('efficiency-score');
    const organizationScoreEl = document.getElementById('organization-score');
    
    if (overallScoreEl) {
        overallScoreEl.textContent = performance.overallScore;
        overallScoreEl.className = `score ${getScoreClass(performance.overallScore)}`;
    }
    
    if (savingsScoreEl && performance.savingsScore) {
        savingsScoreEl.textContent = performance.savingsScore.score;
        savingsScoreEl.className = `score ${getScoreClass(performance.savingsScore.score)}`;
    }
    
    if (efficiencyScoreEl && performance.efficiencyScore) {
        efficiencyScoreEl.textContent = performance.efficiencyScore.score;
        efficiencyScoreEl.className = `score ${getScoreClass(performance.efficiencyScore.score)}`;
    }
    
    if (organizationScoreEl && performance.organizationScore) {
        organizationScoreEl.textContent = performance.organizationScore.score;
        organizationScoreEl.className = `score ${getScoreClass(performance.organizationScore.score)}`;
    }
}

function updateMarketComparison(marketComparison) {
    const comparisonContainer = document.getElementById('market-comparison');
    if (!comparisonContainer || !marketComparison) return;
    
    const savingsDiff = marketComparison.savings.difference;
    const efficiencyDiff = marketComparison.efficiency.difference;
    
    comparisonContainer.innerHTML = `
        <div class="comparison-item">
            <span class="comparison-label">💰 Economia vs. Mercado:</span>
            <span class="comparison-value ${savingsDiff > 0 ? 'positive' : 'negative'}">
                ${savingsDiff > 0 ? '+' : ''}R$ ${savingsDiff.toFixed(2)}/mês
            </span>
        </div>
        <div class="comparison-item">
            <span class="comparison-label">📊 Eficiência vs. Mercado:</span>
            <span class="comparison-value ${efficiencyDiff > 0 ? 'positive' : 'negative'}">
                ${efficiencyDiff > 0 ? '+' : ''}${efficiencyDiff} itens/compra
            </span>
        </div>
        <div class="comparison-item">
            <span class="comparison-label">🎯 Seu Percentil:</span>
            <span class="comparison-value">Top ${100 - marketComparison.savings.percentile}%</span>
        </div>
    `;
}

function updateCompetitorComparison(competitorComparison) {
    const competitorContainer = document.getElementById('competitor-comparison');
    if (!competitorContainer || !competitorComparison) return;
    
    const topCompetitors = Object.entries(competitorComparison)
        .sort((a, b) => b[1].userAdvantage - a[1].userAdvantage)
        .slice(0, 3);
    
    competitorContainer.innerHTML = topCompetitors.map(([key, competitor]) => `
        <div class="competitor-item">
            <div class="competitor-name">${competitor.name}</div>
            <div class="competitor-advantage ${competitor.userAdvantage > 0 ? 'positive' : 'negative'}">
                ${competitor.userAdvantage > 0 ? '+' : ''}${competitor.userAdvantage.toFixed(1)}% economia
            </div>
            <div class="competitor-features">
                <strong>Vantagens do Listou:</strong> ${competitor.features.unique.join(', ')}
            </div>
        </div>
    `).join('');
}

function updateInsights(insights) {
    const insightsContainer = document.getElementById('advanced-insights');
    if (!insightsContainer || !insights.length) return;
    
    insightsContainer.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <div class="insight-header">
                <span class="insight-icon">${getInsightIcon(insight.type)}</span>
                <span class="insight-title">${insight.title}</span>
                <span class="insight-impact impact-${insight.impact}">${insight.impact.toUpperCase()}</span>
            </div>
            <div class="insight-message">${insight.message}</div>
        </div>
    `).join('');
}

function updateRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations');
    if (!recommendationsContainer) return;
    
    const allRecommendations = [
        ...recommendations.immediate,
        ...recommendations.shortTerm,
        ...recommendations.longTerm
    ];
    
    if (allRecommendations.length === 0) {
        recommendationsContainer.innerHTML = '<div class="no-recommendations">🎉 Parabéns! Você está otimizando muito bem suas compras.</div>';
        return;
    }
    
    recommendationsContainer.innerHTML = allRecommendations.map(rec => `
        <div class="recommendation-item priority-${rec.priority}">
            <div class="recommendation-header">
                <span class="recommendation-category">${rec.category}</span>
                <span class="recommendation-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
            </div>
            <div class="recommendation-message">${rec.message}</div>
            <div class="recommendation-action">${rec.action}</div>
        </div>
    `).join('');
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
}

function getInsightIcon(type) {
    const icons = {
        'positive': '✅',
        'warning': '⚠️',
        'informational': 'ℹ️',
        'negative': '❌'
    };
    return icons[type] || 'ℹ️';
}

// Gerar relatório comparativo para exportação
async function generateComparativeReportForExport() {
    if (!analytics) return null;
    
    try {
        const report = analytics.generateCompetitiveReport();
        const exportData = {
            titulo: 'Relatório Comparativo - Listou',
            dataGeracao: new Date().toLocaleDateString('pt-BR'),
            resumo: {
                scoreGeral: `${report.summary.overallScore}/100`,
                posicaoMercado: `${report.summary.ranking.position} - ${report.summary.ranking.tier}`,
                pontoForte: `${report.summary.topStrength.area} (${report.summary.topStrength.score}/100)`,
                areaParaMelhoria: `${report.summary.improvementArea.area} (${report.summary.improvementArea.score}/100)`
            },
            metricas: {
                totalGasto: `R$ ${report.userMetrics.totalSpent.toFixed(2)}`,
                totalCompras: report.userMetrics.totalPurchases,
                gastoMedioMensal: `R$ ${report.userMetrics.avgMonthlySpent.toFixed(2)}`,
                itensPorCompra: report.userMetrics.avgItemsPerPurchase,
                frequenciaCompras: `${report.userMetrics.purchaseFrequency} por semana`
            },
            comparacaoMercado: {
                economiaVsMercado: `R$ ${report.marketComparison.savings.difference.toFixed(2)}/mês`,
                percentil: `Top ${100 - report.marketComparison.savings.percentile}%`,
                eficienciaVsMercado: `${report.marketComparison.efficiency.difference > 0 ? '+' : ''}${report.marketComparison.efficiency.difference} itens/compra`
            },
            competidores: Object.entries(report.competitorComparison).map(([key, comp]) => ({
                app: comp.name,
                vantagemEconomia: `${comp.userAdvantage > 0 ? '+' : ''}${comp.userAdvantage.toFixed(1)}%`,
                vantagensSatisfacao: `+${comp.satisfactionDiff}%`,
                recursoUnicos: comp.features.unique.join(', ')
            })),
            insights: report.insights.map(insight => ({
                tipo: insight.type,
                titulo: insight.title,
                impacto: insight.impact,
                mensagem: insight.message
            })),
            recomendacoes: {
                imediatas: report.recommendations.immediate.map(r => ({
                    categoria: r.category,
                    mensagem: r.message,
                    acao: r.action
                })),
                curtosPrazo: report.recommendations.shortTerm.map(r => ({
                    categoria: r.category,
                    mensagem: r.message,
                    acao: r.action
                })),
                longoPrazo: report.recommendations.longTerm.map(r => ({
                    categoria: r.category,
                    mensagem: r.message,
                    acao: r.action
                }))
            }
        };
        
        return exportData;
    } catch (error) {
        console.error('Erro ao gerar relatório comparativo:', error);
        return null;
    }
}

// Exportar relatório comparativo como texto
async function exportComparativeReport() {
    const reportData = await generateComparativeReportForExport();
    if (!reportData) {
        alert('Erro ao gerar relatório. Verifique se há dados suficientes.');
        return;
    }
    
    const reportText = `
===============================================
    ${reportData.titulo}
===============================================
📅 Data de Geração: ${reportData.dataGeracao}

🏆 RESUMO EXECUTIVO
───────────────────
• Score Geral: ${reportData.resumo.scoreGeral}
• Posição no Mercado: ${reportData.resumo.posicaoMercado}
• Ponto Forte: ${reportData.resumo.pontoForte}
• Área para Melhoria: ${reportData.resumo.areaParaMelhoria}

📊 SUAS MÉTRICAS
─────────────────
• Total Gasto: ${reportData.metricas.totalGasto}
• Total de Compras: ${reportData.metricas.totalCompras}
• Gasto Médio Mensal: ${reportData.metricas.gastoMedioMensal}
• Itens por Compra: ${reportData.metricas.itensPorCompra}
• Frequência de Compras: ${reportData.metricas.frequenciaCompras}

🎯 COMPARAÇÃO COM O MERCADO
───────────────────────────
• Economia vs. Mercado: ${reportData.comparacaoMercado.economiaVsMercado}
• Seu Percentil: ${reportData.comparacaoMercado.percentil}
• Eficiência vs. Mercado: ${reportData.comparacaoMercado.eficienciaVsMercado}

🥊 COMPARAÇÃO COM COMPETIDORES
──────────────────────────────
${reportData.competidores.map(comp => `
• ${comp.app}:
  - Vantagem em Economia: ${comp.vantagemEconomia}
  - Vantagem em Satisfação: ${comp.vantagensSatisfacao}
  - Recursos Únicos do Listou: ${comp.recursoUnicos}
`).join('')}

💡 INSIGHTS AVANÇADOS
─────────────────────
${reportData.insights.map(insight => `
• [${insight.impacto.toUpperCase()}] ${insight.titulo}
  ${insight.mensagem}
`).join('')}

🎯 RECOMENDAÇÕES
────────────────

📍 AÇÕES IMEDIATAS (ALTA PRIORIDADE):
${reportData.recomendacoes.imediatas.length > 0 ? 
  reportData.recomendacoes.imediatas.map(rec => `
• ${rec.categoria}: ${rec.mensagem}
  ▸ Ação: ${rec.acao}
`).join('') : '✅ Nenhuma ação imediata necessária!'}

📍 AÇÕES DE CURTO PRAZO (MÉDIA PRIORIDADE):
${reportData.recomendacoes.curtosPrazo.length > 0 ? 
  reportData.recomendacoes.curtosPrazo.map(rec => `
• ${rec.categoria}: ${rec.mensagem}
  ▸ Ação: ${rec.acao}
`).join('') : '✅ Continue com as práticas atuais!'}

📍 AÇÕES DE LONGO PRAZO (BAIXA PRIORIDADE):
${reportData.recomendacoes.longoPrazo.length > 0 ? 
  reportData.recomendacoes.longoPrazo.map(rec => `
• ${rec.categoria}: ${rec.mensagem}
  ▸ Ação: ${rec.acao}
`).join('') : '✅ Excelente performance geral!'}

===============================================
Relatório gerado pelo Listou - Lista de Compras Inteligente
Desenvolvido por Rafael Araújo
===============================================
    `.trim();
    
    // Criar e baixar arquivo
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-comparativo-listou-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar feedback
    showNotification('📊 Relatório comparativo exportado com sucesso!', 'success');
}

// Exportar dados comparativos como JSON
async function exportComparativeDataJSON() {
    const reportData = await generateComparativeReportForExport();
    if (!reportData) {
        alert('Erro ao gerar dados. Verifique se há informações suficientes.');
        return;
    }
    
    const jsonData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados-comparativos-listou-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📊 Dados comparativos exportados em JSON!', 'success');
}

// Função para mostrar dicas de melhoria personalizadas
function showImprovementTips() {
    if (!analytics) return;
    
    try {
        const performance = analytics.getPerformanceMetrics();
        const suggestions = performance.comparison.improvement;
        
        if (suggestions.length === 0) {
            showNotification('🎉 Parabéns! Você já está otimizando muito bem suas compras.', 'success');
            return;
        }
        
        const highPriorityTips = suggestions.filter(s => s.priority === 'high').slice(0, 3);
        const tips = highPriorityTips.length > 0 ? highPriorityTips : suggestions.slice(0, 3);
        
        const tipText = tips.map((tip, index) => 
            `${index + 1}. ${tip.message}\n💡 ${tip.action}`
        ).join('\n\n');
        
        alert(`🎯 DICAS PERSONALIZADAS PARA VOCÊ:\n\n${tipText}\n\n📊 Use os relatórios para acompanhar seu progresso!`);
        
    } catch (error) {
        console.error('Erro ao mostrar dicas:', error);
    }
}

// Função auxiliar para formatar nome da categoria
function formatCategoryName(category) {
    const categoryNames = {
        'frutas': 'Frutas',
        'verduras': 'Verduras',
        'carnes': 'Carnes',
        'laticínios': 'Laticínios',
        'grãos': 'Grãos',
        'bebidas': 'Bebidas',
        'limpeza': 'Limpeza',
        'higiene': 'Higiene',
        'padaria': 'Padaria',
        'congelados': 'Congelados',
        'temperos': 'Temperos',
        'doces': 'Doces',
        'outros': 'Outros'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// Carrega e atualiza a lista
async function refreshList() {
    currentItems = await dbGetItems();
    filteredItems = currentItems; // Sem filtros, mostra todos os itens
    renderList();
    updateSmartSuggestions();
}

// Adiciona novo item com inteligência
async function handleAddItem() {
    console.log('handleAddItem chamada');
    
    const name = itemInput.value.trim();
    console.log('Nome do item:', name);
    
    if (!name) {
        console.log('Nome vazio, retornando');
        return;
    }

    console.log('Adicionando item:', name); // Debug

    const category = categorySelect.value || (intelligence ? intelligence.detectCategory(name) : 'outros');
    console.log('Categoria detectada:', category);
    
    const priceInput = document.getElementById('item-price-input');
    const qtyInput = document.getElementById('item-qty-input');
    let price = priceInput && priceInput.value ? parseFloat(priceInput.value.replace(',', '.')) : undefined;
    if (isNaN(price)) price = undefined;
    let qty = qtyInput && qtyInput.value ? parseInt(qtyInput.value, 10) : 1;
    if (isNaN(qty) || qty < 1) qty = 1;

    // Verifica se já existe um item igual (case-insensitive)
    const existing = currentItems.find(i => i.name.trim().toLowerCase() === name.toLowerCase());
    try {
        if (existing) {
            // Soma a quantidade
            const novaQtd = (parseInt(existing.qty, 10) || 1) + qty;
            await dbUpdateItem(existing.id, { qty: novaQtd });
            // Atualiza preço se informado
            if (price !== undefined && !isNaN(price)) {
                await dbUpdateItem(existing.id, { price });
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
            await dbAddItem(newItem);
            updateRecentLists(newItem);
        }

        itemInput.value = '';
        categorySelect.value = '';
        if (priceInput) priceInput.value = '';
        if (qtyInput) qtyInput.value = '';
        hideAutocomplete();
        await refreshList();
        console.log('Processo concluído com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar item:', error); // Debug
    }
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
            <span class="recent-name">${newItem.name.toUpperCase()}</span>
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

// Funções auxiliares para compartilhamento e exportação
function shareList() {
    const items = currentItems.map(item => ({
        name: item.name.toUpperCase(),
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
        navigator.clipboard.writeText(shareUrl);
        alert('Link de compartilhamento copiado para a área de transferência!');
    } catch {
        prompt('Copie este link para compartilhar sua lista:', shareUrl);
    }
}

function exportList() {
    const listText = currentItems
        .map(item => `${item.bought ? '✅' : '☐'} ${item.name.toUpperCase()} (${item.qty}x)`)
        .join('\n');
    
    try {
        navigator.clipboard.writeText(listText);
        alert('Lista copiada para a área de transferência!');
    } catch {
        prompt('Copie sua lista:', listText);
    }
}

// Função para criar novo template
function createNewTemplate() {
    const templateName = prompt('Nome do novo template:');
    if (!templateName || !templateName.trim()) {
        return;
    }
    
    const name = templateName.trim();
    
    // Criar modal para editar template
    const modal = document.createElement('div');
    modal.className = 'template-modal';
    modal.innerHTML = `
        <div class="template-modal-content">
            <div class="template-modal-header">
                <h3>📋 Criar Template: ${name}</h3>
                <button class="template-modal-close">&times;</button>
            </div>
            <div class="template-modal-body">
                <div class="template-icon-selector">
                    <label>Escolha um ícone para o template:</label>
                    <div class="icon-grid" id="template-icon-grid">
                        <button class="icon-option selected" data-icon="🛒">🛒</button>
                        <button class="icon-option" data-icon="🍎">🍎</button>
                        <button class="icon-option" data-icon="🥬">🥬</button>
                        <button class="icon-option" data-icon="🥩">🥩</button>
                        <button class="icon-option" data-icon="🥛">🥛</button>
                        <button class="icon-option" data-icon="🍞">🍞</button>
                        <button class="icon-option" data-icon="🧽">🧽</button>
                        <button class="icon-option" data-icon="🧴">🧴</button>
                        <button class="icon-option" data-icon="🥤">🥤</button>
                        <button class="icon-option" data-icon="📦">📦</button>
                        <button class="icon-option" data-icon="🏠">🏠</button>
                        <button class="icon-option" data-icon="🎉">🎉</button>
                        <button class="icon-option" data-icon="🍕">🍕</button>
                        <button class="icon-option" data-icon="☕">☕</button>
                        <button class="icon-option" data-icon="🍰">🍰</button>
                        <button class="icon-option" data-icon="🎂">🎂</button>
                        <button class="icon-option" data-icon="🥳">🥳</button>
                        <button class="icon-option" data-icon="🎊">🎊</button>
                        <button class="icon-option" data-icon="🌟">🌟</button>
                        <button class="icon-option" data-icon="💝">💝</button>
                    </div>
                </div>
                <div class="template-item-input">
                    <input type="text" id="template-item-name" placeholder="Nome do item">
                    <select id="template-item-category">
                        <option value="">Categoria</option>
                        <option value="frutas">🍎 Frutas</option>
                        <option value="verduras">🥬 Verduras</option>
                        <option value="carnes">🥩 Carnes</option>
                        <option value="laticínios">🥛 Laticínios</option>
                        <option value="padaria">🍞 Padaria</option>
                        <option value="limpeza">🧽 Limpeza</option>
                        <option value="higiene">🧴 Higiene</option>
                        <option value="bebidas">🥤 Bebidas</option>
                        <option value="outros">📦 Outros</option>
                    </select>
                    <input type="number" id="template-item-qty" min="1" value="1" placeholder="Qtd">
                    <button id="template-add-item">Adicionar</button>
                </div>
                <div class="template-items-list" id="template-items-list">
                    <p>Nenhum item adicionado ainda.</p>
                </div>
            </div>
            <div class="template-modal-footer">
                <button id="template-save" class="template-save-btn">Salvar Template</button>
                <button id="template-cancel" class="template-cancel-btn">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let templateItems = [];
    let selectedIcon = '🛒'; // Ícone padrão
    
    // Event listeners do modal
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    modal.querySelector('.template-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#template-cancel').addEventListener('click', closeModal);
    
    // Event listeners para seleção de ícone
    modal.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIcon = btn.dataset.icon;
        });
    });
    
    modal.querySelector('#template-add-item').addEventListener('click', () => {
        const itemName = modal.querySelector('#template-item-name').value.trim();
        const itemCategory = modal.querySelector('#template-item-category').value || 'outros';
        const itemQty = parseInt(modal.querySelector('#template-item-qty').value) || 1;
        
        if (itemName) {
            templateItems.push({ name: itemName, category: itemCategory, qty: itemQty });
            
            // Atualizar lista visual
            const listEl = modal.querySelector('#template-items-list');
            listEl.innerHTML = templateItems.map((item, index) => `
                <div class="template-item" data-index="${index}">
                    <span>${getCategoryIcon(item.category)} ${item.name} (${item.qty}x)</span>
                    <button class="template-item-remove" data-index="${index}">×</button>
                </div>
            `).join('');
            
            // Event listeners para remover itens
            listEl.querySelectorAll('.template-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    templateItems.splice(index, 1);
                    // Recriar lista
                    btn.click();
                });
            });
            
            // Limpar campos
            modal.querySelector('#template-item-name').value = '';
            modal.querySelector('#template-item-category').value = '';
            modal.querySelector('#template-item-qty').value = '1';
        }
    });
    
    modal.querySelector('#template-save').addEventListener('click', async () => {
        if (templateItems.length === 0) {
            alert('Adicione pelo menos um item ao template.');
            return;
        }
        
        // Salvar template (aqui você implementaria a lógica de salvar no banco)
        console.log('Salvando template:', { name, items: templateItems, icon: selectedIcon });
        
        // Adicionar o novo template à interface
        addTemplateToGrid(name, templateItems, selectedIcon);
        
        alert(`Template "${name}" criado com ${templateItems.length} itens!`);
        closeModal();
    });
    
    // Clique fora do modal fecha
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Função para adicionar template ao grid visual
function addTemplateToGrid(templateName, templateItems, customIcon = null) {
    const templatesGrid = document.querySelector('.templates-grid');
    if (!templatesGrid) return;
    
    // Criar elemento do template
    const templateButton = document.createElement('button');
    templateButton.className = 'template-btn';
    templateButton.setAttribute('data-template', templateName.toLowerCase().replace(/\s+/g, '-'));
    
    // Usar ícone personalizado ou escolher baseado na categoria mais comum
    let templateIcon = customIcon;
    if (!templateIcon) {
        const categories = templateItems.map(item => item.category);
        const mostCommonCategory = categories.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        
        const categoryIcons = {
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
        
        templateIcon = categoryIcons[mostCommonCategory] || '📋';
    }
    
    templateButton.innerHTML = `
        <span class="template-icon">${templateIcon}</span>
        <span class="template-name">${templateName}</span>
        <span class="template-count">${templateItems.length} itens</span>
        <div class="template-actions">
            <button class="template-edit-btn" title="Editar template">✏️</button>
            <button class="template-delete-btn" title="Excluir template">🗑️</button>
        </div>
    `;
    
    // Adicionar event listener para carregar o template
    templateButton.addEventListener('click', async (e) => {
        // Se clicou nos botões de ação, não carregar o template
        if (e.target.classList.contains('template-edit-btn') || 
            e.target.classList.contains('template-delete-btn')) {
            return;
        }
        
        // Adiciona itens do template à lista atual (soma em vez de substituir)
        for (const item of templateItems) {
            // Verifica se o item já existe na lista atual
            const existingItem = currentItems.find(existing => 
                existing.name.toLowerCase() === item.name.toLowerCase() && 
                existing.category === item.category
            );
            
            if (existingItem) {
                // Se já existe, aumenta a quantidade
                await dbUpdateItem(existingItem.id, {
                    qty: existingItem.qty + (item.qty || 1)
                });
            } else {
                // Se não existe, adiciona novo item
                await dbAddItem({
                    ...item,
                    bought: false,
                    price: intelligence ? intelligence.getEstimatedPrice(item.name) : 0,
                    addedAt: new Date().toISOString()
                });
            }
        }
        
        refreshList();
        alert(`Template "${templateName}" carregado com sucesso!`);
    });
    
    // Event listener para editar template
    const editBtn = templateButton.querySelector('.template-edit-btn');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editTemplate(templateName, templateItems, templateIcon, templateButton);
    });
    
    // Event listener para excluir template
    const deleteBtn = templateButton.querySelector('.template-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Tem certeza que deseja excluir o template "${templateName}"?`)) {
            templateButton.remove();
            alert(`Template "${templateName}" excluído com sucesso!`);
        }
    });
    
    // Adicionar ao grid
    templatesGrid.appendChild(templateButton);
}

// Função para editar template existente
function editTemplate(templateName, templateItems, templateIcon, templateButton) {
    // Criar modal de edição (similar ao de criação)
    const modal = document.createElement('div');
    modal.className = 'template-modal';
    modal.innerHTML = `
        <div class="template-modal-content">
            <div class="template-modal-header">
                <h3>✏️ Editar Template: ${templateName}</h3>
                <button class="template-modal-close">&times;</button>
            </div>
            <div class="template-modal-body">
                <div class="template-icon-selector">
                    <label>Escolha um ícone para o template:</label>
                    <div class="icon-grid" id="template-icon-grid">
                        <button class="icon-option ${templateIcon === '🛒' ? 'selected' : ''}" data-icon="🛒">🛒</button>
                        <button class="icon-option ${templateIcon === '🍎' ? 'selected' : ''}" data-icon="🍎">🍎</button>
                        <button class="icon-option ${templateIcon === '🥬' ? 'selected' : ''}" data-icon="🥬">🥬</button>
                        <button class="icon-option ${templateIcon === '🥩' ? 'selected' : ''}" data-icon="🥩">🥩</button>
                        <button class="icon-option ${templateIcon === '🥛' ? 'selected' : ''}" data-icon="🥛">🥛</button>
                        <button class="icon-option ${templateIcon === '🍞' ? 'selected' : ''}" data-icon="🍞">🍞</button>
                        <button class="icon-option ${templateIcon === '🧽' ? 'selected' : ''}" data-icon="🧽">🧽</button>
                        <button class="icon-option ${templateIcon === '🧴' ? 'selected' : ''}" data-icon="🧴">🧴</button>
                        <button class="icon-option ${templateIcon === '🥤' ? 'selected' : ''}" data-icon="🥤">🥤</button>
                        <button class="icon-option ${templateIcon === '📦' ? 'selected' : ''}" data-icon="📦">📦</button>
                        <button class="icon-option ${templateIcon === '🏠' ? 'selected' : ''}" data-icon="🏠">🏠</button>
                        <button class="icon-option ${templateIcon === '🎉' ? 'selected' : ''}" data-icon="🎉">🎉</button>
                        <button class="icon-option ${templateIcon === '🍕' ? 'selected' : ''}" data-icon="🍕">🍕</button>
                        <button class="icon-option ${templateIcon === '☕' ? 'selected' : ''}" data-icon="☕">☕</button>
                        <button class="icon-option ${templateIcon === '🍰' ? 'selected' : ''}" data-icon="🍰">🍰</button>
                        <button class="icon-option ${templateIcon === '🎂' ? 'selected' : ''}" data-icon="🎂">🎂</button>
                        <button class="icon-option ${templateIcon === '🥳' ? 'selected' : ''}" data-icon="🥳">🥳</button>
                        <button class="icon-option ${templateIcon === '🎊' ? 'selected' : ''}" data-icon="🎊">🎊</button>
                        <button class="icon-option ${templateIcon === '🌟' ? 'selected' : ''}" data-icon="🌟">🌟</button>
                        <button class="icon-option ${templateIcon === '💝' ? 'selected' : ''}" data-icon="💝">💝</button>
                    </div>
                </div>
                <div class="template-item-input">
                    <input type="text" id="template-item-name" placeholder="Nome do item">
                    <select id="template-item-category">
                        <option value="">Categoria</option>
                        <option value="frutas">🍎 Frutas</option>
                        <option value="verduras">🥬 Verduras</option>
                        <option value="carnes">🥩 Carnes</option>
                        <option value="laticínios">🥛 Laticínios</option>
                        <option value="padaria">🍞 Padaria</option>
                        <option value="limpeza">🧽 Limpeza</option>
                        <option value="higiene">🧴 Higiene</option>
                        <option value="bebidas">🥤 Bebidas</option>
                        <option value="outros">📦 Outros</option>
                    </select>
                    <input type="number" id="template-item-qty" min="1" value="1" placeholder="Qtd">
                    <button id="template-add-item">Adicionar</button>
                </div>
                <div class="template-items-list" id="template-items-list">
                    <p>Nenhum item adicionado ainda.</p>
                </div>
            </div>
            <div class="template-modal-footer">
                <button id="template-save" class="template-save-btn">Salvar Alterações</button>
                <button id="template-cancel" class="template-cancel-btn">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let editedItems = [...templateItems]; // Copia dos itens originais
    let selectedIcon = templateIcon;
    
    // Atualizar lista visual inicial
    updateEditItemsList();
    
    function updateEditItemsList() {
        const listEl = modal.querySelector('#template-items-list');
        if (editedItems.length === 0) {
            listEl.innerHTML = '<p>Nenhum item adicionado ainda.</p>';
        } else {
            listEl.innerHTML = editedItems.map((item, index) => `
                <div class="template-item" data-index="${index}">
                    <span>${getCategoryIcon(item.category)} ${item.name} (${item.qty}x)</span>
                    <button class="template-item-remove" data-index="${index}">×</button>
                </div>
            `).join('');
            
            // Event listeners para remover itens
            listEl.querySelectorAll('.template-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    editedItems.splice(index, 1);
                    updateEditItemsList();
                });
            });
        }
    }
    
    // Event listeners do modal
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    modal.querySelector('.template-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#template-cancel').addEventListener('click', closeModal);
    
    // Event listeners para seleção de ícone
    modal.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIcon = btn.dataset.icon;
        });
    });
    
    modal.querySelector('#template-add-item').addEventListener('click', () => {
        const itemName = modal.querySelector('#template-item-name').value.trim();
        const itemCategory = modal.querySelector('#template-item-category').value || 'outros';
        const itemQty = parseInt(modal.querySelector('#template-item-qty').value) || 1;
        
        if (itemName) {
            editedItems.push({ name: itemName, category: itemCategory, qty: itemQty });
            updateEditItemsList();
            
            // Limpar campos
            modal.querySelector('#template-item-name').value = '';
            modal.querySelector('#template-item-category').value = '';
            modal.querySelector('#template-item-qty').value = '1';
        }
    });
    
    modal.querySelector('#template-save').addEventListener('click', () => {
        if (editedItems.length === 0) {
            alert('Adicione pelo menos um item ao template.');
            return;
        }
        
        // Atualizar o template button existente
        templateButton.querySelector('.template-icon').textContent = selectedIcon;
        templateButton.querySelector('.template-count').textContent = `${editedItems.length} itens`;
        
        alert(`Template "${templateName}" atualizado com sucesso!`);
        closeModal();
    });
    
    // Clique fora do modal fecha
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
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
            let price = intelligence.getEstimatedPrice(suggestion.name);
            let userPrice = prompt(`Informe o valor para "${suggestion.name}" (R$):`, price !== undefined && price !== null ? price.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '');
            if (userPrice !== null && userPrice !== '') {
                userPrice = userPrice.replace(',', '.');
                const parsed = parseFloat(userPrice);
                if (!isNaN(parsed)) price = parsed;
            }
            const newItem = {
                name: suggestion.name,
                category: suggestion.category,
                qty: 1,
                bought: false,
                price,
                addedAt: new Date().toISOString()
            };
            await dbAddItem(newItem);
            refreshList();
        });
        suggestionsList.appendChild(button);
    });
}

// Event Listeners
if (itemInput) {
    itemInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            const suggestions = intelligence.getAutocompleteSuggestions(query);
            showAutocomplete(suggestions);
        } else {
            hideAutocomplete();
        }
    }, 300));
}

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


addItemBtn.addEventListener('click', (e) => {
    console.log('Botão + clicado');
    handleAddItem(e);
});

// Ações da lista
shoppingList.addEventListener('click', async e => {
    const id = e.target.dataset.id;
    if (!id) return;
    
    const item = currentItems.find(item => item.id === parseInt(id));
    if (!item) return;
    
    if (e.target.classList.contains('plus1-btn')) {
        await dbUpdateItem(id, { $inc: { qty: 1 } });
        // Atualizar dados locais instantaneamente
        item.qty = (item.qty || 1) + 1;
        updateStats();
        // Atualizar só o elemento visual sem re-renderizar toda lista
        const qtyInput = e.target.closest('.shopping-item').querySelector('.item-qty');
        if (qtyInput) qtyInput.value = item.qty;
        
    } else if (e.target.classList.contains('plus5-btn')) {
        await dbUpdateItem(id, { $inc: { qty: 5 } });
        // Atualizar dados locais instantaneamente
        item.qty = (item.qty || 1) + 5;
        updateStats();
        // Atualizar só o elemento visual
        const qtyInput = e.target.closest('.shopping-item').querySelector('.item-qty');
        if (qtyInput) qtyInput.value = item.qty;
        
    } else if (e.target.classList.contains('bought-btn')) {
        const bought = !item.bought;
        await dbUpdateItem(id, { bought });
        
        // Atualizar dados locais instantaneamente
        item.bought = bought;
        updateStats();
        
        // Atualizar visual do botão e item
        e.target.classList.toggle('active', bought);
        e.target.textContent = bought ? '✅' : '✓';
        e.target.closest('.shopping-item').classList.toggle('item-bought', bought);
        
        // Adiciona ao histórico quando marcado como comprado
        if (bought) {
            intelligence.addToPurchaseHistory({
                ...item,
                bought: true,
                price: item.price || intelligence.getEstimatedPrice(item.name)
            });
            
            // Registra no analytics para relatórios
            if (analytics) {
                const purchaseItem = {
                    ...item,
                    price: item.price || intelligence.getEstimatedPrice(item.name)
                };
                analytics.recordPurchase([purchaseItem], purchaseItem.price * purchaseItem.qty, null, currentSupermarket?.name);
            }
        }
        
    } else if (e.target.classList.contains('delete-btn')) {
        if (confirm('Remover este item da lista?')) {
            await dbDeleteItem(id);
            // Remover do array local instantaneamente
            const index = currentItems.findIndex(i => i.id === parseInt(id));
            if (index > -1) {
                currentItems.splice(index, 1);
                filteredItems = currentItems;
            }
            updateStats();
            // Remover elemento visual da lista
            e.target.closest('.shopping-item').remove();
        }
        
    } else if (e.target.classList.contains('item-favorite')) {
        const isFavorite = intelligence.toggleFavorite(item.name);
        e.target.textContent = isFavorite ? '⭐' : '☆';
        e.target.classList.toggle('active', isFavorite);
        
    } else if (e.target.classList.contains('price-display')) {
        // Verificar se já há algum input de preço ativo
        const activeInput = document.querySelector('.price-input[style*="inline-block"]');
        if (activeInput) {
            // Salvar o input ativo primeiro
            await savePriceEdit(activeInput);
        }
        
        // Clique no preço - mostrar input de edição
        console.log('Clique no preço detectado!', e.target);
        const priceDisplay = e.target;
        const priceInput = priceDisplay.parentElement.querySelector('.price-input');
        
        console.log('Price input encontrado:', priceInput);
        
        if (priceInput) {
            priceDisplay.style.display = 'none';
            priceInput.style.display = 'inline-block';
            priceInput.focus();
            priceInput.select();
            console.log('Input de preço ativado');
        }
    } else if (e.target.classList.contains('item-name') || e.target.closest('.item-name')) {
        // Clique no nome do item - alterna status de comprado
        const itemNameElement = e.target.classList.contains('item-name') ? e.target : e.target.closest('.item-name');
        const actualId = itemNameElement.dataset.id;
        const actualItem = currentItems.find(item => item.id === parseInt(actualId));
        
        console.log('Clique no nome do item detectado!', itemNameElement);
        console.log('ID:', actualId, 'Item:', actualItem);
        
        if (!actualItem) {
            console.error('Item não encontrado!');
            return;
        }
        
        const bought = !actualItem.bought;
        console.log('Estado anterior:', actualItem.bought, 'Novo estado:', bought);
        
        await dbUpdateItem(actualId, { bought });
        // Atualizar dados locais instantaneamente
        actualItem.bought = bought;
        updateStats();
        
        // Atualizar visual do botão e item
        const itemElement = itemNameElement.closest('.shopping-item');
        console.log('Elemento do item:', itemElement);
        
        if (itemElement) {
            const boughtBtn = itemElement.querySelector('.bought-btn');
            if (boughtBtn) {
                boughtBtn.classList.toggle('active', bought);
                boughtBtn.textContent = bought ? '✅' : '✓';
            }
            itemElement.classList.toggle('item-bought', bought);
            console.log('Classe item-bought aplicada:', itemElement.classList.contains('item-bought'));
            
            // Forçar atualização visual se necessário
            if (bought) {
                itemNameElement.style.textDecoration = 'line-through';
                itemNameElement.style.textDecorationColor = '#ef4444';
                itemNameElement.style.textDecorationThickness = '2px';
                console.log('Estilo de tachado forçado aplicado');
            } else {
                itemNameElement.style.textDecoration = 'none';
                console.log('Estilo de tachado removido');
            }
        }
        // Adiciona ao histórico quando marcado como comprado
        if (bought && typeof intelligence !== 'undefined' && intelligence.addToPurchaseHistory) {
            intelligence.addToPurchaseHistory({
                ...item,
                bought: true,
                price: item.price || (typeof intelligence.getEstimatedPrice === 'function' ? intelligence.getEstimatedPrice(item.name) : 0)
            });
        }
    }
    
    // Não chamar refreshList() aqui - cada ação específica já atualiza quando necessário
});

// Event listeners para edição de preço
shoppingList.addEventListener('keydown', async e => {
    if (e.target.classList.contains('price-input')) {
        if (e.key === 'Enter') {
            e.preventDefault();
            await savePriceEdit(e.target);
        } else if (e.key === 'Escape') {
            cancelPriceEdit(e.target);
        }
    }
});

// Event listener para clique fora do input (usando delegação)
document.addEventListener('click', async e => {
    // Se clicou em um price-input, não fazer nada
    if (e.target.classList.contains('price-input')) return;
    
    // Se clicou em um price-display, não fazer nada (será tratado pelo outro listener)
    if (e.target.classList.contains('price-display')) return;
    
    // Se há algum input de preço visível, salvar e fechar
    const visiblePriceInput = document.querySelector('.price-input[style*="inline-block"]');
    if (visiblePriceInput) {
        await savePriceEdit(visiblePriceInput);
    }
});

// Função para salvar edição de preço
async function savePriceEdit(priceInput) {
    console.log('savePriceEdit chamada:', priceInput.value);
    const id = priceInput.dataset.id;
    const newPrice = parseFloat(priceInput.value) || null;
    const priceDisplay = priceInput.parentElement.querySelector('.price-display');
    
    console.log('ID:', id, 'Novo preço:', newPrice);
    
    try {
        await dbUpdateItem(id, { price: newPrice });
        console.log('Preço atualizado no banco de dados');
        
        // Atualizar apenas o display local, sem recarregar toda a lista
        priceDisplay.textContent = newPrice !== null && newPrice !== undefined ? 
            `R$ ${newPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 
            'R$ --';
        
        // Voltar ao modo de exibição
        priceInput.style.display = 'none';
        priceDisplay.style.display = 'inline-block';
        
        // Atualizar apenas o item no array local
        const itemIndex = currentItems.findIndex(item => item.id === parseInt(id));
        if (itemIndex !== -1) {
            currentItems[itemIndex].price = newPrice;
        }
        
        // Atualizar apenas as estatísticas
        updateStats();
        
        console.log('Display atualizado sem recarregar lista');
        
    } catch (error) {
        console.error('Erro ao salvar preço:', error);
        cancelPriceEdit(priceInput);
    }
}

// Função para cancelar edição de preço
function cancelPriceEdit(priceInput) {
    const priceDisplay = priceInput.parentElement.querySelector('.price-display');
    priceInput.style.display = 'none';
    priceDisplay.style.display = 'inline-block';
}

// Mudança de quantidade
shoppingList.addEventListener('change', async e => {
    if (e.target.classList.contains('item-qty')) {
        const id = e.target.dataset.id;
        const qty = parseInt(e.target.value, 10) || 1;
        await dbUpdateItem(id, { qty });
        
        // Atualizar dados locais instantaneamente
        const item = currentItems.find(item => item.id === parseInt(id));
        if (item) {
            item.qty = qty;
        }
        
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
        
        // Adiciona itens do template à lista atual (soma em vez de substituir)
        for (const item of items) {
            // Verifica se o item já existe na lista atual
            const existingItem = currentItems.find(existing => 
                existing.name.toLowerCase() === item.name.toLowerCase() && 
                existing.category === item.category
            );
            
            if (existingItem) {
                // Se já existe, aumenta a quantidade
                await dbUpdateItem(existingItem.id, {
                    qty: existingItem.qty + (item.qty || 1)
                });
            } else {
                // Se não existe, adiciona novo item
                await dbAddItem({
                    ...item,
                    price: intelligence.getEstimatedPrice(item.name),
                    addedAt: new Date().toISOString()
                });
            }
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
}

if (importListBtn) {
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
}

// QR Code (placeholder)
const scanQRBtn = document.getElementById('scan-qr-btn');
if (scanQRBtn) {
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
}

// Carrega configurações salvas
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se há lista compartilhada na URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');
    if (sharedData) {
        try {
            const data = JSON.parse(atob(sharedData));
            if (data.items && confirm('Adicionar itens da lista compartilhada à lista atual?')) {
                data.items.forEach(async item => {
                    // Verifica se o item já existe na lista atual
                    const existingItem = currentItems.find(existing => 
                        existing.name.toLowerCase() === item.name.toLowerCase() && 
                        existing.category === item.category
                    );
                    
                    if (existingItem) {
                        // Se já existe, aumenta a quantidade
                        await dbUpdateItem(existingItem.id, {
                            qty: existingItem.qty + (item.qty || 1)
                        });
                    } else {
                        // Se não existe, adiciona novo item
                        await dbAddItem({
                            ...item,
                            bought: false,
                            price: intelligence.getEstimatedPrice(item.name),
                            addedAt: new Date().toISOString()
                        });
                    }
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


// PWA: registrar service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

// ==================== FUNÇÕES DE TIPO DE COMPRA ====================

// Verifica se é a primeira vez que o usuário abre o app e mostra modal
function checkFirstTimeUser() {
    const hasSelectedPurchaseType = localStorage.getItem('listou-purchase-type');
    
    if (!hasSelectedPurchaseType) {
        showPurchaseTypeModal();
    } else {
        // Usuário já escolheu o tipo de compra, garantir que o modal esteja escondido
        hidePurchaseTypeModal();
        updatePurchaseTypeBadge(hasSelectedPurchaseType);
    }
}

// Mostra o modal de seleção de tipo de compra
function showPurchaseTypeModal() {
    const modal = document.getElementById('purchase-type-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Previne scroll do body
        document.body.style.overflow = 'hidden';
    }
}

// Esconde o modal de seleção de tipo de compra
function hidePurchaseTypeModal() {
    const modal = document.getElementById('purchase-type-modal');
    if (modal) {
        modal.classList.add('hidden');
        // Restaura scroll do body
        document.body.style.overflow = '';
    }
}

// Seleciona o tipo de compra
function selectPurchaseType(type) {
    localStorage.setItem('listou-purchase-type', type);
    updatePurchaseTypeBadge(type);
    hidePurchaseTypeModal();
    
    // Mostra notificação de confirmação
    if (type === 'controlled') {
        showNotification('✅ Compra Controlada ativada! Seus dados serão utilizados para relatórios.', 'success');
    } else {
        showNotification('🛍️ Compra Avulsa ativada! Nenhum dado será salvo para relatórios.', 'info');
    }
    
    console.log(`Tipo de compra selecionado: ${type}`);
}

// Atualiza o badge do tipo de compra
function updatePurchaseTypeBadge(type) {
    const badge = document.getElementById('purchase-type-badge');
    if (!badge) return;
    
    if (type === 'controlled') {
        badge.textContent = '📊 Controlada';
        badge.className = 'purchase-type-badge';
    } else {
        badge.textContent = '🛍️ Avulsa';
        badge.className = 'purchase-type-badge casual';
    }
}

// Verifica se os dados devem ser salvos para analytics
function shouldSaveToAnalytics() {
    const purchaseType = localStorage.getItem('listou-purchase-type');
    return purchaseType === 'controlled';
}

// ==================== FUNÇÕES DE MARCAR ITENS COMO COMPRADOS ====================

// Alterna o estado de comprado do item
function toggleItemPurchased(listItem) {
    const isPurchased = listItem.classList.contains('purchased');
    
    if (isPurchased) {
        // Remove estado de comprado
        listItem.classList.remove('purchased');
        updateItemInDatabase(listItem, { purchased: false });
        showNotification('Item desmarcado como comprado', 'info');
    } else {
        // Marca como comprado
        listItem.classList.add('purchased');
        updateItemInDatabase(listItem, { purchased: true });
        showNotification('Item marcado como comprado ✓', 'success');
        
        // Adiciona pequena animação de confirmação
        listItem.style.transform = 'scale(0.98)';
        setTimeout(() => {
            listItem.style.transform = '';
        }, 200);
    }
}

// Atualiza item no banco de dados
async function updateItemInDatabase(listItem, updates) {
    try {
        const itemId = listItem.getAttribute('data-id');
        if (itemId && window.dbUpdateItem) {
            await dbUpdateItem(parseInt(itemId), updates);
        }
    } catch (error) {
        console.error('Erro ao atualizar item no banco:', error);
    }
}

// Mostra notificação para o usuário
function showNotification(message, type = 'info') {
    // Remove notificações existentes
    const existingNotifications = document.querySelectorAll('.app-notification');
    existingNotifications.forEach(n => n.remove());
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `app-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Adiciona estilos inline para a notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Atualiza a lista para mostrar itens comprados
function updateListItemsDisplay() {
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        const itemId = item.getAttribute('data-id');
        if (itemId && window.getItemById) {
            getItemById(parseInt(itemId)).then(dbItem => {
                if (dbItem && dbItem.purchased) {
                    item.classList.add('purchased');
                }
            }).catch(console.error);
        }
    });
}

// Modifica a função refreshList existente para incluir estado de comprado
const originalRefreshList = window.refreshList;
if (originalRefreshList) {
    window.refreshList = function() {
        originalRefreshList.apply(this, arguments);
        // Aguarda um pouco para a lista ser renderizada
        setTimeout(updateListItemsDisplay, 100);
    };
}

// ==================== MODIFICAÇÕES NA FUNÇÃO DE COMPRA ====================

// Modifica a função de finalizar compra para considerar o tipo de compra
function finalizePurchaseWithType(items, totalSpent) {
    if (shouldSaveToAnalytics() && analytics) {
        // Salva dados para analytics apenas se for compra controlada
        analytics.recordPurchase(items, totalSpent, null, currentSupermarket?.name);
        console.log('Dados da compra salvos para analytics');
    } else {
        console.log('Compra avulsa - dados não salvos para analytics');
    }
    
    // Limpa itens comprados da lista
    clearPurchasedItems();
}

// Remove itens marcados como comprados da lista
async function clearPurchasedItems() {
    try {
        const purchasedItems = document.querySelectorAll('.list-item.purchased');
        
        for (const item of purchasedItems) {
            const itemId = item.getAttribute('data-id');
            if (itemId && window.dbDeleteItem) {
                await dbDeleteItem(parseInt(itemId));
            }
        }
        
        // Atualiza a lista
        if (window.refreshList) {
            refreshList();
        }
        
        showNotification('Itens comprados removidos da lista', 'success');
    } catch (error) {
        console.error('Erro ao remover itens comprados:', error);
        showNotification('Erro ao remover itens comprados', 'warning');
    }
}

// Adiciona botão para finalizar compra
function addFinalizePurchaseButton() {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('finalize-purchase-btn')) {
        const finalizeBtn = document.createElement('button');
        finalizeBtn.id = 'finalize-purchase-btn';
        finalizeBtn.className = 'header-btn success';
        finalizeBtn.title = 'Finalizar compra';
        finalizeBtn.innerHTML = '✅';
        
        finalizeBtn.addEventListener('click', () => {
            const purchasedItems = document.querySelectorAll('.list-item.purchased');
            if (purchasedItems.length === 0) {
                showNotification('Nenhum item marcado como comprado', 'warning');
                return;
            }
            
            const confirmation = confirm(`Finalizar compra com ${purchasedItems.length} item(ns)?`);
            if (confirmation) {
                // Calcula total da compra (estimativa)
                let totalSpent = 0;
                const items = [];
                
                purchasedItems.forEach(item => {
                    const nameEl = item.querySelector('.item-name');
                    const priceEl = item.querySelector('.item-price');
                    const qtyEl = item.querySelector('.item-qty');
                    
                    if (nameEl) {
                        const itemData = {
                            name: nameEl.textContent,
                            category: 'Geral',
                            qty: qtyEl ? parseInt(qtyEl.textContent) || 1 : 1,
                            price: priceEl ? parseFloat(priceEl.textContent.replace('R$', '').replace(',', '.')) || 0 : 0
                        };
                        items.push(itemData);
                        totalSpent += itemData.price * itemData.qty;
                    }
                });
                
                finalizePurchaseWithType(items, totalSpent);
            }
        });
        
        headerActions.insertBefore(finalizeBtn, headerActions.firstChild);
    }
}

// Salva o nome do supermercado selecionado
function saveSupermarketName() {
    const supermarketInput = document.getElementById('supermarket-name');
    if (supermarketInput && supermarketInput.value.trim()) {
        const supermarketName = supermarketInput.value.trim();
        localStorage.setItem('listou-current-supermarket', supermarketName);
        
        // Adiciona à lista de supermercados conhecidos
        let knownSupermarkets = JSON.parse(localStorage.getItem('listou-known-supermarkets') || '[]');
        if (!knownSupermarkets.includes(supermarketName)) {
            knownSupermarkets.push(supermarketName);
            localStorage.setItem('listou-known-supermarkets', JSON.stringify(knownSupermarkets));
            updateSupermarketFilter();
        }
    }
}

// Atualiza o filtro de supermercados com os supermercados conhecidos
function updateSupermarketFilter() {
    const supermarketFilter = document.getElementById('supermarket-filter');
    if (!supermarketFilter) return;
    
    const knownSupermarkets = JSON.parse(localStorage.getItem('listou-known-supermarkets') || '[]');
    
    // Limpa opções existentes exceto "todos"
    while (supermarketFilter.children.length > 1) {
        supermarketFilter.removeChild(supermarketFilter.lastChild);
    }
    
    // Adiciona supermercados conhecidos
    knownSupermarkets.forEach(supermarket => {
        const option = document.createElement('option');
        option.value = supermarket.toLowerCase().replace(/\s+/g, '-');
        option.textContent = supermarket;
        supermarketFilter.appendChild(option);
    });
}

// Filtra relatórios por supermercado
function filterReportsBySupermarket() {
    const supermarketFilter = document.getElementById('supermarket-filter');
    if (!supermarketFilter) return;
    
    const selectedSupermarket = supermarketFilter.value;
    console.log('Filtrando relatórios por supermercado:', selectedSupermarket);
    
    // Aqui você implementaria a lógica de filtro baseada no supermercado selecionado
    // Por enquanto, apenas atualizamos os dados fictícios
    updateMinimalAnalytics(selectedSupermarket);
}

// Atualiza os dados dos relatórios minimalistas
function updateMinimalAnalytics(selectedSupermarket = 'all') {
    // Dados fictícios para demonstração - na implementação real, 
    // estes dados viriam do analytics.js filtrados por supermercado
    
    const data = {
        totalSavings: selectedSupermarket === 'all' ? 'R$ 145,20' : 'R$ 87,30',
        monthlySpending: selectedSupermarket === 'all' ? 'R$ 485,30' : 'R$ 543,20',
        rankings: [
            { name: 'Atacadão', position: '1º', diff: '-R$ 45,20', class: 'best' },
            { name: 'Walmart', position: '2º', diff: '-R$ 32,10', class: 'good' },
            { name: 'Extra', position: '3º', diff: '-R$ 15,80', class: 'average' },
            { name: 'Pão de Açúcar', position: '4º', diff: '+R$ 28,90', class: 'expensive' }
        ],
        bestDeals: [
            { emoji: '🥛', name: 'Leite Integral 1L', price: 'R$ 4,99', store: 'Atacadão', savings: '-R$ 1,50' },
            { emoji: '🍞', name: 'Pão de Forma', price: 'R$ 3,79', store: 'Walmart', savings: '-R$ 0,90' },
            { emoji: '🍌', name: 'Banana Nanica kg', price: 'R$ 2,99', store: 'Extra', savings: '-R$ 1,20' }
        ]
    };
    
    // Atualiza elementos na interface
    const totalSavingsEl = document.getElementById('total-savings');
    const monthlySpendingEl = document.getElementById('monthly-spending');
    
    if (totalSavingsEl) totalSavingsEl.textContent = data.totalSavings;
    if (monthlySpendingEl) monthlySpendingEl.textContent = data.monthlySpending;
    
    // Atualiza ranking de supermercados
    updateSupermarketRanking(data.rankings);
    
    // Atualiza melhores ofertas
    updateBestDeals(data.bestDeals);
}

// Atualiza o ranking de supermercados
function updateSupermarketRanking(rankings) {
    const rankingContainer = document.getElementById('supermarket-ranking');
    if (!rankingContainer) return;
    
    rankingContainer.innerHTML = '';
    
    rankings.forEach(ranking => {
        const rankingItem = document.createElement('div');
        rankingItem.className = `ranking-item ${ranking.class}`;
        rankingItem.innerHTML = `
            <span class="rank-position">${ranking.position}</span>
            <span class="supermarket-name">${ranking.name}</span>
            <span class="price-diff">${ranking.diff}</span>
        `;
        rankingContainer.appendChild(rankingItem);
    });
}

// Atualiza as melhores ofertas
function updateBestDeals(deals) {
    const dealsContainer = document.getElementById('best-prices-items');
    if (!dealsContainer) return;
    
    dealsContainer.innerHTML = '';
    
    deals.forEach(deal => {
        const dealItem = document.createElement('div');
        dealItem.className = 'deal-item';
        dealItem.innerHTML = `
            <span class="item-emoji">${deal.emoji}</span>
            <div class="item-details">
                <span class="item-name">${deal.name}</span>
                <span class="best-price">${deal.price} <small>no ${deal.store}</small></span>
            </div>
            <span class="savings">${deal.savings}</span>
        `;
        dealsContainer.appendChild(dealItem);
    });
}

// ==================== FUNÇÕES DE EXPORTAÇÃO PNG E PDF ====================

// Exporta relatório como PNG com marca d'água
async function exportReportAsPNG() {
    try {
        // Importa a biblioteca html2canvas dinamicamente
        const html2canvas = await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        
        const reportSection = document.getElementById('section-analytics');
        if (!reportSection) {
            alert('Erro: Seção de relatórios não encontrada');
            return;
        }
        
        // Cria um elemento temporário para o relatório com marca d'água
        const tempContainer = createReportWithWatermark(reportSection);
        document.body.appendChild(tempContainer);
        
        // Gera a imagem
        const canvas = await html2canvas.default(tempContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0
        });
        
        // Remove o elemento temporário
        document.body.removeChild(tempContainer);
        
        // Converte para blob e faz download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `listou-relatorio-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
        // Mostra opções de compartilhamento se disponível
        if (navigator.share && blob) {
            const file = new File([blob], `listou-relatorio-${new Date().toISOString().split('T')[0]}.png`, {
                type: 'image/png'
            });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const shareBtn = confirm('Download realizado! Deseja compartilhar o relatório?');
                if (shareBtn) {
                    await navigator.share({
                        title: 'Relatório Listou - Economia de Compras',
                        text: 'Confira meu relatório de economia em compras gerado pelo Listou!',
                        files: [file]
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('Erro ao exportar PNG:', error);
        alert('Erro ao gerar imagem. Tente novamente.');
    }
}

// Exporta relatório como PDF com marca d'água
async function exportReportAsPDF() {
    try {
        // Importa a biblioteca jsPDF dinamicamente
        const jsPDF = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const html2canvas = await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        
        const reportSection = document.getElementById('section-analytics');
        if (!reportSection) {
            alert('Erro: Seção de relatórios não encontrada');
            return;
        }
        
        // Cria um elemento temporário para o relatório com marca d'água
        const tempContainer = createReportWithWatermark(reportSection);
        document.body.appendChild(tempContainer);
        
        // Gera a imagem do relatório
        const canvas = await html2canvas.default(tempContainer, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
        });
        
        // Remove o elemento temporário
        document.body.removeChild(tempContainer);
        
        // Cria o PDF
        const pdf = new jsPDF.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Adiciona logo/marca d'água no cabeçalho
        pdf.setFontSize(20);
        pdf.setTextColor(0, 123, 255);
        pdf.text('Listou - Lista Inteligente', 20, 20);
        
        pdf.setFontSize(12);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Relatório de Economia em Compras', 20, 30);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 38);
        
        // Adiciona a imagem do relatório
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // largura em mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
        
        // Adiciona rodapé com marca d'água
        const pageHeight = pdf.internal.pageSize.height;
        pdf.setFontSize(10);
        pdf.setTextColor(180, 180, 180);
        pdf.text('Gerado pelo Listou - App de Lista de Compras Inteligente', 20, pageHeight - 10);
        
        // Salva o PDF
        const fileName = `listou-relatorio-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        // Opção de compartilhamento se disponível
        if (navigator.share) {
            const pdfBlob = pdf.output('blob');
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                const shareBtn = confirm('Download realizado! Deseja compartilhar o relatório?');
                if (shareBtn) {
                    await navigator.share({
                        title: 'Relatório Listou - Economia de Compras',
                        text: 'Confira meu relatório de economia em compras gerado pelo Listou!',
                        files: [file]
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    }
}

// Cria uma versão do relatório com marca d'água para exportação
function createReportWithWatermark(originalElement) {
    const tempContainer = originalElement.cloneNode(true);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    // Adiciona cabeçalho com logo
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    header.style.paddingBottom = '15px';
    header.style.borderBottom = '2px solid #007bff';
    
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 50px; height: 50px; background: #007bff; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">L</div>
            <div>
                <h1 style="margin: 0; color: #007bff; font-size: 24px;">Listou</h1>
                <p style="margin: 0; color: #666; font-size: 14px;">Lista de Compras Inteligente</p>
            </div>
        </div>
        <div style="margin-left: auto; text-align: right; color: #666; font-size: 12px;">
            <div>Relatório gerado em:</div>
            <div style="font-weight: bold;">${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
    `;
    
    tempContainer.insertBefore(header, tempContainer.firstChild);
    
    // Adiciona rodapé com marca d'água
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.paddingTop = '15px';
    footer.style.borderTop = '1px solid #eee';
    footer.style.textAlign = 'center';
    footer.style.color = '#999';
    footer.style.fontSize = '12px';
    
    footer.innerHTML = `
        <p style="margin: 0;">📱 Baixe o Listou - App gratuito de lista de compras com IA</p>
        <p style="margin: 5px 0 0 0;">🌐 Acesse: listou.app | 💡 Economize mais com comparações inteligentes</p>
    `;
    
    tempContainer.appendChild(footer);
    
    return tempContainer;
}

// Inicializa funcionalidades ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se é primeira vez e mostra modal de tipo de compra
    checkFirstTimeUser();
    
    // Carrega nome do supermercado salvo
    const savedSupermarket = localStorage.getItem('listou-current-supermarket');
    const supermarketInput = document.getElementById('supermarket-name');
    if (savedSupermarket && supermarketInput) {
        supermarketInput.value = savedSupermarket;
    }
    
    // Carrega supermercados cadastrados
    loadSupermarkets();
    
    // Atualiza filtro de supermercados
    updateSupermarketFilter();
    
    // Atualiza dados dos relatórios
    updateMinimalAnalytics();
    
    // Adiciona botão de finalizar compra
    addFinalizePurchaseButton();
});

// TODO: Integrar Capacitor para build Android e acesso à câmera
// https://capacitorjs.com/docs/apis/camera

// ========================================
// GERENCIAMENTO DE SUPERMERCADOS
// ========================================

// Carrega supermercados do banco de dados
async function loadSupermarkets() {
    try {
        supermarkets = await window.dbGetSupermarkets();
        
        // Adiciona supermercados padrão se não existir nenhum
        if (supermarkets.length === 0) {
            await initDefaultSupermarkets();
            supermarkets = await window.dbGetSupermarkets();
        }
        
        updateSupermarketSelectors();
        refreshSupermarketsList();
        
        // Carrega supermercado atual salvo
        const savedSupermarketId = localStorage.getItem('listou-current-supermarket-id');
        if (savedSupermarketId) {
            const savedSupermarket = supermarkets.find(s => s.id == savedSupermarketId);
            if (savedSupermarket) {
                currentSupermarket = savedSupermarket;
                updateCurrentSupermarketDisplay();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar supermercados:', error);
    }
}

// Inicializa supermercados padrão
async function initDefaultSupermarkets() {
    const defaultSupermarkets = [
        {
            name: 'Pão de Açúcar',
            type: 'supermercado',
            location: '',
            notes: 'Rede de supermercados com foco em qualidade'
        },
        {
            name: 'Extra',
            type: 'hipermercado',
            location: '',
            notes: 'Hipermercado com grande variedade de produtos'
        },
        {
            name: 'Carrefour',
            type: 'hipermercado',
            location: '',
            notes: 'Hipermercado francês com bons preços'
        },
        {
            name: 'Atacadão',
            type: 'atacado',
            location: '',
            notes: 'Compras no atacado com preços baixos'
        },
        {
            name: 'Feira Livre',
            type: 'feira',
            location: '',
            notes: 'Produtos frescos e naturais'
        }
    ];
    
    for (const supermarket of defaultSupermarkets) {
        try {
            await window.dbAddSupermarket(supermarket);
        } catch (error) {
            console.error('Erro ao adicionar supermercado padrão:', error);
        }
    }
}

// Atualiza os seletores de supermercado
function updateSupermarketSelectors() {
    const mainSelect = document.getElementById('main-supermarket-select');
    const currentSelect = document.getElementById('current-supermarket-select');
    
    if (mainSelect) {
        mainSelect.innerHTML = '<option value="">📍 Selecione o supermercado</option>';
        supermarkets.forEach(supermarket => {
            const option = document.createElement('option');
            option.value = supermarket.id;
            option.textContent = `${getTypeIcon(supermarket.type)} ${supermarket.name}${supermarket.location ? ' - ' + supermarket.location : ''}`;
            mainSelect.appendChild(option);
        });
        
        if (currentSupermarket) {
            mainSelect.value = currentSupermarket.id;
        }
    }
    
    if (currentSelect) {
        currentSelect.innerHTML = '<option value="">Selecione um supermercado</option>';
        supermarkets.forEach(supermarket => {
            const option = document.createElement('option');
            option.value = supermarket.id;
            option.textContent = `${getTypeIcon(supermarket.type)} ${supermarket.name}${supermarket.location ? ' - ' + supermarket.location : ''}`;
            currentSelect.appendChild(option);
        });
        
        if (currentSupermarket) {
            currentSelect.value = currentSupermarket.id;
        }
    }
}

// Retorna ícone do tipo de supermercado
function getTypeIcon(type) {
    const icons = {
        'supermercado': '🏪',
        'hipermercado': '🏬',
        'atacado': '📦',
        'mercearia': '🛒',
        'feira': '🥕',
        'farmacia': '💊',
        'conveniencia': '🏪',
        'outro': '🛍️'
    };
    return icons[type] || '🏪';
}

// Atualiza exibição do supermercado atual
function updateCurrentSupermarketDisplay() {
    let badge = document.querySelector('.supermarket-badge');
    
    if (currentSupermarket) {
        if (!badge) {
            // Cria o badge se não existir
            badge = document.createElement('span');
            badge.className = 'supermarket-badge';
            badge.style.cssText = `
                display: inline-block;
                background: var(--color-success);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
                margin-left: 0.5rem;
                font-weight: 500;
            `;
            
            // Adiciona após o título da seção principal
            const mainTitle = document.querySelector('#section-main .section-title-container h1');
            if (mainTitle) {
                mainTitle.appendChild(badge);
            }
        }
        
        badge.textContent = `${getTypeIcon(currentSupermarket.type)} ${currentSupermarket.name}`;
        badge.style.display = 'inline-block';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// Refresh da lista de supermercados na seção
function refreshSupermarketsList() {
    const grid = document.getElementById('supermarkets-grid');
    if (!grid) return;
    
    if (supermarkets.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏪</div>
                <h3>Nenhum supermercado cadastrado</h3>
                <p>Adicione seu primeiro supermercado para começar a comparar preços</p>
                <button class="btn-primary" onclick="openSupermarketModal()">+ Adicionar Supermercado</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    supermarkets.forEach(supermarket => {
        const card = createSupermarketCard(supermarket);
        grid.appendChild(card);
    });
}

// Cria card de supermercado
function createSupermarketCard(supermarket) {
    const card = document.createElement('div');
    card.className = `supermarket-card ${currentSupermarket?.id === supermarket.id ? 'current' : ''}`;
    card.innerHTML = `
        <div class="supermarket-header">
            <h4 class="supermarket-name">${supermarket.name}</h4>
            <span class="supermarket-type">${supermarket.type}</span>
        </div>
        ${supermarket.location ? `<p class="supermarket-location">📍 ${supermarket.location}</p>` : ''}
        ${supermarket.notes ? `<p class="supermarket-notes">${supermarket.notes}</p>` : ''}
        <div class="supermarket-actions">
            <button class="supermarket-btn select" onclick="selectSupermarket(${supermarket.id})">
                ${currentSupermarket?.id === supermarket.id ? '✓ Selecionado' : 'Selecionar'}
            </button>
            <button class="supermarket-btn edit" onclick="editSupermarket(${supermarket.id})">Editar</button>
            <button class="supermarket-btn delete" onclick="deleteSupermarket(${supermarket.id})">Excluir</button>
        </div>
    `;
    return card;
}

// Abre modal para adicionar/editar supermercado
function openSupermarketModal(supermarketId = null) {
    const modal = document.getElementById('supermarket-modal');
    const title = document.getElementById('supermarket-modal-title');
    const form = document.getElementById('supermarket-form');
    
    if (!modal || !title || !form) return;
    
    const isEdit = supermarketId !== null;
    title.textContent = isEdit ? 'Editar Supermercado' : 'Adicionar Supermercado';
    
    if (isEdit) {
        const supermarket = supermarkets.find(s => s.id === supermarketId);
        if (supermarket) {
            document.getElementById('supermarket-name').value = supermarket.name || '';
            document.getElementById('supermarket-location').value = supermarket.location || '';
            document.getElementById('supermarket-type').value = supermarket.type || 'supermercado';
            document.getElementById('supermarket-notes').value = supermarket.notes || '';
        }
        form.dataset.editId = supermarketId;
    } else {
        form.reset();
        delete form.dataset.editId;
    }
    
    modal.classList.add('show');
}

// Fecha modal de supermercado
function closeSupermarketModal() {
    const modal = document.getElementById('supermarket-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Salva supermercado (adicionar ou editar)
async function saveSupermarket(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEdit = form.dataset.editId;
    
    const data = {
        name: document.getElementById('supermarket-name').value.trim(),
        location: document.getElementById('supermarket-location').value.trim(),
        type: document.getElementById('supermarket-type').value,
        notes: document.getElementById('supermarket-notes').value.trim()
    };
    
    if (!data.name) {
        alert('Nome do supermercado é obrigatório');
        return;
    }
    
    try {
        if (isEdit) {
            await window.dbUpdateSupermarket(parseInt(isEdit), data);
            const index = supermarkets.findIndex(s => s.id == isEdit);
            if (index !== -1) {
                Object.assign(supermarkets[index], data);
            }
        } else {
            const id = await window.dbAddSupermarket(data);
            supermarkets.push({ ...data, id });
        }
        
        updateSupermarketSelectors();
        refreshSupermarketsList();
        closeSupermarketModal();
        
        // Mostra notificação de sucesso
        if (window.notifications) {
            window.notifications.show(
                isEdit ? 'Supermercado atualizado!' : 'Supermercado adicionado!',
                'success'
            );
        }
    } catch (error) {
        console.error('Erro ao salvar supermercado:', error);
        alert('Erro ao salvar supermercado. Tente novamente.');
    }
}

// Seleciona supermercado como atual
function selectSupermarket(supermarketId) {
    const supermarket = supermarkets.find(s => s.id === supermarketId);
    if (!supermarket) return;
    
    currentSupermarket = supermarket;
    localStorage.setItem('listou-current-supermarket-id', supermarketId);
    
    updateSupermarketSelectors();
    updateCurrentSupermarketDisplay();
    refreshSupermarketsList();
    
    // Mostra notificação
    if (window.notifications) {
        window.notifications.show(`${supermarket.name} selecionado como supermercado atual`, 'success');
    }
}

// Edita supermercado
function editSupermarket(supermarketId) {
    openSupermarketModal(supermarketId);
}

// Exclui supermercado
async function deleteSupermarket(supermarketId) {
    const supermarket = supermarkets.find(s => s.id === supermarketId);
    if (!supermarket) return;
    
    if (!confirm(`Tem certeza que deseja excluir "${supermarket.name}"?`)) return;
    
    try {
        await window.dbDeleteSupermarket(supermarketId);
        supermarkets = supermarkets.filter(s => s.id !== supermarketId);
        
        // Se era o supermercado atual, remove a seleção
        if (currentSupermarket?.id === supermarketId) {
            currentSupermarket = null;
            localStorage.removeItem('listou-current-supermarket-id');
        }
        
        updateSupermarketSelectors();
        refreshSupermarketsList();
        
        // Mostra notificação
        if (window.notifications) {
            window.notifications.show('Supermercado excluído', 'success');
        }
    } catch (error) {
        console.error('Erro ao excluir supermercado:', error);
        alert('Erro ao excluir supermercado. Tente novamente.');
    }
}

// Event listeners para supermercados
document.addEventListener('DOMContentLoaded', () => {
    // Carrega supermercados
    loadSupermarkets();
    
    // Botão adicionar supermercado
    const addBtn = document.getElementById('add-supermarket-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openSupermarketModal());
    }
    
    // Form de supermercado
    const form = document.getElementById('supermarket-form');
    if (form) {
        form.addEventListener('submit', saveSupermarket);
    }
    
    // Seletor principal de supermercado
    const mainSelect = document.getElementById('main-supermarket-select');
    if (mainSelect) {
        mainSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                selectSupermarket(parseInt(e.target.value));
            }
        });
    }
    
    // Seletor atual de supermercado
    const currentSelect = document.getElementById('current-supermarket-select');
    if (currentSelect) {
        currentSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                selectSupermarket(parseInt(e.target.value));
            }
        });
    }
    
    // Fecha modal ao clicar fora
    const modal = document.getElementById('supermarket-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSupermarketModal();
            }
        });
    }
});

// Função para finalizar compra e gerar dados para relatórios
async function finalizePurchase() {
    if (currentItems.length === 0) {
        alert('❌ Não há itens na lista para finalizar a compra!');
        return;
    }

    // Verifica se há itens comprados (marcados como bought)
    const boughtItems = currentItems.filter(item => item.bought);
    if (boughtItems.length === 0) {
        alert('❌ Nenhum item foi marcado como comprado!\n\nMarque os itens desejados antes de finalizar a compra.');
        return;
    }

    // Confirmação antes de finalizar
    const confirmProceed = confirm(
        `🛒 Finalizar compra com ${boughtItems.length} item(ns) marcado(s)?\n\n` +
        'Os itens comprados serão removidos da lista.'
    );
    if (!confirmProceed) return;

    // Calcula totais apenas dos itens marcados como comprados
    const completedItemsAfter = currentItems.filter(item => item.bought);
    const totalItems = completedItemsAfter.length;
    const totalValue = completedItemsAfter.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseFloat(item.qty) || 1;
        return sum + (price * qty);
    }, 0);

    // Pega o supermercado selecionado
    const supermarketSelect = document.getElementById('main-supermarket-select');
    const selectedSupermarket = supermarketSelect ? supermarketSelect.value : '';
    
    if (!selectedSupermarket) {
        const confirmWithoutSupermarket = confirm(
            '⚠️ Nenhum supermercado foi selecionado.\n\n' +
            'Para uma análise mais precisa nos relatórios, é recomendado selecionar o supermercado.\n\n' +
            'Deseja continuar mesmo assim?'
        );
        if (!confirmWithoutSupermarket) return;
    }

    // Registra a compra no sistema de analytics apenas com dados do usuário
    if (analytics) {
        const purchaseData = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: completedItemsAfter.map(item => ({
                name: item.name,
                category: item.category || 'outros',
                quantity: parseFloat(item.qty) || 1,
                unitPrice: parseFloat(item.price) || 0,
                totalPrice: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1)
            })),
            totalSpent: totalValue,
            supermarket: selectedSupermarket,
            itemCount: totalItems
        };

        // Salva apenas dados do usuário - sem dados externos
        analytics.recordPurchase(
            purchaseData.items,
            purchaseData.totalSpent,
            null, // location
            purchaseData.supermarket
        );
    }

    // Salva no histórico local
    const purchaseHistory = JSON.parse(localStorage.getItem('listou-purchase-history') || '[]');
    const newPurchase = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: completedItemsAfter.map(item => ({
            name: item.name,
            category: item.category || 'outros',
            quantity: parseFloat(item.qty) || 1,
            unitPrice: parseFloat(item.price) || 0,
            totalPrice: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1)
        })),
        totalSpent: totalValue,
        supermarket: selectedSupermarket || 'Não informado',
        itemCount: totalItems
    };
    
    purchaseHistory.unshift(newPurchase);
    
    // Mantém apenas os últimos 50 registros
    if (purchaseHistory.length > 50) {
        purchaseHistory.splice(50);
    }
    
    localStorage.setItem('listou-purchase-history', JSON.stringify(purchaseHistory));

    // Remove itens comprados da lista atual
    for (const item of completedItemsAfter) {
        await dbDeleteItem(item.id);
    }

    // Atualiza a interface
    await refreshList();

    // Mostra confirmação e navega para relatórios
    const itemNames = completedItemsAfter.map(item => `• ${item.name}`).join('\n');
    const message = `✅ Compra finalizada com sucesso!\n\n` +
                   `📊 Itens comprados (${totalItems}):\n${itemNames}\n\n` +
                   `💰 Valor total: R$ ${totalValue.toFixed(2)}\n` +
                   `🏪 Supermercado: ${selectedSupermarket || 'Não informado'}\n\n` +
                   `Os dados foram salvos para análise nos relatórios.`;
    
    alert(message);

    // Navega automaticamente para a aba de relatórios
    switchSection('analytics');
    closeSidebar();
    
    // Atualiza os relatórios com os novos dados
    if (typeof updateAnalyticsData === 'function') {
        updateAnalyticsData();
    }
}

// Torna funções globais para uso nos elementos HTML
window.openSupermarketModal = openSupermarketModal;
window.closeSupermarketModal = closeSupermarketModal;
window.selectSupermarket = selectSupermarket;
window.editSupermarket = editSupermarket;
window.deleteSupermarket = deleteSupermarket;
window.finalizePurchase = finalizePurchase;


// Aplicar tema claro fixo
document.documentElement.classList.add('theme-light');
const metaTheme = document.querySelector('meta[name="theme-color"]');
if(metaTheme) metaTheme.setAttribute('content', '#f8f9fa');
localStorage.removeItem('listou-theme');

// Inicializar app após tudo estar configurado
await refreshList();
console.log('App inicializado com sucesso!');

}); // Fim do DOMContentLoaded
