import {gateColorName,gateStyle} from './gate-colors.js';
export {gateStyle};
import {gateLabel,gateDescription,rotation} from './gates.js';
import {L,cardName,axes,isYou} from './i18n.js';
// User-provided deck views and dependency-free Qiskit Bloch rendering.
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Escaped help text with coloured axis letters, for HTML contexts.
export const gateHelp = gate => axes(esc(gateDescription(gate)));
export const gateHelpPlain = gate => gateDescription(gate).replace(/\[(X|Y|Z)\]/g,'$1');
const ranks=[1,2,3,4,5,6,7,10,11,12];
const columns=[49,134,218,303,386,470,553,637,720,803];
const rows={espada:25,basto:159,copa:291,oro:424};
export function faceStyle(c){
  const x=columns[ranks.indexOf(c.number)],y=rows[c.suit],w=78,h=125;
  return `background-size:${1024/w*100}% ${572/h*100}%;background-position:${x/(1024-w)*100}% ${y/(572-h)*100}%;`;
}
export function card(c, label='', selected=false, action=null) {
  const tag=action?'button':'div';
  return `<${tag} class="card ${selected?'selected':''} ${c.quantum?'quantum-card':''} ${c.played?'played':''}" ${action?`data-card="${c.index}"`:''} aria-label="${esc((action? action+' ':'')+cardName(c)+(label?' · '+label:''))}"><span class="card-face" style="${faceStyle(c)}" aria-hidden="true"></span>${label?`<small class="card-note">${esc(label)}</small>`:''}</${tag}>`;
}
export function sphere(p, collapse=null, key='preview', activeStep=null, compact=false, options={}) {
  const vector=collapse===null?p.bloch:[0,0,collapse?-1:1];
  const data={vector,gates:p.gates,trajectory:p.trajectory||p.steps.map(s=>s.bloch),steps:p.steps.map(s=>s.bloch),segments:p.segments,collapse,activeStep,...options};
  const canvas=`<canvas class="interactive-bloch" width="760" height="760" tabindex="0" data-bloch-key="${esc(key)}" data-bloch="${esc(JSON.stringify(data))}" role="img" aria-label="${L('Esfera de Bloch interactiva','Interactive Bloch sphere')}: (${vector.map(v=>v.toFixed(3)).join(', ')}). ${L('Arrastrá para girar la vista o usá las flechas; Inicio restablece la cámara.','Drag to rotate the view or use the arrow keys; Home resets the camera.')}">${L('Vector de Bloch','Bloch vector')}: ${vector.map(v=>v.toFixed(3)).join(', ')}.</canvas>`;
  if(compact)return canvas;
  const legend=p.gates.length?`<ol class="trajectory-legend" aria-label="${L('Compuertas y colores de la trayectoria','Gates and path colours')}">${p.gates.map((gate,i)=>`<li style="${gateStyle(gate)}" aria-label="${L('Paso','Step')} ${i+1}: ${esc(gateLabel(gate))}, ${gateColorName(gate)}"><span aria-hidden="true"></span>${i+1} · ${esc(gateLabel(gate))}</li>`).join('')}</ol>`:'';
  return canvas+legend+`<p class="sphere-caption">${axes(esc(L('Ejes: [X] [Y] [Z] · Norte: original |0⟩ · Sur: ligada |1⟩','Axes: [X] [Y] [Z] · North: original |0⟩ · South: linked |1⟩')))}<br><strong data-live-bloch>${axes(`[X]=${vector[0].toFixed(3)} · [Y]=${vector[1].toFixed(3)} · [Z]=${vector[2].toFixed(3)}`)}</strong><br>${collapse===null?L('Colores del camino: compuertas. Puntos: estado después de cada una.','Path colours: gates. Dots: state after each gate.'):L('Trazo blanco: medición; no es una compuerta.','White dashes: measurement; not a gate.')}<br>${axes(esc(L('P(0) = (1 + [Z]) / 2 · Arrastrá para girar','P(0) = (1 + [Z]) / 2 · Drag to rotate')))}<br><a class="bloch-credit" href="https://qollab.xyz/u/qollab/interactive-bloch-sphere" target="_blank" rel="noopener">${L('Esfera adaptada de Qollab · Interactive Bloch Sphere','Sphere adapted from Qollab · Interactive Bloch Sphere')}</a></p>`;
}
function complex([r,i]) {return `${r.toFixed(4)} ${i<0?'−':'+'} ${Math.abs(i).toFixed(4)}i`;}
export function circuitStrip(gates, editing=null){
  return `<div class="circuit-slots" aria-label="${L('Circuito en orden temporal','Circuit in time order')}"><span class="wire-name">q[0]</span>${[0,1,2].map(i=>{const gate=gates[i];return `<div class="circuit-position ${gate===undefined?'vacant':''}" ${gate===undefined?'':`style="${gateStyle(gate)}" title="${esc(gateLabel(gate))} · ${gateColorName(gate)}"`}>${gate===undefined?`<span aria-label="${L('Posición','Position')} ${i+1} ${L('vacía','empty')}">${i+1}</span>`:`<strong>${esc(gateLabel(gate))}</strong>${editing?`<div class="slot-tools"><button data-remove="${i}" aria-label="${L('Quitar compuerta','Remove gate')} ${i+1}" ${editing.locked?'disabled':''}>×</button><button data-left="${i}" ${i===0?'disabled':''} aria-label="${L('Mover compuerta','Move gate')} ${i+1} ${L('a la izquierda','left')}">←</button><button data-right="${i}" ${i===gates.length-1?'disabled':''} aria-label="${L('Mover compuerta','Move gate')} ${i+1} ${L('a la derecha','right')}">→</button></div>`:''}`}</div>`;}).join('')}<span class="measurement-symbol" title="${L('Se mide cuando las reglas lo requieren','Measured when the rules require it')}" aria-label="${L('Medición al jugar o aceptar Envido','Measurement when played or when Envido is accepted')}">◴</span></div>`;
}
export function quantumOptions(q){
  return `<div class="quantum-options" aria-label="${L('Dos cartas posibles','Two possible cards')}">${[q.original,q.linked].map((c,bit)=>`<article class="quantum-option"><span class="pill">${bit?L('Carta ligada · |1⟩','Linked card · |1⟩'):L('Carta original · |0⟩','Original card · |0⟩')}</span>${card(c)}<h3>${esc(cardName(c))}</h3><strong class="option-probability">${percent(q.preview.probabilities[bit])}</strong><div class="probability-track" aria-hidden="true"><span style="width:${q.preview.probabilities[bit]*100}%"></span></div></article>`).join('')}</div>`;
}
export function preview(p, collapse=null, identities=null) {
  return `<section class="circuit-preview" aria-label="${L('Vista del circuito cuántico','Quantum circuit view')}">${circuitStrip(p.gates)}${identities?quantumOptions({...identities,preview:p}):`<div class="probabilities"><span>|0⟩ ${percent(p.probabilities[0])}</span><span>|1⟩ ${percent(p.probabilities[1])}</span></div>`}<div class="composer-sphere">${sphere(p,collapse)}</div><p class="sphere-caption">${L('Probabilidades ideales antes de medir, calculadas con Qiskit. ◴ es la medición: ocurre cuando las reglas lo requieren.','Ideal probabilities before measuring, computed with Qiskit. ◴ is the measurement: it happens when the rules require it.')}</p></section>${technical(p)}`;
}
const stepName=gate=>gate==='|0⟩'?L('Estado inicial','Initial state'):gateLabel(gate);
export function technical(p){return `<details><summary>${L('Detalle técnico y estados intermedios','Technical detail and intermediate states')}</summary>
  <p>ψ = (${complex(p.amplitudes[0])})|0⟩ + (${complex(p.amplitudes[1])})|1⟩.<br>${L('Fase relativa','Relative phase')}: ${p.relative_phase===null?L('indefinida (una amplitud es cero)','undefined (one amplitude is zero)'):p.relative_phase.toFixed(4)+' rad'}.</p>
  <div style="overflow:auto"><table><thead><tr><th>${L('Paso','Step')}</th><th>α, β</th><th>${axes('Bloch [X], [Y], [Z]')}</th><th>P(0), P(1)</th></tr></thead><tbody>${p.steps.map((s,i)=>`<tr><td>${i} · ${esc(stepName(s.gate))}</td><td>${complex(s.amplitudes[0])}<br>${complex(s.amplitudes[1])}</td><td>${s.bloch.map(v=>v.toFixed(3)).join(', ')}</td><td>${s.probabilities.map(v=>v.toFixed(3)).join(', ')}</td></tr>`).join('')}</tbody></table></div>
  ${p.gates.map(g=>`<p>${gateHelp(g)}</p>`).join('')}<p>${L('Los estados se comparan hasta fase global. Cada jugador tiene un qubit independiente: no hay entrelazamiento.','States are compared up to global phase. Each player has an independent qubit: there is no entanglement.')}</p></details>`;
}

const percent = value => L((100*value).toFixed(1).replace('.', ',')+' %',(100*value).toFixed(1)+'%');
const near = (a,b) => Math.abs(a-b)<1e-9;
function stateLabel(step){
  const [[a,ai],[b,bi]]=step.amplitudes;
  if(near(ai,0)&&near(bi,0)){
    if(near(a,1)&&near(b,0))return '|0⟩';
    if(near(a,0)&&near(b,1))return '|1⟩';
    if(near(a,Math.SQRT1_2)&&near(Math.abs(b),Math.SQRT1_2))return `(|0⟩ ${b<0?'−':'+'} |1⟩)/√2`;
    return `${a.toFixed(3)}|0⟩ ${b<0?'−':'+'} ${Math.abs(b).toFixed(3)}|1⟩`;
  }
  return `(${complex(step.amplitudes[0])})|0⟩ + (${complex(step.amplitudes[1])})|1⟩`;
}
function gateLesson(gate,before){
  if(gate==='H'){
    const base=near(before.amplitudes[0][0],1)&&near(before.probabilities[1],0);
    return {formula:base?'H|0⟩ = (|0⟩ + |1⟩)/√2':'H(α|0⟩ + β|1⟩) = ((α + β)|0⟩ + (α − β)|1⟩)/√2',
      text:base?L('Como el qubit estaba en |0⟩, H crea una superposición con dos amplitudes iguales, 1/√2 cada una. Al elevarlas al cuadrado da 1/2: 50 % para cada resultado.','Since the qubit was in |0⟩, H creates a superposition with two equal amplitudes, 1/√2 each. Squared, each gives 1/2: 50% for each outcome.'):
      L('H suma las amplitudes para |0⟩ y las resta para |1⟩. Los signos cuentan: pueden reforzarse o cancelarse (interferencia). Por eso H no da siempre 50/50.','H adds the amplitudes for |0⟩ and subtracts them for |1⟩. Signs matter: they can reinforce or cancel (interference). That is why H does not always give 50/50.'),
      path:L('H gira el vector media vuelta alrededor del eje diagonal entre [X] y [Z]. Seguí el camino naranja.','H turns the vector half a turn around the diagonal axis between [X] and [Z]. Follow the orange path.')};
  }
  if(gate==='X')return {formula:'X(α|0⟩ + β|1⟩) = β|0⟩ + α|1⟩',text:L('X intercambia las amplitudes de |0⟩ y |1⟩, y con ellas sus probabilidades. Desde |0⟩ llega a |1⟩.','X swaps the amplitudes of |0⟩ and |1⟩, and their probabilities with them. From |0⟩ it reaches |1⟩.'),path:L('X gira el vector media vuelta alrededor del eje [X]. Seguí el camino verde.','X turns the vector half a turn around the [X] axis. Follow the green path.')};
  if(gate==='Z')return {formula:'Z(α|0⟩ + β|1⟩) = α|0⟩ − β|1⟩',text:L('Z cambia el signo de la amplitud de |1⟩. Los porcentajes de medir ahora no cambian: elevar al cuadrado elimina el signo. Pero esa fase cambia lo que haga una H posterior.','Z flips the sign of the |1⟩ amplitude. The odds of measuring now do not change: squaring removes the sign. But that phase changes what a later H does.'),path:L('Z gira el vector media vuelta alrededor del eje [Z]. Si el vector está sobre ese eje, no se mueve.','Z turns the vector half a turn around the [Z] axis. If the vector lies on that axis, it does not move.')};
  const r=rotation(gate),angle=r.angle.replace('pi','π').replace('-','−');
  return {formula:`${r.axis}(θ) = exp(−i θ σ${r.axis.slice(1)}/2); θ = ${angle}`,text:gateDescription(gate),path:L(`Seguí el camino ${gateColorName(gate)}: el ángulo fijo define cuánto y hacia dónde gira.`,`Follow the ${gateColorName(gate)} path: the fixed angle sets how far and which way it turns.`)};
}
export function circuitStory(p,identities=null){
  const initial=identities?L(`|0⟩ representa tu ${cardName(identities.original)}; |1⟩, la ligada ${cardName(identities.linked)}.`,`|0⟩ stands for your ${cardName(identities.original)}; |1⟩ for the linked ${cardName(identities.linked)}.`):L('|0⟩ y |1⟩ son los dos resultados posibles de la medición.','|0⟩ and |1⟩ are the two possible measurement outcomes.');
  const ordinal=i=>L(['primera','segunda','tercera'][i],['first','second','third'][i]);
  return `<section class="circuit-story" aria-label="${L('Explicación paso a paso','Step-by-step explanation')}"><h3>${L('Qué hizo cada compuerta','What each gate did')}</h3><p>${esc(L('Tu qubit empezó en |0⟩: 100 % para 0. ','Your qubit started in |0⟩: 100% for 0. '))}${esc(initial)} ${L('Cada compuerta actúa sobre el estado que dejó la anterior, sin medirlo.','Each gate acts on the state left by the previous one, without measuring it.')}</p>${!p.gates.length?`<p>${L('No usaste compuertas: el estado sigue en |0⟩.','You used no gates: the state stays in |0⟩.')}</p>`:`<ol class="gate-lessons">${p.gates.map((gate,i)=>{
    const n=i+1,before=p.steps[i],after=p.steps[n],lesson=gateLesson(gate,before),end=p.segments[i].end;
    const partial={...after,gates:p.gates.slice(0,n),steps:p.steps.slice(0,n+1),trajectory:p.trajectory.slice(0,end+1),segments:p.segments.slice(0,n)};
    return `<li class="gate-lesson" style="${gateStyle(gate)}"><div><h4>${n} · ${L(`Tu ${ordinal(i)} compuerta fue`,`Your ${ordinal(i)} gate was`)} ${esc(gateLabel(gate))}</h4><p>${L('Recibió el estado','It received the state')} <strong>${esc(stateLabel(before))}</strong>.</p><p>${axes(esc(lesson.text))}</p><p class="gate-formula">${esc(lesson.formula)}</p><p>${L('Dejó el estado','It left the state')} <strong>${esc(stateLabel(after))}</strong>.</p><p class="step-probabilities">${L('Antes','Before')}: 0 → ${percent(before.probabilities[0])} · 1 → ${percent(before.probabilities[1])}<br><strong>${L('Después','After')}: 0 → ${percent(after.probabilities[0])} · 1 → ${percent(after.probabilities[1])}</strong></p><p>${axes(esc(lesson.path))}</p></div><div class="lesson-sphere">${sphere(partial,null,`story-${p.gates.join('-')}-${i}`,i)}<button data-replay-step="${i}">${L('Ver de nuevo el paso','Replay step')} ${n}</button></div></li>`;
  }).join('')}</ol>`}<p class="callout">${L('Estos porcentajes dicen qué podría salir si midieras en ese momento; entre compuertas no se mide. Una medición da un único resultado.','These percentages say what could come out if you measured at that moment; nothing is measured between gates. One measurement gives a single outcome.')}</p><details><summary>${L('Cómo leer la fórmula','How to read the formula')}</summary><p>${L('α (alfa) y β (beta) son amplitudes: los números que acompañan a |0⟩ y |1⟩. Las probabilidades son sus magnitudes al cuadrado: P(0) = |α|² y P(1) = |β|². Un signo negativo cambia la fase, no da una probabilidad negativa.','α (alpha) and β (beta) are amplitudes: the numbers in front of |0⟩ and |1⟩. Probabilities are their squared magnitudes: P(0) = |α|² and P(1) = |β|². A minus sign changes the phase; it never gives a negative probability.')}</p><a href="https://quantum.cloud.ibm.com/docs/en/api/qiskit/circuit_library" target="_blank" rel="noopener">${L('Referencia de compuertas: Qiskit / IBM Quantum','Gate reference: Qiskit / IBM Quantum')}</a></details></section>`;
}

export function quantumReport(q) {
  if (!q) return '';
  const unused=q.tokens.filter((_,i)=>!q.sequence.includes(i));
  return ` ${preview(q.preview,q.result,q)}${circuitStory(q.preview,q)}
  <p class="callout">${q.result===null?L('Terminó sin medirse.','It ended without being measured.'):L(`La medición dio ${q.result}. La identidad quedó fija durante la mano.`,`The measurement gave ${q.result}. The identity stayed fixed for the hand.`)}</p><p>${L('Fichas recibidas','Tokens received')}: ${q.tokens.map(gateLabel).map(esc).join(', ')}. ${L('Sin usar','Unused')}: ${unused.map(gateLabel).map(esc).join(', ') || L('ninguna','none')}.</p>
  ${q.record?`<details><summary>${L('Registro de la medición','Measurement record')}</summary><pre>${esc(JSON.stringify(q.record,null,2))}</pre></details>`:''}`;
}
export function fusionCard(q,{action=null,index=null,label='',selected=false,key='card',animate=false}={}){
  const measured=[0,1].includes(q.result),tag=action?'button':'div';
  const name=measured?cardName(q.result?q.linked:q.original):`${cardName(q.original)} / ${cardName(q.linked)}`;
  const data={probability:q.preview.probabilities[0],trajectory:q.preview.trajectory,segments:q.preview.segments,gates:q.preview.gates,result:measured?q.result:null,animate};
  return `<${tag} class="card fusion-card ${selected?'selected':''} ${measured?'settled-card':'quantum-card'}" ${action?`data-card="${index}"`:''} data-fusion-key="${esc(key)}" data-fusion="${esc(JSON.stringify(data))}" aria-label="${esc((action?action+' ':'')+name+(label?' · '+label:''))}"><span class="card-face fusion-original" style="${faceStyle(q.original)}" aria-hidden="true"></span><span class="card-face fusion-linked" style="${faceStyle(q.linked)}" aria-hidden="true"></span><svg class="fusion-energy" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><path class="fusion-wave"/><ellipse class="fusion-orbit" cx="50" cy="80" rx="65" ry="40"/></svg>${label?`<small class="card-note">${esc(label)}</small>`:''}</${tag}>`;
}
export function measurementCard(q, animate=false, caption=true){
  if(!q || ![0,1].includes(q.result))return '';
  const result=q.result?q.linked:q.original;
  return `<div class="measurement-result" role="status" aria-label="${L('Resultado','Result')} ${q.result}: ${esc(cardName(result))}">${fusionCard(q,{animate,key:'measured-'+cardName(q.original)})}<div class="result-bloch" aria-label="${L('Estado de Bloch después de medir','Bloch state after measuring')}">${sphere(q.preview,q.result,'result-'+cardName(q.original),null,true)}</div>${caption?`<p><strong>${esc(cardName(result))}</strong><br>${L('Identidad fijada','Identity fixed')}</p>`:''}</div>`;
}

export function quantumStatus(q,name){
  const p=q.preview,measured=q.result!==null;
  return `<aside class="quantum-status" aria-label="${L('Identidades y probabilidades de la carta cuántica','Quantum card identities and probabilities')}"><div><h3>${isYou(name)?L('Tu carta Q','Your Q card'):`${L('Carta Q de','Q card of')} ${esc(name)}`}</h3><p>${measured?L('Probabilidades antes de la medición','Probabilities before the measurement'):L('Posibilidades actuales; todavía no se midió','Current possibilities; not measured yet')}</p><div class="identity-probabilities">${[q.original,q.linked].map((c,i)=>`<p><strong>${esc(cardName(c))}</strong><span data-live-probability="${i}">${percent(p.probabilities[i])}</span></p>`).join('')}</div>${measured?`<p class="fixed-identity">${L('Salió','It came out as')} <strong>${esc(cardName(q.result?q.linked:q.original))}</strong>. ${L('Ya no cambia.','It no longer changes.')}</p>`:`<p>${L('Se mide al jugarla o al aceptar un Envido.','It is measured when you play it or when an Envido is accepted.')}</p>`}</div><details class="live-state-sphere"><summary>${L('Ver esfera y estado del qubit','Show the sphere and qubit state')}</summary>${sphere(p,q.result,'live-'+name)}</details></aside>`;
}

export function turnGuide(g, priv={}) {
  let title=L('Elegí tu próxima acción','Choose your next action'), text='';
  if(g.phase==='prepare'){
    title=priv.quantum?L('2 · Armá y confirmá tu circuito','2 · Build and confirm your circuit'):L('1 · Elegí tu carta cuántica','1 · Choose your quantum card');
    text=priv.quantum?L('Abrí «Activar cuántico», agregá de cero a tres fichas en orden y tocá «Confirmar». Las otras dos cartas se juegan como siempre.','Open “Activate quantum”, add zero to three tokens in order and press “Confirm”. Your other two cards play as usual.'):L('Tocá una de tus tres cartas. Al medirse puede quedar en su palo original o cambiar al palo ligado.','Tap one of your three cards. When measured it may keep its original suit or switch to the linked suit.');
    if(priv.removals_left!==null&&priv.removals_left!==undefined)text+=' '+L(`Modo difícil: te quedan ${priv.removals_left} retiros de compuertas en esta mano.`,`Hard mode: ${priv.removals_left} gate removals left this hand.`);
  }else if(g.phase==='play'){
    title=isYou(g.names[g.actor])?L('Tu turno · jugá una carta o cantá','Your turn · play a card or make a call'):L(`Turno de ${g.names[g.actor]} · jugá una carta o cantá`,`${g.names[g.actor]}'s turn · play a card or make a call`);
    text=L(`Una baza es una carta de cada jugador; gana la de mayor fuerza. Ganar la mano vale ahora ${g.stake}.`,`A baza (trick) is one card from each player; the stronger card wins. Winning the hand is now worth ${g.stake}.`);
    if(priv.quantum?.result===null)text+=' '+L('Tu carta Q se mide al jugarla o al aceptar Envido.','Your Q card is measured when you play it or when Envido is accepted.');
  }else if(g.phase==='respond'){
    title=isYou(g.names[g.actor])?L('Respondé al canto','Answer the call'):L(`${g.names[g.actor]}, respondé al canto`,`${g.names[g.actor]}, answer the call`);
    text=L('«Quiero» acepta; «No quiero» le da puntos a quien cantó. Debajo de cada botón está lo que vale.','“Quiero” accepts; “No quiero” gives points to the caller. Each button shows what it is worth.');
  }else if(g.phase==='reassert'){
    title=L('El Envido terminó; falta resolver el Truco','Envido is settled; the Truco is still pending');
    text=L('Reafirmá el canto pendiente para que tu rival responda.','Repeat the pending call so your opponent can answer.');
  }
  return `<aside class="turn-guide" aria-label="${L('Ayuda para este turno','Help for this turn')}"><h2>${esc(title)}</h2><p>${esc(text)}</p></aside>`;
}

// Engine event texts are Spanish identifiers; show them in the interface language.
const EVENTS={'Envido querido':'Envido accepted','Envido no querido':'Envido declined','Truco no querido':'Truco declined','Al mazo':'Folded (al mazo)','Mano ganada':'Hand won'};
export const eventText=text=>L(text,EVENTS[text]||text);
export function handSummary(g) {
  const awards=g.events.filter(event=>event.points);
  const bazas=g.events.filter(event=>event.cards&&event.strengths);
  const why=bazas.length?`<details><summary>${L('Por qué se ganó cada baza','Why each baza was won')}</summary>${bazas.map((event,i)=>`<p>Baza ${i+1}: ${event.cards.map((item,n)=>isYou(g.names[item.player])?L(`jugaste ${esc(cardName(item.card))} (fuerza ${event.strengths[n]} de 14)`,`you played ${esc(cardName(item.card))} (strength ${event.strengths[n]} of 14)`):L(`${esc(g.names[item.player])} jugó ${esc(cardName(item.card))} (fuerza ${event.strengths[n]} de 14)`,`${esc(g.names[item.player])} played ${esc(cardName(item.card))} (strength ${event.strengths[n]} of 14)`)).join('; ')}. <strong>${event.winner===-1?L('Parda: las cartas tienen la misma fuerza.','Parda (tie): both cards have the same strength.'):isYou(g.names[event.winner])?L('Ganaste con la carta de mayor fuerza.','You won with the stronger card.'):L(`Ganó ${esc(g.names[event.winner])}, con la carta de mayor fuerza.`,`${esc(g.names[event.winner])} won with the stronger card.`)}</strong></p>`).join('')}<p>${L('La fuerza sigue la jerarquía del Truco, no el número impreso.','Strength follows the Truco ranking, not the printed number.')}</p></details>`:'';
  return `<section class="hand-summary" aria-label="${L('Resultado de la mano','Hand result')}"><h3>${L('Qué pasó en esta mano','What happened this hand')}</h3>${awards.map(event=>`<p><strong>${isYou(g.names[event.winner])?L('Sumaste','You scored'):esc(g.names[event.winner])} +${event.points}</strong> · ${esc(eventText(event.text))}</p>`).join('')}${g.bazas.length?`<p>${L('Bazas','Bazas')}: ${g.bazas.map((winner,i)=>`${i+1}: ${winner===-1?L('parda','parda (tie)'):esc(g.names[winner])}`).join(' · ')}.</p>`:''}${why}<p>${L('Marcador','Score')}: ${g.names.map((name,p)=>`${esc(name)} ${g.scores[p]}`).join(' · ')}. ${L('Meta: 15 puntos.','Target: 15 points.')}</p></section>`;
}

export function scoreboard(g) {
  return `<aside class="scoreboard" aria-label="${L('Puntuación','Score')}"><h2>${L('Puntuación','Score')}</h2><div class="chalk-scores">${g.names.map((name,p)=>`<div><span class="score-name">${esc(name)}</span><strong>${g.scores[p]} <small>/ 15</small></strong></div>`).join('')}</div><span class="score-sign">QRIOLLO</span></aside>`;
}
export function table(g, options={}) {
  const actor=g.actor??0, rival=1-actor;
  const remaining=3-g.table.filter(t=>t.player===rival).length;
  const hand=options.cards?.filter(c=>!c.played)||[];
  const prepare=!!options.prepare;
  const cardAction=prepare?L('Elegir','Choose'):g.phase==='play'&&!options.faceDown?L('Jugar','Play'):null;
  const note=c=>c.quantum?(prepare?L('Seleccionada','Selected'):options.quantum?.result===null?L('Q · se mide al jugar','Q · measured when played'):L('Q · identidad fijada','Q · identity fixed')):'';
  return `<section class="table-scene ${prepare?'preparing':''}" aria-label="${L('Mesa de juego','Game table')}"><img class="table-backdrop" src="${options.art}" alt="" draggable="false">${scoreboard(g)}<div class="opponent-hand" aria-label="${esc(g.names[rival])}: ${remaining} ${L('cartas ocultas','hidden cards')}"><span class="seat-name">${esc(g.names[rival])}</span><div>${Array.from({length:remaining},()=>'<div class="card-back" aria-hidden="true"><span>◈</span></div>').join('')}</div></div><div class="table-deck card-back" aria-hidden="true"><span>◈</span></div><div class="played-bazas" aria-label="${L('Cartas jugadas','Played cards')}">${[0,1,2].map(b=>`<div class="baza-column"><span class="baza-label">Baza ${b+1}${g.bazas[b]!==undefined?`<br><strong>${g.bazas[b]===-1?L('Parda','Parda (tie)'):esc(g.names[g.bazas[b]])}</strong>`:''}</span>${[rival,actor].map(player=>{const t=g.table.slice(b*2,b*2+2).find(t=>t.player===player);return `<div class="played-slot">${t?(options.measurement?.tableIndex===g.table.indexOf(t)?measurementCard(options.measurement.q,true,false):card(t.card,`${g.names[player]}`)):'<span class="empty-slot" aria-hidden="true"></span>'}</div>`;}).join('')}</div>`).join('')}</div>${hand.length?`<div class="live-hand ${options.flip?'flipping-hand':''}"><span class="seat-name">${isYou(g.names[actor])?'':`${esc(g.names[actor])} · `}${prepare?L('Elegí tu carta cuántica','Choose your quantum card'):L('Tu mano','Your hand')}</span><div class="cards">${hand.map(c=>options.faceDown?'<div class="card-back"><span>◈</span></div>':c.quantum&&options.quantum?fusionCard(options.quantum,{action:cardAction,index:c.index,selected:true,label:note(c),key:`hand-${g.hand}-${actor}-${c.index}`}):card(c,note(c),c.quantum,cardAction)).join('')}</div></div>`:''}${prepare?`<button id="activate-quantum" class="activate-quantum" ${options.quantum?'':'disabled'}><span aria-hidden="true">A</span>${L('Activar<br>cuántico','Activate<br>quantum')}</button>`:'<div class="quantum-ornament" aria-hidden="true">|ψ⟩</div>'}<div class="table-status">${L('Mano','Hand')} ${g.hand} · ${isYou(g.names[g.mano])?L('Sos mano','You are mano (you lead)'):`${L('Mano','Mano (leads)')}: ${esc(g.names[g.mano])}`} · Truco: ${g.stake}</div></section>`;
}
