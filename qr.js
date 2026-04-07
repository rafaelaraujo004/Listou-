// qr.js - Sistema de leitura de QRCode com jsQR
// Funcionalidades: Escaneamento de QR codes de notas fiscais NFC-e
// Biblioteca: jsQR (via CDN)

let qrStream = null;
let qrVideoElement = null;
let qrCanvasElement = null;
let qrCanvasContext = null;

// Função principal para escanear QR code
export async function scanQRCode() {
    try {
        // Verificar se jsQR está disponível
        if (typeof jsQR === 'undefined') {
            alert('❌ Erro: Biblioteca jsQR não carregada.\n\nVerifique sua conexão com a internet.');
            return;
        }

        // Verificar se o navegador suporta getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('❌ Erro: Seu navegador não suporta acesso à câmera.\n\nTente usar um navegador mais recente.');
            return;
        }

        // Criar modal para o scanner
        createQRScannerModal();
        
        // Iniciar câmera
        await startCamera();
        
    } catch (error) {
        console.error('Erro ao iniciar scanner QR:', error);
        alert('❌ Erro ao acessar a câmera:\n\n' + error.message);
        closeQRScanner();
    }
}

// Criar interface do scanner
function createQRScannerModal() {
    // Remover modal existente se houver
    const existingModal = document.getElementById('qr-scanner-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'qr-scanner-modal';
    modal.className = 'qr-scanner-modal';
    
    modal.innerHTML = `
        <div class="qr-scanner-content">
            <div class="qr-scanner-header">
                <h3>📱 Escanear QR Code</h3>
                <button id="qr-scanner-close" class="qr-scanner-close">×</button>
            </div>
            <div class="qr-scanner-body">
                <div class="qr-scanner-area">
                    <video id="qr-scanner-video" playsinline></video>
                    <canvas id="qr-scanner-canvas" style="display: none;"></canvas>
                    <div class="qr-scanner-overlay">
                        <div class="qr-scanner-frame"></div>
                    </div>
                </div>
                <div class="qr-scanner-instructions">
                    <p>📋 Posicione o QR code da nota fiscal dentro da área destacada</p>
                    <p class="qr-scanner-status">🔍 Procurando QR code...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('qr-scanner-close').addEventListener('click', closeQRScanner);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQRScanner();
    });
    
    // Elementos para escaneamento
    qrVideoElement = document.getElementById('qr-scanner-video');
    qrCanvasElement = document.getElementById('qr-scanner-canvas');
    qrCanvasContext = qrCanvasElement.getContext('2d');
}

// Iniciar câmera
async function startCamera() {
    try {
        qrStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment' // Câmera traseira
            }
        });
        
        qrVideoElement.srcObject = qrStream;
        qrVideoElement.play();
        
        qrVideoElement.addEventListener('loadedmetadata', () => {
            qrCanvasElement.width = qrVideoElement.videoWidth;
            qrCanvasElement.height = qrVideoElement.videoHeight;
            
            // Iniciar escaneamento
            requestAnimationFrame(scanFrame);
        });
        
    } catch (error) {
        throw new Error('Não foi possível acessar a câmera. Verifique as permissões.');
    }
}

// Escanear frame por frame
function scanFrame() {
    if (qrVideoElement.readyState === qrVideoElement.HAVE_ENOUGH_DATA) {
        qrCanvasContext.drawImage(qrVideoElement, 0, 0, qrCanvasElement.width, qrCanvasElement.height);
        const imageData = qrCanvasContext.getImageData(0, 0, qrCanvasElement.width, qrCanvasElement.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            // QR code detectado
            handleQRCodeDetected(code.data);
            return;
        }
    }
    
    // Continuar escaneamento se o modal ainda estiver aberto
    if (document.getElementById('qr-scanner-modal')) {
        requestAnimationFrame(scanFrame);
    }
}

// Processar QR code detectado
async function handleQRCodeDetected(qrData) {
    try {
        updateScannerStatus('✅ QR code detectado! Processando...');
        
        // Extrair URL da NFC-e
        const nfceUrl = extractNFCeUrl(qrData);
        
        if (nfceUrl) {
            // Tentar buscar dados da nota fiscal
            const items = await fetchNFCeData(nfceUrl);
            
            if (items && items.length > 0) {
                await importItemsFromNFCe(items);
                updateScannerStatus('🎉 ' + items.length + ' itens importados com sucesso!');
                
                setTimeout(() => {
                    closeQRScanner();
                    alert('✅ Importação concluída!\n\n' + items.length + ' itens foram adicionados à sua lista.');
                }, 1500);
            } else {
                updateScannerStatus('⚠️ Nenhum item encontrado na nota fiscal');
            }
        } else {
            updateScannerStatus('❌ QR code não é de uma nota fiscal NFC-e');
        }
        
    } catch (error) {
        console.error('Erro ao processar QR code:', error);
        updateScannerStatus('❌ Erro ao processar nota fiscal');
    }
}

// Extrair URL da NFC-e do QR code
function extractNFCeUrl(qrData) {
    // Padrão típico de QR code NFC-e
    const nfcePattern = /https?:\/\/.*\.fazenda\..*\/nfce\/qrcode/i;
    
    if (nfcePattern.test(qrData)) {
        return qrData;
    }
    
    // Tentar extrair URL se estiver em formato diferente
    const urlMatch = qrData.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch && urlMatch[1].includes('nfce')) {
        return urlMatch[1];
    }
    
    return null;
}

// Buscar dados da NFC-e (limitado por CORS)
async function fetchNFCeData(url) {
    try {
        // NOTA: Esta funcionalidade é limitada pelo CORS
        // Em um app mobile (Capacitor) seria possível fazer a requisição direta
        // Por enquanto, apenas simular dados para demonstração
        
        updateScannerStatus('⚠️ Simulando importação (limitação CORS)...');
        
        // Simular itens comuns de nota fiscal
        const simulatedItems = [
            { name: 'Arroz', price: 4.50, qty: 1, category: 'outros' },
            { name: 'Feijão', price: 8.90, qty: 1, category: 'outros' },
            { name: 'Açúcar', price: 3.20, qty: 1, category: 'outros' }
        ];
        
        return simulatedItems;
        
    } catch (error) {
        console.error('Erro ao buscar dados da NFC-e:', error);
        return null;
    }
}

// Importar itens da NFC-e para a lista
async function importItemsFromNFCe(items) {
    try {
        const { dbAddItem } = await import('./db.js');
        
        for (const item of items) {
            await dbAddItem({
                name: item.name,
                price: item.price || 0,
                qty: item.qty || 1,
                category: item.category || 'outros',
                bought: false,
                timestamp: Date.now()
            });
        }
        
        // Atualizar lista na interface
        if (window.refreshList) {
            window.refreshList();
        }
        
    } catch (error) {
        console.error('Erro ao importar itens:', error);
        throw error;
    }
}

// Atualizar status do scanner
function updateScannerStatus(message) {
    const statusElement = document.querySelector('.qr-scanner-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Fechar scanner
function closeQRScanner() {
    // Parar stream da câmera
    if (qrStream) {
        qrStream.getTracks().forEach(track => track.stop());
        qrStream = null;
    }
    
    // Remover modal
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) {
        modal.remove();
    }
    
    // Limpar referências
    qrVideoElement = null;
    qrCanvasElement = null;
    qrCanvasContext = null;
}
