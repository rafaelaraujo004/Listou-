# 🌐 SCRIPT: Verificar e Hospedar PWA para Gerar AAB

Write-Host "🚀 VERIFICANDO SITUAÇÃO DO PWA PARA GERAR AAB" -ForegroundColor Green
Write-Host "=" * 60

# Verificar se o PWA está hospedado
Write-Host ""
Write-Host "🔍 VERIFICANDO HOSPEDAGEM DO PWA..." -ForegroundColor Cyan

# URLs possíveis para verificar
$possibleUrls = @(
    "https://listou.vercel.app",
    "https://listou.netlify.app", 
    "https://listou-phi.vercel.app",
    "https://listou-app.vercel.app",
    "https://your-listou.netlify.app"
)

$foundUrl = $null

Write-Host "🌐 Testando URLs possíveis..." -ForegroundColor Yellow

foreach ($url in $possibleUrls) {
    try {
        Write-Host "   Testando: $url" -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ ENCONTRADO: $url" -ForegroundColor Green
            $foundUrl = $url
            break
        }
    } catch {
        Write-Host "   ❌ Não encontrado: $url" -ForegroundColor Red
    }
}

if ($foundUrl) {
    Write-Host ""
    Write-Host "🎉 PWA ENCONTRADO ONLINE!" -ForegroundColor Green
    Write-Host "📍 URL: $foundUrl" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://www.pwabuilder.com/" -ForegroundColor White
    Write-Host "2. Digite a URL: $foundUrl" -ForegroundColor White
    Write-Host "3. Clique em 'Start' para analisar" -ForegroundColor White
    Write-Host "4. Vá na aba 'Publish' > 'Android'" -ForegroundColor White
    Write-Host "5. Configure Package ID: app.vercel.listou_phi.twa" -ForegroundColor White
    Write-Host "6. Clique 'Generate Package' para baixar AAB" -ForegroundColor White
    Write-Host "7. Execute .\resolver-aab-nao-assinado.ps1 para assinar" -ForegroundColor White
    
    # Abrir PWA Builder automaticamente
    $openBrowser = Read-Host "`n🌐 Deseja abrir o PWA Builder automaticamente? (s/n)"
    if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
        Start-Process "https://www.pwabuilder.com/"
        Write-Host "🌐 PWA Builder aberto no navegador!" -ForegroundColor Green
    }
    
} else {
    Write-Host ""
    Write-Host "⚠️  PWA NÃO ENCONTRADO ONLINE" -ForegroundColor Yellow
    Write-Host "📋 Você precisa hospedar seu PWA primeiro para gerar AAB." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🚀 OPÇÕES DE HOSPEDAGEM GRATUITA:" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar se tem Git instalado
    try {
        $gitVersion = git --version 2>$null
        $hasGit = $true
        Write-Host "✅ Git detectado: $gitVersion" -ForegroundColor Green
    } catch {
        $hasGit = $false
        Write-Host "❌ Git não encontrado - instalando..." -ForegroundColor Red
        try {
            winget install Git.Git -e --source winget
            Write-Host "✅ Git instalado!" -ForegroundColor Green
            $hasGit = $true
        } catch {
            Write-Host "⚠️  Não foi possível instalar Git automaticamente" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "📋 ESCOLHA UMA OPÇÃO:" -ForegroundColor Cyan
    Write-Host "1. Deploy no Netlify (Drag e Drop - Mais Facil)"
    Write-Host "2. Deploy no Vercel (GitHub - Automatico)"
    Write-Host "3. 🔧 Criar servidor local para teste"
    Write-Host "4. 📖 Ver instruções detalhadas"
    
    $choice = Read-Host "`nEscolha uma opção (1-4)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "DEPLOY NO NETLIFY (DRAG E DROP)" -ForegroundColor Green
            Write-Host "1. Acesse: https://app.netlify.com/drop" -ForegroundColor White
            Write-Host "2. Arraste a pasta completa do projeto para a área" -ForegroundColor White
            Write-Host "3. Aguarde o upload e deploy" -ForegroundColor White
            Write-Host "4. Copie a URL gerada (ex: https://amazing-name.netlify.app)" -ForegroundColor White
            Write-Host "5. Use essa URL no PWA Builder" -ForegroundColor White
            
            $openNetlify = Read-Host "`nDeseja abrir o Netlify? (s/n)"
            if ($openNetlify -eq "s") {
                Start-Process "https://app.netlify.com/drop"
            }
        }
        
        "2" {
            if ($hasGit) {
                Write-Host ""
                Write-Host "🚀 DEPLOY NO VERCEL (GITHUB)" -ForegroundColor Green
                Write-Host "1. Inicializar repositório Git na pasta atual" -ForegroundColor White
                Write-Host "2. Fazer commit dos arquivos" -ForegroundColor White
                Write-Host "3. Push para GitHub" -ForegroundColor White
                Write-Host "4. Conectar Vercel ao repositório" -ForegroundColor White
                
                $initGit = Read-Host "`nDeseja inicializar Git agora? (s/n)"
                if ($initGit -eq "s") {
                    git init
                    git add .
                    git commit -m "Initial commit - Listou PWA"
                    Write-Host "✅ Repositório Git inicializado!" -ForegroundColor Green
                    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
                    Write-Host "1. Crie repositório no GitHub" -ForegroundColor White
                    Write-Host "2. Execute: git remote add origin https://github.com/SEU-USUARIO/listou.git" -ForegroundColor White
                    Write-Host "3. Execute: git push -u origin main" -ForegroundColor White
                    Write-Host "4. Acesse: https://vercel.com/ e conecte o repositório" -ForegroundColor White
                }
            } else {
                Write-Host "❌ Git necessário para essa opção. Instale Git primeiro." -ForegroundColor Red
            }
        }
        
        "3" {
            Write-Host ""
            Write-Host "🔧 SERVIDOR LOCAL PARA TESTE" -ForegroundColor Green
            
            # Verificar Node.js
            try {
                $nodeVersion = node --version 2>$null
                Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
                
                Write-Host "📦 Instalando servidor HTTP..." -ForegroundColor Yellow
                npm install -g http-server
                
                Write-Host "🚀 Iniciando servidor..." -ForegroundColor Yellow
                Write-Host "📍 URL local: http://localhost:8080" -ForegroundColor Blue
                Write-Host "⚠️  Use essa URL no PWA Builder para testar" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "🔄 Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
                
                http-server -p 8080 -c-1
                
            } catch {
                Write-Host "❌ Node.js não encontrado. Instalando..." -ForegroundColor Red
                try {
                    winget install OpenJS.NodeJS
                    Write-Host "✅ Node.js instalado! Reinicie o PowerShell e execute o script novamente." -ForegroundColor Green
                } catch {
                    Write-Host "⚠️  Não foi possível instalar Node.js automaticamente" -ForegroundColor Yellow
                    Write-Host "📖 Baixe manualmente em: https://nodejs.org/" -ForegroundColor Blue
                }
            }
        }
        
        "4" {
            Write-Host ""
            Write-Host "📖 INSTRUÇÕES DETALHADAS" -ForegroundColor Green
            Write-Host "Consulte o arquivo: SOLUCAO-COMPLETA-AAB.md" -ForegroundColor Blue
            notepad "SOLUCAO-COMPLETA-AAB.md"
        }
        
        default {
            Write-Host "❌ Opção inválida" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📋 RESUMO DO QUE VOCÊ PRECISA FAZER:" -ForegroundColor Cyan
Write-Host "1. ✅ Hospedar PWA online (Netlify/Vercel/Local)" -ForegroundColor White
Write-Host "2. ✅ Gerar AAB com PWA Builder usando a URL" -ForegroundColor White
Write-Host "3. ✅ Assinar AAB com .\resolver-aab-nao-assinado.ps1" -ForegroundColor White
Write-Host "4. ✅ Upload do AAB assinado para Google Play" -ForegroundColor White
Write-Host ""
Write-Host "🎯 OBJETIVO: Ter o AAB assinado pronto para publicação!" -ForegroundColor Green
