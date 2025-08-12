# INSTALADOR AUTOMATICO - Resolver AAB nao-assinado
# Data: 12 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "     INSTALADOR AUTOMATICO - DEPENDENCIAS         " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Funcao para baixar arquivo
function Download-File {
    param([string]$url, [string]$output)
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        return $true
    } catch {
        Write-Host "Erro ao baixar: $url" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar e instalar Java
Write-Host "`n1. Verificando Java..." -ForegroundColor Yellow
try {
    java -version 2>&1 | Out-Null
    Write-Host "Java ja instalado!" -ForegroundColor Green
} catch {
    Write-Host "Java nao encontrado. Instalando..." -ForegroundColor Yellow
    
    # Criar pasta temp
    $tempDir = "$env:TEMP\ListouInstaller"
    if (-not (Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }
    
    # Baixar OpenJDK (versao portatil)
    $javaUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
    $javaZip = "$tempDir\openjdk-17.zip"
    
    Write-Host "Baixando OpenJDK..." -ForegroundColor Blue
    if (Download-File $javaUrl $javaZip) {
        # Extrair Java
        $javaDir = "$env:USERPROFILE\ListouTools\Java"
        if (-not (Test-Path $javaDir)) {
            New-Item -ItemType Directory -Path $javaDir -Force | Out-Null
        }
        
        Expand-Archive -Path $javaZip -DestinationPath $javaDir -Force
        
        # Adicionar ao PATH temporariamente
        $jdkPath = Get-ChildItem "$javaDir\jdk*" | Select-Object -First 1
        if ($jdkPath) {
            $env:JAVA_HOME = $jdkPath.FullName
            $env:PATH = "$($jdkPath.FullName)\bin;$env:PATH"
            Write-Host "Java instalado em: $($jdkPath.FullName)" -ForegroundColor Green
        }
    } else {
        Write-Host "ERRO: Falha ao baixar Java!" -ForegroundColor Red
        Write-Host "Instale manualmente: https://adoptium.net/" -ForegroundColor Blue
        exit 1
    }
}

# 2. Verificar Node.js
Write-Host "`n2. Verificando Node.js..." -ForegroundColor Yellow
try {
    node --version | Out-Null
    Write-Host "Node.js ja instalado!" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado." -ForegroundColor Yellow
    Write-Host "Baixe e instale: https://nodejs.org/" -ForegroundColor Blue
    Write-Host "Apos instalar, execute este script novamente." -ForegroundColor Yellow
    
    # Tentar com chocolatey se disponivel
    try {
        choco --version | Out-Null
        Write-Host "Instalando Node.js via Chocolatey..." -ForegroundColor Blue
        choco install nodejs -y
    } catch {
        Write-Host "Chocolatey nao disponivel. Instalacao manual necessaria." -ForegroundColor Yellow
    }
}

# 3. Instalar PWA Builder
Write-Host "`n3. Instalando PWA Builder..." -ForegroundColor Yellow
try {
    npm install -g @pwabuilder/cli
    Write-Host "PWA Builder instalado!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao instalar PWA Builder. Verifique Node.js." -ForegroundColor Red
}

# 4. Verificar Android SDK (opcional para assinatura manual)
Write-Host "`n4. Verificando Android SDK..." -ForegroundColor Yellow
$androidSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$androidSdkFound = $false
foreach ($path in $androidSdkPaths) {
    if (Test-Path $path) {
        Write-Host "Android SDK encontrado: $path" -ForegroundColor Green
        $env:ANDROID_HOME = $path
        $androidSdkFound = $true
        break
    }
}

if (-not $androidSdkFound) {
    Write-Host "Android SDK nao encontrado (opcional)." -ForegroundColor Yellow
    Write-Host "Para assinatura manual, instale Android Studio." -ForegroundColor Blue
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "         INSTALACAO DE DEPENDENCIAS CONCLUIDA     " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nProximo passo: Gerar e assinar AAB..." -ForegroundColor Yellow
Write-Host "Execute: .\gerar-aab-pwa.ps1" -ForegroundColor Blue
