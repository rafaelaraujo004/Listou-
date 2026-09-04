# CRIAR NOVO APP NO GOOGLE PLAY - EVITAR PROBLEMA DE CHAVE
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "          CRIAR NOVO APP - CHAVE LIMPA             " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEsta é a solução mais segura quando há conflito de chaves." -ForegroundColor Yellow
Write-Host "Vamos criar um novo app no Google Play Console." -ForegroundColor Yellow

Write-Host "`n🎯 VANTAGENS DESTA ABORDAGEM:" -ForegroundColor Green
Write-Host "✅ Não precisa encontrar keystore antigo" -ForegroundColor Blue
Write-Host "✅ Usa Play App Signing desde o início" -ForegroundColor Blue
Write-Host "✅ Sem conflitos de assinatura" -ForegroundColor Blue
Write-Host "✅ Processo mais moderno e seguro" -ForegroundColor Blue

# Gerar sugestões de Package ID
Write-Host "`n📱 SUGESTÕES DE PACKAGE ID:" -ForegroundColor Yellow
$packageSuggestions = @(
    "com.listou.app.v2",
    "com.listou.shopping", 
    "com.listou.lista",
    "com.listou.compras",
    "br.com.listou.app"
)

foreach ($i, $pkg in $packageSuggestions) {
    Write-Host "   $($i+1). $pkg" -ForegroundColor Cyan
}

$customPkg = Read-Host "`nEscolha um número (1-5) ou digite seu próprio Package ID"

if ($customPkg -match "^\d$" -and [int]$customPkg -le 5) {
    $selectedPackage = $packageSuggestions[[int]$customPkg - 1]
} else {
    $selectedPackage = $customPkg
}

Write-Host "`nPackage ID selecionado: $selectedPackage" -ForegroundColor Green

# Configurações do novo app
$appConfig = @{
    "packageId" = $selectedPackage
    "appName" = "Listou"
    "version" = "1.0.0"
    "versionCode" = "1"
    "description" = "Lista de Compras Inteligente"
    "category" = "Productivity"
    "instructions" = @{
        "pwaBuilder" = "Use estas configurações ao gerar AAB no PWA Builder"
        "playConsole" = "Crie novo app no Google Play Console com essas configurações"
        "playAppSigning" = "Ative Play App Signing desde o início"
    }
}

# Salvar configurações
$configFile = "novo-app-config.json"
$appConfig | ConvertTo-Json -Depth 3 | Set-Content $configFile

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "            PASSO A PASSO DETALHADO                " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n1️⃣ CRIAR NOVO APP NO GOOGLE PLAY CONSOLE:" -ForegroundColor Yellow
Write-Host "   • Acesse: https://play.google.com/console/" -ForegroundColor Blue
Write-Host "   • Clique em 'Create app'" -ForegroundColor Blue
Write-Host "   • App name: Listou" -ForegroundColor Blue
Write-Host "   • Default language: Portuguese (Brazil)" -ForegroundColor Blue
Write-Host "   • App or game: App" -ForegroundColor Blue
Write-Host "   • Free or paid: Free" -ForegroundColor Blue

Write-Host "`n2️⃣ CONFIGURAR APP SIGNING:" -ForegroundColor Yellow
Write-Host "   • Após criar o app, vá em Release > Setup > App signing" -ForegroundColor Blue
Write-Host "   • Ative 'Use Play App Signing'" -ForegroundColor Blue
Write-Host "   • Escolha 'Continue' para let Google generate and manage my app signing key" -ForegroundColor Blue

Write-Host "`n3️⃣ GERAR AAB COM NOVO PACKAGE ID:" -ForegroundColor Yellow
Write-Host "   • Acesse: https://www.pwabuilder.com/" -ForegroundColor Blue
Write-Host "   • URL do PWA: http://localhost:8080" -ForegroundColor Blue
Write-Host "   • Clique em 'Android'" -ForegroundColor Blue
Write-Host "   • CONFIGURAÇÕES IMPORTANTES:" -ForegroundColor Red
Write-Host "     - Package ID: $selectedPackage" -ForegroundColor Cyan
Write-Host "     - App name: Listou" -ForegroundColor Cyan
Write-Host "     - Version: 1.0.0" -ForegroundColor Cyan
Write-Host "   • Gere e baixe o AAB" -ForegroundColor Blue

Write-Host "`n4️⃣ UPLOAD SEM ASSINATURA LOCAL:" -ForegroundColor Yellow
Write-Host "   • NÃO execute assinar-aab.ps1" -ForegroundColor Red
Write-Host "   • Faça upload direto do AAB do PWA Builder" -ForegroundColor Blue
Write-Host "   • O Google assina automaticamente" -ForegroundColor Blue

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "CONFIGURAÇÕES SALVAS EM: $configFile" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Mostrar conteúdo do arquivo de configuração
Write-Host "`n📋 CONFIGURAÇÕES PARA USAR:" -ForegroundColor Yellow
Get-Content $configFile | Write-Host -ForegroundColor Cyan

Write-Host "`n🚀 INICIAR PROCESSO?" -ForegroundColor Yellow
$start = Read-Host "Digite 's' para abrir Google Play Console e PWA Builder"

if ($start -eq "s") {
    Write-Host "`nAbrindo Google Play Console..." -ForegroundColor Green
    Start-Process "https://play.google.com/console/"
    
    Start-Sleep 2
    
    Write-Host "Abrindo PWA Builder..." -ForegroundColor Green
    Start-Process "https://www.pwabuilder.com/"
    
    # Verificar servidor
    try {
        Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 3 | Out-Null
        Write-Host "`n✅ Servidor local funcionando: http://localhost:8080" -ForegroundColor Green
    } catch {
        Write-Host "`n❌ Servidor local não está rodando!" -ForegroundColor Red
        Write-Host "Execute em outro terminal: python -m http.server 8080" -ForegroundColor Yellow
    }
    
    Write-Host "`n📋 LEMBRETE DAS CONFIGURAÇÕES:" -ForegroundColor Yellow
    Write-Host "Package ID: $selectedPackage" -ForegroundColor Cyan
    Write-Host "App Name: Listou" -ForegroundColor Cyan
    Write-Host "Version: 1.0.0" -ForegroundColor Cyan
    Write-Host "PWA URL: http://localhost:8080" -ForegroundColor Cyan
}

Write-Host "`n💡 DICAS IMPORTANTES:" -ForegroundColor Yellow
Write-Host "• Use sempre o mesmo Package ID em futuras atualizações" -ForegroundColor Blue
Write-Host "• Ative Play App Signing antes do primeiro upload" -ForegroundColor Blue
Write-Host "• Não execute scripts de assinatura local com Play App Signing" -ForegroundColor Blue
Write-Host "• Guarde as configurações salvas em $configFile" -ForegroundColor Blue

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
