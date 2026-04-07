# MÉTODO MAIS SIMPLES - CORDOVA DIRETO
# Gerar AAB assinado sem Android Studio
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "     MÉTODO SIMPLES - CORDOVA + AAB ASSINADO       " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEste é o método mais direto para gerar um AAB assinado" -ForegroundColor Yellow
Write-Host "sem precisar do Android Studio." -ForegroundColor Yellow

# Verificar pré-requisitos
Write-Host "`n1. Verificando pré-requisitos..." -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado! Instale: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Java não encontrado! Instale JDK: https://adoptium.net/" -ForegroundColor Red
    exit 1
}

# Instalar Cordova CLI
Write-Host "`n2. Instalando/Verificando Cordova..." -ForegroundColor Yellow
try {
    cordova --version | Out-Null
    Write-Host "✅ Cordova CLI já instalado" -ForegroundColor Green
} catch {
    Write-Host "Instalando Cordova CLI..." -ForegroundColor Blue
    npm install -g cordova
}

# Verificar Android SDK
Write-Host "`n3. Verificando Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if (-not $androidHome -or -not (Test-Path $androidHome)) {
    Write-Host "⚠️ ANDROID_HOME não configurado" -ForegroundColor Yellow
    Write-Host "Você precisará instalar o Android SDK ou usar um método alternativo" -ForegroundColor Yellow
    
    Write-Host "`n🔧 SOLUÇÃO RÁPIDA SEM SDK:" -ForegroundColor Green
    Write-Host "Vamos usar o método PWA Builder que não precisa do SDK local." -ForegroundColor Blue
    
    # Método PWA Builder automatizado
    Write-Host "`n4. Usando PWA Builder automatizado..." -ForegroundColor Yellow
    
    # Verificar se servidor está rodando
    try {
        Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 3 | Out-Null
        $serverUrl = "http://localhost:8080"
        Write-Host "✅ Servidor local detectado: $serverUrl" -ForegroundColor Green
    } catch {
        Write-Host "❌ Servidor não está rodando na porta 8080" -ForegroundColor Red
        Write-Host "Iniciando servidor..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; python -m http.server 8080"
        Start-Sleep 5
        $serverUrl = "http://localhost:8080"
    }
    
    Write-Host "`n🌐 INSTRUÇÕES AUTOMÁTICAS:" -ForegroundColor Green
    Write-Host "1. Abrindo PWA Builder..." -ForegroundColor Blue
    Start-Process "https://www.pwabuilder.com/"
    
    Write-Host "`n📋 PASSOS NO PWA BUILDER:" -ForegroundColor Yellow
    Write-Host "1. Cole esta URL: $serverUrl" -ForegroundColor Blue
    Write-Host "2. Clique em 'Start'" -ForegroundColor Blue
    Write-Host "3. Aguarde a análise (pode demorar 1-2 minutos)" -ForegroundColor Blue
    Write-Host "4. Na seção 'Package for Stores', clique em 'Android'" -ForegroundColor Blue
    Write-Host "5. Configurações recomendadas:" -ForegroundColor Blue
    Write-Host "   - App Name: Listou" -ForegroundColor Gray
    Write-Host "   - Package ID: com.listou.app" -ForegroundColor Gray
    Write-Host "   - App Version: 1.0.0" -ForegroundColor Gray
    Write-Host "   - Deixe outras opções padrão" -ForegroundColor Gray
    Write-Host "6. Clique em 'Generate Package'" -ForegroundColor Blue
    Write-Host "7. Aguarde a geração (3-5 minutos)" -ForegroundColor Blue
    Write-Host "8. Faça download do arquivo AAB" -ForegroundColor Blue
    
    Write-Host "`n📥 APÓS O DOWNLOAD:" -ForegroundColor Yellow
    Write-Host "1. Coloque o arquivo .aab nesta pasta" -ForegroundColor Blue
    Write-Host "2. Execute: .\assinar-aab.ps1" -ForegroundColor Blue
    Write-Host "3. Faça upload no Google Play Console" -ForegroundColor Blue
    
    Write-Host "`n⏱️ AGUARDANDO DOWNLOAD..." -ForegroundColor Yellow
    Write-Host "Pressione qualquer tecla após fazer o download do AAB" -ForegroundColor Green
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    
    # Verificar se AAB foi baixado
    $aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue
    if ($aabFiles.Count -gt 0) {
        Write-Host "`n✅ Arquivo AAB encontrado!" -ForegroundColor Green
        Write-Host "Arquivo: $($aabFiles[0].Name)" -ForegroundColor Blue
        
        # Executar assinatura automaticamente
        Write-Host "`n🔐 Assinando AAB automaticamente..." -ForegroundColor Yellow
        .\assinar-aab.ps1
    } else {
        Write-Host "`n⚠️ Nenhum arquivo AAB encontrado" -ForegroundColor Yellow
        Write-Host "Certifique-se de colocar o arquivo .aab nesta pasta" -ForegroundColor Blue
        Write-Host "e execute: .\assinar-aab.ps1" -ForegroundColor Blue
    }
    
} else {
    Write-Host "✅ Android SDK encontrado: $androidHome" -ForegroundColor Green
    
    # Método Cordova completo
    Write-Host "`n4. Criando projeto Cordova..." -ForegroundColor Yellow
    
    $projectName = "listou-cordova"
    if (-not (Test-Path $projectName)) {
        cordova create $projectName com.listou.app Listou
        Write-Host "✅ Projeto Cordova criado" -ForegroundColor Green
    } else {
        Write-Host "✅ Projeto Cordova já existe" -ForegroundColor Green
    }
    
    # Copiar arquivos PWA para o projeto Cordova
    Write-Host "`n5. Copiando arquivos PWA..." -ForegroundColor Yellow
    Set-Location $projectName
    
    # Copiar arquivos principais
    $filesToCopy = @(
        "index.html", "manifest.webmanifest", "sw.js", "sw-new.js",
        "styles.css", "app.js", "db.js", "analytics.js", "intelligence.js",
        "notifications.js", "qr.js", "logo.svg", "icon-*.png"
    )
    
    foreach ($pattern in $filesToCopy) {
        $files = Get-ChildItem "..\$pattern" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Copy-Item $file.FullName "www\" -Force
        }
    }
    
    Write-Host "✅ Arquivos PWA copiados" -ForegroundColor Green
    
    # Adicionar plataforma Android
    Write-Host "`n6. Adicionando plataforma Android..." -ForegroundColor Yellow
    cordova platform add android
    
    # Criar keystore
    Write-Host "`n7. Criando keystore..." -ForegroundColor Yellow
    $keystorePath = "..\listou-release.jks"
    $storepass = Read-Host "Digite uma senha para o keystore"
    if (-not (Test-Path $keystorePath)) {
        $keystoreCmd = @"
keytool -genkey -v -keystore "$keystorePath" -alias "listou-key" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$storepass" -keypass "$storepass" -dname "CN=Listou App, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR"
"@
        Invoke-Expression $keystoreCmd
    }
    
    # Configurar build para AAB
    Write-Host "`n8. Configurando build para AAB..." -ForegroundColor Yellow
    
    # Criar build.json para assinatura
    $buildConfig = @{
        "android" = @{
            "release" = @{
                "keystore" = "../listou-release.jks"
                "storePassword" = $storepass
                "alias" = "listou-key"
                "password" = $storepass
                "keystoreType" = "jks"
            }
        }
    }
    
    $buildConfig | ConvertTo-Json -Depth 3 | Set-Content "build.json"
    
    # Gerar AAB
    Write-Host "`n9. Gerando AAB assinado..." -ForegroundColor Yellow
    Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Blue
    
    try {
        cordova build android --release --packageType=bundle
        
        # Verificar AAB gerado
        $aabPath = "platforms\android\app\build\outputs\bundle\release\app-release.aab"
        if (Test-Path $aabPath) {
            Copy-Item $aabPath "..\listou-signed.aab"
            
            Write-Host "`n===================================================" -ForegroundColor Green
            Write-Host "           AAB ASSINADO GERADO!                    " -ForegroundColor Green
            Write-Host "===================================================" -ForegroundColor Green
            Write-Host "Arquivo: listou-signed.aab" -ForegroundColor Blue
            Write-Host "Pronto para upload no Google Play Console!" -ForegroundColor Green
            
        } else {
            Write-Host "❌ AAB não encontrado" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Erro ao gerar AAB: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Set-Location ".."
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "RESUMO DOS MÉTODOS DISPONÍVEIS:" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🥇 MÉTODO 1 - PWA Builder Web (MAIS FÁCIL):" -ForegroundColor Yellow
Write-Host "✅ Não precisa de Android SDK" -ForegroundColor Green
Write-Host "✅ Interface visual simples" -ForegroundColor Green
Write-Host "✅ Gera AAB automaticamente" -ForegroundColor Green
Write-Host "URL: https://www.pwabuilder.com/" -ForegroundColor Blue

Write-Host "`n🥈 MÉTODO 2 - Capacitor:" -ForegroundColor Yellow
Write-Host "Execute: .\gerar-aab-capacitor.ps1" -ForegroundColor Blue

Write-Host "`n🥉 MÉTODO 3 - Este script (Cordova):" -ForegroundColor Yellow
Write-Host "Precisa do Android SDK configurado" -ForegroundColor Blue

Write-Host "`n⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "Qualquer método que você usar, sempre execute" -ForegroundColor Yellow
Write-Host ".\assinar-aab.ps1 depois para garantir a assinatura!" -ForegroundColor Yellow

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
