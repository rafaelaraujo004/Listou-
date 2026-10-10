# Ficha da Play Store — Listou

Tudo o que o Google Play Console pede, pronto para copiar e colar.
Gerado para a **versão 1.0.0 (versionCode 1)** — primeira publicação deste app.

---

## 1. Detalhes do app

| Campo | Valor | Limite |
|---|---|---|
| **Nome do app** | `Listou: Lista de Compras` | 30 (usa 24) |
| **Descrição curta** | `Lista de compras com preço, total em tempo real e comparação de mercados.` | 80 (usa 73) |
| **Idioma padrão** | Português (Brasil) – pt-BR | |
| **Tipo** | Aplicativo | |
| **Gratuito ou pago** | Gratuito | |
| **Categoria** | Compras | |
| **Tags** (até 5) | Lista de compras · Supermercado · Orçamento · Finanças pessoais · Organização | |

### Descrição completa

```
Sua lista de compras com o preço aparecendo enquanto você monta.

O Listou soma tudo em tempo real. Antes de sair de casa você já sabe quanto a
compra vai custar, e no mercado acompanha quanto já colocou no carrinho.

TOTAL PREVISTO E TOTAL REALIZADO
Cada item tem quantidade, unidade e preço. O painel mostra o total previsto da
lista inteira e, conforme você marca os itens no corredor, o total realizado e a
barra de progresso acompanham. Sem calculadora, sem susto no caixa.

DESCUBRA QUAL MERCADO É MAIS BARATO
Registre em qual mercado você comprou e o Listou guarda o preço de cada produto
por estabelecimento. Com o tempo ele mostra qual supermercado sai mais em conta
para a sua lista e quais produtos valem mais a pena em cada um.

RELATÓRIOS QUE FAZEM SENTIDO
Gasto por categoria, curva ABC dos itens que mais pesam, gastos por mês,
frequência de compra e ranking de variação de preço — para você ver quando um
produto subiu antes de colocá-lo no carrinho de novo.

LISTAS PRONTAS
Churrasco, limpeza do mês, café da manhã, semana saudável, volta às aulas, pet,
padaria, açougue, marmita fit e mais. Um toque e os itens entram na sua lista.
Você também pode salvar as suas próprias listas para reutilizar.

PRODUTOS PRÉ-CADASTRADOS
Cadastre os produtos que você sempre compra com marca, unidade e preço
estimado. Eles passam a aparecer como sugestão ao montar a lista.

HISTÓRICO DE COMPRAS
Toda compra finalizada vira um registro com data, mercado, itens e total. Dá
para reaproveitar uma compra antiga como nova lista em um toque.

FUNCIONA SEM INTERNET
O Listou é offline de verdade. Todo o app é instalado no aparelho: abre e
funciona no modo avião, no subsolo do mercado ou onde o sinal não chega.

SEM CADASTRO E SEM COLETA DE DADOS
Não tem login, não tem conta, não tem anúncio. Nada do que você digita sai do
seu aparelho — não temos servidores nem acesso às suas listas.

OUTROS RECURSOS
• Tema claro e escuro
• Filtro por categoria e várias ordenações
• Copiar a lista ou enviar por qualquer aplicativo
• Sugestões baseadas no seu histórico de compras
• Interface pensada para uso com uma mão, dentro do mercado

Baixe o Listou e chegue no caixa sabendo exatamente quanto vai pagar.
```

---

## 2. Recursos gráficos

| Item | Arquivo | Formato exigido |
|---|---|---|
| Ícone do app | `icone-512x512.png` | 512×512 PNG, 32 bits |
| Gráfico de destaque | `feature-graphic-1024x500.png` | 1024×500 PNG |
| Capturas de telefone | `capturas/01` a `capturas/07` | 1080×1920 PNG (mín. 2, máx. 8) |

As capturas já estão na ordem recomendada. A ordem importa: as **duas primeiras**
aparecem na busca, então mantenha `01-lista` e `02-adicionar` no começo.

> **Tablet:** o Console pede capturas de tablet só se você quiser distribuir para
> tablets. Se aparecer o aviso, ou você envia capturas 7"/10", ou desmarca
> tablets em *Configuração do app › Dispositivos*.

---

## 3. Segurança dos dados (Data safety)

Esta é a seção que mais reprova app. As respostas abaixo refletem o que o
aplicativo faz de fato — foi verificado que ele não executa nenhuma requisição
de rede e declara apenas a permissão `INTERNET`, usada pelo componente WebView.

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha algum dos tipos de dados exigidos? | **Não** |
| Todos os dados são criptografados em trânsito? | Não se aplica (não há transmissão) |
| Você fornece uma forma de o usuário solicitar a exclusão dos dados? | **Sim** — Configurações › Remover todos os dados, e a desinstalação apaga tudo |

Resultado: a ficha da loja exibirá **"Nenhum dado coletado"** e
**"Nenhum dado compartilhado com terceiros"**.

---

## 4. Classificação de conteúdo

Responda ao questionário como **Utilitário, produtividade, comunicação ou outro**:

| Pergunta | Resposta |
|---|---|
| Violência, sexo, linguagem imprópria, drogas | Não para todas |
| Permite interação entre usuários | Não |
| Compartilha localização | Não |
| Permite compras digitais | Não |
| Contém conteúdo gerado por usuários | Não |

Resultado esperado: **Livre (L)** no Brasil, *Everyone* no ClassInd/IARC.

---

## 5. Público-alvo e conteúdo

| Campo | Resposta |
|---|---|
| Faixa etária-alvo | 18 anos ou mais (evita as exigências extras da política de Famílias) |
| O app é direcionado a crianças? | **Não** |
| Anúncios | **Não contém anúncios** |
| Compras no app | **Não** |
| App de finanças? | **Não** — o Listou organiza compras pessoais; não é serviço financeiro, não movimenta dinheiro nem se conecta a instituições. Por isso a categoria é *Compras*, não *Finanças*, e a declaração de apps financeiros não se aplica. |

---

## 6. Política de privacidade

**Obrigatória** e precisa estar num link público e acessível.

O arquivo `privacidade.html` na raiz do projeto foi reescrito para bater com o
que o app faz. A versão anterior citava uso de câmera para QR Code — recurso que
não existe mais — e trazia um e-mail de exemplo; se enviada assim, contradiz a
declaração de segurança de dados e é motivo de rejeição.

URL a informar, depois de publicar o arquivo:

```
https://listou-phi.vercel.app/privacidade.html
```

> Confirme no navegador que o endereço abre antes de enviar para revisão.

---

## 7. Detalhes de contato

| Campo | Valor |
|---|---|
| E-mail (obrigatório) | `listou.app@gmail.com` |
| Site | `https://listou-phi.vercel.app` |
| Telefone | opcional |

---

## 8. Versão e arquivo

| Campo | Valor |
|---|---|
| Nome da versão | `1.0.0` |
| Código da versão | `1` (primeira publicação) |
| Formato de envio | **AAB** (`android/app/build/outputs/bundle/release/app-release.aab`) |
| ID do pacote | `br.com.listou.app` |
| SDK mínimo / alvo | 24 (Android 7.0) / 36 |

### Detalhes da versão (tela de envio do AAB)

**Nome da versão** — identificação interna, o usuário não vê:

```
1.0.0 (1)
```

**Notas da versão** — mantenha as tags de idioma. 418/500 caracteres:

```
<pt-BR>
Primeira versão do Listou.

Monte a lista com quantidade e preço e veja o total previsto somar em tempo real. No mercado, marque os itens e acompanhe quanto já foi para o carrinho.

Também: comparação de preços entre supermercados, relatórios de gastos por categoria e por mês, listas prontas para churrasco, limpeza e outras ocasiões, histórico de compras e tema claro e escuro.

Funciona sem internet e sem cadastro.
</pt-BR>
```

---

## 9. Sobre o app anterior

Existe um app publicado com o ID `app.vercel.listou_phi.twa` (empacotado como
TWA em 2025). Esta é uma **listagem nova**, com outro ID — os dois convivem sem
conflito. A chave de upload daquele app se perdeu, o que inviabilizava atualizá-lo.

Quando esta versão estiver no ar, vale despublicar a antiga em
*Configuração › Disponibilidade avançada › Remover da Play* e avisar os
testadores para instalarem a nova. As listas deles não migram: o app antigo
guardava os dados no Chrome, e este guarda no próprio aplicativo.

## 10. Antes de enviar

- [ ] Assinar o AAB: `npm run android:assinar` — sem isso a Play recusa
- [ ] Guardar a keystore e a senha em dois lugares seguros
- [ ] Publicar `privacidade.html` e conferir que a URL abre
- [ ] Criar o app no Console com o ID `br.com.listou.app`
- [ ] Preencher ficha, segurança dos dados, classificação e público-alvo
- [ ] Enviar o AAB em *Teste interno* primeiro e instalar pela Play para validar
- [ ] Promover para produção
