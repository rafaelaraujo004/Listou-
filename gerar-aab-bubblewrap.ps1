# GERAR AAB CORRETO COM BUBBLEWRAP

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   GERANDO AAB COM CERTIFICADO UNICO               " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`nEste script vai gerar um AAB com apenas 1 certificado" -ForegroundColor Green
Write-Host "usando o Bubblewrap CLI do Google" -ForegroundColor White

# Atualizar PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`n[1/4] Qual e a URL do seu PWA?" -ForegroundColor Cyan
Write-Host "Exemplo: https://listou.vercel.app" -ForegroundColor Gray
$pwaUrl = Read-Host "URL"

if (-not $pwaUrl) {
    Write-Host "URL nao fornecida!" -ForegroundColor Red
    exit 1
}

# Garantir que tem https://
if ($pwaUrl -notlike "http*") {
    $pwaUrl = "https://$pwaUrl"
}

Write-Host "`n[2/4] Inicializando projeto Bubblewrap..." -ForegroundColor Cyan
Write-Host "Package Name: app.vercel.listou_iota.twa" -ForegroundColor Yellow

# Criar diretorio para o projeto
$projectDir = "bubblewrap-project"
if (Test-Path $projectDir) {
    Write-Host "Removendo projeto anterior..." -ForegroundColor Gray
    Remove-Item $projectDir -Recurse -Force
}

New-Item -ItemType Directory -Path $projectDir | Out-Null
Set-Location $projectDir

Write-Host "`nExecutando bubblewrap init..." -ForegroundColor Cyan
Write-Host "Configuracao automatica com valores recomendados" -ForegroundColor Gray

# Executar init com valores predefinidos
$initCmd = @"
bubblewrap init --manifest "$pwaUrl/manifest.json"
"@

# Criar arquivo de resposta automatica
$responses = @(
    "app.vercel.listou_iota.twa",  # Package ID
    "",  # Default name
    "",  # Default launcher name  
    "",  # Default display
    "",  # Default orientation
    "",  # Default theme color
    "",  # Default background color
    "",  # Default start URL
    "",  # Default icon
    "",  # Default maskable icon
    "",  # Default monochrome icon
    "",  # Default shortcuts
    "Yes",  # Generate key
    "",  # Default key path
    "",  # Default key password
    "",  # Default key alias
    ""   # Default key alias password
)

# Executar init (modo interativo sera necessario)
Write-Host "`nAGUARDE: O Bubblewrap vai fazer algumas perguntas..." -ForegroundColor Yellow
Write-Host "Pressione ENTER para aceitar os valores padrao" -ForegroundColor Gray
Write-Host "EXCETO quando perguntar 'Package Name', digite:" -ForegroundColor Yellow
Write-Host "app.vercel.listou_iota.twa" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""

$null = bubblewrap init --manifest "$pwaUrl/manifest.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nErro ao inicializar projeto!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "`n[3/4] Construindo AAB..." -ForegroundColor Cyan
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray

$null = bubblewrap build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nErro ao construir AAB!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "`n[4/4] Verificando AAB gerado..." -ForegroundColor Cyan

# Procurar AAB gerado
$aabFile = Get-ChildItem -Path "." -Filter "*.aab" -Recurse | Select-Object -First 1

if ($aabFile) {
    Write-Host "AAB encontrado: $($aabFile.FullName)" -ForegroundColor Green
    
    # Copiar para pasta principal
    $finalAab = "..\Listou-bubblewrap-final.aab"
    Copy-Item $aabFile.FullName $finalAab -Force
    
    Write-Host "`nVerificando numero de certificados..." -ForegroundColor Cyan
    
    # Configurar JDK
    $jdkPath = Get-ChildItem -Path "C:\Program Files" -Filter "jdk*" -Directory -Recurse -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)\bin\jarsigner.exe" } | Select-Object -First 1
    
    if ($jdkPath) {
        $env:JAVA_HOME = $jdkPath.FullName
        $env:PATH = "$($jdkPath.FullName)\bin;$env:PATH"
        
        $certCount = jarsigner -verify -verbose -certs $finalAab 2>&1 | Select-String -Pattern ">>> Signer" | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "`nNumero de certificados: $certCount" -ForegroundColor Yellow
        
        if ($certCount -eq 1) {
            Write-Host "SUCESSO! AAB tem apenas 1 certificado!" -ForegroundColor Green
        } else {
            Write-Host "ATENCAO! AAB tem $certCount certificados" -ForegroundColor Red
        }
    }
    
    # Procurar keystore
    $keystoreFile = Get-ChildItem -Path "." -Filter "*.keystore" -Recurse | Select-Object -First 1
    if ($keystoreFile) {
        Copy-Item $keystoreFile.FullName "..\listou-bubblewrap.keystore" -Force
        Write-Host "`nKeystore copiada para: listou-bubblewrap.keystore" -ForegroundColor Green
    }
    
    Write-Host "`n===================================================" -ForegroundColor Green
    Write-Host "           AAB GERADO COM SUCESSO!                 " -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    
    Write-Host "`nArquivo AAB: Listou-bubblewrap-final.aab" -ForegroundColor Cyan
    Write-Host "Keystore: listou-bubblewrap.keystore" -ForegroundColor Yellow
    
    Write-Host "`nProximo passo:" -ForegroundColor Yellow
    Write-Host "Faca upload do Listou-bubblewrap-final.aab para o Google Play Console" -ForegroundColor White
    
} else {
    Write-Host "AAB nao encontrado!" -ForegroundColor Red
}

Set-Location ..

Write-Host "`n"
