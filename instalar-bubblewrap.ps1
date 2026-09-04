# SOLUCAO DEFINITIVA - Instalar Bubblewrap e gerar AAB correto

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   INSTALACAO DO BUBBLEWRAP CLI                   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`nO Bubblewrap CLI gera AABs com assinatura unica!" -ForegroundColor Green

# Verificar Node.js
Write-Host "`n[1/5] Verificando Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "`nPor favor, instale o Node.js:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Baixe a versao LTS (recomendada)" -ForegroundColor White
    Write-Host "3. Execute o instalador" -ForegroundColor White
    Write-Host "4. Feche e abra novamente o PowerShell" -ForegroundColor White
    Write-Host "5. Execute este script novamente" -ForegroundColor White
    
    # Tentar abrir o site
    Write-Host "`nDeseja abrir o site do Node.js agora? (S/N)" -ForegroundColor Yellow
    $resposta = Read-Host
    if ($resposta -eq "S" -or $resposta -eq "s") {
        Start-Process "https://nodejs.org/"
    }
    exit 1
}

# Verificar npm
Write-Host "`n[2/5] Verificando npm..." -ForegroundColor Cyan
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "npm instalado: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "npm nao encontrado!" -ForegroundColor Red
    exit 1
}

# Instalar Bubblewrap
Write-Host "`n[3/5] Instalando Bubblewrap CLI..." -ForegroundColor Cyan
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray

try {
    npm install -g @bubblewrap/cli
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Bubblewrap instalado com sucesso!" -ForegroundColor Green
    } else {
        throw "Erro ao instalar Bubblewrap"
    }
} catch {
    Write-Host "Erro ao instalar Bubblewrap: $_" -ForegroundColor Red
    Write-Host "`nTente manualmente:" -ForegroundColor Yellow
    Write-Host "npm install -g @bubblewrap/cli" -ForegroundColor White
    exit 1
}

# Verificar instalacao
Write-Host "`n[4/5] Verificando instalacao..." -ForegroundColor Cyan
$bubblewrapVersion = bubblewrap --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Bubblewrap version: $bubblewrapVersion" -ForegroundColor Green
} else {
    Write-Host "Erro ao verificar Bubblewrap" -ForegroundColor Red
    exit 1
}

Write-Host "`n[5/5] Instalando dependencias do Android..." -ForegroundColor Cyan
Write-Host "O Bubblewrap precisa do JDK e Android SDK" -ForegroundColor Gray

# Verificar JDK
$jdkPath = Get-ChildItem -Path "C:\Program Files" -Filter "jdk*" -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)\bin\java.exe" } | Select-Object -First 1

if ($jdkPath) {
    Write-Host "JDK encontrado: $($jdkPath.FullName)" -ForegroundColor Green
    $env:JAVA_HOME = $jdkPath.FullName
} else {
    Write-Host "JDK ja deve estar instalado do passo anterior" -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "           BUBBLEWRAP INSTALADO!                   " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Certifique-se de que seu PWA esta online" -ForegroundColor White
Write-Host "   URL: https://seu-site.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Inicialize o projeto Bubblewrap:" -ForegroundColor White
Write-Host "   bubblewrap init --manifest https://seu-site.vercel.app/manifest.json" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Durante a inicializacao, configure:" -ForegroundColor White
Write-Host "   - Package name: app.vercel.listou_iota.twa" -ForegroundColor Gray
Write-Host "   - App name: Listou" -ForegroundColor Gray
Write-Host "   - Use valores padrao para o resto" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Construa o AAB:" -ForegroundColor White
Write-Host "   bubblewrap build" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. O AAB sera gerado em:" -ForegroundColor White
Write-Host "   app-release-signed.aab" -ForegroundColor Green
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "              IMPORTANTE                           " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`nO Bubblewrap gerara:" -ForegroundColor Yellow
Write-Host "- AAB com APENAS 1 certificado" -ForegroundColor Green
Write-Host "- Keystore automaticamente" -ForegroundColor Green
Write-Host "- Package name correto" -ForegroundColor Green
Write-Host ""
Write-Host "Guarde a keystore gerada em:" -ForegroundColor Yellow
Write-Host "android.keystore" -ForegroundColor White
Write-Host ""

Write-Host "Quer que eu execute o init automaticamente? (S/N)" -ForegroundColor Cyan
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host "`nQual e a URL do seu PWA?" -ForegroundColor Yellow
    Write-Host "Exemplo: https://listou.vercel.app" -ForegroundColor Gray
    $url = Read-Host
    
    if ($url) {
        Write-Host "`nExecutando bubblewrap init..." -ForegroundColor Cyan
        bubblewrap init --manifest "$url/manifest.json"
    }
}

Write-Host "`n"
