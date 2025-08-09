// intelligence.js - Sistema de Inteligência Artificial Avançado
// Funcionalidades: ML, predições, recomendações personalizadas, análise comportamental

// Base de conhecimento expandida com nutrição e sazonalidade
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
        this.aiAssistant = new AdvancedAI(); // Nova IA avançada
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

    // Obtem sugestões de autocomplete
    getAutocompleteSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        const suggestions = [];
        const lowerQuery = query.toLowerCase();
        
        // Busca na base de produtos
        Object.entries(PRODUCT_DATABASE).forEach(([name, data]) => {
            if (name.toLowerCase().includes(lowerQuery) || 
                data.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))) {
                suggestions.push({
                    name,
                    category: data.category,
                    icon: data.icon,
                    price: data.price,
                    source: 'database'
                });
            }
        });

        // Busca no histórico
        this.purchaseHistory.forEach(item => {
            if (item.name.toLowerCase().includes(lowerQuery) && 
                !suggestions.find(s => s.name === item.name)) {
                suggestions.push({
                    name: item.name,
                    category: item.category || 'outros',
                    icon: '📦',
                    price: item.price || 0,
                    source: 'history'
                });
            }
        });

        return suggestions.slice(0, 8); // Limita a 8 sugestões
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

    // ===== NOVOS MÉTODOS INTELIGENTES =====
    
    // Sugestões inteligentes usando IA avançada
    getSmartSuggestionsAI(currentList = [], limit = 5) {
        // Combina múltiplas fontes de inteligência
        const aiPredictions = this.aiAssistant.predictNextItems(currentList);
        const historyBasedSuggestions = this.getHistoryBasedSuggestions();
        const seasonalSuggestions = this.getSeasonalSuggestions();
        const nutritionalSuggestions = this.getNutritionalRecommendations(currentList);
        
        // Análise de contexto (horário, dia da semana)
        const contextualSuggestions = this.getContextualSuggestions();
        
        // Combina e ranqueia todas as sugestões
        const allSuggestions = [
            ...aiPredictions,
            ...historyBasedSuggestions,
            ...seasonalSuggestions,
            ...nutritionalSuggestions,
            ...contextualSuggestions
        ];
        
        return this.rankAndFilterSuggestions(allSuggestions, currentList).slice(0, limit);
    }

    // Recomendações nutricionais inteligentes
    getNutritionalRecommendations(currentList) {
        const nutritionalGaps = this.aiAssistant.analyzeNutritionalGaps(currentList);
        const recommendations = [];
        
        nutritionalGaps.forEach(gap => {
            const productData = ADVANCED_PRODUCT_DATABASE[gap.name];
            if (productData) {
                recommendations.push({
                    name: gap.name,
                    category: productData.category,
                    reason: gap.reason,
                    type: 'nutritional',
                    confidence: gap.confidence,
                    health_benefit: productData.health_benefits?.join(', ') || 'Saúde geral'
                });
            }
        });
        
        return recommendations;
    }

    // Sugestões baseadas em contexto temporal
    getContextualSuggestions() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const suggestions = [];
        
        // Sugestões baseadas no horário
        if (hour >= 7 && hour <= 10) {
            suggestions.push({
                name: 'pão',
                category: 'padaria',
                reason: 'Horário do café da manhã',
                type: 'contextual',
                confidence: 0.8
            });
        }
        
        // Fim de semana = churrasco/lazer
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            suggestions.push({
                name: 'carne bovina',
                category: 'carnes',
                reason: 'Final de semana - churrasco',
                type: 'contextual',
                confidence: 0.7
            });
        }
        
        return suggestions;
    }

    // Assistente conversacional IA
    processVoiceCommand(command) {
        // Registra comportamento
        this.aiAssistant.analyzeBehavior('voice_command', { command });
        
        // Processa linguagem natural
        const response = this.aiAssistant.processNaturalLanguage(command);
        
        // Atualiza contexto conversacional
        this.contextualMemory.push({
            input: command,
            response: response,
            timestamp: Date.now()
        });
        
        return response;
    }

    // Análise de padrões comportamentais
    analyzeUserBehavior() {
        const patterns = this.aiAssistant.behaviorPatterns;
        const insights = [];
        
        // Analisa horários de compra
        const hourFrequency = {};
        patterns.forEach(p => {
            const hour = new Date(p.timestamp).getHours();
            hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
        });
        
        const mostActiveHour = Object.entries(hourFrequency)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (mostActiveHour) {
            insights.push(`Você é mais ativo fazendo compras às ${mostActiveHour[0]}h`);
        }
        
        return {
            insights,
            personalizedTips: this.getPersonalizedTips(),
            aiRecommendations: this.aiAssistant.predictNextItems([])
        };
    }

    // Dicas personalizadas baseadas em IA
    getPersonalizedTips() {
        const tips = [];
        const userProfile = this.aiAssistant.userProfile;
        
        if (this.purchaseHistory.length > 20) {
            tips.push('🧠 IA detectou seus padrões - veja sugestões personalizadas');
        }
        
        if (userProfile.budgetRange === 'low') {
            tips.push('💰 Dica: Frutas da estação são até 30% mais baratas');
        }
        
        tips.push('🔮 Experimente o assistente por voz: "Adicionar bananas"');
        tips.push('📊 Sua lista está otimizada nutricionalmente');
        
        return tips;
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

// ===== SISTEMA DE IA AVANÇADO =====
class AdvancedAI {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.behaviorPatterns = this.loadBehaviorPatterns();
        this.preferences = this.loadPreferences();
        this.contextMemory = [];
        this.learningRate = 0.1;
        this.conversationHistory = [];
    }

    // Carrega perfil do usuário
    loadUserProfile() {
        return JSON.parse(localStorage.getItem('listou-user-profile') || JSON.stringify({
            dietPreferences: [],
            allergies: [],
            familySize: 1,
            budgetRange: 'medium',
            healthGoals: [],
            cookingSkill: 'intermediate',
            timeConstraints: 'normal',
            sustainabilityFocus: false
        }));
    }

    // Análise comportamental em tempo real
    analyzeBehavior(action, context) {
        const behaviorData = {
            action,
            context,
            timestamp: Date.now(),
            dayOfWeek: new Date().getDay(),
            hourOfDay: new Date().getHours(),
            sessionDuration: this.getSessionDuration()
        };

        this.behaviorPatterns.push(behaviorData);
        this.updateUserProfile(behaviorData);
        
        // Mantém apenas os últimos 1000 comportamentos
        if (this.behaviorPatterns.length > 1000) {
            this.behaviorPatterns = this.behaviorPatterns.slice(-1000);
        }

        this.saveBehaviorPatterns();
    }

    // Predição inteligente usando ML básico
    predictNextItems(currentList = []) {
        const predictions = [];
        const currentCategories = currentList.map(item => item.category);
        
        // Análise de padrões temporais
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        const currentMonth = new Date().getMonth() + 1;

        // Predições baseadas em horário
        if (currentHour >= 7 && currentHour <= 10) {
            predictions.push(...this.getBreakfastSuggestions());
        } else if (currentHour >= 17 && currentHour <= 20) {
            predictions.push(...this.getDinnerSuggestions());
        }

        // Predições baseadas em sazonalidade
        const seasonalItems = this.getSeasonalRecommendations(currentMonth);
        predictions.push(...seasonalItems);

        // Predições baseadas em padrões de compra
        const patternBasedItems = this.getPatternBasedPredictions(currentCategories);
        predictions.push(...patternBasedItems);

        // Análise nutricional para balanceamento
        const nutritionalGaps = this.analyzeNutritionalGaps(currentList);
        predictions.push(...nutritionalGaps);

        return this.rankPredictions(predictions).slice(0, 5);
    }

    // Sugestões inteligentes de café da manhã
    getBreakfastSuggestions() {
        return [
            { name: 'pão', confidence: 0.9, reason: 'Item popular no café da manhã' },
            { name: 'leite', confidence: 0.85, reason: 'Fonte de cálcio matinal' },
            { name: 'banana', confidence: 0.8, reason: 'Energia rápida e potássio' },
            { name: 'iogurte', confidence: 0.75, reason: 'Probióticos para digestão' }
        ];
    }

    // Sugestões inteligentes de jantar
    getDinnerSuggestions() {
        const meatProteins = ['frango', 'carne bovina', 'peixe'];
        const vegetables = ['brócolis', 'cenoura', 'alface'];
        
        return [
            ...meatProteins.map(item => ({ 
                name: item, 
                confidence: 0.8, 
                reason: 'Proteína para jantar' 
            })),
            ...vegetables.map(item => ({ 
                name: item, 
                confidence: 0.7, 
                reason: 'Vegetais para nutrição' 
            }))
        ];
    }

    // Recomendações sazonais inteligentes
    getSeasonalRecommendations(month) {
        const recommendations = [];
        
        Object.entries(ADVANCED_PRODUCT_DATABASE).forEach(([name, data]) => {
            if (data.season && data.season.includes(month)) {
                recommendations.push({
                    name,
                    confidence: 0.9,
                    reason: `Fruta da estação - melhor preço e sabor`,
                    eco_bonus: data.eco_score > 7
                });
            }
        });

        return recommendations;
    }

    // Análise de lacunas nutricionais
    analyzeNutritionalGaps(currentList) {
        const totalNutrition = this.calculateTotalNutrition(currentList);
        const gaps = [];

        // Verifica deficiências
        if (totalNutrition.vitamin_c < 60) {
            gaps.push({
                name: 'laranja',
                confidence: 0.95,
                reason: 'Baixa vitamina C - recomendado para imunidade'
            });
        }

        if (totalNutrition.fiber < 25) {
            gaps.push({
                name: 'maçã',
                confidence: 0.9,
                reason: 'Adicione fibras para digestão saudável'
            });
        }

        if (totalNutrition.protein < 50) {
            gaps.push({
                name: 'frango',
                confidence: 0.85,
                reason: 'Proteína insuficiente - importante para músculos'
            });
        }

        return gaps;
    }

    // Calcula nutrição total da lista
    calculateTotalNutrition(list) {
        const total = { calories: 0, fiber: 0, vitamin_c: 0, protein: 0 };
        
        list.forEach(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.name.toLowerCase()];
            if (productData && productData.nutrition) {
                Object.keys(total).forEach(nutrient => {
                    total[nutrient] += (productData.nutrition[nutrient] || 0) * item.qty;
                });
            }
        });

        return total;
    }

    // IA Conversacional para assistente virtual
    processNaturalLanguage(input) {
        const normalizedInput = input.toLowerCase().trim();
        
        // Comandos de lista
        if (normalizedInput.includes('adicionar') || normalizedInput.includes('add')) {
            return this.processAddCommand(normalizedInput);
        }
        
        if (normalizedInput.includes('sugerir') || normalizedInput.includes('recomendar')) {
            return this.processSuggestionRequest(normalizedInput);
        }
        
        if (normalizedInput.includes('quanto custa') || normalizedInput.includes('preço')) {
            return this.processPriceQuery(normalizedInput);
        }
        
        if (normalizedInput.includes('nutri') || normalizedInput.includes('saúde')) {
            return this.processNutritionQuery(normalizedInput);
        }
        
        if (normalizedInput.includes('onde comprar') || normalizedInput.includes('local')) {
            return this.processLocationQuery(normalizedInput);
        }

        // Resposta padrão inteligente
        return this.generateSmartResponse(normalizedInput);
    }

    // Processa comando de adicionar item
    processAddCommand(input) {
        const items = this.extractItemsFromText(input);
        const responses = [];
        
        items.forEach(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.toLowerCase()];
            if (productData) {
                responses.push({
                    action: 'add_item',
                    item: item,
                    category: productData.category,
                    suggestion: `${productData.icon} ${item} adicionado! Preço estimado: R$ ${productData.price.toFixed(2)}`
                });
            } else {
                responses.push({
                    action: 'add_item',
                    item: item,
                    suggestion: `📝 ${item} adicionado à lista!`
                });
            }
        });
        
        return responses;
    }

    // Otimização inteligente de rota de compras
    optimizeShoppingRoute(list, storeType = 'supermarket') {
        const optimizedRoute = [];
        const categoryOrder = this.getOptimalCategoryOrder(storeType);
        
        categoryOrder.forEach(category => {
            const categoryItems = list.filter(item => {
                const productData = ADVANCED_PRODUCT_DATABASE[item.name.toLowerCase()];
                return productData && productData.category === category;
            });
            optimizedRoute.push(...categoryItems);
        });
        
        // Adiciona itens sem categoria no final
        const uncategorized = list.filter(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.name.toLowerCase()];
            return !productData;
        });
        optimizedRoute.push(...uncategorized);
        
        return optimizedRoute;
    }

    // Ordem otimizada de categorias no supermercado
    getOptimalCategoryOrder(storeType) {
        const routes = {
            supermarket: ['limpeza', 'higiene', 'laticínios', 'carnes', 'verduras', 'frutas', 'padaria', 'bebidas'],
            feira: ['verduras', 'frutas', 'outros'],
            farmacia: ['higiene', 'outros']
        };
        
        return routes[storeType] || routes.supermarket;
    }

    // Sistema de aprendizado adaptativo
    adaptiveRecommendations(userFeedback) {
        // Ajusta pesos baseado no feedback
        if (userFeedback.action === 'accept') {
            this.increaseItemWeight(userFeedback.item, 0.1);
        } else if (userFeedback.action === 'reject') {
            this.decreaseItemWeight(userFeedback.item, 0.1);
        }
        
        // Aprende padrões de rejeição
        if (userFeedback.action === 'reject') {
            this.updateRejectionPatterns(userFeedback);
        }
        
        this.saveUserProfile();
    }

    // Análise preditiva de preços
    predictPriceChanges(items) {
        const predictions = [];
        const currentMonth = new Date().getMonth() + 1;
        
        items.forEach(itemName => {
            const productData = ADVANCED_PRODUCT_DATABASE[itemName.toLowerCase()];
            if (productData) {
                let priceChange = 0;
                let reason = '';
                
                // Sazonalidade afeta preço
                if (productData.season && !productData.season.includes(currentMonth)) {
                    priceChange = 0.3; // 30% mais caro fora da estação
                    reason = 'Fora da estação';
                } else if (productData.season && productData.season.includes(currentMonth)) {
                    priceChange = -0.15; // 15% mais barato na estação
                    reason = 'Na estação';
                }
                
                predictions.push({
                    item: itemName,
                    currentPrice: productData.price,
                    predictedPrice: productData.price * (1 + priceChange),
                    change: priceChange,
                    reason: reason,
                    confidence: 0.8
                });
            }
        });
        
        return predictions;
    }

    // Assistente de planejamento de refeições com IA
    generateMealPlan(days = 7, preferences = {}) {
        const mealPlan = [];
        const usedItems = new Set();
        
        for (let day = 0; day < days; day++) {
            const dayPlan = {
                day: day + 1,
                breakfast: this.generateMeal('breakfast', preferences, usedItems),
                lunch: this.generateMeal('lunch', preferences, usedItems),
                dinner: this.generateMeal('dinner', preferences, usedItems),
                snacks: this.generateMeal('snack', preferences, usedItems)
            };
            mealPlan.push(dayPlan);
        }
        
        return {
            mealPlan,
            shoppingList: this.generateShoppingListFromMealPlan(mealPlan),
            nutritionSummary: this.analyzeMealPlanNutrition(mealPlan)
        };
    }

    // Análise de sustentabilidade
    analyzeSustainability(list) {
        let totalEcoScore = 0;
        let itemCount = 0;
        const suggestions = [];
        
        list.forEach(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.name.toLowerCase()];
            if (productData && productData.eco_score) {
                totalEcoScore += productData.eco_score;
                itemCount++;
                
                if (productData.eco_score < 6) {
                    suggestions.push({
                        item: item.name,
                        issue: 'Baixo score ambiental',
                        alternative: this.findEcoFriendlyAlternative(item.name),
                        impact: 'Considere alternativas mais sustentáveis'
                    });
                }
            }
        });
        
        const averageScore = itemCount > 0 ? totalEcoScore / itemCount : 0;
        
        return {
            score: averageScore,
            level: this.getEcoLevel(averageScore),
            suggestions,
            tips: this.getEcoTips(averageScore)
        };
    }

    // Métodos auxiliares
    saveUserProfile() {
        localStorage.setItem('listou-user-profile', JSON.stringify(this.userProfile));
    }

    saveBehaviorPatterns() {
        localStorage.setItem('listou-behavior-patterns', JSON.stringify(this.behaviorPatterns));
    }

    loadBehaviorPatterns() {
        return JSON.parse(localStorage.getItem('listou-behavior-patterns') || '[]');
    }

    loadPreferences() {
        return JSON.parse(localStorage.getItem('listou-ai-preferences') || '{}');
    }

    rankPredictions(predictions) {
        return predictions.sort((a, b) => b.confidence - a.confidence);
    }

    extractItemsFromText(text) {
        // IA simples para extrair itens do texto
        const words = text.split(/\s+/);
        const items = [];
        
        words.forEach(word => {
            if (ADVANCED_PRODUCT_DATABASE[word.toLowerCase()]) {
                items.push(word.toLowerCase());
            }
        });
        
        return items;
    }

    getSessionDuration() {
        const sessionStart = localStorage.getItem('listou-session-start');
        if (sessionStart) {
            return Date.now() - parseInt(sessionStart);
        }
        localStorage.setItem('listou-session-start', Date.now().toString());
        return 0;
    }

    // Atualiza perfil do usuário baseado em comportamento
    updateUserProfile(behaviorData) {
        // Atualiza preferências baseadas no comportamento
        if (behaviorData.action === 'add_item') {
            const category = behaviorData.context.category;
            if (category) {
                this.userProfile.preferredCategories = this.userProfile.preferredCategories || {};
                this.userProfile.preferredCategories[category] = (this.userProfile.preferredCategories[category] || 0) + 1;
            }
        }

        // Detecta horários preferidos
        const hour = new Date(behaviorData.timestamp).getHours();
        this.userProfile.activeHours = this.userProfile.activeHours || {};
        this.userProfile.activeHours[hour] = (this.userProfile.activeHours[hour] || 0) + 1;

        this.saveUserProfile();
    }

    // Aumenta peso de um item baseado em feedback positivo
    increaseItemWeight(itemName, weight) {
        this.userProfile.itemWeights = this.userProfile.itemWeights || {};
        this.userProfile.itemWeights[itemName] = Math.min((this.userProfile.itemWeights[itemName] || 0) + weight, 1.0);
        this.saveUserProfile();
    }

    // Diminui peso de um item baseado em feedback negativo
    decreaseItemWeight(itemName, weight) {
        this.userProfile.itemWeights = this.userProfile.itemWeights || {};
        this.userProfile.itemWeights[itemName] = Math.max((this.userProfile.itemWeights[itemName] || 0) - weight, -1.0);
        this.saveUserProfile();
    }

    // Atualiza padrões de rejeição
    updateRejectionPatterns(feedback) {
        this.userProfile.rejectionPatterns = this.userProfile.rejectionPatterns || {};
        const pattern = `${feedback.context.reason}_${feedback.context.category}`;
        this.userProfile.rejectionPatterns[pattern] = (this.userProfile.rejectionPatterns[pattern] || 0) + 1;
        this.saveUserProfile();
    }

    // Gera uma refeição baseada no tipo e preferências
    generateMeal(mealType, preferences, usedItems) {
        const mealItems = [];
        const mealTemplates = {
            breakfast: ['pão', 'leite', 'banana', 'café'],
            lunch: ['arroz', 'feijão', 'frango', 'alface'],
            dinner: ['carne bovina', 'batata', 'brócolis', 'tomate'],
            snack: ['maçã', 'queijo', 'iogurte']
        };

        const template = mealTemplates[mealType] || mealTemplates.snack;
        
        template.forEach(item => {
            if (!usedItems.has(item)) {
                const productData = ADVANCED_PRODUCT_DATABASE[item];
                if (productData) {
                    mealItems.push({
                        name: item,
                        category: productData.category,
                        nutrition: productData.nutrition,
                        qty: 1
                    });
                    usedItems.add(item);
                }
            }
        });

        return mealItems;
    }

    // Gera lista de compras baseada no plano de refeições
    generateShoppingListFromMealPlan(mealPlan) {
        const shoppingList = {};
        
        mealPlan.forEach(day => {
            [day.breakfast, day.lunch, day.dinner, day.snacks].forEach(meal => {
                meal.forEach(item => {
                    shoppingList[item.name] = (shoppingList[item.name] || 0) + item.qty;
                });
            });
        });

        return Object.entries(shoppingList).map(([name, qty]) => ({
            name,
            qty,
            category: this.detectCategory ? this.detectCategory(name) : ADVANCED_PRODUCT_DATABASE[name]?.category || 'outros'
        }));
    }

    // Analisa nutrição do plano de refeições
    analyzeMealPlanNutrition(mealPlan) {
        const totalNutrition = { calories: 0, protein: 0, fiber: 0, vitamin_c: 0 };
        let itemCount = 0;

        mealPlan.forEach(day => {
            [day.breakfast, day.lunch, day.dinner, day.snacks].forEach(meal => {
                meal.forEach(item => {
                    if (item.nutrition) {
                        Object.keys(totalNutrition).forEach(nutrient => {
                            totalNutrition[nutrient] += (item.nutrition[nutrient] || 0) * item.qty;
                        });
                        itemCount++;
                    }
                });
            });
        });

        return {
            total: totalNutrition,
            daily_average: Object.keys(totalNutrition).reduce((avg, key) => {
                avg[key] = totalNutrition[key] / mealPlan.length;
                return avg;
            }, {}),
            recommendations: this.getNutritionRecommendations(totalNutrition, mealPlan.length)
        };
    }

    // Encontra alternativa ecológica para um item
    findEcoFriendlyAlternative(itemName) {
        const currentItem = ADVANCED_PRODUCT_DATABASE[itemName.toLowerCase()];
        if (!currentItem) return null;

        // Busca item da mesma categoria com maior eco_score
        const alternatives = Object.entries(ADVANCED_PRODUCT_DATABASE)
            .filter(([name, data]) => 
                data.category === currentItem.category && 
                data.eco_score > currentItem.eco_score &&
                name !== itemName.toLowerCase()
            )
            .sort((a, b) => b[1].eco_score - a[1].eco_score);

        return alternatives.length > 0 ? alternatives[0][0] : null;
    }

    // Obtém nível ecológico baseado no score
    getEcoLevel(score) {
        if (score >= 8) return 'Excelente';
        if (score >= 6) return 'Bom';
        if (score >= 4) return 'Regular';
        return 'Precisa melhorar';
    }

    // Obtém dicas ecológicas baseadas no score
    getEcoTips(score) {
        const tips = [];
        
        if (score < 6) {
            tips.push('🌱 Prefira produtos orgânicos e locais');
            tips.push('🌍 Evite produtos com muita embalagem');
            tips.push('🥬 Aumente o consumo de vegetais da estação');
        } else if (score < 8) {
            tips.push('♻️ Continue priorizando produtos sustentáveis');
            tips.push('🌿 Considere reduzir proteínas animais');
        } else {
            tips.push('🏆 Parabéns! Sua lista é muito sustentável');
            tips.push('🌟 Continue sendo um exemplo para outros');
        }

        return tips;
    }

    // Recomendações nutricionais baseadas nos totais
    getNutritionRecommendations(totalNutrition, days) {
        const recommendations = [];
        const dailyAvg = Object.keys(totalNutrition).reduce((avg, key) => {
            avg[key] = totalNutrition[key] / days;
            return avg;
        }, {});

        if (dailyAvg.vitamin_c < 90) {
            recommendations.push('Adicione mais frutas cítricas para vitamina C');
        }
        if (dailyAvg.fiber < 25) {
            recommendations.push('Inclua mais vegetais e grãos integrais para fibra');
        }
        if (dailyAvg.protein < 50) {
            recommendations.push('Considere adicionar mais fontes de proteína');
        }

        return recommendations;
    }

    // Processa solicitação de sugestões
    processSuggestionRequest(input) {
        const suggestions = this.getSmartSuggestionsAI ? this.getSmartSuggestionsAI() : [];
        return {
            action: 'show_suggestions',
            suggestions: suggestions.slice(0, 5),
            message: 'Aqui estão algumas sugestões personalizadas para você:'
        };
    }

    // Processa consulta de preço
    processPriceQuery(input) {
        const items = this.extractItemsFromText(input);
        const prices = [];
        
        items.forEach(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.toLowerCase()];
            if (productData) {
                prices.push({
                    item,
                    price: productData.price,
                    icon: productData.icon
                });
            }
        });

        return {
            action: 'show_prices',
            prices,
            message: prices.length > 0 ? 'Aqui estão os preços:' : 'Produto não encontrado na base de dados.'
        };
    }

    // Processa consulta nutricional
    processNutritionQuery(input) {
        const items = this.extractItemsFromText(input);
        const nutritionInfo = [];
        
        items.forEach(item => {
            const productData = ADVANCED_PRODUCT_DATABASE[item.toLowerCase()];
            if (productData && productData.nutrition) {
                nutritionInfo.push({
                    item,
                    nutrition: productData.nutrition,
                    benefits: productData.health_benefits,
                    icon: productData.icon
                });
            }
        });

        return {
            action: 'show_nutrition',
            nutrition: nutritionInfo,
            message: nutritionInfo.length > 0 ? 'Informações nutricionais:' : 'Informação nutricional não disponível.'
        };
    }

    // Processa consulta de localização
    processLocationQuery(input) {
        return {
            action: 'show_location',
            message: 'Recurso de localização será implementado em breve. Por enquanto, consulte seu supermercado local.',
            tips: [
                'Feira livre para frutas e verduras frescas',
                'Supermercado para produtos diversos',
                'Açougue para carnes frescas'
            ]
        };
    }

    // Gera resposta inteligente padrão
    generateSmartResponse(input) {
        const responses = [
            'Como posso ajudar com sua lista de compras?',
            'Que tal experimentar algumas sugestões inteligentes?',
            'Posso ajudar a encontrar preços ou informações nutricionais.',
            'Use comandos como "adicionar banana" ou "sugerir frutas".'
        ];

        return {
            action: 'general_response',
            message: responses[Math.floor(Math.random() * responses.length)],
            suggestions: ['Adicionar item', 'Ver sugestões', 'Consultar preços', 'Informações nutricionais']
        };
    }
}
