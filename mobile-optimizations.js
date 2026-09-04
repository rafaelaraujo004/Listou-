// mobile-optimizations.js - Otimizações específicas para dispositivos móveis

class MobileOptimizations {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = 'ontouchstart' in window;
        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.setupTouchOptimizations();
        this.setupViewportOptimizations();
        this.setupKeyboardOptimizations();
        this.setupScrollOptimizations();
        this.setupOrientationChange();
    }

    setupTouchOptimizations() {
        if (!this.isTouch) return;

        // Melhora a responsividade do touch em botões
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('button, .clickable, .item-actions button')) {
                e.target.style.transform = 'scale(0.95)';
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .clickable, .item-actions button')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            }
        }, { passive: true });

        // Previne o zoom duplo em inputs
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('input, select, textarea')) {
                e.preventDefault();
            }
        });
    }

    setupViewportOptimizations() {
        // Ajusta a altura da viewport para mobile
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 500);
        });
    }

    setupKeyboardOptimizations() {
        if (!this.isMobile) return;

        // Ajusta a interface quando o teclado virtual aparece
        let initialViewportHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;

            if (heightDifference > 150) {
                // Teclado provavelmente está aberto
                document.body.classList.add('keyboard-open');
                
                // Ajusta o scroll para manter o input visível
                const activeElement = document.activeElement;
                if (activeElement && activeElement.matches('input, textarea, select')) {
                    setTimeout(() => {
                        activeElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                }
            } else {
                // Teclado provavelmente está fechado
                document.body.classList.remove('keyboard-open');
            }
        });
    }

    setupScrollOptimizations() {
        // Scroll suave para mobile
        let ticking = false;

        const updateScrollDirection = () => {
            const scrollY = window.pageYOffset;
            const direction = scrollY > (this.lastScrollY || 0) ? 'down' : 'up';
            
            document.body.classList.toggle('scroll-down', direction === 'down');
            document.body.classList.toggle('scroll-up', direction === 'up');
            
            this.lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        }, { passive: true });
    }

    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Força um reflow após mudança de orientação
            setTimeout(() => {
                window.scrollTo(0, window.pageYOffset);
                
                // Fecha o sidebar se estiver aberto
                const sidebar = document.getElementById('sidebar');
                if (sidebar && sidebar.classList.contains('open')) {
                    // Usar a função closeSidebar() global se disponível
                    if (window.closeSidebar) {
                        window.closeSidebar();
                    } else {
                        sidebar.classList.remove('open');
                        // Mostra o botão novamente
                        const sidebarToggle = document.getElementById('sidebar-toggle');
                        if (sidebarToggle) {
                            sidebarToggle.classList.remove('hidden');
                        }
                    }
                }
            }, 500);
        });
    }

    // Método para otimizar performance de listas longas
    setupVirtualScrolling(container, itemHeight = 60) {
        if (!this.isMobile || !container) return;

        const items = container.children;
        const containerHeight = container.clientHeight;
        const visibleItems = Math.ceil(containerHeight / itemHeight) + 2;

        let startIndex = 0;

        const updateVisibleItems = () => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleItems, items.length);

            // Hide items outside visible range
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (i >= startIndex && i <= endIndex) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }
        };

        container.addEventListener('scroll', updateVisibleItems, { passive: true });
        updateVisibleItems();
    }

    // Método para melhorar performance de imagens
    setupLazyLoading() {
        if (!this.isMobile) return;

        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Método removido - usando apenas tema claro
}

// CSS adicional para otimizações mobile
const mobileCSS = `
    /* Altura da viewport móvel */
    .main-content {
        min-height: calc(var(--vh, 1vh) * 100);
    }

    /* Otimizações para teclado virtual */
    .keyboard-open .main-content {
        padding-bottom: 0;
    }

    .keyboard-open .sidebar {
        display: none;
    }

    /* Scroll direction indicators */
    .scroll-down .sidebar-toggle {
        transform: translateY(-100%);
        opacity: 0.7;
    }

    .scroll-up .sidebar-toggle {
        transform: translateY(0);
        opacity: 1;
    }

    /* Melhorias para touch feedback */
    @media (hover: none) and (pointer: coarse) {
        button:hover {
            transform: none;
        }
        
        button:active {
            transform: scale(0.95);
        }
        
        .shopping-item:hover {
            transform: none;
        }
    }

    /* Tema escuro removido - usando apenas tema claro */
`;

// Aplica o CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileCSS;
document.head.appendChild(styleSheet);

// Inicializa as otimizações quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileOptimizations = new MobileOptimizations();
    });
} else {
    window.mobileOptimizations = new MobileOptimizations();
}

export { MobileOptimizations };
