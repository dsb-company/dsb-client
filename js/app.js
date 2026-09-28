(() => {
'use strict';

const $ = (q, base=document) => base.querySelector(q);
const $$ = (q, base=document) => [...base.querySelectorAll(q)];
const E = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const CATEGORIES = ['Site','Hospedagem','Domínio','E-mail','Alteração','Bug','Outro'];
const PRIORITIES = ['Baixa','Normal','Alta'];
const OPEN_STATUSES = ['Novo','Aberto','Em atendimento','Aguardando cliente'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png','image/jpeg','image/webp','application/pdf','text/plain']);

const ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 10.7 12 3.8l8.5 6.9v9.1a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7z"/><path d="M9 21.5v-7h6v7"/></svg>',
  ticket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5h16v4a2.5 2.5 0 0 0 0 5v4H4v-4a2.5 2.5 0 0 0 0-5z"/><path d="M9 8.5h6M9 12h6M9 15.5h4"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.5h6"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 19 6v5.3c0 4.4-2.7 7.8-7 9.7-4.3-1.9-7-5.3-7-9.7V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.8 12s3.4-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.4"/></svg>',
  'eye-off':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 3 18 18"/><path d="M10.6 6.7A10.5 10.5 0 0 1 12 6.6c5.8 0 9.2 5.4 9.2 5.4a16 16 0 0 1-2.8 3.4M6.1 6.1C4 7.6 2.8 10 2.8 12c0 0 3.4 5.4 9.2 5.4 1.2 0 2.3-.2 3.2-.6"/></svg>',
  'arrow-right':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M14 7l5 5-5 5"/></svg>',
  'plus-circle':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9zM18.5 15l.6 2.1 1.9.9-1.9 1-.6 2-.6-2-1.9-1 1.9-.9z"/></svg>',
  'chevron-right':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 5 7 7-7 7"/></svg>',
  'chevron-down':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 21 20H3z"/><path d="M12 9v4M12 16.5h.01"/></svg>',
  activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>',
  'arrow-left':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M10 7l-5 5 5 5"/></svg>',
  paperclip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m8.5 12.5 6-6a3 3 0 0 1 4.2 4.2l-8 8a5 5 0 0 1-7.1-7.1l8.3-8.3"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 18-8-8 18-2.2-7.8z"/><path d="M11 13 21 3"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.1.1l2-2A5 5 0 0 0 12 4l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></svg>'
};

const state = {
  client:null, user:null, profile:null, tickets:[], messages:[], attachments:[],
  loading:false, loaded:false, recovery:false, filter:'Todos', search:'', selectedId:null,
  poll:null
};

function injectIcons(base=document){
  $$('[data-icon]',base).forEach(el=>{ const name=el.dataset.icon; if(ICONS[name]) el.innerHTML=ICONS[name]; });
  $$('[data-icon-button]',base).forEach(el=>{ const name=el.dataset.iconButton; if(ICONS[name]) el.innerHTML=ICONS[name]; });
}
function initials(value){
  const parts=String(value||'C').trim().split(/\s+/).filter(Boolean);
  return (parts.length>1 ? parts[0][0]+parts[1][0] : parts[0]?.slice(0,2) || 'C').toUpperCase();
}
function validConfig(c){ return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c?.supabaseUrl||'') && (/^sb_publishable_[\w-]+$/.test(c?.supabaseKey||'') || String(c?.supabaseKey||'').split('.').length===3); }
function friendly(error){
  const msg=String(error?.message||error||'Erro inesperado.');
  if(/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if(/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar.';
  if(/rate limit|too many requests/i.test(msg)) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if(/user without|empresa autorizada|sem empresa/i.test(msg)) return 'Este acesso ainda não está vinculado a uma empresa.';
  if(/failed to fetch|network/i.test(msg)) return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  if(/portal_profile|function .* does not exist|PGRST202/i.test(msg)) return 'O Portal DSB ainda precisa ser ativado no banco. Execute supabase/portal-setup.sql.';
  return msg.length>180 ? 'Não foi possível concluir a operação.' : msg;
}
function toast(message,type='success'){
  const box=$('#toasts'); const el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=message; box.appendChild(el); setTimeout(()=>el.remove(),4300);
}
function setBusy(button,busy,label){
  if(!button)return; if(busy){button.dataset.original=button.innerHTML;button.disabled=true;button.textContent=label||'Aguarde...';}
  else {button.disabled=false;if(button.dataset.original){button.innerHTML=button.dataset.original;delete button.dataset.original;injectIcons(button);}}
}
function dateTime(value){
  if(!value)return '—'; try{return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value)).replace('.','');}catch{return '—';}
}
function statusLabel(status){ return status==='Aguardando cliente' ? 'Aguardando você' : status; }
function statusClass(status){
  if(status==='Novo')return 'status-novo'; if(status==='Aberto')return 'status-aberto'; if(status==='Em atendimento')return 'status-atendimento'; if(status==='Aguardando cliente')return 'status-cliente'; if(status==='Resolvido')return 'status-resolvido'; return 'status-fechado';
}
function priorityClass(priority){return `priority-${String(priority||'normal').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`;}
function ticketCode(n){return `DSB-${String(n||0).padStart(5,'0')}`;}
function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function safeFileName(name){return String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120)||'arquivo';}
function validateFiles(files){for(const file of files){if(file.size>MAX_FILE_SIZE)throw Error(`${file.name}: limite de 10 MB.`);if(!ALLOWED_MIME.has(file.type))throw Error(`${file.name}: formato não permitido.`);}}

function createClient(remember=true){
  const c=window.DSB_CLIENT_CONFIG||{};
  const storage=remember?localStorage:sessionStorage;
  state.client=window.supabase.createClient(c.supabaseUrl,c.supabaseKey,{auth:{persistSession:true,storage,storageKey:'dsb.client.auth',autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  bindAuthListener(state.client);
  return state.client;
}
function bindAuthListener(client){
  client.auth.onAuthStateChange(async(event,session)=>{
    if(event==='PASSWORD_RECOVERY'){
      state.recovery=true; state.user=session?.user||null; showRecovery(); return;
    }
    if(event==='SIGNED_OUT'){
      stopPolling(); state.user=null;state.profile=null;state.tickets=[]; showLogin();
    }
  });
}

function showLogin(){
  $('#login-view').hidden=false;$('#app-view').hidden=true;$('#unauthorized-view').hidden=true;$('#login-card').hidden=false;$('#recovery-card').hidden=true;document.body.classList.remove('menu-open');
}
function showRecovery(){
  $('#login-view').hidden=false;$('#app-view').hidden=true;$('#unauthorized-view').hidden=true;$('#login-card').hidden=true;$('#recovery-card').hidden=false;
}
function showUnauthorized(){
  $('#login-view').hidden=true;$('#app-view').hidden=true;$('#unauthorized-view').hidden=false;
}
function showApp(){
  $('#login-view').hidden=true;$('#unauthorized-view').hidden=true;$('#app-view').hidden=false;
  hydrateProfileUI(); startPolling(); handleRoute();
}
function hydrateProfileUI(){
  const p=state.profile||{}; const person=p.name||state.user?.email||'Cliente'; const company=p.company_name||'Cliente DSB';
  $('#sidebar-company').textContent=company;$('#top-company').textContent=company;$('#sidebar-user-name').textContent=person;$('#top-user-name').textContent=person;$('#sidebar-user-email').textContent=p.email||state.user?.email||'—';
  const ci=initials(company),pi=initials(person);$('#company-avatar').textContent=ci;$('#user-avatar').textContent=pi;$('#top-avatar').textContent=pi;
}

async function loadProfile(){
  const {data,error}=await state.client.rpc('dsb_customer_portal_profile');
  if(error)throw error; state.profile=Array.isArray(data)?data[0]:data;
  return state.profile;
}
async function loadTickets({silent=false}={}){
  if(!state.client||!state.user)return;
  if(!silent){state.loading=true;updateSync('Atualizando...');}
  const {data,error}=await state.client.from('dsb_tickets').select('*').order('last_activity_at',{ascending:false});
  if(error)throw error; state.tickets=data||[];state.loaded=true;state.loading=false; updateBadge();updateSync('Atualizado agora');
}
async function loadTicketDetails(ticketId){
  const [messagesRes,attachmentsRes]=await Promise.all([
    state.client.from('dsb_ticket_messages').select('*').eq('ticket_id',ticketId).order('created_at',{ascending:true}),
    state.client.from('dsb_ticket_attachments').select('*').eq('ticket_id',ticketId).order('created_at',{ascending:true})
  ]);
  if(messagesRes.error)throw messagesRes.error;if(attachmentsRes.error)throw attachmentsRes.error;
  state.messages=messagesRes.data||[];state.attachments=attachmentsRes.data||[];
}
function updateSync(text){const el=$('#sync-label');if(el)el.textContent=text;}
function updateBadge(){
  const count=state.tickets.filter(t=>OPEN_STATUSES.includes(t.status)).length;const badge=$('#ticket-badge');if(!badge)return;badge.textContent=count;badge.hidden=count===0;
}
function startPolling(){
  stopPolling();state.poll=setInterval(async()=>{try{await loadTickets({silent:true});const route=currentRoute().name;if(['dashboard','tickets'].includes(route))renderCurrent();}catch{}},60000);
}
function stopPolling(){if(state.poll){clearInterval(state.poll);state.poll=null;}}

function currentRoute(){
  const raw=(location.hash||'#dashboard').slice(1); const [name,id]=raw.split('/');
  if(name==='ticket'&&id)return {name:'ticket',id};
  if(['dashboard','tickets','new-ticket','account'].includes(name))return {name};
  return {name:'dashboard'};
}
function setPage(kicker,title){$('#page-kicker').textContent=kicker;$('#page-title').textContent=title;}
function markNav(route){$$('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===route));}
function closeMenu(){document.body.classList.remove('menu-open');$('#sidebar').classList.remove('open');}
function openMenu(){document.body.classList.add('menu-open');$('#sidebar').classList.add('open');}
async function handleRoute(){
  if(!state.user||!state.profile)return;closeMenu();const route=currentRoute();state.selectedId=route.name==='ticket'?route.id:null;markNav(route.name==='ticket'?'tickets':route.name);
  await renderCurrent();
}
async function renderCurrent(){
  const route=currentRoute();const content=$('#content');
  try{
    if(route.name==='dashboard'){setPage('PORTAL DSB','Visão geral');content.innerHTML=dashboardPage();}
    else if(route.name==='tickets'){setPage('SUPORTE','Meus chamados');content.innerHTML=ticketsPage();}
    else if(route.name==='new-ticket'){setPage('SUPORTE','Novo chamado');content.innerHTML=newTicketPage();}
    else if(route.name==='account'){setPage('CONTA','Minha conta');content.innerHTML=accountPage();}
    else if(route.name==='ticket'){
      const ticket=state.tickets.find(t=>t.id===route.id);setPage('SUPORTE',ticket?ticketCode(ticket.ticket_number):'Chamado');
      if(!ticket){content.innerHTML=errorPanel('Chamado não encontrado ou sem permissão de acesso.');injectIcons(content);return;}
      content.innerHTML='<div class="loading"><span class="spinner"></span>Carregando conversa...</div>';
      await loadTicketDetails(ticket.id);content.innerHTML=ticketDetailPage(ticket);
    }
    injectIcons(content);content.focus({preventScroll:true});
  }catch(error){content.innerHTML=errorPanel(friendly(error));injectIcons(content);}
}

function metric(icon,label,value,caption,extra=''){return `<article class="metric-card ${extra}"><div class="metric-top"><span data-icon="${icon}"></span><small>${E(label)}</small></div><strong>${E(value)}</strong><p>${E(caption)}</p></article>`;}
function ticketRow(ticket){
  return `<article class="ticket-row" data-ticket-id="${E(ticket.id)}" tabindex="0" role="link">
    <div class="ticket-primary"><div class="ticket-meta"><span class="ticket-number">${ticketCode(ticket.ticket_number)}</span><span class="status ${statusClass(ticket.status)}">${E(statusLabel(ticket.status))}</span><span class="priority ${priorityClass(ticket.priority)}">${E(ticket.priority)}</span></div><div class="ticket-subject">${E(ticket.subject)}</div><div class="ticket-snippet">${E(ticket.category)}${ticket.page_url?' · Página relacionada informada':''}</div></div>
    <div class="ticket-right"><time>${E(dateTime(ticket.last_activity_at))}</time><span data-icon="chevron-right"></span></div>
  </article>`;
}
function dashboardPage(){
  const total=state.tickets.length,open=state.tickets.filter(t=>OPEN_STATUSES.includes(t.status)).length,waiting=state.tickets.filter(t=>t.status==='Aguardando cliente').length,resolved=state.tickets.filter(t=>['Resolvido','Fechado'].includes(t.status)).length;
  const latest=state.tickets.slice(0,5);
  return `<section class="page-heading"><div><p class="eyebrow">OLÁ, ${E((state.profile?.name||'CLIENTE').split(' ')[0].toUpperCase())}</p><h2>${E(state.profile?.company_name||'Sua empresa')}</h2><p>Acompanhe seus atendimentos e fale com a equipe DSB.</p></div><div class="page-actions"><a href="#new-ticket" class="btn btn-primary"><span data-icon="plus-circle"></span>Novo chamado</a></div></section>
  <section class="grid metrics-grid">${metric('activity','CHAMADOS ABERTOS',open,'Solicitações em andamento')}${metric('clock','AGUARDANDO VOCÊ',waiting,'Precisam da sua resposta','warning')}${metric('check','RESOLVIDOS',resolved,'Histórico concluído','success')}${metric('ticket','TOTAL',total,'Todos os seus chamados')}</section>
  <section class="grid dashboard-grid"><article class="panel"><div class="panel-head"><div><h3>Chamados recentes</h3><p>Últimas movimentações da sua empresa</p></div><a href="#tickets" class="link-button">Ver todos →</a></div>${latest.length?`<div class="ticket-list">${latest.map(ticketRow).join('')}</div>`:emptyState('ticket','Nenhum chamado ainda','Quando precisar de suporte, crie sua primeira solicitação.','<a class="btn btn-primary" href="#new-ticket">Abrir chamado</a>')}</article>
  <aside class="grid"><article class="panel service-card"><span class="service-mark" data-icon="shield"></span><h3>Canal oficial de suporte</h3><p>Use este portal para registrar solicitações. Assim, todo o histórico fica centralizado e sua empresa consegue acompanhar cada etapa.</p></article><article class="panel"><div class="panel-head"><div><h3>Acesso rápido</h3><p>O que você precisa fazer?</p></div></div><div class="panel-body quick-actions"><a class="quick-action" href="#new-ticket"><span data-icon="plus-circle"></span><span><strong>Abrir chamado</strong><small>Enviar uma nova solicitação</small></span><span data-icon="chevron-right"></span></a><a class="quick-action" href="#tickets"><span data-icon="chat"></span><span><strong>Ver conversas</strong><small>Acompanhar respostas da DSB</small></span><span data-icon="chevron-right"></span></a><a class="quick-action" href="#account"><span data-icon="user"></span><span><strong>Minha conta</strong><small>Dados e segurança do acesso</small></span><span data-icon="chevron-right"></span></a></div></article></aside></section>`;
}
function filteredTickets(){
  const q=state.search.trim().toLowerCase();return state.tickets.filter(t=>(state.filter==='Todos'||t.status===state.filter) && (!q||ticketCode(t.ticket_number).toLowerCase().includes(q)||String(t.subject).toLowerCase().includes(q)||String(t.category).toLowerCase().includes(q)));
}
function ticketsPage(){
  const rows=filteredTickets();
  return `<section class="page-heading"><div><p class="eyebrow">CENTRAL DE ATENDIMENTO</p><h2>Meus chamados</h2><p>Consulte o histórico, acompanhe o status e responda à equipe DSB.</p></div><div class="page-actions"><a href="#new-ticket" class="btn btn-primary"><span data-icon="plus-circle"></span>Novo chamado</a></div></section>
  <div class="toolbar"><label class="search-box"><span data-icon="search"></span><input id="ticket-search" type="search" placeholder="Buscar por número, assunto ou categoria..." value="${E(state.search)}"></label><select id="ticket-filter" class="filter-select"><option>Todos</option>${['Novo','Aberto','Em atendimento','Aguardando cliente','Resolvido','Fechado'].map(s=>`<option value="${E(s)}" ${state.filter===s?'selected':''}>${E(statusLabel(s))}</option>`).join('')}</select></div>
  <section class="panel ticket-table-panel">${rows.length?`<div class="ticket-list">${rows.map(ticketRow).join('')}</div>`:emptyState('search','Nenhum chamado encontrado','Tente alterar os filtros ou abra uma nova solicitação.','')}</section>`;
}
function emptyState(icon,title,text,action=''){return `<div class="empty"><span data-icon="${icon}"></span><strong>${E(title)}</strong><p>${E(text)}</p>${action}</div>`;}
function newTicketPage(){
  return `<section class="page-heading"><div><p class="eyebrow">NOVA SOLICITAÇÃO</p><h2>Abrir chamado</h2><p>Explique o que você precisa. Quanto mais contexto, melhor conseguimos ajudar.</p></div></section>
  <form id="new-ticket-form" class="panel form-card" novalidate><div class="form-section"><div class="form-grid"><div class="field span-2"><label for="subject">ASSUNTO</label><input id="subject" name="subject" maxlength="180" minlength="3" required placeholder="Ex.: Botão de agendamento não abre no celular"></div><div class="field"><label for="category">CATEGORIA</label><select id="category" name="category">${CATEGORIES.map(c=>`<option>${E(c)}</option>`).join('')}</select></div><div class="field"><label for="priority">PRIORIDADE</label><select id="priority" name="priority"><option>Baixa</option><option selected>Normal</option><option>Alta</option></select></div><div class="field span-2"><label for="page_url">PÁGINA RELACIONADA <span style="font-weight:400;color:#58738d">(opcional)</span></label><input id="page_url" name="page_url" type="url" maxlength="1000" placeholder="https://seusite.com.br/pagina"><span class="hint">Se o problema estiver em uma página específica, cole o endereço aqui.</span></div><div class="field span-2"><label for="description">DESCRIÇÃO</label><textarea id="description" name="description" minlength="3" maxlength="5000" required placeholder="Conte o que aconteceu, o que você esperava que acontecesse e, se possível, em qual dispositivo ocorreu..."></textarea></div><div class="field span-2"><label for="initial-files">ANEXOS <span style="font-weight:400;color:#58738d">(opcional)</span></label><label class="file-label" for="initial-files"><span data-icon="paperclip"></span>Selecionar imagens ou arquivos<input id="initial-files" type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"></label><span id="initial-files-label" class="hint">PNG, JPG, WEBP, PDF ou TXT · até 10 MB por arquivo.</span></div><div class="field span-2"><label>COMO ESCOLHER A PRIORIDADE</label><div class="priority-help"><div class="priority-option"><strong>Baixa</strong><small>Ajuste ou dúvida sem impacto imediato.</small></div><div class="priority-option"><strong>Normal</strong><small>Problema que precisa ser analisado.</small></div><div class="priority-option"><strong>Alta</strong><small>Falha importante que afeta o uso do serviço.</small></div></div></div></div><p class="form-error" id="new-ticket-error" role="alert" style="margin-top:16px"></p></div><div class="form-footer"><a class="btn btn-ghost" href="#tickets">Cancelar</a><button class="btn btn-primary" id="create-ticket-button" type="submit"><span data-icon="send"></span>Enviar chamado</button></div></form>`;
}
function accountPage(){
  const p=state.profile||{};return `<section class="page-heading"><div><p class="eyebrow">SEU ACESSO</p><h2>Minha conta</h2><p>Confira os dados vinculados ao Portal DSB e gerencie sua senha.</p></div></section><section class="account-grid"><article class="panel profile-card"><div class="profile-head"><span class="avatar">${E(initials(p.name))}</span><div><h3>${E(p.name||'Cliente')}</h3><p>${E(p.company_name||'Cliente DSB')}</p></div></div><div class="profile-data"><div><small>E-mail de acesso</small><strong>${E(p.email||state.user?.email||'—')}</strong></div><div><small>Empresa</small><strong>${E(p.company_name||'—')}</strong></div><div><small>Status do cliente</small><strong>${E(p.company_status||'—')}</strong></div><div><small>Ambiente</small><strong>Portal DSB Client</strong></div></div></article><article class="panel security-card"><h3>Segurança</h3><p>Altere sua senha de acesso. A nova senha deve ter pelo menos 8 caracteres.</p><form id="change-password-form"><div class="field"><label for="account-password">NOVA SENHA</label><input id="account-password" name="password" type="password" minlength="8" autocomplete="new-password" required></div><div class="field"><label for="account-confirm">CONFIRMAR SENHA</label><input id="account-confirm" name="confirm" type="password" minlength="8" autocomplete="new-password" required></div><p class="form-error" id="account-password-error"></p><button class="btn btn-primary" type="submit">Atualizar senha</button><button class="btn btn-danger" type="button" data-action="logout" style="margin-left:6px"><span data-icon="logout"></span>Sair</button></form></article></section>`;
}
function ticketDetailPage(ticket){
  const messages=state.messages||[],byMessage=new Map();state.attachments.forEach(a=>{if(!byMessage.has(a.message_id))byMessage.set(a.message_id,[]);byMessage.get(a.message_id).push(a);});
  const messagesHtml=messages.length?messages.map(m=>{
    const client=m.author_kind==='client', files=byMessage.get(m.id)||[];
    return `<div class="message ${client?'client':'staff'}"><span class="message-avatar">${E(initials(m.author_name))}</span><div class="message-bubble"><p class="message-meta">${E(client?'Você':m.author_name)} · ${E(dateTime(m.created_at))}</p><div class="message-body">${E(m.body)}</div>${files.length?`<div class="attachments">${files.map(f=>`<button class="attachment" type="button" data-attachment="${E(f.storage_path)}"><span data-icon="file"></span>${E(f.file_name)}</button>`).join('')}</div>`:''}</div></div>`;
  }).join(''):emptyState('chat','Sem mensagens','Ainda não há mensagens neste chamado.');
  const link=safeUrl(ticket.page_url);
  return `<button class="back-link" type="button" data-action="back-tickets"><span data-icon="arrow-left"></span>Voltar para meus chamados</button><section class="panel ticket-header"><div class="ticket-header-top"><span class="ticket-number">${ticketCode(ticket.ticket_number)}</span><span class="status ${statusClass(ticket.status)}">${E(statusLabel(ticket.status))}</span><span class="priority ${priorityClass(ticket.priority)}">${E(ticket.priority)}</span></div><h2>${E(ticket.subject)}</h2><p>Aberto em ${E(dateTime(ticket.created_at))} · Última atividade ${E(dateTime(ticket.last_activity_at))}</p></section><div style="height:16px"></div><section class="detail-grid"><article class="panel conversation"><div class="panel-head"><div><h3>Conversa</h3><p>Mensagens entre sua empresa e a DSB</p></div></div><div class="message-list" id="message-list">${messagesHtml}</div><form class="reply-box" id="reply-form"><textarea name="body" id="reply-body" maxlength="5000" required placeholder="Escreva sua resposta para a equipe DSB..."></textarea><p class="form-error" id="reply-error"></p><div class="reply-actions"><div><label class="file-label" for="reply-files"><span data-icon="paperclip"></span>Anexar arquivos<input id="reply-files" type="file" multiple accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"></label><span class="selected-files" id="reply-files-label"></span></div><button class="btn btn-primary" id="reply-button" type="submit"><span data-icon="send"></span>Enviar resposta</button></div></form></article><aside class="ticket-side grid"><article class="panel info-card"><h3>Detalhes do chamado</h3><dl class="info-list"><div><dt>Status</dt><dd>${E(statusLabel(ticket.status))}</dd></div><div><dt>Categoria</dt><dd>${E(ticket.category)}</dd></div><div><dt>Prioridade</dt><dd>${E(ticket.priority)}</dd></div><div><dt>Responsável</dt><dd>${ticket.assigned_to?'Equipe DSB':'Triagem DSB'}</dd></div>${link?`<div><dt>Página relacionada</dt><dd><a href="${E(link)}" target="_blank" rel="noopener noreferrer">Abrir página ↗</a></dd></div>`:''}</dl></article><article class="panel service-card"><span class="service-mark" data-icon="chat"></span><h3>Responder reabre o chamado</h3><p>Se um chamado estiver resolvido ou aguardando sua resposta, uma nova mensagem sua coloca a solicitação novamente em atendimento.</p></article></aside></section>`;
}
function errorPanel(message){return `<div class="error-panel"><strong>Não foi possível carregar esta área.</strong><br>${E(message)}<div style="margin-top:14px"><button class="btn btn-secondary" type="button" data-action="refresh">Tentar novamente</button></div></div>`;}

async function uploadAttachments(ticketId,messageId,files){
  validateFiles(files);
  for(const file of files){
    const path=`${ticketId}/${messageId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const {error:uploadError}=await state.client.storage.from('dsb-ticket-attachments').upload(path,file,{contentType:file.type,upsert:false});
    if(uploadError)throw uploadError;
    const {error:metaError}=await state.client.from('dsb_ticket_attachments').insert({ticket_id:ticketId,message_id:messageId,storage_path:path,file_name:file.name,mime_type:file.type,file_size:file.size});
    if(metaError){await state.client.storage.from('dsb-ticket-attachments').remove([path]);throw metaError;}
  }
}
async function createTicket(form){
  const values=Object.fromEntries(new FormData(form)); const subject=String(values.subject||'').trim(),description=String(values.description||'').trim(),pageUrl=String(values.page_url||'').trim();
  if(subject.length<3)throw Error('Informe um assunto com pelo menos 3 caracteres.');if(description.length<3)throw Error('Descreva sua solicitação com pelo menos 3 caracteres.');if(pageUrl&&!safeUrl(pageUrl))throw Error('A página relacionada precisa começar com http:// ou https://.');
  const category=CATEGORIES.includes(values.category)?values.category:'Outro',priority=PRIORITIES.includes(values.priority)?values.priority:'Normal';
  const files=[...($('#initial-files')?.files||[])];validateFiles(files);
  const {data,error}=await state.client.rpc('dsb_customer_create_ticket',{p_subject:subject,p_category:category,p_priority:priority,p_page_url:pageUrl,p_description:description});
  if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row?.ticket_id)throw Error('O chamado não pôde ser criado.');
  if(files.length){try{await uploadAttachments(row.ticket_id,row.message_id,files);}catch(error){toast('Chamado criado, mas um ou mais anexos não puderam ser enviados.','error');}}
  await loadTickets({silent:true});return row.ticket_id;
}
async function sendReply(form){
  const ticket=state.tickets.find(t=>t.id===currentRoute().id);if(!ticket)throw Error('Chamado não encontrado.');
  const body=String(new FormData(form).get('body')||'').trim();if(!body)throw Error('Digite uma resposta.');const files=[...($('#reply-files')?.files||[])];validateFiles(files);
  const messageId=crypto.randomUUID();const {error}=await state.client.from('dsb_ticket_messages').insert({id:messageId,ticket_id:ticket.id,body});if(error)throw error;
  if(files.length){try{await uploadAttachments(ticket.id,messageId,files);}catch(error){toast('A resposta foi enviada, mas um ou mais anexos não puderam ser enviados.','error');}}
  await loadTickets({silent:true});await loadTicketDetails(ticket.id);
}
async function openAttachment(path){
  const {data,error}=await state.client.storage.from('dsb-ticket-attachments').createSignedUrl(path,90);if(error)throw error;if(!data?.signedUrl)throw Error('Não foi possível abrir o anexo.');window.open(data.signedUrl,'_blank','noopener,noreferrer');
}

async function login(event){
  event.preventDefault();const button=$('#login-submit'),errorEl=$('#login-error');errorEl.textContent='';setBusy(button,true,'Entrando...');
  try{
    const remember=$('#remember').checked;localStorage.setItem('dsb.client.remember',String(remember));localStorage.removeItem('dsb.client.auth');sessionStorage.removeItem('dsb.client.auth');
    const client=createClient(remember);const {data,error}=await client.auth.signInWithPassword({email:$('#login-email').value.trim(),password:$('#login-password').value});if(error)throw error;
    state.user=data.user;const profile=await loadProfile();if(!profile){showUnauthorized();return;}await loadTickets();$('#login-password').value='';showApp();
  }catch(error){errorEl.textContent=friendly(error);}finally{setBusy(button,false);}
}
async function forgotPassword(){
  const email=$('#login-email').value.trim();if(!email){$('#login-error').textContent='Digite seu e-mail primeiro.';return;}
  const button=$('#forgot-password');button.disabled=true;$('#login-error').textContent='';
  try{const {error}=await state.client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;toast('Se o e-mail estiver cadastrado, você receberá um link de recuperação.');}catch(error){$('#login-error').textContent=friendly(error);}finally{button.disabled=false;}
}
async function recoverPassword(event){
  event.preventDefault();const form=event.currentTarget,errorEl=$('#recovery-error'),button=form.querySelector('button[type="submit"]');errorEl.textContent='';const a=$('#new-password').value,b=$('#confirm-password').value;if(a.length<8){errorEl.textContent='Use pelo menos 8 caracteres.';return;}if(a!==b){errorEl.textContent='As senhas não coincidem.';return;}setBusy(button,true,'Salvando...');
  try{const {error}=await state.client.auth.updateUser({password:a});if(error)throw error;toast('Senha alterada. Entre novamente com a nova senha.');await state.client.auth.signOut();state.recovery=false;history.replaceState(null,'',location.pathname);showLogin();}catch(error){errorEl.textContent=friendly(error);}finally{setBusy(button,false);}
}
async function changePassword(event){
  event.preventDefault();const form=event.currentTarget,errorEl=$('#account-password-error'),button=form.querySelector('button[type="submit"]');const a=String(new FormData(form).get('password')||''),b=String(new FormData(form).get('confirm')||'');errorEl.textContent='';if(a.length<8){errorEl.textContent='Use pelo menos 8 caracteres.';return;}if(a!==b){errorEl.textContent='As senhas não coincidem.';return;}setBusy(button,true,'Atualizando...');
  try{const {error}=await state.client.auth.updateUser({password:a});if(error)throw error;form.reset();toast('Senha atualizada com sucesso.');}catch(error){errorEl.textContent=friendly(error);}finally{setBusy(button,false);}
}
async function logout(){try{await state.client?.auth.signOut();}catch{}showLogin();}
async function refresh(){
  const button=$('#refresh-button');if(button)button.disabled=true;try{await loadTickets();await renderCurrent();toast('Dados atualizados.');}catch(error){toast(friendly(error),'error');}finally{if(button)button.disabled=false;}
}

function bindEvents(){
  $('#login-form').addEventListener('submit',login);$('#forgot-password').addEventListener('click',forgotPassword);$('#recovery-form').addEventListener('submit',recoverPassword);
  $('#password-toggle').addEventListener('click',()=>{const input=$('#login-password'),button=$('#password-toggle');const show=input.type==='password';input.type=show?'text':'password';button.dataset.iconButton=show?'eye-off':'eye';injectIcons(button);});
  $('#mobile-menu').addEventListener('click',openMenu);$('#sidebar-overlay').addEventListener('click',closeMenu);window.addEventListener('hashchange',()=>{if(state.user&&state.profile)handleRoute();});
  $('#refresh-button').addEventListener('click',refresh);
  document.addEventListener('click',async event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;if(action==='logout'){await logout();return;}if(action==='account'){location.hash='account';return;}if(action==='back-tickets'){location.hash='tickets';return;}if(action==='refresh'){await refresh();return;}
    const row=event.target.closest('[data-ticket-id]');if(row){location.hash=`ticket/${row.dataset.ticketId}`;return;}
    const attachment=event.target.closest('[data-attachment]');if(attachment){try{await openAttachment(attachment.dataset.attachment);}catch(error){toast(friendly(error),'error');}}
  });
  document.addEventListener('keydown',event=>{const row=event.target.closest?.('[data-ticket-id]');if(row&&(event.key==='Enter'||event.key===' ')){event.preventDefault();location.hash=`ticket/${row.dataset.ticketId}`;}});
  document.addEventListener('input',event=>{
    if(event.target.id==='ticket-search'){state.search=event.target.value;const panel=$('.ticket-table-panel');if(panel){const rows=filteredTickets();panel.innerHTML=rows.length?`<div class="ticket-list">${rows.map(ticketRow).join('')}</div>`:emptyState('search','Nenhum chamado encontrado','Tente alterar os filtros ou abra uma nova solicitação.','');injectIcons(panel);}}
    if(event.target.id==='initial-files')updateFileLabel('initial-files','initial-files-label');if(event.target.id==='reply-files')updateFileLabel('reply-files','reply-files-label');
  });
  document.addEventListener('change',event=>{if(event.target.id==='ticket-filter'){state.filter=event.target.value;renderCurrent();}});
  document.addEventListener('submit',async event=>{
    if(event.target.id==='new-ticket-form'){
      event.preventDefault();const button=$('#create-ticket-button'),errorEl=$('#new-ticket-error');errorEl.textContent='';setBusy(button,true,'Enviando...');try{const id=await createTicket(event.target);toast('Chamado criado com sucesso.');location.hash=`ticket/${id}`;}catch(error){errorEl.textContent=friendly(error);}finally{setBusy(button,false);}return;
    }
    if(event.target.id==='reply-form'){
      event.preventDefault();const button=$('#reply-button'),errorEl=$('#reply-error');errorEl.textContent='';setBusy(button,true,'Enviando...');try{await sendReply(event.target);event.target.reset();await renderCurrent();toast('Resposta enviada.');setTimeout(()=>{$('#message-list')?.scrollTo({top:999999,behavior:'smooth'});},50);}catch(error){errorEl.textContent=friendly(error);}finally{setBusy(button,false);}return;
    }
    if(event.target.id==='change-password-form')changePassword(event);
  });
}
function updateFileLabel(inputId,labelId){const files=[...($(`#${inputId}`)?.files||[])];const label=$(`#${labelId}`);if(!label)return;label.textContent=files.length?`${files.length} arquivo(s): ${files.map(f=>f.name).join(', ')}`:(inputId==='initial-files'?'PNG, JPG, WEBP, PDF ou TXT · até 10 MB por arquivo.':'');}

async function init(){
  injectIcons();bindEvents();const config=window.DSB_CLIENT_CONFIG||{};if(!window.supabase||!validConfig(config)){$('#login-error').textContent='O Portal DSB ainda não foi configurado. Contate a equipe responsável.';return;}
  const remember=localStorage.getItem('dsb.client.remember')!=='false';$('#remember').checked=remember;const client=createClient(remember);
  try{
    const {data,error}=await client.auth.getSession();if(error)throw error;
    if(data.session){state.user=data.session.user;if(state.recovery)return;const profile=await loadProfile();if(!profile){showUnauthorized();return;}await loadTickets();showApp();}else showLogin();
  }catch(error){$('#login-error').textContent=friendly(error);showLogin();}
}

window.addEventListener('DOMContentLoaded',init);
})();
