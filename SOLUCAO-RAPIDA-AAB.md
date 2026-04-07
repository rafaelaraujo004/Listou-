# SOLUCAO RAPIDA - Assinar AAB sem instalar JDK

## OPCAO 1: Usar PWA Builder (Recomendado)

O PWA Builder pode gerar o AAB ja assinado corretamente!

### Passos:
1. Acesse: https://www.pwabuilder.com/
2. Digite a URL do seu PWA: https://seu-site.vercel.app
3. Clique em "Package For Stores"
4. Selecione "Android"
5. Configure:
   - Package ID: com.listou.app
   - App name: Listou
   - Signing key: "New"
6. Clique em "Generate Package"
7. Baixe o AAB gerado

O PWA Builder ira:
- Gerar keystore automaticamente
- Assinar o AAB corretamente
- Fornecer os dados da keystore para backup

---

## OPCAO 2: Usar Android Studio

Se voce tem Android Studio instalado:

1. Abra Android Studio
2. Menu: Build > Generate Signed Bundle/APK
3. Selecione "Android App Bundle"
4. Clique "Next"
5. Escolha "Create new..." para criar nova keystore
6. Preencha os dados:
   - Key store path: C:\Users\Rafael\listou-release.keystore
   - Password: listou123456
   - Alias: listou-key
   - Key password: listou123456
   - Certificate info (preencha com seus dados)
7. Clique "Next" e depois "Finish"

---

## OPCAO 3: Aguardar Instalacao do JDK

O script de instalacao do JDK esta rodando em segundo plano.
Quando concluir, execute:

```powershell
.\corrigir-assinatura-aab.ps1
```

---

## IMPORTANTE: Keystore Original

Se voce JA PUBLICOU o app antes, voce PRECISA encontrar a keystore original!

### Onde procurar:
- Pasta do projeto antigo
- Backups
- Google Drive / OneDrive
- Email (pode ter enviado para alguem)
- Outro computador

### Verificar se a keystore e a correta:
```powershell
keytool -list -v -keystore SUA_KEYSTORE.keystore -alias ALIAS
```

O SHA1 deve ser: **F9:1B:4C:5E:8B:14:20:82:1C:2E:7E:78:EC:39:55:4A:A6:95:95:1D**

---

## Status da Instalacao

Execute este comando para verificar se o JDK foi instalado:

```powershell
java -version
```

Se aparecer a versao, o JDK foi instalado com sucesso!
Entao execute:

```powershell
.\corrigir-assinatura-aab.ps1
```
