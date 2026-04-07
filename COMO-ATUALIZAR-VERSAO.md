# 🔄 Como Atualizar a Versão do App

## ⚠️ IMPORTANTE: Sempre que fizer alterações no app, siga estes passos:

### 1️⃣ Incrementar a Versão em 3 Arquivos

#### Arquivo 1: `sw.js` (linha 2)
```javascript
const APP_VERSION = '1.0.51'; // Incrementar aqui
```

#### Arquivo 2: `app.js` (linha 2)
```javascript
const CURRENT_VERSION = '1.0.51'; // Incrementar aqui
```

#### Arquivo 3: `index.html` (linha 52)
```html
<div class="text-xs muted">Versão: <span id="appVersionSide">1.0.51</span></div>
```

---

## 📱 Como Funciona o Sistema de Atualização

### Para PWAs Instalados:
1. **Service Worker detecta mudança** na versão do cache
2. **Limpa caches antigos** automaticamente
3. **Baixa novos arquivos** do servidor
4. **Exibe notificação** para o usuário atualizar
5. **Recarrega app** com nova versão

### Para APK da Play Store:
1. **Gere novo APK/AAB** com a versão incrementada
2. **Incremente versionCode** no build (exemplo: 50 → 51)
3. **Publique na Play Store**
4. Usuários receberão **atualização automática** em até 24h

---

## 🎯 Padrão de Versionamento

Use o formato: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Mudanças grandes, incompatíveis
- **MINOR** (x.1.x): Novas funcionalidades compatíveis
- **PATCH** (x.x.51): Correções de bugs e melhorias

### Exemplos:
- `1.0.51` → Correção de bug
- `1.1.0` → Nova funcionalidade (ex: exportar PDF)
- `2.0.0` → Mudança grande (ex: redesign completo)

---

## ✅ Checklist Antes de Publicar

- [ ] Incrementei a versão nos 3 arquivos (`sw.js`, `app.js`, `index.html`)
- [ ] Testei localmente que a atualização funciona
- [ ] Verifiquei que não há erros no console
- [ ] Limpei cache do navegador (`Ctrl + Shift + Delete`)
- [ ] Testei a instalação como PWA
- [ ] (Para APK) Incrementei `versionCode` e `versionName` no build

---

## 🚀 Como Forçar Atualização Imediata

Se usuários não estão atualizando:

### Opção 1: Aumentar número de versão significativamente
```javascript
// De 1.0.50 para 1.0.60 (pular 10 versões)
const APP_VERSION = '1.0.60';
```

### Opção 2: Limpar todos os caches via código
Adicione temporariamente no `app.js`:
```javascript
// APENAS UMA VEZ - depois remover
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  localStorage.clear();
  location.reload();
}
```

### Opção 3: Instruir usuários
- **PWA**: Desinstalar app → Reinstalar da web
- **APK**: Configurações → Aplicativos → Listou → Limpar cache

---

## 📊 Logs de Versão

Mantenha registro das versões:

### v1.0.50 (20/11/2025)
- ✅ Sistema de atualização automática implementado
- ✅ Correção modo standalone (sem barra de navegador)
- ✅ Versionamento dinâmico

### v1.0.51 (próxima)
- [ ] Suas próximas melhorias aqui

---

## 🔧 Troubleshooting

### "App não atualiza mesmo com nova versão"
1. Verificar se os 3 arquivos têm a MESMA versão
2. Limpar cache do navegador completamente
3. Desinstalar e reinstalar o PWA

### "Erro 'Service Worker failed to register'"
1. Verificar se `sw.js` está acessível (sem erro 404)
2. Verificar console para erros de sintaxe
3. Garantir que está em HTTPS (ou localhost)

### "Play Store não mostra atualização"
1. Verificar se `versionCode` foi incrementado
2. Aguardar até 24h para propagação
3. Verificar se build foi aprovado pela Play Store

---

## 💡 Dicas Importantes

- **SEMPRE** incremente a versão, mesmo para mudanças pequenas
- Use **cache busting** adicionando `?v=1.0.51` em assets se necessário
- Teste em **modo anônimo** para garantir cache limpo
- Versão do PWA e APK devem ser **sincronizadas**
