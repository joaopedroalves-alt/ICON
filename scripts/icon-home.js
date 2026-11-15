(() => {
    'use strict';
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const menuButton = $('.menu-toggle');
    const mobileMenu = $('#mobile-menu');
    const header = $('#cabecalho');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function closeMenu() { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu'); document.body.classList.remove('menu-is-open'); }
    menuButton.addEventListener('click', () => { const opening = mobileMenu.hidden; mobileMenu.hidden = !opening; menuButton.setAttribute('aria-expanded', String(opening)); menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu'); document.body.classList.toggle('menu-is-open', opening); });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (innerWidth > 980 && !mobileMenu.hidden) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu(); });
    document.addEventListener('pointerdown', e => { if (!mobileMenu.hidden && !header.contains(e.target)) closeMenu(); });
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
    header.classList.toggle('scrolled', scrollY > 12);
    $('#year').textContent = String(new Date().getFullYear());

    // Revelação progressiva: sem animações para quem prefere movimento reduzido.
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }); }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
      $$('.reveal').forEach(el => io.observe(el));
    } else $$('.reveal').forEach(el => el.classList.add('revealed'));

    // Navegação: o navegador cuida da rolagem/âncoras; CSS aplica o offset do header.
    const navLinks = $$('.nav-desktop a');
    const sections = $$('main section[id]');
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(a => a.classList.toggle('current', a.hash === '#' + entry.target.id));
        });
      }, { rootMargin: '-20% 0px -65% 0px' });
      sections.forEach(s => sectionObserver.observe(s));
    }

    // Sincroniza um único rótulo com o estado nativo de cada cartão.
    // Evita exibir simultaneamente "Ver detalhes" e "Fechar detalhes".
    document.querySelectorAll('.specialty-card').forEach(card => {
      const label = $('.specialty-action-label', card);
      if (!label) return;
      const updateLabel = () => { label.textContent = card.open ? 'Fechar detalhes' : 'Ver detalhes'; };
      card.addEventListener('toggle', updateLabel);
      updateLabel();
    });

    // Equipe fictícia e filtros com atualização sem recarregar a página.
    const professionals = [
      ['Mariana Silva','Neuropsicologia','Neuropsicóloga','CRP 00/001XX'],
      ['João Oliveira','Neurologia','Neurologista','CRM 00/002XX'],
      ['Ana Souza','Psicologia','Psicóloga clínica','CRP 00/003XX'],
      ['Rafael Costa','Psiquiatria','Psiquiatra','CRM 00/004XX'],
      ['Camila Mendes','Neuropsicologia','Neuropsicóloga','CRP 00/005XX'],
      ['Lucas Ferreira','Psicologia','Psicólogo clínico','CRP 00/006XX'],
      ['Beatriz Almeida','Psicologia','Psicóloga clínica','CRP 00/007XX'],
      ['Isabela Rocha','Neuropsicologia','Neuropsicóloga','CRP 00/008XX'],
      ['Gabriel Martins','Neurologia','Neurologista','CRM 00/009XX'],
      ['Laura Ribeiro','Psiquiatria','Psiquiatra','CRM 00/010XX'],
      ['Pedro Henrique','Psicologia','Psicólogo clínico','CRP 00/011XX'],
      ['Sofia Carvalho','Neuropsicologia','Neuropsicóloga','CRP 00/012XX']
    ];
    const teamGrid = $('#team-grid');
    function renderTeam(filter = 'Todos') {
      const result = professionals.filter(p => filter === 'Todos' || p[1] === filter);
      teamGrid.replaceChildren();
      result.forEach((p, i) => {
        const article = document.createElement('article'); article.className = 'person';
        const initials = p[0].split(' ').map(s => s[0]).slice(0, 2).join('');
        const art = document.createElement('div'); art.className = 'person-art'; art.setAttribute('aria-hidden', 'true');
        const symbol = document.createElement('span'); symbol.textContent = initials; art.appendChild(symbol);
        const body = document.createElement('div'); body.className = 'person-info';
        const type = document.createElement('span'); type.className = 'person-type'; type.textContent = p[1];
        const title = document.createElement('h3'); title.textContent = p[0];
        const role = document.createElement('p'); role.textContent = p[2];
        const license = document.createElement('small'); license.textContent = p[3] + ' · fictício';
        body.append(type, title, role, license); article.append(art, body); teamGrid.append(article);
      });
      $('#team-count').textContent = `${result.length} ${result.length === 1 ? 'profissional' : 'profissionais'}`;
      $$('.filter-btn').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    }
    $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => renderTeam(btn.dataset.filter)));
    renderTeam();

    // FAQ: permite expandir respostas, mas mantém somente uma aberta por vez.
    $$('.faq-list details').forEach(item => item.addEventListener('toggle', () => { if (item.open) $$('.faq-list details').forEach(other => { if (other !== item) other.open = false; }); }));

    // Modal compartilhado para serviços e portal; HTML é criado sem conteúdo externo.
    const serviceInfo = [
      ['Avaliação Neuropsicológica','Investiga aspectos de memória, atenção, linguagem, raciocínio e funcionamento executivo. O processo pode envolver entrevistas, testes e devolutiva para apoiar decisões clínicas.'],
      ['Psicoterapia','Acompanhamento psicológico que proporciona um espaço protegido de escuta, reflexão e desenvolvimento de recursos para lidar com experiências e desafios.'],
      ['Avaliação Cognitiva','Explora habilidades cognitivas específicas para identificar pontos fortes, demandas de acompanhamento e possibilidades de intervenção.'],
      ['Reabilitação Cognitiva','Conjunto de estratégias individualizadas para fortalecer ou compensar habilidades cognitivas e favorecer a autonomia em atividades do cotidiano.'],
      ['Avaliação do Neurodesenvolvimento','Examina características do desenvolvimento, considerando aprendizagem, comportamento, linguagem e contexto familiar/escolar.'],
      ['Laudos e Relatórios','Documentos técnicos que sintetizam resultados de avaliações, observações e recomendações, respeitando os critérios éticos e profissionais aplicáveis.']
    ];
    const dialog = $('#site-dialog'), dialogTitle = $('#dialog-title'), dialogContent = $('#dialog-content');
    let lastFocus = null;
    function openDialog(title, message) {
      lastFocus = document.activeElement;
      dialogTitle.textContent = title;
      dialogContent.replaceChildren();
      const p = document.createElement('p'); p.textContent = message; dialogContent.appendChild(p);
      dialog.showModal();
      $('.dialog-close').focus();
    }
    $$('[data-service]').forEach(btn => btn.addEventListener('click', () => { const info = serviceInfo[Number(btn.dataset.service)]; if (info) openDialog(...info); }));
    // Janela central de login/cadastro: transição deslizante e retorno de foco.
    const portalDialog = $('#portal-auth-dialog');
    const portalContainer = $('#portal-auth');
    const loginPanel = $('#portal-login-panel');
    const registerPanel = $('#portal-register-panel');
    const portalSwitch = $('#portal-switch-mode');
    const switchDescription = $('#portal-switch-description');
    let focusBeforePortal = null;
    let portalMode = 'login';
    function setPortalMode(mode, focus = true) {
      portalMode = mode === 'register' ? 'register' : 'login';
      const register = portalMode === 'register';
      // Mantém o texto do painel de apresentação coerente com o formulário ativo.
      $('#portal-intro-heading').innerHTML = register
        ? 'Comece sua <em>jornada.</em>'
        : 'Bem-vindo <em>de volta.</em>';
      $('#portal-intro-kicker').textContent = register
        ? 'PORTAL INSTITUCIONAL / CADASTRO'
        : 'PORTAL INSTITUCIONAL / ACESSO';
      $('#portal-intro-description').textContent = register
        ? 'Preencha o formulário para conhecer a experiência de cadastro demonstrativo. Nenhuma conta real será criada.'
        : 'Entre com um perfil de demonstração para conhecer os recursos do ICON.';
      $('#portal-auth-close').setAttribute('aria-label', register ? 'Fechar cadastro do portal' : 'Fechar login do portal');
      portalContainer.classList.toggle('is-register', register);
      loginPanel.hidden = register;
      registerPanel.hidden = !register;
      portalSwitch.innerHTML = register ? 'Fazer login <span aria-hidden="true">↗</span>' : 'Realizar cadastro <span aria-hidden="true">↗</span>';
      switchDescription.textContent = register ? 'Já possui uma conta?' : 'Ainda não possui acesso?';
      portalDialog.setAttribute('aria-labelledby', register ? 'portal-register-heading' : 'portal-auth-heading');
      $('#portal-login-feedback').textContent = '';
      $('#portal-register-feedback').textContent = '';
      if (focus) (register ? $('#portal-register-name') : $('#portal-username')).focus();
    }
    function openPortal() {
      closeMenu();
      focusBeforePortal = document.activeElement;
      setPortalMode('login', false);
      portalDialog.showModal();
      $('#portal-username').focus();
    }
    $$('[data-modal="portal"]').forEach(btn => btn.addEventListener('click', openPortal));
    portalSwitch.addEventListener('click', () => setPortalMode(portalMode === 'login' ? 'register' : 'login'));
    $$('[data-portal-mode]').forEach(btn => btn.addEventListener('click', () => setPortalMode(btn.dataset.portalMode)));
    $('#portal-auth-close').addEventListener('click', () => portalDialog.close());
    portalDialog.addEventListener('click', e => { if (e.target === portalDialog) portalDialog.close(); });
    portalDialog.addEventListener('close', () => { if (focusBeforePortal && focusBeforePortal.isConnected) focusBeforePortal.focus(); });
    $$('[data-toggle-password]').forEach(btn => btn.addEventListener('click', () => {
      const field = document.getElementById(btn.dataset.togglePassword);
      const visible = field.type === 'password';
      field.type = visible ? 'text' : 'password';
      btn.textContent = visible ? 'Ocultar' : 'Mostrar';
      btn.setAttribute('aria-pressed', String(visible));
    }));
    // APENAS DEMONSTRAÇÃO: credenciais públicas no navegador, sem sessão nem controle de acesso.
    // Não insira dados reais nos dashboards: qualquer visitante pode abrir estas páginas.
    const demoRoutes = Object.freeze({
      admin: 'dashboard_administrador.html',
      medico: 'dashboard_medico.html',
      paciente: 'dashboard-cliente.html',
      secretario: 'dashboard-secretario.html'
    });
    $('#portal-login-form').addEventListener('submit', e => {
      e.preventDefault();
      const user = $('#portal-username').value.trim().toLowerCase();
      const password = $('#portal-password').value.trim();
      const feedback = $('#portal-login-feedback');
      if (!user || !password) { feedback.textContent = 'Informe o usuário e a senha de demonstração.'; return; }
      if (Object.prototype.hasOwnProperty.call(demoRoutes, user) && password === '1234') {
        feedback.textContent = 'Acesso demonstrativo reconhecido. Abrindo o painel…';
        window.location.assign(new URL(demoRoutes[user], document.baseURI).href);
      } else {
        feedback.textContent = 'Usuário ou senha de teste incorretos. Utilize um dos quatro perfis e a senha 1234.';
        $('#portal-password').value = '';
        $('#portal-password').focus();
      }
    });
    $('#portal-register-form').addEventListener('submit', e => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const feedback = $('#portal-register-feedback');
      feedback.textContent = 'Cadastro demonstrativo concluído. Nenhuma conta foi criada ou armazenada. Utilize os usuários de teste para entrar.';
      form.reset();
    });
    function closeDialog() { if (dialog.open) dialog.close(); }
    $('.dialog-close').addEventListener('click', closeDialog);
    $('.dialog-ok').addEventListener('click', closeDialog);
    dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('close', () => { if (lastFocus && lastFocus.isConnected) lastFocus.focus(); });

    // Demonstração acadêmica: impede envio real e jamais armazena dados.
    const contactForm = $('#contact-form');
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const feedback = $('#form-feedback');
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); feedback.textContent = 'Preencha os campos para visualizar a mensagem de demonstração.'; return; }
      feedback.textContent = 'Demonstração concluída. Nenhuma mensagem foi enviada ou armazenada; este formulário é apenas ilustrativo.';
      contactForm.reset();
    });
  })();
