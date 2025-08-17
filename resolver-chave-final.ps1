# RESOLVER PROBLEMA DE CHAVE DE ASSINATURA
# LISTOU - 16 de agosto de 2025

Clear-Host

Write-Host "PROBLEMA: CHAVE DE ASSINATURA INCORRETA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red

Write-Host ""
Write-Host "O Google Play esta rejeitando seu AAB porque:" -ForegroundColor Yellow
Write-Host "- SHA1 esperado: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Green
Write-Host "- SHA1 atual:    86:6B:6E:70:60:34:0C:26:B8:83:BA:53:86:B6:68:7D:C0:A5:B2:E2" -ForegroundColor Red

Write-Host ""
Write-Host "SOLUCAO MAIS FACIL: PLAY APP SIGNING" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host ""
Write-Host "VANTAGENS DO PLAY APP SIGNING:" -ForegroundColor Yellow
Write-Host "- Google gerencia a assinatura automaticamente" -ForegroundColor Blue
Write-Host "- Nao precisa se preocupar com chaves" -ForegroundColor Blue
Write-Host "- Mais seguro" -ForegroundColor Blue
Write-Host "- Resolve seu problema atual" -ForegroundColor Blue

Write-Host ""
Write-Host "PASSO A PASSO:" -ForegroundColor Yellow

Write-Host ""
Write-Host "1. ATIVAR PLAY APP SIGNING:" -ForegroundColor Green
Write-Host "   - Acesse: https://play.google.com/console/" -ForegroundColor Blue
Write-Host "   - Selecione seu app" -ForegroundColor Blue
Write-Host "   - Va em: Release > Setup > App signing" -ForegroundColor Blue
Write-Host "   - Clique em 'Use Play App Signing'" -ForegroundColor Blue

Write-Host ""
Write-Host "2. GERAR AAB SEM ASSINATURA:" -ForegroundColor Green

# Verificar se ja tem AAB
$aabFiles = Get-ChildItem "*.aab" -ErrorAction SilentlyContinue

if ($aabFiles.Count -gt 0) {
    Write-Host "   AAB encontrado: $($aabFiles[0].Name)" -ForegroundColor Blue
    
    # Criar versao sem assinatura
    $originalAab = $aabFiles[0]
    $unsignedAab = "listou-unsigned-for-play-signing.aab"
    
    Copy-Item $originalAab.FullName $unsignedAab -Force
    
    Write-Host "   Criado AAB sem assinatura: $unsignedAab" -ForegroundColor Green
    
} else {
    Write-Host "   Nenhum AAB encontrado" -ForegroundColor Red
    Write-Host "   Execute: .\gerar-aab-100-manual.ps1" -ForegroundColor Blue
    Write-Host "   Ou gere pelo PWA Builder: https://www.pwabuilder.com/" -ForegroundColor Blue
}

Write-Host ""
Write-Host "3. FAZER UPLOAD:" -ForegroundColor Green
Write-Host "   - Release > Production > Create new release" -ForegroundColor Blue
Write-Host "   - Faca upload do AAB SEM assinatura" -ForegroundColor Blue
Write-Host "   - Google assinara automaticamente" -ForegroundColor Blue

Write-Host ""
Write-Host "METODO ALTERNATIVO (SE TIVER A CHAVE)" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "Se voce tem a chave original salva:" -ForegroundColor Blue

# Procurar possiveis keystores
Write-Host ""
Write-Host "Procurando keystores..." -ForegroundColor Yellow
$keystores = Get-ChildItem "*.jks" -ErrorAction SilentlyContinue

if ($keystores.Count -gt 0) {
    Write-Host "Keystores encontrados:" -ForegroundColor Green
    foreach ($keystore in $keystores) {
        Write-Host "  - $($keystore.Name)" -ForegroundColor Blue
    }
    
    Write-Host ""
    Write-Host "Para verificar qual e a chave correta, execute:" -ForegroundColor Yellow
    Write-Host "keytool -list -v -keystore NOME_DO_KEYSTORE.jks" -ForegroundColor Blue
    Write-Host "E procure pela SHA1: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Green
    
} else {
    Write-Host "Nenhum keystore encontrado nesta pasta" -ForegroundColor Red
}

Write-Host ""
Write-Host "RECOMENDACAO" -ForegroundColor Green
Write-Host "============" -ForegroundColor Green

Write-Host ""
Write-Host "USE O PLAY APP SIGNING!" -ForegroundColor Yellow
Write-Host "E a solucao mais simples e segura." -ForegroundColor Green

Write-Host ""
Write-Host "PASSOS FINAIS:" -ForegroundColor Yellow
Write-Host "1. Ative Play App Signing no Google Play Console" -ForegroundColor Blue
Write-Host "2. Gere um AAB novo (sem assinatura)" -ForegroundColor Blue
Write-Host "3. Faca upload - Google assina automaticamente" -ForegroundColor Blue
Write-Host "4. Nunca mais se preocupe com chaves!" -ForegroundColor Blue

Write-Host ""
Write-Host "PARA GERAR NOVO AAB:" -ForegroundColor Yellow
Write-Host "Execute: .\gerar-aab-100-manual.ps1" -ForegroundColor Blue
Write-Host "Ou use: https://www.pwabuilder.com/ com http://localhost:8080" -ForegroundColor Blue

Write-Host ""
Write-Host "Pressione qualquer tecla para finalizar..." -ForegroundColor Green
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
