# Build do app Android. Uso: .\android-build.ps1 [apk|aab]
# Reune o JDK/SDK locais e os contornos necessarios nesta maquina.
param([ValidateSet('apk','aab')][string]$Target = 'apk')

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# Os caminhos saem de $env:USERPROFILE para o script nao depender de acentos
# no proprio arquivo (PowerShell 5.1 le .ps1 sem BOM como ANSI).
$tools = Join-Path $env:USERPROFILE 'dev-tools'
$jdk = Get-ChildItem -Path $tools -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue |
       Sort-Object Name -Descending | Select-Object -First 1
if (-not $jdk) { throw "JDK 21 nao encontrado em $tools. Veja ASSINATURA-ANDROID.md." }

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = Join-Path $tools 'android-sdk'
if (-not (Test-Path $env:ANDROID_HOME)) { throw "Android SDK nao encontrado em $env:ANDROID_HOME." }
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# O TEMP do usuario usa nome curto 8.3 e o AF_UNIX do JDK nao resolve esse
# caminho, o que quebra o daemon do Gradle com "loopback connection".
New-Item -ItemType Directory -Force 'C:\gradle-tmp' | Out-Null
$env:JAVA_TOOL_OPTIONS = '-Djdk.net.unixdomain.tmpdir=C:\gradle-tmp'

Write-Host '==> Gerando www/' -ForegroundColor Cyan
node (Join-Path $root 'build-www.js')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar www/.' }

Write-Host '==> Sincronizando com o projeto Android' -ForegroundColor Cyan
npx cap copy android
if ($LASTEXITCODE -ne 0) { throw 'Falha no cap copy.' }

if ($Target -eq 'aab') {
    $task = 'bundleRelease'
    $out = Join-Path $root 'android\app\build\outputs\bundle\release\app-release.aab'
} else {
    $task = 'assembleDebug'
    $out = Join-Path $root 'android\app\build\outputs\apk\debug\app-debug.apk'
}

# Remove o artefato antigo para nao anunciar sucesso com um build que falhou.
if (Test-Path $out) { Remove-Item $out -Force }

Write-Host "==> Gradle $task" -ForegroundColor Cyan
Push-Location (Join-Path $root 'android')
try {
    # Sem daemon: um daemon deixado por outra sessao (ex.: o terminal usado
    # para assinar) travava o build seguinte na conexao.
    & .\gradlew.bat $task --no-daemon
    $code = $LASTEXITCODE
} finally {
    Pop-Location
}
if ($code -ne 0) { throw "Gradle falhou (exit $code)." }
if (-not (Test-Path $out)) { throw "Build terminou mas $out nao foi gerado." }

$mb = [math]::Round((Get-Item $out).Length / 1MB, 2)
Write-Host ''
Write-Host "Pronto: $out ($mb MB)" -ForegroundColor Green
if ($Target -eq 'aab') {
    # A senha tambem pode vir do ambiente (veja assinar.ps1); o aviso so vale
    # quando nenhuma das duas formas esta presente.
    if (-not (Test-Path (Join-Path $root 'android\keystore.properties')) -and -not $env:LISTOU_KEYSTORE_PASSWORD) {
        Write-Host 'AVISO: o AAB saiu SEM assinatura e a Play Store o recusa.' -ForegroundColor Yellow
        Write-Host 'Use: npm run android:assinar' -ForegroundColor Yellow
    }
}
