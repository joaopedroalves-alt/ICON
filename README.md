# ICON — Instituto de Cognição e Neuropsicologia

**Projeto acadêmico demonstrativo** para exercitar HTML, CSS e JavaScript no primeiro ano do ensino médio integrado ao curso técnico.

> **Atenção:** o ICON é fictício. Não representa um serviço de saúde em funcionamento. Nunca insira dados clínicos ou informações pessoais reais.

## O que o sistema inclui

- Página institucional com serviços, especialidades e profissionais fictícios.
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

A sincronização utiliza um array de solicitações e um array de ações demonstrativas, guardados sob a chave localStorage **icon.fluxo.v1**. A implementação está em **icon-integracao.js**. O visual está em **icon-integracao.css**.

## Organização dos arquivos

| Arquivo | Função |
| --- | --- |
| index.html e index.css | Página inicial |
| cerebro-hero.js | Ilustração interativa do cérebro |
| dashboard_administrador.html e dashboard-admin.css | Administrador |
| dashboard_medico.html e dashboard-medico.css | Profissional |
| dashboard-secretario.html e dashboard-secretario.css | Secretaria |
| dashboard-cliente.html e dashboard-cliente.css | Paciente |
| icon-integracao.js | Fluxo compartilhado, histórico, tutorial e alternância de tema |
| icon-integracao.css | Estilos dos recursos compartilhados |

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