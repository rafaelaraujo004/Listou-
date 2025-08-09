// intelligence.js - Sistema de inteligência para sugestões e análise de padrões
// Funcionalidades: autocomplete, sugestões inteligentes, análise de padrões, preços estimados

// Base de dados de produtos com categorias e preços médios (valores em R$)
const PRODUCT_DATABASE = {
    // Frutas
    'banana': { category: 'frutas', price: 4.50, icon: '🍌', keywords: ['banana', 'nanica', 'prata'] },
    'maçã': { category: 'frutas', price: 8.90, icon: '🍎', keywords: ['maçã', 'maca', 'apple'] },
    'laranja': { category: 'frutas', price: 3.20, icon: '🍊', keywords: ['laranja', 'orange'] },
    'mamão': { category: 'frutas', price: 5.60, icon: '🧡', keywords: ['mamão', 'mamao', 'papaya'] },
    'abacaxi': { category: 'frutas', price: 7.80, icon: '🍍', keywords: ['abacaxi', 'pineapple'] },
    'uva': { category: 'frutas', price: 12.90, icon: '🍇', keywords: ['uva', 'grape'] },
    'melancia': { category: 'frutas', price: 4.20, icon: '🍉', keywords: ['melancia', 'watermelon'] },
    
    // Verduras
    'alface': { category: 'verduras', price: 3.50, icon: '🥬', keywords: ['alface', 'lettuce'] },
    'tomate': { category: 'verduras', price: 6.80, icon: '🍅', keywords: ['tomate', 'tomato'] },
    'cebola': { category: 'verduras', price: 4.20, icon: '🧅', keywords: ['cebola', 'onion'] },
    'batata': { category: 'verduras', price: 3.90, icon: '🥔', keywords: ['batata', 'potato'] },
    'cenoura': { category: 'verduras', price: 4.50, icon: '🥕', keywords: ['cenoura', 'carrot'] },
    'brócolis': { category: 'verduras', price: 8.20, icon: '🥦', keywords: ['brócolis', 'brocolis', 'broccoli'] },
    
    // Carnes
    'frango': { category: 'carnes', price: 18.90, icon: '🐔', keywords: ['frango', 'chicken', 'peito'] },
    'carne bovina': { category: 'carnes', price: 32.50, icon: '🥩', keywords: ['carne', 'beef', 'bovina', 'patinho'] },
    'peixe': { category: 'carnes', price: 25.80, icon: '🐟', keywords: ['peixe', 'fish', 'salmão', 'tilápia'] },
    'carne suína': { category: 'carnes', price: 22.40, icon: '🐷', keywords: ['porco', 'suína', 'pork', 'lombo'] },
    
    // Laticínios
    'leite': { category: 'laticínios', price: 5.20, icon: '🥛', keywords: ['leite', 'milk'] },
    'queijo': { category: 'laticínios', price: 18.90, icon: '🧀', keywords: ['queijo', 'cheese', 'mussarela'] },
    'iogurte': { category: 'laticínios', price: 4.80, icon: '🥤', keywords: ['iogurte', 'yogurt'] },
    'manteiga': { category: 'laticínios', price: 12.50, icon: '🧈', keywords: ['manteiga', 'butter'] },
    
    // Padaria
    'pão': { category: 'padaria', price: 8.50, icon: '🍞', keywords: ['pão', 'pao', 'bread'] },
    'bolo': { category: 'padaria', price: 15.80, icon: '🎂', keywords: ['bolo', 'cake'] },
    'biscoito': { category: 'padaria', price: 6.90, icon: '🍪', keywords: ['biscoito', 'cookie'] },
    
    // Limpeza
    'detergente': { category: 'limpeza', price: 3.80, icon: '🧽', keywords: ['detergente', 'detergent'] },
    'sabão em pó': { category: 'limpeza', price: 12.90, icon: '📦', keywords: ['sabão', 'sabao', 'soap', 'powder'] },
    'papel higiênico': { category: 'limpeza', price: 18.50, icon: '🧻', keywords: ['papel', 'toilet', 'higiênico'] },
    
    // Higiene
    'shampoo': { category: 'higiene', price: 15.90, icon: '🧴', keywords: ['shampoo'] },
    'sabonete': { category: 'higiene', price: 4.20, icon: '🧼', keywords: ['sabonete', 'soap'] },
    'pasta de dente': { category: 'higiene', price: 8.90, icon: '🦷', keywords: ['pasta', 'dente', 'tooth'] },
    
    // Bebidas
    'água': { category: 'bebidas', price: 2.50, icon: '💧', keywords: ['água', 'agua', 'water'] },
    'refrigerante': { category: 'bebidas', price: 6.80, icon: '🥤', keywords: ['refrigerante', 'coca', 'pepsi', 'soda'] },
    'suco': { category: 'bebidas', price: 8.90, icon: '🧃', keywords: ['suco', 'juice'] }
};

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

// Classe para gerenciar inteligência do app
export class IntelligenceManager {
    constructor() {
        this.purchaseHistory = this.loadPurchaseHistory();
        this.favorites = this.loadFavorites();
        this.userPreferences = this.loadUserPreferences();
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
}
