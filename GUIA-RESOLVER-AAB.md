# 🚀 Guia Rápido: Resolver AAB Não-Assinado

## 🚨 PROBLEMA
Você tem um arquivo `Listou-unsigned.aab` que precisa ser assinado para ser aceito na Google Play Store.

## ✅ SOLUÇÃO AUTOMÁTICA

### Passo 1: Executar Script Automatizado
```powershell
# Execute o script que resolve tudo automaticamente
.\resolver-aab-nao-assinado.ps1
```

O script vai:
1. ✅ Verificar se JDK está instalado (instala se necessário)
2. ✅ Criar uma keystore forte com certificado RSA 4096 bits
3. ✅ Assinar seu AAB automaticamente
4. ✅ Verificar a assinatura
5. ✅ Gerar arquivo pronto para upload

### Passo 2: Upload para Google Play
1. Acesse [Google Play Console](https://play.google.com/console)
2. Vá para seu app
3. Faça upload do arquivo `Listou-signed.aab`

## 🔐 SOLUÇÃO MANUAL (Alternativa)

### Se Preferir Fazer Manualmente:

#### 1. Instalar JDK
```powershell
# Via Chocolatey (recomendado)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install openjdk11 -y
```

#### 2. Gerar Keystore Forte
```powershell
keytool -genkeypair `
    -alias listou-key `
    -keyalg RSA `
    -keysize 4096 `
    -sigalg SHA256withRSA `
    -validity 10000 `
    -keystore listou-release.keystore `
    -dname "CN=Seu Nome, OU=Desenvolvimento, O=Sua Empresa, L=Sua Cidade, ST=Seu Estado, C=BR"
```

#### 3. Assinar AAB
```powershell
jarsigner -verbose `
    -sigalg SHA256withRSA `
    -digestalg SHA-256 `
    -keystore listou-release.keystore `
    -signedjar Listou-signed.aab `
    Listou-unsigned.aab `
    listou-key
```

#### 4. Verificar Assinatura
```powershell
jarsigner -verify -verbose -certs Listou-signed.aab
```

## 📱 ESPECIFICAÇÕES DO CERTIFICADO

A nova keystore terá:
- **Algoritmo**: RSA 4096 bits (ultra seguro)
- **Hash**: SHA256withRSA (padrão atual)
- **Validade**: 27 anos
- **Compatível**: Google Play Store ✅

## ⚠️ IMPORTANTE

### Backup da Keystore
- **Faça backup** da keystore gerada
- **Guarde a senha** em local seguro
- **Não perca** - é necessária para futuras atualizações

### Arquivos Importantes
- `listou-release.keystore` - Sua keystore (BACKUP!)
- `Listou-signed.aab` - Arquivo para upload
- `keystore-info.json` - Informações da keystore

## 🎯 RESULTADO ESPERADO

Após executar:
1. ✅ AAB assinado com certificado forte
2. ✅ Compatível com Google Play Store
3. ✅ Pronto para publicação
4. ✅ Backup das informações importantes

## 🆘 PROBLEMAS COMUNS

### "keytool não é reconhecido"
- Instale JDK: `choco install openjdk11`
- Reinicie PowerShell

### "jarsigner não é reconhecido"
- jarsigner vem com JDK
- Verifique instalação do JDK

### AAB muito grande
- Normal para primeira versão
- Google Play otimiza automaticamente

## 📞 SUPORTE

Se tiver problemas:
1. Execute o script automatizado primeiro
2. Verifique se JDK está instalado
3. Certifique-se que o AAB existe na pasta
