// Qollab loads the root Python file; serve.py maps it to the local HTTP bridge.

import {mountFusionCards} from './card-effects.js';
import {mountBloch} from './bloch.js';
import {dispatch_json,start_json,poll_json,demo_json} from 'qollab_engine';
const engine={dispatch_json,start_json,poll_json,demo_json};
import {TABLE_ART} from './table-art.js';
import {CARDS_ART} from './cards-art.js';
import {LOGO_ART,CARD_ART} from './home-art.js';
import {REPOSITORY_URL,VERSION} from './config.js';
import {gateLabel} from './gates.js';
import {speechText,displayText} from './phrases.js';
import {preferences,savePreference} from './preferences.js';
import {PresentationPlayer} from './presentation.js';
import {SoundMixer} from './sound.js';
import {rulesContent} from './learning.js';
import {SLIDES,slideHtml,definition,duelAnswer,duelWhy,ladderHtml,quantumOdds} from './slides.js';
import {L,lang,cardName,axes,isYou} from './i18n.js';
import {esc,card,sphere,circuitStrip,gateStyle,technical,quantumReport,measurementCard,table,turnGuide,handSummary,gateHelp,gateHelpPlain,quantumOptions,quantumStatus,eventText} from './ui.js';
// The running version is visible in the footer and the console, to check which files Qollab loaded.
console.info(`[Qriollo] versión ${VERSION}`);
const stage=document.getElementById('stage');
let view=null, screen='home', revealed=false, busy=false, quantumOpen=false;
let presentation=null, summaryOpen=false, lessonCircuit=0;
let uiError=null;
const player=new PresentationPlayer(),sound=new SoundMixer();
const reducedMotion=()=>document.querySelector('.app-shell').classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const delay=ms=>new Promise(resolve=>document.defaultView.setTimeout(resolve,reducedMotion()?0:ms));
const api=async (name,arg)=>{
  const value=arg===undefined?await engine[name].callPromising():await engine[name].callPromising(arg);
  return JSON.parse(String(value));
};
// Every request carries the interface language so engine messages come back translated.
const send=(action,value=null)=>api('dispatch_json',JSON.stringify({action,value,lang:lang()}));
// Every qubit measurement is also written to the browser console (DevTools → Console),
// with the raw record from Qiskit or IonQ, so the collapse can be checked outside the UI.
const loggedMeasurements=new Set();
function logMeasurements(v){
  const g=v.game;if(!g)return;
  const found=[];
  if(g.public_measurement?.record)found.push([g.hand,g.public_measurement.player,g.public_measurement]);
  for(const h of g.history||[])(h.quantum||[]).forEach((q,p)=>{if(q?.record)found.push([h.hand,p,q]);});
  for(const [hand,player,q] of found){
    const key=`${v.guided?'t':'g'}-${hand}-${player}-${q.record.moment}-${q.record.job_id||''}`;
    if(loggedMeasurements.has(key))continue;
    loggedMeasurements.add(key);
    console.info(`[Qriollo] Medición · mano ${hand} · ${g.names[player]}: |${q.result}⟩ → ${q.result===1?cardName(q.linked):cardName(q.original)}`,q.record);
  }
}
function setView(v){view=v;try{logMeasurements(v);}catch{}if(v.remote_error)console.log(JSON.stringify({backend:v.remote_info,diagnostic:v.remote_error}));document.getElementById('mode').textContent=v.development_mode?L('Simulación local con Qiskit · sin IonQ','Local Qiskit simulation · no IonQ'):L('Simulador remoto IonQ · Qollab','Remote IonQ simulator · Qollab');}
const actionLabel=a=>L(a.label,a.label_en||a.label);
const actionHint=a=>L(a.hint,a.hint_en||a.hint);
function focus(selector=null){
  const dialog=document.getElementById('composer-dialog');
  const target=selector?stage.querySelector(selector):null;
  if(target&&!target.disabled&&(!dialog||dialog.contains(target))){target.focus({preventScroll:true});return;}
  if(dialog){if(!dialog.contains(document.activeElement))dialog.querySelector('button:not(:disabled)')?.focus({preventScroll:true});return;}
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
function announcement(effect){
  const g=view.game;
  let body='',style='';
  if(effect.type==='speech'){
    const e=effect.event;style='speech-bubble';
    body=`<p>${esc(g.names[e.player])}</p><h2>${esc(displayText(e))}</h2>${e.value!==undefined?`<p>${e.value} ${L('tantos','envido points')}</p>`:''}`;
  }else if(effect.type==='measurement'){
    const q=effect.q;style='measurement-announcement';
    body=`<h2>${isYou(g.names[q.player])?L('Tu carta se midió','Your card was measured'):L(`La carta de ${esc(g.names[q.player])} se midió`,`${esc(g.names[q.player])}'s card was measured`)}</h2>${measurementCard(q,true)}<p>${L('Este resultado queda fijo durante la mano.','This result stays fixed for the rest of the hand.')}</p>`;
  }else if(effect.type==='points'){
    const {event,gains}=effect;style='points-presentation';
    const order=[0,1].sort((a,b)=>gains[b]-gains[a]);
    body=`<p>${esc(eventText(event.text))}${event.gained!==event.points?L(` · Valor del canto: ${event.points}. Llegó a 15.`,` · Call value: ${event.points}. Reached 15.`):''}</p>${order.map(p=>`<div class="point-row"><strong>+${gains[p]} ${gains[p]===1?L('punto','point'):L('puntos','points')}</strong><span>${esc(g.names[p])}</span></div>`).join('')}`;
  }else if(effect.type==='baza'){
    const e=effect.event;style='baza-presentation';
    body=`<h2>${e.winner===-1?L('Baza parda (empate)','Parda: the baza is tied'):isYou(g.names[e.winner])?L('Ganaste la baza','You win the baza'):L(`Ganó la baza ${esc(g.names[e.winner])}`,`${esc(g.names[e.winner])} wins the baza`)}</h2><div class="baza-comparison">${e.cards.map((item,i)=>`<article>${card(item.card)}<p>${esc(g.names[item.player])}<br><strong>${esc(cardName(item.card))}</strong><br>${L('Fuerza','Strength')} ${e.strengths[i]} ${L('de','of')} 14</p></article>`).join('')}</div><p>${L('Gana la carta de mayor fuerza en la jerarquía del Truco; el número impreso no alcanza para compararlas.','The card higher in the Truco ranking wins; the printed number alone does not decide.')}</p>`;
  }
  return `<section class="turn-presentation ${style}" role="dialog" aria-modal="true" aria-label="${L('Aviso de la partida','Game notice')}">${body}${player.controls()}</section>`;
}
async function showPresentation(effect, duration=null){
  presentation=effect;
  let layer=null;
  if(duration===null){
    layer=document.createElement('div');layer.id='presentation-layer';layer.innerHTML=announcement(effect);
    stage.after(layer);layer.querySelector('[data-skip-presentation]').focus({preventScroll:true});
    mountBloch(layer);mountFusionCards(layer);
    layer.onkeydown=event=>{
      if(event.key==='Escape'){event.preventDefault();player.finish();}
      if(event.key==='Tab'){
        const controls=[...layer.querySelectorAll('button')],index=controls.indexOf(document.activeElement);
        event.preventDefault();controls[(index+(event.shiftKey?controls.length-1:1))%controls.length].focus({preventScroll:true});
      }
    };
  }else{render();focus();}
  // Calls are proper names: the Spanish voice reads them in both languages.
  if(effect.type==='speech')sound.speak(`${view.game.names[effect.event.player]}. ${speechText(effect.event)}`);
  if(lang()==='es'&&effect.type==='measurement')sound.speak(`La carta de ${view.game.names[effect.q.player]} es ${cardName(effect.q.result?effect.q.linked:effect.q.original)}`);
  if(lang()==='es'&&effect.type==='points')sound.speak(`${view.game.names[effect.event.winner]} suma ${effect.event.gained??effect.event.points} puntos`);
  try{if(duration===null)await player.wait(layer);else await delay(duration);}
  finally{sound.stopVoice();layer?.remove();presentation=null;}
}
async function presentEvents(before){
  const g=view.game;
  const events=g.events.slice(before?.hand===g.hand?before.events.length:0);
  for(const event of events){
    if(event.kind==='speech')await showPresentation({type:'speech',event});
    if(event.kind==='measurement')await showPresentation({type:'measurement',q:event.measurement});
    if(event.cards&&event.strengths)await showPresentation({type:'baza',event});
    if(event.points){
      const gains=[0,0];gains[event.winner]=event.gained??event.points;
      await showPresentation({type:'points',event,gains});
    }
  }
}
async function showTurn(before, action, wasRevealed){
  const g=view.game;
  if(!g||!['prepare','play','respond','reassert'].includes(g.phase))return;
  const sameTurn=before?.hand===g.hand&&before.actor===g.actor&&wasRevealed&&!['new','tutorial','next'].includes(action);
  if(action==='reveal'||!g.privacy||view.guided||sameTurn){
    if(!view.private){setView(await send('reveal'));}
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
    if(!keep){
      revealed=false;stage.classList.add('waiting');
      document.getElementById('composer-dialog')?.close();
      stage.querySelectorAll('button,input').forEach(control=>control.disabled=true);
    }
    setView(await send(action,value));
    if(view.error){if(!view.private){revealed=false;quantumOpen=false;}return;}
    if(['confirm','new','tutorial'].includes(action))quantumOpen=false;
    if(['new','tutorial','next'].includes(action))summaryOpen=false;
    if(['new','tutorial'].includes(action))loggedMeasurements.clear();
    if(action==='reveal')revealed=true;
    if(screen==='game'&&view.game?.phase==='measure')await measure();
    if(action==='lesson')lessonCircuit=Math.min(lessonCircuit,(view.lesson?.circuits.length||1)-1);
    if(view.error)return;
    if(screen==='game'){
      if(!keep)await presentEvents(before);
      await showTurn(before,action,wasRevealed);
    }
  }catch(error){showError(L('No se pudo completar la acción. ','The action could not be completed. ')+error.message);}
  finally{busy=false;presentation=null;stage.classList.remove('waiting');render();focus(restoreFocus);}
}
function showError(message){uiError=message;document.getElementById('notice').innerHTML=`<p class="error">${esc(message)}</p>`;}
async function measure(){
  uiError=null;
  // Each result is consumed once; retry only queries the same in-flight job.
  do{
    if(!view.development_mode)render();
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
  catch(error){showError(error.message+L(' Reintentar conserva el circuito y el job.',' Retrying keeps the circuit and the job.'));}
  finally{busy=false;render();focus();}
}
function actionButtons(g){return `<div class="actions">${g.actions.filter(a=>a.id!=='confirm').map(a=>`<button data-action="${a.id}" ${a.id==='accept'?'class="primary"':''}><span>${esc(actionLabel(a))}${a.id==='envido'&&g.pending?.kind==='truco'?L(' va primero',' goes first'):''}</span>${a.hint?`<small>${esc(actionHint(a))}</small>`:''}</button>`).join('')}</div>`;}
function bindActions(){stage.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));}
function languageSelect(id){
  return `<label class="language-switch"><span aria-hidden="true">🌐</span><span class="visually-hidden">${L('Idioma','Language')}</span><select id="${id}" data-language aria-label="${L('Idioma','Language')}"><option value="es" ${lang()==='es'?'selected':''}>Español</option><option value="en" ${lang()==='en'?'selected':''}>English</option></select></label>`;
}
function home(){
  const settings=`<div class="menu-settings"><div class="mixer-controls"><label><input id="disable-voices" type="checkbox" ${preferences.voices?'':'checked'}> ${L('Desactivar voces','Turn voices off')}</label><label>${L('Volumen de voces','Voice volume')}<input id="voice-volume" type="range" min="0" max="100" value="${Math.round(preferences.voiceVolume*100)}"></label></div><p id="audio-status">${esc(sound.status())}</p><p>${L('Las voces leen los cantos en español, como se dicen en la mesa.','Voices read the calls in Spanish, as they are said at the table.')}</p><p>${L('Los avisos esperan tu «Continuar». El botón ⏱ elige 1 s, 3 s, 7 s o avance manual.','Notices wait for your “Continue”. The ⏱ button picks 1 s, 3 s, 7 s or manual.')}</p></div>`;
  // Home (sketch by the team): logo, tagline and four plaques on the left; the Q card with its Bloch sphere on the right.
  stage.innerHTML=`<section class="home" aria-label="${L('Menú principal de Qriollo','Qriollo main menu')}"><img class="home-bg" src="${TABLE_ART}" alt="" draggable="false"><div class="home-tools">${languageSelect('menu-language')}<details class="menu-sound"><summary>🔊 ${L('Voces','Voices')}</summary>${settings}</details></div><div class="home-left"><h1 class="home-logo"><img src="${LOGO_ART}" alt="Qriollo" draggable="false"></h1><p class="home-tagline">${L('Una forma bien argenta de aprender computación cuántica','A truly Argentine way to learn quantum computing')}</p><nav class="home-menu" aria-label="${L('Opciones','Options')}"><button class="plaque" id="learn"><span>Tutorial</span></button><button class="plaque" id="quick"><span>${L('Partida rápida','Quick game')}</span></button><button class="plaque" id="values"><span>${L('Ayuda rápida','Quick help')}</span></button><button class="plaque" id="menu-credits"><span>${L('Créditos','Credits')}</span></button></nav><p class="home-links">${view.game?`<button class="home-link" id="resume">${L('Retomar partida','Resume game')}</button> · `:''}<button class="home-link" id="start">${L('Partida personalizada: nombres, nivel y privacidad','Custom game: names, level and privacy')}</button></p></div><figure class="home-card"><img src="${CARD_ART}" alt="${L('Carta Q con la esfera de Bloch: |0⟩ arriba, |1⟩ abajo y los ejes X, Y, Z','Q card with the Bloch sphere: |0⟩ on top, |1⟩ below and the X, Y, Z axes')}" draggable="false"><figcaption>${L('Esfera de Bloch','Bloch sphere')}</figcaption></figure></section>`;
  document.getElementById('disable-voices').onchange=e=>{savePreference('voices',!e.target.checked);sound.apply();};
  document.getElementById('voice-volume').oninput=e=>{savePreference('voiceVolume',Number(e.target.value)/100);sound.apply();};
  document.getElementById('start').onclick=()=>{screen='setup';render();focus();};
  document.getElementById('quick').onclick=quickGame;
  document.getElementById('learn').onclick=()=>openTutorial();
  document.getElementById('values').onclick=()=>{screen='values';render();focus();};
  document.getElementById('menu-credits').onclick=()=>{screen='credits';render();focus();};
  document.getElementById('resume')?.addEventListener('click',()=>{screen='game';action('public');});
}
// Quick game: default names, learning level and local Qiskit simulation, straight to the first hand.
async function quickGame(){
  if(busy)return;
  await action('dev_mode',true);if(view.error)return;
  screen='game';await action('new',{names:[L('Jugador 1','Player 1'),L('Jugador 2','Player 2')],privacy:false,difficulty:'normal'});focus();
}

function values(){
  stage.innerHTML=`<article class="panel help values-help"><div class="values-main"><p class="pill">${L('Consultá antes de jugar','Check before playing')}</p><h2>${L('Valores de las cartas','Card values')}</h2><p>${L('En el Truco la fuerza no sigue el número de la carta. De la más alta (1) a la más baja (14); las cartas de una misma fila empatan:','In Truco, strength does not follow the printed number. From highest (1) to lowest (14); cards on the same row tie:')}</p><div class="help-ladder">${ladderHtml()}</div></div><div class="values-side"><h3>${L('Tantos de Envido','Envido points (tantos)')}</h3><p>${L('Del 1 al 7, cada carta vale su número; el 10, 11 y 12 valen 0. Con dos cartas del mismo palo se suman sus valores más 20; con tres, se toman las dos mayores. Sin cartas del mismo palo, cuenta la de mayor valor.','From 1 to 7 a card is worth its number; 10, 11 and 12 are worth 0. Two cards of the same suit add their values plus 20; with three, take the best two. With no matching suits, the single highest value counts.')}</p><p>${L('Ejemplo: 7 y 6 del mismo palo suman 33. En un empate gana quien es mano.','Example: a 7 and a 6 of the same suit make 33. Ties go to the player who is mano.')}</p><h3>${L('La carta cuántica','The quantum card')}</h3><p>${L('Una vez medida, su identidad definitiva determina su fuerza y sus tantos. Antes de medir solo hay probabilidades; ser cuántica no le suma fuerza.','Once measured, its final identity sets its strength and its envido points. Before measuring there are only probabilities; being quantum adds no strength.')}</p><div class="actions"><button id="full-rules">${L('Ver reglas y cantos completos','See full rules and calls')}</button><button id="values-home" class="primary">${L('Volver al inicio','Back to the menu')}</button></div></div></article>`;
  document.getElementById('full-rules').onclick=()=>{screen='rules';render();focus();};
  document.getElementById('values-home').onclick=()=>{screen='home';render();focus();};
}
function setup(){
  stage.innerHTML=`<section class="panel setup-panel"><h2>${L('Compartir la mesa','Share the table')}</h2><p>${L('Dos jugadores, un dispositivo, a 15 puntos y sin Flor.','Two players, one device, to 15 points, no Flor.')}</p><form id="names"><div class="forms"><label>${L('Jugador 1','Player 1')}<input id="player-one" name="one" type="text" value="Alejo" maxlength="30" required autocomplete="off"></label><label>${L('Jugador 2','Player 2')}<input id="player-two" name="two" type="text" value="${L('Belén','Sam')}" maxlength="30" required autocomplete="off"></label></div><fieldset class="difficulty"><legend>${L('Nivel','Level')}</legend><label><input type="radio" name="difficulty" value="normal" checked> <strong>${L('Aprendizaje (normal)','Learning (normal)')}</strong><span class="setting-help">${L('Poné y sacá compuertas todas las veces que quieras antes de confirmar.','Add and remove gates as many times as you like before confirming.')}</span></label><label><input type="radio" name="difficulty" value="hard"> <strong>${L('Difícil','Hard')}</strong><span class="setting-help">${L('Podés sacar compuertas solo 2 veces por mano. Pensá el circuito antes de armarlo.','You may remove gates only twice per hand. Plan the circuit before building it.')}</span></label></fieldset><p class="callout">${view.host_local?L('Simulación local con Qiskit: partidas completas, sin IonQ.','Local Qiskit simulation: full games, no IonQ.'):esc(view.mode)}</p><label><input id="dev-mode" type="checkbox" ${view.development_mode?'checked':''} ${view.host_local?'disabled':''}> ${L('Simulación local con Qiskit (no IonQ; permite una partida completa)','Local Qiskit simulation (no IonQ; allows a full game)')}</label>${view.host_local?'':`<p class="sphere-caption">${L('IonQ es el modo por defecto en Qollab. Su límite de un job por ejecución impide mediciones sucesivas; no se cambia de modo automáticamente.','IonQ is the default mode on Qollab. Its one-job-per-run limit prevents successive measurements; the mode never switches automatically.')}</p>`}<label class="privacy-option"><input id="privacy-mode" type="checkbox"> ${L('Jugar con privacidad','Play with privacy')}</label><p class="sphere-caption">${L('Activado: la mano se oculta al pasar el dispositivo.','On: your hand is hidden when the device is passed.')}</p><button id="deal" class="primary" type="button">${L('Repartir primera mano','Deal the first hand')}</button></form></section>`;
  const deal=async()=>{if(busy)return;const names=['player-one','player-two'].map(id=>document.getElementById(id).value.trim());if(names.some(name=>!name)){showError(L('Escribí el nombre de ambos jugadores.','Enter both player names.'));return;}const privacy=document.getElementById('privacy-mode').checked;const dev=document.getElementById('dev-mode').checked;const difficulty=document.querySelector('[name="difficulty"]:checked').value;await action('dev_mode',dev);if(view.error)return;screen='game';await action('new',{names,privacy,difficulty});focus();};
  document.getElementById('deal').onclick=deal;
  document.getElementById('names').onsubmit=event=>{event.preventDefault();deal();};
}
function handoff(g){
  stage.innerHTML+=`<section class="panel neutral"><p class="lock" aria-hidden="true">◈</p><h2>${isYou(g.names[g.actor])?L('Tu turno','Your turn'):L(`Turno de ${esc(g.names[g.actor])}`,`${esc(g.names[g.actor])}'s turn`)}</h2><p>${L('Pasale el dispositivo y asegurate de que el rival no esté mirando.','Pass the device and make sure your opponent is not looking.')}</p><label><input type="checkbox" id="alone"> ${L('Estoy listo para ver mi información privada','I am ready to see my private information')}</label><div class="actions" style="justify-content:center"><button id="reveal" class="primary" disabled>${L('Revelar mi mano','Reveal my hand')}</button></div></section>`;
  document.getElementById('alone').onchange=e=>document.getElementById('reveal').disabled=!e.target.checked;
  document.getElementById('reveal').onclick=()=>action('reveal');
}
function editor(g,priv){
  const q=priv.quantum,left=priv.removals_left,limited=left!==null&&left!==undefined,blocked=limited&&left===0;
  const composing=!!q&&quantumOpen;
  // With the composer open, Bot Q speaks inside the dialog only (the page behind is inert).
  stage.innerHTML+=layout(table(g,{art:TABLE_ART,cards:priv.cards,quantum:q,prepare:true}),view.coach?(composing?'':coachPanel(view.coach)):turnGuide(g,priv));
  stage.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>action('choose',Number(b.dataset.card)));
  const activate=document.getElementById('activate-quantum');
  if(activate)activate.onclick=()=>{quantumOpen=true;render();focus();};
  if(!q||!quantumOpen)return;
  const allGates=['H','X','Z','RX:pi/2','RY:pi/2','RZ:pi/2'];
  stage.innerHTML+=`<dialog id="composer-dialog" class="overlay quantum-composer" aria-label="${L('Compositor de la carta cuántica','Quantum card composer')}"><button id="close-composer" class="close-composer">${L('Volver a la mesa ×','Back to the table ×')}</button>${view.coach?coachPanel(view.coach):''}<h2>${L('Una carta, dos resultados posibles','One card, two possible results')}</h2><p class="composer-intro">${L('Ambas conservan el número. Las fichas cambian sus probabilidades; la medición elige una identidad definitiva.','Both keep the number. Tokens change their probabilities; the measurement picks one final identity.')}</p>${quantumOptions(q)}<div class="composer-layout"><section class="circuit-workbench" aria-label="${L('Circuito y esfera','Circuit and sphere')}">${circuitStrip(q.preview.gates,{locked:blocked})}<div class="composer-sphere">${sphere(q.preview,null,'composer-'+cardName(q.original))}</div></section><aside class="gate-rack" aria-label="${L('Cuatro fichas privadas','Four private tokens')}"><h2>${L('Tus compuertas','Your gates')}</h2><div class="rack-frame">${q.tokens.map((token,i)=>`<button class="gate-tile gate-${token[0]}" style="${gateStyle(token)}" data-token="${i}" title="${esc(gateHelpPlain(token))}" aria-label="${L('Agregar','Add')} ${esc(gateLabel(token))}, ${L('ficha','token')} ${i+1}: ${esc(gateHelpPlain(token))}" ${q.sequence.includes(i)||q.sequence.length===3?'disabled':''}><span>${esc(gateLabel(token))}</span><small>${L('Ficha','Token')} ${i+1}</small></button>`).join('')}</div><p>${L('Hasta 3 compuertas. Cada ficha, una vez.','Up to 3 gates. Each token once.')}</p>${limited?`<p class="removals ${blocked?'none-left':''}" role="status">${L(`Modo difícil · retiros restantes: <strong>${left}</strong> de 2`,`Hard mode · removals left: <strong>${left}</strong> of 2`)}</p>`:''}</aside></div><div class="composer-controls">${(uiError||view.error)?`<p class="error" role="alert">${esc(uiError||view.error)}</p>`:''}<div class="actions"><button id="undo" ${q.sequence.length&&!blocked?'':'disabled'}>${L('Deshacer','Undo')}</button><button id="reset" ${q.sequence.length&&!blocked?'':'disabled'}>${L('Reiniciar','Reset')}</button><button id="lock-circuit" class="primary">${L('Confirmar','Confirm')}</button></div><p class="sphere-caption">${L('Al confirmar, el circuito queda fijo durante la mano. Leelo de izquierda a derecha; editar no mide la carta. Sin fichas, la carta sigue siendo la original.','Once confirmed, the circuit stays fixed for the hand. Read it left to right; editing does not measure the card. With no tokens, the card stays the original.')}</p><details class="gate-help"><summary>${L('¿Qué hace cada ficha?','What does each token do?')}</summary><ul>${allGates.map(gate=>`<li>${gateHelp(gate)}</li>`).join('')}<li>${L('RX, RY y RZ también aparecen con 30°, −30° y 60°: giran menos sobre el mismo eje.','RX, RY and RZ also come at 30°, −30° and 60°: smaller turns around the same axis.')}</li></ul></details>${technical(q.preview)}</div></dialog>`;
  document.getElementById('close-composer').onclick=()=>{quantumOpen=false;render();focus();};
  document.getElementById('activate-quantum').onclick=()=>{quantumOpen=true;render();focus();};
  // Rebind after replacing markup with +=.
  stage.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>action('choose',Number(b.dataset.card)));
  stage.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>action('edit',[...q.sequence,Number(b.dataset.token)]));
  stage.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>action('edit',q.sequence.filter((_,i)=>i!==Number(b.dataset.remove))));
  for(const direction of ['left','right'])stage.querySelectorAll(`[data-${direction}]`).forEach(b=>b.onclick=()=>{const i=Number(b.dataset[direction]),j=i+(direction==='left'?-1:1),seq=[...q.sequence];[seq[i],seq[j]]=[seq[j],seq[i]];action('edit',seq);});
  document.getElementById('undo').onclick=()=>action('edit',q.sequence.slice(0,-1));
  document.getElementById('reset').onclick=()=>action('edit',[]);
  document.getElementById('lock-circuit').onclick=()=>action('confirm');
}
function publicSummary(g){
  const report=g.report;
  if(!report)return '';
  return `<section class="panel public-summary"><p class="pill">${L('Resumen público · Mano','Public summary · Hand')} ${g.hand}</p>${handSummary(g)}<div class="player-summaries">${report.quantum.map((q,p)=>{
    const result=q?.result===null?L('Terminó sin medir','Ended unmeasured'):q?cardName(q.result?q.linked:q.original):L('Sin carta cuántica','No quantum card');
    return `<article class="player-summary"><h3>${esc(g.names[p])}</h3><p>${L('Resultado cuántico','Quantum result')}: <strong>${esc(result)}</strong></p><p>${L('Cartas','Cards')}: ${report.cards?.[p].map(c=>`${esc(cardName(c.effective))}${c.quantum?' (Q)':''}`).join(' · ')||'—'}</p><p>${L('Circuito','Circuit')}: ${q?.preview.gates.map(gateLabel).map(esc).join(' → ')||L('Sin compuertas','No gates')}</p>${g.envido?`<p>Envido: <strong>${g.envido.values[p]} ${L('tantos','points')}</strong></p>`:''}${q?`<details><summary>${isYou(g.names[p])?L('Ampliar tus detalles','More details about your card'):`${L('Ampliar detalles de','More details for')} ${esc(g.names[p])}`}</summary>${quantumReport(q)}</details>`:''}</article>`;
  }).join('')}</div>${g.phase==='match_end'?`<details><summary>${L('Manos anteriores','Previous hands')} (${g.history.length})</summary>${g.history.map(h=>`<details><summary>${L('Mano','Hand')} ${h.hand} · ${h.scores.join(' / ')}</summary>${h.quantum.map((q,p)=>`<h3>${esc(g.names[p])}</h3>${quantumReport(q)}`).join('')}</details>`).join('')}</details><button id="download">${L('Descargar informe JSON','Download JSON report')}</button>`:''}<button id="close-summary">${L('Volver al resultado','Back to the result')}</button></section>`;
}
function resultScreen(g){
  const match=g.phase==='match_end',loser=1-g.winner;
  if(view.coach)stage.innerHTML+=coachPanel(view.coach);
  stage.innerHTML+=`<section class="panel outcome" aria-label="${match?L('Resultado de la partida','Match result'):L('Resultado de la mano','Hand result')}"><p class="pill">${match?L('Partida terminada','Match over'):view.guided?L('Tutorial · mano terminada','Tutorial · hand over'):L('Mano terminada','Hand over')}</p><h2>${isYou(g.names[g.winner])?L('¡Ganaste!','You win!'):L(`Victoria de ${esc(g.names[g.winner])}`,`${esc(g.names[g.winner])} wins`)}</h2><p class="defeat">${isYou(g.names[loser])?L('Perdiste','You lose'):L(`Derrota de ${esc(g.names[loser])}`,`${esc(g.names[loser])} loses`)}</p><p>${g.names.map((n,p)=>`${esc(n)}: ${g.scores[p]}`).join(' · ')}</p><div class="actions">${view.guided&&!view.coach?.final?'':`<button id="view-summary" class="primary">${L('Ver resumen','See summary')}</button>`}${match?`<button id="again">${L('Nueva partida','New game')}</button>`:view.coach?.final?'':actionButtons(g)}</div></section>`;
  if(summaryOpen)stage.innerHTML+=publicSummary(g);
  const viewSummary=document.getElementById('view-summary');if(viewSummary)viewSummary.onclick=()=>{summaryOpen=true;render();stage.querySelector('.public-summary')?.scrollIntoView({block:'start',behavior:reducedMotion()?'instant':'smooth'});};
  document.getElementById('close-summary')?.addEventListener('click',()=>{summaryOpen=false;render();focus();});
  document.getElementById('again')?.addEventListener('click',()=>{screen='setup';render();});
  document.getElementById('download')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(g.history,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='truco-cuantico-report.json';a.click();URL.revokeObjectURL(url);});
  bindActions();
}
const CALLS={envido:'Envido',real:'Real Envido',falta:'Falta Envido'};
// Desktop layout: the table fills the left column; guidance and calls live in the side panel.
const layout=(tableHtml,side)=>`<div class="game-layout"><div class="table-wrap">${tableHtml}</div><aside class="side-panel">${side}</aside></div>`;
function game(){
  const g=view.game;
  if(!g){screen='setup';setup();return;}
  stage.innerHTML=`<p class="round-meta">${esc(g.names[0])}: ${g.scores[0]} · ${esc(g.names[1])}: ${g.scores[1]} · ${L('Mano','Hand')} ${g.hand} · ${view.guided?L('Práctica con Bot Q','Practice with Bot Q'):g.difficulty==='hard'?L('Nivel difícil','Hard level'):L('Nivel aprendizaje','Learning level')}</p>`;
  if(presentation){
    if(presentation.type==='flip'){
      stage.innerHTML+=layout(table(g,{art:TABLE_ART,cards:view.private?.cards,quantum:view.private?.quantum,prepare:g.phase==='prepare',faceDown:presentation.faceDown,flip:!presentation.faceDown}),`<p class="turn-banner" role="status">${isYou(g.names[g.actor])?L('Tu turno','Your turn'):L(`Turno de ${esc(g.names[g.actor])}`,`${esc(g.names[g.actor])}'s turn`)}</p>`);return;
    }
    return;
  }
  if(['match_end','hand_end'].includes(g.phase)){resultScreen(g);return;}
  if(g.phase==='measure'){
    stage.innerHTML+=`<section class="panel neutral"><h2>${g.public_measurement?L('Midiendo la carta','Measuring the card'):L('Resolviendo el Envido','Settling the Envido')}</h2><p role="status">${L('Esperando el resultado de la medición.','Waiting for the measurement result.')}</p><button id="retry">${L('Reintentar consulta del mismo job','Retry the same job')}</button></section>`;document.getElementById('retry').onclick=retryMeasure;return;
  }
  if(!revealed){handoff(g);return;}
  const priv=view.private||{};
  if(g.phase==='prepare'){editor(g,priv);return;}
  let side=view.coach?coachPanel(view.coach):turnGuide(g,priv);
  if(g.pending)side+=`<section class="panel pending-call"><h2>${isYou(g.names[g.actor])?L('Te toca responder','Your answer'):L(`Respuesta de ${esc(g.names[g.actor])}`,`${esc(g.names[g.actor])} must answer`)}</h2><p>${isYou(g.names[g.pending.proposer])?L('Propusiste','You called'):L(`${esc(g.names[g.pending.proposer])} propone`,`${esc(g.names[g.pending.proposer])} calls`)} ${g.pending.kind==='envido'?g.pending.chain.map(c=>CALLS[c]).join(' → '):({2:'Truco',3:'Retruco',4:'Vale Cuatro'}[g.pending.level])}.</p></section>`;
  if(priv.quantum)side+=quantumStatus(priv.quantum,g.names[g.actor]);
  side+=actionButtons(g);
  if(g.envido)side+=`<p class="callout envido-result">Envido: ${esc(g.names[0])} ${g.envido.values[0]} · ${esc(g.names[1])} ${g.envido.values[1]}. ${isYou(g.names[g.envido.winner])?L('Ganaste','You won'):`${L('Ganó','Won by')} ${esc(g.names[g.envido.winner])}`}: +${g.envido.points}.</p>`;
  side+=`<details class="timeline-box"><summary>${L('Línea temporal pública','Public timeline')}</summary><div class="timeline">${g.events.map(e=>`<p>${esc(e.kind==='speech'?displayText(e):eventText(e.text))} ${e.player!==undefined?'· '+esc(g.names[e.player]):''} ${e.points?'+ '+e.points+' '+L('puntos','points'):''}</p>`).join('')}</div></details>`;
  stage.innerHTML+=layout(table(g,{art:TABLE_ART,cards:priv.cards,quantum:priv.quantum}),side);
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
async function openTutorial(){screen='learn';render();focus();}
let slideIndex=0,slideState={};
// Slides before the guided match: rules, suits, ladder and a duel to practise.
function openSlides(){slideIndex=0;slideState={};screen='slides';render();focus();}
function slides(){
  stage.innerHTML=slideHtml(slideIndex,slideState);
  const go=i=>{slideIndex=i;slideState={};render();focus();stage.scrollTo?.(0,0);};
  document.getElementById('slide-prev').onclick=()=>go(slideIndex-1);
  document.getElementById('slide-next').onclick=()=>slideIndex<SLIDES.length-1?go(slideIndex+1):startTrucoTutorial();
  document.getElementById('slide-skip').onclick=startTrucoTutorial;
  stage.querySelectorAll('[data-suit]').forEach(b=>b.onclick=()=>{slideState.suit=Number(b.dataset.suit);render();});
  stage.querySelector('[data-quick-help]')?.addEventListener('click',()=>{screen='values';render();focus();});
  stage.querySelector('[data-baza-next]')?.addEventListener('click',()=>{slideState.step=(slideState.step||0)+1;render();});
  stage.querySelector('[data-baza-reset]')?.addEventListener('click',()=>{slideState.step=0;render();});
  stage.querySelector('[data-call-truco]')?.addEventListener('click',()=>{slideState.called=true;sound.speak('¡Truco!');render();});
  stage.querySelector('[data-call-envido]')?.addEventListener('click',()=>{slideState.called=true;sound.speak('Envido');render();});
  stage.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{slideState.example=Number(b.dataset.example);slideState.counted=false;render();});
  stage.querySelector('[data-count]')?.addEventListener('click',()=>{slideState.counted=true;render();});
  stage.querySelectorAll('[data-gate]').forEach(b=>b.onclick=()=>{slideState.gate=Number(b.dataset.gate);delete slideState.measured;render();});
  stage.querySelector('[data-measure]')?.addEventListener('click',()=>{slideState.measured=Math.random()<quantumOdds(slideState.gate??0)?0:1;render();});
  stage.querySelector('[data-measure-reset]')?.addEventListener('click',()=>{delete slideState.measured;render();});
  stage.querySelectorAll('[data-number]').forEach(b=>b.onclick=()=>{slideState.number=Number(b.dataset.number);render();});
  stage.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{slideState.answer=b.dataset.reply;render();});
  stage.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    const round=slideState.round||0,ok=b.dataset.pick===duelAnswer(round);
    slideState.feedback={ok,why:duelWhy(round)};render();
    if(ok)setTimeout(()=>{if(screen==='slides'&&(slideState.round||0)===round){slideState.round=round+1;slideState.feedback=null;render();}},reducedMotion()?600:1600);
  });
  const pop=document.getElementById('term-popover');
  stage.querySelectorAll('[data-term]').forEach(b=>b.onclick=event=>{
    event.stopPropagation();
    if(!pop.hidden&&pop.dataset.term===b.dataset.term){pop.hidden=true;return;}
    const {name,text}=definition(b.dataset.term);
    pop.innerHTML=`<strong>${esc(name)}</strong><p>${esc(text)}</p>`;pop.dataset.term=b.dataset.term;pop.hidden=false;
    const box=b.getBoundingClientRect(),host=pop.offsetParent.getBoundingClientRect();
    pop.style.left=Math.max(8,Math.min(box.left-host.left,host.width-300))+'px';pop.style.top=(box.bottom-host.top+6)+'px';
  });
  stage.querySelector('.slide').onclick=event=>{if(!event.target.closest('[data-term],#term-popover'))pop.hidden=true;};
}
async function startTrucoTutorial(){screen='game';revealed=false;summaryOpen=false;await action('tutorial');focus();}
async function openLesson(index){lessonCircuit=0;screen='lessons';await action('lesson',index);focus();}
// Tutorial hub: the Truco match with Bot Q first, then the gates and the Bloch sphere.
function learn(){
  const running=view.guided&&view.game&&!view.coach?.final;
  stage.innerHTML=`<section class="tutorial-hub" aria-label="Tutorial"><article class="panel hub-card"><span class="hub-number">1</span><h2>${L('Truco con Bot Q','Truco with Bot Q')}</h2><p>${L('Primero, diapositivas con las reglas: cartas, escala, bazas, Truco, Envido y la carta cuántica. Después, una práctica de cuatro manos contra Bot Q con desafíos y preguntas rápidas. En la última mano usás la carta cuántica.','First, slides with the rules: cards, ladder, bazas, Truco, Envido and the quantum card. Then a four-hand practice against Bot Q with challenges and quick questions. In the last hand you use the quantum card.')}</p><p class="hub-meta">${L('17 diapositivas y 33 pasos de práctica · unos 15 minutos','17 slides and 33 practice steps · about 15 minutes')}</p><div class="actions">${running?`<button id="hub-resume" class="primary">${L('Retomar','Resume')}</button><button id="hub-restart">${L('Empezar de nuevo','Start over')}</button>`:`<button id="hub-truco" class="primary">${L('Empezar','Start')}</button>`}</div></article><article class="panel hub-card"><span class="hub-number">2</span><h2>${L('Compuertas y esfera de Bloch','Gates and the Bloch sphere')}</h2><p>${axes(esc(L('Qué hace cada ficha, sobre qué eje gira ([X], [Y] o [Z]), cuándo cambia la fase y las combinaciones más importantes, con la esfera animada.','What each token does, which axis it turns around ([X], [Y] or [Z]), when it changes the phase and the most important combinations, with an animated sphere.')))}</p><p class="hub-meta">${L('9 lecciones','9 lessons')}</p><div class="actions"><button id="hub-gates" class="primary">${L('Abrir lecciones','Open the lessons')}</button></div></article></section>`;
  document.getElementById('hub-truco')?.addEventListener('click',openSlides);
  document.getElementById('hub-restart')?.addEventListener('click',openSlides);
  document.getElementById('hub-resume')?.addEventListener('click',()=>{screen='game';action('public');});
  document.getElementById('hub-gates').onclick=()=>openLesson(view.lesson?.index??0);
}
const percentText=v=>L((100*v).toFixed(1).replace('.',',')+' %',(100*v).toFixed(1)+'%');
function lessons(){
  const t=view.lesson;
  if(!t){openLesson(0);return;}
  const index=Math.min(lessonCircuit,t.circuits.length-1),c=t.circuits[index],p=c.preview;
  const gates=[...new Set(p.gates)];
  stage.innerHTML=`<article class="panel lesson" aria-label="${L('Lección de compuertas','Gates lesson')}"><header class="lesson-head"><p class="coach-step">${L(`Lección ${t.index+1} de ${t.total}`,`Lesson ${t.index+1} of ${t.total}`)}</p><h2>${esc(L(t.title,t.title_en))}</h2><nav class="lesson-dots" aria-label="${L('Lecciones','Lessons')}">${Array.from({length:t.total},(_,i)=>`<button data-lesson="${i}" class="${i===t.index?'current':''}" aria-label="${L('Lección','Lesson')} ${i+1}" ${i===t.index?'aria-current="step"':''}>${i+1}</button>`).join('')}</nav></header><div class="lesson-body"><section class="lesson-text"><p>${axes(esc(L(t.text,t.text_en)))}</p><p class="callout analogy"><strong>${L('En el juego','In the game')}:</strong> ${axes(esc(L(t.analogy,t.analogy_en)))}</p><div class="circuit-tabs" role="tablist" aria-label="${L('Ejemplos','Examples')}">${t.circuits.map((item,i)=>`<button role="tab" data-circuit="${i}" aria-selected="${i===index}" class="${i===index?'current':''}">${item.preview.gates.length?item.preview.gates.map(gateLabel).map(esc).join(' · '):'|0⟩'}</button>`).join('')}</div>${gates.length?`<ul class="lesson-gates">${gates.map(g=>`<li style="${gateStyle(g)}">${gateHelp(g)}</li>`).join('')}</ul>`:''}</section><section class="gate-demo" aria-label="${L('Ejemplo animado','Animated example')}">${circuitStrip(p.gates)}<div class="demo-sphere">${sphere(p,null,`lesson-${t.index}-${index}`,null,true,{speed:70,loop:true})}</div><p class="demo-caption">${axes(esc(L(c.caption,c.caption_en)))}</p><div class="demo-odds">${[0,1].map(bit=>`<div class="odds-row"><span>${bit?L('Ligada |1⟩','Linked |1⟩'):L('Original |0⟩','Original |0⟩')}</span><div class="probability-track"><span style="width:${100*p.probabilities[bit]}%"></span></div><strong>${percentText(p.probabilities[bit])}</strong></div>`).join('')}</div><p class="sphere-caption">${axes(`[X]=${p.bloch[0].toFixed(2)} · [Y]=${p.bloch[1].toFixed(2)} · [Z]=${p.bloch[2].toFixed(2)}`)}</p><button data-replay>${L('Repetir animación','Replay animation')}</button></section></div><footer class="actions lesson-nav"><button id="lesson-prev" ${t.index===0?'disabled':''}>${L('← Anterior','← Previous')}</button><button id="lesson-hub">${L('Volver a tutoriales','Back to tutorials')}</button><button id="lesson-next" class="primary" ${t.index===t.total-1?'disabled':''}>${L('Siguiente →','Next →')}</button></footer></article>`;
  stage.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>openLesson(Number(b.dataset.lesson)));
  stage.querySelectorAll('[data-circuit]').forEach(b=>b.onclick=()=>{lessonCircuit=Number(b.dataset.circuit);render();});
  document.getElementById('lesson-prev').onclick=()=>openLesson(t.index-1);
  document.getElementById('lesson-next').onclick=()=>openLesson(t.index+1);
  document.getElementById('lesson-hub').onclick=()=>{screen='learn';render();focus();};
}
// Bot Q's explanation for the current tutorial step. Without 'expect' the player advances with «Siguiente».
function coachPanel(c){
  const controls=c.final?`<button id="coach-gates" class="primary">${L('Compuertas y esfera de Bloch','Gates and the Bloch sphere')}</button><button id="coach-play">${L('Jugar una partida','Play a game')}</button><button id="coach-home">${L('Volver al inicio','Back to the menu')}</button>`:`${c.expect||c.quiz?'':`<button id="coach-next" class="primary">${L('Siguiente','Next')}</button>`}<button id="coach-exit">${L('Salir del tutorial','Leave the tutorial')}</button>`;
  return `<aside class="coach" aria-label="${L('Práctica con Bot Q','Practice with Bot Q')}" aria-live="polite"><span class="coach-avatar" aria-hidden="true">Q</span><div><p class="coach-step">${L(`Práctica · paso ${c.step} de ${c.total}`,`Practice · step ${c.step} of ${c.total}`)}</p>${c.feedback?`<p class="coach-feedback ${c.feedback.ok?'ok':'bad'}" role="status">${c.feedback.ok?'✓':'✗'} ${esc(L(c.feedback.text,c.feedback.text_en))}</p>`:''}<h2>${c.challenge?`<span class="coach-badge">${L('Desafío','Challenge')}</span>`:''}${esc(L(c.title,c.title_en||c.title))}</h2><p>${axes(esc(L(c.text,c.text_en||c.text)))}</p>${c.quiz?`<div class="coach-quiz">${c.quiz.options.map((o,i)=>`<button data-quiz="${i}">${esc(L(o.es,o.en))}</button>`).join('')}</div>`:''}<div class="actions">${controls}</div></div></aside>`;
}
// Highlights the explained element and leaves only the expected control enabled.
function applyCoach(){
  const c=view?.coach;
  if(screen!=='game'||!c||presentation)return;
  const target=c.target?stage.querySelector(c.target):null;
  target?.classList.add('coach-target');
  const [expected,value]=c.expect||[];
  // In a challenge every legal move stays available: the server answers wrong ones with a hint.
  if(!c.challenge){
    stage.querySelectorAll('[data-action]').forEach(b=>{if(b.dataset.action!==expected)b.disabled=true;});
    stage.querySelectorAll('[data-card]').forEach(b=>{if(!['play','choose'].includes(expected)||Number(b.dataset.card)!==value){b.disabled=true;b.draggable=false;}});
  }
  stage.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>action('coach_next',Number(b.dataset.quiz)));
  // Quantum hand: only the highlighted token, or Confirm, stays available.
  const composer=document.getElementById('composer-dialog');
  stage.querySelectorAll('[data-token]').forEach(b=>{if(expected!=='edit'||Number(b.dataset.token)!==value.at(-1))b.disabled=true;});
  stage.querySelectorAll('#undo,#reset,[data-remove],[data-left],[data-right]').forEach(b=>b.disabled=true);
  const lock=document.getElementById('lock-circuit');if(lock&&expected!=='confirm')lock.disabled=true;
  const activate=document.getElementById('activate-quantum');
  if(activate){activate.disabled=!!composer||!['edit','confirm'].includes(expected);if(!activate.disabled)activate.classList.add('coach-target');}
  document.getElementById('close-composer')?.toggleAttribute('disabled',['edit','confirm'].includes(expected));
  document.getElementById('coach-next')?.addEventListener('click',()=>action('coach_next'));
  document.getElementById('coach-exit')?.addEventListener('click',()=>{screen='home';render();focus();});
  document.getElementById('coach-home')?.addEventListener('click',()=>{screen='home';render();focus();});
  document.getElementById('coach-play')?.addEventListener('click',()=>{screen='setup';render();focus();});
  document.getElementById('coach-gates')?.addEventListener('click',()=>openLesson(0));
  if(target){const box=target.getBoundingClientRect();if(box.top<0||box.bottom>innerHeight)target.scrollIntoView({block:'center',behavior:reducedMotion()?'instant':'smooth'});}
}
let rulesPage=0;
// The rules are split into tabs (one h3 section per page) so each fits on screen.
function rules(){
  stage.innerHTML=rulesContent(lang());
  const article=stage.querySelector('.rules-guide');
  const intro=[...article.children].findIndex(el=>el.tagName==='H3');
  const sections=[];let current=null;
  for(const el of [...article.children].slice(intro)){
    if(el.tagName==='H3'){current=document.createElement('section');current.className='rules-section';sections.push(current);el.before(current);}
    if(current&&el.tagName!=='DETAILS')current.append(el);
  }
  rulesPage=Math.min(rulesPage,sections.length-1);
  const tabs=document.createElement('nav');tabs.className='rules-tabs';tabs.setAttribute('aria-label',L('Secciones','Sections'));
  sections.forEach((section,i)=>{section.hidden=i!==rulesPage;const b=document.createElement('button');b.textContent=section.querySelector('h3').textContent;b.className=i===rulesPage?'current':'';b.setAttribute('aria-pressed',String(i===rulesPage));b.onclick=()=>{rulesPage=i;render();};tabs.append(b);});
  sections[0]?.before(tabs);
}
function credits(){
  stage.innerHTML=`<article class="panel help credits-page"><h2>Qriollo · ${VERSION}</h2><p class="credits-intro">${L('Aprender computación cuántica jugando al Truco.','Learning quantum computing by playing Truco.')}</p><p>${L('Un proyecto de','A project by')} <a href="${REPOSITORY_URL}" target="_blank" rel="noopener">Guido Miniero Cocco, Alejo Dellape ${L('y','and')} Gaspar Osterrieth</a>. ${L('El equipo aportó los diseños del menú, la mesa y las cartas.','The team contributed the menu, table and card designs.')}</p><dl><dt>${L('Motor cuántico','Quantum engine')}</dt><dd>${L('Qiskit: estados, compuertas y mediciones.','Qiskit: states, gates and measurements.')}</dd><dt>${L('Esfera interactiva','Interactive sphere')}</dt><dd>${L('Adaptada de','Adapted from')} <a href="https://qollab.xyz/u/qollab/interactive-bloch-sphere" target="_blank" rel="noopener">Interactive Bloch Sphere, Qollab</a>.</dd><dt>${L('Voces','Voices')}</dt><dd>${L('Los cantos se leen con las voces disponibles en el dispositivo.','Calls are read with the voices available on the device.')}</dd><dt>${L('Desarrollo','Development')}</dt><dd>${L('Código, pruebas y documentación con asistencia de OpenAI Codex y Claude (Anthropic). Fondo preparado con la herramienta de imágenes de OpenAI.','Code, tests and documentation with assistance from OpenAI Codex and Claude (Anthropic). Background prepared with OpenAI’s image tool.')}</dd></dl><p>This effort is supported by Qollab &amp; IonQ.</p><p>${L('Código original: MIT. Los recursos aportados y la esfera tienen avisos separados en','Original code: MIT. Contributed assets and the sphere have separate notices in')} <a href="${REPOSITORY_URL}/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener">Third-party notices</a>.</p><details><summary>${L('Video y funcionamiento técnico','Video and technical notes')}</summary><p>${L('El video de 56 segundos documenta una versión anterior. Las partidas completas usan simulación local con Qiskit; la ejecución IonQ disponible en Qollab admite un solo job por sesión.','The 56-second video documents an earlier version. Full games use local Qiskit simulation; the IonQ run available on Qollab allows one job per session.')}</p><button id="demo-button">${L('Ver video histórico','Watch the earlier video')}</button><div id="demo-view"></div></details></article>`;
  document.getElementById('demo-button').onclick=async()=>{const d=await api('demo_json');if(d.error){showError(d.error);return;}document.getElementById('demo-view').innerHTML=`<video controls preload="metadata" aria-label="${L('Video histórico','Earlier video')}" src="data:video/mp4;base64,${d.data}"></video><details><summary>${L('Transcripción','Transcript')}</summary><pre>${esc(d.transcript)}</pre></details>`;};
}
// Static chrome (header, navigation, footer) follows the chosen language too.
function chrome(){
  document.documentElement.lang=lang();
  const text={'.skip':L('Saltar al juego','Skip to the game'),'.eyebrow':L('QUANTUM PLAYGROUND · DOS PERSONAS, UNA MESA','QUANTUM PLAYGROUND · TWO PLAYERS, ONE TABLE'),'#home':L('Inicio','Home'),'#tutorial':L('Tutorial con Bot Q','Tutorial with Bot Q'),'#rules':L('Cómo jugar','How to play'),'#credits':L('Créditos','Credits'),'#motion-label':L('Reducir animaciones','Reduce motion')};
  for(const [selector,value] of Object.entries(text)){const el=document.querySelector(selector);if(el)el.textContent=value;}
  const title=document.querySelector('.brand h1');if(title)title.innerHTML=L('Truco <em>Cuántico</em>','Quantum <em>Truco</em>');
  const repo=document.getElementById('repo');if(repo&&REPOSITORY_URL)repo.innerHTML=`<a href="${REPOSITORY_URL}" target="_blank" rel="noopener">${L('Repositorio','Repository')}</a>`;
  const footer=document.getElementById('footer-license');if(footer)footer.textContent=`v${VERSION} · `+L('MIT (código propio) · Circuitos de un qubit · ','MIT (original code) · One-qubit circuits · ');
  const select=document.getElementById('language');if(select)select.value=lang();
}
function setLanguage(value){
  if(!['es','en'].includes(value)||value===lang())return;
  savePreference('language',value);chrome();render();
  sound.apply();
}
function render(){
  const scroll={x:window.scrollX,y:window.scrollY};
  stage.classList.remove('waiting');
  document.getElementById('notice').innerHTML=(uiError||view.error)?`<p class="error">${esc(uiError||view.error)}</p>`:'';
  document.querySelector('.app-shell').classList.toggle('landing',screen==='home');
  document.querySelector('.app-shell').classList.toggle('playing',screen==='game');
  // The public summary is longer than the window: the stage scrolls while it is open.
  document.querySelector('.app-shell').classList.toggle('summary-open',screen==='game'&&summaryOpen);
  ({home,setup,game,rules,credits,values,learn,lessons,slides}[screen]||home)();
  applyCoach();
  const composer=document.getElementById('composer-dialog');
  if(composer){composer.showModal();composer.oncancel=e=>{e.preventDefault();quantumOpen=false;render();focus();};}
  mountBloch(stage);
  mountFusionCards(stage);
  stage.setAttribute('aria-busy',String(busy));
  if(busy)stage.querySelectorAll('button,input,select').forEach(control=>{if(!control.hasAttribute('data-skip-presentation')&&!control.hasAttribute('data-presentation-timer'))control.disabled=true;});
  stage.querySelectorAll('[data-language]').forEach(select=>select.onchange=event=>setLanguage(event.target.value));
  if(screen==='game')window.scrollTo({left:scroll.x,top:scroll.y,behavior:'instant'});
}
for(const id of ['home','tutorial','rules','credits'])document.getElementById(id).onclick=()=>{if(busy)return;revealed=false;if(id==='tutorial')openTutorial();else{screen=id;render();focus();}};
document.getElementById('language').onchange=event=>setLanguage(event.target.value);
document.getElementById('motion').onchange=e=>{document.querySelector('.app-shell').classList.toggle('reduced',e.target.checked);};
// The sound popover on the menu closes when you touch anywhere else.
document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.stopVoice();});
document.addEventListener('pointerdown',event=>document.querySelectorAll('.menu-sound[open]').forEach(d=>{if(!d.contains(event.target))d.open=false;}));
document.documentElement.style.setProperty('--table-art',`url("${TABLE_ART}")`);
document.documentElement.style.setProperty('--cards-art',`url("${CARDS_ART}")`);
chrome();
try{setView(await send('public'));render();}
catch(error){showError(L('No se pudo cargar el juego. Comprobá que el servidor esté activo y recargá la página. ','The game could not load. Check that the server is running and reload the page. ')+error.message);stage.innerHTML=`<section class="panel"><h2>${L('El juego todavía no pudo conectarse','The game could not connect yet')}</h2><p>${L('Volvé a cargar la página cuando la conexión se restablezca. Si el servidor sigue activo, tu sesión se conserva.','Reload the page once the connection is back. If the server is still running, your session is kept.')}</p><button id="reload-game">${L('Volver a intentar','Try again')}</button></section>`;document.querySelectorAll('nav button').forEach(button=>button.disabled=true);document.getElementById('reload-game').onclick=()=>location.reload();}

// Keep the Qollab run alive while interactive controls need its injected backend.
// The documented runtime has no run time limit; Stop terminates this session.
if(typeof backend !== 'undefined') await new Promise(() => {});
