// app.js - Lógica principal da UI do Listou
// v2: Sistema inteligente com categorias, sugestões, análise de padrões e preços
// v3: Interface com sidebar moderna e navegação por seções

// Import com tratamento de erro
async function loadModules() {
    try {
        const { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate } = await import('./db.js');
        const { scanQRCode } = await import('./qr.js');
        const { IntelligenceManager } = await import('./intelligence.js');
        const { AnalyticsManager } = await import('./analytics.js');
        const { NotificationManager } = await import('./notifications.js');
        
        return {
            dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate,
            scanQRCode, IntelligenceManager, AnalyticsManager, NotificationManager
        };
    } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Botão Selecionar Todos
    document.body.addEventListener('click', async (e) => {
        if (e.target && e.target.id === 'select-all-btn') {
            const itemsToComplete = currentItems.filter(item => !item.bought);
            for (const item of itemsToComplete) {
                await dbUpdateItem(item.id, { bought: true });
                intelligence.addToPurchaseHistory({
                    ...item,
                    bought: true,
                    price: item.price || intelligence.getEstimatedPrice(item.name)
                });
            }
            if (analytics && itemsToComplete.length > 0) {
                const purchaseItems = itemsToComplete.map(item => ({
                    ...item,
                    price: item.price || intelligence.getEstimatedPrice(item.name)
                }));
                const totalSpent = purchaseItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
                analytics.recordPurchase(purchaseItems, totalSpent);
            }
            refreshList();
        }
        // Botão Limpar Lista
        if (e.target && e.target.id === 'clear-all-btn') {
            if (currentItems.length === 0) return;
            if (!confirm('Tem certeza que deseja remover todos os itens da lista?')) return;
            for (const item of currentItems) {
                await dbDeleteItem(item.id);
            }
            refreshList();
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
    
    const { dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, IntelligenceManager, AnalyticsManager, NotificationManager } = modules;
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
}

function closeSidebar() {
    console.log('closeSidebar chamado - fechando sidebar');
    sidebar.classList.remove('open');
    sidebar.classList.add('closed');
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
    
    // Atualiza dados quando navegar para analytics
    if (sectionId === 'analytics') {
        updateAnalyticsData();
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
    console.log('Sistemas inicializados com sucesso');
} catch (error) {
    console.error('Erro ao inicializar sistemas:', error);
}

// Elementos da IA
const aiVoiceInput = document.getElementById('ai-voice-input');
const aiVoiceBtn = document.getElementById('ai-voice-btn');
const aiSendBtn = document.getElementById('ai-send-btn');
// const aiResponse = document.getElementById('ai-response');

let currentItems = [];
let filteredItems = [];
let isRecording = false;

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
                <div class="item-name" data-id="${item.id}" style="cursor: pointer;" title="Clique para marcar como comprado">
                    ${categoryIcon} ${item.name}
                    <span class="item-favorite ${isFavorite ? 'active' : ''}" data-id="${item.id}" title="Favoritar">
                        ${isFavorite ? '⭐' : '☆'}
                    </span>
                </div>
                <div class="item-details">
                    <span class="item-category">${item.category || 'outros'}</span>
                </div>
                <div class="item-extra-details" style="margin-top: 0.2em; font-size: 0.97em; color: #555; display: flex; gap: 1.2em; align-items: center;">
                    <span title="Quantidade"><strong>Qtd:</strong> ${item.qty}</span>
                    <div class="item-price-container" title="Valor do item">
                        <strong>Valor:</strong> 
                        <span class="price-display" data-id="${item.id}" style="cursor: pointer; padding: 2px 6px; border-radius: 4px; background: #f0f8ff; border: 1px solid #ddd;" title="Clique para editar">
                            R$ ${item.price !== undefined && item.price !== null && item.price !== '' ? Number(item.price).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '--'}
                        </span>
                        <input class="price-input" data-id="${item.id}" type="number" step="0.01" min="0" value="${item.price || ''}" style="display: none; width: 80px; padding: 2px 6px; border: 1px solid #007bff; border-radius: 4px; text-align: right;">
                    </div>
                    <span title="Descrição"><strong>Descrição:</strong> ${item.name}</span>
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
        
        // Filtrar dados de compra por período
        const filteredPurchases = analytics.purchaseData.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= startDate;
        });
        
        // Calcular dados agregados para o período
        const periodData = {
            categories: {},
            products: {},
            totalSpent: 0
        };
        
        filteredPurchases.forEach(purchase => {
            periodData.totalSpent += purchase.totalSpent;
            
            purchase.items.forEach(item => {
                const category = item.category || 'outros';
                const productName = item.name.toLowerCase();
                
                // Agregar por categoria
                if (!periodData.categories[category]) {
                    periodData.categories[category] = { totalSpent: 0, itemCount: 0 };
                }
                periodData.categories[category].totalSpent += item.totalPrice;
                periodData.categories[category].itemCount += item.quantity;
                
                // Agregar por produto
                if (!periodData.products[productName]) {
                    periodData.products[productName] = { count: 0, totalSpent: 0, name: item.name };
                }
                periodData.products[productName].count += item.quantity;
                periodData.products[productName].totalSpent += item.totalPrice;
            });
        });
        
        // Atualiza gastos por categoria
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
        
        // Atualiza itens mais comprados
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
        
        // Atualiza economia
        const savingsAmountEl = document.querySelector('.savings-amount');
        const savingsDescEl = document.querySelector('.savings-desc');
        const savingsTipEl = document.querySelector('.savings-tip');
        
        if (savingsAmountEl) {
            // Calcular economia potencial baseada nos dados históricos
            let potentialSavings = 0;
            
            // Exemplo de cálculo: 5% do total gasto pode ser economizado
            if (periodData.totalSpent > 0) {
                potentialSavings = periodData.totalSpent * 0.05;
            }
            
            savingsAmountEl.textContent = `R$ ${potentialSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            if (savingsDescEl) {
                if (potentialSavings > 0) {
                    savingsDescEl.textContent = 'Economia potencial no período';
                } else {
                    savingsDescEl.textContent = 'Continue comprando para gerar insights';
                }
            }
            
            if (savingsTipEl) {
                const tips = [
                    'Compare preços entre diferentes estabelecimentos',
                    'Compre produtos da estação para economizar',
                    'Evite compras por impulso',
                    'Faça uma lista antes de ir às compras',
                    'Aproveite promoções em produtos não perecíveis'
                ];
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                savingsTipEl.textContent = `💡 ${randomTip}`;
            }
        }
        
    } catch (error) {
        console.error('Erro ao atualizar analytics:', error);
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

// Funções auxiliares para compartilhamento e exportação
function shareList() {
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
        navigator.clipboard.writeText(shareUrl);
        alert('Link de compartilhamento copiado para a área de transferência!');
    } catch {
        prompt('Copie este link para compartilhar sua lista:', shareUrl);
    }
}

function exportList() {
    const listText = currentItems
        .map(item => `${item.bought ? '✅' : '☐'} ${item.name} (${item.qty}x)`)
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
                analytics.recordPurchase([purchaseItem], purchaseItem.price * purchaseItem.qty);
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
    } else if (e.target.classList.contains('item-name')) {
        priceInput.select();
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

// TODO: Integrar Capacitor para build Android e acesso à câmera
// https://capacitorjs.com/docs/apis/camera

// ===== ASSISTENTE IA AVANÇADO =====

// Event listeners para IA
if (aiSendBtn) {
    aiSendBtn.addEventListener('click', () => {
        const command = aiVoiceInput?.value?.trim();
        if (command) {
            processAICommand(command);
            if (aiVoiceInput) aiVoiceInput.value = '';
        }
    });
}

if (aiVoiceInput) {
    aiVoiceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = aiVoiceInput.value.trim();
            if (command) {
                processAICommand(command);
                aiVoiceInput.value = '';
            }
        }
    });
}

// Processa comando de IA
async function processAICommand(command) {
    if (!command.trim()) return;
    
    showAIThinking();
    
    try {
        if (command.toLowerCase().includes('adicionar') || command.toLowerCase().includes('add')) {
            await handleAddCommand(command);
        } else if (command.toLowerCase().includes('sugerir') || command.toLowerCase().includes('recomendar')) {
            showSuggestions();
        } else if (command.toLowerCase().includes('analisar') || command.toLowerCase().includes('insights')) {
            showAIInsights();
        } else {
            showGeneralResponse(command);
        }
    } catch (error) {
        console.error('Erro no assistente IA:', error);
        showAIResponse('🤖 Tente algo como "Adicionar bananas".');
    }
}

// Processa comando de adicionar
async function handleAddCommand(command) {
    const items = extractItemsFromCommand(command);
    let addedCount = 0;
    
    for (const itemName of items) {
        const item = {
            name: itemName,
            category: intelligence.detectCategory(itemName),
            qty: 1,
            bought: false,
            price: intelligence.getEstimatedPrice(itemName),
            addedAt: new Date().toISOString()
        };
        
        await dbAddItem(item);
        addedCount++;
    }
    
    if (addedCount > 0) {
        refreshList();
        showAIResponse(`✅ Adicionei ${addedCount} item(ns) à sua lista!`);
    } else {
        showAIResponse('🤖 Tente: "adicionar bananas e maçãs".');
    }
}

// Extrai itens do comando
function extractItemsFromCommand(command) {
    const items = [];
    const words = command.toLowerCase().split(/[\s,e]+/);
    
    const knownProducts = [
        'banana', 'maçã', 'laranja', 'leite', 'pão', 'ovos', 'frango', 'carne',
        'arroz', 'feijão', 'batata', 'tomate', 'cebola', 'alface', 'cenoura'
    ];
    
    words.forEach(word => {
        const cleanWord = word.replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, '');
        if (knownProducts.includes(cleanWord)) {
            items.push(cleanWord);
        }
    });
    
    return [...new Set(items)];
}

// Mostra sugestões inteligentes
function showSuggestions() {
    const suggestions = intelligence.getSmartSuggestions();
    let response = '💡 <strong>Sugestões:</strong><br>';
    
    suggestions.slice(0, 4).forEach(suggestion => {
        response += `<div class="ai-tip">${getItemIcon(suggestion.name)} ${suggestion.name}</div>`;
    });
    
    showAIResponse(response);
}

// Mostra insights inteligentes
function showAIInsights() {
    const totalItems = currentItems.length;
    const totalValue = currentItems.reduce((sum, item) => sum + (intelligence.getEstimatedPrice(item.name) * item.qty), 0);
    
    let response = '🧠 <strong>Análise:</strong><br>';
    response += `<div class="ai-nutrition-insight">📊 ${totalItems} itens • R$ ${totalValue.toFixed(2)}</div>`;
    
    const categories = {};
    currentItems.forEach(item => {
        const cat = item.category || 'outros';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    if (categories['frutas'] && categories['verduras']) {
        response += '<div class="ai-nutrition-insight">🥗 Ótimo equilíbrio nutricional!</div>';
    } else if (!categories['frutas']) {
        response += '<div class="ai-tip">🍎 Considere adicionar frutas</div>';
    }
    
    showAIResponse(response);
}

// Resposta geral
function showGeneralResponse(command) {
    const responses = [
        '🤖 Experimente: "adicionar frutas" ou "analisar lista".',
        '💡 Como posso ajudar com sua lista de compras?',
        '🛒 Sou seu assistente inteligente!'
    ];
    
    showAIResponse(responses[Math.floor(Math.random() * responses.length)]);
}

// Funções auxiliares
// function showAIResponse(message) {}
// function showAIThinking() {}

function getItemIcon(itemName) {
    const icons = {
        'banana': '🍌', 'maçã': '🍎', 'laranja': '🍊', 'leite': '🥛',
        'pão': '🍞', 'frango': '🐔', 'carne': '🥩', 'arroz': '🍚'
    };
    return icons[itemName.toLowerCase()] || '📦';
}

// Aplicar tema claro fixo
document.documentElement.classList.add('theme-light');
const metaTheme = document.querySelector('meta[name="theme-color"]');
if(metaTheme) metaTheme.setAttribute('content', '#f8f9fa');
localStorage.removeItem('listou-theme');

// Inicializar app após tudo estar configurado
await refreshList();
console.log('App inicializado com sucesso!');

}); // Fim do DOMContentLoaded

// Inicializa assistente IA após carregamento
setTimeout(() => {
    // if (aiResponse) {
    //     showAIResponse('👋 Olá! Sou seu assistente inteligente.<br><div class="ai-tip">💬 Experimente: "Adicionar frutas" ou "Analisar lista"</div>');
    // }
}, 3000);
