# Confere se a keystore e o keystore.properties estao corretos, e se o AAB
# gerado saiu realmente assinado. Uso: .\verificar-assinatura.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$tools = Join-Path $env:USERPROFILE 'dev-tools'
$jdk = Get-ChildItem -Path $tools -Directory -Filter 'jdk-21*' | Sort-Object Name -Descending | Select-Object -First 1
$keytool = Join-Path $jdk.FullName 'bin\keytool.exe'

$props = Join-Path $root 'android\keystore.properties'
if (-not (Test-Path $props)) {
    Write-Host 'FALTA: android\keystore.properties nao existe.' -ForegroundColor Red
    Write-Host 'Copie android\keystore.properties.exemplo para keystore.properties e preencha.'
    exit 1
}

# Le o arquivo no formato properties (chave=valor)
$cfg = @{}
Get-Content $props | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)=(.*)$') { $cfg[$matches[1].Trim()] = $matches[2].Trim() }
}
foreach ($c in 'storeFile','storePassword','keyAlias','keyPassword') {
    if (-not $cfg[$c]) { Write-Host "FALTA: a chave '$c' nao esta preenchida." -ForegroundColor Red; exit 1 }
}
if (-not (Test-Path $cfg['storeFile'])) {
    Write-Host "NAO ENCONTREI a keystore em: $($cfg['storeFile'])" -ForegroundColor Red
    Write-Host 'Confira o caminho (use barras normais /) ou gere a keystore primeiro.'
    exit 1
}

Write-Host 'Keystore encontrada. Testando a senha e o alias...' -ForegroundColor Cyan
$saida = & $keytool -list -v -keystore $cfg['storeFile'] -alias $cfg['keyAlias'] `
                    -storepass $cfg['storePassword'] 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host 'A senha ou o alias nao conferem:' -ForegroundColor Red
    Write-Host $saida
    exit 1
}

Write-Host 'Senha e alias corretos.' -ForegroundColor Green
($saida -split "`n" | Select-String 'Propriet|Owner|Valid|V.lido|SHA-256' | Select-Object -First 4) |
    ForEach-Object { Write-Host ('  ' + $_.ToString().Trim()) }

$aab = Join-Path $root 'android\app\build\outputs\bundle\release\app-release.aab'
if (Test-Path $aab) {
    # Um AAB assinado traz META-INF\*.RSA (ou .EC) dentro do zip.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($aab)
    $assinado = $zip.Entries | Where-Object { $_.FullName -match '^META-INF/.*\.(RSA|EC|DSA)$' }
    $zip.Dispose()
    if ($assinado) {
        Write-Host "`nO AAB em outputs esta ASSINADO. Pode enviar para a Play." -ForegroundColor Green
    } else {
        Write-Host "`nO AAB em outputs ainda esta SEM assinatura." -ForegroundColor Yellow
        Write-Host 'Rode: npm run android:aab'
    }
} else {
    Write-Host "`nAinda nao existe AAB. Rode: npm run android:aab" -ForegroundColor Yellow
}
