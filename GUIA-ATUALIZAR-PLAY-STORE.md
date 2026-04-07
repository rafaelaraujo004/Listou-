# 📦 Guia: Incrementar Versão para Publicação na Play Store

## 🎯 Objetivo
Garantir que os usuários recebam atualizações automáticas do app na Play Store.

---

## ⚠️ PROBLEMA IDENTIFICADO

**Sintoma:** Usuários não recebem atualizações após publicar nova versão na Play Store

**Causa:** Versão não foi incrementada corretamente

---

## ✅ SOLUÇÃO COMPLETA

### Passo 1: Atualizar Versão nos Arquivos do PWA

#### 1.1 - Arquivo `sw.js` (linha 2)
```javascript
const APP_VERSION = '1.0.51'; // ← INCREMENTAR ESTE NÚMERO
```

#### 1.2 - Arquivo `app.js` (linha 2)
```javascript
const CURRENT_VERSION = '1.0.51'; // ← INCREMENTAR ESTE NÚMERO
```

#### 1.3 - Arquivo `index.html` (linha 52)
```html
<span id="appVersionSide">1.0.51</span> <!-- ← INCREMENTAR ESTE NÚMERO -->
```

### Passo 2: Atualizar Versão no Manifest

#### Arquivo `manifest.json`
Adicione ou atualize a propriedade `version`:

```json
{
  "name": "Listou — Lista de Compras",
  "short_name": "Listou",
  "version": "1.0.51",
  "version_name": "1.0.51"
}
```

---

## 🔢 Entendendo versionCode vs versionName

### Para PWA Builder / Play Store:

#### `versionCode` (OBRIGATÓRIO)
- **Número inteiro** que sempre AUMENTA
- Google Play usa isso para detectar atualizações
- **NUNCA pode diminuir**
- Exemplos: `1`, `2`, `3`, `50`, `51`, `100`

```json
"versionCode": 51
```

#### `versionName` (Visível para usuários)
- String legível para humanos
- Aparece na Play Store
- Pode ser qualquer formato
- Exemplos: `"1.0.0"`, `"1.0.51"`, `"2.0-beta"`

```json
"versionName": "1.0.51"
```

---

## 📝 Ao Gerar AAB pelo PWA Builder

### Opção 1: Via PWA Builder Web (https://www.pwabuilder.com)

1. Acesse https://www.pwabuilder.com
2. Cole a URL do seu PWA hospedado
3. Clique em "Package for Stores"
4. Selecione "Android"
5. **Configure as versões:**
   ```
   App Version: 1.0.51
   App Version Code: 51
   Package ID: com.listou.app (manter o mesmo)
   ```
6. Baixe o AAB gerado

### Opção 2: Modificar twa-manifest.json Manualmente

Se você já tem o projeto do PWA Builder localmente:

```json
{
  "packageId": "com.listou.app",
  "host": "seu-dominio.com",
  "name": "Listou",
  "launcherName": "Listou",
  "display": "standalone",
  "themeColor": "#0f172a",
  "backgroundColor": "#0f172a",
  "startUrl": "/",
  "iconUrl": "https://seu-dominio.com/icons/icon-512x512.png",
  "maskableIconUrl": "https://seu-dominio.com/icons/icon-maskable-512x512.png",
  "monochromeIconUrl": "https://seu-dominio.com/icons/icon-512x512.png",
  "assetlinks": true,
  "appVersion": "1.0.51",
  "appVersionCode": 51,
  "shortcuts": [],
  "enableNotifications": false,
  "webManifestUrl": "https://seu-dominio.com/manifest.json"
}
```

Depois execute:
```powershell
npx @bubblewrap/cli build
```

---

## 🚀 Publicando Atualização na Play Store

### Via Play Console:

1. Acesse: https://play.google.com/console
2. Selecione seu app "Listou"
3. Vá em **Produção** → **Criar nova versão**
4. Faça upload do novo AAB
5. **IMPORTANTE:** Verifique que mostra:
   ```
   Nova versão: 51
   Versão anterior: 50
   ```
6. Preencha "O que há de novo nesta versão"
7. Clique em **Revisar versão**
8. Clique em **Iniciar implantação em produção**

---

## ⏱️ Tempo de Propagação

| Etapa | Tempo |
|-------|-------|
| Upload do AAB | Imediato |
| Processamento Google | 1-3 horas |
| Aprovação automática | 1-24 horas |
| Disponível na Play Store | Após aprovação |
| Atualização nos dispositivos | Até 24-48h |

### Forçar atualização imediata:
1. Abrir Play Store no celular
2. Buscar "Listou"
3. Se aparecer "Atualizar", clicar
4. Se não aparecer, aguardar propagação

---

## 📋 Checklist Completo de Publicação

- [ ] ✅ Incrementei versão em `sw.js`
- [ ] ✅ Incrementei versão em `app.js`
- [ ] ✅ Incrementei versão em `index.html`
- [ ] ✅ Incrementei `versionCode` no AAB (51, 52, 53...)
- [ ] ✅ Incrementei `versionName` no AAB (1.0.51, 1.0.52...)
- [ ] ✅ Testei o PWA localmente
- [ ] ✅ Fiz commit das mudanças no GitHub
- [ ] ✅ Deploy do PWA está atualizado
- [ ] ✅ Gerei novo AAB com versões atualizadas
- [ ] ✅ Fiz upload na Play Console
- [ ] ✅ Preenchi changelog "O que há de novo"
- [ ] ✅ Publiquei a versão
- [ ] ✅ Aguardei processamento (1-3h)
- [ ] ✅ Verifiquei que está disponível na Play Store

---

## 🔥 Exemplo Prático Completo

### Cenário: Você corrigiu um bug e quer publicar

#### Versão Atual: 1.0.50 → Nova Versão: 1.0.51

**1. Atualizar arquivos do PWA:**

`sw.js` linha 2:
```javascript
const APP_VERSION = '1.0.51';
```

`app.js` linha 2:
```javascript
const CURRENT_VERSION = '1.0.51';
```

`index.html` linha 52:
```html
<span id="appVersionSide">1.0.51</span>
```

**2. Fazer commit e deploy:**
```powershell
git add .
git commit -m "chore: bump version to 1.0.51"
git push origin main
```

**3. Gerar novo AAB no PWA Builder:**
- App Version: `1.0.51`
- App Version Code: `51`

**4. Publicar na Play Store:**
- Upload do AAB
- Changelog: "Correção de bugs e melhorias de desempenho"
- Publicar

**5. Aguardar e verificar:**
- Aguardar 1-3h para processamento
- Verificar na Play Store que está com versão 1.0.51
- Testar atualização em um dispositivo

---

## 🐛 Solução de Problemas

### "Play Console rejeita: versão duplicada"
**Causa:** Você enviou um AAB com o mesmo `versionCode` anterior
**Solução:** Incrementar o `versionCode` para um número maior

### "Usuários não recebem atualização"
**Causa:** Pode levar até 48h para propagar
**Soluções:**
1. Aguardar mais tempo
2. Instruir usuários a atualizar manualmente via Play Store
3. Usar "Implantação em fases" para testar antes

### "AAB rejeitado por assinatura"
**Causa:** Chave de assinatura diferente
**Solução:** 
- Usar sempre a mesma keystore
- OU configurar "Play App Signing" (recomendado)

### "Versão PWA diferente da versão APK"
**Causa:** Esqueceu de atualizar algum arquivo
**Solução:** Sincronizar todas as versões nos 3 arquivos

---

## 💡 Boas Práticas

1. **Sempre incremente** o `versionCode` em 1 para cada publicação
2. **Mantenha sincronizado** PWA e APK com mesma versão
3. **Use versionamento semântico** (1.0.x para bugs, 1.x.0 para features)
4. **Teste localmente** antes de publicar
5. **Documente mudanças** no changelog da Play Store
6. **Configure Play App Signing** para facilitar assinatura
7. **Habilite rollout gradual** para testar com pequeno grupo primeiro

---

## 🎓 Dica Extra: Automatizar Versionamento

Crie um script PowerShell `incrementar-versao.ps1`:

```powershell
# Ler versão atual
$currentVersion = "1.0.50"
$parts = $currentVersion.Split(".")
$patch = [int]$parts[2] + 1
$newVersion = "$($parts[0]).$($parts[1]).$patch"

Write-Host "Versão atual: $currentVersion" -ForegroundColor Yellow
Write-Host "Nova versão: $newVersion" -ForegroundColor Green

# Atualizar arquivos
(Get-Content "sw.js") -replace "APP_VERSION = '$currentVersion'", "APP_VERSION = '$newVersion'" | Set-Content "sw.js"
(Get-Content "app.js") -replace "CURRENT_VERSION = '$currentVersion'", "CURRENT_VERSION = '$newVersion'" | Set-Content "app.js"
(Get-Content "index.html") -replace ">$currentVersion<", ">$newVersion<" | Set-Content "index.html"

Write-Host "✅ Versão atualizada com sucesso!" -ForegroundColor Green
```

Execute:
```powershell
.\incrementar-versao.ps1
```

---

**🎉 Pronto! Agora seus usuários sempre receberão as atualizações automaticamente!**
