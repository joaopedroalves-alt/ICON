/* ICON — único JavaScript de interface: acesso demonstrativo aos quatro painéis.
   Sem banco de dados, contas reais, sessões ou armazenamento de senhas. */
document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('icon-login-form');
  if (!formulario) return;

  const destinos = {
    admin: 'dashboard_administrador.html',
    medico: 'dashboard_medico.html',
    paciente: 'dashboard-cliente.html',
    secretario: 'dashboard-secretario.html'
  };

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    const usuario = document.getElementById('icon-login-user').value.trim().toLowerCase();
    const senha = document.getElementById('icon-login-pass').value;
    const aviso = document.getElementById('icon-login-message');

    if (Object.prototype.hasOwnProperty.call(destinos, usuario) && senha === '1234') {
      aviso.textContent = 'Acesso demonstrativo validado. Abrindo o painel…';
      window.location.href = destinos[usuario];
    } else {
      aviso.textContent = 'Usuário ou senha incorretos. Utilize um dos perfis de teste e a senha 1234.';
      document.getElementById('icon-login-pass').value = '';
      document.getElementById('icon-login-pass').focus();
    }
  });
});
