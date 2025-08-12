// intelligence.js - Sistema de Inteligência Artificial Avançado
// Funcionalidades: ML, predições, recomendações personalizadas, análise comportamental

// Base de conhecimento expandida e sazonalidade
const ADVANCED_PRODUCT_DATABASE = {
    // Frutas com dados nutricionais e sazonalidade
    'banana': { 
        category: 'frutas', 
        price: 4.50, 
        icon: '🍌', 
        keywords: ['banana', 'nanica', 'prata'],
        nutrition: { calories: 89, fiber: 2.6, vitamin_c: 8.7, potassium: 358 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12], // Todo ano
        health_benefits: ['energia', 'potássio', 'digestão'],
        storage_days: 7,
        eco_score: 8
    },
    'maçã': { 
        category: 'frutas', 
        price: 8.90, 
        icon: '🍎', 
        keywords: ['maçã', 'maca', 'apple'],
        nutrition: { calories: 52, fiber: 2.4, vitamin_c: 4.6, antioxidants: 'high' },
        season: [2,3,4,5,6], // Outono/Inverno
        health_benefits: ['antioxidantes', 'fibra', 'coração'],
        storage_days: 14,
        eco_score: 7
    },
    'laranja': { 
        category: 'frutas', 
        price: 3.20, 
        icon: '🍊', 
        keywords: ['laranja', 'orange'],
        nutrition: { calories: 47, fiber: 2.4, vitamin_c: 53.2, folate: 40 },
        season: [6,7,8,9], // Inverno
        health_benefits: ['vitamina c', 'imunidade', 'hidratação'],
        storage_days: 10,
        eco_score: 9
    },
    
    // Verduras
    'alface': { 
        category: 'verduras', 
        price: 3.50, 
        icon: '🥬', 
        keywords: ['alface', 'lettuce'],
        nutrition: { calories: 15, fiber: 1.3, vitamin_c: 9.2, folate: 38 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['hidratação', 'fibra', 'vitaminas'],
        storage_days: 5,
        eco_score: 8
    },
    'tomate': { 
        category: 'verduras', 
        price: 6.80, 
        icon: '🍅', 
        keywords: ['tomate', 'tomato'],
        nutrition: { calories: 18, fiber: 1.2, vitamin_c: 13.7, lycopene: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['antioxidantes', 'licopeno', 'coração'],
        storage_days: 7,
        eco_score: 7
    },
    'cebola': { 
        category: 'verduras', 
        price: 4.20, 
        icon: '🧅', 
        keywords: ['cebola', 'onion'],
        nutrition: { calories: 40, fiber: 1.7, vitamin_c: 7.4, quercetin: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['anti-inflamatório', 'antioxidantes', 'imunidade'],
        storage_days: 30,
        eco_score: 9
    },
    'batata': { 
        category: 'verduras', 
        price: 3.90, 
        icon: '🥔', 
        keywords: ['batata', 'potato'],
        nutrition: { calories: 77, fiber: 2.2, vitamin_c: 19.7, potassium: 425 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['energia', 'potássio', 'vitamina c'],
        storage_days: 21,
        eco_score: 8
    },
    'cenoura': { 
        category: 'verduras', 
        price: 4.50, 
        icon: '🥕', 
        keywords: ['cenoura', 'carrot'],
        nutrition: { calories: 41, fiber: 2.8, vitamin_a: 835, beta_carotene: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['visão', 'antioxidantes', 'fibra'],
        storage_days: 14,
        eco_score: 8
    },
    'brócolis': { 
        category: 'verduras', 
        price: 8.20, 
        icon: '🥦', 
        keywords: ['brócolis', 'brocolis', 'broccoli'],
        nutrition: { calories: 34, fiber: 2.6, vitamin_c: 89.2, vitamin_k: 101 },
        season: [4,5,6,7,8,9],
        health_benefits: ['vitamina c', 'vitamina k', 'antioxidantes'],
        storage_days: 7,
        eco_score: 7
    },
    
    // Carnes
    'frango': { 
        category: 'carnes', 
        price: 18.90, 
        icon: '🐔', 
        keywords: ['frango', 'chicken', 'peito'],
        nutrition: { calories: 165, protein: 31, fat: 3.6, iron: 1.3 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['proteína', 'baixo gordura', 'ferro'],
        storage_days: 2,
        eco_score: 6
    },
    'carne bovina': { 
        category: 'carnes', 
        price: 32.50, 
        icon: '🥩', 
        keywords: ['carne', 'beef', 'bovina', 'patinho'],
        nutrition: { calories: 250, protein: 26, fat: 15, iron: 2.9 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['proteína', 'ferro', 'vitamina b12'],
        storage_days: 3,
        eco_score: 4
    },
    
    // Laticínios
    'leite': { 
        category: 'laticínios', 
        price: 5.20, 
        icon: '🥛', 
        keywords: ['leite', 'milk'],
        nutrition: { calories: 42, protein: 3.4, calcium: 113, vitamin_d: 'added' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['cálcio', 'proteína', 'vitamina d'],
        storage_days: 7,
        eco_score: 6
    },
    'queijo': { 
        category: 'laticínios', 
        price: 18.90, 
        icon: '🧀', 
        keywords: ['queijo', 'cheese', 'mussarela'],
        nutrition: { calories: 113, protein: 7, calcium: 200, fat: 9 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['cálcio', 'proteína', 'gorduras boas'],
        storage_days: 14,
        eco_score: 5
    },
    
    // Padaria
    'pão': { 
        category: 'padaria', 
        price: 8.50, 
        icon: '🍞', 
        keywords: ['pão', 'pao', 'bread'],
        nutrition: { calories: 265, protein: 9, carbs: 49, fiber: 2.7 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['energia', 'carboidratos', 'fibra'],
        storage_days: 3,
        eco_score: 7
    },
    
    // Outros
    'arroz': { 
        category: 'outros', 
        price: 12.50, 
        icon: '🍚', 
        keywords: ['arroz', 'rice'],
        nutrition: { calories: 130, protein: 2.7, carbs: 28, fiber: 0.4 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['energia', 'carboidratos'],
        storage_days: 365,
        eco_score: 8
    },
    'feijão': { 
        category: 'outros', 
        price: 8.90, 
        icon: '🫘', 
        keywords: ['feijão', 'feijao', 'beans'],
        nutrition: { calories: 127, protein: 9, fiber: 6, iron: 2.6 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['proteína', 'fibra', 'ferro'],
        storage_days: 365,
        eco_score: 9
    },
    'ovos': { 
        category: 'outros', 
        price: 15.90, 
        icon: '🥚', 
        keywords: ['ovos', 'ovo', 'eggs'],
        nutrition: { calories: 155, protein: 13, fat: 11, choline: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['proteína completa', 'colina', 'vitaminas'],
        storage_days: 21,
        eco_score: 7
    },
    
    // Produtos comuns adicionais
    'açúcar': { 
        category: 'outros', 
        price: 4.50, 
        icon: '🧊', 
        keywords: ['açúcar', 'acucar', 'sugar', 'cristal', 'refinado'],
        nutrition: { calories: 387, carbs: 100 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['energia rápida'],
        storage_days: 365,
        eco_score: 5
    },
    'sal': { 
        category: 'outros', 
        price: 2.50, 
        icon: '🧂', 
        keywords: ['sal', 'salt', 'refinado', 'grosso'],
        nutrition: { sodium: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['conservação', 'eletrólitos'],
        storage_days: 365,
        eco_score: 7
    },
    'óleo': { 
        category: 'outros', 
        price: 8.90, 
        icon: '🫗', 
        keywords: ['óleo', 'oleo', 'oil', 'soja', 'canola', 'girassol'],
        nutrition: { calories: 884, fat: 100 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['gorduras essenciais', 'vitamina e'],
        storage_days: 180,
        eco_score: 6
    },
    'macarrão': { 
        category: 'outros', 
        price: 5.50, 
        icon: '🍝', 
        keywords: ['macarrão', 'macarrao', 'pasta', 'espaguete', 'penne', 'massa'],
        nutrition: { calories: 131, protein: 5, carbs: 25 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['energia', 'carboidratos'],
        storage_days: 365,
        eco_score: 7
    },
    'água': { 
        category: 'bebidas', 
        price: 3.50, 
        icon: '💧', 
        keywords: ['água', 'agua', 'water', 'mineral', 'natural'],
        nutrition: { calories: 0 },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['hidratação', 'essencial'],
        storage_days: 365,
        eco_score: 8
    },
    'refrigerante': { 
        category: 'bebidas', 
        price: 6.50, 
        icon: '🥤', 
        keywords: ['refrigerante', 'refri', 'coca', 'pepsi', 'guaraná', 'sprite'],
        nutrition: { calories: 42, sugar: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: [],
        storage_days: 180,
        eco_score: 3
    },
    'café': { 
        category: 'bebidas', 
        price: 12.90, 
        icon: '☕', 
        keywords: ['café', 'cafe', 'coffee', 'torrado', 'moído', 'grão'],
        nutrition: { calories: 2, caffeine: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['estimulante', 'antioxidantes'],
        storage_days: 90,
        eco_score: 6
    },
    'papel higiênico': { 
        category: 'higiene', 
        price: 18.90, 
        icon: '🧻', 
        keywords: ['papel higiênico', 'papel higienico', 'toilet paper', 'tp', 'neve', 'scott'],
        nutrition: {},
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['higiene'],
        storage_days: 365,
        eco_score: 4
    },
    'detergente': { 
        category: 'limpeza', 
        price: 4.50, 
        icon: '🧽', 
        keywords: ['detergente', 'det', 'lava louça', 'ypê', 'minuano'],
        nutrition: {},
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['limpeza'],
        storage_days: 365,
        eco_score: 5
    },
    'sabão em pó': { 
        category: 'limpeza', 
        price: 22.90, 
        icon: '📦', 
        keywords: ['sabão em pó', 'sabao em po', 'powder', 'omo', 'ariel', 'tixan'],
        nutrition: {},
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['limpeza de roupas'],
        storage_days: 365,
        eco_score: 4
    },
    'manteiga': { 
        category: 'laticínios', 
        price: 8.90, 
        icon: '🧈', 
        keywords: ['manteiga', 'butter', 'com sal', 'sem sal'],
        nutrition: { calories: 717, fat: 81, vitamin_a: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['vitamina a', 'energia'],
        storage_days: 30,
        eco_score: 5
    },
    'iogurte': { 
        category: 'laticínios', 
        price: 6.50, 
        icon: '🥛', 
        keywords: ['iogurte', 'yogurt', 'natural', 'morango', 'danone', 'nestle'],
        nutrition: { calories: 59, protein: 10, calcium: 'high', probiotics: 'high' },
        season: [1,2,3,4,5,6,7,8,9,10,11,12],
        health_benefits: ['probióticos', 'cálcio', 'proteína'],
        storage_days: 14,
        eco_score: 6
    }
};

// Compatibilidade: PRODUCT_DATABASE é um alias para ADVANCED_PRODUCT_DATABASE
const PRODUCT_DATABASE = ADVANCED_PRODUCT_DATABASE;

// Templates predefinidos
const PREDEFINED_TEMPLATES = {
    'compra-mes': [
        { name: 'arroz', category: 'outros', qty: 1 },
        { name: 'feijão', category: 'outros', qty: 1 },
        { name: 'óleo', category: 'outros', qty: 1 },
        { name: 'açúcar', category: 'outros', qty: 1 },
        { name: 'sal', category: 'outros', qty: 1 },
        { name: 'café', category: 'bebidas', qty: 1 },
        { name: 'leite', category: 'laticínios', qty: 2 },
        { name: 'pão', category: 'padaria', qty: 1 }
    ],
    'feira': [
        { name: 'banana', category: 'frutas', qty: 1 },
        { name: 'maçã', category: 'frutas', qty: 1 },
        { name: 'tomate', category: 'verduras', qty: 1 },
        { name: 'cebola', category: 'verduras', qty: 1 },
        { name: 'alface', category: 'verduras', qty: 1 },
        { name: 'batata', category: 'verduras', qty: 2 }
    ],
    'limpeza': [
        { name: 'detergente', category: 'limpeza', qty: 1 },
        { name: 'sabão em pó', category: 'limpeza', qty: 1 },
        { name: 'papel higiênico', category: 'limpeza', qty: 1 },
        { name: 'desinfetante', category: 'limpeza', qty: 1 }
    ],
    'churrasco': [
        { name: 'carne bovina', category: 'carnes', qty: 2 },
        { name: 'frango', category: 'carnes', qty: 1 },
        { name: 'carvão', category: 'outros', qty: 1 },
        { name: 'cerveja', category: 'bebidas', qty: 2 },
        { name: 'pão de alho', category: 'padaria', qty: 1 },
        { name: 'queijo', category: 'laticínios', qty: 1 }
    ],
    'cafe-manha': [
        { name: 'pão', category: 'padaria', qty: 1 },
        { name: 'manteiga', category: 'laticínios', qty: 1 },
        { name: 'leite', category: 'laticínios', qty: 1 },
        { name: 'café', category: 'bebidas', qty: 1 },
        { name: 'açúcar', category: 'outros', qty: 1 },
        { name: 'banana', category: 'frutas', qty: 1 }
    ]
};

// Classe principal para gerenciar toda inteligência do app
export class IntelligenceManager {
    constructor() {
        this.purchaseHistory = this.loadPurchaseHistory();
        this.favorites = this.loadFavorites();
        this.userPreferences = this.loadUserPreferences();
    // this.aiAssistant = new AdvancedAI(); // Removido assistente IA
        this.contextualMemory = [];
        
        // Inicializa análise comportamental
        this.initializeBehaviorAnalysis();
    }

    // Inicializa sistema de análise comportamental
    initializeBehaviorAnalysis() {
        // Configura observadores de comportamento
        this.behaviorObservers = {
            itemAdditions: [],
            searchPatterns: [],
            timePatterns: [],
            categoryPreferences: []
        };
        
        // Inicia coleta de dados comportamentais
        this.startBehaviorTracking();
    }

    // Inicia rastreamento de comportamento
    startBehaviorTracking() {
        // Registra timestamp da sessão
        if (!localStorage.getItem('listou-session-start')) {
            localStorage.setItem('listou-session-start', Date.now().toString());
        }
        
        // Registra padrões de uso
        this.trackUsagePattern();
    }

    // Rastreia padrões de uso
    trackUsagePattern() {
        const now = new Date();
        const usageData = {
            timestamp: now.toISOString(),
            hour: now.getHours(),
            dayOfWeek: now.getDay(),
            month: now.getMonth()
        };
        
        // Salva dados de uso
        const usageHistory = JSON.parse(localStorage.getItem('listou-usage-patterns') || '[]');
        usageHistory.push(usageData);
        
        // Mantém apenas os últimos 100 registros
        if (usageHistory.length > 100) {
            usageHistory.splice(0, usageHistory.length - 100);
        }
        
        localStorage.setItem('listou-usage-patterns', JSON.stringify(usageHistory));
    }

    // Carrega histórico de compras do localStorage
    loadPurchaseHistory() {
        try {
            return JSON.parse(localStorage.getItem('listou-purchase-history') || '[]');
        } catch {
            return [];
        }
    }

    // Salva histórico de compras
    savePurchaseHistory() {
        localStorage.setItem('listou-purchase-history', JSON.stringify(this.purchaseHistory));
    }

    // Carrega favoritos
    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('listou-favorites') || '[]');
        } catch {
            return [];
        }
    }

    // Salva favoritos
    saveFavorites() {
        localStorage.setItem('listou-favorites', JSON.stringify(this.favorites));
    }

    // Carrega preferências do usuário
    loadUserPreferences() {
        try {
            return JSON.parse(localStorage.getItem('listou-preferences') || '{}');
        } catch {
            return {};
        }
    }

    // Salva preferências
    saveUserPreferences() {
        localStorage.setItem('listou-preferences', JSON.stringify(this.userPreferences));
    }

    // Adiciona item ao histórico quando comprado
    addToPurchaseHistory(item) {
        const historyItem = {
            ...item,
            purchasedAt: new Date().toISOString(),
            dayOfWeek: new Date().getDay(),
            month: new Date().getMonth()
        };
        
        this.purchaseHistory.unshift(historyItem);
        // Mantém apenas os últimos 1000 itens
        if (this.purchaseHistory.length > 1000) {
            this.purchaseHistory = this.purchaseHistory.slice(0, 1000);
        }
        
        this.savePurchaseHistory();
    }

    // Obtem sugestões de autocomplete melhoradas
    getAutocompleteSuggestions(query) {
        if (!query || query.length < 1) return [];
        
        const suggestions = [];
        const lowerQuery = query.toLowerCase();
        const results = new Map(); // Para evitar duplicatas
        
        // Score para ordenação das sugestões
        const scoreItem = (name, data, matchType, source) => {
            let score = 0;
            const lowerName = name.toLowerCase();
            
            // Pontuação baseada no tipo de match
            if (lowerName === lowerQuery) score += 100; // Match exato
            else if (lowerName.startsWith(lowerQuery)) score += 80; // Começa com
            else if (lowerName.includes(lowerQuery)) score += 60; // Contém
            else if (matchType === 'keyword') score += 40; // Match por palavra-chave
            
            // Bonus por fonte
            if (source === 'history') score += 20; // Histórico tem prioridade
            if (source === 'database') score += 10;
            
            // Bonus por frequência (histórico)
            if (source === 'history') {
                const frequency = this.purchaseHistory.filter(item => item.name === name).length;
                score += Math.min(frequency * 5, 25); // Max 25 pontos extras
            }
            
            return score;
        };
        
        // Busca na base de produtos
        Object.entries(PRODUCT_DATABASE).forEach(([name, data]) => {
            let matchType = null;
            let score = 0;
            
            if (name.toLowerCase().includes(lowerQuery)) {
                matchType = 'name';
                score = scoreItem(name, data, matchType, 'database');
            } else if (data.keywords && data.keywords.some(keyword => 
                keyword.toLowerCase().includes(lowerQuery))) {
                matchType = 'keyword';
                score = scoreItem(name, data, matchType, 'database');
            }
            
            if (matchType && !results.has(name)) {
                results.set(name, {
                    name,
                    category: data.category,
                    icon: data.icon,
                    price: data.price,
                    source: 'database',
                    score: score,
                    description: data.keywords ? data.keywords.join(', ') : '',
                    nutrition: data.nutrition || null
                });
            }
        });

        // Busca no histórico com prioridade
        this.purchaseHistory.forEach(item => {
            if (item.name.toLowerCase().includes(lowerQuery)) {
                const existingItem = results.get(item.name);
                const score = scoreItem(item.name, item, 'name', 'history');
                
                if (!existingItem || score > existingItem.score) {
                    results.set(item.name, {
                        name: item.name,
                        category: item.category || 'outros',
                        icon: PRODUCT_DATABASE[item.name]?.icon || '📦',
                        price: item.price || PRODUCT_DATABASE[item.name]?.price || 0,
                        source: 'history',
                        score: score,
                        lastPurchase: item.date || 'Recente',
                        frequency: this.purchaseHistory.filter(h => h.name === item.name).length
                    });
                }
            }
        });

        // Converte Map para array e ordena por score
        const sortedResults = Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 8); // Limita a 8 sugestões

        return sortedResults;
    }

    // Obtém sugestões populares para exibir quando o campo está vazio
    getPopularSuggestions() {
        const popularItems = [];
        
        // Itens mais frequentes do histórico
        const historyFrequency = {};
        this.purchaseHistory.forEach(item => {
            historyFrequency[item.name] = (historyFrequency[item.name] || 0) + 1;
        });
        
        // Ordenar por frequência e pegar os top 3
        const topHistory = Object.entries(historyFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, frequency]) => {
                const dbItem = PRODUCT_DATABASE[name];
                return {
                    name,
                    category: dbItem?.category || 'outros',
                    icon: dbItem?.icon || '📦',
                    price: dbItem?.price || 0,
                    source: 'history',
                    score: 100,
                    frequency
                };
            });
        
        // Itens essenciais recomendados (se não estão no histórico)
        const essentialItems = ['arroz', 'feijão', 'óleo', 'açúcar', 'sal'];
        const essentialSuggestions = essentialItems
            .filter(item => !historyFrequency[item])
            .slice(0, 3)
            .map(name => {
                const dbItem = PRODUCT_DATABASE[name];
                return {
                    name,
                    category: dbItem?.category || 'outros',
                    icon: dbItem?.icon || '📦',
                    price: dbItem?.price || 0,
                    source: 'database',
                    score: 80,
                    description: 'Item essencial'
                };
            });
        
        // Combinar e limitar a 6 sugestões
        return [...topHistory, ...essentialSuggestions].slice(0, 6);
    }

    // Obtem sugestões inteligentes baseadas em padrões
    getSmartSuggestions() {
        const suggestions = [];
        const now = new Date();
        const dayOfWeek = now.getDay();
        const month = now.getMonth();
        
        // Sugestões baseadas no dia da semana
        const dayBasedItems = this.purchaseHistory.filter(item => 
            item.dayOfWeek === dayOfWeek
        );
        
        // Sugestões baseadas no mês
        const monthBasedItems = this.purchaseHistory.filter(item => 
            item.month === month
        );
        
        // Itens frequentemente comprados juntos
        const frequentItems = this.getFrequentlyBoughtTogether();
        
        // Combina e remove duplicatas
        [...dayBasedItems, ...monthBasedItems, ...frequentItems]
            .forEach(item => {
                if (!suggestions.find(s => s.name === item.name)) {
                    suggestions.push({
                        name: item.name,
                        category: item.category || 'outros',
                        icon: PRODUCT_DATABASE[item.name]?.icon || '📦',
                        reason: this.getSuggestionReason(item, dayOfWeek, month)
                    });
                }
            });

        return suggestions.slice(0, 6);
    }

    // Obtém itens frequentemente comprados juntos
    getFrequentlyBoughtTogether() {
        const pairs = {};
        
        // Analisa compras do mesmo dia
        const purchasesByDate = {};
        this.purchaseHistory.forEach(item => {
            const date = item.purchasedAt.split('T')[0];
            if (!purchasesByDate[date]) purchasesByDate[date] = [];
            purchasesByDate[date].push(item);
        });
        
        // Conta pares de itens
        Object.values(purchasesByDate).forEach(dayItems => {
            if (dayItems.length > 1) {
                dayItems.forEach((item1, i) => {
                    dayItems.slice(i + 1).forEach(item2 => {
                        const pair = [item1.name, item2.name].sort().join('|');
                        pairs[pair] = (pairs[pair] || 0) + 1;
                    });
                });
            }
        });
        
        // Retorna itens mais frequentes
        return Object.entries(pairs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([pair]) => ({
                name: pair.split('|')[0],
                category: 'outros'
            }));
    }

    // Gera razão para sugestão
    getSuggestionReason(item, dayOfWeek, month) {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        if (item.dayOfWeek === dayOfWeek) {
            return `Você costuma comprar às ${dayNames[dayOfWeek]}`;
        }
        if (item.month === month) {
            return `Popular em ${monthNames[month]}`;
        }
        return 'Frequentemente comprado junto';
    }

    // Estima preço de um item
    getEstimatedPrice(itemName) {
        const lowerName = itemName.toLowerCase();
        
        // Busca preço na base de dados
        const dbMatch = Object.entries(PRODUCT_DATABASE).find(([name, data]) => 
            name.toLowerCase() === lowerName || 
            data.keywords.some(keyword => keyword.toLowerCase() === lowerName)
        );
        
        if (dbMatch) return dbMatch[1].price;
        
        // Busca no histórico
        const historyMatch = this.purchaseHistory.find(item => 
            item.name.toLowerCase() === lowerName && item.price
        );
        
        if (historyMatch) return historyMatch.price;
        
        return 0; // Preço desconhecido
    }

    // Detecta categoria automaticamente
    detectCategory(itemName) {
        const lowerName = itemName.toLowerCase();
        
        // Busca na base de dados
        const dbMatch = Object.entries(PRODUCT_DATABASE).find(([name, data]) => 
            name.toLowerCase() === lowerName || 
            data.keywords.some(keyword => keyword.toLowerCase() === lowerName)
        );
        
        if (dbMatch) return dbMatch[1].category;
        
        // Busca no histórico
        const historyMatch = this.purchaseHistory.find(item => 
            item.name.toLowerCase() === lowerName && item.category
        );
        
        if (historyMatch) return historyMatch.category;
        
        return 'outros';
    }

    // Adiciona/remove favorito
    toggleFavorite(itemName) {
        const index = this.favorites.indexOf(itemName);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(itemName);
        }
        this.saveFavorites();
        return this.favorites.includes(itemName);
    }

    // Verifica se item é favorito
    isFavorite(itemName) {
        return this.favorites.includes(itemName);
    }

    // Obtém template de favoritos
    getFavoritesTemplate() {
        return this.favorites.map(name => ({
            name,
            category: this.detectCategory(name),
            qty: 1
        }));
    }

    // Obtém template predefinido
    getTemplate(templateName) {
        if (templateName === 'favoritos') {
            return this.getFavoritesTemplate();
        }
        return PREDEFINED_TEMPLATES[templateName] || [];
    }

    // Obtém informações de um produto da base de dados
    getProductInfo(productName) {
        const lowerName = productName.toLowerCase();
        
        // Buscar por nome exato
        if (PRODUCT_DATABASE[lowerName]) {
            return PRODUCT_DATABASE[lowerName];
        }
        
        // Buscar por palavras-chave
        for (const [name, data] of Object.entries(PRODUCT_DATABASE)) {
            if (data.keywords && data.keywords.some(keyword => 
                keyword.toLowerCase() === lowerName || lowerName.includes(keyword.toLowerCase())
            )) {
                return data;
            }
        }
        
        return null;
    }

    // Analisa padrões de compra para insights
    getShoppingInsights() {
        if (this.purchaseHistory.length < 10) {
            return {
                totalSpent: 0,
                averageItems: 0,
                topCategory: 'N/A',
                insights: ['Adicione mais compras para ver insights personalizados']
            };
        }

        const totalSpent = this.purchaseHistory.reduce((sum, item) => sum + (item.price || 0), 0);
        const averageItems = Math.round(this.purchaseHistory.length / 30); // Por mês aproximado
        
        // Categoria mais comprada
        const categories = {};
        this.purchaseHistory.forEach(item => {
            const cat = item.category || 'outros';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        
        const topCategory = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])[0][0];

        const insights = [];
        
        // Insights baseados em padrões
        if (categories['frutas'] > categories['verduras']) {
            insights.push('🍎 Você compra mais frutas que verduras');
        }
        
        if (totalSpent > 500) {
            insights.push('💰 Gasto alto este mês - considere fazer orçamento');
        }
        
        if (this.favorites.length === 0) {
            insights.push('⭐ Marque itens como favoritos para compras mais rápidas');
        }

        return {
            totalSpent,
            averageItems,
            topCategory,
            insights
        };
    }

    // Obtém itens mais frequentemente comprados
    getFrequentItems() {
        const itemFrequency = {};
        
        this.purchaseHistory.forEach(item => {
            itemFrequency[item.name] = (itemFrequency[item.name] || 0) + 1;
        });
        
        return Object.entries(itemFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name]) => name);
    }


    // Ranqueia e filtra sugestões por relevância
    rankAndFilterSuggestions(suggestions, currentList) {
        // Remove itens já na lista
        const filtered = suggestions.filter(suggestion => 
            !currentList.some(item => 
                item.name.toLowerCase() === suggestion.name.toLowerCase()
            )
        );
        
        // Ordena por confiança/relevância
        return filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }

    // Sugestões baseadas em histórico com IA
    getHistoryBasedSuggestions() {
        const frequentItems = this.getFrequentItems();
        return frequentItems.slice(0, 3).map(item => ({
            name: item,
            category: this.detectCategory(item),
            reason: 'Baseado no seu histórico',
            type: 'history',
            confidence: 0.8
        }));
    }

    // Sugestões sazonais
    getSeasonalSuggestions() {
        const currentMonth = new Date().getMonth() + 1;
        const seasonal = [];
        
        Object.entries(ADVANCED_PRODUCT_DATABASE).forEach(([name, data]) => {
            if (data.season && data.season.includes(currentMonth)) {
                seasonal.push({
                    name,
                    category: data.category,
                    reason: 'Fruta da estação - melhor preço',
                    type: 'seasonal',
                    confidence: 0.9
                });
            }
        });
        
        return seasonal.slice(0, 3);
    }

    // Limpa apenas o histórico de compras
    clearPurchaseHistory() {
        this.purchaseHistory = [];
        this.savePurchaseHistory();
        console.log('Histórico de compras limpo com sucesso');
    }
}

