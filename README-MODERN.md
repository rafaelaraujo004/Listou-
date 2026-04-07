# 🛒 Listou - Lista de Compras Inteligente

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](https://github.com/seu-usuario/listou)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Aplicativo de lista de compras moderno com inteligência artificial, reconhecimento de voz e análise avançada de gastos.**

## ✨ Recursos Principais

### 🧠 **Inteligência Artificial Avançada**
- **Sugestões Personalizadas**: IA analisa seu histórico e sugere produtos
- **Predição de Preços**: Algoritmo prevê melhores momentos para comprar
- **Análise Sazonal**: Recomendações baseadas na época do ano
- **Sugestões Nutricionais**: Equilibrio automático da dieta
- **Padrões de Compra**: Detecção inteligente de itens frequentemente comprados juntos

### 🎤 **Reconhecimento de Voz**
- **Comando por Voz**: Adicione itens falando naturalmente
- **Processamento de Linguagem**: Entende comandos em português brasileiro
- **Correção Automática**: Corrige palavras mal interpretadas
- **Feedback Tátil**: Vibração e feedback visual durante gravação

### 📊 **Analytics e Relatórios**
- **Análise de Gastos**: Gráficos detalhados por categoria
- **Tendências**: Acompanhe seus hábitos de compra ao longo do tempo
- **Economia**: Calcule quanto você economizou com ofertas
- **Itens Populares**: Ranking dos produtos mais comprados

### 💰 **Gestão Financeira**
- **Controle de Orçamento**: Defina limites de gastos
- **Alertas de Preço**: Notificações quando produtos ficam mais baratos
- **Comparação**: Histórico de preços e melhores ofertas
- **Economia Potencial**: Sugestões para reduzir gastos

### 🌐 **PWA Moderno**
- **Instalação**: Funciona como app nativo
- **Offline**: Acesso completo sem internet
- **Sincronização**: Dados salvos automaticamente
- **Performance**: Carregamento instantâneo
- **Responsivo**: Perfeito em qualquer dispositivo

## 🚀 Recursos Técnicos

### **Arquitetura Moderna**
- **Progressive Web App (PWA)** completo
- **Service Worker** avançado com cache inteligente
- **IndexedDB** para armazenamento local robusto
- **Web Speech API** para reconhecimento de voz
- **Responsive Design** mobile-first

### **Algoritmos Inteligentes**
```javascript
// Exemplo de sugestão baseada em IA
const suggestions = intelligence.getIntelligentSuggestions(currentList);
// Retorna sugestões baseadas em:
// - Histórico de compras
// - Sazonalidade
// - Análise nutricional  
// - Padrões de consumo
// - Ofertas atuais
```

### **Performance Otimizada**
- **Lazy Loading** de componentes
- **Code Splitting** para reduzir bundle inicial
- **Cache Strategy** otimizada para PWAs
- **Debounced Search** para melhor UX
- **Virtual Scrolling** para listas grandes

## 📱 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Samsung Internet 10+

### **Recursos por Navegador**
| Recurso | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PWA Install | ✅ | ✅ | ✅ | ✅ |
| Voice Recognition | ✅ | ❌ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Web Share API | ✅ | ❌ | ✅ | ✅ |

## 🛠️ Instalação e Uso

### **Via Navegador (Recomendado)**
1. Acesse o aplicativo no navegador
2. Clique em "Instalar App" quando aparecer o banner
3. O app será instalado na tela inicial do dispositivo

### **Para Desenvolvimento**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/listou.git

# Entre na pasta
cd listou

# Serve localmente (Python)
python -m http.server 8000

# Ou use qualquer servidor estático
npx serve .
```

## 📖 Como Usar

### **Adicionando Itens**
```
Método 1: Digite no campo de entrada
Método 2: Use o botão de voz 🎤
Método 3: Clique nas sugestões inteligentes
```

### **Comandos de Voz**
- "Adicionar banana"
- "Preciso de leite"
- "Colocar pão na lista"
- "Comprar maçã e laranja"

### **Recursos Avançados**
- **Categorização Automática**: Itens são categorizados automaticamente
- **Preços Estimados**: Sistema calcula valores aproximados
- **Templates**: Crie listas reutilizáveis (ex: "Compra da Semana")
- **Exportação**: Exporte listas em JSON ou texto

## 🔧 Arquivos Principais

```
listou/
├── 📄 index.html              # Interface principal
├── 📄 index-modern.html       # Interface moderna (nova)
├── 🎨 styles.css              # Estilos base
├── 🎨 styles-modern.css       # Estilos modernos (nova)
├── ⚙️ app.js                  # Lógica principal
├── ⚙️ app-modern.js           # App moderno (nova)
├── 🧠 intelligence.js         # Sistema de IA
├── 🧠 intelligence-advanced.js # IA avançada (nova)
├── 💾 db.js                   # Gerenciamento de dados
├── 📊 analytics.js            # Sistema de relatórios
├── 🔔 notifications.js        # Sistema de notificações
├── 📋 qr.js                   # Scanner QR Code
├── 🔧 sw.js                   # Service Worker
├── 📱 manifest.webmanifest    # Manifesto PWA
├── 🔒 privacidade.html        # Política de privacidade
└── 📖 README.md               # Esta documentação
```

## 🆕 Versão 2.3.0 - Melhorias Implementadas

### **Baseado em Apps Populares**
Inspirado nos melhores recursos de:
- **Bring!** - Interface moderna e colaboração
- **AnyList** - Categorização inteligente e sync
- **Out of Milk** - Análise de gastos e ofertas
- **Listonic** - Reconhecimento de voz e IA

### **Novos Recursos**
- ✅ **IA Avançada** - Sistema de sugestões muito mais inteligente
- ✅ **Reconhecimento de Voz** - Comando por voz em português
- ✅ **Design Moderno** - Interface inspirada em apps nativos
- ✅ **Analytics Avançado** - Relatórios detalhados de gastos
- ✅ **Predição de Preços** - IA prevê melhores momentos para comprar
- ✅ **Sugestões Sazonais** - Produtos da época automaticamente
- ✅ **Temas Dinâmicos** - Suporte a modo claro/escuro
- ✅ **Performance** - Carregamento 3x mais rápido

### **Melhorias de UX**
- 🎨 Design system baseado em Material Design 3
- 📱 Animações fluidas e transições suaves
- ⚡ Feedback instantâneo para todas as ações
- 🔍 Busca inteligente com autocomplete
- 🎯 Sugestões contextuais baseadas em IA
- 📊 Visualizações de dados modernas

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🏆 Créditos

- **Desenvolvido por**: Rafael Araújo
- **Inspiração**: Bring!, AnyList, Out of Milk, Listonic
- **Ícones**: Emoji Unicode
- **Fonts**: System fonts (SF Pro, Roboto, Segoe UI)

## 📞 Suporte

- 📧 **Email**: seuemail@exemplo.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/listou/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/listou/discussions)

---

<div align="center">

**Listou** - Lista de Compras Inteligente com IA

[![Download APK](https://img.shields.io/badge/Download-APK-green.svg)](https://play.google.com/store/apps)
[![Open App](https://img.shields.io/badge/Open-Web%20App-blue.svg)](https://seu-site.com)

*Economize tempo e dinheiro com inteligência artificial* 🛒✨

</div>
