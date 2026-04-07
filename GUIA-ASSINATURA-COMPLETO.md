# GUIA COMPLETO - ASSINAR APP PARA GOOGLE PLAY CONSOLE
# LISTOU - 16 de agosto de 2025

## 🎯 PROBLEMA CORRIGIDO
✅ **Botão "mudar tipo de compra" corrigido** - Agora a tela de seleção está oculta inicialmente

## 🔧 CORREÇÃO APLICADA
A tela de seleção de tipo de compra (`purchase-type-screen`) estava sempre visível porque não tinha `display: none` inicial. Isso foi corrigido no arquivo `index.html`.

## 📱 ASSINATURA DO APP - PASSO A PASSO

### MÉTODO 1: PWA BUILDER WEB (RECOMENDADO)

1. **Certifique-se de que o servidor está rodando:**
   ```
   cd "c:\Users\rafae\Downloads\Listou"
   python -m http.server 8080
   ```

2. **Acesse o PWA Builder:**
   - URL: https://www.pwabuilder.com/
   - Cole a URL do seu app: `http://localhost:8080`
   - Clique em "Start"

3. **Gere o pacote Android:**
   - Aguarde a análise do PWA
   - Clique em "Android" na seção "Package for Stores"
   - Configure as opções (pode deixar padrão)
   - Clique em "Generate Package"
   - Faça download do arquivo AAB

4. **Assine o AAB:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "assinar-aab.ps1"
   ```

### MÉTODO 2: ANDROID STUDIO (ALTERNATIVO)

1. **Instale o Android Studio:**
   - Download: https://developer.android.com/studio

2. **Crie um novo projeto:**
   - Empty Activity
   - Configure WebView para carregar seu PWA

3. **Gere o Bundle:**
   - Build > Generate Signed Bundle/APK
   - Escolha Android App Bundle (AAB)
   - Crie/use um keystore
   - Assine o bundle

### 📋 CHECKLIST ANTES DE ASSINAR

✅ Manifest.webmanifest presente e configurado
✅ Service Worker (sw.js) funcionando
✅ Ícones em várias resoluções disponíveis
✅ HTTPS habilitado (ou localhost para teste)
✅ PWA funcionando corretamente

### 🔐 INFORMAÇÕES DA ASSINATURA

**Keystore padrão criado pelo script:**
- Arquivo: `listou-release.jks`
- Alias: `listou-key`
- Senha: `listou123456`
- Validade: 10000 dias

⚠️ **IMPORTANTE:** Guarde essas informações com segurança! Você precisará do mesmo keystore para futuras atualizações.

### 📤 UPLOAD PARA GOOGLE PLAY CONSOLE

1. **Acesse:** https://play.google.com/console/
2. **Selecione seu app**
3. **Vá em:** Release > Production > Create new release
4. **Faça upload do AAB assinado**
5. **Preencha as informações necessárias**
6. **Publique**

### 🔍 VERIFICAÇÃO DE ASSINATURA

Após assinar, verifique com:
```bash
jarsigner -verify -verbose -certs "arquivo-signed.aab"
```

### 🚨 SOLUÇÃO DE PROBLEMAS

**Se o PWA Builder não funcionar:**
1. Verifique se o servidor local está rodando
2. Teste se o PWA carrega em http://localhost:8080
3. Verifique o manifest.webmanifest
4. Use o método Android Studio como alternativa

**Se a assinatura falhar:**
1. Verifique se o Java JDK está instalado
2. Verifique se o keytool e jarsigner estão no PATH
3. Execute o script como administrador
4. Use o Play App Signing como alternativa

### 📞 SUPORTE

Se houver problemas:
1. Verifique os logs do console
2. Teste o PWA em diferentes navegadores
3. Valide o manifest em: https://manifest-validator.appmanifest.org/
4. Use as ferramentas de desenvolvedor do Chrome para PWA

## ✅ STATUS ATUAL
- ✅ Problema do botão corrigido
- ✅ Scripts de assinatura prontos
- ✅ Servidor local rodando na porta 8080
- ✅ Instruções completas fornecidas

**Próximo passo:** Execute o PWA Builder web com a URL http://localhost:8080
