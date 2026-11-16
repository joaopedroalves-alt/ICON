# ICON — Instituto de Cognição e Neuropsicologia

**Projeto acadêmico fictício do primeiro ano**, desenvolvido com **HTML e CSS**. A única exceção de JavaScript é o arquivo `cerebro-hero.js`, que desenha o cérebro 3D na página inicial.

> O ICON não é uma clínica real. Não digite nomes, documentos, senhas, dados de saúde nem contatos reais.

## Abrir o projeto

- Site: https://joaopedroalves-alt.github.io/ICON/
- Repositório: https://github.com/joaopedroalves-alt/ICON
- Página inicial: `index.html`
- CSS único: `icon.css`
- Único JavaScript mantido: `cerebro-hero.js` (cérebro 3D)

## Como funciona a versão sem JavaScript de interface

A interface preserva navegação e caixas expansíveis sem scripts:

1. O menu móvel da página inicial usa a tag HTML `<details>` com `<summary>`.
2. O botão **Acessar portal** é um link para `#portal-auth-dialog`. O CSS mostra o portal usando `:target`.
3. A escolha entre **Ver painéis** e **Realizar cadastro** usa botões de opção (`radio`) e seletores CSS `:checked` / `:has()`.
4. O **cadastro demonstrativo de três etapas** (dados pessoais, contato/responsável e convênio) troca as telas por radio buttons e labels. O responsável aparece por uma checkbox e CSS.
5. Os **quatro painéis** são páginas HTML estáticas, com menus de âncoras (`#view-...`) e CSS `:target`.
6. A equipe da página inicial está escrita diretamente no HTML; os filtros são radio buttons controlados por CSS.
7. As caixas de informações, serviços e dúvidas frequentes usam `<details>`.

Tudo está no `icon.css`. Nenhum framework de interface é necessário.

## Painéis

| Página | Perfil |
| --- | --- |
| `dashboard_administrador.html` | Administração |
| `dashboard_medico.html` | Profissional |
| `dashboard-secretario.html` | Secretaria |
| `dashboard-cliente.html` | Paciente |
| `dashboard_cliente.html` | Redirecionamento em HTML para o painel atual do paciente |

**Acesso:** página inicial → **Acessar portal** → escolha um dos quatro links de perfil. Não há senha, validação de login, permissões nem autenticação: o acesso é somente ilustrativo.

## Limitações explicadas ao professor

**Esta é uma demonstração de interface HTML/CSS, não um sistema funcional de clínica.**

- O formulário de três etapas é visual; as etapas podem ser navegadas sem validação automática e não realizam cadastro real.
- O formulário de contato exibe apenas uma mensagem explicativa.
- Os dashboards mostram dados **fixos e fictícios**, não atualizam cadastros ou relatórios.
- Não é possível criar agendamentos, trocar status, salvar dados, sincronizar painéis ou enviar notificações.
- Não existe servidor, banco de dados ou armazenamento no navegador para essas funções.
- Os links abrem arquivos HTML estáticos. O cérebro continua animado por `cerebro-hero.js`.

Essas restrições são consequência intencional de retirar JavaScript além do cérebro. **Nunca prometa armazenamento ou autenticação real na apresentação.**

## CSS único

O arquivo `icon.css` contém os estilos de todas as páginas, separados por marcadores. As seções finais **[08]** e **[09]** tratam, respectivamente, das interações HTML/CSS na página inicial e dos dashboards estáticos. As regras de versões anteriores foram mantidas em parte para preservar o visual e permitir ajustes posteriores.

## Histórico e segurança

Uma cópia de segurança da versão com JavaScript foi preservada na branch:

`backup/antes-versao-sem-js-2026-11-16`

Ela contém os scripts e dashboards dinâmicos antigos. Os arquivos JavaScript desnecessários foram excluídos do ramo principal, mas continuam recuperáveis pelo histórico do GitHub e pelo backup.

**ICON — Projeto acadêmico fictício, sem validade clínica ou profissional.**
