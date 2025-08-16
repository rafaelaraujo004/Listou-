# SCRIPT ALTERNATIVO PARA GERAR AAB - LISTOU
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "         GERAR AAB - MÉTODO ALTERNATIVO            " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEste script irá preparar seu PWA para gerar um AAB manualmente." -ForegroundColor Yellow
Write-Host "Você terá 3 opções:" -ForegroundColor Blue

Write-Host "`n1. MÉTODO WEB (RECOMENDADO):" -ForegroundColor Green
Write-Host "   - Acesse: https://www.pwabuilder.com/" -ForegroundColor Blue
Write-Host "   - Digite a URL: http://localhost:8000" -ForegroundColor Blue
Write-Host "   - Clique em 'Start' e selecione 'Android Package'" -ForegroundColor Blue
Write-Host "   - Faça download do AAB gerado" -ForegroundColor Blue

Write-Host "`n2. MÉTODO ANDROID STUDIO:" -ForegroundColor Green
Write-Host "   - Instale Android Studio" -ForegroundColor Blue
Write-Host "   - Crie um novo projeto WebView" -ForegroundColor Blue
Write-Host "   - Configure para carregar seu PWA" -ForegroundColor Blue
Write-Host "   - Build > Generate Signed Bundle" -ForegroundColor Blue

Write-Host "`n3. MÉTODO CAPACITOR (AVANÇADO):" -ForegroundColor Green
Write-Host "   - Instalar Capacitor CLI" -ForegroundColor Blue
Write-Host "   - Configurar projeto Android" -ForegroundColor Blue
Write-Host "   - Gerar AAB via Gradle" -ForegroundColor Blue

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "PREPARANDO AMBIENTE PARA MÉTODO WEB..." -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

# Verificar se servidor está rodando
Write-Host "`n1. Verificando servidor local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Servidor rodando em http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando" -ForegroundColor Red
    Write-Host "Iniciando servidor..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; python -m http.server 8000"
    Start-Sleep 3
}

# Verificar manifest
Write-Host "`n2. Verificando manifest..." -ForegroundColor Yellow
if (Test-Path "manifest.webmanifest") {
    $manifest = Get-Content "manifest.webmanifest" | ConvertFrom-Json
    Write-Host "✅ Manifest encontrado: $($manifest.name)" -ForegroundColor Green
    Write-Host "   - Nome: $($manifest.name)" -ForegroundColor Blue
    Write-Host "   - Start URL: $($manifest.start_url)" -ForegroundColor Blue
    Write-Host "   - Theme Color: $($manifest.theme_color)" -ForegroundColor Blue
} else {
    Write-Host "❌ Manifest não encontrado!" -ForegroundColor Red
}

# Verificar Service Worker
Write-Host "`n3. Verificando Service Worker..." -ForegroundColor Yellow
if (Test-Path "sw.js") {
    Write-Host "✅ Service Worker encontrado: sw.js" -ForegroundColor Green
} elseif (Test-Path "sw-new.js") {
    Write-Host "✅ Service Worker encontrado: sw-new.js" -ForegroundColor Green
} else {
    Write-Host "⚠️ Service Worker não encontrado" -ForegroundColor Yellow
}

# Verificar ícones
Write-Host "`n4. Verificando ícones..." -ForegroundColor Yellow
$icons = Get-ChildItem "icon-*.png" -ErrorAction SilentlyContinue
if ($icons.Count -gt 0) {
    Write-Host "✅ Ícones encontrados: $($icons.Count)" -ForegroundColor Green
    foreach ($icon in $icons) {
        Write-Host "   - $($icon.Name)" -ForegroundColor Blue
    }
} else {
    Write-Host "⚠️ Nenhum ícone encontrado" -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "INSTRUÇÕES PARA GERAR AAB:" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🌐 MÉTODO WEB (MAIS FÁCIL):" -ForegroundColor Green
Write-Host "1. Abra: https://www.pwabuilder.com/" -ForegroundColor Blue
Write-Host "2. Cole a URL: http://localhost:8000" -ForegroundColor Blue
Write-Host "3. Clique em 'Start'" -ForegroundColor Blue
Write-Host "4. Aguarde a análise" -ForegroundColor Blue
Write-Host "5. Clique em 'Android' na seção Package for Stores" -ForegroundColor Blue
Write-Host "6. Configure as opções (deixe padrão)" -ForegroundColor Blue
Write-Host "7. Clique em 'Generate Package'" -ForegroundColor Blue
Write-Host "8. Faça download do arquivo AAB" -ForegroundColor Blue

Write-Host "`n📱 APÓS GERAR O AAB:" -ForegroundColor Yellow
Write-Host "1. Coloque o arquivo .aab nesta pasta" -ForegroundColor Blue
Write-Host "2. Execute: .\assinar-aab.ps1" -ForegroundColor Blue
Write-Host "3. Faça upload no Google Play Console" -ForegroundColor Blue

Write-Host "`n💡 DICA:" -ForegroundColor Yellow
Write-Host "Se o PWA Builder web não funcionar, você pode usar" -ForegroundColor Blue
Write-Host "o Android Studio para criar um WebView app." -ForegroundColor Blue

Write-Host "`nPressione qualquer tecla para abrir o PWA Builder..." -ForegroundColor Green
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null

# Abrir PWA Builder
Start-Process "https://www.pwabuilder.com/"

Write-Host "`nPWA Builder aberto no navegador!" -ForegroundColor Green
Write-Host "Siga as instruções acima para gerar seu AAB." -ForegroundColor Blue
