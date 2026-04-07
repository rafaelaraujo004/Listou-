# GERAÇÃO MANUAL DE AAB SEM ANDROID STUDIO
# Método Capacitor - Automatizado
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "        GERAR AAB MANUALMENTE - CAPACITOR          " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEste script irá gerar um AAB assinado automaticamente" -ForegroundColor Yellow
Write-Host "usando Capacitor + Cordova, sem precisar do Android Studio." -ForegroundColor Yellow

# Verificar Node.js
Write-Host "`n1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale Node.js: https://nodejs.org/" -ForegroundColor Blue
    exit 1
}

# Verificar Java
Write-Host "`n2. Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java não encontrado!" -ForegroundColor Red
    Write-Host "Instale Java JDK: https://adoptium.net/" -ForegroundColor Blue
    exit 1
}

# Instalar Capacitor CLI
Write-Host "`n3. Instalando/Verificando Capacitor CLI..." -ForegroundColor Yellow
try {
    npx @capacitor/cli --version | Out-Null
    Write-Host "✅ Capacitor CLI disponível" -ForegroundColor Green
} catch {
    Write-Host "Instalando Capacitor CLI..." -ForegroundColor Blue
    npm install -g @capacitor/cli
}

# Criar estrutura do projeto Capacitor
Write-Host "`n4. Criando projeto Capacitor..." -ForegroundColor Yellow

# Criar package.json se não existir
if (-not (Test-Path "package.json")) {
    Write-Host "Criando package.json..." -ForegroundColor Blue
    $packageJson = @{
        "name" = "listou-app"
        "version" = "1.0.0"
        "description" = "Listou - Lista de Compras Inteligente"
        "main" = "index.html"
        "scripts" = @{
            "build" = "echo 'Build completed'"
        }
        "author" = "Listou Team"
        "license" = "MIT"
    }
    $packageJson | ConvertTo-Json -Depth 3 | Set-Content "package.json"
}

# Inicializar Capacitor
Write-Host "`n5. Inicializando Capacitor..." -ForegroundColor Yellow
if (-not (Test-Path "capacitor.config.ts")) {
    npx cap init "Listou" "com.listou.app" --web-dir "."
    Write-Host "✅ Capacitor inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Capacitor já inicializado" -ForegroundColor Green
}

# Adicionar plataforma Android
Write-Host "`n6. Adicionando plataforma Android..." -ForegroundColor Yellow
if (-not (Test-Path "android")) {
    npx cap add android
    Write-Host "✅ Plataforma Android adicionada" -ForegroundColor Green
} else {
    Write-Host "✅ Plataforma Android já existe" -ForegroundColor Green
}

# Sincronizar arquivos
Write-Host "`n7. Sincronizando arquivos..." -ForegroundColor Yellow
npx cap sync android

# Verificar se Gradle Wrapper existe
Write-Host "`n8. Verificando Gradle..." -ForegroundColor Yellow
$gradlewPath = "android\gradlew.bat"
if (Test-Path $gradlewPath) {
    Write-Host "✅ Gradle Wrapper encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Gradle Wrapper não encontrado" -ForegroundColor Red
    Write-Host "Tentando corrigir..." -ForegroundColor Yellow
    
    # Instalar Gradle manualmente
    if (-not (Get-Command gradle -ErrorAction SilentlyContinue)) {
        Write-Host "Instalando Gradle..." -ForegroundColor Blue
        # Usando Chocolatey se disponível
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install gradle -y
        } else {
            Write-Host "⚠️ Instale Gradle manualmente: https://gradle.org/install/" -ForegroundColor Yellow
        }
    }
}

# Criar keystore se não existir
Write-Host "`n9. Criando/Verificando keystore..." -ForegroundColor Yellow
$keystorePath = "listou-release.jks"
$storepass = Read-Host "Digite uma senha para o keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "Criando keystore para assinatura..." -ForegroundColor Blue
    
    $keystoreCmd = @"
keytool -genkey -v -keystore "$keystorePath" -alias "listou-key" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$storepass" -keypass "$storepass" -dname "CN=Listou App, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR"
"@
    
    try {
        Invoke-Expression $keystoreCmd
        Write-Host "✅ Keystore criado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao criar keystore: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Keystore já existe" -ForegroundColor Green
}

# Configurar assinatura no Gradle
Write-Host "`n10. Configurando assinatura..." -ForegroundColor Yellow
$gradleBuildPath = "android\app\build.gradle"

if (Test-Path $gradleBuildPath) {
    $gradleContent = Get-Content $gradleBuildPath -Raw
    
    # Verificar se já tem configuração de assinatura
    if ($gradleContent -notmatch "signingConfigs") {
        Write-Host "Adicionando configuração de assinatura ao build.gradle..." -ForegroundColor Blue
        
        # Backup do arquivo original
        Copy-Item $gradleBuildPath "$gradleBuildPath.backup"
        
        # Adicionar configuração de assinatura
        $signingConfig = @"

android {
    signingConfigs {
        release {
            storeFile file('../../listou-release.jks')
            storePassword '$storepass'
            keyAlias 'listou-key'
            keyPassword '$storepass'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
"@
        
        # Inserir configuração no arquivo
        $gradleContent = $gradleContent -replace "android \{", $signingConfig
        Set-Content $gradleBuildPath $gradleContent
        
        Write-Host "✅ Configuração de assinatura adicionada" -ForegroundColor Green
    } else {
        Write-Host "✅ Configuração de assinatura já existe" -ForegroundColor Green
    }
}

# Gerar AAB assinado
Write-Host "`n11. Gerando AAB assinado..." -ForegroundColor Yellow
Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Blue

try {
    Set-Location "android"
    
    # Usar gradlew se disponível, senão usar gradle
    if (Test-Path "gradlew.bat") {
        .\gradlew.bat bundleRelease
    } else {
        gradle bundleRelease
    }
    
    Set-Location ".."
    
    # Verificar se AAB foi gerado
    $aabPath = "android\app\build\outputs\bundle\release\app-release.aab"
    if (Test-Path $aabPath) {
        # Copiar AAB para a pasta raiz
        Copy-Item $aabPath "listou-signed.aab"
        
        Write-Host "`n===================================================" -ForegroundColor Green
        Write-Host "           AAB GERADO COM SUCESSO!                 " -ForegroundColor Green
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host "Arquivo AAB: listou-signed.aab" -ForegroundColor Blue
        Write-Host "Keystore: listou-release.jks" -ForegroundColor Blue
        Write-Host "Senha: $storepass" -ForegroundColor Blue
        Write-Host "Alias: listou-key" -ForegroundColor Blue
        
        Write-Host "`n📱 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
        Write-Host "1. Faça upload do 'listou-signed.aab' no Google Play Console" -ForegroundColor Green
        Write-Host "2. Acesse: https://play.google.com/console/" -ForegroundColor Blue
        Write-Host "3. Selecione seu app > Release > Production" -ForegroundColor Blue
        Write-Host "4. Create new release > Upload AAB" -ForegroundColor Blue
        
        Write-Host "`n⚠️ IMPORTANTE - GUARDE COM SEGURANÇA:" -ForegroundColor Red
        Write-Host "- Arquivo: listou-release.jks" -ForegroundColor Yellow
        Write-Host "- Senha: $storepass" -ForegroundColor Yellow
        Write-Host "- Alias: listou-key" -ForegroundColor Yellow
        Write-Host "Você precisará dessas informações para futuras atualizações!" -ForegroundColor Red
        
    } else {
        Write-Host "❌ AAB não foi encontrado no caminho esperado" -ForegroundColor Red
        Write-Host "Verificando outros locais..." -ForegroundColor Yellow
        
        $possiblePaths = @(
            "android\app\build\outputs\bundle\release\*.aab",
            "android\app\build\outputs\apk\release\*.aab"
        )
        
        foreach ($path in $possiblePaths) {
            $files = Get-ChildItem $path -ErrorAction SilentlyContinue
            if ($files) {
                Write-Host "AAB encontrado em: $($files[0].FullName)" -ForegroundColor Green
                Copy-Item $files[0].FullName "listou-signed.aab"
                break
            }
        }
    }
    
} catch {
    Write-Host "❌ Erro ao gerar AAB: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nSOLUÇÕES ALTERNATIVAS:" -ForegroundColor Yellow
    Write-Host "1. Instale Android Studio e use o método visual" -ForegroundColor Blue
    Write-Host "2. Use o PWA Builder online: https://www.pwabuilder.com/" -ForegroundColor Blue
    Write-Host "3. Verifique se o Java SDK está instalado corretamente" -ForegroundColor Blue
}

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
