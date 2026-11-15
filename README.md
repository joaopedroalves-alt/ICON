# ICON — Instituto de Cognição e Neuropsicologia

**Projeto acadêmico demonstrativo** para exercitar HTML, CSS e JavaScript no primeiro ano do ensino médio integrado ao curso técnico.

> **Atenção:** o ICON é fictício. Não representa um serviço de saúde em funcionamento. Nunca insira dados clínicos ou informações pessoais reais.

## O que o sistema inclui

- Página institucional com serviços, especialidades e profissionais fictícios. As **oito especialidades** usam cartões expansíveis: clique ou pressione Enter/Espaço para revelar uma explicação e um link interno. Os cartões não saltam mais no hover e são responsivos.
- Portal de acesso e cadastro ilustrativos, com transição deslizante.
- Dashboard do Administrador, do Profissional, do Secretário e do Paciente.
- **Fluxo integrado demonstrativo:** paciente solicita um horário; secretaria confirma; profissional e administração visualizam.
- **Histórico:** mostra quando um pedido fictício foi criado, confirmado ou cancelado.
- **Modo claro e escuro:** alternância com classes CSS e JavaScript.
- **Tutorial:** instruções que aparecem na primeira visita de cada painel, com botão para reabrir.

## Tecnologias

| Linguagem / recurso | Aplicação |
| --- | --- |
| HTML | Páginas, formulários, menus e tabelas |
| CSS | Identidade visual, layouts, responsividade e temas |
| JavaScript puro | Eventos, condições, funções, listas e alterações de tela |
| localStorage | Guarda apenas dados fictícios no mesmo navegador |
| GitHub Pages | Publica os arquivos estáticos |

JavaScript não é a mesma coisa que Java. Este projeto usa **JavaScript** no navegador.

## Contas ilustrativas

No botão **Acessar portal** do INDEX, utilize a senha pública de teste **1234** com um destes usuários:

| Usuário | Página |
| --- | --- |
| admin | dashboard_administrador.html |
| medico | dashboard_medico.html |
| secretario | dashboard-secretario.html |
| paciente | dashboard-cliente.html |

**Isso não é autenticação real.** Como as páginas são públicas, qualquer pessoa pode abrir o HTML diretamente. As credenciais existem somente para demonstrar redirecionamentos.

## Demonstração: um agendamento atravessando os quatro dashboards

1. Acesse como **paciente** e clique em **Fluxo**. Preencha um pedido de atendimento fictício para Lucas Mendes.
2. No **mesmo navegador**, acesse como **secretario**, abra **Fluxo**, verifique o horário, escolha uma sala e confirme.
3. Acesse como **medico**. O atendimento confirmado para a profissional fictícia Dra. Mariana Silva aparece na agenda e na central de fluxo.
4. Acesse como **admin**. O registro administrativo entra na agenda e nos indicadores de atendimentos.
5. Consulte o botão **Histórico** da janela de fluxo para mostrar o passo a passo.
6. Clique em **Tema escuro** e **Tutorial** para demonstrar classes CSS, eventos e manipulação de elementos.

A sincronização utiliza um array de solicitações e um array de ações demonstrativas, guardados sob a chave localStorage **icon.fluxo.v1**. A implementação está em **icon-integracao.js**. O visual de todas as páginas está no arquivo unificado **icon.css** (seção [06] de integração).

## Organização dos arquivos

| Arquivo | Função |
| --- | --- |
| index.html | Página institucional e portal de login/cadastro |
| cerebro-hero.js | Ilustração interativa do cérebro |
| dashboard_administrador.html | Painel do administrador |
| dashboard_medico.html | Painel do profissional |
| dashboard-secretario.html | Painel da secretaria |
| dashboard-cliente.html | Painel do paciente (versão principal) |
| dashboard_cliente.html | Redireciona endereços antigos para o painel principal do paciente |
| icon-integracao.js | Fluxo compartilhado, histórico, tutorial e alternância de tema |
| scripts/icon-home.js | Interações e formulários da página institucional |
| scripts/icon-admin.js | Funções exclusivas do painel administrativo |
| scripts/icon-medico.js | Funções exclusivas do painel do profissional |
| scripts/icon-secretario.js | Funções exclusivas do painel da secretaria |
| scripts/icon-paciente.js | Funções exclusivas do painel do paciente |
| testes/verificar-site.js | Verificação de recursos, sintaxe JavaScript e fluxo integrado |
| **icon.css** | **Única folha CSS local, usada por todas as páginas e dividida por seções comentadas** |


## Organização e manutenção

O projeto mantém **um único arquivo CSS local**, `icon.css`, exatamente como definido para a apresentação.
É comum que sistemas publicados agrupem estilos em um ou poucos arquivos; isso não significa que o código-fonte deva obrigatoriamente ficar misturado.

Para facilitar o aprendizado e reduzir o risco de quebrar outras telas, o **JavaScript de cada dashboard agora está separado de seu HTML**. Assim, cada página contém a estrutura HTML, `icon.css` cuida do visual e o arquivo de `scripts/` cuida das interações. O arquivo `icon-integracao.js` continua sendo o ponto compartilhado para os agendamentos de exemplo.

A antiga URL `dashboard_cliente.html` redireciona para `dashboard-cliente.html`, evitando manter duas versões diferentes do painel do paciente.

## Como verificar antes de publicar

Com Node.js instalado, na pasta do projeto execute:

```bash
node testes/verificar-site.js
```

A verificação não exige baixar bibliotecas: confere se os links de arquivos existem, se as páginas usam somente `icon.css`, se os arquivos JavaScript têm sintaxe válida e se um pedido fictício é sincronizado sem duplicar agendamentos. Ela também confere a atualização de sala, horário e cancelamento entre os dados compartilhados.

**Importante:** esses testes não substituem abrir o site no computador e no celular. Antes de apresentar, confirme manualmente o menu **Acessar portal**, os quatro perfis, os cards de especialidades/serviços, o modo escuro e o fluxo paciente → secretaria → profissional → administrador.

## Imagem institucional da seção “O Instituto”

A fotografia da seção “O Instituto”, abaixo do hero, é de **Vitaly Gariev**, disponibilizada no [Unsplash](https://unsplash.com/photos/two-women-talking-in-a-therapy-session-rG5elqddGzo) sob a **Licença Unsplash**. O `index.html` exibe a imagem pelo serviço do Unsplash e utiliza `imagens/imagematendimento.png` como reserva se a imagem externa falhar. A foto é ilustrativa e **não representa profissionais ou pacientes reais do ICON**.

## CSS unificado — onde editar cada parte

Agora todas as páginas HTML carregam **somente** `icon.css`. Para não misturar estilos com nomes iguais em páginas diferentes, cada área possui uma classe no `<body>`:

| Marcação no `icon.css` | Conteúdo | Classe da página |
| --- | --- | --- |
| `[01]` | Site institucional e modal de login/cadastro | `icon-page-home` |
| `[02]` | Administrador | `icon-page-admin` |
| `[03]` | Médico | `icon-page-medico` |
| `[04]` | Secretário | `icon-page-secretario` |
| `[05]` | Paciente | `icon-page-paciente` |
| `[06]` | Modo escuro, fluxo, histórico e tutorial nos quatro dashboards | `icon-dashboard` |
| `[07]` | Regras da versão institucional antiga (sem página em uso) | `icon-page-legacy` |

**Como buscar:** abra `icon.css` e pesquise `[03]` para achar o começo do CSS do médico. Para corrigir algo compartilhado (inclusive `body.if-dark`), procure `[06]`. Evite remover os prefixos `body.icon-page-*` e `body.icon-dashboard`: eles impedem que as regras de um painel afetem outro. Os arquivos CSS separados foram consolidados; suas versões anteriores continuam recuperáveis pelo histórico de commits do GitHub. O arquivo com erro de grafia `dashbord-cliente.css` era uma duplicata do CSS do paciente e não precisa ser mantido.

## Conceitos que podem ser explicados na apresentação

- **Variáveis:** guardam nomes, datas e escolhas.
- **Arrays e objetos:** armazenam agendamentos e eventos fictícios.
- **Funções:** organizam ações do sistema.
- **If / condições:** conferem dados e conflitos de horário e sala.
- **Eventos:** cliques e envio de formulários.
- **Manipulação do DOM:** mostra informações novas sem recarregar a página.
- **localStorage:** armazena dados apenas no navegador atual.

## Limitações importantes

- Os dados são armazenados **somente no mesmo navegador e no mesmo endereço do site**. Não existe sincronização entre computadores.
- O módulo de fluxo complementa os dashboards atuais. Alterações manuais em todos os formulários antigos ainda não são retransmitidas automaticamente.
- Não existe banco de dados, API, autenticação real, servidor ou envio de solicitações à clínica.
- O armazenamento local **não é seguro para dados de saúde**. Não insira dados reais.
- A administração e a secretaria recebem apenas informações operacionais inventadas, nunca prontuários ou diagnósticos.

## Cores Tech Medical

- Marfim: #F5F1E7
- Azul pastel: #B9D9E8
- Ciano: #78BBD2
- Azul oceano: #17465B
- Verde-água: #83C8B7
- Grafite: #303B43

---

**ICON — Projeto acadêmico fictício. Sem validade clínica ou profissional.**