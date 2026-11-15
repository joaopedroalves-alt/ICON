# ICON — Relatório de correção do modo escuro nos quatro perfis

**Data:** 15 de novembro de 2026  
**Projeto:** ICON — Instituto de Cognição e Neuropsicologia (protótipo acadêmico)  
**Repositório:** https://github.com/joaopedroalves-alt/ICON

## Problema encontrado

Após ativar o tema escuro, alguns números e textos apareciam muito escuros sobre fundos também escuros. A origem principal era o uso de cores fixas nos CSS individuais dos dashboards. Exemplos encontrados na revisão: `#18485B` no administrador, `#173E50` no médico, `#244E5D` no secretário e `#1A4450` no paciente.

## Correções implementadas

| Painel | Itens revisados |
|---|---|
| **Administrador** | Valores dos cartões de métricas; rótulos e números dos gráficos SVG; contador de pendências; relatório em donut; calendário; textos pequenos e valores auxiliares |
| **Médico** | Números e legendas dos indicadores; dias da agenda; progresso, horários e listas; nomes e descrições em cartões |
| **Secretário** | Números das métricas; contadores de solicitações; resumos de agendamentos; valores de gráficos de volume; dados de salas, horários e status |
| **Paciente** | Números do resumo; dias e meses das consultas; detalhes de atendimentos e documentos; textos dos profissionais e mensagens auxiliares |

Também foram ajustados ícones destacados, rótulos secundários, botões informativos e estados de confirmação/pendência.

**Arquivo corrigido:** `icon-integracao.css`, utilizado pelos quatro dashboards principais.

**Commit:** https://github.com/joaopedroalves-alt/ICON/commit/6e2c0f6e76484c33e747d8ef67ba56a3d9f6bdb8

## Cuidados adotados

- Os novos estilos são aplicados apenas quando o `body` possui `if-dark`. O tema claro não foi alterado.
- Foram mantidas as cores Tech Medical do projeto: azul oceano, verde-água e ciano.
- O sistema continua um protótipo acadêmico. Não houve mudança na lógica dos agendamentos, nos usuários ou nos dados fictícios.
- O login continua apenas demonstrativo, sem autenticação de produção.

## Verificações

Os quatro HTMLs principais foram conferidos e todos carregam `icon-integracao.css` e `icon-integracao.js`. O arquivo CSS atualizado mantém o balanceamento das chaves de regras. As classes principais dos indicadores foram comparadas com os respectivos estilos originais.

Cálculos para pares de cores representativos:

| Área | Contraste |
|---|---:|
| Números grandes | 11,41:1 |
| Textos auxiliares | 8,39:1 |
| Contadores | 9,63:1 |
| Rótulos de gráfico | 9,75:1 |
| Ícones destacados | 5,66:1 |
| Status de confirmação | 7,91:1 |
| Status pendente | 6,95:1 |

Todos esses pares superam o mínimo **4,5:1** adotado nas referências WCAG AA para texto comum. Esses cálculos não garantem, por si só, que todos os elementos e estados da interface estejam corretos.

## O que validar visualmente

Abra o site https://joaopedroalves-alt.github.io/ICON/ e entre, separadamente, nos quatro perfis demonstrativos. Em cada perfil, ative **Tema escuro** e navegue por **Visão geral, Agenda, Tabelas, Notificações, Fluxo, Histórico e Tutorial**, observando os valores, ícones, etiquetas e textos pequenos. Repita no tema claro e em uma tela estreita. Em caso de arquivos antigos no navegador, use recarregamento sem cache (`Ctrl+Shift+R` no Windows/Linux ou `Cmd+Shift+R` no Mac).

**Limitação da conferência:** a inspeção realizada foi no código e nas cores, não foi uma validação visual completa em navegador. Se algum componente específico continuar com contraste insuficiente, ele deve ser ajustado após observação da tela.
