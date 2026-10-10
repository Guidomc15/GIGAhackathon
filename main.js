// Qollab loads the root Python file; serve.py maps it to the local HTTP bridge.

import {mountFusionCards} from './card-effects.js';
import {mountBloch} from './bloch.js';
import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';
const engine={dispatch_json,start_json,poll_json,demo_json};
import {TABLE_ART} from './table-art.js';
import {CARDS_ART} from './cards-art.js';
import {MENU_ART} from './menu-art.js';
import {REPOSITORY_URL,VERSION} from './config.js';
import {gateLabel} from './gates.js';
import {speechText} from './phrases.js';
import {esc,card,sphere,circuitStrip,gateStyle,technical,preview,circuitStory,quantumReport,measurementCard,table,turnGuide,handSummary,gateHelp,quantumOptions} from './ui.js';
const stage=document.getElementById('stage');
if(REPOSITORY_URL){const a=document.createElement('a');a.href=REPOSITORY_URL;a.textContent='Repositorio';a.target='_blank';a.rel='noopener';document.getElementById('repo').replaceChildren(a);}
let view=null, screen='home', revealed=false, busy=false, samplePending=false, quantumOpen=false;
let presentation=null, summaryOpen=false;
let uiError=null;
const reducedMotion=()=>document.querySelector('.app-shell').classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const delay=ms=>new Promise(resolve=>document.defaultView.setTimeout(resolve,reducedMotion()?0:ms));
const api=async (name,arg)=>{
  const value=arg===undefined?await engine[name].callPromising():await engine[name].callPromising(arg);
  return JSON.parse(String(value));
};
function setView(v){view=v;samplePending=!!v.tutorial.pending;if(v.remote_error)console.log(JSON.stringify({backend:v.remote_info,diagnostic:v.remote_error})); document.getElementById('mode').textContent=v.development_mode?'Simulación local con Qiskit · sin IonQ':'Simulador remoto IonQ · Qollab';}
function focus(selector=null){
  const dialog=document.getElementById('composer-dialog');
  const target=selector?stage.querySelector(selector):null;
  if(target&&!target.disabled&&(!dialog||dialog.contains(target))){target.focus({preventScroll:true});return;}
  if(dialog){if(!dialog.contains(document.activeElement))dialog.querySelector('button:not(:disabled)')?.focus();return;}
  stage.focus({preventScroll:true});
}
function focusSelector(){
  const el=document.activeElement;
  if(el.id)return '#'+CSS.escape(el.id);
  for(const name of ['data-card','data-token','data-remove','data-left','data-right']){
    if(el.hasAttribute(name))return `[${name}="${CSS.escape(el.getAttribute(name))}"]`;
  }
  return null;
}
async function showPresentation(effect, duration){
  presentation=effect;render();focus();
  try{await delay(duration);}finally{presentation=null;}
}
async function presentEvents(before){
  const g=view.game;
  const events=g.events.slice(before?.hand===g.hand?before.events.length:0);
  for(const event of events){
    if(event.kind==='speech')await showPresentation({type:'speech',event},850);
    if(event.kind==='measurement')await showPresentation({type:'measurement',q:event.measurement},1000);
    if(event.points){
      const gains=[0,0];gains[event.winner]=event.gained??event.points;
      await showPresentation({type:'points',event,gains},950);
    }
  }
}
async function showTurn(before, action, wasRevealed){
  const g=view.game;
  if(!g||!['prepare','play','respond','reassert'].includes(g.phase))return;
  const sameTurn=before?.hand===g.hand&&before.actor===g.actor&&wasRevealed&&!['new','guided','next'].includes(action);
  if(action==='reveal'||!g.privacy||view.guided||sameTurn){
    if(!view.private){setView(await api('dispatch_json',JSON.stringify({action:'reveal'})));}
    revealed=!!view.private&&!view.error;
    if(revealed&&(!sameTurn||action==='reveal')){
      await showPresentation({type:'flip',faceDown:true},240);
      await showPresentation({type:'flip',faceDown:false},420);
    }
  }
}
async function action(action,value=null){
  if(busy)return;
  busy=true;uiError=null;stage.setAttribute('aria-busy','true');
  const before=view.game?structuredClone(view.game):null, wasRevealed=revealed;
  const keep=['choose','edit','reveal'].includes(action),restoreFocus=keep?focusSelector():null;
  try{
    if(!keep){revealed=false;stage.innerHTML='<section class="panel neutral"><p role="status">Preparando la mesa…</p></section>';}
    setView(await api('dispatch_json',JSON.stringify({action,value})));
    if(view.error){if(!view.private){revealed=false;quantumOpen=false;}return;}
    if(['confirm','new','guided'].includes(action))quantumOpen=false;
    if(['new','guided','next'].includes(action))summaryOpen=false;
    if(action==='reveal')revealed=true;
    if((screen==='tutorial'&&samplePending)||(screen==='game'&&view.game?.phase==='measure'))await measure();
    if(view.error)return;
    if(screen==='game'){
      if(!keep)await presentEvents(before);
      await showTurn(before,action,wasRevealed);
    }
  }catch(error){showError('No se pudo completar la acción. '+error.message);}
  finally{busy=false;presentation=null;render();focus(restoreFocus);}
}
function showError(message){uiError=message;document.getElementById('notice').innerHTML=`<p class="error">${esc(message)}</p>`;}
async function measure(){
  uiError=null;
  // Each result is consumed once; retry only queries the same in-flight job.
  do{
    render();
    setView(await api('start_json',typeof backend==='undefined'?null:backend));
    if(view.error)return;
    if(!view.mode.startsWith('LOCAL')){
      for(;;){
        const response=await api('poll_json');
        if(response.error){setView(response);return;}
        setView(response.view);
        if(response.done)break;
        render();await new Promise(resolve=>setTimeout(resolve,750));
      }
    }
    revealed=false;
  }while(screen==='game'&&view.game?.phase==='measure');
}
async function retryMeasure(){
  if(busy)return;
  busy=true;stage.setAttribute('aria-busy','true');const before=view.game?structuredClone(view.game):null;
  try{await measure();if(!view.error&&screen==='game'){await presentEvents(before);await showTurn(before,'retry',false);}}
  catch(error){showError(error.message+' Reintentar conserva el circuito y el job.');}
  finally{busy=false;render();focus();}
}
function actionButtons(g){return `<div class="actions">${g.actions.filter(a=>a.id!=='confirm').map(a=>`<button data-action="${a.id}" ${a.id==='accept'?'class="primary"':''}><span>${esc(a.label)}${a.id==='envido'&&g.pending?.kind==='truco'?' va primero':''}</span>${a.hint?`<small>${esc(a.hint)}</small>`:''}</button>`).join('')}</div>`;}
function bindActions(){stage.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));}
function home(){
  stage.innerHTML=`<section class="start-menu" aria-label="Menú principal de Truco Cuántico"><img class="menu-art" src="${MENU_ART}" alt="" draggable="false"><h1 class="visually-hidden">Truco Cuántico</h1><div class="menu-controls"><button class="menu-hit menu-start" id="start"><span class="visually-hidden">Empezar Partida</span></button><button class="menu-hit menu-tutorial" id="learn"><span class="visually-hidden">Tutorial</span></button><button class="menu-hit menu-values" id="values"><span class="visually-hidden">Valores</span></button><button class="menu-hit menu-credits" id="menu-credits"><span class="visually-hidden">Créditos</span></button></div></section>${view.game?'<button class="resume-menu" id="resume">Retomar partida</button>':''}`;
  document.getElementById('start').onclick=()=>{screen='setup';render();focus();};
  document.getElementById('learn').onclick=()=>openTutorial();
  document.getElementById('values').onclick=()=>{screen='values';render();focus();};
  document.getElementById('menu-credits').onclick=()=>{screen='credits';render();focus();};
  document.getElementById('resume')?.addEventListener('click',()=>{screen='game';action('public');});
}
function values(){
  const ranks=['1 de espada','1 de basto','7 de espada','7 de oro','Todos los 3','Todos los 2','1 de copa y 1 de oro','Todos los 12','Todos los 11','Todos los 10','7 de copa y 7 de basto','Todos los 6','Todos los 5','Todos los 4'];
  stage.innerHTML=`<article class="panel help"><p class="pill">Consultá antes de jugar</p><h2>Valores de las cartas</h2><p>En el Truco, el orden de fuerza es distinto al número de la carta. De mayor a menor:</p><ol class="rank-list">${ranks.map((label,i)=>`<li><span class="rank-number">${i+1}</span><span>${esc(label)}</span></li>`).join('')}</ol><details class="deck-gallery"><summary>Ver las 40 cartas del mazo</summary>${["espada","basto","copa","oro"].map(suit=>`<h3>${suit}</h3><div class="deck-row">${[1,2,3,4,5,6,7,10,11,12].map(number=>card({number,suit,label:`${number} de ${suit}`})).join('')}</div>`).join('')}</details><h3>Tantos de Envido</h3><p>Del 1 al 7, cada carta vale su número. El 10, 11 y 12 valen 0. Con dos cartas del mismo palo, sumá sus valores y 20; si hay tres, elegí las dos mayores. Sin coincidencias de palo, cuenta el valor mayor.</p><p>Ejemplo: 7 y 6 del mismo palo suman 33. Un empate lo gana quien es mano.</p><h3>La carta cuántica</h3><p>Una vez medida, su identidad definitiva determina su fuerza y sus tantos. Antes de medir se muestran probabilidades; no tiene una fuerza adicional por ser cuántica.</p><div class="actions"><button id="full-rules">Ver reglas y cantos completos</button><button id="values-home" class="primary">Volver al inicio</button></div></article>`;
  document.getElementById('full-rules').onclick=()=>{screen='rules';render();focus();};
  document.getElementById('values-home').onclick=()=>{screen='home';render();focus();};
}
function setup(){
  stage.innerHTML=`<section class="panel"><h2>Compartir la mesa</h2><p>Sin Flor. Tres cartas por mano. Elegí cómo compartir el dispositivo.</p><form id="names"><div class="forms"><label>Jugador 1<input id="player-one" name="one" type="text" value="Alejo" maxlength="30" required autocomplete="off"></label><label>Jugador 2<input id="player-two" name="two" type="text" value="Belén" maxlength="30" required autocomplete="off"></label></div><p class="callout">${view.host_local?'Simulación local con Qiskit: podés jugar partidas completas, sin IonQ.':esc(view.mode)}</p><label><input id="dev-mode" type="checkbox" ${view.development_mode?'checked':''} ${view.host_local?'disabled':''}> Desarrollo local con Qiskit (no IonQ; permite una partida completa)</label>${view.host_local?'':'<p class="sphere-caption">IonQ es el modo por defecto en Qollab. Su límite comprobado de un job impide mediciones sucesivas; no se cambia de modo automáticamente.</p>'}<label class="privacy-option"><input id="privacy-mode" type="checkbox"> Jugar con privacidad</label><p class="sphere-caption">Activado: ocultamos la mano al pasar el dispositivo. Desactivado: el siguiente turno aparece directamente con las cartas que se dan vuelta.</p><button id="deal" class="primary" type="button">Repartir primera mano</button></form></section>`;
  const deal=async()=>{if(busy)return;const names=['player-one','player-two'].map(id=>document.getElementById(id).value.trim());if(names.some(name=>!name)){showError('Escribí el nombre de ambos jugadores.');return;}const privacy=document.getElementById('privacy-mode').checked;const dev=document.getElementById('dev-mode').checked;await action('dev_mode',dev);screen='game';await action('new',{names,privacy});focus();};
  document.getElementById('deal').onclick=deal;
  document.getElementById('names').onsubmit=event=>{event.preventDefault();deal();};
}
function handoff(g){
  stage.innerHTML+=`<section class="panel neutral"><p class="lock" aria-hidden="true">◈</p><h2>Turno de ${esc(g.names[g.actor])}</h2><p>Pasale el dispositivo y asegurate de que el rival no esté mirando.</p><label><input type="checkbox" id="alone"> Estoy listo para ver mi información privada</label><div class="actions" style="justify-content:center"><button id="reveal" class="primary" disabled>Revelar mi mano</button></div></section>`;
  document.getElementById('alone').onchange=e=>document.getElementById('reveal').disabled=!e.target.checked;
  document.getElementById('reveal').onclick=()=>action('reveal');
}
function editor(g,priv){
  const q=priv.quantum;
  stage.innerHTML+=turnGuide(g,priv);
  stage.innerHTML+=table(g,{art:TABLE_ART,cards:priv.cards,quantum:q,prepare:true});
  document.getElementById('activate-quantum').onclick=()=>{quantumOpen=true;render();focus();};
  stage.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>action('choose',Number(b.dataset.card)));
  if(!q||!quantumOpen)return;
  stage.innerHTML+=`<dialog id="composer-dialog" class="overlay quantum-composer" aria-label="Compositor de la carta cuántica"><button id="close-composer" class="close-composer" aria-label="Volver a la mesa">Volver a la mesa ×</button><h2>Una carta, dos resultados posibles</h2><p class="composer-intro">Ambas conservan el número. Las fichas cambian sus probabilidades; la medición elige una identidad definitiva.</p>${quantumOptions(q)}<div class="composer-layout"><section class="circuit-workbench" aria-label="Circuito y esfera">${circuitStrip(q.preview.gates,q)}<div class="composer-sphere">${sphere(q.preview,null,'composer-'+q.original.label)}</div></section><aside class="gate-rack" aria-label="Cuatro fichas privadas"><h2>Tus compuertas</h2><div class="rack-frame">${q.tokens.map((token,i)=>`<button class="gate-tile gate-${token[0]}" style="${gateStyle(token)}" data-token="${i}" title="${esc(gateHelp[token])}" aria-label="Agregar ${esc(gateLabel(token))}, ficha ${i+1}: ${esc(gateHelp[token])}" ${q.sequence.includes(i)||q.sequence.length===3?'disabled':''}><span>${esc(gateLabel(token))}</span><small>Ficha ${i+1}</small></button>`).join('')}</div><p>Hasta 3 compuertas.<br>Cada ficha, una vez.</p></aside></div><div class="composer-controls">${(uiError||view.error)?`<p class="error" role="alert">${esc(uiError||view.error)}</p>`:''}<div class="actions"><button id="undo" ${q.sequence.length?'':'disabled'}>Deshacer</button><button id="reset">Reiniciar</button></div><label><input type="checkbox" id="lock-ok"> Confirmo el circuito; quedará bloqueado durante esta mano</label><button id="lock-circuit" class="primary" disabled>Confirmar circuito</button><p class="sphere-caption">Leé el circuito de izquierda a derecha. Editar no mide la carta. Sin fichas, el estado ideal conserva la original.</p><details class="gate-help"><summary>¿Qué hace cada ficha?</summary><ul>${Object.entries(gateHelp).map(([gate,text])=>`<li><strong>${esc(gateLabel(gate))}</strong>: ${esc(text)}</li>`).join('')}</ul></details>${technical(q.preview)}</div></dialog>`;
  document.getElementById('close-composer').onclick=()=>{quantumOpen=false;render();focus();};
  document.getElementById('activate-quantum').onclick=()=>{quantumOpen=true;render();focus();};
  // Rebind after replacing markup with +=.
  stage.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>action('choose',Number(b.dataset.card)));
  stage.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>action('edit',[...q.sequence,Number(b.dataset.token)]));
  stage.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>action('edit',q.sequence.filter((_,i)=>i!==Number(b.dataset.remove))));
  for(const direction of ['left','right'])stage.querySelectorAll(`[data-${direction}]`).forEach(b=>b.onclick=()=>{const i=Number(b.dataset[direction]),j=i+(direction==='left'?-1:1),seq=[...q.sequence];[seq[i],seq[j]]=[seq[j],seq[i]];action('edit',seq);});
  document.getElementById('undo').onclick=()=>action('edit',q.sequence.slice(0,-1));
  document.getElementById('reset').onclick=()=>action('edit',[]);
  document.getElementById('lock-ok').onchange=e=>document.getElementById('lock-circuit').disabled=!e.target.checked;
  document.getElementById('lock-circuit').onclick=()=>action('confirm');
}
function publicSummary(g){
  const report=g.report;
  if(!report)return '';
  return `<section class="panel public-summary"><p class="pill">Resumen público · Mano ${g.hand}</p>${handSummary(g)}<div class="player-summaries">${report.quantum.map((q,p)=>{
    const result=q?.result===null?'Terminó sin medir':q?(q.result?q.linked:q.original).label:'Sin carta cuántica';
    return `<article class="player-summary"><h3>${esc(g.names[p])}</h3><p>Resultado cuántico: <strong>${esc(result)}</strong></p><p>Cartas: ${report.cards?.[p].map(c=>`${esc(c.effective.label)}${c.quantum?' (Q)':''}`).join(' · ')||'—'}</p><p>Circuito: ${q?.preview.gates.map(gateLabel).map(esc).join(' → ')||'Sin compuertas'}</p>${g.envido?`<p>Envido: <strong>${g.envido.values[p]} tantos</strong></p>`:''}<details><summary>Ampliar detalles de ${esc(g.names[p])}</summary>${quantumReport(q)}</details></article>`;
  }).join('')}</div>${g.phase==='match_end'?`<details><summary>Manos anteriores (${g.history.length})</summary>${g.history.map(h=>`<details><summary>Mano ${h.hand} · ${h.scores.join(' / ')}</summary>${h.quantum.map((q,p)=>`<h3>${esc(g.names[p])}</h3>${quantumReport(q)}`).join('')}</details>`).join('')}</details><button id="download">Descargar informe JSON</button>`:''}<button id="close-summary">Volver al resultado</button></section>`;
}
function resultScreen(g){
  const match=g.phase==='match_end',loser=1-g.winner;
  stage.innerHTML+=`<section class="panel outcome" aria-label="Resultado de ${match?'partida':'mano'}"><p class="pill">${match?'Partida terminada':view.guided?'Mano guiada terminada':'Mano terminada'}</p><h2>Victoria de ${esc(g.names[g.winner])}</h2><p class="defeat">Derrota de ${esc(g.names[loser])}</p><p>${g.names.map((n,p)=>`${esc(n)}: ${g.scores[p]}`).join(' · ')}</p><div class="actions"><button id="view-summary" class="primary">Ver resumen</button>${match?'<button id="again">Nueva partida</button>':view.guided?'<button id="finish-tutorial">Terminar tutorial</button>':actionButtons(g)}</div></section>`;
  if(summaryOpen)stage.innerHTML+=publicSummary(g);
  document.getElementById('view-summary').onclick=()=>{summaryOpen=true;render();stage.querySelector('.public-summary')?.scrollIntoView({block:'start',behavior:reducedMotion()?'instant':'smooth'});};
  document.getElementById('close-summary')?.addEventListener('click',()=>{summaryOpen=false;render();focus();});
  document.getElementById('again')?.addEventListener('click',()=>{screen='setup';render();});
  document.getElementById('finish-tutorial')?.addEventListener('click',()=>{screen='home';render();});
  document.getElementById('download')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(g.history,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='truco-cuantico-informe.json';a.click();URL.revokeObjectURL(url);});
  bindActions();
}
function game(){
  const g=view.game;
  if(!g){screen='setup';setup();return;}
  stage.innerHTML=`<p class="round-meta">${esc(g.names[0])}: ${g.scores[0]} · ${esc(g.names[1])}: ${g.scores[1]} · Mano ${g.hand} · ${g.privacy?'Con privacidad':'Sin pausa de privacidad'}</p>`;
  if(presentation){
    if(presentation.type==='flip'){
      stage.innerHTML+=`<p class="turn-banner" role="status">Turno de ${esc(g.names[g.actor])}</p>`+table(g,{art:TABLE_ART,cards:view.private?.cards,quantum:view.private?.quantum,prepare:g.phase==='prepare',faceDown:presentation.faceDown,flip:!presentation.faceDown});return;
    }
    stage.innerHTML+=table(g,{art:TABLE_ART});
    if(presentation.type==='speech'){
      const e=presentation.event;
      stage.innerHTML+=`<section class="turn-presentation speech-bubble" role="status"><p>${esc(g.names[e.player])}</p><h2>${esc(speechText(e))}</h2>${e.value!==undefined?`<p>${e.value} tantos</p>`:''}</section>`;
    }else if(presentation.type==='measurement'){
      const q=presentation.q;
      stage.innerHTML+=`<section class="turn-presentation measurement-announcement"><h2>La carta de ${esc(g.names[q.player])} se midió</h2>${measurementCard(q,true)}<p>Este resultado queda fijo durante la mano.</p></section>`;
    }else if(presentation.type==='points'){
      const {event,gains}=presentation;
      const order=[0,1].sort((a,b)=>gains[b]-gains[a]);
      stage.innerHTML+=`<section class="turn-presentation points-presentation" role="status"><p>${esc(event.text)}${event.gained!==event.points?` · Valor del canto: ${event.points}. Llegó a 15.`:''}</p>${order.map(p=>`<div class="point-row"><strong>+${gains[p]} ${gains[p]===1?'punto':'puntos'}</strong><span>${esc(g.names[p])}</span></div>`).join('')}</section>`;
    }
    return;
  }
  if(['match_end','hand_end'].includes(g.phase)){resultScreen(g);return;}
  if(g.phase==='measure'){
    stage.innerHTML+=`<section class="panel neutral"><h2>${g.public_measurement?'Midiendo la carta':'Resolviendo el Envido'}</h2><p role="status">Esperando el resultado de la medición.</p><button id="retry">Reintentar consulta del mismo job</button></section>`;document.getElementById('retry').onclick=retryMeasure;return;
  }
  if(!revealed){handoff(g);return;}
  const priv=view.private||{};
  if(g.phase==='prepare'){editor(g,priv);return;}
  stage.innerHTML+=turnGuide(g,priv)+table(g,{art:TABLE_ART,cards:priv.cards,quantum:priv.quantum});
  if(g.envido)stage.innerHTML+=`<p class="callout">Envido: ${esc(g.names[0])} ${g.envido.values[0]} · ${esc(g.names[1])} ${g.envido.values[1]}. Ganó ${esc(g.names[g.envido.winner])}: +${g.envido.points}.</p>`;
  if(g.pending)stage.innerHTML+=`<section class="panel"><h2>Respuesta de ${esc(g.names[g.actor])}</h2><p>${esc(g.names[g.pending.proposer])} propone ${g.pending.kind==='envido'?g.pending.chain.map(c=>({envido:'Envido',real:'Real Envido',falta:'Falta Envido'}[c])).join(' → '):({2:'Truco',3:'Retruco',4:'Vale Cuatro'}[g.pending.level])}.</p></section>`;
  stage.innerHTML+=actionButtons(g)+`<details><summary>Línea temporal pública</summary><div class="timeline">${g.events.map(e=>`<p>${esc(e.kind==='speech'?speechText(e):e.text)} ${e.player!==undefined?'· '+esc(g.names[e.player]):''} ${e.points?'+ '+e.points+' puntos':''}</p>`).join('')}</div></details>`;
  bindActions();
  if(g.phase==='play')stage.querySelectorAll('[data-card]').forEach(b=>{
    b.onclick=()=>action('play',Number(b.dataset.card));b.draggable=true;
    b.ondragstart=e=>{e.dataTransfer.setData('application/x-truco-card',b.dataset.card);e.dataTransfer.effectAllowed='move';};
  });
  const drop=stage.querySelector('.played-bazas');
  if(drop&&g.phase==='play'){
    drop.ondragover=e=>{if(!busy)e.preventDefault();};
    drop.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('application/x-truco-card');if(/^[0-2]$/.test(raw))action('play',Number(raw));};
  }
}
async function openTutorial(){screen='tutorial';revealed=false;await action('tutorial',0);focus();}
function tutorial(){
  const t=view.tutorial;
  stage.innerHTML=`<section class="panel"><p class="step-count">Lección ${t.index+1} de ${t.total}</p><h2>${esc(t.title)}</h2><p>${esc(t.text)}</p><div class="tutorial-grid">${t.previews.map((p,i)=>`<article class="panel">${preview(p)}${p.gates.length?`<details class="tutorial-story"><summary>Entender este circuito paso a paso</summary>${circuitStory(p)}</details>`:''}${t.sample?`<button data-sample="${i}" class="primary">${t.index===2?'Quiero el Envido de Bot Q':'Medir este experimento'}</button>`:''}</article>`).join('')}</div>${samplePending?'<p role="status" class="callout">Esperando medición. No se inventará un resultado.</p><button id="tutorial-retry">Consultar el mismo job</button>':''}${t.result?`<p class="callout" role="status">${esc(t.result.text)}</p><details><summary>Origen del resultado</summary><pre>${esc(JSON.stringify(t.result.record,null,2))}</pre></details>`:''}<div class="actions"><button id="back" ${t.index===0?'disabled':''}>Retroceder</button><button id="repeat">Repetir lección</button>${t.index<t.total-1?'<button id="forward" class="primary">Avanzar</button>':'<button id="guided" class="primary">Jugar mano guiada</button>'}<button id="skip">Saltar tutorial</button></div><p><label><input id="tutorial-dev" type="checkbox" ${view.development_mode?'checked':''} ${view.host_local?'disabled':''}> Modo de desarrollo local con Qiskit, sin IonQ</label></p><p class="sphere-caption">Repetir una lección prepara un experimento nuevo; no vuelve a medir una carta de partida.</p>${view.host_local?'':'<p class="sphere-caption">En Qollab IonQ admite un solo job: para completar todas las lecciones podés elegir el modo de desarrollo explícitamente.</p>'}</section>`;
  stage.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>action('tutorial_sample',Number(b.dataset.sample)));
  document.getElementById('tutorial-retry')?.addEventListener('click',retryMeasure);
  document.getElementById('tutorial-dev').onchange=e=>action('dev_mode',e.target.checked);
  document.getElementById('back').onclick=()=>action('tutorial',t.index-1);
  document.getElementById('repeat').onclick=()=>action('tutorial',t.index);
  document.getElementById('forward')?.addEventListener('click',()=>action('tutorial',t.index+1));
  document.getElementById('skip').onclick=()=>{screen='setup';render();focus();};
  document.getElementById('guided')?.addEventListener('click',async()=>{screen='game';await action('guided','Vos');});
}
function rules(){
  stage.innerHTML=`<article class="panel help"><h2>Cómo jugar</h2><p>Partida hasta 15 puntos, sin Flor. El jugador mano alterna. Cada jugador recibe tres cartas de seis parejas distintas: nunca aparece una carta y su ligada a la vez.</p><p>Elegí una carta: original |0⟩, ligada |1⟩. Espada ↔ copa; basto ↔ oro. Usá hasta tres de tus cuatro fichas. Confirmar bloquea el circuito; una medición fija la identidad hasta terminar la mano.</p><h3>Cantos</h3><p>Envido querido: 2; Real: 3; Envido+Envido: 4; Envido+Real: 5; Envido+Envido+Real: 7. Falta: 15 menos los puntos del perdedor. Rechazar la primera propuesta paga 1; rechazar un aumento paga el valor anterior. Solo aceptar mide cartas.</p><p>Envido se permite antes de terminar la primera baza, antes de aceptar Truco y una sola vez. Ante Truco pendiente, Envido va primero: se resuelve y el proponente reafirma Truco.</p><p>Truco, Retruco y Vale Cuatro queridos valen 2, 3 y 4; rechazados, 1, 2 y 3. Irse al mazo concede el valor aceptado, o 1 sin canto aceptado. Solo quien aceptó el nivel puede aumentar después.</p><h3>Envido automático</h3><p>Figuras valen 0. Dos cartas del mismo palo: las dos mayores más 20. Sin coincidencias: el mayor valor. Un empate lo gana el jugador mano. Se publican tantos, no cartas.</p><h3>Jerarquía, de mayor a menor</h3><p>1 espada; 1 basto; 7 espada; 7 oro; treses; doses; 1 copa/oro; doces; onces; dieces; 7 copa/basto; seises; cincos; cuatros.</p><h3>Pardas</h3><p>Primera parda: segunda define. Primera ganada y segunda parda: gana quien ganó primera. Una baza cada uno: tercera define; tercera parda favorece al ganador de primera. Dos primeras pardas: tercera define. Tres pardas: gana el jugador mano.</p><h3>Privacidad y lectura de la esfera</h3><p>Al iniciar podés elegir «Jugar con privacidad» para ocultar las cartas al pasar el dispositivo. Sin esa opción, los turnos cambian directamente con una animación. Los tantos de Envido se anuncian automáticamente; los empates favorecen a mano. Norte es |0⟩; sur, |1⟩. Las probabilidades son cuadrados de amplitudes; los porcentajes no describen una carta clásica escondida. Los puntos numerados y el texto acompañan la trayectoria. Podés reducir animaciones y usar teclado.</p><p>Estos modelos enseñan un qubit, fase, interferencia y medición. No enseñan entrelazamiento, ruido ni ventaja cuántica.</p></article>`;
}
function credits(){stage.innerHTML=`<article class="panel help"><h2>Créditos y estado · ${VERSION}</h2><button id="demo-button">Ver video de evidencia (56 s)</button><div id="demo-view"></div><p>This effort is supported by Qollab &amp; IonQ.</p><p>Fuente original producida durante la ventana autorizada del 9–11 de octubre de 2026 (ART). Licencia MIT. Compositor propio y estados calculados con Qiskit. La esfera interactiva adapta la visualización de <a href="https://qollab.xyz/u/qollab/interactive-bloch-sphere" target="_blank" rel="noopener">Interactive Bloch Sphere de Qollab</a>; reutilización y modificaciones declaradas en THIRD_PARTY_NOTICES.md. Diseños de las 40 cartas, menú y mesa aportados por el usuario; fondo de mesa preparado con la herramienta de imágenes; atribución y licencia detalladas en THIRD_PARTY_NOTICES.md.</p><p>Qiskit: Apache 2.0. NumPy: BSD 3-Clause. Dependencias y licencias completas en THIRD_PARTY_NOTICES.md. Herramienta de IA: OpenAI Codex, generación de código, documentación y pruebas; declarada, con revisión pendiente del autor.</p><p>El modo local utiliza Qiskit Statevector, no IonQ. La prueba mínima en el proyecto ejecutó un circuito H con un shot en IonQ Aria 1 simulator. El segundo envío fue rechazado por el límite de un job. Qollab documenta un solo job IonQ por ejecución; impide una partida completa con mediciones sucesivas bajo estas reglas.</p><p>Avance parcial: ver STATUS.md para publicación, repositorio y video verificados. No se afirma haber completado el MVP del hackathon.</p></article>`;document.getElementById('demo-button').onclick=async()=>{const d=await api('demo_json');if(d.error){showError(d.error);return;}document.getElementById('demo-view').innerHTML=`<video controls preload="metadata" style="width:100%;margin:20px 0" aria-label="Video de evidencia, con textos visibles" src="data:video/mp4;base64,${d.data}"></video><details><summary>Transcripción equivalente</summary><pre>${esc(d.transcript)}</pre></details>`;};}
function render(){
  document.getElementById('notice').innerHTML=(uiError||view.error)?`<p class="error">${esc(uiError||view.error)}</p>`:'';
  document.querySelector('.app-shell').classList.toggle('landing',screen==='home');
  document.querySelector('.app-shell').classList.toggle('playing',screen==='game');
  ({home,setup,game,tutorial,rules,credits,values}[screen]||home)();
  const composer=document.getElementById('composer-dialog');
  if(composer){composer.showModal();composer.oncancel=e=>{e.preventDefault();quantumOpen=false;render();focus();};}
  mountBloch(stage);
  mountFusionCards(stage);
  stage.setAttribute('aria-busy',String(busy));
  if(busy)stage.querySelectorAll('button,input').forEach(control=>control.disabled=true);
}
for(const id of ['home','tutorial','rules','credits'])document.getElementById(id).onclick=()=>{if(busy)return;revealed=false;if(id==='tutorial')openTutorial();else{screen=id;render();focus();}};
document.getElementById('motion').onchange=e=>{document.querySelector('.app-shell').classList.toggle('reduced',e.target.checked);};
document.documentElement.style.setProperty('--table-art',`url("${TABLE_ART}")`);
document.documentElement.style.setProperty('--cards-art',`url("${CARDS_ART}")`);
try{setView(await api('dispatch_json',JSON.stringify({action:'public'})));render();}
catch(error){showError('No se pudo cargar el juego. Comprobá que el servidor esté activo y recargá la página. '+error.message);stage.innerHTML='<section class="panel"><h2>El juego todavía no pudo conectarse</h2><p>Volvé a cargar la página cuando la conexión se restablezca. Si el servidor sigue activo, tu sesión se conserva.</p><button id="reload-game">Volver a intentar</button></section>';document.querySelectorAll('nav button').forEach(button=>button.disabled=true);document.getElementById('reload-game').onclick=()=>location.reload();}

// Keep the Qollab run alive while interactive controls need its injected backend.
// The documented runtime has no run time limit; Stop terminates this session.
if(typeof backend !== 'undefined') await new Promise(() => {});
