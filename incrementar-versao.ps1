# Script para incrementar versão do app automaticamente
# Uso: .\incrementar-versao.ps1

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    INCREMENTAR VERSÃO DO APP LISTOU" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Função para extrair versão atual de um arquivo
function Get-CurrentVersion {
    param($filePath, $pattern)
    
    $content = Get-Content $filePath -Raw
    if ($content -match $pattern) {
        return $matches[1]
    }
    return $null
}

# Ler versão atual do sw.js
$swContent = Get-Content "sw.js" -Raw
if ($swContent -match "APP_VERSION = '([0-9.]+)'") {
    $currentVersion = $matches[1]
    Write-Host "`nVersão atual detectada: $currentVersion" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Não foi possível detectar versão atual!" -ForegroundColor Red
    exit 1
}

# Perguntar tipo de atualização
Write-Host "`nQue tipo de atualização você quer fazer?" -ForegroundColor Cyan
Write-Host "1. PATCH  - Correção de bugs       (1.0.50 → 1.0.51)" -ForegroundColor White
Write-Host "2. MINOR  - Nova funcionalidade    (1.0.50 → 1.1.0)" -ForegroundColor White
Write-Host "3. MAJOR  - Mudança grande         (1.0.50 → 2.0.0)" -ForegroundColor White
Write-Host "4. CUSTOM - Versão personalizada" -ForegroundColor White

$choice = Read-Host "`nEscolha (1-4)"

# Calcular nova versão
$parts = $currentVersion.Split(".")
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

switch ($choice) {
    "1" {
        $patch++
        $newVersion = "$major.$minor.$patch"
        $updateType = "PATCH (Correção de bugs)"
    }
    "2" {
        $minor++
        $patch = 0
        $newVersion = "$major.$minor.$patch"
        $updateType = "MINOR (Nova funcionalidade)"
    }
    "3" {
        $major++
        $minor = 0
        $patch = 0
        $newVersion = "$major.$minor.$patch"
        $updateType = "MAJOR (Mudança grande)"
    }
    "4" {
        $newVersion = Read-Host "Digite a nova versão (ex: 1.2.3)"
        $updateType = "CUSTOM"
    }
    default {
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
        exit 1
    }
}

# Confirmar mudança
Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "Tipo: $updateType" -ForegroundColor White
Write-Host "Versão atual:  $currentVersion" -ForegroundColor Yellow
Write-Host "Nova versão:   $newVersion" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

$confirm = Read-Host "`nConfirmar atualização? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operação cancelada!" -ForegroundColor Red
    exit 0
}

Write-Host "`nAtualizando arquivos..." -ForegroundColor Cyan

# Backup dos arquivos
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_$timestamp"
Write-Host "Criando backup em: $backupDir" -ForegroundColor Gray
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "sw.js" "$backupDir/sw.js"
Copy-Item "app.js" "$backupDir/app.js"
Copy-Item "index.html" "$backupDir/index.html"
Copy-Item "manifest.json" "$backupDir/manifest.json"

# Contador de atualizações
$updatedFiles = 0

# 1. Atualizar sw.js
try {
    $content = Get-Content "sw.js" -Raw
    $content = $content -replace "APP_VERSION = '$currentVersion'", "APP_VERSION = '$newVersion'"
    $content = $content -replace "APP_VERSION = `"$currentVersion`"", "APP_VERSION = `"$newVersion`""
    Set-Content "sw.js" -Value $content -NoNewline
    Write-Host "✅ sw.js atualizado" -ForegroundColor Green
    $updatedFiles++
} catch {
    Write-Host "❌ Erro ao atualizar sw.js: $_" -ForegroundColor Red
}

# 2. Atualizar app.js
try {
    $content = Get-Content "app.js" -Raw
    $content = $content -replace "CURRENT_VERSION = '$currentVersion'", "CURRENT_VERSION = '$newVersion'"
    $content = $content -replace "CURRENT_VERSION = `"$currentVersion`"", "CURRENT_VERSION = `"$newVersion`""
    Set-Content "app.js" -Value $content -NoNewline
    Write-Host "✅ app.js atualizado" -ForegroundColor Green
    $updatedFiles++
} catch {
    Write-Host "❌ Erro ao atualizar app.js: $_" -ForegroundColor Red
}

# 3. Atualizar index.html
try {
    $content = Get-Content "index.html" -Raw
    $content = $content -replace ">$currentVersion<", ">$newVersion<"
    Set-Content "index.html" -Value $content -NoNewline
    Write-Host "✅ index.html atualizado" -ForegroundColor Green
    $updatedFiles++
} catch {
    Write-Host "❌ Erro ao atualizar index.html: $_" -ForegroundColor Red
}

# 4. Atualizar manifest.json
try {
    $content = Get-Content "manifest.json" -Raw
    $content = $content -replace "`"version`": `"$currentVersion`"", "`"version`": `"$newVersion`""
    $content = $content -replace "`"version_name`": `"$currentVersion`"", "`"version_name`": `"$newVersion`""
    Set-Content "manifest.json" -Value $content -NoNewline
    Write-Host "✅ manifest.json atualizado" -ForegroundColor Green
    $updatedFiles++
} catch {
    Write-Host "❌ Erro ao atualizar manifest.json: $_" -ForegroundColor Red
}

# Resultado
Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "✅ VERSÃO ATUALIZADA COM SUCESSO!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Arquivos atualizados: $updatedFiles/4" -ForegroundColor White
Write-Host "Nova versão: $newVersion" -ForegroundColor Cyan
Write-Host "Backup salvo em: $backupDir" -ForegroundColor Gray

# Próximos passos
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Testar o app localmente" -ForegroundColor White
Write-Host "2. Fazer commit das mudanças:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m `"chore: bump version to $newVersion`"" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host "3. Fazer deploy do PWA" -ForegroundColor White
Write-Host "4. Gerar novo AAB com versionCode incrementado" -ForegroundColor White
Write-Host "5. Publicar na Play Store" -ForegroundColor White

Write-Host "`n💡 Para gerar AAB, execute:" -ForegroundColor Cyan
Write-Host "   .\gerar-aab-100-manual.ps1" -ForegroundColor White

Write-Host "`n✅ Lembre-se:" -ForegroundColor Yellow
Write-Host "   - No PWA Builder, use App Version Code: $patch" -ForegroundColor White
Write-Host "   - No PWA Builder, use App Version: $newVersion" -ForegroundColor White

# Perguntar se quer fazer commit automaticamente
Write-Host "`n" -NoNewline
$autoCommit = Read-Host "Deseja fazer commit automaticamente agora? (s/n)"

if ($autoCommit -eq "s" -or $autoCommit -eq "S") {
    Write-Host "`nExecutando git..." -ForegroundColor Cyan
    
    # Verificar se é repositório git
    if (Test-Path ".git") {
        git add sw.js app.js index.html manifest.json
        git commit -m "chore: bump version to $newVersion"
        
        Write-Host "✅ Commit realizado!" -ForegroundColor Green
        
        $autoPush = Read-Host "Deseja fazer push agora? (s/n)"
        if ($autoPush -eq "s" -or $autoPush -eq "S") {
            git push
            Write-Host "✅ Push realizado!" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Este diretório não é um repositório Git" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Processo concluído!" -ForegroundColor Green
