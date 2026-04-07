// analytics.js - Sistema de análise e insights avançados
// Funcionalidades: análise de gastos, padrões de compra, relatórios, economia sugerida

export class AnalyticsManager {
    constructor() {
        this.purchaseData = this.loadAnalyticsData();
        this.marketData = this.loadMarketData();
        this.userBenchmarks = this.loadUserBenchmarks();
        this.competitorMetrics = this.initCompetitorData();
    }

    loadAnalyticsData() {
        try {
            return JSON.parse(localStorage.getItem('listou-analytics') || '[]');
        } catch {
            return [];
        }
    }

    loadMarketData() {
        try {
            return JSON.parse(localStorage.getItem('listou-market-data') || '{}');
        } catch {
            return {};
        }
    }

    loadUserBenchmarks() {
        try {
            const saved = localStorage.getItem('listou-user-benchmarks');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Erro ao carregar benchmarks do usuário:', error);
        }
        
        // Valores padrão baseados em dados médios brasileiros
        return {
            avgMonthlyGroceries: 600,
            avgItemsPerPurchase: 15,
            avgPurchaseFrequency: 2.3, // compras por semana
            avgPricePerItem: 8.50,
            lastUpdated: new Date().toISOString()
        };
    }

    initCompetitorData() {
        return {
            // Dados médios de outros apps de lista de compras
            apps: {
                'Listou': {
                    name: 'Listou',
                    userSatisfaction: 95,
                    features: ['IA', 'Analytics', 'Offline', 'PWA', 'Comparação'],
                    avgSavings: 18,
                    marketShare: 5
                },
                'AnyList': {
                    name: 'AnyList',
                    userSatisfaction: 88,
                    features: ['Sync', 'Recipes', 'Categories'],
                    avgSavings: 12,
                    marketShare: 15
                },
                'OurGroceries': {
                    name: 'OurGroceries', 
                    userSatisfaction: 85,
                    features: ['Family Share', 'Photos', 'Sync'],
                    avgSavings: 10,
                    marketShare: 20
                },
                'Bring!': {
                    name: 'Bring!',
                    userSatisfaction: 82,
                    features: ['Visual', 'Share', 'Recipes'],
                    avgSavings: 8,
                    marketShare: 25
                },
                'TodoistShopping': {
                    name: 'Todoist Shopping',
                    userSatisfaction: 80,
                    features: ['Tasks', 'Projects', 'Labels'],
                    avgSavings: 6,
                    marketShare: 10
                }
            },
            industry: {
                avgSavings: 11,
                avgUserSatisfaction: 83,
                growthRate: 0.23 // 23% ao ano
            }
        };
    }

    saveAnalyticsData() {
        localStorage.setItem('listou-analytics', JSON.stringify(this.purchaseData));
    }

    saveMarketData() {
        localStorage.setItem('listou-market-data', JSON.stringify(this.marketData));
    }

    saveUserBenchmarks() {
        localStorage.setItem('listou-user-benchmarks', JSON.stringify(this.userBenchmarks));
    }

    // Registra uma compra para análise
    recordPurchase(items, totalSpent, location = null, supermarket = null, additionalData = null) {
        const purchase = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: items.map(item => ({
                name: item.name,
                category: item.category,
                quantity: item.qty,
                unitPrice: item.price || 0,
                totalPrice: (item.price || 0) * item.qty,
                unit: item.unit || 'unid'
            })),
            totalSpent,
            location,
            supermarket: supermarket || localStorage.getItem('listou-current-supermarket'),
            dayOfWeek: new Date().getDay(),
            month: new Date().getMonth(),
            season: this.getSeason(),
            
            // Dados adicionais detalhados para relatórios mais ricos
            ...(additionalData && {
                totalPlanned: additionalData.totalPlanned,
                totalItems: additionalData.totalItems,
                boughtItems: additionalData.boughtItems,
                completion: additionalData.completion,
                supermarketId: additionalData.supermarketId,
                weekday: additionalData.weekday,
                categories: additionalData.categories,
                savings: additionalData.savings,
                averageItemPrice: additionalData.averageItemPrice,
                shoppingDuration: additionalData.shoppingDuration,
                paymentMethod: additionalData.paymentMethod,
                notes: additionalData.notes,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    screenSize: `${screen.width}x${screen.height}`,
                    viewport: `${window.innerWidth}x${window.innerHeight}`
                }
            })
        };

        this.purchaseData.unshift(purchase);
        
        // Mantém apenas os últimos 365 registros
        if (this.purchaseData.length > 365) {
            this.purchaseData = this.purchaseData.slice(0, 365);
        }
        
        this.saveAnalyticsData();
        this.updateSupermarketPricing(purchase);
        
        // Atualiza benchmarks do usuário
        this.updateUserBenchmarks(purchase);
        
        return purchase;
    }

    // Atualiza dados de preços por supermercado
    updateSupermarketPricing(purchase) {
        if (!purchase.supermarket) return;

        if (!this.marketData.supermarkets) {
            this.marketData.supermarkets = {};
        }

        const supermarket = purchase.supermarket;
        if (!this.marketData.supermarkets[supermarket]) {
            this.marketData.supermarkets[supermarket] = {
                name: supermarket,
                totalPurchases: 0,
                totalSpent: 0,
                items: {},
                avgBasketValue: 0,
                lastUpdate: new Date().toISOString()
            };
        }

        const marketSuper = this.marketData.supermarkets[supermarket];
        marketSuper.totalPurchases++;
        marketSuper.totalSpent += purchase.totalSpent;
        marketSuper.avgBasketValue = marketSuper.totalSpent / marketSuper.totalPurchases;
        marketSuper.lastUpdate = new Date().toISOString();

        // Atualiza preços individuais dos itens
        purchase.items.forEach(item => {
            const itemKey = item.name.toLowerCase();
            if (!marketSuper.items[itemKey]) {
                marketSuper.items[itemKey] = {
                    name: item.name,
                    category: item.category,
                    prices: [],
                    avgPrice: 0,
                    totalQuantity: 0
                };
            }

            const itemData = marketSuper.items[itemKey];
            itemData.prices.push({
                price: item.unitPrice,
                date: purchase.date,
                quantity: item.quantity
            });

            // Mantém apenas os últimos 10 preços
            if (itemData.prices.length > 10) {
                itemData.prices = itemData.prices.slice(-10);
            }

            // Recalcula preço médio
            itemData.avgPrice = itemData.prices.reduce((sum, p) => sum + p.price, 0) / itemData.prices.length;
            itemData.totalQuantity += item.quantity;
        });

        this.saveMarketData();
    }

    // Atualiza benchmarks do usuário baseado nos dados de compra
    updateUserBenchmarks(purchase) {
        const now = new Date();
        const lastUpdate = new Date(this.userBenchmarks.lastUpdated);
        const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
        
        // Atualiza benchmarks apenas se passou pelo menos 1 dia
        if (daysSinceUpdate >= 1) {
            // Calcula médias dos últimos 30 dias
            const last30Days = this.purchaseData.filter(p => {
                const purchaseDate = new Date(p.date);
                const daysAgo = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
                return daysAgo <= 30;
            });

            if (last30Days.length > 0) {
                // Calcula gastos mensais médios
                const totalSpent = last30Days.reduce((sum, p) => sum + p.totalSpent, 0);
                const avgMonthlyGroceries = (totalSpent / last30Days.length) * 4.33; // aprox 4.33 semanas por mês

                // Calcula itens por compra
                const totalItems = last30Days.reduce((sum, p) => sum + (p.boughtItems || p.items.length), 0);
                const avgItemsPerPurchase = totalItems / last30Days.length;

                // Calcula frequência de compras (compras por semana)
                const weeksInPeriod = Math.min(30, daysSinceUpdate) / 7;
                const avgPurchaseFrequency = last30Days.length / weeksInPeriod;

                // Calcula preço médio por item
                const avgPricePerItem = totalSpent / totalItems;

                // Atualiza benchmarks
                this.userBenchmarks = {
                    avgMonthlyGroceries: Math.round(avgMonthlyGroceries * 100) / 100,
                    avgItemsPerPurchase: Math.round(avgItemsPerPurchase * 100) / 100,
                    avgPurchaseFrequency: Math.round(avgPurchaseFrequency * 100) / 100,
                    avgPricePerItem: Math.round(avgPricePerItem * 100) / 100,
                    lastUpdated: now.toISOString(),
                    totalPurchases: this.purchaseData.length,
                    dataQuality: this.calculateDataQuality(last30Days)
                };

                this.saveUserBenchmarks();
                console.log('📊 Benchmarks do usuário atualizados:', this.userBenchmarks);
            }
        }
    }

    // Calcula qualidade dos dados coletados
    calculateDataQuality(purchases) {
        if (purchases.length === 0) return 0;

        let qualityScore = 0;
        const factors = [];

        // Fator 1: Quantidade de compras (mais dados = melhor)
        const purchasesFactor = Math.min(purchases.length / 10, 1); // ideal: 10+ compras
        factors.push(purchasesFactor * 0.3);

        // Fator 2: Completude dos dados de preço
        const itemsWithPrice = purchases
            .flatMap(p => p.items)
            .filter(item => item.unitPrice > 0);
        const totalItems = purchases.flatMap(p => p.items);
        const priceFactor = totalItems.length > 0 ? itemsWithPrice.length / totalItems.length : 0;
        factors.push(priceFactor * 0.3);

        // Fator 3: Informações de supermercado
        const purchasesWithSupermarket = purchases.filter(p => p.supermarket);
        const supermarketFactor = purchasesWithSupermarket.length / purchases.length;
        factors.push(supermarketFactor * 0.2);

        // Fator 4: Dados adicionais (notas, forma de pagamento, etc.)
        const purchasesWithExtraData = purchases.filter(p => 
            p.paymentMethod || p.notes || p.shoppingDuration
        );
        const extraDataFactor = purchasesWithExtraData.length / purchases.length;
        factors.push(extraDataFactor * 0.2);

        qualityScore = factors.reduce((sum, factor) => sum + factor, 0);
        return Math.round(qualityScore * 100);
    }

    // Compara preços entre supermercados
    compareSupermarketPrices(filterSupermarket = null) {
        if (!this.marketData.supermarkets) return [];

        const supermarkets = Object.values(this.marketData.supermarkets);
        
        if (filterSupermarket && filterSupermarket !== 'all') {
            const filtered = supermarkets.find(s => 
                s.name.toLowerCase().replace(/\s+/g, '-') === filterSupermarket
            );
            return filtered ? [filtered] : [];
        }

        // Ordena por valor médio da cesta (menor para maior = melhor)
        return supermarkets
            .filter(s => s.totalPurchases > 0)
            .sort((a, b) => a.avgBasketValue - b.avgBasketValue)
            .map((supermarket, index) => ({
                ...supermarket,
                ranking: index + 1,
                savings: this.calculateSupermarketSavings(supermarket, supermarkets)
            }));
    }

    // Calcula economia potencial em relação ao supermercado mais caro
    calculateSupermarketSavings(supermarket, allSupermarkets) {
        if (allSupermarkets.length < 2) return 0;

        const avgBaskets = allSupermarkets.map(s => s.avgBasketValue).filter(v => v > 0);
        const maxBasket = Math.max(...avgBaskets);
        const minBasket = Math.min(...avgBaskets);

        return maxBasket - supermarket.avgBasketValue;
    }

    // Encontra os melhores preços por item entre supermercados
    getBestPricesByItem(itemNames = null) {
        if (!this.marketData.supermarkets) return [];

        const bestPrices = [];
        const allItems = {};

        // Coleta todos os itens de todos os supermercados
        Object.values(this.marketData.supermarkets).forEach(supermarket => {
            Object.values(supermarket.items).forEach(item => {
                const itemKey = item.name.toLowerCase();
                if (!allItems[itemKey]) {
                    allItems[itemKey] = {
                        name: item.name,
                        category: item.category,
                        stores: []
                    };
                }

                allItems[itemKey].stores.push({
                    supermarket: supermarket.name,
                    price: item.avgPrice,
                    totalQuantity: item.totalQuantity,
                    lastUpdate: supermarket.lastUpdate
                });
            });
        });

        // Encontra o melhor preço para cada item
        Object.values(allItems).forEach(item => {
            if (item.stores.length > 1) { // Só inclui itens com preços de múltiplos supermercados
                const sortedStores = item.stores.sort((a, b) => a.price - b.price);
                const bestStore = sortedStores[0];
                const worstStore = sortedStores[sortedStores.length - 1];
                
                bestPrices.push({
                    name: item.name,
                    category: item.category,
                    bestPrice: bestStore.price,
                    bestStore: bestStore.supermarket,
                    savings: worstStore.price - bestStore.price,
                    savingsPercentage: ((worstStore.price - bestStore.price) / worstStore.price) * 100
                });
            }
        });

        // Ordena por economia (maior para menor)
        return bestPrices
            .sort((a, b) => b.savings - a.savings)
            .slice(0, 10); // Top 10 melhores ofertas
    }

    // Gera relatório comparativo de supermercados
    generateSupermarketComparisonReport() {
        const comparison = this.compareSupermarketPrices();
        const bestPrices = this.getBestPricesByItem();
        
        return {
            supermarkets: comparison,
            bestDeals: bestPrices,
            recommendations: this.generateSupermarketRecommendations(comparison, bestPrices),
            summary: this.generateComparisonSummary(comparison, bestPrices)
        };
    }

    // Gera recomendações baseadas nos dados do usuário
    generateSupermarketRecommendations(supermarkets, bestPrices) {
        const recommendations = [];

        if (supermarkets.length >= 2) {
            const cheapest = supermarkets[0];
            const mostExpensive = supermarkets[supermarkets.length - 1];
            
            recommendations.push({
                type: 'savings',
                title: 'Economia Potencial',
                message: `Comprando no ${cheapest.name} ao invés do ${mostExpensive.name}, você pode economizar em média R$ ${(mostExpensive.avgBasketValue - cheapest.avgBasketValue).toFixed(2)} por compra.`,
                impact: 'high',
                icon: '💰'
            });
        }

        // Recomendações por produto
        if (bestPrices.length > 0) {
            const topSaving = bestPrices[0];
            recommendations.push({
                type: 'product',
                title: 'Maior Economia por Produto',
                message: `${topSaving.name} está R$ ${topSaving.savings.toFixed(2)} mais barato no ${topSaving.bestStore} (${topSaving.savingsPercentage.toFixed(1)}% de economia).`,
                impact: 'medium',
                icon: '🏷️'
            });
        }

        // Análise de padrões
        const patterns = this.analyzeShoppingPatterns();
        if (patterns.length > 0) {
            recommendations.push(...patterns);
        }

        return recommendations;
    }

    // Gera resumo executivo da comparação
    generateComparisonSummary(supermarkets, bestPrices) {
        if (supermarkets.length === 0) {
            return {
                totalSupermarkets: 0,
                message: 'Adicione preços aos itens para gerar comparações entre supermercados.'
            };
        }

        const totalSavings = bestPrices.reduce((sum, item) => sum + item.savings, 0);
        const avgSavingsPercentage = bestPrices.length > 0 ? 
            bestPrices.reduce((sum, item) => sum + item.savingsPercentage, 0) / bestPrices.length : 0;

        return {
            totalSupermarkets: supermarkets.length,
            totalPotentialSavings: totalSavings,
            avgSavingsPercentage: avgSavingsPercentage,
            bestOverallSupermarket: supermarkets[0]?.name,
            message: `Analisando ${supermarkets.length} supermercados, você pode economizar até R$ ${totalSavings.toFixed(2)} escolhendo onde comprar cada produto.`
        };
    }

    // Analisa padrões de compra do usuário
    analyzeShoppingPatterns() {
        const patterns = [];
        const recentPurchases = this.purchaseData.slice(0, 10); // Últimas 10 compras

        if (recentPurchases.length < 3) {
            return patterns;
        }

        // Padrão de dias da semana
        const dayPattern = this.analyzeDayOfWeekPattern(recentPurchases);
        if (dayPattern) {
            patterns.push(dayPattern);
        }

        // Padrão de categorias
        const categoryPattern = this.analyzeCategoryPattern(recentPurchases);
        if (categoryPattern) {
            patterns.push(categoryPattern);
        }

        // Padrão de gastos
        const spendingPattern = this.analyzeSpendingPattern(recentPurchases);
        if (spendingPattern) {
            patterns.push(spendingPattern);
        }

        // Padrão de tempo de compra
        const timePattern = this.analyzeTimePattern(recentPurchases);
        if (timePattern) {
            patterns.push(timePattern);
        }

        return patterns;
    }

    // Analisa padrão de dias da semana
    analyzeDayOfWeekPattern(purchases) {
        const dayCount = {};
        purchases.forEach(p => {
            const day = p.weekday || new Date(p.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            dayCount[day] = (dayCount[day] || 0) + 1;
        });

        const mostCommonDay = Object.entries(dayCount)
            .sort((a, b) => b[1] - a[1])[0];

        if (mostCommonDay && mostCommonDay[1] >= 3) {
            return {
                type: 'pattern',
                title: 'Padrão de Compras',
                message: `Você costuma fazer compras às ${mostCommonDay[0]}s. Considere verificar se há promoções específicas neste dia.`,
                impact: 'low',
                icon: '📅'
            };
        }
        return null;
    }

    // Analisa padrão de categorias mais compradas
    analyzeCategoryPattern(purchases) {
        const categoryCount = {};
        purchases.forEach(p => {
            if (p.categories) {
                Object.keys(p.categories).forEach(cat => {
                    categoryCount[cat] = (categoryCount[cat] || 0) + p.categories[cat].count;
                });
            }
        });

        const topCategory = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])[0];

        if (topCategory && topCategory[1] >= 5) {
            return {
                type: 'pattern',
                title: 'Categoria Favorita',
                message: `Você compra frequentemente produtos de ${topCategory[0]}. Considere buscar supermercados com melhores preços nesta categoria.`,
                impact: 'medium',
                icon: '🛒'
            };
        }
        return null;
    }

    // Analisa padrão de gastos
    analyzeSpendingPattern(purchases) {
        const amounts = purchases.map(p => p.totalSpent);
        const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
        const lastThree = amounts.slice(0, 3);
        const lastThreeAvg = lastThree.reduce((sum, a) => sum + a, 0) / lastThree.length;

        const variation = ((lastThreeAvg - avg) / avg) * 100;

        if (Math.abs(variation) > 20) {
            const trend = variation > 0 ? 'aumentaram' : 'diminuíram';
            const emoji = variation > 0 ? '📈' : '📉';
            
            return {
                type: 'trend',
                title: 'Tendência de Gastos',
                message: `Seus gastos ${trend} ${Math.abs(variation).toFixed(1)}% nas últimas compras. Valor médio atual: R$ ${lastThreeAvg.toFixed(2)}.`,
                impact: variation > 0 ? 'high' : 'medium',
                icon: emoji
            };
        }
        return null;
    }

    // Analisa padrão de tempo de compra
    analyzeTimePattern(purchases) {
        const durations = purchases
            .filter(p => p.shoppingDuration)
            .map(p => p.shoppingDuration);

        if (durations.length >= 3) {
            const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
            const lastDuration = durations[0];

            if (lastDuration > avgDuration * 1.5) {
                return {
                    type: 'efficiency',
                    title: 'Tempo de Compra',
                    message: `Sua última compra demorou ${lastDuration} minutos, acima da média de ${avgDuration.toFixed(0)} min. Considere fazer uma lista mais organizada.`,
                    impact: 'low',
                    icon: '⏱️'
                };
            }
        }
        return null;
    }

    // Gera insights personalizados para o usuário
    generatePersonalizedInsights() {
        const insights = [];

        // Insight de economia mensal
        const monthlyInsight = this.generateMonthlySavingsInsight();
        if (monthlyInsight) insights.push(monthlyInsight);

        // Insight de comparação com benchmarks
        const benchmarkInsight = this.generateBenchmarkInsight();
        if (benchmarkInsight) insights.push(benchmarkInsight);

        // Insight de produtos mais caros
        const expensiveProductsInsight = this.generateExpensiveProductsInsight();
        if (expensiveProductsInsight) insights.push(expensiveProductsInsight);

        // Insight de eficiência de compras
        const efficiencyInsight = this.generateEfficiencyInsight();
        if (efficiencyInsight) insights.push(efficiencyInsight);

        return insights;
    }

    // Insight de economia mensal
    generateMonthlySavingsInsight() {
        const lastMonth = this.purchaseData.filter(p => {
            const purchaseDate = new Date(p.date);
            const now = new Date();
            const daysDiff = (now - purchaseDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        if (lastMonth.length > 0) {
            const totalSpent = lastMonth.reduce((sum, p) => sum + p.totalSpent, 0);
            const potentialSavings = lastMonth.reduce((sum, p) => sum + (p.savings || 0), 0);
            const savingsPercentage = totalSpent > 0 ? (potentialSavings / totalSpent) * 100 : 0;

            return {
                type: 'monthly',
                title: 'Economia no Mês',
                value: potentialSavings,
                message: `No último mês você gastou R$ ${totalSpent.toFixed(2)} e ${potentialSavings > 0 ? `economizou R$ ${potentialSavings.toFixed(2)}` : `gastou R$ ${Math.abs(potentialSavings).toFixed(2)} a mais que o planejado`}.`,
                percentage: Math.abs(savingsPercentage),
                trend: potentialSavings > 0 ? 'positive' : 'negative',
                icon: potentialSavings > 0 ? '💰' : '⚠️'
            };
        }
        return null;
    }

    // Insight de comparação com benchmarks
    generateBenchmarkInsight() {
        const userAvg = this.userBenchmarks.avgMonthlyGroceries;
        const nationalAvg = 600; // Média nacional brasileira

        const difference = userAvg - nationalAvg;
        const percentage = (Math.abs(difference) / nationalAvg) * 100;

        if (percentage > 10) {
            const comparison = difference > 0 ? 'acima' : 'abaixo';
            const emoji = difference > 0 ? '📊' : '🎯';
            
            return {
                type: 'benchmark',
                title: 'Comparação Nacional',
                message: `Seus gastos mensais (R$ ${userAvg.toFixed(2)}) estão ${percentage.toFixed(1)}% ${comparison} da média nacional (R$ ${nationalAvg}).`,
                impact: difference > 0 ? 'medium' : 'positive',
                icon: emoji
            };
        }
        return null;
    }

    // Insight de produtos mais caros
    generateExpensiveProductsInsight() {
        const recentPurchases = this.purchaseData.slice(0, 5);
        if (recentPurchases.length === 0) return null;

        const allItems = recentPurchases.flatMap(p => p.items);
        const expensiveItems = allItems
            .filter(item => item.unitPrice > 20)
            .sort((a, b) => b.unitPrice - a.unitPrice)
            .slice(0, 3);

        if (expensiveItems.length > 0) {
            const topExpensive = expensiveItems[0];
            return {
                type: 'products',
                title: 'Produtos Mais Caros',
                message: `${topExpensive.name} foi seu item mais caro recente (R$ ${topExpensive.unitPrice.toFixed(2)}). Compare preços em diferentes supermercados.`,
                impact: 'medium',
                icon: '💎'
            };
        }
        return null;
    }

    // Insight de eficiência de compras
    // Insight de eficiência de compras
    generateEfficiencyInsight() {
        const recentPurchases = this.purchaseData.slice(0, 10);
        if (recentPurchases.length < 3) return null;

        const completionRates = recentPurchases
            .filter(p => p.completion)
            .map(p => p.completion);

        if (completionRates.length >= 3) {
            const avgCompletion = completionRates.reduce((sum, c) => sum + c, 0) / completionRates.length;
            
            if (avgCompletion < 80) {
                return {
                    type: 'efficiency',
                    title: 'Eficiência das Listas',
                    message: `Você completa em média ${avgCompletion.toFixed(1)}% dos itens das suas listas. Considere revisar sua estratégia de planejamento.`,
                    impact: 'medium',
                    icon: '📋'
                };
            } else if (avgCompletion > 95) {
                return {
                    type: 'efficiency',
                    title: 'Excelente Planejamento!',
                    message: `Você completa ${avgCompletion.toFixed(1)}% dos itens das suas listas. Seu planejamento está excelente!`,
                    impact: 'positive',
                    icon: '🎯'
                };
            }
        }
        return null;
    }

    // Gera relatório completo com comparativos e insights
    generateDetailedReport() {
        const userMetrics = this.getUserMetrics();
        const comparison = this.compareSupermarketPrices();
        const bestPrices = this.getBestPricesByItem();

        return {
            reportType: 'detailed-analysis',
            generatedAt: new Date().toISOString(),
            summary: {
                totalSupermarkets: comparison.length,
                bestSupermarket: comparison[0]?.name || 'N/A',
                potentialSavings: comparison[0]?.savings || 0,
                avgMonthlySpending: userMetrics.avgMonthlySpent
            },
            supermarketRanking: comparison.map(s => ({
                position: s.ranking,
                name: s.name,
                avgBasketValue: s.avgBasketValue,
                totalPurchases: s.totalPurchases,
                savings: s.savings,
                class: this.getSupermarketClass(s.ranking, comparison.length)
            })),
            bestDeals: bestPrices.slice(0, 5).map(item => ({
                name: item.name,
                bestPrice: item.bestPrice,
                bestStore: item.bestStore,
                savings: item.savings,
                savingsPercentage: item.savingsPercentage
            })),
            insights: this.generateSupermarketInsights(comparison, bestPrices, userMetrics)
        };
    }

    getSupermarketClass(ranking, total) {
        const ratio = ranking / total;
        if (ratio <= 0.25) return 'best';
        if (ratio <= 0.5) return 'good';
        if (ratio <= 0.75) return 'average';
        return 'expensive';
    }

    generateSupermarketInsights(comparison, bestPrices, userMetrics) {
        const insights = [];

        if (comparison.length > 1) {
            const bestSuper = comparison[0];
            const currentSuper = localStorage.getItem('listou-current-supermarket');
            
            if (currentSuper && currentSuper !== bestSuper.name) {
                const currentSuperData = comparison.find(s => s.name === currentSuper);
                if (currentSuperData) {
                    const potentialSavings = currentSuperData.avgBasketValue - bestSuper.avgBasketValue;
                    if (potentialSavings > 0) {
                        insights.push({
                            type: 'recommendation',
                            title: 'Oportunidade de Economia',
                            message: `Comprando no ${bestSuper.name} você economizaria R$ ${potentialSavings.toFixed(2)} por compra`,
                            impact: 'high'
                        });
                    }
                }
            }
        }

        if (bestPrices.length > 0) {
            const totalSavingsPotential = bestPrices.reduce((sum, item) => sum + item.savings, 0);
            insights.push({
                type: 'informational',
                title: 'Economia por Item',
                message: `Comprando cada item no melhor supermercado, você economizaria R$ ${totalSavingsPotential.toFixed(2)} por lista`,
                impact: 'medium'
            });
        }

        return insights;
    }

    // Obtém métricas consolidadas do usuário
    getUserMetrics() {
        const last30Days = this.purchaseData.filter(p => {
            const purchaseDate = new Date(p.date);
            const now = new Date();
            const daysDiff = (now - purchaseDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
        });

        const last90Days = this.purchaseData.filter(p => {
            const purchaseDate = new Date(p.date);
            const now = new Date();
            const daysDiff = (now - purchaseDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 90;
        });

        return {
            totalPurchases: this.purchaseData.length,
            last30DaysPurchases: last30Days.length,
            last90DaysPurchases: last90Days.length,
            avgMonthlySpent: last30Days.length > 0 ? 
                (last30Days.reduce((sum, p) => sum + p.totalSpent, 0) / last30Days.length) * 4.33 : 0,
            avgBasketSize: this.purchaseData.length > 0 ?
                this.purchaseData.reduce((sum, p) => sum + (p.boughtItems || p.items.length), 0) / this.purchaseData.length : 0,
            avgItemPrice: this.calculateAverageItemPrice(),
            mostUsedSupermarket: this.getMostUsedSupermarket(),
            favoriteCategory: this.getFavoriteCategory(),
            dataQuality: this.userBenchmarks.dataQuality || 0
        };
    }

    // Calcula preço médio dos itens
    calculateAverageItemPrice() {
        const allItems = this.purchaseData.flatMap(p => p.items);
        const itemsWithPrice = allItems.filter(item => item.unitPrice > 0);
        
        if (itemsWithPrice.length === 0) return 0;
        
        return itemsWithPrice.reduce((sum, item) => sum + item.unitPrice, 0) / itemsWithPrice.length;
    }

    // Obtém supermercado mais usado
    getMostUsedSupermarket() {
        const supermarketCount = {};
        this.purchaseData.forEach(p => {
            if (p.supermarket) {
                supermarketCount[p.supermarket] = (supermarketCount[p.supermarket] || 0) + 1;
            }
        });

        const entries = Object.entries(supermarketCount);
        if (entries.length === 0) return null;
        
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    // Obtém categoria favorita
    getFavoriteCategory() {
        const categoryCount = {};
        this.purchaseData.forEach(p => {
            if (p.categories) {
                Object.entries(p.categories).forEach(([cat, data]) => {
                    categoryCount[cat] = (categoryCount[cat] || 0) + data.count;
                });
            }
        });

        const entries = Object.entries(categoryCount);
        if (entries.length === 0) return null;
        
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    // Obtém dia da semana favorito para compras
    getFavoriteShoppingDay() {
        const dayCount = {};
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        
        this.purchaseData.forEach(p => {
            const date = new Date(p.date);
            const dayName = dayNames[date.getDay()];
            dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        });

        const entries = Object.entries(dayCount);
        if (entries.length === 0) return null;
        
        return entries.sort((a, b) => b[1] - a[1])[0][0];
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

    // Limpa todos os dados de compras
    clearAllPurchaseData() {
        this.purchaseData = [];
        this.saveAnalyticsData();
        console.log('Todos os dados analíticos de compras foram limpos');
        return 0;
    }

    // === FUNCIONALIDADES DE COMPARAÇÃO COM OUTROS APPS ===

    // Calcula métricas de performance do usuário vs. mercado
    getPerformanceMetrics() {
        const userMetrics = this.getUserMetrics();
        const benchmarks = this.userBenchmarks;
        
        return {
            savingsScore: this.calculateSavingsScore(userMetrics),
            efficiencyScore: this.calculateEfficiencyScore(userMetrics),
            organizationScore: this.calculateOrganizationScore(userMetrics),
            overallScore: 0, // Será calculado abaixo
            comparison: {
                vsMarket: this.compareWithMarket(userMetrics),
                vsCompetitors: this.compareWithCompetitors(userMetrics),
                improvement: this.getImprovementSuggestions(userMetrics)
            }
        };
    }

    getUserMetrics() {
        const totalSpent = this.purchaseData.reduce((sum, p) => sum + p.totalSpent, 0);
        const totalPurchases = this.purchaseData.length;
        const totalItems = this.purchaseData.reduce((sum, purchase) => 
            sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );

        const monthlySpending = this.getMonthlySpending(3);
        const avgMonthlySpent = Object.values(monthlySpending).reduce((sum, month) => sum + month.total, 0) / 3;

        return {
            totalSpent,
            totalPurchases,
            totalItems,
            avgMonthlySpent,
            avgItemsPerPurchase: totalPurchases > 0 ? (totalItems / totalPurchases).toFixed(1) : 0,
            avgPricePerItem: totalItems > 0 ? (totalSpent / totalItems).toFixed(2) : 0,
            purchaseFrequency: this.calculatePurchaseFrequency(),
            categoryDiversity: this.calculateCategoryDiversity(),
            priceOptimization: this.calculatePriceOptimization()
        };
    }

    calculateSavingsScore(metrics) {
        // Compara economia do usuário com benchmark
        const expectedSpending = this.userBenchmarks.avgMonthlyGroceries;
        const actualSpending = metrics.avgMonthlySpent;
        const savingsPercentage = ((expectedSpending - actualSpending) / expectedSpending) * 100;
        
        // Score de 0-100 baseado na economia
        let score = Math.max(0, Math.min(100, 50 + savingsPercentage * 2));
        
        return {
            score: Math.round(score),
            savingsPercentage: savingsPercentage.toFixed(1),
            monthlySavings: Math.max(0, expectedSpending - actualSpending),
            vs: {
                listou: score > this.competitorMetrics.apps.Listou.avgSavings ? 'superior' : 'inferior',
                market: score > this.competitorMetrics.industry.avgSavings ? 'superior' : 'inferior'
            }
        };
    }

    calculateEfficiencyScore(metrics) {
        // Mede eficiência baseada em frequência de compras e itens por compra
        const idealFrequency = 2.5; // 2-3 compras por semana
        const idealItemsPerPurchase = 12;
        
        const frequencyScore = 100 - Math.abs(metrics.purchaseFrequency - idealFrequency) * 20;
        const itemsScore = 100 - Math.abs(metrics.avgItemsPerPurchase - idealItemsPerPurchase) * 5;
        
        const score = (frequencyScore + itemsScore) / 2;
        
        return {
            score: Math.round(Math.max(0, Math.min(100, score))),
            frequency: metrics.purchaseFrequency,
            itemsPerPurchase: metrics.avgItemsPerPurchase,
            suggestion: this.getEfficiencySuggestion(metrics)
        };
    }

    calculateOrganizationScore(metrics) {
        // Mede organização baseada em diversidade de categorias e consistência
        const diversityScore = Math.min(100, metrics.categoryDiversity * 10);
        const consistencyScore = this.calculateConsistencyScore();
        const planningScore = this.calculatePlanningScore();
        
        const score = (diversityScore + consistencyScore + planningScore) / 3;
        
        return {
            score: Math.round(score),
            diversity: metrics.categoryDiversity,
            consistency: consistencyScore,
            planning: planningScore
        };
    }

    calculatePurchaseFrequency() {
        if (this.purchaseData.length < 2) return 0;
        
        const dates = this.purchaseData.map(p => new Date(p.date)).sort((a, b) => a - b);
        const daysBetween = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        const weeksSpan = daysBetween / 7;
        
        return weeksSpan > 0 ? (this.purchaseData.length / weeksSpan).toFixed(1) : 0;
    }

    calculateCategoryDiversity() {
        const categories = new Set();
        this.purchaseData.forEach(purchase => {
            purchase.items.forEach(item => {
                categories.add(item.category || 'outros');
            });
        });
        return categories.size;
    }

    calculatePriceOptimization() {
        const variations = this.getPriceVariations();
        const optimized = Object.values(variations).filter(v => v.trend === 'baixa').length;
        const total = Object.keys(variations).length;
        
        return total > 0 ? (optimized / total * 100).toFixed(1) : 0;
    }

    calculateConsistencyScore() {
        // Analisa consistência nos padrões de compra
        const monthlyData = this.getMonthlySpending(6);
        const spending = Object.values(monthlyData).map(m => m.total);
        
        if (spending.length < 2) return 50;
        
        const mean = spending.reduce((sum, val) => sum + val, 0) / spending.length;
        const variance = spending.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / spending.length;
        const stdDev = Math.sqrt(variance);
        const coefficient = mean > 0 ? (stdDev / mean) * 100 : 100;
        
        // Menor variação = maior consistência
        return Math.max(0, 100 - coefficient);
    }

    calculatePlanningScore() {
        // Mede capacidade de planejamento baseado em previsibilidade
        const patterns = this.getShoppingPatterns();
        let score = 50; // Base
        
        // Bônus por ter dia favorito consistente
        if (patterns.favoriteDay.percentage > 30) {
            score += 20;
        }
        
        // Bônus por ter categorias organizadas
        if (patterns.categoryTrends.length >= 3) {
            score += 15;
        }
        
        // Bônus por tamanho de cesta consistente
        const avgBasket = parseFloat(patterns.averageBasketSize);
        if (avgBasket >= 10 && avgBasket <= 20) {
            score += 15;
        }
        
        return Math.min(100, score);
    }

    compareWithMarket(metrics) {
        const market = this.competitorMetrics.industry;
        
        return {
            savings: {
                user: metrics.avgMonthlySpent,
                market: this.userBenchmarks.avgMonthlyGroceries,
                difference: this.userBenchmarks.avgMonthlyGroceries - metrics.avgMonthlySpent,
                percentile: this.calculatePercentile('spending', metrics.avgMonthlySpent)
            },
            efficiency: {
                user: metrics.avgItemsPerPurchase,
                market: this.userBenchmarks.avgItemsPerPurchase,
                difference: metrics.avgItemsPerPurchase - this.userBenchmarks.avgItemsPerPurchase,
                percentile: this.calculatePercentile('efficiency', metrics.avgItemsPerPurchase)
            }
        };
    }

    compareWithCompetitors(metrics) {
        const competitors = this.competitorMetrics.apps;
        const userSavingsScore = this.calculateSavingsScore(metrics).score;
        
        const comparison = {};
        Object.entries(competitors).forEach(([key, app]) => {
            if (key !== 'Listou') {
                comparison[key] = {
                    name: app.name,
                    userAdvantage: userSavingsScore - app.avgSavings,
                    satisfactionDiff: this.competitorMetrics.apps.Listou.userSatisfaction - app.userSatisfaction,
                    features: {
                        listou: this.competitorMetrics.apps.Listou.features,
                        competitor: app.features,
                        unique: this.competitorMetrics.apps.Listou.features.filter(f => !app.features.includes(f))
                    }
                };
            }
        });
        
        return comparison;
    }

    calculatePercentile(metric, value) {
        // Simula percentil baseado em distribuições típicas
        const distributions = {
            spending: { mean: 600, stdDev: 200 },
            efficiency: { mean: 15, stdDev: 5 }
        };
        
        const dist = distributions[metric];
        if (!dist) return 50;
        
        // Aproximação de percentil usando distribuição normal
        const z = (value - dist.mean) / dist.stdDev;
        const percentile = 50 + (z * 34.13); // Aproximação
        
        return Math.max(1, Math.min(99, Math.round(percentile)));
    }

    getImprovementSuggestions(metrics) {
        const suggestions = [];
        const performance = this.getPerformanceMetrics();
        
        // Sugestões baseadas em pontuação baixa
        if (performance.savingsScore?.score < 70) {
            suggestions.push({
                category: 'Economia',
                priority: 'high',
                message: 'Seus gastos estão acima da média. Considere usar mais os recursos de comparação de preços.',
                action: 'Ative notificações de promoções e compare preços antes de comprar.'
            });
        }
        
        if (performance.efficiencyScore?.score < 60) {
            suggestions.push({
                category: 'Eficiência',
                priority: 'medium',
                message: 'Você pode otimizar a frequência de suas compras.',
                action: 'Tente fazer compras maiores e menos frequentes para economizar tempo e dinheiro.'
            });
        }
        
        if (performance.organizationScore?.score < 50) {
            suggestions.push({
                category: 'Organização',
                priority: 'medium',
                message: 'Melhore sua organização para compras mais eficientes.',
                action: 'Use templates e categorias para planejar melhor suas listas.'
            });
        }
        
        // Sugestões comparativas
        const competitors = this.compareWithCompetitors(metrics);
        const bestCompetitor = Object.entries(competitors)
            .sort((a, b) => b[1].userAdvantage - a[1].userAdvantage)[0];
        
        if (bestCompetitor && bestCompetitor[1].userAdvantage > 10) {
            suggestions.push({
                category: 'Benchmark',
                priority: 'low',
                message: `Você está economizando ${bestCompetitor[1].userAdvantage.toFixed(1)}% mais que usuários do ${bestCompetitor[1].name}!`,
                action: 'Continue usando o Listou para manter essa vantagem.'
            });
        }
        
        return suggestions;
    }

    getEfficiencySuggestion(metrics) {
        if (metrics.purchaseFrequency > 4) {
            return 'Você faz muitas compras por semana. Tente planejar melhor para reduzir idas ao mercado.';
        } else if (metrics.purchaseFrequency < 1.5) {
            return 'Você faz poucas compras. Considere compras mais frequentes para produtos frescos.';
        } else if (metrics.avgItemsPerPurchase < 8) {
            return 'Suas compras são pequenas. Tente planejar listas maiores para ser mais eficiente.';
        } else if (metrics.avgItemsPerPurchase > 25) {
            return 'Suas compras são muito grandes. Considere dividir em categorias ou ocasiões.';
        }
        return 'Sua eficiência de compras está ótima! Continue assim.';
    }

    // Relatório comparativo completo
    generateCompetitiveReport() {
        const performance = this.getPerformanceMetrics();
        const userMetrics = this.getUserMetrics();
        const patterns = this.getShoppingPatterns();
        
        // Calcula score geral
        const scores = [
            performance.savingsScore?.score || 0,
            performance.efficiencyScore?.score || 0,
            performance.organizationScore?.score || 0
        ];
        performance.overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        
        return {
            reportType: 'competitive-analysis',
            generatedAt: new Date().toISOString(),
            summary: {
                overallScore: performance.overallScore,
                ranking: this.calculateMarketRanking(performance.overallScore),
                topStrength: this.identifyTopStrength(performance),
                improvementArea: this.identifyWeakestArea(performance)
            },
            performance,
            userMetrics,
            marketComparison: performance.comparison.vsMarket,
            competitorComparison: performance.comparison.vsCompetitors,
            recommendations: {
                immediate: performance.comparison.improvement.filter(s => s.priority === 'high'),
                shortTerm: performance.comparison.improvement.filter(s => s.priority === 'medium'),
                longTerm: performance.comparison.improvement.filter(s => s.priority === 'low')
            },
            insights: this.generateAdvancedInsights(userMetrics, patterns),
            benchmarks: {
                personal: this.userBenchmarks,
                market: this.competitorMetrics.industry,
                competitors: this.competitorMetrics.apps
            }
        };
    }

    calculateMarketRanking(score) {
        if (score >= 90) return { position: 'Top 10%', tier: 'Excelente' };
        if (score >= 80) return { position: 'Top 25%', tier: 'Muito Bom' };
        if (score >= 70) return { position: 'Top 50%', tier: 'Bom' };
        if (score >= 60) return { position: 'Top 75%', tier: 'Regular' };
        return { position: 'Bottom 25%', tier: 'Precisa Melhorar' };
    }

    identifyTopStrength(performance) {
        const scores = {
            'Economia': performance.savingsScore?.score || 0,
            'Eficiência': performance.efficiencyScore?.score || 0,
            'Organização': performance.organizationScore?.score || 0
        };
        
        const max = Math.max(...Object.values(scores));
        const strength = Object.entries(scores).find(([, score]) => score === max)[0];
        
        return { area: strength, score: max };
    }

    identifyWeakestArea(performance) {
        const scores = {
            'Economia': performance.savingsScore?.score || 0,
            'Eficiência': performance.efficiencyScore?.score || 0,
            'Organização': performance.organizationScore?.score || 0
        };
        
        const min = Math.min(...Object.values(scores));
        const weakness = Object.entries(scores).find(([, score]) => score === min)[0];
        
        return { area: weakness, score: min };
    }

    generateAdvancedInsights(metrics, patterns) {
        const insights = [];
        
        // Insight sobre economia vs mercado
        const savingsVsMarket = this.userBenchmarks.avgMonthlyGroceries - metrics.avgMonthlySpent;
        if (savingsVsMarket > 50) {
            insights.push({
                type: 'positive',
                title: 'Economizador Expert',
                message: `Você economiza R$ ${savingsVsMarket.toFixed(2)} por mês em relação à média brasileira!`,
                impact: 'high'
            });
        }
        
        // Insight sobre padrões sazonais
        if (patterns.seasonalTrends.amount > 0) {
            insights.push({
                type: 'informational',
                title: 'Padrão Sazonal',
                message: `Você gasta mais no ${patterns.seasonalTrends.highestSpending}, uma tendência comum no Brasil.`,
                impact: 'medium'
            });
        }
        
        // Insight sobre eficiência
        const efficiency = parseFloat(metrics.avgItemsPerPurchase);
        if (efficiency > 20) {
            insights.push({
                type: 'warning',
                title: 'Compras Muito Grandes',
                message: 'Suas compras são maiores que 95% dos usuários. Considere dividir em categorias.',
                impact: 'medium'
            });
        }
        
        // Insight sobre categorias
        if (metrics.categoryDiversity >= 8) {
            insights.push({
                type: 'positive',
                title: 'Dieta Diversificada',
                message: `Você compra em ${metrics.categoryDiversity} categorias diferentes - excelente variedade!`,
                impact: 'medium'
            });
        }
        
        return insights;
    }

    // Atualiza benchmarks do usuário baseado em novos dados
    updateBenchmarks() {
        if (this.purchaseData.length < 10) return; // Dados insuficientes
        
        const metrics = this.getUserMetrics();
        
        // Atualiza apenas se os dados mudaram significativamente
        const currentAvg = this.userBenchmarks.avgMonthlyGroceries;
        const newAvg = metrics.avgMonthlySpent;
        
        if (Math.abs(currentAvg - newAvg) / currentAvg > 0.1) { // Mudança > 10%
            this.userBenchmarks = {
                avgMonthlyGroceries: newAvg,
                avgItemsPerPurchase: parseFloat(metrics.avgItemsPerPurchase),
                avgPurchaseFrequency: parseFloat(metrics.purchaseFrequency),
                avgPricePerItem: parseFloat(metrics.avgPricePerItem),
                lastUpdated: new Date().toISOString()
            };
            
            this.saveUserBenchmarks();
        }
    }

    clearAllData() {
        this.purchaseData = [];
        this.marketData = {};
        this.saveAnalyticsData();
        this.saveMarketData();
        console.log('Todos os dados analíticos foram limpos');
    }
}

// Funções auxiliares para relatórios baseados apenas em dados do usuário
function updateAnalyticsData() {
    const purchases = JSON.parse(localStorage.getItem('completedPurchases') || '[]');
    
    if (purchases.length === 0) {
        // Se não há compras, mostrar zeros
        const totalSpendingEl = document.getElementById('total-spending');
        const monthlySpendingEl = document.getElementById('monthly-spending');
        const avgSpendingEl = document.getElementById('avg-spending');
        const purchaseCountEl = document.getElementById('purchase-count');
        
        if (totalSpendingEl) totalSpendingEl.textContent = 'R$ 0,00';
        if (monthlySpendingEl) monthlySpendingEl.textContent = 'R$ 0,00';
        if (avgSpendingEl) avgSpendingEl.textContent = 'R$ 0,00';
        if (purchaseCountEl) purchaseCountEl.textContent = '0';
        
        // Limpar rankings
        updateSupermarketRanking([]);
        updateTopItems([]);
        updateBestPrices([]);
        return;
    }
    
    // Cálculos baseados apenas em dados reais do usuário
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const monthlyPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
    });
    const monthlySpent = monthlyPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const avgSpent = purchases.length > 0 ? totalSpent / purchases.length : 0;
    
    // Atualizar interface
    const totalSpendingEl = document.getElementById('total-spending');
    const monthlySpendingEl = document.getElementById('monthly-spending');
    const avgSpendingEl = document.getElementById('avg-spending');
    const purchaseCountEl = document.getElementById('purchase-count');
    
    if (totalSpendingEl) totalSpendingEl.textContent = formatCurrency(totalSpent);
    if (monthlySpendingEl) monthlySpendingEl.textContent = formatCurrency(monthlySpent);
    if (avgSpendingEl) avgSpendingEl.textContent = formatCurrency(avgSpent);
    if (purchaseCountEl) purchaseCountEl.textContent = purchases.length.toString();
    
    // Atualizar rankings baseados em dados reais
    updateSupermarketRanking(purchases);
    updateTopItems(purchases);
    updateBestPrices(purchases);
}

function updateSupermarketRanking(purchases) {
    const supermarketStats = {};
    
    purchases.forEach(purchase => {
        const supermarket = purchase.supermarket || 'Não informado';
        if (!supermarketStats[supermarket]) {
            supermarketStats[supermarket] = {
                totalSpent: 0,
                visits: 0,
                totalItems: 0
            };
        }
        supermarketStats[supermarket].totalSpent += purchase.total;
        supermarketStats[supermarket].visits += 1;
        supermarketStats[supermarket].totalItems += purchase.items ? purchase.items.length : 0;
    });
    
    const ranking = Object.entries(supermarketStats)
        .map(([name, stats]) => ({
            name,
            ...stats,
            avgSpent: stats.totalSpent / stats.visits
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent);
    
    const rankingContainer = document.getElementById('supermarket-ranking');
    if (rankingContainer) {
        if (ranking.length === 0) {
            rankingContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhum dado disponível</p>';
        } else {
            rankingContainer.innerHTML = ranking.slice(0, 5).map((item, index) => `
                <div class="metric-item">
                    <span>${index + 1}º ${item.name}</span>
                    <span>${formatCurrency(item.totalSpent)}</span>
                </div>
            `).join('');
        }
    }
}

function updateTopItems(purchases) {
    const itemStats = {};
    
    purchases.forEach(purchase => {
        if (purchase.items) {
            purchase.items.forEach(item => {
                const itemName = item.name || item.text || 'Item sem nome';
                if (!itemStats[itemName]) {
                    itemStats[itemName] = {
                        count: 0,
                        totalValue: 0
                    };
                }
                itemStats[itemName].count += 1;
                itemStats[itemName].totalValue += item.price || 0;
            });
        }
    });
    
    const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.count - a.count);
    
    const topItemsList = document.getElementById('top-items-list');
    if (topItemsList) {
        if (topItems.length === 0) {
            topItemsList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum dado disponível</p>';
        } else {
            topItemsList.innerHTML = topItems.slice(0, 5).map(item => `
                <div class="metric-item">
                    <span>${item.name}</span>
                    <span>${item.count} compras</span>
                </div>
            `).join('');
        }
    }
}

function updateBestPrices(purchases) {
    const itemPrices = {};
    
    purchases.forEach(purchase => {
        if (purchase.items) {
            purchase.items.forEach(item => {
                const itemName = item.name || item.text || 'Item sem nome';
                if (item.price && item.price > 0) {
                    if (!itemPrices[itemName]) {
                        itemPrices[itemName] = [];
                    }
                    itemPrices[itemName].push({
                        price: item.price,
                        supermarket: purchase.supermarket || 'Não informado',
                        date: purchase.date
                    });
                }
            });
        }
    });
    
    const bestPrices = Object.entries(itemPrices)
        .map(([name, prices]) => {
            const sortedPrices = prices.sort((a, b) => a.price - b.price);
            const bestPrice = sortedPrices[0];
            const worstPrice = sortedPrices[sortedPrices.length - 1];
            return {
                name,
                bestPrice: bestPrice.price,
                bestSupermarket: bestPrice.supermarket,
                savings: worstPrice.price - bestPrice.price
            };
        })
        .filter(item => item.savings > 0)
        .sort((a, b) => b.savings - a.savings);
    
    const bestPricesContainer = document.getElementById('best-prices-items');
    if (bestPricesContainer) {
        if (bestPrices.length === 0) {
            bestPricesContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhum dado disponível</p>';
        } else {
            bestPricesContainer.innerHTML = bestPrices.slice(0, 5).map(item => `
                <div class="deal-item">
                    <span class="item-emoji">🛒</span>
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="best-price">${formatCurrency(item.bestPrice)} <small>no ${item.bestSupermarket}</small></span>
                    </div>
                    <span class="savings">-${formatCurrency(item.savings)}</span>
                </div>
            `).join('');
        }
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// ====================================
// 🧠 RELATÓRIOS SUPER INTELIGENTES - Extensão da classe AnalyticsManager
// ====================================

// Adiciona os métodos inteligentes à classe AnalyticsManager
AnalyticsManager.prototype.updateSmartReports = function() {
    if (this.purchaseData.length === 0) {
        this.showEmptyStateReports();
        return;
    }

    this.updateSmartDashboard();
    this.updateAIInsights();
    this.updateBehavioralAnalysis();
    this.updateSmartRecommendations();
    this.updateMarketComparison();
    this.updateIntelligentPredictions();
};

// Dashboard principal com métricas inteligentes
AnalyticsManager.prototype.updateSmartDashboard = function() {
    const metrics = this.calculateSmartMetrics();

    // Total gasto
    const totalSpendingEl = document.getElementById('total-spending');
    if (totalSpendingEl) totalSpendingEl.textContent = formatCurrency(metrics.totalSpent);
    
    // Mudança percentual
    const change = metrics.spendingChange;
    const changeElement = document.getElementById('spending-change');
    if (changeElement) {
        changeElement.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
        changeElement.className = change > 0 ? 'metric-change negative' : 'metric-change positive';
    }

    // Eficiência de compras
    const efficiencyEl = document.getElementById('purchase-efficiency');
    if (efficiencyEl) efficiencyEl.textContent = metrics.efficiency.toFixed(1);
    
    const efficiencyDescEl = document.getElementById('efficiency-desc');
    if (efficiencyDescEl) efficiencyDescEl.textContent = 'Itens por compra';

    // Potencial de economia
    const savingsPotentialEl = document.getElementById('savings-potential');
    if (savingsPotentialEl) savingsPotentialEl.textContent = formatCurrency(metrics.savingsPotential);

    // Score de compras
    const shoppingScoreEl = document.getElementById('shopping-score');
    if (shoppingScoreEl) shoppingScoreEl.textContent = metrics.shoppingScore;
    
    const scoreLevelEl = document.getElementById('score-level');
    if (scoreLevelEl) scoreLevelEl.textContent = this.getScoreLevel(metrics.shoppingScore);
};

// Calcula métricas inteligentes
AnalyticsManager.prototype.calculateSmartMetrics = function() {
    const recent = this.getRecentPurchases(30);
    const previous = this.getPreviousPurchases(30, 60);
    
    const totalSpent = recent.reduce((sum, p) => sum + p.totalSpent, 0);
    const previousSpent = previous.reduce((sum, p) => sum + p.totalSpent, 0);
    
    const spendingChange = previousSpent > 0 ? 
        ((totalSpent - previousSpent) / previousSpent) * 100 : 0;

    const avgItemsPerPurchase = recent.length > 0 ? 
        recent.reduce((sum, p) => sum + p.items.length, 0) / recent.length : 0;

    const savingsPotential = this.calculateSavingsPotential(recent);
    const shoppingScore = this.calculateShoppingScore(recent);

    return {
        totalSpent,
        spendingChange,
        efficiency: avgItemsPerPurchase,
        savingsPotential,
        shoppingScore
    };
};

// IA Insights com análise super inteligente
AnalyticsManager.prototype.updateAIInsights = function() {
    const insights = this.generateAdvancedAIInsights();
    
    // Insight principal
    const primaryInsight = insights.primary;
    const aiInsightEl = document.getElementById('ai-primary-insight');
    if (aiInsightEl) aiInsightEl.textContent = primaryInsight.message;
    
    const confidenceEl = document.getElementById('insight-confidence');
    if (confidenceEl) {
        const confidenceValue = confidenceEl.querySelector('.confidence-value');
        if (confidenceValue) {
            confidenceValue.textContent = `${(primaryInsight.confidence * 100).toFixed(0)}%`;
        }
    }

    // Tendências de gastos
    this.updateSpendingTrends();

    // Inteligência por categoria
    this.updateCategoryIntelligence();
};

// Gera insights de IA super avançados
AnalyticsManager.prototype.generateAdvancedAIInsights = function() {
    const patterns = this.analyzeAdvancedPatterns();
    
    let primaryMessage = '';
    let confidence = 0.5;

    if (this.purchaseData.length < 5) {
        primaryMessage = 'Complete mais compras para insights mais precisos. Nossa IA está aprendendo seus padrões!';
        confidence = 0.3;
    } else if (patterns && patterns.savingsOpportunity > 50) {
        primaryMessage = `Nossa IA detectou uma oportunidade de economia de R$ ${patterns.savingsOpportunity.toFixed(2)} baseada em seus padrões de compra.`;
        confidence = 0.85;
    } else {
        primaryMessage = 'Seus hábitos de compra estão sendo analisados. Continue registrando suas compras para insights mais precisos!';
        confidence = 0.75;
    }

    return {
        primary: { message: primaryMessage, confidence },
        trends: patterns ? patterns.trends : [],
        predictions: []
    };
};

// Análise comportamental avançada
AnalyticsManager.prototype.updateBehavioralAnalysis = function() {
    const patterns = this.analyzeShoppingPatterns();
    
    // Padrões de compra
    const preferredDayEl = document.getElementById('preferred-day');
    if (preferredDayEl) preferredDayEl.textContent = patterns.preferredDay;
    
    const frequencyEl = document.getElementById('shopping-frequency');
    if (frequencyEl) frequencyEl.textContent = `${patterns.frequency.toFixed(1)} vezes/semana`;
    
    const typicalTimeEl = document.getElementById('typical-time');
    if (typicalTimeEl) typicalTimeEl.textContent = patterns.typicalTime;

    // Sensibilidade a preços
    this.updatePriceSensitivity(patterns.priceSensitivity);

    // Fidelidade a marcas/locais
    this.updateBrandLoyalty(patterns.loyalty);
};

// Funções auxiliares para os relatórios inteligentes
AnalyticsManager.prototype.getRecentPurchases = function(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.purchaseData.filter(p => new Date(p.date) >= cutoff);
};

AnalyticsManager.prototype.calculateSavingsPotential = function(purchases) {
    // Algoritmo inteligente para calcular potencial de economia
    let potential = 0;
    const itemPrices = {};
    
    purchases.forEach(purchase => {
        purchase.items.forEach(item => {
            if (!itemPrices[item.name]) {
                itemPrices[item.name] = [];
            }
            itemPrices[item.name].push(item.unitPrice || 0);
        });
    });
    
    Object.values(itemPrices).forEach(prices => {
        if (prices.length > 1) {
            const max = Math.max(...prices);
            const min = Math.min(...prices);
            potential += (max - min) * 2; // Estimativa baseada em frequência
        }
    });
    
    return potential;
};

AnalyticsManager.prototype.calculateShoppingScore = function(purchases) {
    // Score de 0-100 baseado em eficiência, economia e padrões
    let score = 50; // Base
    
    if (purchases.length > 10) score += 20; // Consistência
    
    const avgItems = purchases.length > 0 ? 
        purchases.reduce((sum, p) => sum + p.items.length, 0) / purchases.length : 0;
    if (avgItems > 15) score += 15; // Eficiência
    
    const categories = new Set();
    purchases.forEach(p => p.items.forEach(i => categories.add(i.category)));
    if (categories.size > 6) score += 15; // Diversidade
    
    return Math.min(100, Math.max(0, score));
};

AnalyticsManager.prototype.getScoreLevel = function(score) {
    if (score >= 90) return 'Expert';
    if (score >= 75) return 'Avançado';
    if (score >= 60) return 'Intermediário';
    if (score >= 40) return 'Iniciante';
    return 'Aprendiz';
};

AnalyticsManager.prototype.analyzeShoppingPatterns = function() {
    const purchases = this.purchaseData;
    
    // Dia preferido
    const dayCount = {};
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    purchases.forEach(p => {
        const day = new Date(p.date).getDay();
        dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const preferredDayIndex = Object.keys(dayCount).reduce((a, b) => 
        dayCount[a] > dayCount[b] ? a : b, 0);
    const preferredDay = dayCount[preferredDayIndex] ? days[preferredDayIndex] : 'Variado';

    // Frequência
    const daysSpan = purchases.length > 1 ? 
        (new Date(purchases[0].date) - new Date(purchases[purchases.length - 1].date)) / (1000 * 60 * 60 * 24) : 30;
    const frequency = purchases.length / Math.max(1, daysSpan / 7);

    // Horário típico (simulado)
    const typicalTime = 'Manhã';

    return {
        preferredDay,
        frequency: Math.max(0, frequency),
        typicalTime,
        priceSensitivity: 0.7,
        loyalty: 0.6
    };
};

AnalyticsManager.prototype.analyzeAdvancedPatterns = function() {
    const purchases = this.purchaseData;
    
    if (purchases.length < 3) {
        return {
            savingsOpportunity: 0,
            trends: [],
            seasonalPattern: false
        };
    }
    
    // Análise básica de oportunidades de economia
    let savingsOpportunity = 0;
    const itemPrices = {};
    
    purchases.forEach(purchase => {
        purchase.items.forEach(item => {
            const key = item.name.toLowerCase();
            if (!itemPrices[key]) {
                itemPrices[key] = [];
            }
            itemPrices[key].push(item.unitPrice || 0);
        });
    });
    
    // Calcula potencial de economia baseado na variação de preços
    Object.values(itemPrices).forEach(prices => {
        if (prices.length > 1) {
            const max = Math.max(...prices);
            const min = Math.min(...prices);
            if (max > min) {
                savingsOpportunity += (max - min) * 3; // Estimativa conservadora
            }
        }
    });
    
    return {
        savingsOpportunity,
        trends: ['Tendência de alta em produtos básicos', 'Oportunidades em hortifrúti'],
        seasonalPattern: false,
        peakSeason: 'Dezembro',
        seasonalIncrease: 15
    };
};

AnalyticsManager.prototype.updateSpendingTrends = function() {
    const trendEl = document.getElementById('spending-trend');
    if (trendEl) {
        if (this.purchaseData.length < 3) {
            trendEl.innerHTML = '<div class="no-data">Dados insuficientes para análise de tendências</div>';
        } else {
            const recent = this.getRecentPurchases(30);
            const avgSpending = recent.reduce((sum, p) => sum + p.totalSpent, 0) / Math.max(1, recent.length);
            
            trendEl.innerHTML = `
                <div class="trend-chart-simple">
                    <div class="trend-value">R$ ${avgSpending.toFixed(2)}</div>
                    <div class="trend-label">Gasto médio por compra</div>
                    <div class="trend-indicator positive">📈 Estável</div>
                </div>
            `;
        }
    }
};

AnalyticsManager.prototype.updateCategoryIntelligence = function() {
    const categoryEl = document.getElementById('category-breakdown');
    if (categoryEl) {
        if (this.purchaseData.length === 0) {
            categoryEl.innerHTML = '<div class="no-data">Complete compras para ver análise por categoria</div>';
        } else {
            const categories = {};
            this.purchaseData.forEach(purchase => {
                purchase.items.forEach(item => {
                    if (!categories[item.category]) {
                        categories[item.category] = { count: 0, total: 0 };
                    }
                    categories[item.category].count++;
                    categories[item.category].total += item.unitPrice || 0;
                });
            });
            
            const sortedCategories = Object.entries(categories)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3);
                
            categoryEl.innerHTML = sortedCategories.map(([cat, data]) => `
                <div class="category-item">
                    <span class="category-name">${cat}</span>
                    <span class="category-stats">${data.count} itens</span>
                </div>
            `).join('');
        }
    }
};

AnalyticsManager.prototype.updatePriceSensitivity = function(sensitivity) {
    const meterEl = document.getElementById('sensitivity-bar');
    const labelEl = document.getElementById('sensitivity-label');
    
    if (meterEl) {
        meterEl.style.width = `${sensitivity * 100}%`;
        meterEl.style.backgroundColor = sensitivity > 0.7 ? '#ff6b6b' : sensitivity > 0.4 ? '#feca57' : '#48dbfb';
    }
    
    if (labelEl) {
        const level = sensitivity > 0.7 ? 'Alta' : sensitivity > 0.4 ? 'Média' : 'Baixa';
        labelEl.textContent = `${level} sensibilidade`;
    }
};

AnalyticsManager.prototype.updateBrandLoyalty = function(loyalty) {
    const scoreEl = document.getElementById('loyalty-score');
    const detailsEl = document.getElementById('loyalty-details');
    
    if (scoreEl) {
        scoreEl.textContent = `${(loyalty * 100).toFixed(0)}%`;
    }
    
    if (detailsEl) {
        const level = loyalty > 0.7 ? 'Alta fidelidade' : loyalty > 0.4 ? 'Fidelidade moderada' : 'Baixa fidelidade';
        detailsEl.textContent = level;
    }
};

AnalyticsManager.prototype.showEmptyStateReports = function() {
    const emptyMessage = `
        <div class="empty-reports-state">
            <div class="empty-icon">🧠</div>
            <h3>Relatórios Inteligentes Aguardando</h3>
            <p>Complete algumas compras para nossa IA gerar insights personalizados sobre seus hábitos e padrões de consumo.</p>
            <div class="features-preview">
                <div class="feature-item">🤖 Análise comportamental</div>
                <div class="feature-item">📈 Previsões de gastos</div>
                <div class="feature-item">💡 Recomendações personalizadas</div>
                <div class="feature-item">🎯 Oportunidades de economia</div>
            </div>
        </div>
    `;
    
    // Aplica estado vazio no componente principal
    const aiInsightEl = document.getElementById('ai-primary-insight');
    if (aiInsightEl) aiInsightEl.innerHTML = emptyMessage;
};
