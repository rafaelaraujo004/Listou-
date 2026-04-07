# CRIAR NOVO APP - PASSO A PASSO SIMPLES
# Solucao para problema de chave de assinatura

## CONFIGURACOES PARA O NOVO APP

Package ID sugerido: com.listou.app.v2
App Name: Listou
Version: 1.0.0
Description: Lista de Compras Inteligente

## PASSO A PASSO DETALHADO

### 1. CRIAR NOVO APP NO GOOGLE PLAY CONSOLE

1. Acesse: https://play.google.com/console/
2. Clique em "Create app" 
3. Preencha:
   - App name: Listou
   - Default language: Portuguese (Brazil)
   - App or game: App
   - Free or paid: Free
4. Aceite os termos e clique "Create app"

### 2. CONFIGURAR APP SIGNING (IMPORTANTE!)

1. No novo app, va em: Release > Setup > App signing
2. Clique em "Use Play App Signing"
3. Escolha "Continue"
4. Selecione "Let Google generate and manage my app signing key"
5. Confirme

### 3. GERAR NOVO AAB COM PACKAGE ID CORRETO

1. Certifique-se que o servidor esta rodando:
   python -m http.server 8080

2. Acesse: https://www.pwabuilder.com/

3. Configure:
   - URL: http://localhost:8080
   - Clique "Start"
   - Aguarde analise
   - Clique "Android"

4. CONFIGURACOES IMPORTANTES:
   - Package ID: com.listou.app.v2
   - App name: Listou  
   - Version: 1.0.0
   - Start URL: /
   - Display mode: standalone

5. Clique "Generate Package"
6. Aguarde geracao (3-5 minutos)
7. Faca download do AAB

### 4. UPLOAD NO GOOGLE PLAY CONSOLE

1. NO NOVO APP que voce criou
2. Va em: Release > Production  
3. Clique "Create new release"
4. Faca upload do AAB (NAO execute assinar-aab.ps1!)
5. Preencha as informacoes necessarias
6. Publique

## VANTAGENS DESTA SOLUCAO

- Sem problemas de chave de assinatura
- Google gerencia assinatura automaticamente  
- Processo mais moderno e seguro
- Nao precisa encontrar keystore antigo

## IMPORTANTE

- Use SEMPRE o mesmo Package ID (com.listou.app.v2) para futuras atualizacoes
- NAO execute scripts de assinatura local
- O Google assina automaticamente com Play App Signing
