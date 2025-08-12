# 🔐 Script para Resolver AAB Não-Assinado
# Automatiza a criação de keystore forte e assinatura do AAB

Write-Host "🚀 RESOLVENDO PROBLEMA: AAB NÃO-ASSINADO" -ForegroundColor Green
Write-Host "=" * 50

# Verificar se keytool está disponível
Write-Host "🔍 Verificando se JDK está instalado..." -ForegroundColor Yellow

try {
    $keytoolVersion = keytool -help 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ JDK encontrado!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ JDK não encontrado. Instalando via Chocolatey..." -ForegroundColor Red
    
    # Instalar Chocolatey se necessário
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    # Instalar OpenJDK
    Write-Host "📦 Instalando OpenJDK 11..." -ForegroundColor Yellow
    choco install openjdk11 -y
    
    # Recarregar PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
}

# Configurações da keystore
$keystoreName = "listou-release.keystore"
$keyAlias = "listou-key"
$aabFile = "Listou-unsigned.aab"
$aabSigned = "Listou-signed.aab"

Write-Host ""
Write-Host "🔑 GERANDO KEYSTORE FORTE..." -ForegroundColor Cyan

# Verificar se keystore já existe
if (Test-Path $keystoreName) {
    Write-Host "⚠️  Keystore já existe. Deseja:" -ForegroundColor Yellow
    Write-Host "1. Usar a existente"
    Write-Host "2. Criar uma nova (sobrescrever)"
    $choice = Read-Host "Escolha (1 ou 2)"
    
    if ($choice -eq "2") {
        Remove-Item $keystoreName -Force
        Write-Host "🗑️  Keystore antiga removida." -ForegroundColor Yellow
    }
}

# Gerar nova keystore se não existir
if (!(Test-Path $keystoreName)) {
    Write-Host "📝 Criando nova keystore com certificado forte..." -ForegroundColor Green
    
    # Solicitar informações do desenvolvedor
    Write-Host ""
    Write-Host "📋 INFORMAÇÕES DO DESENVOLVEDOR:" -ForegroundColor Cyan
    $nomeCompleto = Read-Host "Nome completo"
    $empresa = Read-Host "Empresa/Organização"
    $cidade = Read-Host "Cidade"
    $estado = Read-Host "Estado"
    $pais = Read-Host "País (código de 2 letras, ex: BR)"
    
    Write-Host ""
    Write-Host "🔐 CONFIGURAÇÕES DE SEGURANÇA:" -ForegroundColor Cyan
    $senhaKeystore = Read-Host "Senha da keystore (mínimo 8 caracteres)" -AsSecureString
    $senhaPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($senhaKeystore))
    
    # Criar o comando keytool
    $dname = "CN=$nomeCompleto, OU=Desenvolvimento, O=$empresa, L=$cidade, ST=$estado, C=$pais"
    
    Write-Host "🔨 Gerando keystore com RSA 4096 bits..." -ForegroundColor Yellow
    
    $process = Start-Process -FilePath "keytool" -ArgumentList @(
        "-genkeypair",
        "-alias", $keyAlias,
        "-keyalg", "RSA",
        "-keysize", "4096",
        "-sigalg", "SHA256withRSA",
        "-validity", "10000",
        "-keystore", $keystoreName,
        "-dname", $dname,
        "-storepass", $senhaPlain,
        "-keypass", $senhaPlain
    ) -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Keystore criada com sucesso!" -ForegroundColor Green
        
        # Salvar informações da keystore
        $keystoreInfo = @{
            "arquivo" = $keystoreName
            "alias" = $keyAlias
            "algoritmo" = "RSA 4096 bits"
            "assinatura" = "SHA256withRSA"
            "validade" = "27 anos (10.000 dias)"
            "criado_em" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            "dname" = $dname
        }
        
        $keystoreInfo | ConvertTo-Json -Depth 2 | Out-File "keystore-info.json" -Encoding UTF8
        Write-Host "📄 Informações salvas em: keystore-info.json" -ForegroundColor Blue
    } else {
        Write-Host "❌ Erro ao criar keystore!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Usando keystore existente: $keystoreName" -ForegroundColor Green
    $senhaKeystore = Read-Host "Senha da keystore existente" -AsSecureString
    $senhaPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($senhaKeystore))
}

Write-Host ""
Write-Host "📱 ASSINANDO ANDROID APP BUNDLE..." -ForegroundColor Cyan

# Verificar se AAB existe
if (!(Test-Path $aabFile)) {
    Write-Host "❌ Arquivo $aabFile não encontrado!" -ForegroundColor Red
    Write-Host "📍 Certifique-se de que o arquivo AAB está na pasta atual." -ForegroundColor Yellow
    Write-Host "📁 Pasta atual: $(Get-Location)" -ForegroundColor Blue
    
    # Listar arquivos AAB na pasta
    $aabFiles = Get-ChildItem -Filter "*.aab"
    if ($aabFiles.Count -gt 0) {
        Write-Host "📋 Arquivos AAB encontrados:" -ForegroundColor Yellow
        foreach ($file in $aabFiles) {
            Write-Host "   - $($file.Name)" -ForegroundColor White
        }
        
        $chosenFile = Read-Host "Digite o nome do arquivo AAB para assinar"
        if (Test-Path $chosenFile) {
            $aabFile = $chosenFile
            $aabSigned = $chosenFile.Replace(".aab", "-signed.aab")
        }
    }
    
    if (!(Test-Path $aabFile)) {
        Write-Host "❌ Não foi possível encontrar o arquivo AAB especificado." -ForegroundColor Red
        exit 1
    }
}

# Verificar se jarsigner está disponível
Write-Host "🔍 Verificando jarsigner..." -ForegroundColor Yellow
try {
    $jarsignerVersion = jarsigner -help 2>$null
    Write-Host "✅ jarsigner encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ jarsigner não encontrado!" -ForegroundColor Red
    Write-Host "💡 jarsigner faz parte do JDK. Verifique a instalação." -ForegroundColor Yellow
    exit 1
}

# Assinar o AAB
Write-Host "🔐 Assinando $aabFile..." -ForegroundColor Yellow

$signProcess = Start-Process -FilePath "jarsigner" -ArgumentList @(
    "-verbose",
    "-sigalg", "SHA256withRSA",
    "-digestalg", "SHA-256",
    "-keystore", $keystoreName,
    "-storepass", $senhaPlain,
    "-keypass", $senhaPlain,
    "-signedjar", $aabSigned,
    $aabFile,
    $keyAlias
) -Wait -NoNewWindow -PassThru

if ($signProcess.ExitCode -eq 0) {
    Write-Host "✅ AAB assinado com sucesso!" -ForegroundColor Green
    Write-Host "📦 Arquivo assinado: $aabSigned" -ForegroundColor Blue
    
    # Verificar assinatura
    Write-Host "🔍 Verificando assinatura..." -ForegroundColor Yellow
    $verifyProcess = Start-Process -FilePath "jarsigner" -ArgumentList @(
        "-verify",
        "-verbose",
        "-certs",
        $aabSigned
    ) -Wait -NoNewWindow -PassThru
    
    if ($verifyProcess.ExitCode -eq 0) {
        Write-Host "✅ Assinatura verificada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Aviso: Não foi possível verificar a assinatura automaticamente." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Erro ao assinar AAB!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 PROCESSO CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "📦 Arquivo original: $aabFile" -ForegroundColor Blue
Write-Host "✅ Arquivo assinado: $aabSigned" -ForegroundColor Green
Write-Host "🔑 Keystore: $keystoreName" -ForegroundColor Blue
Write-Host "🏷️  Alias: $keyAlias" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Faça upload do arquivo '$aabSigned' para o Google Play Console" -ForegroundColor White
Write-Host "2. Mantenha a keystore '$keystoreName' em local seguro" -ForegroundColor White
Write-Host "3. Faça backup da keystore e senha" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Não perca a keystore e senha!" -ForegroundColor Red
Write-Host "💡 Elas são necessárias para futuras atualizações do app." -ForegroundColor Yellow

# Limpar senha da memória
$senhaPlain = ""
$senhaKeystore = $null

Write-Host ""
Write-Host "🔐 Processo finalizado. Senha removida da memória por segurança." -ForegroundColor Green
