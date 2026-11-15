# ICON — Relatório de correções visuais e de interface
**Data:** 15/11/2026  
**Projeto:** Instituto de Cognição e Neuropsicologia (projeto acadêmico fictício)  
**Repositório:** https://github.com/joaopedroalves-alt/ICON  
**Escopo:** página inicial, portal demonstrativo de login/cadastro e quatro dashboards.

## 1. Solicitações recebidas
1. Melhorar o modo escuro porque alguns fundos, campos e textos ainda estavam com cores do modo claro, prejudicando a leitura.
2. Alterar a comunicação do menu central de acesso conforme a pessoa esteja **fazendo login** ou **simulando um cadastro**.
3. Entregar um registro objetivo das alterações.

## 2. Correções realizadas e publicadas

### 2.1. Login e cadastro — `index.html`
- O título na área de apresentação agora alterna entre **“Bem-vindo de volta.”** (login) e **“Comece sua jornada.”** (cadastro).
- O subtítulo/descrição ao lado muda de acordo com o formulário selecionado.
- O rótulo superior também muda de **ACESSO** para **CADASTRO**.
- Foi corrigido o texto “NOVA SOLICITAÇÃO” para **“CADASTRO DEMONSTRATIVO”**.
- O texto alternativo do botão de fechar agora identifica a tela atual: login ou cadastro, facilitando a navegação assistiva.
- A troca é realizada pelo JavaScript da função `setPortalMode()`, mantendo o modal deslizante e os redirecionamentos originais.

**Commit:** https://github.com/joaopedroalves-alt/ICON/commit/bd53b8cb8fbd5b1f3c218f7c19a3e152d37cd1bb

### 2.2. Modo escuro dos painéis — `icon-integracao.css`
Foi criada uma camada complementar de estilos aplicada apenas quando a classe `if-dark` está no `body`. O CSS é compartilhado pelas quatro páginas principais:

- `dashboard_administrador.html`
- `dashboard_medico.html`
- `dashboard-secretario.html`
- `dashboard-cliente.html`

**Áreas cobertas pela revisão:**
- Fundo principal, barra superior, cartões, indicadores e painéis.
- Cabeçalhos, linhas e células de tabelas.
- Campos de formulários, selects, pesquisas, filtros e placeholders.
- Pop-ups de notificações, janelas de detalhe e modais.
- Botões secundários, abas ativas e indicação de foco do teclado.
- Etiquetas de estado: confirmado, pendente, atenção e cancelado.
- Janela de fluxo integrado: agendamentos, histórico e tutorial.

As cores da barra lateral e dos banners de destaque foram preservadas para manter a identidade visual do ICON.

**Commit:** https://github.com/joaopedroalves-alt/ICON/commit/883194194a6fc80299fa8a6950d31efd20d3cc60

## 3. Conferências feitas no código
| Verificação | Resultado |
| --- | --- |
| Título, descrição e rótulo dinâmicos no modal | Aprovada — inspeção estática |
| JavaScript da alternância de formulários preservado | Aprovada — inspeção estática |
| Quatro dashboards importam o CSS e JS de integração | Aprovada — inspeção estática |
| Classe `if-dark` utilizada no tema escuro | Aprovada — inspeção estática |
| Delimitadores de bloco do CSS equilibrados | Aprovada — verificação básica |
| Pares de cores propostos atendem WCAG AA para texto comum | Aprovada — cálculo de contraste |

### Exemplos de contraste das novas cores
| Aplicação | Fundo | Texto | Contraste |
| --- | --- | --- | --- |
| Cartões | `#193B4A` | `#EAF4F6` | 10,63:1 |
| Conteúdo | `#102D3B` | `#E7F2F5` | 12,61:1 |
| Campos | `#112E3C` | `#EDF7F9` | 13,02:1 |
| Texto auxiliar | `#193B4A` | `#B7CCD4` | 7,14:1 |
| Confirmação | `#1B5047` | `#CBF4E6` | 7,71:1 |
| Alerta | `#614823` | `#FFE2AD` | 6,80:1 |

**Observação:** são proporções calculadas para cores declaradas. Não comprovam automaticamente o contraste de cada componente em todos os estados da interface.

## 4. Testes visuais recomendados antes da apresentação
1. Abrir a página principal; clicar em **Acessar portal** e alternar duas vezes entre login e cadastro.
2. Verificar a mudança do título, descrição, rótulo e formulário; testar o botão de fechar.
3. Entrar com cada perfil fictício e a senha de teste já existente, se for necessário demonstrar navegação.
4. Em cada dashboard, ligar **Tema escuro** e percorrer **visão geral, tabelas, formulários, agenda, notificações e janelas**.
5. Abrir **Fluxo**, **Histórico** e **Tutorial** no modo escuro; conferir campos, botões e mensagens.
6. Testar no computador e em um celular, usando também o teclado para observar o foco.
7. Alternar para tema claro e garantir que as cores originais continuem legíveis.
8. Fazer um recarregamento forçado se o GitHub Pages ainda exibir CSS antigo: **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (macOS).

## 5. Limites desta revisão
- Os arquivos foram revisados e atualizados pelo conector do GitHub, e suas referências e estrutura foram checadas.
- **Não foi executado um teste visual completo em navegador com o site publicado nesta sessão.** Ajustes pontuais adicionais poderão ser necessários ao inspecionar telas específicas.
- O portal segue como **demonstração acadêmica**: não existe login seguro, servidor de aplicação, banco de dados ou armazenamento adequado para dados de saúde.
- Não foram alterados nomes dos perfis, credenciais demonstrativas, agendamentos ou regras de negócio.
- O arquivo legado `dashboard_cliente.html` não é o painel do paciente acessado pelo login atual; a revisão priorizou `dashboard-cliente.html`.

## 6. Resumo para entrega
**Foram corrigidos o texto contextual do portal de login/cadastro e os principais conflitos de contraste do modo escuro, mantendo a identidade do ICON e o funcionamento demonstrativo existente.** Os ajustes foram publicados na branch `main` do repositório. O próximo passo é percorrer as telas para confirmar visualmente o resultado.
