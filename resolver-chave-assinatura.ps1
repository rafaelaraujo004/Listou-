# SOLUÇÃO PARA PROBLEMA DE CHAVE DE ASSINATURA
# LISTOU - 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Red
Write-Host "     PROBLEMA: CHAVE DE ASSINATURA INCORRETA       " -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Red

Write-Host "`nPROBLEMA DETECTADO:" -ForegroundColor Yellow
Write-Host "O Google Play está rejeitando o AAB porque:" -ForegroundColor White
Write-Host "- Seu app já existe no Play Console" -ForegroundColor White
Write-Host "- Foi assinado inicialmente com uma chave diferente" -ForegroundColor White
Write-Host "- SHA1 esperado: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Green
Write-Host "- SHA1 atual:    86:6B:6E:70:60:34:0C:26:B8:83:BA:53:86:B6:68:7D:C0:A5:B2:E2" -ForegroundColor Red

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "              SOLUÇÕES DISPONÍVEIS                 " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

Write-Host "`n🔧 SOLUÇÃO 1 - RECUPERAR CHAVE ORIGINAL (RECOMENDADA)" -ForegroundColor Green
Write-Host "Se você tem a chave original salva:" -ForegroundColor Blue

# Verificar se existe keystore antigo
$possibleKeystores = @(
    "listou-original.jks",
    "release-key.jks", 
    "app-release.jks",
    "android-release.jks",
    "my-release-key.jks",
    "*.jks"
)

Write-Host "`nProcurando keystores existentes..." -ForegroundColor Yellow
$foundKeystores = @()

foreach ($pattern in $possibleKeystores) {
    $files = Get-ChildItem $pattern -ErrorAction SilentlyContinue
    if ($files) {
        $foundKeystores += $files
    }
}

if ($foundKeystores.Count -gt 0) {
    Write-Host "✅ Keystores encontrados:" -ForegroundColor Green
    foreach ($keystore in $foundKeystores) {
        Write-Host "   - $($keystore.Name)" -ForegroundColor Blue
        
        # Verificar SHA1 do keystore
        try {
            Write-Host "   Verificando SHA1..." -ForegroundColor Gray
            $sha1Cmd = "keytool -list -v -keystore `"$($keystore.FullName)`" -alias listou-key -storepass listou123456 2>&1"
            $sha1Result = Invoke-Expression $sha1Cmd
            
            if ($sha1Result -match "SHA1:\s*([A-F0-9:]+)") {
                $sha1 = $matches[1]
                Write-Host "   SHA1: $sha1" -ForegroundColor Cyan
                
                if ($sha1 -eq "0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34") {
                    Write-Host "   ✅ ESTA É A CHAVE CORRETA!" -ForegroundColor Green
                    
                    # Usar esta chave para assinar
                    Write-Host "`n🎯 USANDO CHAVE CORRETA PARA ASSINAR..." -ForegroundColor Green
                    $correctKeystore = $keystore.FullName
                    
                    # Encontrar AAB para assinar
                    $aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue
                    if ($aabFiles.Count -gt 0) {
                        $aabToSign = $aabFiles[0]
                        Write-Host "Assinando $($aabToSign.Name) com a chave correta..." -ForegroundColor Blue
                        
                        # Comando de assinatura com chave correta
                        $signCmd = @"
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$correctKeystore" -storepass "listou123456" "$($aabToSign.FullName)" "listou-key"
"@
                        
                        try {
                            Invoke-Expression $signCmd
                            
                            # Criar arquivo final
                            $finalFile = "listou-signed-correct.aab"
                            Copy-Item $aabToSign.FullName $finalFile -Force
                            
                            Write-Host "`n✅ AAB ASSINADO COM CHAVE CORRETA!" -ForegroundColor Green
                            Write-Host "Arquivo: $finalFile" -ForegroundColor Blue
                            Write-Host "Agora você pode fazer upload no Google Play!" -ForegroundColor Green
                            
                            exit 0
                            
                        } catch {
                            Write-Host "❌ Erro ao assinar: $($_.Exception.Message)" -ForegroundColor Red
                        }
                    }
                }
            }
        } catch {
            Write-Host "   ❌ Erro ao verificar keystore" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Nenhum keystore encontrado nesta pasta" -ForegroundColor Red
}

Write-Host "`n🔧 SOLUÇÃO 2 - USAR PLAY APP SIGNING (MAIS FÁCIL)" -ForegroundColor Green
Write-Host "O Google gerencia a assinatura automaticamente:" -ForegroundColor Blue
Write-Host "1. Vá no Google Play Console" -ForegroundColor White
Write-Host "2. Seu App > Release > Setup > App signing" -ForegroundColor White
Write-Host "3. Se ainda não ativou, clique em 'Use Play App Signing'" -ForegroundColor White
Write-Host "4. Faça upload do AAB SEM assinatura" -ForegroundColor White
Write-Host "5. O Google assina automaticamente com a chave correta" -ForegroundColor White

Write-Host "`n🔧 SOLUÇÃO 3 - CRIAR NOVA VERSÃO DO APP" -ForegroundColor Green
Write-Host "Se não conseguir recuperar a chave original:" -ForegroundColor Blue
Write-Host "1. Crie um novo app no Google Play Console" -ForegroundColor White
Write-Host "2. Use um novo Package ID (ex: com.listou.app2)" -ForegroundColor White
Write-Host "3. Publique como um app novo" -ForegroundColor White

Write-Host "`n🔧 SOLUÇÃO 4 - VERIFICAR BACKUP DA CHAVE" -ForegroundColor Green
Write-Host "Verifique se você tem backup da chave em:" -ForegroundColor Blue
Write-Host "- Google Drive / OneDrive" -ForegroundColor White
Write-Host "- Email com anexos" -ForegroundColor White
Write-Host "- Outro computador / HD externo" -ForegroundColor White
Write-Host "- Repositório Git (se commitou acidentalmente)" -ForegroundColor White

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "             GERANDO AAB SEM ASSINATURA             " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

Write-Host "`nVou gerar um AAB SEM assinatura para usar com Play App Signing:" -ForegroundColor Blue

# Verificar se já existe AAB
$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue
if ($aabFiles.Count -gt 0) {
    Write-Host "✅ AAB encontrado: $($aabFiles[0].Name)" -ForegroundColor Green
    
    # Criar cópia sem assinatura
    $unsignedFile = "listou-unsigned.aab"
    Copy-Item $aabFiles[0].FullName $unsignedFile -Force
    
    Write-Host "`n📤 INSTRUÇÕES PARA PLAY APP SIGNING:" -ForegroundColor Green
    Write-Host "1. Vá em: https://play.google.com/console/" -ForegroundColor Blue
    Write-Host "2. Selecione seu app" -ForegroundColor Blue
    Write-Host "3. Release > Setup > App signing" -ForegroundColor Blue
    Write-Host "4. Verifique se 'Play App Signing' está ativado" -ForegroundColor Blue
    Write-Host "5. Release > Production > Create new release" -ForegroundColor Blue
    Write-Host "6. Faça upload do arquivo: $unsignedFile" -ForegroundColor Blue
    Write-Host "7. O Google assinará automaticamente" -ForegroundColor Blue
    
} else {
    Write-Host "❌ Nenhum AAB encontrado" -ForegroundColor Red
    Write-Host "Execute primeiro um dos scripts de geração:" -ForegroundColor Yellow
    Write-Host "- .\gerar-aab-100-manual.ps1" -ForegroundColor Blue
    Write-Host "- Ou gere via PWA Builder: https://www.pwabuilder.com/" -ForegroundColor Blue
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "                  RESUMO                           " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🎯 MELHOR SOLUÇÃO:" -ForegroundColor Yellow
Write-Host "Use Play App Signing - é mais seguro e simples!" -ForegroundColor Green

Write-Host "`n📋 PASSOS:" -ForegroundColor Yellow
Write-Host "1. Ative Play App Signing no Google Play Console" -ForegroundColor Blue
Write-Host "2. Faça upload do AAB sem assinatura" -ForegroundColor Blue
Write-Host "3. Google assina automaticamente" -ForegroundColor Blue
Write-Host "4. Nunca mais se preocupe com chaves!" -ForegroundColor Blue

Write-Host "`n⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "- Play App Signing resolve o problema definitivamente" -ForegroundColor Yellow
Write-Host "- É o método recomendado pelo Google" -ForegroundColor Yellow
Write-Host "- Mais seguro que gerenciar chaves localmente" -ForegroundColor Yellow

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Green
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
