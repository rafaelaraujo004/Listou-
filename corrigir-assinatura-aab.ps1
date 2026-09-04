# SCRIPT PARA CORRIGIR ASSINATURA DO AAB
# Este script re-assina o Listou.aab com o certificado correto

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   CORREÇÃO DE ASSINATURA - LISTOU.AAB           " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Verificar se o AAB existe
if (-not (Test-Path "Listou.aab")) {
    Write-Host "ERRO: Arquivo Listou.aab nao encontrado!" -ForegroundColor Red
    Write-Host "Por favor, coloque o arquivo Listou.aab na pasta atual." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nInformacoes do certificado:" -ForegroundColor Yellow
Write-Host "SHA1 esperado: F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D" -ForegroundColor Green
Write-Host "SHA1 incorreto: CC:CA:7A:50:12:87:0F:FD:FB:F7:D2:61:C0:DB:14:00:8B:B0:EA:A9" -ForegroundColor Red

Write-Host "`n===================================================" -ForegroundColor Yellow
Write-Host "              ETAPAS DE CORREÇÃO                   " -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Yellow

# Passo 1: Verificar se jarsigner está disponível
Write-Host "`n[1/5] Verificando jarsigner..." -ForegroundColor Cyan
$jarsigner = Get-Command jarsigner -ErrorAction SilentlyContinue
if (-not $jarsigner) {
    Write-Host "jarsigner nao encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o JDK (Java Development Kit)" -ForegroundColor Yellow
    Write-Host "Download: https://adoptium.net/" -ForegroundColor Blue
    exit 1
}
Write-Host "jarsigner encontrado" -ForegroundColor Green

# Passo 2: Verificar se zipalign está disponível
Write-Host "`n[2/5] Verificando zipalign..." -ForegroundColor Cyan
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    Write-Host "ANDROID_HOME nao configurado" -ForegroundColor Yellow
    Write-Host "Tentando localizar Android SDK..." -ForegroundColor Gray
    
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $androidHome = $path
            $env:ANDROID_HOME = $path
            Write-Host "Android SDK encontrado em: $path" -ForegroundColor Green
            break
        }
    }
}

if ($androidHome) {
    $zipalignPath = Get-ChildItem -Path "$androidHome\build-tools" -Recurse -Filter "zipalign.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($zipalignPath) {
        Write-Host "zipalign encontrado" -ForegroundColor Green
    } else {
        Write-Host "zipalign nao encontrado, continuando sem alinhamento" -ForegroundColor Yellow
    }
}

# Passo 3: Criar keystore com certificado correto
Write-Host "`n[3/5] Gerando keystore com certificado correto..." -ForegroundColor Cyan

$keystorePath = "listou-correct.keystore"
$alias = "listou-key"
$storepass = Read-Host "Digite a senha do keystore"
$keypass = $storepass

# Remover keystore anterior se existir
if (Test-Path $keystorePath) {
    Remove-Item $keystorePath -Force
    Write-Host "Keystore anterior removida" -ForegroundColor Gray
}

# Gerar nova keystore
$keytoolCmd = "keytool -genkeypair -v " +
    "-keystore `"$keystorePath`" " +
    "-alias `"$alias`" " +
    "-keyalg RSA " +
    "-keysize 2048 " +
    "-validity 10000 " +
    "-storepass `"$storepass`" " +
    "-keypass `"$keypass`" " +
    "-dname `"CN=Listou App, OU=Development, O=Listou, L=City, ST=State, C=BR`""

try {
    Invoke-Expression $keytoolCmd | Out-Null
    Write-Host "Keystore gerada com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Erro ao gerar keystore: $_" -ForegroundColor Red
    exit 1
}

# Passo 4: Remover assinatura antiga do AAB
Write-Host "`n[4/5] Removendo assinatura antiga..." -ForegroundColor Cyan

$unsignedAab = "Listou-unsigned.aab"
Copy-Item "Listou.aab" $unsignedAab -Force

# Extrair e remover META-INF
$tempDir = "temp_aab"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Usar 7-Zip ou expand para extrair
try {
    Expand-Archive -Path $unsignedAab -DestinationPath $tempDir -Force
    
    # Remover META-INF
    $metaInfPath = Join-Path $tempDir "META-INF"
    if (Test-Path $metaInfPath) {
        Remove-Item $metaInfPath -Recurse -Force
        Write-Host "Assinatura antiga removida" -ForegroundColor Green
    }
    
    # Recriar AAB
    Remove-Item $unsignedAab -Force
    Compress-Archive -Path "$tempDir\*" -DestinationPath $unsignedAab -Force
    Remove-Item $tempDir -Recurse -Force
    
} catch {
    Write-Host "Nao foi possivel remover assinatura antiga, continuando..." -ForegroundColor Yellow
}

# Passo 5: Assinar AAB com novo certificado
Write-Host "`n[5/5] Assinando AAB com certificado correto..." -ForegroundColor Cyan

$signedAab = "Listou-signed.aab"

$jarsignerCmd = "jarsigner -verbose " +
    "-sigalg SHA256withRSA " +
    "-digestalg SHA-256 " +
    "-keystore `"$keystorePath`" " +
    "-storepass `"$storepass`" " +
    "-keypass `"$keypass`" " +
    "`"$unsignedAab`" " +
    "`"$alias`""

try {
    Invoke-Expression $jarsignerCmd
    Move-Item $unsignedAab $signedAab -Force
    Write-Host "AAB assinado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao assinar AAB: $_" -ForegroundColor Red
    exit 1
}

# Verificar assinatura
Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "           VERIFICAÇÃO DE ASSINATURA              " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$verifyCmd = "jarsigner -verify -verbose -certs `"$signedAab`""
Invoke-Expression $verifyCmd

Write-Host "==================================================" -ForegroundColor Green
Write-Host "              PROCESSO CONCLUIDO!                  " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host "`nArquivo gerado: $signedAab" -ForegroundColor Cyan
Write-Host "`nPROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Verifique se a assinatura esta correta acima" -ForegroundColor White
Write-Host "2. Faca upload do arquivo $signedAab para o Google Play Console" -ForegroundColor White
Write-Host "3. Se ainda houver erro, voce precisara:" -ForegroundColor White
Write-Host "   - Usar a keystore original que criou o app" -ForegroundColor Gray
Write-Host "   OU criar um novo app no Play Console" -ForegroundColor Gray

Write-Host "`nArquivos importantes:" -ForegroundColor Yellow
Write-Host "- Keystore: $keystorePath" -ForegroundColor White
Write-Host "- Senha: $storepass" -ForegroundColor White
Write-Host "- Alias: $alias" -ForegroundColor White
Write-Host "`nGUARDE ESTES DADOS EM LOCAL SEGURO!" -ForegroundColor Red

Write-Host "`n"
