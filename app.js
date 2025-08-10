// app.js - Lógica principal da UI do Listou
// v2: Sistema inteligente com categorias, sugestões, análise de padrões e preços
// v3: Interface com sidebar moderna e navegação por seções
// v4: Sistema de tipos de compra (Avulsa/Controlada)

// Constantes para tipos de compra
const PURCHASE_TYPES = {
    CASUAL: 'casual',
    CONTROLLED: 'controlled'
};

// Variáveis globais para gerenciamento do tipo de compra
let currentPurchaseType = null;

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

// Funções para gerenciar tipo de compra
function loadPurchaseType() {
    const saved = localStorage.getItem('listou-purchase-type');
    return saved || null;
}

function savePurchaseType(type) {
    localStorage.setItem('listou-purchase-type', type);
    currentPurchaseType = type;
    updatePurchaseTypeBadge();
}

function updatePurchaseTypeBadge() {
    const badge = document.getElementById('purchase-type-badge');
    if (badge && currentPurchaseType) {
        if (currentPurchaseType === PURCHASE_TYPES.CONTROLLED) {
            badge.textContent = '📊 Controlada';
            badge.className = 'purchase-type-badge controlled';
        } else {
            badge.textContent = '🛒 Avulsa';
            badge.className = 'purchase-type-badge casual';
        }
    }
}

function showPurchaseTypeScreen() {
    const screen = document.getElementById('purchase-type-screen');
    const mainContent = document.getElementById('main-content');
    
    if (screen && mainContent) {
        screen.style.display = 'flex';
        mainContent.style.display = 'none';
        screen.classList.remove('hidden');
    }
}

function hidePurchaseTypeScreen() {
    const screen = document.getElementById('purchase-type-screen');
    const mainContent = document.getElementById('main-content');
    
    if (screen && mainContent) {
        screen.style.display = 'none';
        mainContent.style.display = 'block';
        screen.classList.add('hidden');
    }
}

function selectPurchaseType(type) {
    console.log(`🎯 Tipo de compra selecionado: ${type}`);
    
    // Salva a preferência
    savePurchaseType(type);
    
    // Esconde a tela de seleção e mostra o app principal
    hidePurchaseTypeScreen();
    
    // Foca no input principal
    setTimeout(() => {
        const itemInput = document.getElementById('item-input');
        if (itemInput) {
            itemInput.focus();
        }
    }, 300);
}

function setupPurchaseTypeListeners() {
    console.log('🎯 Configurando listeners para tipo de compra...');
    
    // Event listeners para os botões de seleção de tipo
    const casualBtn = document.querySelector('[data-type="casual"]');
    const controlledBtn = document.querySelector('[data-type="controlled"]');
    
    console.log('Botões encontrados:', { casualBtn: !!casualBtn, controlledBtn: !!controlledBtn });
    
    if (casualBtn) {
        casualBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🛒 Botão Casual clicado');
            selectPurchaseType(PURCHASE_TYPES.CASUAL);
        });
    }
    
    if (controlledBtn) {
        controlledBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📊 Botão Controlada clicado');
            selectPurchaseType(PURCHASE_TYPES.CONTROLLED);
        });
    }
    
    // Botão para alterar tipo de compra
    const changePurchaseTypeBtn = document.getElementById('change-purchase-type-btn');
    console.log('Botão alterar tipo encontrado:', !!changePurchaseTypeBtn);
    
    if (changePurchaseTypeBtn) {
        changePurchaseTypeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔄 Botão alterar tipo clicado');
            showPurchaseTypeScreen();
        });
    }
}

// Funções para controlar a sidebar
function setupSidebar() {
    console.log('🎯 Configurando sidebar...');
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    console.log('Elementos sidebar encontrados:', {
        toggle: !!sidebarToggle,
        sidebar: !!sidebar,
        close: !!sidebarClose,
        overlay: !!sidebarOverlay
    });

    function toggleSidebar() {
        console.log('🔄 Alternando sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
            sidebar.classList.remove('closed');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
            
            // Cria overlay se não existir
            if (!sidebarOverlay && sidebar.classList.contains('open')) {
                const overlay = document.createElement('div');
                overlay.id = 'sidebar-overlay';
                overlay.className = 'sidebar-overlay show';
                overlay.addEventListener('click', closeSidebar);
                document.body.appendChild(overlay);
            } else if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show', sidebar.classList.contains('open'));
            }
        }
    }

    function closeSidebar() {
        console.log('❌ Fechando sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            sidebar.classList.add('closed');
            document.body.style.overflow = '';
            
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('show');
            }
        }
    }

    // Torna a função global
    window.closeSidebar = closeSidebar;

    // Event listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🍔 Botão hamburger clicado');
            toggleSidebar();
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', (e) => {
            e.preventDefault();
            closeSidebar();
        });
    }

    // Navegação entre seções
    setupSectionNavigation();
}

function setupSectionNavigation() {
    console.log('🎯 Configurando navegação entre seções...');
    
    // Garantir que todos os nav-items sejam visíveis
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`📋 Encontrados ${navItems.length} itens de navegação:`, 
        Array.from(navItems).map(item => item.getAttribute('data-section') || 'sem data-section'));
    
    // Event delegation para navegação
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.hasAttribute('data-section')) {
            e.preventDefault();
            const sectionId = navItem.getAttribute('data-section');
            console.log(`📍 Navegando para seção: ${sectionId}`);
            
            // Remove classe active de todos os nav-items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Adiciona classe active ao item clicado
            navItem.classList.add('active');
            
            // Esconde todas as seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostra a seção selecionada
            const targetSection = document.getElementById(`section-${sectionId}`);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log(`✅ Seção ${sectionId} ativada`);
                
                // Carrega dados específicos da seção se necessário
                if (sectionId === 'supermarkets') {
                    loadSupermarkets();
                } else if (sectionId === 'analytics') {
                    loadAnalytics();
                } else if (sectionId === 'templates') {
                    loadTemplates();
                }
            } else {
                console.error(`❌ Seção ${sectionId} não encontrada`);
            }
            
            // Fecha sidebar no mobile
            if (window.innerWidth < 1024) {
                window.closeSidebar();
            }
        }
    });
    
    // Forçar visibilidade dos nav-items
    setTimeout(() => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.display = 'flex';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
        });
        console.log('🔍 Forçada visibilidade dos nav-items');
    }, 100);
}

// Funções para gerenciar supermercados
function setupSupermarkets() {
    console.log('🏪 Configurando gerenciamento de supermercados...');
    
    const addSupermarketBtn = document.getElementById('add-supermarket-btn');
    const supermarketForm = document.getElementById('supermarket-form');
    
    if (addSupermarketBtn) {
        addSupermarketBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('➕ Botão adicionar supermercado clicado');
            openSupermarketModal();
        });
    }
    
    if (supermarketForm) {
        supermarketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('💾 Formulário de supermercado submetido');
            saveSupermarket();
        });
    }
}

function openSupermarketModal(supermarketId = null) {
    const modal = document.getElementById('supermarket-modal');
    const modalTitle = document.getElementById('supermarket-modal-title');
    const form = document.getElementById('supermarket-form');
    
    if (!modal) return;
    
    // Limpa o formulário
    if (form) form.reset();
    
    if (supermarketId) {
        // Modo edição
        modalTitle.textContent = 'Editar Supermercado';
        loadSupermarketData(supermarketId);
        modal.dataset.editId = supermarketId;
    } else {
        // Modo criação
        modalTitle.textContent = 'Adicionar Supermercado';
        delete modal.dataset.editId;
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Foca no primeiro campo
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeSupermarketModal() {
    const modal = document.getElementById('supermarket-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        delete modal.dataset.editId;
    }
}

async function loadSupermarketData(supermarketId) {
    try {
        const supermarket = await window.dbGetSupermarketById(supermarketId);
        if (supermarket) {
            document.getElementById('supermarket-name').value = supermarket.name || '';
            document.getElementById('supermarket-location').value = supermarket.location || '';
            document.getElementById('supermarket-type').value = supermarket.type || 'supermercado';
            document.getElementById('supermarket-notes').value = supermarket.notes || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados do supermercado:', error);
    }
}

async function saveSupermarket() {
    const modal = document.getElementById('supermarket-modal');
    const isEditing = modal && modal.dataset.editId;
    
    const name = document.getElementById('supermarket-name').value.trim();
    const location = document.getElementById('supermarket-location').value.trim();
    const type = document.getElementById('supermarket-type').value;
    const notes = document.getElementById('supermarket-notes').value.trim();
    
    if (!name) {
        alert('O nome do supermercado é obrigatório');
        return;
    }
    
    const supermarketData = {
        name,
        location,
        type,
        notes,
        createdAt: isEditing ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (isEditing) {
            await window.dbUpdateSupermarket(modal.dataset.editId, supermarketData);
            console.log('✅ Supermercado atualizado com sucesso');
        } else {
            await window.dbAddSupermarket(supermarketData);
            console.log('✅ Supermercado adicionado com sucesso');
        }
        
        closeSupermarketModal();
        loadSupermarkets();
        updateSupermarketSelects();
        
    } catch (error) {
        console.error('Erro ao salvar supermercado:', error);
        alert('Erro ao salvar supermercado. Tente novamente.');
    }
}

async function loadSupermarkets() {
    try {
        const supermarkets = await window.dbGetSupermarkets();
        console.log(`📋 Carregando ${supermarkets.length} supermercados`);
        
        const container = document.getElementById('supermarkets-grid');
        if (!container) return;
        
        if (supermarkets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏪</div>
                    <h3>Nenhum supermercado cadastrado</h3>
                    <p>Adicione supermercados para começar a comparar preços</p>
                    <button class="btn-primary" onclick="openSupermarketModal()">+ Adicionar primeiro supermercado</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        supermarkets.forEach(supermarket => {
            const card = createSupermarketCard(supermarket);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar supermercados:', error);
    }
}

function createSupermarketCard(supermarket) {
    const card = document.createElement('div');
    card.className = 'supermarket-card';
    card.dataset.id = supermarket.id;
    
    const typeIcons = {
        supermercado: '🛒',
        hipermercado: '🏬',
        atacado: '📦',
        mercearia: '🏪',
        feira: '🍎',
        farmacia: '💊',
        conveniencia: '🏬',
        outro: '🏢'
    };
    
    const icon = typeIcons[supermarket.type] || '🏪';
    
    card.innerHTML = `
        <div class="supermarket-header">
            <div class="supermarket-icon">${icon}</div>
            <div class="supermarket-info">
                <h3 class="supermarket-name">${supermarket.name}</h3>
                <p class="supermarket-location">${supermarket.location || 'Localização não informada'}</p>
                <span class="supermarket-type">${supermarket.type}</span>
            </div>
        </div>
        <div class="supermarket-actions">
            <button class="supermarket-action-btn edit" onclick="openSupermarketModal('${supermarket.id}')" title="Editar">
                ✏️
            </button>
            <button class="supermarket-action-btn delete" onclick="deleteSupermarket('${supermarket.id}')" title="Excluir">
                🗑️
            </button>
            <button class="supermarket-action-btn select" onclick="selectCurrentSupermarket('${supermarket.id}')" title="Selecionar como atual">
                📍
            </button>
        </div>
        ${supermarket.notes ? `<div class="supermarket-notes">${supermarket.notes}</div>` : ''}
    `;
    
    return card;
}

async function deleteSupermarket(supermarketId) {
    if (!confirm('Tem certeza que deseja excluir este supermercado? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        await window.dbDeleteSupermarket(supermarketId);
        console.log('🗑️ Supermercado excluído com sucesso');
        loadSupermarkets();
        updateSupermarketSelects();
    } catch (error) {
        console.error('Erro ao excluir supermercado:', error);
        alert('Erro ao excluir supermercado. Tente novamente.');
    }
}

function selectCurrentSupermarket(supermarketId) {
    localStorage.setItem('listou-current-supermarket', supermarketId);
    currentSupermarket = supermarketId;
    updateSupermarketSelects();
    console.log(`📍 Supermercado atual selecionado: ${supermarketId}`);
}

async function updateSupermarketSelects() {
    try {
        const supermarkets = await window.dbGetSupermarkets();
        const selects = [
            document.getElementById('main-supermarket-select'),
            document.getElementById('current-supermarket-select')
        ];
        
        selects.forEach(select => {
            if (!select) return;
            
            // Preserva a primeira opção
            const firstOption = select.querySelector('option');
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            supermarkets.forEach(supermarket => {
                const option = document.createElement('option');
                option.value = supermarket.id;
                option.textContent = `${supermarket.name} - ${supermarket.location || 'Sem localização'}`;
                
                if (supermarket.id === currentSupermarket) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Erro ao atualizar selects de supermercado:', error);
    }
}

// Funções auxiliares para seções
async function loadAnalytics() {
    console.log('📊 Carregando relatórios...');
    // Implementar lógica de analytics aqui
}

async function loadTemplates() {
    console.log('📋 Carregando templates...');
    // Implementar lógica de templates aqui
}

// Torna funções globais para serem acessíveis do HTML
window.openSupermarketModal = openSupermarketModal;
window.closeSupermarketModal = closeSupermarketModal;
window.deleteSupermarket = deleteSupermarket;
window.selectCurrentSupermarket = selectCurrentSupermarket;

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
        
        // Verifica tipo de compra salvo
        currentPurchaseType = loadPurchaseType();
        
        // Carrega supermercado atual salvo
        currentSupermarket = localStorage.getItem('listou-current-supermarket');
        
        // Inicializa interface
        initInterface();
        
        // Configura listeners para tipo de compra
        setupPurchaseTypeListeners();
        
        // Configura sidebar e navegação
        setupSidebar();
        setupSectionNavigation();
        
        // Configura gerenciamento de supermercados
        setupSupermarkets();
        
        // Carrega supermercados nos selects
        updateSupermarketSelects();
        
        // Se não há tipo salvo, mostra tela de seleção
        if (!currentPurchaseType) {
            showPurchaseTypeScreen();
        } else {
            hidePurchaseTypeScreen();
            updatePurchaseTypeBadge();
        }
        
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
            
            // Mapeamento de categorias para ícones
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
            
            const categoryIcon = categoryIcons[item.category] || '📦';
            const quantity = item.qty && item.qty > 1 ? `${item.qty}x` : '';
            const unit = item.unit || '';
            const quantityText = quantity && unit ? `${quantity} ${unit}` : quantity || unit || '1x';
            
            li.innerHTML = `
                <div class="item-checkbox ${item.bought ? 'checked' : ''}" onclick="toggleItemBought(${item.id})">
                    <span class="checkmark">✓</span>
                </div>
                <div class="item-content">
                    <span class="item-name" onclick="toggleItemBought(${item.id})" style="cursor: pointer;" title="Clique para marcar como comprado">${item.name}</span>
                    <div class="item-details">
                        <span class="item-qty">Qtd: ${quantityText}</span>
                        <span class="item-price">${price}</span>
                        <span class="item-category">${categoryIcon} ${item.category || 'outros'}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" onclick="editItem(${item.id})" title="Editar item">
                        <span>✏️</span>
                    </button>
                    <button class="btn-icon" onclick="deleteItem(${item.id})" title="Remover item">
                        <span>🗑️</span>
                    </button>
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
    if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f8f9fa' : '#0b0f1a');
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

    // Botão de alternância de tema
    const themeBtn = document.createElement('button');
    themeBtn.id = 'theme-toggle-btn';
    themeBtn.innerHTML = '🌓';
    themeBtn.title = 'Alternar tema claro/escuro';
    themeBtn.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2000;
        background: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: all 0.2s ease;
    `;
    themeBtn.addEventListener('click', toggleTheme);
    document.body.appendChild(themeBtn);

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
