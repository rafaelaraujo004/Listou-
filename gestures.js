// gestures.js - Sistema de gestos touch para melhor UX
// Baseado em padrões de apps como Bring!, AnyList e Todoist

class GestureManager {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.currentElement = null;
        this.swipeThreshold = 80;
        this.timeThreshold = 300;
        this.init();
    }

    init() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Long press para seleção múltipla
        document.addEventListener('touchstart', this.handleLongPressStart.bind(this));
        document.addEventListener('touchend', this.handleLongPressEnd.bind(this));
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();
        this.currentElement = e.target.closest('.list-item');
    }

    handleTouchMove(e) {
        if (!this.currentElement) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Se movimento vertical é maior que horizontal, não é swipe horizontal
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return;
        }

        // Previne scroll durante swipe horizontal
        if (Math.abs(deltaX) > 10) {
            e.preventDefault();
        }

        // Aplica transformação visual
        if (Math.abs(deltaX) > 20) {
            this.currentElement.style.transform = `translateX(${deltaX}px)`;
            this.currentElement.style.transition = 'none';
            
            // Mostra feedback visual
            this.showSwipeFeedback(deltaX);
        }
    }

    handleTouchEnd(e) {
        if (!this.currentElement) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        // Reset visual
        this.currentElement.style.transition = '';
        this.currentElement.style.transform = '';
        this.hideSwipeFeedback();

        // Verifica se é um swipe válido
        if (Math.abs(deltaX) > this.swipeThreshold && 
            Math.abs(deltaY) < 50 && 
            deltaTime < this.timeThreshold) {
            
            if (deltaX > 0) {
                this.handleSwipeRight(this.currentElement);
            } else {
                this.handleSwipeLeft(this.currentElement);
            }
        }

        this.currentElement = null;
    }

    handleSwipeLeft(element) {
        // Swipe left: marcar como comprado ou remover
        const itemId = element.dataset.itemId;
        if (itemId) {
            // Adiciona animação de confirmação
            element.classList.add('swipe-left-action');
            setTimeout(() => {
                // Trigger evento customizado para o app principal
                document.dispatchEvent(new CustomEvent('itemSwipeLeft', { detail: { itemId } }));
                element.classList.remove('swipe-left-action');
            }, 200);
        }
    }

    handleSwipeRight(element) {
        // Swipe right: marcar como não comprado ou adicionar aos favoritos
        const itemId = element.dataset.itemId;
        if (itemId) {
            element.classList.add('swipe-right-action');
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('itemSwipeRight', { detail: { itemId } }));
                element.classList.remove('swipe-right-action');
            }, 200);
        }
    }

    showSwipeFeedback(deltaX) {
        const feedbackLeft = document.querySelector('.swipe-feedback-left');
        const feedbackRight = document.querySelector('.swipe-feedback-right');
        
        if (deltaX > 0 && feedbackRight) {
            feedbackRight.style.opacity = Math.min(Math.abs(deltaX) / this.swipeThreshold, 1);
        } else if (deltaX < 0 && feedbackLeft) {
            feedbackLeft.style.opacity = Math.min(Math.abs(deltaX) / this.swipeThreshold, 1);
        }
    }

    hideSwipeFeedback() {
        const feedbacks = document.querySelectorAll('.swipe-feedback-left, .swipe-feedback-right');
        feedbacks.forEach(feedback => {
            feedback.style.opacity = '0';
        });
    }

    // Long press para seleção múltipla
    handleLongPressStart(e) {
        if (!e.target.closest('.list-item')) return;
        
        this.longPressTimer = setTimeout(() => {
            const element = e.target.closest('.list-item');
            if (element) {
                element.classList.add('selecting');
                navigator.vibrate && navigator.vibrate(50); // Feedback háptico
                document.dispatchEvent(new CustomEvent('itemLongPress', { 
                    detail: { itemId: element.dataset.itemId } 
                }));
            }
        }, 500);
    }

    handleLongPressEnd(e) {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }
}

// Pull-to-refresh
class PullToRefresh {
    constructor(container, onRefresh) {
        this.container = container;
        this.onRefresh = onRefresh;
        this.startY = 0;
        this.currentY = 0;
        this.isRefreshing = false;
        this.threshold = 80;
        this.init();
    }

    init() {
        this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
        this.container.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleEnd.bind(this), { passive: true });
    }

    handleStart(e) {
        if (this.container.scrollTop === 0 && !this.isRefreshing) {
            this.startY = e.touches[0].clientY;
        }
    }

    handleMove(e) {
        if (this.startY === 0) return;

        this.currentY = e.touches[0].clientY;
        const distance = this.currentY - this.startY;

        if (distance > 0 && this.container.scrollTop === 0) {
            e.preventDefault();
            const pullDistance = Math.min(distance * 0.5, this.threshold);
            this.container.style.transform = `translateY(${pullDistance}px)`;
            
            // Visual feedback
            const refreshIndicator = document.querySelector('.refresh-indicator');
            if (refreshIndicator) {
                refreshIndicator.style.opacity = pullDistance / this.threshold;
                if (pullDistance >= this.threshold) {
                    refreshIndicator.classList.add('ready');
                } else {
                    refreshIndicator.classList.remove('ready');
                }
            }
        }
    }

    handleEnd(e) {
        const distance = this.currentY - this.startY;
        
        if (distance >= this.threshold && !this.isRefreshing) {
            this.isRefreshing = true;
            this.container.style.transform = `translateY(${this.threshold}px)`;
            this.container.style.transition = 'transform 0.3s ease';
            
            // Trigger refresh
            this.onRefresh().finally(() => {
                setTimeout(() => {
                    this.container.style.transform = '';
                    this.container.style.transition = '';
                    this.isRefreshing = false;
                    const refreshIndicator = document.querySelector('.refresh-indicator');
                    if (refreshIndicator) {
                        refreshIndicator.style.opacity = '0';
                        refreshIndicator.classList.remove('ready');
                    }
                }, 300);
            });
        } else {
            this.container.style.transform = '';
            this.container.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                this.container.style.transition = '';
            }, 300);
        }

        this.startY = 0;
        this.currentY = 0;
    }
}

// Feedback háptico
class HapticFeedback {
    static light() {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    static medium() {
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    static heavy() {
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }

    static success() {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    static error() {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

// Exporta para uso no app principal
export { GestureManager, PullToRefresh, HapticFeedback };
