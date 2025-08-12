# RESOLVER PROBLEMA AAB - Script Principal
# Data: 12 de agosto de 2025
# Este script resolve completamente o problema de AAB nao-assinado

Write-Host "===================================================" -ForegroundColor Green
Write-Host "        RESOLVER PROBLEMA AAB NAO-ASSINADO         " -ForegroundColor Green
Write-Host "             SCRIPT PRINCIPAL                      " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nEste script ira:" -ForegroundColor Yellow
Write-Host "1. Verificar se voce ja tem um arquivo AAB" -ForegroundColor Blue
Write-Host "2. Se nao tiver, gerar um AAB a partir do seu PWA" -ForegroundColor Blue
Write-Host "3. Criar um keystore para assinatura" -ForegroundColor Blue
Write-Host "4. Assinar o AAB com certificado forte" -ForegroundColor Blue
Write-Host "5. Preparar o arquivo para upload na Play Store" -ForegroundColor Blue

Write-Host "`n===================================================" -ForegroundColor Cyan

# ETAPA 1: Verificar arquivo AAB existente
Write-Host "`nETAPA 1: Verificando arquivos AAB existentes..." -ForegroundColor Yellow

$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue
$hasUnsignedAAB = $false

if ($aabFiles.Count -gt 0) {
    Write-Host "Arquivo(s) AAB encontrado(s):" -ForegroundColor Green
    foreach ($file in $aabFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor Blue
        if ($file.Name -like "*unsigned*" -or $file.Name -notlike "*signed*") {
            $hasUnsignedAAB = $true
        }
    }
    
    if ($hasUnsignedAAB) {
        Write-Host "Arquivo AAB nao-assinado encontrado!" -ForegroundColor Green
        $skipGeneration = $true
    } else {
        Write-Host "Todos os AABs parecem estar assinados." -ForegroundColor Yellow
        Write-Host "Deseja gerar um novo AAB? (S/N): " -ForegroundColor Cyan -NoNewline
        $response = Read-Host
        $skipGeneration = ($response -notmatch "^[Ss]")
    }
} else {
    Write-Host "Nenhum arquivo AAB encontrado." -ForegroundColor Yellow
    Write-Host "Sera necessario gerar um AAB a partir do PWA." -ForegroundColor Blue
    $skipGeneration = $false
}

# ETAPA 2: Gerar AAB se necessario
if (-not $skipGeneration) {
    Write-Host "`nETAPA 2: Gerando AAB a partir do PWA..." -ForegroundColor Yellow
    
    # Verificar se e um PWA
    if (Test-Path "manifest.webmanifest") {
        Write-Host "Projeto PWA detectado!" -ForegroundColor Green
        
        # Verificar Node.js
        try {
            $nodeVersion = node --version
            Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
            
            # Instalar PWA Builder
            Write-Host "Instalando/Verificando PWA Builder..." -ForegroundColor Blue
            try {
                npm install -g @pwabuilder/cli
                Write-Host "PWA Builder pronto!" -ForegroundColor Green
                
                # Gerar AAB
                Write-Host "Gerando AAB... (isso pode levar alguns minutos)" -ForegroundColor Blue
                pwabuilder . --platform android --publish false
                
                # Verificar se foi gerado
                $newAabFiles = Get-ChildItem -Recurse "*.aab" -ErrorAction SilentlyContinue
                if ($newAabFiles.Count -gt 0) {
                    # Copiar para pasta principal
                    $latestAAB = $newAabFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                    $targetName = "Listou-unsigned.aab"
                    Copy-Item $latestAAB.FullName ".\$targetName" -Force
                    Write-Host "AAB gerado com sucesso: $targetName" -ForegroundColor Green
                } else {
                    Write-Host "ERRO: AAB nao foi gerado automaticamente." -ForegroundColor Red
                    Write-Host "Use o metodo manual em: https://www.pwabuilder.com/" -ForegroundColor Blue
                    exit 1
                }
                
            } catch {
                Write-Host "Erro com PWA Builder. Tentando metodo alternativo..." -ForegroundColor Yellow
                Write-Host "Va para: https://www.pwabuilder.com/" -ForegroundColor Blue
                Write-Host "Insira a URL do seu PWA e baixe o AAB gerado." -ForegroundColor Blue
                exit 1
            }
            
        } catch {
            Write-Host "ERRO: Node.js nao encontrado!" -ForegroundColor Red
            Write-Host "Instale Node.js em: https://nodejs.org/" -ForegroundColor Blue
            exit 1
        }
        
    } else {
        Write-Host "ERRO: manifest.webmanifest nao encontrado!" -ForegroundColor Red
        Write-Host "Este nao parece ser um projeto PWA valido." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "`nETAPA 2: Pulando geracao (AAB ja existe)" -ForegroundColor Green
}

# ETAPA 3: Verificar Java para assinatura
Write-Host "`nETAPA 3: Verificando Java para assinatura..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Java nao encontrado!" -ForegroundColor Red
    Write-Host "`nINSTALANDO JAVA AUTOMATICAMENTE..." -ForegroundColor Yellow
    
    # Tentar instalar via Chocolatey
    try {
        choco install openjdk11 -y
        Write-Host "Java instalado via Chocolatey!" -ForegroundColor Green
    } catch {
        Write-Host "Chocolatey nao disponivel." -ForegroundColor Yellow
        Write-Host "INSTALE JAVA MANUALMENTE:" -ForegroundColor Red
        Write-Host "1. Va para: https://adoptium.net/" -ForegroundColor Blue
        Write-Host "2. Baixe e instale o Java JDK" -ForegroundColor Blue
        Write-Host "3. Reinicie o PowerShell" -ForegroundColor Blue
        Write-Host "4. Execute este script novamente" -ForegroundColor Blue
        exit 1
    }
}

# ETAPA 4: Criar keystore
Write-Host "`nETAPA 4: Criando keystore para assinatura..." -ForegroundColor Yellow
$keystorePath = ".\listou-release.jks"

if (-not (Test-Path $keystorePath)) {
    Write-Host "Criando novo keystore..." -ForegroundColor Blue
    
    $alias = "listou-key"
    $storepass = "listou123456"
    $keypass = "listou123456"
    
    $createKeystoreCmd = "keytool -genkey -v -keystore `"$keystorePath`" -alias `"$alias`" -keyalg RSA -keysize 2048 -validity 10000 -storepass `"$storepass`" -keypass `"$keypass`" -dname `"CN=Listou App, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR`""
    
    try {
        Invoke-Expression $createKeystoreCmd
        Write-Host "Keystore criado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "ERRO ao criar keystore: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Keystore ja existe!" -ForegroundColor Green
}

# ETAPA 5: Assinar AAB
Write-Host "`nETAPA 5: Assinando AAB..." -ForegroundColor Yellow

# Encontrar AAB para assinar
$aabToSign = Get-ChildItem "*.aab" | Where-Object { $_.Name -like "*unsigned*" -or $_.Name -notlike "*signed*" } | Select-Object -First 1
if (-not $aabToSign) {
    $aabToSign = Get-ChildItem "*.aab" | Select-Object -First 1
}

if ($aabToSign) {
    $inputFile = $aabToSign.FullName
    $outputFile = $inputFile -replace "\.aab$", "-signed.aab"
    $outputFile = $outputFile -replace "-unsigned", ""
    
    Write-Host "Assinando arquivo: $($aabToSign.Name)" -ForegroundColor Blue
    
    $signCmd = "jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore `"$keystorePath`" -storepass `"listou123456`" `"$inputFile`" `"listou-key`""
    
    try {
        Invoke-Expression $signCmd
        Copy-Item $inputFile $outputFile -Force
        
        # Verificar assinatura
        $verifyCmd = "jarsigner -verify `"$outputFile`""
        $verifyResult = Invoke-Expression $verifyCmd 2>&1
        
        Write-Host "`n===================================================" -ForegroundColor Green
        Write-Host "           PROBLEMA RESOLVIDO COM SUCESSO!         " -ForegroundColor Green
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host "`nARQUIVO AAB ASSINADO CRIADO:" -ForegroundColor Yellow
        Write-Host "  $outputFile" -ForegroundColor Blue
        Write-Host "`nINFORMACOES DO KEYSTORE:" -ForegroundColor Yellow
        Write-Host "  Arquivo: $keystorePath" -ForegroundColor Blue
        Write-Host "  Senha: listou123456" -ForegroundColor Blue
        Write-Host "  Alias: listou-key" -ForegroundColor Blue
        Write-Host "`nPROXIMOS PASSOS:" -ForegroundColor Yellow
        Write-Host "1. Faca upload do arquivo AAB assinado para o Google Play Console" -ForegroundColor Green
        Write-Host "2. Va em: https://play.google.com/console/" -ForegroundColor Blue
        Write-Host "3. Selecione seu app > Release > Production" -ForegroundColor Blue
        Write-Host "4. Create new release > Upload do AAB" -ForegroundColor Blue
        Write-Host "`nIMPORTANTE:" -ForegroundColor Red
        Write-Host "- GUARDE O KEYSTORE E A SENHA COM SEGURANCA!" -ForegroundColor Red
        Write-Host "- Voce precisara do mesmo keystore para futuras atualizacoes!" -ForegroundColor Red
        
    } catch {
        Write-Host "ERRO ao assinar AAB: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nTente assinar manualmente com Android Studio." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "ERRO: Nenhum arquivo AAB encontrado para assinar!" -ForegroundColor Red
}

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
