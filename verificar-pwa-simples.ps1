# Script Simples: Verificar PWA e Gerar AAB

Write-Host "=== VERIFICANDO PWA PARA GERAR AAB ===" -ForegroundColor Green

# URLs possíveis para verificar
$urls = @(
    "https://listou.vercel.app",
    "https://listou.netlify.app", 
    "https://listou-phi.vercel.app",
    "https://listou-app.vercel.app"
)

$found = $false

Write-Host "Testando URLs..." -ForegroundColor Yellow

foreach ($url in $urls) {
    try {
        Write-Host "Testando: $url" -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "ENCONTRADO: $url" -ForegroundColor Green
            $found = $true
            
            Write-Host ""
            Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
            Write-Host "1. Acesse: https://www.pwabuilder.com/"
            Write-Host "2. Digite a URL: $url"
            Write-Host "3. Clique em 'Start'"
            Write-Host "4. Va na aba 'Publish' > 'Android'"
            Write-Host "5. Configure Package ID: app.vercel.listou_phi.twa"
            Write-Host "6. Clique 'Generate Package'"
            Write-Host "7. Baixe o arquivo .aab"
            Write-Host "8. Execute: .\resolver-aab-nao-assinado.ps1"
            
            $open = Read-Host "Abrir PWA Builder agora? (s/n)"
            if ($open -eq "s") {
                Start-Process "https://www.pwabuilder.com/"
            }
            break
        }
    } catch {
        Write-Host "Nao encontrado: $url" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "PWA NAO ENCONTRADO ONLINE" -ForegroundColor Yellow
    Write-Host "Voce precisa hospedar seu PWA primeiro."
    Write-Host ""
    Write-Host "OPCOES:"
    Write-Host "1. Netlify (Drag e Drop) - https://app.netlify.com/drop"
    Write-Host "2. Vercel (GitHub) - https://vercel.com/"
    Write-Host "3. Criar servidor local"
    Write-Host ""
    
    $choice = Read-Host "Escolha uma opcao (1-3)"
    
    if ($choice -eq "1") {
        Write-Host "NETLIFY DRAG e DROP:"
        Write-Host "1. Acesse: https://app.netlify.com/drop"
        Write-Host "2. Arraste a pasta do projeto"
        Write-Host "3. Use a URL gerada no PWA Builder"
        Start-Process "https://app.netlify.com/drop"
    }
    elseif ($choice -eq "2") {
        Write-Host "VERCEL:"
        Write-Host "1. Acesse: https://vercel.com/"
        Write-Host "2. Conecte seu GitHub"
        Write-Host "3. Faca deploy do projeto"
        Start-Process "https://vercel.com/"
    }
    elseif ($choice -eq "3") {
        Write-Host "SERVIDOR LOCAL:"
        Write-Host "Instalando Node.js..."
        try {
            winget install OpenJS.NodeJS
            Write-Host "Node.js instalado! Reinicie o PowerShell."
        } catch {
            Write-Host "Baixe Node.js em: https://nodejs.org/"
        }
    }
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Green
Write-Host "1. Hospedar PWA online"
Write-Host "2. Gerar AAB com PWA Builder"
Write-Host "3. Assinar AAB com script"
Write-Host "4. Upload para Google Play"
