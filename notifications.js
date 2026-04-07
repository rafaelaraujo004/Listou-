// notifications.js - Sistema de notificações e lembretes inteligentes
// Funcionalidades: lembretes de compra, notificações push, alertas de preço

export class NotificationManager {
    constructor() {
        this.reminders = this.loadReminders();
        this.notificationQueue = [];
        this.setupNotificationPermission();
    }

    loadReminders() {
        try {
            return JSON.parse(localStorage.getItem('listou-reminders') || '[]');
        } catch {
            return [];
        }
    }

    saveReminders() {
        localStorage.setItem('listou-reminders', JSON.stringify(this.reminders));
    }

    // Solicita permissão para notificações
    async setupNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                this.showInAppNotification(
                    permission === 'granted' ? 
                    'Notificações ativadas! Você receberá lembretes.' : 
                    'Notificações não ativadas. Você pode ativar nas configurações.',
                    permission === 'granted' ? 'success' : 'info'
                );
            } catch (error) {
                console.log('Navegador não suporta notificações');
            }
        }
    }

    // Mostra notificação no app
    showInAppNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove automaticamente
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Envia notificação push
    sendPushNotification(title, body, icon = '/icon-192.png') {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon,
                badge: icon,
                requireInteraction: false,
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            setTimeout(() => notification.close(), 5000);
        }
    }

    // Cria lembrete
    createReminder(type, data, scheduledFor) {
        const reminder = {
            id: Date.now(),
            type, // 'shopping', 'item-price', 'weekly-shopping', 'custom'
            data,
            scheduledFor: new Date(scheduledFor).toISOString(),
            createdAt: new Date().toISOString(),
            active: true,
            executed: false
        };

        this.reminders.push(reminder);
        this.saveReminders();
        
        this.scheduleReminder(reminder);
        return reminder;
    }

    // Agenda lembrete
    scheduleReminder(reminder) {
        const now = new Date();
        const scheduledTime = new Date(reminder.scheduledFor);
        const delay = scheduledTime.getTime() - now.getTime();

        if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Dentro de 24h
            setTimeout(() => {
                this.executeReminder(reminder);
            }, delay);
        }
    }

    // Executa lembrete
    executeReminder(reminder) {
        if (!reminder.active || reminder.executed) return;

        let title, body;

        switch (reminder.type) {
            case 'shopping':
                title = '🛒 Hora das compras!';
                body = `Você tem ${reminder.data.itemCount} itens na sua lista`;
                break;
            
            case 'item-price':
                title = '💰 Alerta de preço';
                body = `${reminder.data.itemName} pode estar em promoção!`;
                break;
            
            case 'weekly-shopping':
                title = '📅 Compra semanal';
                body = 'Não esqueça da sua compra semanal habitual';
                break;
            
            case 'custom':
                title = reminder.data.title || '🔔 Lembrete';
                body = reminder.data.message;
                break;
            
            default:
                title = '🔔 Lembrete do Listou';
                body = 'Você tem um lembrete pendente';
        }

        this.sendPushNotification(title, body);
        this.showInAppNotification(`${title}: ${body}`, 'info', 6000);

        // Marca como executado
        reminder.executed = true;
        this.saveReminders();
    }

    // Verifica lembretes pendentes
    checkPendingReminders() {
        const now = new Date();
        
        this.reminders
            .filter(r => r.active && !r.executed && new Date(r.scheduledFor) <= now)
            .forEach(reminder => this.executeReminder(reminder));
    }

    // Cria lembretes inteligentes baseados em padrões
    createSmartReminders(purchaseHistory) {
        const now = new Date();
        
        // Lembrete semanal baseado no histórico
        if (purchaseHistory.length > 0) {
            const averageDaysBetweenShopping = this.calculateAverageShoppingInterval(purchaseHistory);
            
            if (averageDaysBetweenShopping > 0) {
                const lastShopping = new Date(purchaseHistory[0].purchasedAt);
                const nextExpectedShopping = new Date(lastShopping);
                nextExpectedShopping.setDate(lastShopping.getDate() + averageDaysBetweenShopping);
                
                if (nextExpectedShopping > now) {
                    this.createReminder('weekly-shopping', {
                        lastShopping: lastShopping.toISOString()
                    }, nextExpectedShopping);
                }
            }
        }

        // Lembretes de itens frequentes que não estão na lista
        const frequentItems = this.getFrequentlyForgottenItems(purchaseHistory);
        frequentItems.forEach(item => {
            const reminderTime = new Date();
            reminderTime.setDate(reminderTime.getDate() + 7); // Uma semana
            
            this.createReminder('item-reminder', {
                itemName: item.name,
                message: `Você costuma comprar ${item.name}. Não esqueceu?`
            }, reminderTime);
        });
    }

    calculateAverageShoppingInterval(purchaseHistory) {
        if (purchaseHistory.length < 2) return 0;
        
        const intervals = [];
        for (let i = 1; i < purchaseHistory.length; i++) {
            const date1 = new Date(purchaseHistory[i - 1].purchasedAt);
            const date2 = new Date(purchaseHistory[i].purchasedAt);
            const diffDays = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
            intervals.push(diffDays);
        }
        
        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    getFrequentlyForgottenItems(purchaseHistory) {
        // Analisa itens que eram comprados frequentemente mas não aparecem recentemente
        const itemFrequency = {};
        const recentDays = 30;
        const now = new Date();
        
        purchaseHistory.forEach(purchase => {
            const purchaseDate = new Date(purchase.purchasedAt);
            const daysAgo = (now - purchaseDate) / (1000 * 60 * 60 * 24);
            
            if (!itemFrequency[purchase.name]) {
                itemFrequency[purchase.name] = { total: 0, recent: 0 };
            }
            
            itemFrequency[purchase.name].total++;
            if (daysAgo <= recentDays) {
                itemFrequency[purchase.name].recent++;
            }
        });
        
        return Object.entries(itemFrequency)
            .filter(([name, freq]) => freq.total >= 3 && freq.recent === 0)
            .map(([name]) => ({ name }))
            .slice(0, 3);
    }

    // Remove lembrete
    removeReminder(reminderId) {
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        this.saveReminders();
    }

    // Lista lembretes ativos
    getActiveReminders() {
        return this.reminders.filter(r => r.active && !r.executed);
    }

    // Configurações de notificação
    getNotificationSettings() {
        try {
            return JSON.parse(localStorage.getItem('listou-notification-settings') || '{}');
        } catch {
            return {};
        }
    }

    saveNotificationSettings(settings) {
        localStorage.setItem('listou-notification-settings', JSON.stringify(settings));
    }

    updateNotificationSettings(newSettings) {
        const current = this.getNotificationSettings();
        const updated = { ...current, ...newSettings };
        this.saveNotificationSettings(updated);
        return updated;
    }

    // Notificações de economia
    createSavingsNotification(savings) {
        if (savings.amount > 10) {
            this.showInAppNotification(
                `💰 Você pode economizar R$ ${savings.amount.toFixed(2)} ${savings.tip}`,
                'success',
                8000
            );
        }
    }

    // Sistema de conquistaes/badges
    checkAchievements(stats) {
        const achievements = [];

        // Badge: Primeira lista
        if (stats.totalLists === 1) {
            achievements.push({
                id: 'first-list',
                title: '📝 Primeira Lista',
                description: 'Você criou sua primeira lista!'
            });
        }

        // Badge: Organizador
        if (stats.totalItems >= 50) {
            achievements.push({
                id: 'organizer',
                title: '📋 Organizador',
                description: 'Você já adicionou 50 itens!'
            });
        }

        // Badge: Econômico
        if (stats.savingsGenerated >= 100) {
            achievements.push({
                id: 'saver',
                title: '💰 Econômico',
                description: 'Você já economizou R$ 100+'
            });
        }

        // Badge: Fiel
        if (stats.consecutiveDays >= 7) {
            achievements.push({
                id: 'loyal',
                title: '⭐ Usuário Fiel',
                description: '7 dias consecutivos usando o app!'
            });
        }

        achievements.forEach(achievement => {
            this.showInAppNotification(
                `🏆 Nova conquista: ${achievement.title}! ${achievement.description}`,
                'success',
                6000
            );
        });

        return achievements;
    }

    // Inicializa verificações periódicas
    startPeriodicChecks() {
        // Verifica lembretes a cada minuto
        setInterval(() => {
            this.checkPendingReminders();
        }, 60000);

        // Verifica conquistas a cada 5 minutos
        setInterval(() => {
            // Esta função seria chamada com stats atualizadas
            // this.checkAchievements(currentStats);
        }, 300000);
    }

    // Service Worker para notificações em background
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Erro ao registrar Service Worker:', error);
                });
        }
    }
}
