# SCRIPT DEFINITIVO - Remover todas assinaturas e re-assinar AAB

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   CORRECAO DEFINITIVA - LISTOU.AAB               " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Verificar se o AAB existe
if (-not (Test-Path "Listou.aab")) {
    Write-Host "`nERRO: Arquivo Listou.aab nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/6] Configurando JDK..." -ForegroundColor Cyan
$jdkPath = Get-ChildItem -Path "C:\Program Files" -Filter "jdk*" -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)\bin\jarsigner.exe" } | Select-Object -First 1

if ($jdkPath) {
    $env:JAVA_HOME = $jdkPath.FullName
    $env:PATH = "$($jdkPath.FullName)\bin;$env:PATH"
    Write-Host "JDK configurado: $($jdkPath.FullName)" -ForegroundColor Green
} else {
    Write-Host "JDK nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/6] Criando copia do AAB original..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "Listou_backup_$timestamp.aab"
Copy-Item "Listou.aab" $backupFile
Write-Host "Backup criado: $backupFile" -ForegroundColor Green

Write-Host "`n[3/6] Removendo TODAS as assinaturas antigas..." -ForegroundColor Cyan

# Criar diretorio temporario
$tempDir = "temp_aab_extract"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Renomear AAB para ZIP e extrair
$zipFile = "Listou_temp.zip"
Copy-Item "Listou.aab" $zipFile
Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force
Remove-Item $zipFile -Force

# Remover TODAS as pastas META-INF (todas as assinaturas)
$metaInfPaths = Get-ChildItem -Path $tempDir -Filter "META-INF" -Directory -Recurse
foreach ($metaInf in $metaInfPaths) {
    Write-Host "  Removendo: $($metaInf.FullName)" -ForegroundColor Gray
    Remove-Item $metaInf.FullName -Recurse -Force
}

Write-Host "Todas as assinaturas removidas" -ForegroundColor Green

Write-Host "`n[4/6] Recriando AAB sem assinaturas..." -ForegroundColor Cyan

# Recriar AAB (como ZIP primeiro, depois renomear)
$unsignedAab = "Listou-unsigned.aab"
$tempZip = "Listou-unsigned.zip"

if (Test-Path $tempZip) {
    Remove-Item $tempZip -Force
}
if (Test-Path $unsignedAab) {
    Remove-Item $unsignedAab -Force
}

# Comprimir como ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $tempZip -CompressionLevel Optimal -Force

# Renomear para AAB
Rename-Item $tempZip $unsignedAab

# Limpar temporarios
Remove-Item $tempDir -Recurse -Force

Write-Host "AAB sem assinatura criado" -ForegroundColor Green

Write-Host "`n[5/6] Criando nova keystore..." -ForegroundColor Cyan

$keystorePath = "listou-release-final.keystore"
$alias = "listou-key"
$storepass = Read-Host "Digite a senha do keystore"
$keypass = $storepass

# Remover keystore anterior se existir
if (Test-Path $keystorePath) {
    Remove-Item $keystorePath -Force
}

# Gerar keystore
$keytoolCmd = "keytool -genkeypair -v " +
    "-keystore `"$keystorePath`" " +
    "-alias `"$alias`" " +
    "-keyalg RSA " +
    "-keysize 2048 " +
    "-validity 10000 " +
    "-storepass `"$storepass`" " +
    "-keypass `"$keypass`" " +
    "-dname `"CN=Listou App, OU=Development, O=Listou, L=City, ST=State, C=BR`""

Invoke-Expression $keytoolCmd | Out-Null
Write-Host "Keystore criada com sucesso" -ForegroundColor Green

Write-Host "`n[6/6] Assinando AAB com certificado unico..." -ForegroundColor Cyan

$finalAab = "Listou-final-signed.aab"

# Assinar AAB
$jarsignerCmd = "jarsigner -verbose " +
    "-sigalg SHA256withRSA " +
    "-digestalg SHA-256 " +
    "-keystore `"$keystorePath`" " +
    "-storepass `"$storepass`" " +
    "-keypass `"$keypass`" " +
    "`"$unsignedAab`" " +
    "`"$alias`""

Invoke-Expression $jarsignerCmd | Out-Null

# Renomear para arquivo final
Move-Item $unsignedAab $finalAab -Force

Write-Host "AAB assinado com sucesso!" -ForegroundColor Green

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "           VERIFICACAO DA ASSINATURA               " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Verificar assinatura
$verifyCmd = "jarsigner -verify -verbose -certs `"$finalAab`" 2>&1 | Select-String -Pattern 'Signer|jar verified|jar signed'"
$verifyResult = Invoke-Expression $verifyCmd

Write-Host "`n$verifyResult" -ForegroundColor White

# Contar certificados
$signerCount = ($verifyResult | Select-String -Pattern ">>> Signer").Count
Write-Host "`nNumero de certificados encontrados: $signerCount" -ForegroundColor Yellow

if ($signerCount -eq 1) {
    Write-Host "SUCESSO! AAB tem apenas 1 certificado!" -ForegroundColor Green
} else {
    Write-Host "ATENCAO! AAB ainda tem multiplos certificados ($signerCount)" -ForegroundColor Red
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "              PROCESSO CONCLUIDO!                  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

Write-Host "`nArquivo final: $finalAab" -ForegroundColor Cyan
Write-Host "Backup original: $backupFile" -ForegroundColor Gray

Write-Host "`nDados da Keystore:" -ForegroundColor Yellow
Write-Host "- Arquivo: $keystorePath" -ForegroundColor White
Write-Host "- Senha: $storepass" -ForegroundColor White
Write-Host "- Alias: $alias" -ForegroundColor White

Write-Host "`nGUARDE ESTES DADOS EM LOCAL SEGURO!" -ForegroundColor Red

Write-Host "`nProximo passo:" -ForegroundColor Yellow
Write-Host "Faca upload do arquivo $finalAab para o Google Play Console" -ForegroundColor White

Write-Host "`n"
