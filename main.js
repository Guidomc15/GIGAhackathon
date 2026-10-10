// This JS code can't be run outside of Qollab environment (needs Pyodide and other components
// for proper Qiskit integration into JS code). If any Qiskit features / packages are used, it
// fill fail as soon as those are imported (or "backend" variable is used)

import {mountBloch} from './bloch.js';
import * as engine from 'truco.service';
import {TABLE_ART} from './table-art.js';
import {CARDS_ART} from './cards-art.js';
import {MENU_ART} from './menu-art.js';
import {REPOSITORY_URL} from './config.js';
import {esc,card,faceStyle,sphere,circuitStrip,gateStyle,technical,preview,circuitStory,quantumReport,measurementCard,scoreboard,table} from './ui.js';
const stage=document.getElementById('stage');
if(REPOSITORY_URL){const a=document.createElement('a');a.href=REPOSITORY_URL;a.textContent='Repositorio';a.target='_blank';a.rel='noopener';document.getElementById('repo').replaceChildren(a);}
let view=null, screen='home', revealed=false, busy=false, samplePending=false, quantumOpen=false;
let measurementEffect=null;
const shownPrivateResults=new Set();
const reducedMotion=()=>document.querySelector('.app-shell').classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
async function animateMeasurement(q, tableIndex=null){
  if(reducedMotion())return;
  measurementEffect={q,tableIndex};render();focus();
  try{await delay(720);}finally{measurementEffect=null;}
}
let delay = ms => new Promise(resolve => document.defaultView.setTimeout(resolve,ms));
const api=async (name,arg)=>{
  const value=arg===undefined?await engine[name].callPromising():await engine[name].callPromising(arg);
  return JSON.parse(String(value));
};
function setView(v){view=v;if(v.remote_error)console.log(JSON.stringify({backend:v.remote_info,diagnostic:v.remote_error})); document.getElementById('mode').textContent=v.mode+` · Python ${v.versions.python} · Qiskit ${v.versions.qiskit}`;}
function focus(){stage.focus({preventScroll:true});}
async function action(action,value=null){
  if(busy)return;
  busy=true;
  const keep=['choose','edit','reveal'].includes(action);
  try{
    if(!keep){revealed=false;stage.innerHTML='<section class="panel neutral"><p role="status">Pantalla oculta. Procesando…</p></section>';}
    document.documentElement.style.setProperty('--table-art',`url("${TABLE_ART}")`);
setView(await api('dispatch_json',JSON.stringify({action,value})));
    if(action==='reveal'&&!view.error)revealed=true;
    if(action==='tutorial_sample')samplePending=true;
    if(['confirm','new','guided'].includes(action))quantumOpen=false;
    if(['new','guided'].includes(action))shownPrivateResults.clear();
    if(action==='reveal'&&view.game?.phase==='envido_reveal'&&!view.error){
      const key=`${view.game.hand}-${view.private.player}`;
      if(!shownPrivateResults.has(key)){shownPrivateResults.add(key);await animateMeasurement(view.private.quantum);}
    }
    render();
    focus();
    if(view.error){samplePending=false;return;}
    if(samplePending || (screen==='game'&&view.game?.phase==='measure')) await measure();
  }catch(error){showError(error.message);}finally{busy=false;render();focus();}
}
function showError(message){document.getElementById('notice').innerHTML=`<p class="error">${esc(message)}</p>`;}
async function measure(resume=false){
  const pending=screen==='game'&&view.game?.phase==='measure'&&view.game.public_measurement?{q:view.game.public_measurement,player:view.game.actor,tableCount:view.game.table.length}:null;
  try{
    setView(await api('start_json',typeof backend==='undefined'?null:backend));
    if(view.error){render();return;}
    if(!view.mode.startsWith('LOCAL')&&view.remote_info)console.log(JSON.stringify({backend:view.remote_info, diagnostic:view.remote_error}));
    if(!view.mode.startsWith('LOCAL')){
      for(;;){
        const response=await api('poll_json');
        if(response.error){setView(response);render();return;}
        setView(response.view);
        if(response.done)break;
        await delay(750);
      }
    }
    samplePending=false; revealed=false;
    if(pending&&!view.error){
      const tableIndex=view.game.table.findIndex((entry,i)=>i>=pending.tableCount&&entry.player===pending.player);
      if(tableIndex>=0){
        const resultCard=view.game.table[tableIndex].card;
        const bit=resultCard.suit===pending.q.original.suit?0:resultCard.suit===pending.q.linked.suit?1:null;
        if(bit!==null)await animateMeasurement({...pending.q,result:bit},tableIndex);
      }
    }
    render();
    // A tutorial bot may have played its own still-unmeasured card next.
    if(screen==='game'&&view.game?.phase==='measure')await measure();
  }catch(error){showError(error.message+' Reintentar consulta conserva el circuito y el job.');}
}
function actionButtons(g){return `<div class="actions">${g.actions.filter(a=>a.id!=='confirm').map(a=>`<button data-action="${a.id}" ${a.id==='accept'?'class="primary"':''}>${esc(a.label)}${a.id==='envido'&&g.pending?.kind==='truco'?' va primero':''}</button>`).join('')}</div>`;}
function bindActions(){stage.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));}
function home(){
  stage.innerHTML=`<section class="start-menu" aria-label="Menú principal de Truco Cuántico"><img class="menu-art" src="${MENU_ART}" alt="" draggable="false"><h1 class="visually-hidden">Truco Cuántico</h1><div class="menu-controls"><button class="menu-hit menu-start" id="start"><span class="visually-hidden">Empezar Partida</span></button><button class="menu-hit menu-tutorial" id="learn"><span class="visually-hidden">Tutorial</span></button><button class="menu-hit menu-values" id="values"><span class="visually-hidden">Valores</span></button><button class="menu-hit menu-credits" id="menu-credits"><span class="visually-hidden">Créditos</span></button></div></section>${view.game?'<button class="resume-menu" id="resume">Retomar partida</button>':''}`;
  document.getElementById('start').onclick=()=>{screen='setup';render();focus();};
  document.getElementById('learn').onclick=()=>openTutorial();
  document.getElementById('values').onclick=()=>{screen='values';render();focus();};
  document.getElementById('menu-credits').onclick=()=>{screen='credits';render();focus();};
  document.getElementById('resume')?.addEventListener('click',()=>{screen='game';revealed=false;render();focus();});
}
function values(){
  const ranks=['1 de espada','1 de basto','7 de espada','7 de oro','Todos los 3','Todos los 2','1 de copa y 1 de oro','Todos los 12','Todos los 11','Todos los 10','7 de copa y 7 de basto','Todos los 6','Todos los 5','Todos los 4'];
  stage.innerHTML=`<article class="panel help"><p class="pill">Consultá antes de jugar</p><h2>Valores de las cartas</h2><p>En el Truco, el orden de fuerza es distinto al número de la carta. De mayor a menor:</p><ol class="rank-list">${ranks.map((label,i)=>`<li><span class="rank-number">${i+1}</span><span>${esc(label)}</span></li>`).join('')}</ol><details class="deck-gallery"><summary>Ver las 40 cartas del mazo</summary>${["espada","basto","copa","oro"].map(suit=>`<h3>${suit}</h3><div class="deck-row">${[1,2,3,4,5,6,7,10,11,12].map(number=>card({number,suit,label:`${number} de ${suit}`})).join('')}</div>`).join('')}</details><h3>Tantos de Envido</h3><p>Del 1 al 7, cada carta vale su número. El 10, 11 y 12 valen 0. Con dos cartas del mismo palo, sumá sus valores y 20; si hay tres, elegí las dos mayores. Sin coincidencias de palo, cuenta el valor mayor.</p><p>Ejemplo: 7 y 6 del mismo palo suman 33. Un empate lo gana quien es mano.</p><h3>La carta cuántica</h3><p>Una vez medida, su identidad definitiva determina su fuerza y sus tantos. Antes de medir se muestran probabilidades; no tiene una fuerza adicional por ser cuántica.</p><div class="actions"><button id="full-rules">Ver reglas y cantos completos</button><button id="values-home" class="primary">Volver al inicio</button></div></article>`;
  document.getElementById('full-rules').onclick=()=>{screen='rules';render();focus();};
  document.getElementById('values-home').onclick=()=>{screen='home';render();focus();};
}
function setup(){
  stage.innerHTML=`<section class="panel"><h2>Compartir la mesa</h2><p>Sin Flor. Tres cartas por mano. Circuitos y fichas privados.</p><form id="names"><div class="forms"><label>Jugador 1<input id="player-one" name="one" type="text" value="Alejo" maxlength="30" required autocomplete="off"></label><label>Jugador 2<input id="player-two" name="two" type="text" value="Belén" maxlength="30" required autocomplete="off"></label></div><p class="callout">${esc(view.mode)}. La versión local sirve para desarrollo; no cumple todavía la medición IonQ de Qollab.</p><label><input id="dev-mode" type="checkbox" ${view.development_mode?'checked':''} ${view.host_local?'disabled':''}> Desarrollo local con Qiskit (no IonQ; permite una partida completa)</label><p class="sphere-caption">IonQ es el modo por defecto en Qollab. Su límite comprobado de un job impide mediciones sucesivas; no se cambia de modo automáticamente.</p><button id="deal" class="primary" type="button">Repartir primera mano</button></form></section>`;
  const deal=async()=>{if(busy)return;const names=['player-one','player-two'].map(id=>document.getElementById(id).value.trim());if(names.some(name=>!name)){showError('Escribí el nombre de ambos jugadores.');return;}const dev=document.getElementById('dev-mode').checked;await action('dev_mode',dev);screen='game';await action('new',names);focus();};
  document.getElementById('deal').onclick=deal;
  document.getElementById('names').onsubmit=event=>{event.preventDefault();deal();};
}
function handoff(g){
  stage.innerHTML+=`<section class="panel neutral"><p class="lock" aria-hidden="true">◈</p><h2>Turno de ${esc(g.names[g.actor])}</h2><p>Pasale el dispositivo y asegurate de que el rival no esté mirando.</p><label><input type="checkbox" id="alone"> Estoy listo para ver mi información privada</label><div class="actions" style="justify-content:center"><button id="reveal" class="primary" disabled>Revelar mi mano</button></div><p class="sphere-caption">Al continuar, la pantalla se vuelve a ocultar. No es protección contra inspección técnica del dispositivo.</p></section>`;
  document.getElementById('alone').onchange=e=>document.getElementById('reveal').disabled=!e.target.checked;
  document.getElementById('reveal').onclick=()=>action('reveal');
}
function editor(g,priv){
  const q=priv.quantum;
  stage.innerHTML+=table(g,{art:TABLE_ART,cards:priv.cards,quantum:q,prepare:true});
  document.getElementById('activate-quantum').onclick=()=>{quantumOpen=true;render();focus();};
  stage.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>action('choose',Number(b.dataset.card)));
  if(!q||!quantumOpen)return;
  stage.innerHTML+=`<dialog id="composer-dialog" class="overlay quantum-composer" aria-label="Compositor de la carta cuántica"><button id="close-composer" class="close-composer" aria-label="Volver a la mesa">Volver a la mesa ×</button><div class="composer-layout"><section class="enlarged-card" aria-label="Carta cuántica agrandada"><span class="card-watermark" style="${faceStyle(q.original)}" aria-hidden="true"></span>${circuitStrip(q.preview.gates,q)}<div class="identity identity-zero">${card(q.original)}<span>${esc(q.original.label)}<br><strong>|0⟩ · ${(q.preview.probabilities[0]*100).toFixed(1)} %</strong></span></div><div class="composer-sphere">${sphere(q.preview,null,'composer-'+q.original.label)}</div><div class="identity identity-one">${card(q.linked)}<span>${esc(q.linked.label)}<br><strong>|1⟩ · ${(q.preview.probabilities[1]*100).toFixed(1)} %</strong></span></div></section><aside class="gate-rack" aria-label="Cuatro fichas privadas"><h2>Mazo de<br>compuertas</h2><div class="rack-frame">${q.tokens.map((token,i)=>`<button class="gate-tile gate-${token[0]}" style="${gateStyle(token)}" data-token="${i}" aria-label="Agregar ${esc(token)}, ficha ${i+1}" ${q.sequence.includes(i)||q.sequence.length===3?'disabled':''}><span>${esc(token==='RY+'?'RY +π/6':token==='RY-'?'RY −π/6':token)}</span><small>Ficha ${i+1}</small></button>`).join('')}</div><p>Hasta 3 compuertas.<br>Cada ficha, una vez.</p></aside></div><div class="composer-controls"><div class="actions"><button id="undo" ${q.sequence.length?'':'disabled'}>Deshacer</button><button id="reset">Reiniciar</button></div><label><input type="checkbox" id="lock-ok"> Confirmo el circuito; quedará bloqueado durante esta mano</label><button id="lock-circuit" class="primary" disabled>Confirmar y ocultar</button><p class="sphere-caption">Vista calculada con Qiskit. Editar no mide la carta.</p>${technical(q.preview)}</div></dialog>`;
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
function game(){
  const g=view.game;
  if(measurementEffect?.tableIndex!==undefined&&measurementEffect?.tableIndex!==null){
    stage.innerHTML=table(g,{art:TABLE_ART,measurement:measurementEffect})+`<p class="measurement-announcement" role="status">${esc(measurementEffect.q.result?measurementEffect.q.linked.label:measurementEffect.q.original.label)} · Identidad fijada</p>`;return;
  }
  if(!g){screen='setup';setup();return;}
  stage.innerHTML=`<p class="round-meta">${esc(g.names[0])}: ${g.scores[0]} · ${esc(g.names[1])}: ${g.scores[1]} · Mano ${g.hand}</p>`;
  if(g.phase==='match_end'){
    stage.innerHTML+=`<section class="panel"><p class="pill">Partida terminada</p><h2>Ganó ${esc(g.names[g.winner])}</h2><p>Se revelan los circuitos y fichas de ambos jugadores.</p>${g.history.map(h=>`<details><summary>Mano ${h.hand} · ${h.scores.join(' / ')}</summary>${h.quantum.map((q,p)=>`<h3>${esc(g.names[p])}</h3>${quantumReport(q)}`).join('')}<pre>${esc(JSON.stringify(h.events,null,2))}</pre></details>`).join('')}<div class="actions"><button id="download">Descargar informe JSON</button><button id="again" class="primary">Nueva partida</button></div></section>`;
    document.getElementById('again').onclick=()=>{screen='setup';render();};
    document.getElementById('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(g.history,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='truco-cuantico-informe.json';link.click();URL.revokeObjectURL(url);};return;
  }
  if(g.phase==='hand_end'){
    stage.innerHTML+=`<section class="panel"><h2>${view.guided?'Mano guiada terminada':'Mano terminada'}</h2><p>El jugador mano alterna en el próximo reparto.</p>${view.guided?'<button id="finish-tutorial" class="primary">Terminar tutorial</button>':actionButtons(g)}</section>`;
    bindActions();document.getElementById('finish-tutorial')?.addEventListener('click',()=>{screen='home';render();});return;
  }
  if(g.phase==='measure'){
    stage.innerHTML+=`<section class="panel neutral"><h2>Medición ${g.public_measurement?'pública':'privada por Envido'}</h2><p role="status">Esperando el backend. No se asigna una carta hasta validar su resultado.</p>${g.public_measurement?'<div class="measurement-wait" aria-label="Midiendo la carta">◈</div>':'<p>Las cartas y circuitos siguen ocultos.</p>'}<button id="retry">Reintentar consulta del mismo job</button></section>`;
    document.getElementById('retry').onclick=async()=>{if(busy)return;busy=true;await measure(true);busy=false;render();focus();};return;
  }
  if(!revealed){handoff(g);return;}
  const priv=view.private || {};
  if(g.phase==='prepare'){editor(g,priv);return;}
  if(g.phase==='envido_reveal'){
    stage.innerHTML+=`<section class="panel"><h2>Tu resultado privado de Envido</h2>${measurementCard(priv.quantum,!!measurementEffect)}<p>Todavía no se revelan los tantos ni las cartas del rival.</p>${actionButtons(g)}</section>`;bindActions();return;
  }
  if(g.phase==='report'){
    stage.innerHTML+=`<section class="panel"><h2>Tu análisis de la mano</h2>${quantumReport(priv.quantum)}${actionButtons(g)}</section>`;bindActions();return;
  }
  stage.innerHTML+=table(g,{art:TABLE_ART,cards:g.phase==='play'?priv.cards:[],quantum:priv.quantum});
  if(g.envido)stage.innerHTML+=`<p class="callout">Envido: ${esc(g.names[0])} ${g.envido.values[0]} · ${esc(g.names[1])} ${g.envido.values[1]}. Ganó ${esc(g.names[g.envido.winner])}: +${g.envido.points}.</p>`;
  if(g.pending)stage.innerHTML+=`<section class="panel"><h2>Respuesta de ${esc(g.names[g.actor])}</h2><p>${esc(g.names[g.pending.proposer])} propone ${g.pending.kind==='envido'?g.pending.chain.map(c=>({envido:'Envido',real:'Real Envido',falta:'Falta Envido'}[c])).join(' → '):({2:'Truco',3:'Retruco',4:'Vale Cuatro'}[g.pending.level])}.</p></section>`;
  if(g.phase==='reassert')stage.innerHTML+=`<p class="callout">Envido resuelto. ${esc(g.names[g.actor])} debe reafirmar el Truco pendiente.</p>`;
  stage.innerHTML+=actionButtons(g);

  stage.innerHTML+=`<details><summary>Línea temporal pública</summary><div class="timeline">${g.events.map(e=>`<p>${esc(e.text)} ${e.player!==undefined?'· '+esc(g.names[e.player]):''} ${e.points?'+ '+e.points+' puntos':''}</p>`).join('')}</div></details>`;
  bindActions();
  stage.querySelectorAll('[data-card]').forEach(b=>{
    b.onclick=()=>action('play',Number(b.dataset.card));
    b.draggable=true;
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
  stage.innerHTML=`<section class="panel"><p class="step-count">Lección ${t.index+1} de ${t.total}</p><h2>${esc(t.title)}</h2><p>${esc(t.text)}</p><div class="tutorial-grid">${t.previews.map((p,i)=>`<article class="panel">${preview(p)}${p.gates.length?`<details class="tutorial-story"><summary>Entender este circuito paso a paso</summary>${circuitStory(p)}</details>`:''}${t.sample?`<button data-sample="${i}" class="primary">${t.index===2?'Quiero el Envido de Bot Q':'Medir este experimento'}</button>`:''}</article>`).join('')}</div>${samplePending?'<p role="status" class="callout">Esperando medición. No se inventará un resultado.</p><button id="tutorial-retry">Consultar el mismo job</button>':''}${t.result?`<p class="callout" role="status">${esc(t.result.text)}</p><details><summary>Origen del resultado</summary><pre>${esc(JSON.stringify(t.result.record,null,2))}</pre></details>`:''}<div class="actions"><button id="back" ${t.index===0?'disabled':''}>Retroceder</button><button id="repeat">Repetir lección</button>${t.index<t.total-1?'<button id="forward" class="primary">Avanzar</button>':'<button id="guided" class="primary">Jugar mano guiada</button>'}<button id="skip">Saltar tutorial</button></div><p><label><input id="tutorial-dev" type="checkbox" ${view.development_mode?'checked':''} ${view.host_local?'disabled':''}> Modo de desarrollo local con Qiskit, sin IonQ</label></p><p class="sphere-caption">En Qollab IonQ admite un solo job: para completar todas las lecciones podés elegir el modo de desarrollo explícitamente. Repetir una lección prepara un nuevo experimento; no vuelve a medir una carta de partida.</p></section>`;
  stage.querySelectorAll('[data-sample]').forEach(b=>b.onclick=()=>action('tutorial_sample',Number(b.dataset.sample)));
  document.getElementById('tutorial-retry')?.addEventListener('click',async()=>{if(busy)return;busy=true;await measure(true);busy=false;render();focus();});
  document.getElementById('tutorial-dev').onchange=e=>action('dev_mode',e.target.checked);
  document.getElementById('back').onclick=()=>action('tutorial',t.index-1);
  document.getElementById('repeat').onclick=()=>action('tutorial',t.index);
  document.getElementById('forward')?.addEventListener('click',()=>action('tutorial',t.index+1));
  document.getElementById('skip').onclick=()=>{screen='setup';render();focus();};
  document.getElementById('guided')?.addEventListener('click',async()=>{screen='game';await action('guided','Vos');});
}
function rules(){
  stage.innerHTML=`<article class="panel help"><h2>Cómo jugar</h2><p>Partida hasta 15 puntos, sin Flor. El jugador mano alterna. Cada jugador recibe tres cartas de seis parejas distintas: nunca aparece una carta y su ligada a la vez.</p><p>Elegí una carta: original |0⟩, ligada |1⟩. Espada ↔ copa; basto ↔ oro. Usá hasta tres de tus cuatro fichas. Confirmar bloquea el circuito; una medición fija la identidad hasta terminar la mano.</p><h3>Cantos</h3><p>Envido querido: 2; Real: 3; Envido+Envido: 4; Envido+Real: 5; Envido+Envido+Real: 7. Falta: 15 menos los puntos del perdedor. Rechazar la primera propuesta paga 1; rechazar un aumento paga el valor anterior. Solo aceptar mide cartas.</p><p>Envido se permite antes de terminar la primera baza, antes de aceptar Truco y una sola vez. Ante Truco pendiente, Envido va primero: se resuelve y el proponente reafirma Truco.</p><p>Truco, Retruco y Vale Cuatro queridos valen 2, 3 y 4; rechazados, 1, 2 y 3. Irse al mazo concede el valor aceptado, o 1 sin canto aceptado. Solo quien aceptó el nivel puede aumentar después.</p><h3>Envido automático</h3><p>Figuras valen 0. Dos cartas del mismo palo: las dos mayores más 20. Sin coincidencias: el mayor valor. Un empate lo gana el jugador mano. Se publican tantos, no cartas.</p><h3>Jerarquía, de mayor a menor</h3><p>1 espada; 1 basto; 7 espada; 7 oro; treses; doses; 1 copa/oro; doces; onces; dieces; 7 copa/basto; seises; cincos; cuatros.</p><h3>Pardas</h3><p>Primera parda: segunda define. Primera ganada y segunda parda: gana quien ganó primera. Una baza cada uno: tercera define; tercera parda favorece al ganador de primera. Dos primeras pardas: tercera define. Tres pardas: gana el jugador mano.</p><h3>Privacidad y lectura de la esfera</h3><p>Pasá el dispositivo con la pantalla oculta. Dos acciones deliberadas revelan la mano. Norte es |0⟩; sur, |1⟩. Las probabilidades son cuadrados de amplitudes; los porcentajes no describen una carta clásica escondida. Los puntos numerados y el texto acompañan la trayectoria. Podés reducir animaciones y usar teclado.</p><p>Estos modelos enseñan un qubit, fase, interferencia y medición. No enseñan entrelazamiento, ruido ni ventaja cuántica.</p></article>`;
}
function credits(){stage.innerHTML=`<article class="panel help"><h2>Créditos y estado</h2><button id="demo-button">Ver video de evidencia (56 s)</button><div id="demo-view"></div><p>This effort is supported by Qollab &amp; IonQ.</p><p>Fuente original producida durante la ventana autorizada del 9–11 de octubre de 2026 (ART). Licencia MIT. Compositor propio y estados calculados con Qiskit. La esfera interactiva adapta la visualización de <a href="https://qollab.xyz/u/qollab/interactive-bloch-sphere" target="_blank" rel="noopener">Interactive Bloch Sphere de Qollab</a>; reutilización y modificaciones declaradas en THIRD_PARTY_NOTICES.md. Diseños de las 40 cartas, menú y mesa aportados por el usuario; fondo de mesa preparado con la herramienta de imágenes; atribución y licencia detalladas en THIRD_PARTY_NOTICES.md.</p><p>Qiskit: Apache 2.0. NumPy: BSD 3-Clause. Dependencias y licencias completas en THIRD_PARTY_NOTICES.md. Herramienta de IA: OpenAI Codex, generación de código, documentación y pruebas; declarada, con revisión pendiente del autor.</p><p>El modo local utiliza Qiskit Statevector, no IonQ. La prueba mínima en el proyecto ejecutó un circuito H con un shot en IonQ Aria 1 simulator. El segundo envío fue rechazado por el límite de un job. Qollab documenta un solo job IonQ por ejecución; impide una partida completa con mediciones sucesivas bajo estas reglas.</p><p>Avance parcial: ver STATUS.md para publicación, repositorio y video verificados. No se afirma haber completado el MVP del hackathon.</p></article>`;document.getElementById('demo-button').onclick=async()=>{const d=await api('demo_json');if(d.error){showError(d.error);return;}document.getElementById('demo-view').innerHTML=`<video controls preload="metadata" style="width:100%;margin:20px 0" aria-label="Video de evidencia, con textos visibles" src="data:video/mp4;base64,${d.data}"></video><details><summary>Transcripción equivalente</summary><pre>${esc(d.transcript)}</pre></details>`;};}
function render(){
  document.getElementById('notice').innerHTML=view.error?`<p class="error">${esc(view.error)}</p>`:'';
  document.querySelector('.app-shell').classList.toggle('landing',screen==='home');
  document.querySelector('.app-shell').classList.toggle('playing',screen==='game');
  ({home,setup,game,tutorial,rules,credits,values}[screen]||home)();
  const composer=document.getElementById('composer-dialog');
  if(composer){composer.showModal();composer.oncancel=e=>{e.preventDefault();quantumOpen=false;render();focus();};}
  mountBloch(stage);
  stage.setAttribute('aria-busy',String(busy));
  if(busy)stage.querySelectorAll('button,input').forEach(control=>control.disabled=true);
}
for(const id of ['home','tutorial','rules','credits'])document.getElementById(id).onclick=()=>{if(busy)return;revealed=false;if(id==='tutorial')openTutorial();else{screen=id;render();focus();}};
document.getElementById('motion').onchange=e=>{document.querySelector('.app-shell').classList.toggle('reduced',e.target.checked);};
document.documentElement.style.setProperty('--table-art',`url("${TABLE_ART}")`);
document.documentElement.style.setProperty('--cards-art',`url("${CARDS_ART}")`);
setView(await api('dispatch_json',JSON.stringify({action:'public'})));render();

// Keep the Qollab run alive while interactive controls need its injected backend.
// The documented runtime has no run time limit; Stop terminates this session.
if(typeof backend !== 'undefined') await new Promise(() => {});
