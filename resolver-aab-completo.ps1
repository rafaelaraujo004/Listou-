# Script para resolver problema do AAB nao-assinado
# Data: 12 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "        RESOLVER PROBLEMA AAB NAO-ASSINADO         " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Verificar se Java esta instalado
Write-Host "`n1. Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Java nao encontrado. Instalando..." -ForegroundColor Red
    Write-Host "Baixe Java em: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Blue
    exit 1
}

# Verificar Android SDK
Write-Host "`n2. Verificando Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    Write-Host "ANDROID_HOME nao definido. Tentando localizar..." -ForegroundColor Yellow
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $androidHome = $path
            Write-Host "Android SDK encontrado em: $androidHome" -ForegroundColor Green
            break
        }
    }
    
    if (-not $androidHome) {
        Write-Host "ERRO: Android SDK nao encontrado!" -ForegroundColor Red
        Write-Host "Instale o Android Studio: https://developer.android.com/studio" -ForegroundColor Blue
        exit 1
    }
}

$buildTools = Get-ChildItem "$androidHome\build-tools" | Sort-Object Name -Descending | Select-Object -First 1
if (-not $buildTools) {
    Write-Host "ERRO: Build-tools nao encontrado!" -ForegroundColor Red
    exit 1
}

$buildToolsPath = $buildTools.FullName
Write-Host "Build-tools encontrado: $buildToolsPath" -ForegroundColor Green

# Criar keystore se nao existir
Write-Host "`n3. Verificando/Criando keystore..." -ForegroundColor Yellow
$keystorePath = ".\listou-release.jks"

if (-not (Test-Path $keystorePath)) {
    Write-Host "Criando novo keystore..." -ForegroundColor Yellow
    
    # Solicitar informacoes do desenvolvedor
    $alias = "listou-key"
    $storepass = "listou123456"
    $keypass = "listou123456"
    
    $createKeystoreCmd = "keytool -genkey -v -keystore `"$keystorePath`" -alias `"$alias`" -keyalg RSA -keysize 2048 -validity 10000 -storepass `"$storepass`" -keypass `"$keypass`" -dname `"CN=Listou App, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR`""
    
    Write-Host "Executando: $createKeystoreCmd" -ForegroundColor Blue
    Invoke-Expression $createKeystoreCmd
    
    if (Test-Path $keystorePath) {
        Write-Host "Keystore criado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "ERRO: Falha ao criar keystore!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Keystore ja existe: $keystorePath" -ForegroundColor Green
}

# Verificar se existe AAB nao-assinado
Write-Host "`n4. Procurando arquivo AAB..." -ForegroundColor Yellow
$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue

if ($aabFiles.Count -eq 0) {
    Write-Host "Nenhum arquivo AAB encontrado na pasta atual." -ForegroundColor Yellow
    Write-Host "Vou ajudar voce a gerar um AAB a partir do seu PWA..." -ForegroundColor Blue
    
    # Verificar se e um PWA
    if (Test-Path "manifest.webmanifest") {
        Write-Host "PWA detectado! Usando PWA Builder para gerar AAB..." -ForegroundColor Green
        
        # Instalar PWA Builder CLI se nao existir
        try {
            npm list -g @pwabuilder/cli 2>$null
            Write-Host "PWA Builder CLI ja instalado." -ForegroundColor Green
        } catch {
            Write-Host "Instalando PWA Builder CLI..." -ForegroundColor Yellow
            npm install -g @pwabuilder/cli
        }
        
        # Gerar AAB
        Write-Host "Gerando AAB com PWA Builder..." -ForegroundColor Yellow
        pwabuilder . --platform android --publish false
        
    } else {
        Write-Host "ERRO: Nenhum PWA ou AAB encontrado!" -ForegroundColor Red
        Write-Host "Coloque o arquivo .aab nao-assinado nesta pasta ou configure um PWA." -ForegroundColor Blue
        exit 1
    }
} else {
    Write-Host "Arquivo(s) AAB encontrado(s):" -ForegroundColor Green
    foreach ($file in $aabFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor Blue
    }
}

# Assinar AAB
Write-Host "`n5. Assinando AAB..." -ForegroundColor Yellow
$unsignedAab = $aabFiles | Where-Object { $_.Name -like "*unsigned*" -or $_.Name -notlike "*signed*" } | Select-Object -First 1

if (-not $unsignedAab) {
    $unsignedAab = $aabFiles | Select-Object -First 1
}

if ($unsignedAab) {
    $inputFile = $unsignedAab.FullName
    $outputFile = $inputFile -replace "\.aab$", "-signed.aab"
    $outputFile = $outputFile -replace "-unsigned", ""
    
    $jarsignerPath = (Get-Command jarsigner -ErrorAction SilentlyContinue).Source
    if (-not $jarsignerPath) {
        Write-Host "ERRO: jarsigner nao encontrado no PATH!" -ForegroundColor Red
        exit 1
    }
    
    $signCmd = "jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore `"$keystorePath`" -storepass `"listou123456`" `"$inputFile`" `"listou-key`""
    
    Write-Host "Assinando AAB..." -ForegroundColor Blue
    Write-Host "Comando: $signCmd" -ForegroundColor Gray
    
    Invoke-Expression $signCmd
    
    # Verificar se foi assinado
    Copy-Item $inputFile $outputFile -Force
    
    Write-Host "`n6. Verificando assinatura..." -ForegroundColor Yellow
    $verifyCmd = "jarsigner -verify -verbose -certs `"$outputFile`""
    $verifyResult = Invoke-Expression $verifyCmd
    
    if ($verifyResult -match "jar verified") {
        Write-Host "SUCCESS: AAB assinado com sucesso!" -ForegroundColor Green
        Write-Host "Arquivo final: $outputFile" -ForegroundColor Blue
    } else {
        Write-Host "AVISO: Verificacao de assinatura inconclusiva." -ForegroundColor Yellow
        Write-Host "Arquivo gerado: $outputFile" -ForegroundColor Blue
    }
    
    # Informacoes finais
    Write-Host "`n===================================================" -ForegroundColor Green
    Write-Host "                    CONCLUIDO!                    " -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "Arquivo AAB assinado: $outputFile" -ForegroundColor Blue
    Write-Host "Keystore usado: $keystorePath" -ForegroundColor Blue
    Write-Host "Alias: listou-key" -ForegroundColor Blue
    Write-Host "`nVoce pode agora fazer upload do AAB para o Google Play Console!" -ForegroundColor Green
    
} else {
    Write-Host "ERRO: Nenhum arquivo AAB encontrado para assinar!" -ForegroundColor Red
}

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
