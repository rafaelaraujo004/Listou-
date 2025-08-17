# CORRIGIR CHAVE DE ASSINATURA - USAR KEYSTORE ORIGINAL
# Data: 16 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Red
Write-Host "       ERRO DE CHAVE DE ASSINATURA DETECTADO       " -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Red

Write-Host "`nO Google Play Console rejeitou o AAB porque:" -ForegroundColor Yellow
Write-Host "❌ Chave usada: 86:6B:6E:70:60:34:0C:26:B8:83:BA:53:86:B6:68:7D:C0:A5:B2:E2" -ForegroundColor Red
Write-Host "✅ Chave esperada: 0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34" -ForegroundColor Green

Write-Host "`n🔍 VERIFICANDO KEYSTORES EXISTENTES..." -ForegroundColor Yellow

# Procurar keystores na pasta
$keystores = Get-ChildItem "*.jks", "*.keystore", "*.p12" -ErrorAction SilentlyContinue

Write-Host "`nKeystores encontrados:" -ForegroundColor Blue
if ($keystores.Count -eq 0) {
    Write-Host "❌ Nenhum keystore encontrado nesta pasta" -ForegroundColor Red
} else {
    foreach ($ks in $keystores) {
        Write-Host "  📁 $($ks.Name)" -ForegroundColor Blue
        
        # Tentar verificar a impressão digital do keystore
        try {
            Write-Host "     Verificando impressão digital..." -ForegroundColor Gray
            $keystoreInfo = keytool -list -keystore $ks.FullName -storepass "listou123456" 2>&1
            
            if ($keystoreInfo -match "SHA1: ([A-F0-9:]+)") {
                $fingerprint = $matches[1]
                Write-Host "     SHA1: $fingerprint" -ForegroundColor Cyan
                
                if ($fingerprint -eq "0E:63:D1:E4:E4:9B:35:34:B2:F0:52:BD:06:E2:02:83:56:87:7B:34") {
                    Write-Host "     ✅ ESTA É A CHAVE CORRETA!" -ForegroundColor Green
                    $correctKeystore = $ks.FullName
                } else {
                    Write-Host "     ❌ Chave incorreta" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "     ⚠️ Não foi possível verificar (senha pode estar incorreta)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "                  SOLUÇÕES                         " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

Write-Host "`n🔑 SOLUÇÃO 1 - ENCONTRAR KEYSTORE ORIGINAL:" -ForegroundColor Green
Write-Host "1. Procure pelo keystore original que você usou para publicar o app" -ForegroundColor Blue
Write-Host "2. Pode estar em:" -ForegroundColor Blue
Write-Host "   - Pasta de outro projeto anterior" -ForegroundColor Gray
Write-Host "   - Backup do computador" -ForegroundColor Gray
Write-Host "   - Outro desenvolvedor da equipe" -ForegroundColor Gray
Write-Host "   - Android Studio (~/.android/)" -ForegroundColor Gray

Write-Host "`n📋 PARA USAR KEYSTORE ORIGINAL:" -ForegroundColor Blue
Write-Host "1. Copie o keystore original para esta pasta" -ForegroundColor Gray
Write-Host "2. Renomeie para 'listou-original.jks'" -ForegroundColor Gray
Write-Host "3. Execute: .\corrigir-assinatura-original.ps1" -ForegroundColor Gray

Write-Host "`n🆕 SOLUÇÃO 2 - CRIAR NOVO APP (RECOMENDADO):" -ForegroundColor Green
Write-Host "Se você não tem o keystore original:" -ForegroundColor Blue
Write-Host "1. Crie um NOVO app no Google Play Console" -ForegroundColor Gray
Write-Host "2. Use novo Package ID (ex: com.listou.app.v2)" -ForegroundColor Gray
Write-Host "3. Configure Play App Signing desde o início" -ForegroundColor Gray
Write-Host "4. Publique como app novo" -ForegroundColor Gray

Write-Host "`n🔄 SOLUÇÃO 3 - PLAY APP SIGNING (MAIS FÁCIL):" -ForegroundColor Green
Write-Host "1. No Google Play Console, vá em Release > Setup > App signing" -ForegroundColor Blue
Write-Host "2. Se ainda não configurou, ative 'Use Play App Signing'" -ForegroundColor Blue
Write-Host "3. Faça upload de um AAB NÃO ASSINADO" -ForegroundColor Blue
Write-Host "4. O Google gerencia a assinatura automaticamente" -ForegroundColor Blue

Write-Host "`n⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "- Se o app já está publicado, você DEVE usar o keystore original" -ForegroundColor Yellow
Write-Host "- Keystores diferentes = apps diferentes no Google Play" -ForegroundColor Yellow
Write-Host "- Não é possível alterar a chave de um app já publicado" -ForegroundColor Yellow

# Perguntar qual solução o usuário prefere
Write-Host "`n❓ QUAL SOLUÇÃO VOCÊ PREFERE?" -ForegroundColor Yellow
Write-Host "1 - Tenho o keystore original (mais rápido)" -ForegroundColor Blue
Write-Host "2 - Criar novo app no Google Play Console" -ForegroundColor Blue
Write-Host "3 - Usar Play App Signing (sem keystore local)" -ForegroundColor Blue
Write-Host "4 - Procurar keystore original em outros locais" -ForegroundColor Blue

$choice = Read-Host "`nDigite sua escolha (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🔑 OPÇÃO 1 SELECIONADA" -ForegroundColor Green
        Write-Host "1. Copie seu keystore original para esta pasta" -ForegroundColor Blue
        Write-Host "2. Pressione Enter quando estiver pronto" -ForegroundColor Blue
        Read-Host
        
        # Verificar novamente keystores
        $keystores = Get-ChildItem "*.jks", "*.keystore", "*.p12" -ErrorAction SilentlyContinue
        Write-Host "Keystores atuais:" -ForegroundColor Yellow
        foreach ($ks in $keystores) {
            Write-Host "  - $($ks.Name)" -ForegroundColor Blue
        }
        
        $keystoreName = Read-Host "`nDigite o nome do keystore original"
        $alias = Read-Host "Digite o alias da chave"
        $password = Read-Host "Digite a senha do keystore" -AsSecureString
        $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        # Criar script personalizado
        $customScript = @"
# ASSINAR COM KEYSTORE ORIGINAL
Write-Host "Assinando com keystore original..." -ForegroundColor Green

`$aabFiles = Get-ChildItem "*.aab" | Where-Object { `$_.Name -notmatch "-signed" }
if (`$aabFiles.Count -eq 0) {
    Write-Host "Nenhum AAB não assinado encontrado!" -ForegroundColor Red
    exit 1
}

`$inputFile = `$aabFiles[0].FullName
`$outputFile = `$inputFile -replace "\.aab$", "-signed-original.aab"

`$signCmd = "jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore `"$keystoreName`" -storepass `"$passwordText`" `"`$inputFile`" `"$alias`""

Write-Host "Comando: `$signCmd" -ForegroundColor Gray
Invoke-Expression `$signCmd

Copy-Item `$inputFile `$outputFile -Force
Write-Host "AAB assinado com chave original: `$outputFile" -ForegroundColor Green
"@
        
        Set-Content "assinar-com-original.ps1" $customScript
        Write-Host "`nScript criado: assinar-com-original.ps1" -ForegroundColor Green
        Write-Host "Execute: .\assinar-com-original.ps1" -ForegroundColor Blue
    }
    
    "2" {
        Write-Host "`n🆕 OPÇÃO 2 SELECIONADA" -ForegroundColor Green
        Write-Host "`nPASSOS PARA CRIAR NOVO APP:" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://play.google.com/console/" -ForegroundColor Blue
        Write-Host "2. Clique em 'Create app'" -ForegroundColor Blue
        Write-Host "3. Use um novo Package ID:" -ForegroundColor Blue
        Write-Host "   Sugestões:" -ForegroundColor Gray
        Write-Host "   - com.listou.app.v2" -ForegroundColor Cyan
        Write-Host "   - com.listou.shopping" -ForegroundColor Cyan
        Write-Host "   - com.listou.lista" -ForegroundColor Cyan
        Write-Host "4. Configure Play App Signing desde o início" -ForegroundColor Blue
        Write-Host "5. Faça upload do AAB atual (será assinado automaticamente)" -ForegroundColor Blue
        
        # Modificar manifest para novo package ID
        Write-Host "`n📝 VAMOS ALTERAR O PACKAGE ID NO SEU PWA?" -ForegroundColor Yellow
        $newPackageId = Read-Host "Digite o novo Package ID (ex: com.listou.app.v2)"
        
        if ($newPackageId) {
            # Nota: PWAs não têm package ID no manifest, mas podemos documentar
            Write-Host "`n📋 ANOTE ESTAS INFORMAÇÕES:" -ForegroundColor Green
            Write-Host "Package ID para usar no PWA Builder: $newPackageId" -ForegroundColor Cyan
            Write-Host "App Name: Listou" -ForegroundColor Cyan
            Write-Host "Version: 1.0.0" -ForegroundColor Cyan
            
            # Criar arquivo de configurações
            $config = @{
                "newPackageId" = $newPackageId
                "appName" = "Listou"
                "version" = "1.0.0"
                "instructions" = "Use estas configurações no PWA Builder quando gerar novo AAB"
            }
            $config | ConvertTo-Json | Set-Content "novo-app-config.json"
            Write-Host "`nConfigurações salvas em: novo-app-config.json" -ForegroundColor Blue
        }
    }
    
    "3" {
        Write-Host "`n🔄 OPÇÃO 3 SELECIONADA" -ForegroundColor Green
        Write-Host "`nPASSOS PARA PLAY APP SIGNING:" -ForegroundColor Yellow
        Write-Host "1. No Google Play Console do seu app existente" -ForegroundColor Blue
        Write-Host "2. Vá em: Release > Setup > App signing" -ForegroundColor Blue
        Write-Host "3. Se possível, ative 'Use Play App Signing'" -ForegroundColor Blue
        Write-Host "4. Gere um AAB NÃO ASSINADO:" -ForegroundColor Blue
        Write-Host "   - Use PWA Builder normal" -ForegroundColor Gray
        Write-Host "   - NÃO execute assinar-aab.ps1" -ForegroundColor Gray
        Write-Host "   - Faça upload direto do AAB do PWA Builder" -ForegroundColor Gray
        
        Write-Host "`n⚠️ ATENÇÃO:" -ForegroundColor Red
        Write-Host "Play App Signing só pode ser ativado uma vez." -ForegroundColor Yellow
        Write-Host "Se já foi configurado antes, você precisa da chave original." -ForegroundColor Yellow
    }
    
    "4" {
        Write-Host "`n🔍 OPÇÃO 4 SELECIONADA" -ForegroundColor Green
        Write-Host "`nLOCAIS COMUNS PARA KEYSTORES:" -ForegroundColor Yellow
        Write-Host "Windows:" -ForegroundColor Blue
        Write-Host "  - %USERPROFILE%\.android\" -ForegroundColor Gray
        Write-Host "  - C:\Users\[seu-usuario]\.android\" -ForegroundColor Gray
        Write-Host "  - Pasta Documents\Android\" -ForegroundColor Gray
        Write-Host "  - Desktop\keystores\" -ForegroundColor Gray
        
        Write-Host "`nAndroid Studio:" -ForegroundColor Blue
        Write-Host "  - Pasta do projeto anterior" -ForegroundColor Gray
        Write-Host "  - Build\generated\signed-apk\" -ForegroundColor Gray
        
        Write-Host "`nComandos para procurar:" -ForegroundColor Blue
        Write-Host "dir /s *.jks" -ForegroundColor Cyan
        Write-Host "dir /s *.keystore" -ForegroundColor Cyan
        
        Write-Host "`nSe encontrar, copie para esta pasta e execute novamente!" -ForegroundColor Green
    }
}

Write-Host "`nPressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
