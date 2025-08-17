# RESOLVER CHAVE INCORRETA - Google Play Console
# Data: 17 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Red
Write-Host "        RESOLVER PROBLEMA DE CHAVE INCORRETA       " -ForegroundColor Red  
Write-Host "===================================================" -ForegroundColor Red

Write-Host "`nPROBLEMA IDENTIFICADO:" -ForegroundColor Yellow
Write-Host "- SHA1 Esperada: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Red
Write-Host "- SHA1 Atual:    29:7F:B3:B0:B4:25:10:68:16:69:7E:E4:A3:D7:D0:80:DD:79:A8:3C" -ForegroundColor Red

Write-Host "`nSOLUCAO RECOMENDADA: PLAY APP SIGNING" -ForegroundColor Green

Write-Host "`nCONFIGURANDO PLAY APP SIGNING..." -ForegroundColor Green

# Gerar novo certificado de upload
$uploadKeystore = ".\upload-keystore.jks" 
$alias = "upload-key"
$password = "ListouApp2025!@#"

Write-Host "`nGerando novo certificado de upload..." -ForegroundColor Yellow

$createCmd = @"
keytool -genkey -v -keystore "$uploadKeystore" -alias "$alias" -keyalg RSA -keysize 2048 -validity 25000 -storepass "$password" -keypass "$password" -dname "CN=Listou Upload Key, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR"
"@

try {
    Write-Host "Criando certificado de upload..." -ForegroundColor Blue
    Invoke-Expression $createCmd
    
    if (Test-Path $uploadKeystore) {
        Write-Host "`nCERTIFICADO DE UPLOAD CRIADO!" -ForegroundColor Green
        Write-Host "Arquivo: $uploadKeystore" -ForegroundColor Blue
        Write-Host "Alias: $alias" -ForegroundColor Blue
        Write-Host "Senha: $password" -ForegroundColor Blue
        
        # Gerar arquivo PEM para upload
        Write-Host "`nGerando arquivo PEM para o Console..." -ForegroundColor Yellow
        $pemFile = ".\upload-certificate.pem"
        $exportCmd = "keytool -export -rfc -keystore `"$uploadKeystore`" -alias `"$alias`" -storepass `"$password`" -file `"$pemFile`""
        
        Invoke-Expression $exportCmd
        
        if (Test-Path $pemFile) {
            Write-Host "Arquivo PEM gerado: $pemFile" -ForegroundColor Green
            
            Write-Host "`nPROXIMOS PASSOS:" -ForegroundColor Yellow
            Write-Host "1. Va para Google Play Console" -ForegroundColor Blue
            Write-Host "2. Selecione seu app" -ForegroundColor Blue
            Write-Host "3. Va em Release > Setup > App integrity" -ForegroundColor Blue
            Write-Host "4. Na secao App signing, clique em Continue" -ForegroundColor Blue
            Write-Host "5. Escolha Let Google create and manage my app signing key" -ForegroundColor Blue
            Write-Host "6. Faca upload do arquivo: $pemFile" -ForegroundColor Blue
            Write-Host "7. Execute .\assinar-aab.ps1 novamente" -ForegroundColor Blue
            
            Write-Host "`nLINKS UTEIS:" -ForegroundColor Yellow
            Write-Host "- Play Console: https://play.google.com/console/" -ForegroundColor Blue
            Write-Host "- Doc Play App Signing: https://developer.android.com/studio/publish/app-signing#app-signing-google-play" -ForegroundColor Blue
        }
    }
} catch {
    Write-Host "Erro ao criar certificado: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nAlternativa: Use Android Studio para gerar o certificado" -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "Play App Signing e a solucao mais segura!" -ForegroundColor Green  
Write-Host "Google gerencia a assinatura automaticamente" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
