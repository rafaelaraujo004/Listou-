# Cria a chave (se ainda nao existir) e gera o AAB assinado, pedindo a senha
# uma unica vez. A senha nao e gravada em disco: vive so nesta sessao.
# Uso: .\assinar.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$tools = Join-Path $env:USERPROFILE 'dev-tools'
$jdk = Get-ChildItem -Path $tools -Directory -Filter 'jdk-21*' | Sort-Object Name -Descending | Select-Object -First 1
$keytool = Join-Path $jdk.FullName 'bin\keytool.exe'

$pastaChaves = Join-Path $env:USERPROFILE 'chaves-listou'
New-Item -ItemType Directory -Force $pastaChaves | Out-Null
$keystore = Join-Path $pastaChaves 'listou-upload.keystore'
$alias = 'listou'

Write-Host ''
if (Test-Path $keystore) {
    Write-Host "Chave encontrada em: $keystore" -ForegroundColor Cyan
} else {
    Write-Host 'Nenhuma chave ainda. Vamos criar uma.' -ForegroundColor Cyan
    Write-Host 'Escolha uma senha forte. Ela NAO aparece enquanto voce digita,' -ForegroundColor Yellow
    Write-Host 'e nao fica gravada em lugar nenhum: anote-a agora, em local seguro.' -ForegroundColor Yellow
}

$senha = Read-Host -AsSecureString 'Senha da chave'
$senhaTexto = [System.Net.NetworkCredential]::new('', $senha).Password
if ($senhaTexto.Length -lt 6) { throw 'A senha precisa ter ao menos 6 caracteres.' }

if (-not (Test-Path $keystore)) {
    $conf = Read-Host -AsSecureString 'Digite a senha de novo para confirmar'
    if ([System.Net.NetworkCredential]::new('', $conf).Password -ne $senhaTexto) {
        throw 'As senhas nao conferem. Nada foi criado; rode de novo.'
    }
    # -dname preenchido para o keytool nao perguntar mais nada.
    & $keytool -genkeypair -v -storetype PKCS12 -keystore $keystore -alias $alias `
        -keyalg RSA -keysize 2048 -validity 10000 `
        -dname 'CN=Listou, OU=Listou, O=Listou, L=Maraba, ST=PA, C=BR' `
        -storepass $senhaTexto -keypass $senhaTexto
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar a chave.' }
    Write-Host "`nChave criada: $keystore" -ForegroundColor Green
    Write-Host 'FACA BACKUP deste arquivo e da senha. Sem eles nao ha como atualizar o app.' -ForegroundColor Yellow
}

# Confere senha e alias antes de compilar.
& $keytool -list -keystore $keystore -alias $alias -storepass $senhaTexto > $null 2>&1
if ($LASTEXITCODE -ne 0) { throw 'Senha incorreta para esta chave.' }

$env:LISTOU_KEYSTORE_FILE = $keystore
$env:LISTOU_KEYSTORE_ALIAS = $alias
$env:LISTOU_KEYSTORE_PASSWORD = $senhaTexto
try {
    Write-Host "`nGerando o AAB assinado..." -ForegroundColor Cyan
    & npm run android:aab
    if ($LASTEXITCODE -ne 0) { throw 'O build falhou.' }
} finally {
    # A senha some da sessao assim que o build termina.
    Remove-Item Env:\LISTOU_KEYSTORE_PASSWORD -ErrorAction SilentlyContinue
    $senhaTexto = $null
}

$aab = Join-Path $root 'android\app\build\outputs\bundle\release\app-release.aab'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($aab)
$assinado = $zip.Entries | Where-Object { $_.FullName -match '^META-INF/.*\.(RSA|EC|DSA)$' }
$zip.Dispose()

if ($assinado) {
    Copy-Item $aab (Join-Path $root 'Listou-release-assinado.aab') -Force
    Write-Host "`nPronto: Listou-release-assinado.aab esta ASSINADO e pode ir para a Play." -ForegroundColor Green
    & $keytool -list -v -keystore $keystore -alias $alias -storepass ' ' 2>$null | Out-Null
} else {
    throw 'O AAB saiu sem assinatura. Rode .\verificar-assinatura.ps1 para diagnosticar.'
}
