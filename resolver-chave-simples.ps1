# RESOLVER PROBLEMA DE CHAVE DE ASSINATURA
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Red
Write-Host "     ERRO: CHAVE DE ASSINATURA INCORRETA           " -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Red

Write-Host "`nO Google Play Console rejeitou seu AAB porque:" -ForegroundColor Yellow
Write-Host "❌ Chave atual: 86:6B:6E:70:60:34:0C:26:B8:83:BA:53:86:B6:68:7D:C0:A5:B2:E2" -ForegroundColor Red
Write-Host "✅ Chave esperada: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Green

Write-Host "`n🔍 Procurando keystores existentes..." -ForegroundColor Yellow
$keystores = Get-ChildItem "*.jks", "*.keystore", "*.p12" -ErrorAction SilentlyContinue

if ($keystores.Count -gt 0) {
    Write-Host "Keystores encontrados:" -ForegroundColor Blue
    foreach ($ks in $keystores) {
        Write-Host "  - $($ks.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "Nenhum keystore encontrado nesta pasta." -ForegroundColor Yellow
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "              SOLUÇÕES DISPONÍVEIS                 " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n🥇 SOLUÇÃO 1 - CRIAR NOVO APP (RECOMENDADO):" -ForegroundColor Green
Write-Host "• Crie um novo app no Google Play Console" -ForegroundColor Blue
Write-Host "• Use novo Package ID (ex: com.listou.app.v2)" -ForegroundColor Blue
Write-Host "• Ative Play App Signing desde o início" -ForegroundColor Blue
Write-Host "• Sem problemas de chave" -ForegroundColor Blue
Write-Host "Execute: .\criar-novo-app.ps1" -ForegroundColor Cyan

Write-Host "`n🥈 SOLUÇÃO 2 - ENCONTRAR KEYSTORE ORIGINAL:" -ForegroundColor Yellow
Write-Host "• Procure o keystore que gerou a chave original" -ForegroundColor Blue
Write-Host "• Pode estar em pasta de projeto anterior" -ForegroundColor Blue
Write-Host "• Ou em backup do Android Studio" -ForegroundColor Blue
Write-Host "• Locais comuns:" -ForegroundColor Blue
Write-Host "  - %USERPROFILE%\.android\" -ForegroundColor Gray
Write-Host "  - Pasta Documents\Android\" -ForegroundColor Gray
Write-Host "  - Desktop ou Downloads" -ForegroundColor Gray

Write-Host "`n🥉 SOLUÇÃO 3 - USAR AAB NÃO ASSINADO:" -ForegroundColor Yellow
Write-Host "• Se seu app tem Play App Signing ativado" -ForegroundColor Blue
Write-Host "• Gere AAB no PWA Builder" -ForegroundColor Blue
Write-Host "• NÃO execute assinar-aab.ps1" -ForegroundColor Blue
Write-Host "• Faça upload direto (Google assina)" -ForegroundColor Blue

Write-Host "`n❓ Qual solução você prefere?" -ForegroundColor Yellow
Write-Host "1 - Criar novo app (mais fácil)" -ForegroundColor Blue
Write-Host "2 - Procurar keystore original" -ForegroundColor Blue
Write-Host "3 - Usar AAB não assinado" -ForegroundColor Blue

$choice = Read-Host "`nDigite sua escolha (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n🆕 Executando criação de novo app..." -ForegroundColor Green
        if (Test-Path "criar-novo-app.ps1") {
            powershell -ExecutionPolicy Bypass -File "criar-novo-app.ps1"
        } else {
            Write-Host "❌ Script criar-novo-app.ps1 não encontrado!" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n🔍 COMO PROCURAR KEYSTORE ORIGINAL:" -ForegroundColor Green
        Write-Host "`nComandos para procurar no Windows:" -ForegroundColor Yellow
        Write-Host "dir /s *.jks" -ForegroundColor Cyan
        Write-Host "dir /s *.keystore" -ForegroundColor Cyan
        Write-Host "dir /s *.p12" -ForegroundColor Cyan
        
        Write-Host "`nPastas para verificar:" -ForegroundColor Yellow
        Write-Host "• C:\Users\$env:USERNAME\.android\" -ForegroundColor Blue
        Write-Host "• C:\Users\$env:USERNAME\Documents\" -ForegroundColor Blue
        Write-Host "• C:\Users\$env:USERNAME\Desktop\" -ForegroundColor Blue
        Write-Host "• Pasta de projetos Android antigos" -ForegroundColor Blue
        
        Write-Host "`nSe encontrar o keystore original:" -ForegroundColor Green
        Write-Host "1. Copie para esta pasta" -ForegroundColor Blue
        Write-Host "2. Renomeie para 'original.jks'" -ForegroundColor Blue
        Write-Host "3. Execute: .\assinar-aab.ps1" -ForegroundColor Blue
        Write-Host "   (mas mude a senha no script para a senha correta)" -ForegroundColor Blue
    }
    
    "3" {
        Write-Host "`n🔄 USANDO AAB NÃO ASSINADO:" -ForegroundColor Green
        Write-Host "`nPASSOS:" -ForegroundColor Yellow
        Write-Host "1. Verifique se Play App Signing está ativo:" -ForegroundColor Blue
        Write-Host "   • Google Play Console > Release > Setup > App signing" -ForegroundColor Gray
        Write-Host "2. Se estiver ativo, gere novo AAB:" -ForegroundColor Blue
        Write-Host "   • Use PWA Builder: https://www.pwabuilder.com/" -ForegroundColor Gray
        Write-Host "   • URL: http://localhost:8080" -ForegroundColor Gray
        Write-Host "   • Download do AAB" -ForegroundColor Gray
        Write-Host "3. Faça upload DIRETO (sem assinar)" -ForegroundColor Blue
        
        Write-Host "`n⚠️ IMPORTANTE:" -ForegroundColor Red
        Write-Host "Se Play App Signing NÃO estiver ativo, você precisa da chave original." -ForegroundColor Yellow
    }
    
    default {
        Write-Host "`n❌ Opção inválida!" -ForegroundColor Red
    }
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "RESUMO DAS OPÇÕES:" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`n💡 RECOMENDAÇÃO:" -ForegroundColor Yellow
Write-Host "Se você não tem certeza sobre o keystore original," -ForegroundColor Blue
Write-Host "a opção mais segura é criar um novo app." -ForegroundColor Blue
Write-Host "É rápido, simples e evita todos os problemas de chave." -ForegroundColor Blue

Write-Host "`nArquivos criados para ajudar:" -ForegroundColor Green
Write-Host "• criar-novo-app.ps1 - Para novo app" -ForegroundColor Blue
Write-Host "• assinar-aab.ps1 - Para assinatura local (modificado)" -ForegroundColor Blue

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
