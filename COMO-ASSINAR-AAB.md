# SOLUCAO DEFINITIVA - Como Assinar o AAB

## SITUACAO ATUAL

Voce tem o arquivo `Listou.aab` mas ele esta assinado com certificado errado.

---

## MELHOR SOLUCAO: Usar PWA Builder Online

Esta e a forma MAIS RAPIDA e SIMPLES de resolver seu problema!

### Passo a Passo:

1. **Acesse o PWA Builder:**
   https://www.pwabuilder.com/

2. **Digite a URL do seu PWA:**
   - Cole a URL onde seu app esta hospedado (ex: https://listou.vercel.app)
   - Clique em "Start"

3. **Gere o Pacote Android:**
   - Clique em "Package for stores"
   - Selecione "Android" (icone do Android)

4. **Configure as opcoes:**
   ```
   Package ID: com.listou.app
   App name: Listou
   Launcher name: Listou
   Version: 1.0.0
   Version code: 1
   Host: https://seu-site.vercel.app
   Start URL: /
   
   Signing key: NEW (criar nova chave)
   ```

5. **Gere e Baixe:**
   - Clique em "Generate"
   - Aguarde alguns segundos
   - Baixe o arquivo ZIP gerado

6. **Extraia o ZIP:**
   - Dentro tera: `app-release-signed.aab`
   - E o arquivo `signing-key.keystore`
   - E um arquivo `readme.md` com as senhas

7. **IMPORTANTE - Guarde estes dados:**
   ```
   Keystore file: signing-key.keystore
   Keystore password: (estara no readme.md)
   Key alias: (estara no readme.md)
   Key password: (estara no readme.md)
   ```

8. **Faca upload para Google Play Console:**
   - Use o arquivo `app-release-signed.aab`
   - Guarde a keystore e senhas em local segu

---

## ALTERNATIVA 2: Instalar JDK Manualmente

Se preferir instalar o JDK localmente:

### Download:
https://www.microsoft.com/openjdk

### Ou:
https://adoptium.net/

### Apos instalar:
1. Feche e abra novamente o PowerShell
2. Execute: `java -version` (para confirmar)
3. Execute: `.\corrigir-assinatura-aab.ps1`

---

## ALTERNATIVA 3: Keystore Original (Se voce tem)

Se voce encontrou a keystore original com SHA1 correto:

```powershell
# Verificar se e a correta
keytool -list -v -keystore SUA_KEYSTORE.keystore -alias ALIAS_USADO

# Se o SHA1 for: F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D
# Entao assine o AAB:

jarsigner -verbose `
    -sigalg SHA256withRSA `
    -digestalg SHA-256 `
    -keystore SUA_KEYSTORE.keystore `
    Listou.aab `
    ALIAS_USADO
```

---

## RESUMO

**RECOMENDACAO:** Use o PWA Builder (Alternativa 1)

Por que?
- Rapido (5 minutos)
- Nao precisa instalar nada
- Gera AAB ja assinado
- Fornece keystore e senhas
- Funciona 100% online

**Importante:** Qualquer que seja o metodo escolhido, GUARDE a keystore e senhas em local seguro! Voce vai precisar delas para futuras atualizacoes.

---

Criado em: 22 de novembro de 2025
