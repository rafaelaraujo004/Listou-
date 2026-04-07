// Script para popular dados de demonstração dos supermercados
// Execute este script no console do navegador para testar as funcionalidades

function populateSupermarketDemoData() {
    console.log('🏪 Populando dados de demonstração dos supermercados...');
    
    // Dados fictícios de compras em diferentes supermercados
    const demoSupermarkets = [
        'Atacadão',
        'Walmart', 
        'Extra',
        'Pão de Açúcar',
        'Carrefour'
    ];

    // Produtos comuns com preços variados por supermercado
    const commonProducts = [
        { name: 'Leite Integral 1L', category: 'Laticínios', basePrice: 5.50 },
        { name: 'Pão de Forma', category: 'Padaria', basePrice: 4.20 },
        { name: 'Banana Nanica kg', category: 'Frutas', basePrice: 4.19 },
        { name: 'Arroz 5kg', category: 'Grãos', basePrice: 18.90 },
        { name: 'Feijão Preto 1kg', category: 'Grãos', basePrice: 7.50 },
        { name: 'Óleo de Soja 900ml', category: 'Condimentos', basePrice: 8.90 },
        { name: 'Açúcar Cristal 1kg', category: 'Condimentos', basePrice: 4.80 },
        { name: 'Café em Pó 500g', category: 'Bebidas', basePrice: 12.50 },
        { name: 'Peito de Frango kg', category: 'Carnes', basePrice: 14.90 },
        { name: 'Ovos Brancos Dúzia', category: 'Laticínios', basePrice: 8.50 }
    ];

    // Multipliers para diferentes supermercados (simula variação de preços)
    const priceMultipliers = {
        'Atacadão': 0.85,      // 15% mais barato
        'Walmart': 0.92,       // 8% mais barato  
        'Extra': 0.98,         // 2% mais barato
        'Carrefour': 1.05,     // 5% mais caro
        'Pão de Açúcar': 1.15  // 15% mais caro
    };

    // Limpa dados existentes
    localStorage.removeItem('listou-market-data');
    localStorage.removeItem('listou-analytics');
    localStorage.removeItem('listou-known-supermarkets');

    // Cria instância do analytics se não existir
    if (typeof AnalyticsManager === 'undefined') {
        console.error('❌ AnalyticsManager não encontrado. Certifique-se de que analytics.js está carregado.');
        return;
    }

    const analytics = new AnalyticsManager();
    
    // Gera compras históricas dos últimos 3 meses
    const today = new Date();
    const purchases = [];
    
    for (let i = 0; i < 90; i++) { // 90 dias
        const purchaseDate = new Date(today);
        purchaseDate.setDate(today.getDate() - i);
        
        // 30% de chance de fazer compra em um dia específico
        if (Math.random() > 0.7) continue;
        
        // Escolhe supermercado aleatório
        const supermarket = demoSupermarkets[Math.floor(Math.random() * demoSupermarkets.length)];
        const multiplier = priceMultipliers[supermarket];
        
        // Escolhe 3-8 produtos aleatórios
        const numProducts = 3 + Math.floor(Math.random() * 6);
        const selectedProducts = [...commonProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, numProducts);
        
        const items = selectedProducts.map(product => {
            const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 unidades
            const price = product.basePrice * multiplier * (0.9 + Math.random() * 0.2); // ±10% variação
            
            return {
                name: product.name,
                category: product.category,
                qty: quantity,
                price: Math.round(price * 100) / 100 // Arredonda para 2 casas decimais
            };
        });
        
        const totalSpent = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        // Registra a compra com data específica
        const purchase = {
            id: Date.now() + i,
            date: purchaseDate.toISOString(),
            items: items.map(item => ({
                name: item.name,
                category: item.category,
                quantity: item.qty,
                unitPrice: item.price,
                totalPrice: item.price * item.qty
            })),
            totalSpent: Math.round(totalSpent * 100) / 100,
            location: null,
            supermarket: supermarket,
            dayOfWeek: purchaseDate.getDay(),
            month: purchaseDate.getMonth(),
            season: getSeason(purchaseDate)
        };
        
        purchases.push(purchase);
        
        // Simula registro no analytics
        analytics.updateSupermarketPricing(purchase);
    }
    
    // Salva compras no analytics
    analytics.purchaseData = purchases;
    analytics.saveAnalyticsData();
    
    // Salva lista de supermercados conhecidos
    localStorage.setItem('listou-known-supermarkets', JSON.stringify(demoSupermarkets));
    
    console.log('✅ Dados de demonstração criados com sucesso!');
    console.log(`📊 ${purchases.length} compras registradas em ${demoSupermarkets.length} supermercados`);
    console.log('🔄 Recarregue a página e vá para a aba "Relatórios" para ver os dados');
    
    return {
        purchases: purchases.length,
        supermarkets: demoSupermarkets.length,
        analytics: analytics.generateSupermarketComparisonReport()
    };
}

function getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'outono';
    if (month >= 5 && month <= 7) return 'inverno';
    if (month >= 8 && month <= 10) return 'primavera';
    return 'verão';
}

// Função para limpar dados demo
function clearDemoData() {
    localStorage.removeItem('listou-market-data');
    localStorage.removeItem('listou-analytics');
    localStorage.removeItem('listou-known-supermarkets');
    localStorage.removeItem('listou-current-supermarket');
    console.log('🧹 Dados de demonstração limpos');
}

// Exporta funções para o escopo global
window.populateSupermarketDemoData = populateSupermarketDemoData;
window.clearDemoData = clearDemoData;

console.log('📝 Script de demonstração carregado!');
console.log('🚀 Execute: populateSupermarketDemoData() para criar dados de teste');
console.log('🧹 Execute: clearDemoData() para limpar dados de teste');
