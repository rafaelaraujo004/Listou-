# RESOLVER CHAVE INCORRETA - Google Play Console
# Data: 17 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Red
Write-Host "        RESOLVER PROBLEMA DE CHAVE INCORRETA       " -ForegroundColor Red  
Write-Host "===================================================" -ForegroundColor Red

Write-Host "`nPROBLEMA IDENTIFICADO:" -ForegroundColor Yellow
Write-Host "- SHA1 Esperada: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Red
Write-Host "- SHA1 Atual:    29:7F:B3:B0:B4:25:10:68:16:69:7E:E4:A3:D7:D0:80:DD:79:A8:3C" -ForegroundColor Red

Write-Host "`n🔍 ANALISANDO SITUACAO..." -ForegroundColor Yellow

# Verificar se existe keystore anterior
$possibleKeystores = @(
    ".\listou-release.jks",
    ".\upload-keystore.jks", 
    ".\listou.jks",
    ".\keystore.jks",
    ".\android.jks"
)

$foundKeystore = $null
foreach ($keystore in $possibleKeystores) {
    if (Test-Path $keystore) {
        $foundKeystore = $keystore
        Write-Host "✅ Keystore encontrado: $keystore" -ForegroundColor Green
        break
    }
}

if (-not $foundKeystore) {
    Write-Host "❌ Nenhum keystore encontrado localmente" -ForegroundColor Red
}

Write-Host "`n📋 OPCOES DE SOLUCAO:" -ForegroundColor Cyan

Write-Host "`n1️⃣  USAR PLAY APP SIGNING (RECOMENDADO)" -ForegroundColor Green
Write-Host "   ✅ Deixe o Google gerenciar a assinatura automaticamente" -ForegroundColor Green
Write-Host "   ✅ Solucao mais simples e segura" -ForegroundColor Green
Write-Host "   ✅ Google cuida de tudo para voce" -ForegroundColor Green

Write-Host "`n2️⃣  RESETAR CHAVES NO CONSOLE (PERIGOSO)" -ForegroundColor Yellow  
Write-Host "   ⚠️  Requer remover o app e criar novamente" -ForegroundColor Yellow
Write-Host "   ⚠️  Perdera avaliacoes e downloads" -ForegroundColor Yellow

Write-Host "`n3️⃣  PROCURAR KEYSTORE ORIGINAL" -ForegroundColor Blue
Write-Host "   🔍 Tentar encontrar o keystore correto" -ForegroundColor Blue

$choice = Read-Host "`nEscolha uma opcao (1, 2 ou 3)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 CONFIGURANDO PLAY APP SIGNING..." -ForegroundColor Green
        
        Write-Host "`nPASSOS PARA ATIVAR PLAY APP SIGNING:" -ForegroundColor Yellow
        Write-Host "1. Va para: https://play.google.com/console/" -ForegroundColor Blue
        Write-Host "2. Selecione seu app" -ForegroundColor Blue  
        Write-Host "3. Va em: Release > Setup > App integrity" -ForegroundColor Blue
        Write-Host "4. Na secao 'App signing', clique em 'Continue'" -ForegroundColor Blue
        Write-Host "5. Escolha 'Let Google create and manage my app signing key'" -ForegroundColor Blue
        Write-Host "6. Faca upload do certificado de upload" -ForegroundColor Blue
        
        Write-Host "`n📤 GERANDO NOVO CERTIFICADO DE UPLOAD..." -ForegroundColor Yellow
        
        $uploadKeystore = ".\upload-keystore.jks" 
        $alias = "upload-key"
        $password = "listou123456"
        
        $createCmd = @"
keytool -genkey -v -keystore "$uploadKeystore" -alias "$alias" -keyalg RSA -keysize 2048 -validity 25000 -storepass "$password" -keypass "$password" -dname "CN=Listou Upload Key, OU=Development, O=Listou, L=Cidade, ST=Estado, C=BR"
"@
        
        try {
            Write-Host "Criando certificado de upload..." -ForegroundColor Blue
            Invoke-Expression $createCmd
            
            if (Test-Path $uploadKeystore) {
                Write-Host "`n✅ CERTIFICADO DE UPLOAD CRIADO!" -ForegroundColor Green
                Write-Host "Arquivo: $uploadKeystore" -ForegroundColor Blue
                Write-Host "Alias: $alias" -ForegroundColor Blue
                Write-Host "Senha: $password" -ForegroundColor Blue
                
                # Gerar arquivo PEM para upload
                Write-Host "`n📋 Gerando arquivo PEM para o Console..." -ForegroundColor Yellow
                $pemFile = ".\upload-certificate.pem"
                $exportCmd = "keytool -export -rfc -keystore `"$uploadKeystore`" -alias `"$alias`" -storepass `"$password`" -file `"$pemFile`""
                
                Invoke-Expression $exportCmd
                
                if (Test-Path $pemFile) {
                    Write-Host "✅ Arquivo PEM gerado: $pemFile" -ForegroundColor Green
                    
                    Write-Host "`n🎯 PROXIMOS PASSOS:" -ForegroundColor Yellow
                    Write-Host "1. Va para Google Play Console" -ForegroundColor Blue
                    Write-Host "2. App Integrity > App signing" -ForegroundColor Blue  
                    Write-Host "3. Faca upload do arquivo: $pemFile" -ForegroundColor Blue
                    Write-Host "4. Ative o Play App Signing" -ForegroundColor Blue
                    Write-Host "5. Execute .\assinar-aab.ps1 novamente" -ForegroundColor Blue
                    
                    # Atualizar script de assinatura
                    Write-Host "`n🔧 Atualizando script de assinatura..." -ForegroundColor Yellow
                    $updateScript = @"
# Atualizar assinar-aab.ps1 para usar novo keystore
`$keystorePath = "$uploadKeystore"
`$alias = "$alias" 
`$password = "$password"
"@
                    $updateScript | Out-File "config-keystore.ps1" -Encoding UTF8
                    Write-Host "✅ Configuracao salva em config-keystore.ps1" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "❌ Erro ao criar certificado: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n⚠️  RESETAR APP (OPCAO PERIGOSA)" -ForegroundColor Red
        Write-Host "AVISO: Esta opcao ira:" -ForegroundColor Yellow
        Write-Host "- Remover o app atual do Google Play" -ForegroundColor Red
        Write-Host "- Perder todas as avaliacoes" -ForegroundColor Red  
        Write-Host "- Perder historico de downloads" -ForegroundColor Red
        Write-Host "- Precisar criar um novo app" -ForegroundColor Red
        
        $confirm = Read-Host "`nTem CERTEZA que deseja continuar? (sim/nao)"
        if ($confirm -eq "sim") {
            Write-Host "`n📋 PASSOS PARA RESETAR:" -ForegroundColor Yellow
            Write-Host "1. Va para Google Play Console" -ForegroundColor Blue
            Write-Host "2. Selecione seu app" -ForegroundColor Blue
            Write-Host "3. Va em Setup > Advanced settings" -ForegroundColor Blue
            Write-Host "4. Clique em 'Delete app'" -ForegroundColor Blue
            Write-Host "5. Crie um novo app com novo package name" -ForegroundColor Blue
            Write-Host "6. Execute .\assinar-aab.ps1 para criar novo keystore" -ForegroundColor Blue
        } else {
            Write-Host "❌ Operacao cancelada" -ForegroundColor Green
        }
    }
    
    "3" {
        Write-Host "`n🔍 PROCURANDO KEYSTORE ORIGINAL..." -ForegroundColor Blue
        
        Write-Host "`nLocais comuns para keystores:" -ForegroundColor Yellow
        $searchPaths = @(
            "$env:USERPROFILE\.android\debug.keystore",
            "$env:USERPROFILE\keystores\",
            "$env:USERPROFILE\Documents\keystores\",
            "$env:USERPROFILE\Desktop\",
            "$env:USERPROFILE\Downloads\"
        )
        
        foreach ($path in $searchPaths) {
            if (Test-Path $path) {
                Write-Host "🔍 Procurando em: $path" -ForegroundColor Gray
                $keystores = Get-ChildItem $path -Filter "*.jks" -ErrorAction SilentlyContinue
                if ($keystores) {
                    foreach ($ks in $keystores) {
                        Write-Host "   ✅ Encontrado: $($ks.FullName)" -ForegroundColor Green
                    }
                }
            }
        }
        
        Write-Host "`n📋 DICAS PARA ENCONTRAR:" -ForegroundColor Yellow
        Write-Host "- Procure por arquivos .jks, .keystore, .p12" -ForegroundColor Blue
        Write-Host "- Verifique emails antigos com keystores" -ForegroundColor Blue
        Write-Host "- Procure em backups do computador" -ForegroundColor Blue
        Write-Host "- Verifique outros computadores usados" -ForegroundColor Blue
        Write-Host "- Procure na pasta do Android Studio" -ForegroundColor Blue
        
        $keystorePath = Read-Host "`nDigite o caminho do keystore correto (ou Enter para pular)"
        if ($keystorePath -and (Test-Path $keystorePath)) {
            Write-Host "✅ Keystore encontrado!" -ForegroundColor Green
            Write-Host "Copie este arquivo para a pasta atual e execute .\assinar-aab.ps1" -ForegroundColor Blue
            Copy-Item $keystorePath ".\listou-original.jks" -ErrorAction SilentlyContinue
        }
    }
    
    default {
        Write-Host "❌ Opcao invalida" -ForegroundColor Red
    }
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "              RESUMO E RECOMENDACOES               " -ForegroundColor Green  
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🎯 RECOMENDACAO PRINCIPAL:" -ForegroundColor Yellow
Write-Host "Use a OPCAO 1 (Play App Signing) - e a mais segura!" -ForegroundColor Green

Write-Host "`n📚 LINKS UTEIS:" -ForegroundColor Yellow
Write-Host "- Play Console: https://play.google.com/console/" -ForegroundColor Blue
Write-Host "- Documentacao Play App Signing: https://developer.android.com/studio/publish/app-signing#app-signing-google-play" -ForegroundColor Blue

Write-Host "`n❓ SE TIVER DUVIDAS:" -ForegroundColor Yellow  
Write-Host "1. Execute: .\resolver-chave-incorreta.ps1 novamente" -ForegroundColor Blue
Write-Host "2. Escolha opcao 1 para Play App Signing" -ForegroundColor Blue

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
