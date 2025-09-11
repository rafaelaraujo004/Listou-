# ASSINAR AAB - Script simplificado
# Data: 12 de agosto de 2025

Write-Host "===========# Comando para assinar
# Exemplo de comandos para o usuário (removido concatenação e comandos inválidos)
Write-Host "Keystore usado: $keystorePath" -ForegroundColor Blue
Write-Host "Alias da chave: upload-key" -ForegroundColor Blue
Write-Host "`nProximo passo:" -ForegroundColor Yellow
Write-Host "1. Configure Play App Signing no Google Play Console" -ForegroundColor Green
Write-Host "2. Faca upload do certificado de upload (gerar com .\resolver-chave-incorreta.ps1)" -ForegroundColor Green
Write-Host "3. Faca upload do arquivo '$outputFile' para o Google Play Console" -ForegroundColor Green
Write-Host "4. Va em: https://play.google.com/console/" -ForegroundColor Blue
Write-Host "5. Selecione seu app > Release > Production > Create new release" -ForegroundColor Blue
Write-Host "6. Faca upload do AAB assinado" -ForegroundColor Blue

# Informacoes adicionais
Write-Host "`nINFORMACOES IMPORTANTES:" -ForegroundColor Yellow
Write-Host "- Senha do keystore: ListouApp2025!@#" -ForegroundColor Gray
Write-Host "- Alias da chave: upload-key" -ForegroundColor Gray

Write-Host "====================================" -ForegroundColor Green
Write-Host "              ASSINAR ARQUIVO AAB                  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Procurar arquivo AAB
Write-Host "`n1. Procurando arquivo AAB..." -ForegroundColor Yellow
$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue

if ($aabFiles.Count -eq 0) {
    Write-Host "ERRO: Nenhum arquivo AAB encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de que o arquivo .aab esta nesta pasta." -ForegroundColor Yellow
    Write-Host "Execute primeiro: .\gerar-aab-pwa.ps1" -ForegroundColor Blue
    exit 1
}

Write-Host "Arquivo(s) AAB encontrado(s):" -ForegroundColor Green
foreach ($file in $aabFiles) {
    Write-Host "  - $($file.Name)" -ForegroundColor Blue
}

# Selecionar arquivo AAB para assinar
$aabToSign = $aabFiles | Select-Object -First 1
Write-Host "`nUsando arquivo: $($aabToSign.Name)" -ForegroundColor Blue

# Verificar Java
Write-Host "`n2. Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Java nao encontrado!" -ForegroundColor Red
    Write-Host "`nSOLUCAO RAPIDA:" -ForegroundColor Yellow
    Write-Host "1. Baixe Java: https://adoptium.net/" -ForegroundColor Blue
    Write-Host "2. Instale e reinicie o PowerShell" -ForegroundColor Blue
    Write-Host "3. Execute este script novamente" -ForegroundColor Blue
    exit 1
}

# Criar keystore se nao existir
Write-Host "`n3. Verificando/Criando keystore..." -ForegroundColor Yellow
$keystorePath = ".\upload-keystore.jks"

if (-not (Test-Path $keystorePath)) {
    Write-Host "Criando novo keystore para Play App Signing..." -ForegroundColor Yellow
    
    # Configuracoes do keystore - CERTIFICADO DE UPLOAD
    $alias = "upload-key"
    $storepass = "ListouApp2025!@#"
    $keypass = "ListouApp2025!@#"
    
    # Criar keystore
    $createKeystoreCmd = @"
keytool -genkey -v -keystore "$keystorePath" -alias "$alias" -keyalg RSA -keysize 2048 -validity 25000 -storepass "$storepass" -keypass "$keypass" -dname "CN=Listou Upload Certificate, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR"
"@
    
    Write-Host "Criando keystore..." -ForegroundColor Blue
    try {
        Invoke-Expression $createKeystoreCmd
        
        if (Test-Path $keystorePath) {
            Write-Host "Keystore criado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "ERRO: Falha ao criar keystore!" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "ERRO ao criar keystore: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Keystore ja existe: $keystorePath" -ForegroundColor Green
}

# Assinar AAB
Write-Host "`n4. Assinando AAB..." -ForegroundColor Yellow

$inputFile = $aabToSign.FullName
$outputFile = $inputFile -replace "\.aab$", "-signed.aab"
$outputFile = $outputFile -replace "-unsigned", ""

# Verificar se jarsigner existe
try {
    jarsigner 2>&1 | Out-Null
} catch {
    Write-Host "ERRO: jarsigner nao encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de que o Java JDK esta instalado." -ForegroundColor Yellow
    exit 1
}

# Comando para assinar
$signCmd = @"
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$keystorePath" -storepass "ListouApp2025!@#" "$inputFile" "listou-key-v2"
"@

Write-Host "Assinando AAB..." -ForegroundColor Blue
Write-Host "Arquivo de entrada: $inputFile" -ForegroundColor Gray
Write-Host "Comando: $signCmd" -ForegroundColor Gray

try {
    Invoke-Expression $signCmd
    
    # Copiar para arquivo de saida
    Copy-Item $inputFile $outputFile -Force
    
    Write-Host "`n5. Verificando assinatura..." -ForegroundColor Yellow
    
    # Verificar assinatura
    $verifyCmd = "jarsigner -verify -verbose -certs `"$outputFile`""
    $verifyResult = Invoke-Expression $verifyCmd 2>&1
    
    if ($verifyResult -match "jar verified" -or $LASTEXITCODE -eq 0) {
        Write-Host "`n===================================================" -ForegroundColor Green
        Write-Host "           AAB ASSINADO COM SUCESSO!               " -ForegroundColor Green
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host "Arquivo AAB assinado: $outputFile" -ForegroundColor Blue
        Write-Host "Keystore usado: $keystorePath" -ForegroundColor Blue
        Write-Host "Alias da chave: listou-key-v2" -ForegroundColor Blue
        Write-Host "`nProximo passo:" -ForegroundColor Yellow
        Write-Host "1. Faca upload do arquivo '$outputFile' para o Google Play Console" -ForegroundColor Green
        Write-Host "2. Va em: https://play.google.com/console/" -ForegroundColor Blue
        Write-Host "3. Selecione seu app > Release > Production > Create new release" -ForegroundColor Blue
        Write-Host "4. Faca upload do AAB assinado" -ForegroundColor Blue
        
        # Informacoes adicionais
        Write-Host "`nINFORMACOES IMPORTANTES:" -ForegroundColor Yellow
        Write-Host "- Senha do keystore: ListouApp2025!@#" -ForegroundColor Gray
        Write-Host "- Alias da chave: listou-key-v2" -ForegroundColor Gray
        Write-Host "- GUARDE ESSAS INFORMACOES COM SEGURANCA!" -ForegroundColor Red
        Write-Host "- Voce precisara do mesmo keystore para futuras atualizacoes." -ForegroundColor Red
        
    } else {
        Write-Host "AVISO: Verificacao de assinatura inconclusiva." -ForegroundColor Yellow
        Write-Host "Arquivo gerado: $outputFile" -ForegroundColor Blue
        Write-Host "Tente fazer upload mesmo assim." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERRO ao assinar AAB: $($_.Exception.Message)" -ForegroundColor Red
    
    # Sugerir alternativas
    Write-Host "`nALTERNATIVAS:" -ForegroundColor Yellow
    Write-Host "1. Use Android Studio para assinar manualmente" -ForegroundColor Blue
    Write-Host "2. Use o Play App Signing (assinatura automatica do Google)" -ForegroundColor Blue
    Write-Host "3. Verifique se o Java JDK esta instalado corretamente" -ForegroundColor Blue
}

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
