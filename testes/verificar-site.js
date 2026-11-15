/* Verificacoes simples do ICON — apenas Node.js, sem bibliotecas extras.
   Rode: node testes/verificar-site.js
   Estes testes NAO substituem a inspeção visual em um navegador. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const raiz = path.resolve(__dirname, '..');
const paginas = [
  'index.html',
  'dashboard_administrador.html',
  'dashboard_medico.html',
  'dashboard-secretario.html',
  'dashboard-cliente.html',
  'dashboard_cliente.html'
];
const arquivosJS = [
  'cerebro-hero.js',
  'icon-integracao.js',
  'scripts/icon-home.js',
  'scripts/icon-admin.js',
  'scripts/icon-medico.js',
  'scripts/icon-secretario.js',
  'scripts/icon-paciente.js'
];
const ler = arquivo => fs.readFileSync(path.join(raiz, arquivo), 'utf8');
let verificacoes = 0;

for (const pagina of paginas) {
  const html = ler(pagina);
  assert.match(html, /<!doctype html>/i, pagina + ': falta DOCTYPE');
  assert.match(html, /<html\b/i, pagina + ': falta estrutura HTML');
  assert.match(html, /<main\b/i, pagina + ': falta conteudo principal');
  verificacoes += 3;

  // A pagina antiga é apenas um redirecionamento compatível.
  if (pagina === 'dashboard_cliente.html') {
    assert.match(html, /dashboard-cliente\.html/);
    verificacoes++;
    continue;
  }

  const css = Array.from(html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g),
    m => m[1]).filter(x => !/^https?:/i.test(x));
  assert.equal(css.length, 1, pagina + ': deve carregar somente um CSS local');
  assert.equal(css[0].split('?')[0], 'icon.css', pagina + ': CSS único esperado');
  verificacoes += 2;

  const inline = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .filter(m => m[1].trim());
  assert.equal(inline.length, 0, pagina + ': JavaScript deve estar fora do HTML');
  verificacoes++;

  const ids = Array.from(html.matchAll(/\bid=["']([^"']+)["']/g), m => m[1]);
  assert.equal(new Set(ids).size, ids.length, pagina + ': há IDs repetidos');
  verificacoes++;

  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const ref = match[1];
    if (/^(#|https?:|data:|mailto:|tel:|javascript:)/i.test(ref)) continue;
    const local = ref.split(/[?#]/)[0];
    if (!local) continue;
    assert.ok(fs.existsSync(path.join(raiz, local)), pagina + ': recurso ausente: ' + local);
    verificacoes++;
  }
}

// O cadastro do portal tem as tres etapas originais em um unico fluxo acessivel.
const indexCadastro = ler('index.html');
const jsCadastro = ler('scripts/icon-home.js');
const cssCadastro = ler('icon.css');
const indicadores = Array.from(indexCadastro.matchAll(/data-step-indicator="([0-2])"/g), m => m[1]);
const etapas = Array.from(indexCadastro.matchAll(/data-register-step="([0-2])"/g), m => m[1]);
assert.deepEqual(indicadores, ['0','1','2'], 'cadastro: indicadores de tres etapas');
assert.deepEqual(etapas, ['0','1','2'], 'cadastro: tres fieldsets distintos');
verificacoes += 2;
for(const id of [
 'portal-register-form','portal-register-name','portal-register-email',
 'portal-register-guardian','portal-guardian-fields','portal-register-plan',
 'portal-register-password','portal-register-prev','portal-register-next',
 'portal-register-finish','portal-register-complete','portal-register-to-login'
]){
 assert.ok(indexCadastro.includes('id="' + id + '"'), 'cadastro: faltou ' + id);
 verificacoes++;
}
for(const pattern of [
 /function showRegistrationStep\(/,
 /function validateRegistrationStep\(/,
 /function updateGuardianFields\(/,
 /function updatePlanFields\(/,
 /registrationForm\.addEventListener\('submit'/,
 /registrationSteps\s*=\s*\$\$\('\[data-register-step\]'/,
 /registrationMarkers\s*=\s*\$\$\('\[data-step-indicator\]'/
]){
 assert.match(jsCadastro, pattern, 'cadastro: logica ausente');
 verificacoes++;
}
assert.match(cssCadastro, /body\.icon-page-home \.portal-register-step\[hidden\]/);
verificacoes++;
assert.ok(!/localStorage|sessionStorage/.test(jsCadastro.slice(jsCadastro.indexOf('    // Cadastro de três etapas'),jsCadastro.indexOf('    function setPortalMode('))), 'cadastro: nao persistir dados na logica das etapas');
verificacoes++;

for (const arquivo of arquivosJS) {
  const codigo = ler(arquivo);
  new vm.Script(codigo, {filename: arquivo});
  verificacoes++;
}

// Testa a sincronizacao do fluxo de exemplo sem abrir navegador.
const fluxo = {
  version: 1,
  requests: [{
    id: 'FLX-TESTE', patient: 'Lucas Mendes', professional: 'Dra. Mariana Silva',
    date: '2026-11-17', time: '09:30',
    service: 'Avaliação Neuropsicológica', mode: 'Presencial',
    room: 'Sala Cognitiva', status: 'Confirmada'
  }],
  log: []
};
const contexto = {
  location: {pathname: '/teste.html'},
  window: {},
  localStorage: {getItem: chave => chave === 'icon.fluxo.v1' ? JSON.stringify(fluxo) : null},
  Date, Intl
};
vm.runInNewContext(ler('icon-integracao.js'), contexto);
const sync = contexto.window.ICONFluxo.sync;
const base = {
  appointments: [],
  patients: [{id:'PAC-01',name:'Lucas Mendes'}],
  professionals: [{id:'PRO-01',name:'Mariana Silva'}],
  services: [{id:'SER-01',name:'Avaliação Neuropsicológica'}],
  rooms: [{id:'SAL-03',name:'Sala 03'},{id:'SAL-04',name:'Sala 04'}]
};
assert.equal(sync('admin', base), true);
assert.equal(sync('admin', base), false, 'nao deve duplicar registros');
assert.equal(base.appointments.length, 1);
assert.equal(base.appointments[0].roomId, 'SAL-03');
verificacoes += 4;

fluxo.requests[0].room = 'Sala Multidisciplinar';
fluxo.requests[0].time = '11:00';
assert.equal(sync('admin', base), true);
assert.equal(base.appointments[0].roomId, 'SAL-04');
assert.equal(base.appointments[0].time, '11:00');
verificacoes += 3;

fluxo.requests[0].status = 'Cancelada';
assert.equal(sync('admin', base), true);
assert.equal(base.appointments[0].status, 'Cancelado');
verificacoes += 2;

// Verifica também os outros três perfis e a consistência do cancelamento.
fluxo.requests[0].status = 'Confirmada';
fluxo.requests[0].time = '09:30';
fluxo.requests[0].room = 'Consultório 01';
const dadosPerfis = {
  paciente: {appointments: [], requests: []},
  secretario: {
    appointments: [],
    patients: [{id:'PAC-01',name:'Lucas Mendes'}],
    professionals: [{id:'PRO-01',name:'Mariana Silva'}],
    rooms: [{id:'SAL-01',name:'Consultório 01'}]
  },
  medico: {
    appointments: [],
    patients: [{id:'P-001',name:'Lucas Mendes'}],
    profile: {name:'Dra. Mariana Silva'}
  }
};
for (const [perfil, dados] of Object.entries(dadosPerfis)) {
  assert.equal(sync(perfil, dados), true, perfil + ': deve importar o agendamento');
  assert.equal(sync(perfil, dados), false, perfil + ': não pode duplicar');
  assert.equal(dados.appointments.length, 1);
  assert.equal(dados.appointments[0].status, 'Confirmado');
  verificacoes += 4;
}
assert.equal(dadosPerfis.secretario.appointments[0].roomId, 'SAL-01');
assert.equal(dadosPerfis.paciente.requests[0].status, 'Concluída');
verificacoes += 2;
fluxo.requests[0].status = 'Cancelada';
for (const [perfil, dados] of Object.entries(dadosPerfis)) {
  assert.equal(sync(perfil, dados), true);
  assert.equal(dados.appointments[0].status, 'Cancelado');
  verificacoes += 2;
}

console.log('ICON: ' + verificacoes + ' verificações passaram. CSS único preservado.');
