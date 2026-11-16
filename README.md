# ICON — Instituto de Cognição e Neuropsicologia

Site institucional e painéis de gestão fictícios, desenvolvidos para apresentação de HTML e CSS.

**Site:** https://joaopedroalves-alt.github.io/ICON/

## Arquivos principais

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Página institucional, portal e cadastro ilustrativo em três etapas |
| `icon.css` | Todos os estilos do projeto, em um único arquivo |
| `cerebro-hero.js` | Animação 3D do cérebro na apresentação |
| `acesso-portal.js` | Único JavaScript de interface: valida credenciais demonstrativas e direciona ao painel |
| `dashboard_administrador.html` | Administração, usuários, equipe, pacientes, serviços, agendamentos, salas e relatórios |
| `dashboard_medico.html` | Agenda do profissional, pacientes, avaliações, prontuários fictícios e documentos |
| `dashboard-secretario.html` | Central de atendimento, agenda, salas, solicitações, pacientes e profissionais |
| `dashboard-cliente.html` | Área do paciente, atendimentos, documentos, profissionais e solicitações |

## Acesso aos perfis

Na página inicial, clique em **Acessar portal**. Digite um dos seguintes usuários, todos com a senha **1234**:

- `admin` → Administração
- `medico` → Profissional
- `secretario` → Secretaria
- `paciente` → Paciente

O login é **somente uma demonstração visual** feita com JavaScript básico. As senhas estão no próprio código e os endereços dos painéis são públicos. **Não existe autenticação real, banco de dados, criptografia nem proteção de acesso.**

## Conteúdo dos perfis

Todos os dashboards mostram conteúdos **fixos, fictícios e escritos diretamente no HTML**, incluindo:

- Cabeçalhos de boas-vindas e indicadores;
- Agendas semanais, listas e horários;
- Exemplos de pacientes, profissionais e salas;
- Relatórios e gráficos feitos somente com HTML e CSS;
- Documentos, solicitações e quadros organizacionais;
- Caixas expansíveis usando `<details>` e `<summary>`.

A navegação das seções de cada painel é feita por links `#view-...` e CSS `:target`. Não há JavaScript carregado dentro dos dashboards. Cartões e tabelas já estão no HTML e permanecem visíveis sem scripts.

O portal institucional e o cadastro de três etapas também usam CSS, `:target`, radio buttons e caixas expansíveis. O JavaScript do acesso **não participa dos efeitos visuais do cadastro nem dos dashboards**.

## Limitações

O ICON é um **projeto acadêmico fictício**, não um sistema de saúde em operação. A navegação e a apresentação funcionam, mas os formulários demonstrativos não criam contas, os agendamentos não são persistidos, e as informações não são compartilhadas entre perfis.

**Não utilize dados pessoais, documentos, informações de saúde ou senhas reais.**

## Segurança do trabalho no GitHub

A branch `backup/antes-restaurar-dashboards-visuais-2026-11-16` preserva a versão estática anterior a esta atualização.

A branch `backup/antes-versao-sem-js-2026-11-16` preserva a versão antiga dos dashboards dinâmicos caso seja necessária para referências futuras.

---

ICON — Instituto de Cognição e Neuropsicologia.
