# SCRIPT PARA INSTALAR JDK (Java Development Kit)
# Necessario para assinar arquivos AAB

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   INSTALADOR AUTOMATICO DO JDK                   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`nO JDK e necessario para assinar arquivos AAB do Android" -ForegroundColor Yellow

# Verificar se ja esta instalado
$javaHome = $env:JAVA_HOME
if ($javaHome -and (Test-Path "$javaHome\bin\jarsigner.exe")) {
    Write-Host "`nJDK ja esta instalado em: $javaHome" -ForegroundColor Green
    Write-Host "Atualizando PATH..." -ForegroundColor Gray
    $env:PATH = "$javaHome\bin;$env:PATH"
    exit 0
}

# Verificar em locais comuns
$possiblePaths = @(
    "${env:ProgramFiles}\Java\jdk-*",
    "${env:ProgramFiles}\Java\jdk*",
    "${env:ProgramFiles(x86)}\Java\jdk-*",
    "${env:ProgramFiles}\Eclipse Adoptium\jdk-*",
    "${env:ProgramFiles}\Microsoft\jdk-*",
    "${env:ProgramFiles}\Zulu\zulu-*"
)

foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found -and (Test-Path "$($found.FullName)\bin\jarsigner.exe")) {
        Write-Host "`nJDK encontrado em: $($found.FullName)" -ForegroundColor Green
        $env:JAVA_HOME = $found.FullName
        $env:PATH = "$($found.FullName)\bin;$env:PATH"
        
        Write-Host "`nConfigurado com sucesso!" -ForegroundColor Green
        Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor White
        Write-Host "`nPara tornar permanente, adicione ao PATH do sistema." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`n[1/4] JDK nao encontrado. Iniciando instalacao..." -ForegroundColor Yellow

# URL do Microsoft OpenJDK (mais confiavel para Windows)
$jdkVersion = "17"
$downloadUrl = "https://aka.ms/download-jdk/microsoft-jdk-17.0.9-windows-x64.msi"
$installerPath = "$env:TEMP\microsoft-jdk-17.msi"

Write-Host "`n[2/4] Baixando Microsoft OpenJDK 17..." -ForegroundColor Cyan
Write-Host "URL: $downloadUrl" -ForegroundColor Gray

try {
    # Download com progresso
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    $ProgressPreference = 'Continue'
    Write-Host "Download concluido!" -ForegroundColor Green
} catch {
    Write-Host "`nErro ao baixar JDK: $_" -ForegroundColor Red
    Write-Host "`nPor favor, baixe e instale manualmente:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://www.microsoft.com/openjdk" -ForegroundColor White
    Write-Host "2. Baixe o JDK 17 para Windows x64" -ForegroundColor White
    Write-Host "3. Execute o instalador" -ForegroundColor White
    Write-Host "4. Execute este script novamente" -ForegroundColor White
    exit 1
}

Write-Host "`n[3/4] Instalando JDK..." -ForegroundColor Cyan
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray

try {
    # Instalar MSI silenciosamente
    $arguments = "/i `"$installerPath`" /quiet /norestart ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJarFileRunWith,FeatureJavaHome"
    Start-Process "msiexec.exe" -ArgumentList $arguments -Wait -NoNewWindow
    
    Write-Host "Instalacao concluida!" -ForegroundColor Green
} catch {
    Write-Host "`nErro ao instalar JDK: $_" -ForegroundColor Red
    exit 1
}

# Limpar instalador
Remove-Item $installerPath -ErrorAction SilentlyContinue

Write-Host "`n[4/4] Configurando variaveis de ambiente..." -ForegroundColor Cyan

# Procurar JDK instalado
Start-Sleep -Seconds 2
$jdkPath = Get-ChildItem -Path "${env:ProgramFiles}\Microsoft\jdk-*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($jdkPath) {
    $env:JAVA_HOME = $jdkPath.FullName
    $env:PATH = "$($jdkPath.FullName)\bin;$env:PATH"
    
    Write-Host "`n===================================================" -ForegroundColor Green
    Write-Host "           JDK INSTALADO COM SUCESSO!              " -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    
    Write-Host "`nJAVA_HOME: $env:JAVA_HOME" -ForegroundColor White
    Write-Host "`nPara usar em novas sessoes do PowerShell:" -ForegroundColor Yellow
    Write-Host "1. Feche e abra novamente o PowerShell, OU" -ForegroundColor White
    Write-Host "2. Execute: refreshenv" -ForegroundColor White
    
    # Testar instalacao
    Write-Host "`nTestando instalacao..." -ForegroundColor Cyan
    $javaVersionOutput = & "$($jdkPath.FullName)\bin\java.exe" -version 2>&1
    Write-Host $javaVersionOutput -ForegroundColor Gray
    
    Write-Host "`nAgora voce pode executar o script de assinatura novamente!" -ForegroundColor Green
} else {
    Write-Host "`nInstalacao concluida, mas nao foi possivel localizar o JDK." -ForegroundColor Yellow
    Write-Host "Por favor, feche e abra novamente o PowerShell." -ForegroundColor White
}

Write-Host "`n"
