/* ICON — integração acadêmica: somente dados fictícios neste navegador. */
(function(){
'use strict';
const KEY='icon.fluxo.v1',THEME='icon.tema.v1',TUTORIAL='icon.tutorial.';
const $=s=>document.querySelector(s),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const role=/dashboard-cliente/.test(location.pathname)?'paciente':/dashboard-secretario/.test(location.pathname)?'secretario':/dashboard[_-]medico/.test(location.pathname)?'medico':/dashboard[_-](administrador|admin)/.test(location.pathname)?'admin':null;
const today=()=>{let d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const nextDay=()=>{let d=new Date();do{d.setDate(d.getDate()+1)}while([0,6].includes(d.getDay()));return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const format=x=>new Date(x+'T12:00:00').toLocaleDateString('pt-BR'),mins=x=>Number(x.slice(0,2))*60+Number(x.slice(3,5));
const duration={'Avaliação Neuropsicológica':60,'Avaliação Cognitiva':45,'Psicoterapia':50};
const rooms=['Consultório 01','Consultório 02','Sala Cognitiva','Sala Multidisciplinar'];
const normalize=s=>String(s||'').replace(/^Dra?\.?\s*/i,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function load(){try{let o=JSON.parse(localStorage.getItem(KEY));if(o&&o.version===1&&Array.isArray(o.requests)&&Array.isArray(o.log))return o;}catch(e){}return {version:1,requests:[],log:[]};}
function log(db,who,what){db.log.unshift({at:new Date().toISOString(),who,what});db.log=db.log.slice(0,60);}
function write(db){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){alert('Armazenamento local indisponível.');return false;}window.dispatchEvent(new Event('icon-fluxo-update'));updateView();return true;}
function sync(which,db){
 if(!db||!Array.isArray(db.appointments))return false;
 let changed=false;
 for(const r of load().requests){
  if(which==='paciente'&&Array.isArray(db.requests)){
   const old=db.requests.find(x=>x.id===r.id),status=r.status==='Recebida'?'Recebida':r.status==='Confirmada'?'Concluída':r.status==='Cancelamento solicitado'?'Em análise':'Respondida';
   if(!old){db.requests.unshift({id:r.id,type:'Pedido de agendamento',date:r.date,status,description:'Pedido fictício: '+r.service+', '+format(r.date)+' às '+r.time,appointmentId:r.id});changed=true;}
   else if(old.status!==status){old.status=status;changed=true;}
  }
  if(!['Confirmada','Cancelada'].includes(r.status))continue;
  let item=null;
  const status=r.status==='Confirmada'?'Confirmado':'Cancelado';
  if(which==='paciente')item={id:r.id,date:r.date,time:r.time,professional:'PRO-01',service:r.service,modality:r.mode,status,location:r.mode==='Online'?'Online · demonstração':r.room+' · ICON'};
  if(which==='secretario'){
   const p=db.patients?.find(x=>normalize(x.name)===normalize(r.patient)),pro=db.professionals?.find(x=>normalize(x.name)===normalize(r.professional));
   const serviceId={'Avaliação Neuropsicológica':'SRV-01','Psicoterapia':'SRV-02','Avaliação Cognitiva':'SRV-03'}[r.service];
   const room=db.rooms?.find(x=>x.name===r.room);
   if(p&&pro)item={id:r.id,date:r.date,time:r.time,proId:pro.id,patientId:p.id,serviceId,roomId:room?.id||null,mode:r.mode,status,note:'Fluxo demonstrativo integrado',created:r.date};
  }
  if(which==='medico'&&normalize(db.profile?.name)===normalize(r.professional)){
   const p=db.patients?.find(x=>normalize(x.name)===normalize(r.patient));
   if(p)item={id:r.id,patientId:p.id,date:r.date,time:r.time,duration:duration[r.service]||60,type:r.service,status,notes:'Fluxo demonstrativo integrado'};
  }
  if(which==='admin'){
   const p=db.patients?.find(x=>normalize(x.name)===normalize(r.patient)),pro=db.professionals?.find(x=>normalize(x.name)===normalize(r.professional)),svc=db.services?.find(x=>x.name===r.service);
   const digit=r.room.match(/\d+/)?.[0],room=db.rooms?.find(x=>x.name.endsWith((digit||'').padStart(2,'0')));
   if(p&&pro&&svc)item={id:r.id,date:r.date,time:r.time,patientId:p.id,professionalId:pro.id,serviceId:svc.id,roomId:room?.id||null,modality:r.mode,status};
  }
  if(!item)continue;
  const old=db.appointments.find(x=>x.id===r.id);
  if(!old){db.appointments.push(item);changed=true;}
  else if(old.status!==status){old.status=status;changed=true;}
 }
 return changed;
}
window.ICONFluxo={sync,load};
if(!role)return;
let dialog,view='fluxo',toastTimer;
const pill=x=>'<span class="if-pill '+(x==='Confirmada'?'ok':x==='Cancelada'||x==='Recusada'?'off':'wait')+'">'+safe(x)+'</span>';
function notify(s){const el=$('#if-toast');el.textContent=s;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4500);}
function updateView(){
 const db=load(),pending=db.requests.filter(x=>x.status==='Recebida').length,confirmed=db.requests.filter(x=>x.status==='Confirmada').length;
 if($('#if-summary'))$('#if-summary').textContent=pending+' pedido(s) aguardando · '+confirmed+' confirmado(s)';
 if($('#if-count'))$('#if-count').textContent=pending;
 if(dialog?.open&&view==='fluxo')draw();
}
function theme(){
 let dark=false;try{dark=localStorage.getItem(THEME)==='escuro';}catch(e){}
 document.body.classList.toggle('if-dark',dark);
 if($('#if-theme'))$('#if-theme').textContent=dark?'☀ Tema claro':'☾ Tema escuro';
}
function open(tab){view=tab;draw();if(!dialog.open)dialog.showModal();}
function draw(){
 const db=load(),total=db.requests.length,pending=db.requests.filter(x=>x.status==='Recebida').length,confirmed=db.requests.filter(x=>x.status==='Confirmada').length;
 let content='';
 if(view==='tutorial'){
 content='<div class="if-guide"><p><b>1</b> Entre no painel do <strong>Paciente</strong> e crie um pedido fictício.</p><p><b>2</b> Abra o painel da <strong>Secretaria</strong>, escolha a sala e confirme.</p><p><b>3</b> Confira a agenda no painel do <strong>Profissional</strong>.</p><p><b>4</b> No painel do <strong>Administrador</strong>, veja os indicadores e a movimentação.</p></div><p class="if-disclaimer">Todas as alterações ficam neste navegador. Não há servidor, contas reais nem segurança de informações clínicas.</p>';
 }else if(view==='historico'){
 content='<p class="if-explain">Linha do tempo de atividades administrativas fictícias.</p><ol class="if-history">'+(db.log.length?db.log.map(x=>'<li><small>'+safe(new Date(x.at).toLocaleString('pt-BR'))+'</small><strong>'+safe(x.who)+'</strong><p>'+safe(x.what)+'</p></li>').join(''):'<li>Nenhuma ação registrada ainda.</li>')+'</ol>';
 }else{
 const heading='<p class="if-explain">'+(role==='paciente'?'Peça um atendimento fictício e acompanhe a resposta da secretaria.':role==='secretario'?'Analise os pedidos recebidos e confirme os horários, verificando a sala.':role==='medico'?'Acompanhe os atendimentos confirmados para Dra. Mariana Silva.':'Confira a movimentação e o total de agendamentos integrados.')+'</p><div class="if-metrics"><div><strong>'+total+'</strong><small>Solicitações</small></div><div><strong>'+pending+'</strong><small>Pendentes</small></div><div><strong>'+confirmed+'</strong><small>Confirmadas</small></div></div>';
 const form=role==='paciente'?'<form id="if-request" class="if-form"><h3>Novo pedido demonstrativo</h3><div class="if-grid"><label>Serviço<select name="service"><option>Avaliação Neuropsicológica</option><option>Avaliação Cognitiva</option><option>Psicoterapia</option></select></label><label>Data<input name="date" type="date" min="'+today()+'" value="'+nextDay()+'" required></label><label>Horário<input name="time" type="time" min="08:00" max="17:30" value="09:30" step="900" required></label><label>Modalidade<select name="mode"><option>Presencial</option><option>Online</option></select></label></div><p class="if-disclaimer">Paciente Lucas Mendes · Profissional Dra. Mariana Silva (fictícios).</p><button type="submit" class="if-primary">Solicitar atendimento de exemplo</button></form>':'';
 const records=db.requests.filter(x=>role!=='medico'||normalize(x.professional)==='mariana silva').slice().reverse();
 const rows=records.length?records.map(r=>{
  let controls='';
  if(role==='secretario'&&r.status==='Recebida')controls='<form class="if-confirm" data-confirm="'+safe(r.id)+'"><label>Sala<select name="room">'+rooms.map(room=>'<option>'+safe(room)+'</option>').join('')+'</select></label><button type="submit">Confirmar</button><button type="button" data-reject="'+safe(r.id)+'">Recusar</button></form>';
  if(role==='paciente'&&r.status==='Confirmada')controls='<button type="button" class="if-link" data-cancel="'+safe(r.id)+'">Solicitar cancelamento</button>';
  if(role==='secretario'&&r.status==='Cancelamento solicitado')controls='<div class="if-confirm"><button type="button" data-accept="'+safe(r.id)+'">Aprovar cancelamento</button><button type="button" data-refuse="'+safe(r.id)+'">Manter</button></div>';
  return '<article class="if-item"><div><strong>'+safe(r.patient)+'</strong> · '+safe(r.service)+'<p>'+format(r.date)+' às '+safe(r.time)+' · '+safe(r.mode)+(r.room?' · '+safe(r.room):'')+'</p><small>'+safe(r.id)+' · '+safe(r.professional)+'</small></div>'+pill(r.status)+controls+'</article>';
 }).join(''):'<p class="if-empty">Ainda não há pedidos compartilhados. Inicie pelo painel do Paciente.</p>';
 content=heading+form+'<h3 class="if-list-heading">Agendamentos do fluxo integrado</h3>'+rows;
 }
 $('#if-content').innerHTML='<header class="if-head"><div><span>ICON · DEMONSTRAÇÃO ACADÊMICA</span><h2 id="if-title">'+(view==='fluxo'?'Fluxo integrado':view==='tutorial'?'Tutorial':'Histórico de ações')+'</h2></div><button type="button" id="if-close" aria-label="Fechar">×</button></header><div class="if-tabs"><button data-tab="fluxo" '+(view==='fluxo'?'aria-current="page"':'')+'>Agendamentos</button><button data-tab="historico" '+(view==='historico'?'aria-current="page"':'')+'>Histórico</button><button data-tab="tutorial" '+(view==='tutorial'?'aria-current="page"':'')+'>Tutorial</button></div><div class="if-body">'+content+'</div><footer class="if-foot">Dados exclusivamente fictícios · armazenamento local · sem autenticação real</footer>';
}
function conflict(req,room,db){
 const a={...req,duration:duration[req.service]||60};
 if(db.requests.some(x=>x.id!==req.id&&x.status==='Confirmada'&&x.date===a.date&&mins(a.time)<mins(x.time)+(duration[x.service]||60)&&mins(x.time)<mins(a.time)+a.duration&&(x.professional===a.professional||(a.mode==='Presencial'&&x.room===room))))return 'Há conflito com outro agendamento integrado.';
 try{
  const s=JSON.parse(localStorage.getItem('icon.secretaria.demo.v1'));const p=s?.professionals?.find(x=>normalize(x.name)===normalize(req.professional));const r=s?.rooms?.find(x=>x.name===room);
  for(const b of s?.appointments||[]){
   if(b.id===req.id||b.status==='Cancelado'||b.date!==a.date)continue;
   const dur=({'SRV-01':60,'SRV-02':50,'SRV-03':45,'SRV-04':50,'SRV-05':60,'SRV-06':30})[b.serviceId]||60;
   if(mins(a.time)<mins(b.time)+dur&&mins(b.time)<mins(a.time)+a.duration&&((p&&b.proId===p.id)||(a.mode==='Presencial'&&r&&b.roomId===r.id)))return 'Conflito com a agenda da secretaria: profissional ou sala ocupados.';
  }
 }catch(e){}
 return '';
}
function init(){
 const root=$('#main-content')||$('#page-content');
 const bar=document.createElement('div');bar.className='if-bar';bar.innerHTML='<div><b>FLUXO INTEGRADO · EXEMPLO ACADÊMICO</b><span id="if-summary"></span></div><button id="if-open" type="button">Acompanhar →</button>';
 root?.parentNode?.insertBefore(bar,root);
 const dock=document.createElement('div');dock.className='if-dock';dock.innerHTML='<button id="if-flow" type="button">↗ Fluxo <span id="if-count">0</span></button><button id="if-theme" type="button">☾ Tema escuro</button><button id="if-help" type="button">? Tutorial</button>';
 document.body.append(dock);
 dialog=document.createElement('dialog');dialog.id='if-dialog';dialog.setAttribute('aria-labelledby','if-title');dialog.innerHTML='<div id="if-content"></div>';document.body.append(dialog);
 const toast=document.createElement('div');toast.id='if-toast';toast.setAttribute('role','status');toast.hidden=true;document.body.append(toast);
 $('#if-open')?.addEventListener('click',()=>open('fluxo'));$('#if-flow').addEventListener('click',()=>open('fluxo'));$('#if-help').addEventListener('click',()=>{try{localStorage.setItem(TUTORIAL+role,'1')}catch(e){}open('tutorial')});
 $('#if-theme').addEventListener('click',()=>{try{localStorage.setItem(THEME,document.body.classList.contains('if-dark')?'claro':'escuro')}catch(e){}theme()});
 dialog.addEventListener('click',e=>{
  if(e.target===dialog||e.target.closest('#if-close')){dialog.close();return;}
  const b=e.target.closest('[data-tab]');if(b){view=b.dataset.tab;draw();return;}
  const action=e.target.closest('[data-reject],[data-cancel],[data-accept],[data-refuse]');if(!action)return;
  const id=action.dataset.reject||action.dataset.cancel||action.dataset.accept||action.dataset.refuse;
  const db=load(),r=db.requests.find(x=>x.id===id);if(!r)return;
  if(action.dataset.reject&&r.status==='Recebida'){r.status='Recusada';log(db,'Secretaria','Solicitação '+r.id+' recusada.');}
  if(action.dataset.cancel&&r.status==='Confirmada'){r.status='Cancelamento solicitado';log(db,'Paciente','Solicitou cancelamento de '+r.id+'.');}
  if(action.dataset.accept&&r.status==='Cancelamento solicitado'){r.status='Cancelada';log(db,'Secretaria','Cancelou o agendamento '+r.id+'.');}
  if(action.dataset.refuse&&r.status==='Cancelamento solicitado'){r.status='Confirmada';log(db,'Secretaria','Manteve o horário '+r.id+'.');}
  if(write(db))notify('Registro de demonstração atualizado.');
 });
 dialog.addEventListener('submit',e=>{
  if(e.target.id==='if-request'){
   e.preventDefault();let f=new FormData(e.target),service=String(f.get('service')),date=String(f.get('date')),time=String(f.get('time')),day=new Date(date+'T12:00:00').getDay();
   if(date<today()||[0,6].includes(day)||!(/^\d\d:\d\d$/.test(time))||mins(time)<480||mins(time)+(duration[service]||60)>1080||mins(time)%15!==0){notify('Informe um dia útil e horário entre 08h e 18h, em intervalos de 15 minutos.');return;}
   const db=load(),id='FLX-'+Date.now().toString(36).toUpperCase();
   db.requests.push({id,patient:'Lucas Mendes',professional:'Dra. Mariana Silva',date,time,service,mode:String(f.get('mode')),room:'',status:'Recebida',createdAt:new Date().toISOString()});
   log(db,'Paciente','Solicitou '+service+' em '+format(date)+' às '+time+'.');
   if(write(db))notify('Pedido fictício recebido. Abra a Secretaria neste navegador.');
  }
  if(e.target.matches('[data-confirm]')){
   e.preventDefault();const db=load(),r=db.requests.find(x=>x.id===e.target.dataset.confirm);if(!r||r.status!=='Recebida')return;
   const room=String(new FormData(e.target).get('room')),err=conflict(r,room,db);if(err){notify(err);return;}
   r.status='Confirmada';r.room=r.mode==='Presencial'?room:'';
   log(db,'Secretaria','Confirmou '+r.id+' para '+format(r.date)+' às '+r.time+'.');
   if(write(db))notify('Confirmado. Os demais dashboards já podem receber o agendamento.');
  }
 });
 window.addEventListener('storage',e=>{if(e.key===KEY){window.dispatchEvent(new Event('icon-fluxo-update'));updateView();}if(e.key===THEME)theme();});
 theme();updateView();
 try{if(!localStorage.getItem(TUTORIAL+role))setTimeout(()=>{if(!dialog.open){localStorage.setItem(TUTORIAL+role,'1');open('tutorial')}},700)}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();