// analytics.js - Sistema de análise e insights avançados
// Funcionalidades: análise de gastos, padrões de compra, relatórios, economia sugerida

export class AnalyticsManager {
    constructor() {
        this.purchaseData = this.loadAnalyticsData();
    }

    loadAnalyticsData() {
        try {
            return JSON.parse(localStorage.getItem('listou-analytics') || '[]');
        } catch {
            return [];
        }
    }

    saveAnalyticsData() {
        localStorage.setItem('listou-analytics', JSON.stringify(this.purchaseData));
    }

    // Registra uma compra para análise
    recordPurchase(items, totalSpent, location = null) {
        const purchase = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: items.map(item => ({
                name: item.name,
                category: item.category,
                quantity: item.qty,
                unitPrice: item.price || 0,
                totalPrice: (item.price || 0) * item.qty
            })),
            totalSpent,
            location,
            dayOfWeek: new Date().getDay(),
            month: new Date().getMonth(),
            season: this.getSeason()
        };

        this.purchaseData.unshift(purchase);
        
        // Mantém apenas os últimos 365 registros
        if (this.purchaseData.length > 365) {
            this.purchaseData = this.purchaseData.slice(0, 365);
        }
        
        this.saveAnalyticsData();
        return purchase;
    }

    getSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'outono';
        if (month >= 5 && month <= 7) return 'inverno';
        if (month >= 8 && month <= 10) return 'primavera';
        return 'verão';
    }

    // Análise de gastos mensais
    getMonthlySpending(months = 6) {
        const monthlyData = {};
        const now = new Date();
        
        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = { total: 0, purchases: 0, categories: {} };
        }

        this.purchaseData.forEach(purchase => {
            const date = new Date(purchase.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[key]) {
                monthlyData[key].total += purchase.totalSpent;
                monthlyData[key].purchases++;
                
                purchase.items.forEach(item => {
                    const cat = item.category || 'outros';
                    monthlyData[key].categories[cat] = (monthlyData[key].categories[cat] || 0) + item.totalPrice;
                });
            }
        });

        return monthlyData;
    }

    // Produtos mais comprados
    getTopProducts(limit = 10) {
        const productCount = {};
        const productSpending = {};

        this.purchaseData.forEach(purchase => {
            purchase.items.forEach(item => {
                const name = item.name.toLowerCase();
                productCount[name] = (productCount[name] || 0) + item.quantity;
                productSpending[name] = (productSpending[name] || 0) + item.totalPrice;
            });
        });

        return Object.entries(productCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, count]) => ({
                name,
                count,
                totalSpent: productSpending[name] || 0,
                avgPrice: (productSpending[name] || 0) / count
            }));
    }

    // Análise de categorias
    getCategoryAnalysis() {
        const categories = {};
        
        this.purchaseData.forEach(purchase => {
            purchase.items.forEach(item => {
                const cat = item.category || 'outros';
                if (!categories[cat]) {
                    categories[cat] = { 
                        totalSpent: 0, 
                        itemCount: 0, 
                        purchaseCount: 0,
                        avgItemPrice: 0
                    };
                }
                
                categories[cat].totalSpent += item.totalPrice;
                categories[cat].itemCount += item.quantity;
                categories[cat].purchaseCount++;
            });
        });

        // Calcula médias
        Object.values(categories).forEach(cat => {
            cat.avgItemPrice = cat.totalSpent / cat.itemCount;
        });

        return categories;
    }

    // Detecta padrões de compra
    getShoppingPatterns() {
        const patterns = {
            favoriteDay: this.getFavoriteShoppingDay(),
            averageBasketSize: this.getAverageBasketSize(),
            seasonalTrends: this.getSeasonalTrends(),
            categoryTrends: this.getCategoryTrends(),
            priceVariations: this.getPriceVariations()
        };

        return patterns;
    }

    getFavoriteShoppingDay() {
        const dayCount = Array(7).fill(0);
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        this.purchaseData.forEach(purchase => {
            dayCount[purchase.dayOfWeek]++;
        });

        const maxDayIndex = dayCount.indexOf(Math.max(...dayCount));
        return {
            day: dayNames[maxDayIndex],
            percentage: (dayCount[maxDayIndex] / this.purchaseData.length * 100).toFixed(1)
        };
    }

    getAverageBasketSize() {
        if (this.purchaseData.length === 0) return 0;
        
        const totalItems = this.purchaseData.reduce((sum, purchase) => 
            sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        
        return (totalItems / this.purchaseData.length).toFixed(1);
    }

    getSeasonalTrends() {
        const seasons = { verão: 0, outono: 0, inverno: 0, primavera: 0 };
        
        this.purchaseData.forEach(purchase => {
            seasons[purchase.season] += purchase.totalSpent;
        });

        const maxSeason = Object.entries(seasons).sort((a, b) => b[1] - a[1])[0];
        return {
            highestSpending: maxSeason[0],
            amount: maxSeason[1]
        };
    }

    getCategoryTrends() {
        const recentPurchases = this.purchaseData.slice(0, 30); // Últimas 30 compras
        const categories = {};
        
        recentPurchases.forEach(purchase => {
            purchase.items.forEach(item => {
                const cat = item.category || 'outros';
                categories[cat] = (categories[cat] || 0) + item.totalPrice;
            });
        });

        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, amount]) => ({ category, amount }));
    }

    getPriceVariations() {
        const priceHistory = {};
        
        this.purchaseData.forEach(purchase => {
            purchase.items.forEach(item => {
                const name = item.name.toLowerCase();
                if (!priceHistory[name]) priceHistory[name] = [];
                priceHistory[name].push({
                    date: purchase.date,
                    price: item.unitPrice
                });
            });
        });

        const variations = {};
        Object.entries(priceHistory).forEach(([name, prices]) => {
            if (prices.length > 1) {
                const sorted = prices.sort((a, b) => a.price - b.price);
                const min = sorted[0].price;
                const max = sorted[sorted.length - 1].price;
                const variation = ((max - min) / min * 100).toFixed(1);
                
                if (variation > 10) { // Apenas variações significativas
                    variations[name] = {
                        minPrice: min,
                        maxPrice: max,
                        variation: `${variation}%`,
                        trend: prices[prices.length - 1].price > prices[0].price ? 'alta' : 'baixa'
                    };
                }
            }
        });

        return variations;
    }

    // Sugestões de economia
    getEconomySuggestions() {
        const suggestions = [];
        const categories = this.getCategoryAnalysis();
        const patterns = this.getShoppingPatterns();
        const priceVariations = patterns.priceVariations;

        // Sugere substituições baseadas em preços
        Object.entries(priceVariations).forEach(([item, data]) => {
            if (data.trend === 'alta' && data.variation > '20%') {
                suggestions.push({
                    type: 'price-alert',
                    message: `💰 ${item} subiu ${data.variation}. Considere comprar substitutos.`,
                    priority: 'high'
                });
            }
        });

        // Sugere compras em quantidade
        Object.entries(categories).forEach(([category, data]) => {
            if (data.totalSpent > 100 && data.avgItemPrice < 10) {
                suggestions.push({
                    type: 'bulk-purchase',
                    message: `📦 Você gasta muito em ${category}. Considere comprar em maior quantidade.`,
                    priority: 'medium'
                });
            }
        });

        // Sugere mudança de dia de compra
        if (patterns.favoriteDay.day === 'Sábado' || patterns.favoriteDay.day === 'Domingo') {
            suggestions.push({
                type: 'timing',
                message: `📅 Tente fazer compras em dias de semana para encontrar melhores preços.`,
                priority: 'low'
            });
        }

        return suggestions.sort((a, b) => {
            const priority = { high: 3, medium: 2, low: 1 };
            return priority[b.priority] - priority[a.priority];
        });
    }

    // Relatório completo
    generateReport() {
        const monthlySpending = this.getMonthlySpending(6);
        const topProducts = this.getTopProducts(10);
        const categories = this.getCategoryAnalysis();
        const patterns = this.getShoppingPatterns();
        const economySuggestions = this.getEconomySuggestions();

        return {
            summary: {
                totalPurchases: this.purchaseData.length,
                totalSpent: this.purchaseData.reduce((sum, p) => sum + p.totalSpent, 0),
                averagePurchase: this.purchaseData.length ? 
                    (this.purchaseData.reduce((sum, p) => sum + p.totalSpent, 0) / this.purchaseData.length).toFixed(2) : 0,
                averageBasketSize: patterns.averageBasketSize
            },
            monthlySpending,
            topProducts,
            categories,
            patterns,
            economySuggestions,
            generatedAt: new Date().toISOString()
        };
    }

    // Exporta dados para análise externa
    exportData(format = 'json') {
        const data = this.generateReport();
        
        if (format === 'csv') {
            // Converte para CSV (simplificado)
            const csvData = this.purchaseData.map(purchase => ({
                data: purchase.date,
                total: purchase.totalSpent,
                itens: purchase.items.length,
                local: purchase.location || 'N/A'
            }));
            
            const csvContent = [
                'Data,Total,Itens,Local',
                ...csvData.map(row => `${row.data},${row.total},${row.itens},${row.local}`)
            ].join('\n');
            
            return csvContent;
        }
        
        return JSON.stringify(data, null, 2);
    }

    // Limpa dados antigos (GDPR compliance)
    clearOldData(daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        this.purchaseData = this.purchaseData.filter(purchase => 
            new Date(purchase.date) > cutoffDate
        );
        
        this.saveAnalyticsData();
        return this.purchaseData.length;
    }
}
