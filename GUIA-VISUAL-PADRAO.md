# Guia Visual Padrão - Listou

## 🎨 Sistema de Cores Unificado

O Listou segue um padrão visual moderno e consistente baseado em um tema escuro com acentos vibrantes.

### Cores Principais

- **Fundo Principal**: `--color-bg` (#0a0b0d) - Escuro profundo
- **Superfícies**: `--color-surface` (#131517) - Cinza escuro elegante  
- **Superfícies Elevadas**: `--color-surface-elevated` (#1a1d21) - Mais claro para destaque
- **Bordas**: `--color-border` (rgba(255,255,255,0.08)) - Transparente sutil

### Cores de Texto

- **Texto Principal**: `--color-text` (#f8fafc) - Branco quase puro
- **Texto Secundário**: `--color-text-secondary` (#94a3b8) - Cinza médio
- **Texto Mudo**: `--color-text-muted` (#64748b) - Cinza escuro

### Cores de Ação

- **Primária**: `--color-primary` (#3b82f6) - Azul vibrante
- **Sucesso**: `--color-success` (#10b981) - Verde
- **Aviso**: `--color-warning` (#f59e0b) - Amarelo/Laranja
- **Perigo**: `--color-danger` (#ef4444) - Vermelho
- **Accent**: `--color-accent` (#8b5cf6) - Roxo

### Gradientes

- **Primário**: `--gradient-primary` - Azul para roxo (135deg, #667eea → #764ba2)
- **Secundário**: `--gradient-secondary` - Rosa para vermelho (135deg, #f093fb → #f5576c)
- **Sucesso**: `--gradient-success` - Azul claro para ciano (135deg, #4facfe → #00f2fe)

## 🎯 Classes Padronizadas

### Botões

```css
.btn-base        /* Estilo base para todos os botões */
.btn-primary     /* Botão principal com gradiente */
.btn-success     /* Botão de sucesso verde */
.btn-warning     /* Botão de aviso amarelo */
.btn-danger      /* Botão de perigo vermelho */
.btn-ghost       /* Botão transparente com borda */
```

### Cartões

```css
.card-base       /* Cartão básico */
.card-elevated   /* Cartão com elevação */
.card-glass      /* Efeito glass moderno */
```

### Inputs

```css
.input-base      /* Input básico padronizado */
```

### Badges

```css
.badge-base      /* Badge básico */
.badge-primary   /* Badge azul */
.badge-success   /* Badge verde */
.badge-warning   /* Badge amarelo */
.badge-danger    /* Badge vermelho */
```

## ✨ Efeitos Especiais

### Glass Effect
```css
.glass-effect    /* Efeito vidro com blur */
```

### Neon Glow
```css
.neon-glow       /* Brilho neon roxo */
```

### Animações
```css
.animate-fade-in    /* Aparece suavemente */
.animate-slide-in   /* Desliza para dentro */
.animate-pulse      /* Pulsa suavemente */
```

## 📐 Espaçamentos

- **XS**: `--space-xs` (0.25rem)
- **SM**: `--space-sm` (0.5rem)
- **MD**: `--space-md` (0.75rem)
- **LG**: `--space-lg` (1rem)
- **XL**: `--space-xl` (1.5rem)
- **2XL**: `--space-2xl` (2rem)
- **3XL**: `--space-3xl` (3rem)

## 🔄 Transições

- **Rápida**: `--transition-fast` (150ms)
- **Normal**: `--transition-normal` (250ms)
- **Lenta**: `--transition-slow` (350ms)
- **Bounce**: `--transition-bounce` (500ms com easing)

## 📱 Responsividade

O sistema inclui breakpoints automáticos em 768px para dispositivos móveis, onde:
- Botões ficam menores
- Cartões têm menos padding
- Inputs se ajustam

## 🎨 Como Usar

### Para manter consistência:

1. **Sempre use variáveis CSS** ao invés de cores hardcoded
2. **Use as classes padronizadas** (.btn-primary ao invés de estilos inline)
3. **Mantenha o esquema de cores escuro** como base
4. **Use gradientes** para elementos importantes
5. **Aplique efeitos glass** para modernidade

### Exemplo correto:
```css
.meu-botao {
    background: var(--color-primary);
    color: var(--color-text);
    border-radius: var(--radius-md);
    transition: var(--transition-normal);
}
```

### Exemplo incorreto:
```css
.meu-botao {
    background: #007bff;
    color: white;
    border-radius: 8px;
    transition: 0.3s;
}
```

## 🚀 Benefícios do Padrão

- **Consistência visual** em toda a aplicação
- **Manutenção fácil** - mudança em uma variável afeta tudo
- **Acessibilidade** - contrastes testados
- **Performance** - transições otimizadas
- **Modernidade** - efeitos glass e gradientes
- **Responsividade** - adaptação automática

---

*Mantenha este padrão para um visual profissional e moderno! 🎨*
