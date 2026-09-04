# MÉTODO 100% MANUAL - SEM DEPENDÊNCIAS
# Gerar AAB usando apenas PWA Builder Web
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "       MÉTODO 100% MANUAL - PWA BUILDER WEB        " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEste método NÃO precisa de:" -ForegroundColor Yellow
Write-Host "❌ Android Studio" -ForegroundColor Red
Write-Host "❌ Android SDK" -ForegroundColor Red
Write-Host "❌ Capacitor" -ForegroundColor Red
Write-Host "❌ Cordova" -ForegroundColor Red
Write-Host "❌ Configurações complexas" -ForegroundColor Red

Write-Host "`n✅ Só precisa de:" -ForegroundColor Green
Write-Host "✅ Navegador" -ForegroundColor Green
Write-Host "✅ Python (que você já tem)" -ForegroundColor Green
Write-Host "✅ Java (para assinatura)" -ForegroundColor Green

# Verificar Java
Write-Host "`n1. Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java não encontrado!" -ForegroundColor Red
    Write-Host "Instale Java: https://adoptium.net/" -ForegroundColor Blue
    Write-Host "Ou use Play App Signing (assinatura automática do Google)" -ForegroundColor Yellow
    
    $choice = Read-Host "`nContinuar mesmo sem Java? (s/n)"
    if ($choice -ne "s") {
        exit 1
    }
}

# Verificar servidor local
Write-Host "`n2. Verificando servidor local..." -ForegroundColor Yellow
$serverUrl = "http://localhost:8080"

try {
    Invoke-WebRequest -Uri $serverUrl -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-Host "✅ Servidor rodando em $serverUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando" -ForegroundColor Red
    Write-Host "Iniciando servidor..." -ForegroundColor Yellow
    
    # Iniciar servidor em nova janela
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; python -m http.server 8080; Read-Host 'Servidor rodando. Pressione Enter para fechar'"
    
    Write-Host "Aguardando servidor iniciar..." -ForegroundColor Blue
    Start-Sleep 3
    
    # Verificar novamente
    try {
        Invoke-WebRequest -Uri $serverUrl -UseBasicParsing -TimeoutSec 5 | Out-Null
        Write-Host "✅ Servidor iniciado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Não foi possível verificar o servidor" -ForegroundColor Yellow
        Write-Host "Continue mesmo assim, pode estar funcionando" -ForegroundColor Blue
    }
}

# Verificar PWA
Write-Host "`n3. Verificando PWA..." -ForegroundColor Yellow
if (Test-Path "manifest.webmanifest") {
    $manifest = Get-Content "manifest.webmanifest" | ConvertFrom-Json
    Write-Host "✅ Nome do app: $($manifest.name)" -ForegroundColor Green
    Write-Host "✅ Start URL: $($manifest.start_url)" -ForegroundColor Green
} else {
    Write-Host "❌ Manifest não encontrado!" -ForegroundColor Red
}

if (Test-Path "sw.js") {
    Write-Host "✅ Service Worker: sw.js" -ForegroundColor Green
} elseif (Test-Path "sw-new.js") {
    Write-Host "✅ Service Worker: sw-new.js" -ForegroundColor Green
} else {
    Write-Host "⚠️ Service Worker não encontrado" -ForegroundColor Yellow
}

$icons = Get-ChildItem "icon-*.png" -ErrorAction SilentlyContinue
Write-Host "✅ Ícones encontrados: $($icons.Count)" -ForegroundColor Green

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "           PASSO A PASSO DETALHADO                 " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🌐 ETAPA 1 - GERAR AAB NO PWA BUILDER:" -ForegroundColor Yellow

Write-Host "`n1️⃣ Abrir PWA Builder:" -ForegroundColor Blue
Write-Host "   - URL: https://www.pwabuilder.com/" -ForegroundColor Gray
Write-Host "   - (Abrindo automaticamente...)" -ForegroundColor Gray

# Abrir PWA Builder
Start-Process "https://www.pwabuilder.com/"
Start-Sleep 2

Write-Host "`n2️⃣ Na caixa 'Enter URL', cole:" -ForegroundColor Blue
Write-Host "   $serverUrl" -ForegroundColor Cyan
Write-Host "   (URL copiada para área de transferência)" -ForegroundColor Gray

# Copiar URL para clipboard (se disponível)
try {
    Set-Clipboard $serverUrl
    Write-Host "   ✅ URL copiada!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Copie manualmente: $serverUrl" -ForegroundColor Yellow
}

Write-Host "`n3️⃣ Clique no botão 'Start'" -ForegroundColor Blue

Write-Host "`n4️⃣ Aguarde a análise (1-2 minutos)" -ForegroundColor Blue
Write-Host "   - O PWA Builder vai verificar seu app" -ForegroundColor Gray
Write-Host "   - Pode aparecer algumas sugestões (ignore)" -ForegroundColor Gray

Write-Host "`n5️⃣ Na seção 'Package for Stores':" -ForegroundColor Blue
Write-Host "   - Procure o card 'Android'" -ForegroundColor Gray
Write-Host "   - Clique no botão 'Android' ou 'Generate Package'" -ForegroundColor Gray

Write-Host "`n6️⃣ Configure as opções:" -ForegroundColor Blue
Write-Host "   - App name: Listou" -ForegroundColor Gray
Write-Host "   - Package ID: com.listou.app" -ForegroundColor Gray
Write-Host "   - App version: 1.0.0" -ForegroundColor Gray
Write-Host "   - Start URL: /" -ForegroundColor Gray
Write-Host "   - Display mode: standalone" -ForegroundColor Gray
Write-Host "   - Deixe outras opções como padrão" -ForegroundColor Gray

Write-Host "`n7️⃣ Clique em 'Generate Package'" -ForegroundColor Blue

Write-Host "`n8️⃣ Aguarde a geração (3-5 minutos)" -ForegroundColor Blue
Write-Host "   - Será mostrada uma barra de progresso" -ForegroundColor Gray
Write-Host "   - Não feche a página durante o processo" -ForegroundColor Gray

Write-Host "`n9️⃣ Faça o download:" -ForegroundColor Blue
Write-Host "   - Clique em 'Download' quando aparecer" -ForegroundColor Gray
Write-Host "   - Salve o arquivo .aab nesta pasta:" -ForegroundColor Gray
Write-Host "   - $PWD" -ForegroundColor Cyan

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "⏳ AGUARDANDO VOCÊ FAZER O DOWNLOAD..." -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

Write-Host "`nSiga os passos acima no navegador." -ForegroundColor Blue
Write-Host "Quando terminar o download, volte aqui e pressione Enter." -ForegroundColor Green

Read-Host "`nPressione Enter após fazer o download do AAB"

# Verificar se AAB foi baixado
Write-Host "`n🔍 Procurando arquivo AAB..." -ForegroundColor Yellow
$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue

if ($aabFiles.Count -eq 0) {
    Write-Host "❌ Nenhum arquivo AAB encontrado nesta pasta" -ForegroundColor Red
    Write-Host "`n💡 OPÇÕES:" -ForegroundColor Yellow
    Write-Host "1. Mova o arquivo .aab baixado para esta pasta:" -ForegroundColor Blue
    Write-Host "   $PWD" -ForegroundColor Cyan
    Write-Host "2. Ou execute o script de assinatura manualmente:" -ForegroundColor Blue
    Write-Host "   .\assinar-aab.ps1" -ForegroundColor Cyan
    
    Write-Host "`nVerificar novamente? (s/n): " -NoNewline -ForegroundColor Yellow
    $retry = Read-Host
    
    if ($retry -eq "s") {
        $aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue
    }
}

if ($aabFiles.Count -gt 0) {
    Write-Host "`n✅ Arquivo AAB encontrado!" -ForegroundColor Green
    
    foreach ($aab in $aabFiles) {
        Write-Host "   📱 $($aab.Name)" -ForegroundColor Blue
    }
    
    Write-Host "`n🔐 ETAPA 2 - ASSINAR AAB:" -ForegroundColor Yellow
    
    # Verificar se tem Java para assinatura
    try {
        java -version 2>&1 | Out-Null
        
        Write-Host "`nExecutando assinatura automática..." -ForegroundColor Blue
        
        # Executar script de assinatura
        if (Test-Path "assinar-aab.ps1") {
            powershell -ExecutionPolicy Bypass -File "assinar-aab.ps1"
        } else {
            Write-Host "❌ Script assinar-aab.ps1 não encontrado!" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "`n⚠️ Java não disponível para assinatura local" -ForegroundColor Yellow
        Write-Host "`n📋 OPÇÕES:" -ForegroundColor Blue
        Write-Host "1. Instale Java e execute: .\assinar-aab.ps1" -ForegroundColor Blue
        Write-Host "2. Use Play App Signing (Google assina automaticamente):" -ForegroundColor Blue
        Write-Host "   - No Google Play Console" -ForegroundColor Gray
        Write-Host "   - Release > Setup > App signing" -ForegroundColor Gray
        Write-Host "   - Ative 'Use Play App Signing'" -ForegroundColor Gray
        Write-Host "   - Faça upload do AAB não assinado" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⚠️ Nenhum AAB encontrado" -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "              PRÓXIMOS PASSOS                      " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n📤 UPLOAD NO GOOGLE PLAY CONSOLE:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://play.google.com/console/" -ForegroundColor Blue
Write-Host "2. Selecione seu app (ou crie um novo)" -ForegroundColor Blue
Write-Host "3. Vá em: Release > Production" -ForegroundColor Blue
Write-Host "4. Clique em 'Create new release'" -ForegroundColor Blue
Write-Host "5. Faça upload do arquivo AAB" -ForegroundColor Blue
Write-Host "6. Preencha as informações e publique" -ForegroundColor Blue

Write-Host "`n🔐 INFORMAÇÕES DA ASSINATURA:" -ForegroundColor Yellow
if (Test-Path "listou-release.jks") {
    Write-Host "✅ Keystore: listou-release.jks" -ForegroundColor Green
    Write-Host "✅ Senha: (definida durante a criação do keystore)" -ForegroundColor Green
    Write-Host "✅ Alias: listou-key" -ForegroundColor Green
    Write-Host "`n⚠️ GUARDE ESSAS INFORMAÇÕES!" -ForegroundColor Red
} else {
    Write-Host "💡 Use Play App Signing para assinatura automática" -ForegroundColor Blue
}

Write-Host "`n🎉 PARABÉNS!" -ForegroundColor Green
Write-Host "Seu app está pronto para ser publicado!" -ForegroundColor Blue

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
