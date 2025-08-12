# GERAR AAB A PARTIR DO PWA - Listou
# Data: 12 de agosto de 2025

Write-Host "===================================================" -ForegroundColor Green
Write-Host "          GERAR AAB A PARTIR DO PWA                " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Verificar se e um projeto PWA
Write-Host "`n1. Verificando se e um projeto PWA..." -ForegroundColor Yellow

if (-not (Test-Path "manifest.webmanifest")) {
    Write-Host "ERRO: manifest.webmanifest nao encontrado!" -ForegroundColor Red
    Write-Host "Este script deve ser executado na pasta do projeto PWA." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "sw.js") -and -not (Test-Path "sw-new.js")) {
    Write-Host "AVISO: Service Worker nao encontrado." -ForegroundColor Yellow
    Write-Host "O AAB sera gerado, mas pode ter funcionalidade limitada." -ForegroundColor Yellow
}

Write-Host "Projeto PWA detectado!" -ForegroundColor Green

# Verificar Node.js
Write-Host "`n2. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "Instale Node.js: https://nodejs.org/" -ForegroundColor Blue
    exit 1
}

# Instalar PWA Builder se necessario
Write-Host "`n3. Verificando PWA Builder..." -ForegroundColor Yellow
try {
    pwabuilder --version | Out-Null
    Write-Host "PWA Builder ja instalado!" -ForegroundColor Green
} catch {
    Write-Host "Instalando PWA Builder..." -ForegroundColor Yellow
    npm install -g @pwabuilder/cli
    
    # Verificar se instalou corretamente
    try {
        pwabuilder --version | Out-Null
        Write-Host "PWA Builder instalado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "ERRO: Falha ao instalar PWA Builder!" -ForegroundColor Red
        exit 1
    }
}

# Verificar se PWA esta funcionando localmente
Write-Host "`n4. Verificando estrutura do PWA..." -ForegroundColor Yellow

# Ler manifest para verificar configuracoes
$manifestContent = Get-Content "manifest.webmanifest" -Raw | ConvertFrom-Json
Write-Host "Nome do app: $($manifestContent.name)" -ForegroundColor Blue
Write-Host "Nome curto: $($manifestContent.short_name)" -ForegroundColor Blue

# Verificar icones
if ($manifestContent.icons -and $manifestContent.icons.Count -gt 0) {
    Write-Host "Icones encontrados: $($manifestContent.icons.Count)" -ForegroundColor Green
} else {
    Write-Host "AVISO: Nenhum icone encontrado no manifest!" -ForegroundColor Yellow
}

# Gerar AAB usando PWA Builder
Write-Host "`n5. Gerando AAB com PWA Builder..." -ForegroundColor Yellow

# Criar pasta de saida se nao existir
$outputDir = ".\pwa-output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "Executando PWA Builder..." -ForegroundColor Blue
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Yellow

try {
    # Comando PWA Builder para Android
    $pwaCommand = "pwabuilder . --platform android --publish false"
    Write-Host "Comando: $pwaCommand" -ForegroundColor Gray
    
    Invoke-Expression $pwaCommand
    
    # Procurar AAB gerado
    Write-Host "`n6. Procurando AAB gerado..." -ForegroundColor Yellow
    
    $aabFiles = Get-ChildItem -Recurse -Filter "*.aab" -ErrorAction SilentlyContinue
    
    if ($aabFiles.Count -gt 0) {
        Write-Host "AAB(s) encontrado(s):" -ForegroundColor Green
        foreach ($file in $aabFiles) {
            Write-Host "  - $($file.FullName)" -ForegroundColor Blue
            
            # Copiar para pasta principal se nao estiver la
            if ($file.Directory.FullName -ne (Get-Location).Path) {
                $newName = "Listou-unsigned.aab"
                Copy-Item $file.FullName ".\$newName" -Force
                Write-Host "Copiado para: .\$newName" -ForegroundColor Green
            }
        }
        
        Write-Host "`n===================================================" -ForegroundColor Green
        Write-Host "           AAB GERADO COM SUCESSO!                 " -ForegroundColor Green
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host "Proximo passo: Assinar o AAB" -ForegroundColor Yellow
        Write-Host "Execute: .\assinar-aab.ps1" -ForegroundColor Blue
        
    } else {
        Write-Host "ERRO: Nenhum AAB foi gerado!" -ForegroundColor Red
        Write-Host "Verifique se o PWA esta configurado corretamente." -ForegroundColor Yellow
        
        # Sugerir metodo alternativo
        Write-Host "`nMETODO ALTERNATIVO:" -ForegroundColor Yellow
        Write-Host "1. Acesse: https://www.pwabuilder.com/" -ForegroundColor Blue
        Write-Host "2. Insira a URL do seu PWA hospedado" -ForegroundColor Blue
        Write-Host "3. Baixe o AAB gerado" -ForegroundColor Blue
        Write-Host "4. Coloque o arquivo .aab nesta pasta" -ForegroundColor Blue
        Write-Host "5. Execute: .\assinar-aab.ps1" -ForegroundColor Blue
    }
    
} catch {
    Write-Host "ERRO durante geracao do AAB: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTentando metodo alternativo..." -ForegroundColor Yellow
    
    # Metodo alternativo usando Bubblewrap (se disponivel)
    try {
        Write-Host "Tentando com Bubblewrap..." -ForegroundColor Blue
        npm install -g @bubblewrap/cli
        npx bubblewrap init
        npx bubblewrap build
    } catch {
        Write-Host "Metodo alternativo tambem falhou." -ForegroundColor Red
        Write-Host "`nUse o metodo manual:" -ForegroundColor Yellow
        Write-Host "1. Va para: https://www.pwabuilder.com/" -ForegroundColor Blue
        Write-Host "2. Hospede seu PWA em algum servidor" -ForegroundColor Blue
        Write-Host "3. Gere o AAB online" -ForegroundColor Blue
    }
}

Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
