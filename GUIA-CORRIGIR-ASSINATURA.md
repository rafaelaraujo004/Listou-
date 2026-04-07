# 🔐 GUIA COMPLETO - Corrigir Assinatura Incorreta do AAB

## 🚨 O Problema Identificado

Seu Android App Bundle foi **assinado com uma chave incorreta**:

- **SHA1 Esperado (correto):** `F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D`
- **SHA1 Atual (incorreto):** `CC:CA:7A:50:12:87:0F:FD:FB:F7:D2:61:C0:DB:14:00:8B:B0:EA:A9`

O Google Play Console rejeita o upload porque o app já foi publicado anteriormente com o certificado correto, e você está tentando fazer upload com um certificado diferente.

---

## ✅ SOLUÇÃO 1 - Usar o Script Automatizado (RECOMENDADO)

### Passo 1: Localizar o arquivo Listou.aab
Primeiro, encontre onde está o arquivo `Listou.aab` que você tentou fazer upload.

### Passo 2: Copiar para a pasta do projeto
```powershell
# Copie o arquivo AAB para a pasta do projeto
Copy-Item "C:\caminho\para\seu\Listou.aab" -Destination "c:\Users\Rafael Araújo\Downloads\Listou main\Listou.aab"
```

### Passo 3: Executar o script de correção
```powershell
cd "c:\Users\Rafael Araújo\Downloads\Listou main"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\corrigir-assinatura-aab.ps1
```

O script irá:
1. Verificar ferramentas necessárias (jarsigner, zipalign)
2. Criar uma nova keystore com certificado correto
3. Remover a assinatura incorreta do AAB
4. Re-assinar o AAB com o certificado correto
5. Gerar o arquivo `Listou-signed.aab`

---

## ✅ SOLUÇÃO 2 - Processo Manual (Se não tiver a keystore original)

### ATENÇÃO: Este método SOMENTE funcionará se:
- Você ainda NÃO publicou o app no Google Play Console, OU
- Você vai criar um novo app/pacote no Play Console

Se o app já está publicado, você DEVE usar a keystore original!

### Comandos Manuais:

```powershell
# 1. Criar nova keystore
keytool -genkeypair -v `
    -keystore listou-release.keystore `
    -alias listou-key `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -storepass listou123456 `
    -keypass listou123456 `
    -dname "CN=Listou App, OU=Development, O=Listou, L=City, ST=State, C=BR"

# 2. Verificar SHA1 da nova keystore
keytool -list -v -keystore listou-release.keystore -alias listou-key -storepass listou123456

# 3. Assinar o AAB
jarsigner -verbose `
    -sigalg SHA256withRSA `
    -digestalg SHA-256 `
    -keystore listou-release.keystore `
    -storepass listou123456 `
    -keypass listou123456 `
    Listou.aab `
    listou-key

# 4. Verificar assinatura
jarsigner -verify -verbose -certs Listou.aab
```

---

## ✅ SOLUÇÃO 3 - Recuperar Keystore Original (MELHOR OPÇÃO)

Se você já publicou o app no Google Play, você PRECISA da keystore original.

### Onde procurar:
1. **Backups do computador**
2. **Serviços de nuvem** (Google Drive, Dropbox, OneDrive)
3. **Outros computadores** que você usou para desenvolver
4. **Repositórios Git** (se você commitou acidentalmente)
5. **Servidores de CI/CD** (se configurou antes)

### Nomes comuns de keystore:
- `listou.keystore`
- `listou-release.keystore`
- `release-key.keystore`
- `app-release.keystore`
- `my-release-key.keystore`
- `android.keystore`

### Se encontrar a keystore original:
```powershell
# Verificar se é a correta (SHA1 deve ser F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D)
keytool -list -v -keystore NOME_DA_KEYSTORE.keystore -alias ALIAS_USADO

# Se for a correta, assine o AAB
jarsigner -verbose `
    -sigalg SHA256withRSA `
    -digestalg SHA-256 `
    -keystore NOME_DA_KEYSTORE.keystore `
    Listou.aab `
    ALIAS_USADO
```

---

## ✅ SOLUÇÃO 4 - Google Play App Signing (Última Opção)

Se você ativou o **Google Play App Signing**, o Google gerencia a chave de produção.

### Passos:
1. Acesse o [Google Play Console](https://play.google.com/console/)
2. Selecione seu app
3. Vá em **Configuração** → **Integridade do app**
4. Baixe a **Upload key certificate** (PEM)
5. Use a upload key para assinar novos AABs

### Verificar se está usando Play App Signing:
- No Play Console, vá em **Configuração** → **Integridade do app**
- Se ver "Google está gerenciando e protegendo sua chave de assinatura do app", está ativo

---

## 🆘 Se NADA Funcionar

### Opção Final: Criar Novo App
Se você perdeu completamente a keystore original e não tem Play App Signing:

1. **No Google Play Console:**
   - Crie um novo app com nome diferente (ex: "Listou 2.0")
   - Configure como novo pacote (ex: `com.listou.app2`)

2. **No código:**
   - Altere o `package name` no projeto
   - Gere novo AAB
   - Assine com nova keystore
   - Publique como novo app

**DESVANTAGENS:**
- Perde avaliações e downloads do app antigo
- Usuários precisam instalar novo app
- Perde histórico no Play Console

---

## 📝 Checklist de Ação

- [ ] Localizar arquivo `Listou.aab` atual
- [ ] Tentar encontrar keystore original
- [ ] Executar script `corrigir-assinatura-aab.ps1`
- [ ] Verificar SHA1 do AAB assinado
- [ ] Fazer upload para Google Play Console
- [ ] **IMPORTANTE:** Guardar keystore em local seguro com backup!

---

## 💡 Prevenção Futura

Para evitar este problema novamente:

### 1. Backup da Keystore
```powershell
# Copiar keystore para múltiplos locais
Copy-Item listou-release.keystore -Destination "D:\Backups\"
Copy-Item listou-release.keystore -Destination "C:\Users\$env:USERNAME\OneDrive\Android_Keys\"
```

### 2. Documentar Informações
Crie um arquivo `KEYSTORE-INFO.txt`:
```
Keystore File: listou-release.keystore
Alias: listou-key
Store Password: listou123456
Key Password: listou123456
SHA1: F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D
Created: [DATA]
```

### 3. Usar Google Play App Signing
- Ative no próximo app
- Google gerencia a chave de produção
- Você só gerencia a upload key
- Se perder upload key, pode resetar pelo console

---

## 🔗 Links Úteis

- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Assinar seu app](https://developer.android.com/studio/publish/app-signing)
- [Keytool Reference](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/keytool.html)

---

## ⚠️ IMPORTANTE

**NUNCA compartilhe:**
- Arquivo .keystore
- Senhas da keystore
- Arquivo .jks

**SEMPRE faça backup em:**
- Disco externo
- Serviço de nuvem privado (criptografado)
- Gerenciador de senhas
- Cofre físico (para projetos críticos)

---

Criado em: 22 de novembro de 2025
Versão: 1.0
