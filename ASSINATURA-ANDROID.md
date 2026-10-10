# Gerar e assinar o app Android (Capacitor)

O Listou virou um app nativo com **Capacitor**: todo o HTML/CSS/JS é empacotado
dentro do APK (`assets/public/`), então ele funciona **100% offline** e não
depende mais do site no Vercel.

- `appId`: `com.listou.app` (definido em `capacitor.config.json`)
- Projeto Android: `android/`
- Pasta web empacotada: `www/` — **gerada** por `node build-www.js`, não edite à mão

## Pré-requisitos (já instalados nesta máquina)

| Ferramenta | Caminho |
|---|---|
| JDK 21 | `C:\Users\Rafael Araújo\dev-tools\jdk-21.0.12.1+1` |
| Android SDK | `C:\Users\Rafael Araújo\dev-tools\android-sdk` |

## Build de teste (APK instalável)

```bash
npm run android:apk
```

O APK sai em `android/app/build/outputs/apk/debug/app-debug.apk`.
Copie para o celular e instale (é preciso permitir "fontes desconhecidas").

## Build de publicação (AAB para a Play Store)

### 1. Criar a keystore (uma única vez — guarde-a e à senha com cuidado)

Rode você mesmo no terminal e escolha uma senha forte quando for pedida.
**Se perder esta chave, não é possível atualizar o app na Play Store.**

```bash
"C:\Users\Rafael Araújo\dev-tools\jdk-21.0.12.1+1\bin\keytool" -genkeypair -v -keystore listou-release.keystore -alias listou -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Apontar o build para ela

Crie `android/keystore.properties` (já está no `.gitignore`):

```properties
storeFile=C:/caminho/completo/listou-release.keystore
storePassword=SUA_SENHA
keyAlias=listou
keyPassword=SUA_SENHA
```

### 3. Gerar o AAB assinado

```bash
npm run android:aab
```

O arquivo sai em `android/app/build/outputs/bundle/release/app-release.aab`.
Sem `keystore.properties` o build ainda funciona, mas o AAB sai **sem assinatura**
e a Play Store o recusa.

## Atualizar o app

Ao publicar uma nova versão, incremente **os dois** valores em `android/app/build.gradle`:

```gradle
versionCode 2      // precisa ser maior que o da versão publicada
versionName "1.1"  // o que o usuário vê
```

## Observações desta máquina

- O caminho do projeto tem acento (`Araújo`); o Android Gradle Plugin bloqueia isso
  por padrão, então `android/gradle.properties` traz `android.overridePathCheck=true`.
- O `TEMP` do usuário usa nome curto 8.3 (`RAFAEL~1`) e o AF_UNIX do JDK não resolve
  esse caminho, o que quebrava o Gradle com "Unable to establish loopback connection".
  Por isso os sockets apontam para `C:\gradle-tmp` (via `org.gradle.jvmargs`).
