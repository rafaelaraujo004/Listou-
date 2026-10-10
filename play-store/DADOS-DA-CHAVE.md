# Dados da chave de assinatura — Listou

Guarde este arquivo. **A senha não está aqui** e nunca deve ser escrita neste
repositório — ela fica só com você.

## Chave de upload

| | |
|---|---|
| Arquivo | `C:\Users\Rafael Araújo\chaves-listou\listou-upload.keystore` |
| Alias | `listou` |
| Tipo | PKCS12, RSA 2048 |
| Titular | CN=Listou, OU=Listou, O=Listou, L=Maraba, ST=PA, C=BR |
| Criada em | 4 de setembro de 2026 |
| Válida até | 20 de janeiro de 2054 |
| **SHA-256** | `9C:30:27:B4:18:95:6A:9D:6F:A6:A2:3C:8C:DE:94:93:A1:12:57:EF:F6:87:CA:4C:B7:5D:D4:1F:88:7F:C8:A0` |

O SHA-256 serve para conferir, no futuro, se um arquivo de keystore é mesmo
este. Rode e compare:

```
keytool -list -v -keystore listou-upload.keystore -alias listou
```

## Identificador do app

`br.com.listou.app` — `com.listou.app` já estava registrado por outra conta
na Play, e o identificador é único no mundo todo. A chave abaixo continua
valendo: trocar o identificador não exige trocar a chave.

## Backup — faça agora

Copie o arquivo `.keystore` para **dois lugares** fora deste computador
(nuvem privada, HD externo, pen drive) e guarde a senha num gerenciador de
senhas.

Sem o arquivo **e** a senha não há como publicar atualizações. Foi o que
aconteceu com o app anterior (`app.vercel.listou_phi.twa`), cuja chave se
perdeu — por isso este virou uma listagem nova.

## Rede de segurança

Ao criar o app no Play Console, **ative o Play App Signing** quando ele
oferecer. Com ele, o Google passa a guardar a chave final de assinatura e esta
aqui vira apenas a chave de *upload* — que pode ser redefinida caso você a
perca. Sem isso, perder este arquivo significa perder o app.

## App anterior

| | |
|---|---|
| ID | `app.vercel.listou_phi.twa` |
| Chave que o assinou | alias `LISTOU-K`, SHA-256 `89:37:19:8A:6E:9B:24:AE:83:FE:E7:B3:4B:44:D0:13:45:A6:F0:0F:6F:1C:4D:97:93:B5:74:F2:86:76:66:E6` |
| Situação | chave perdida; app não pode mais ser atualizado |

Depois que a listagem nova estiver no ar, vale despublicar essa antiga.
