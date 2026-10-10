import {GATE_COLORS,GATE_COLOR_NAMES,gateStyle} from './gate-colors.js';
export {gateStyle};
// User-provided deck views and dependency-free Qiskit Bloch rendering.
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ranks=[1,2,3,4,5,6,7,10,11,12];
const columns=[49,134,218,303,386,470,553,637,720,803];
const rows={espada:25,basto:159,copa:291,oro:424};
export function faceStyle(c){
  const x=columns[ranks.indexOf(c.number)],y=rows[c.suit],w=78,h=125;
  return `background-size:${1024/w*100}% ${572/h*100}%;background-position:${x/(1024-w)*100}% ${y/(572-h)*100}%;`;
}
export function card(c, label='', selected=false, action=null) {
  const tag=action?'button':'div';
  return `<${tag} class="card ${selected?'selected':''} ${c.quantum?'quantum-card':''} ${c.played?'played':''}" ${action?`data-card="${c.index}"`:''} aria-label="${esc((action? action+' ':'')+c.label+(label?' · '+label:''))}"><span class="card-face" style="${faceStyle(c)}" aria-hidden="true"></span>${label?`<small class="card-note">${esc(label)}</small>`:''}</${tag}>`;
}
export function sphere(p, collapse=null, key='preview', activeStep=null) {
  const vector=collapse===null?p.bloch:[0,0,collapse?-1:1];
  const data={vector,gates:p.gates,trajectory:p.trajectory||p.steps.map(s=>s.bloch),steps:p.steps.map(s=>s.bloch),segments:p.segments,collapse,activeStep};
  return `<canvas class="interactive-bloch" width="760" height="760" tabindex="0" data-bloch-key="${esc(key)}" data-bloch="${esc(JSON.stringify(data))}" role="img" aria-label="Esfera de Bloch interactiva: vector (${vector.map(v=>v.toFixed(3)).join(', ')}). Arrastrá para girar la vista o usá las flechas; Inicio restablece la cámara.">Vector de Bloch: ${vector.map(v=>v.toFixed(3)).join(', ')}.</canvas>${p.gates.length?`<ol class="trajectory-legend" aria-label="Compuertas y colores de la trayectoria">${p.gates.map((gate,i)=>`<li style="${gateStyle(gate)}" aria-label="Paso ${i+1}: ${esc(gate)}, ${GATE_COLOR_NAMES[gate]}"><span aria-hidden="true"></span>${i+1} · ${esc(gate)}</li>`).join('')}</ol>`:''}<p class="sphere-caption">Arrastrá la esfera para girar la vista · Flechas con teclado<br>${collapse===null?'Trayectoria: evolución calculada. Puntos: estados tras cada compuerta.':'Trazo blanco discontinuo: colapso; no es una rotación unitaria.'}<br>Vector actual: X=${vector[0].toFixed(3)}, Y=${vector[1].toFixed(3)}, Z=${vector[2].toFixed(3)}.<br><a class="bloch-credit" href="https://qollab.xyz/u/qollab/interactive-bloch-sphere" target="_blank" rel="noopener">Esfera adaptada de Qollab · Interactive Bloch Sphere</a></p>`;
}
function complex([r,i]) {return `${r.toFixed(4)} ${i<0?'−':'+'} ${Math.abs(i).toFixed(4)}i`;}
const gateDescriptions = {'|0⟩':'Estado inicial',H:'H = (X+Z)/√2; rotación π alrededor de (X+Z)/√2, hasta fase global',X:'X: rotación π (180°) alrededor de X, hasta fase global',Z:'Z: rotación π (180°) alrededor de Z, hasta fase global','RY+':'RY: +π/6 (+30°) alrededor de Y','RY-':'RY: −π/6 (−30°) alrededor de Y'};
export function circuitStrip(gates, editing=null){
  return `<div class="circuit-slots" aria-label="Circuito en orden temporal"><span class="wire-name">q[0]</span>${[0,1,2].map(i=>{const gate=gates[i];return `<div class="circuit-position ${gate===undefined?'vacant':''}" ${gate===undefined?'':`style="${gateStyle(gate)}" title="${esc(gate)} · trayectoria ${GATE_COLOR_NAMES[gate]}"`}>${gate===undefined?`<span aria-label="Posición ${i+1} vacía">${i+1}</span>`:`<strong>${esc(gate)}</strong>${editing?`<div class="slot-tools"><button data-remove="${i}" aria-label="Quitar compuerta ${i+1}">×</button><button data-left="${i}" ${i===0?'disabled':''} aria-label="Mover compuerta ${i+1} a la izquierda">←</button><button data-right="${i}" ${i===gates.length-1?'disabled':''} aria-label="Mover compuerta ${i+1} a la derecha">→</button></div>`:''}`}</div>`;}).join('')}<span class="measurement-symbol" title="Se mide cuando las reglas lo requieren" aria-label="Medición al jugar o aceptar Envido">◴</span></div>`;
}
export function preview(p, collapse=null, identities=null) {
  const identity=(c,bit)=>`<div class="identity identity-${bit?'one':'zero'}">${card(c)}<span>${esc(c.label)}<br><strong>|${bit}⟩ · ${(p.probabilities[bit]*100).toFixed(1)} %</strong></span></div>`;
  return `<section class="enlarged-card circuit-preview" aria-label="Vista del circuito cuántico">${identities?`<span class="card-watermark" style="${faceStyle(identities.original)}" aria-hidden="true"></span>`:''}${circuitStrip(p.gates)}${identities?identity(identities.original,0):''}<div class="composer-sphere">${sphere(p,collapse)}</div>${identities?identity(identities.linked,1):`<div class="probabilities"><span>|0⟩ ${(100*p.probabilities[0]).toFixed(1)} %</span><span>|1⟩ ${(100*p.probabilities[1]).toFixed(1)} %</span></div>`}<p class="sphere-caption">Probabilidades ideales antes de medir. M se ejecuta solo cuando las reglas lo necesitan.</p></section>${technical(p)}`;
}
export function technical(p){return `<details><summary>Detalle técnico y estados intermedios</summary>
  <p>ψ = (${complex(p.amplitudes[0])})|0⟩ + (${complex(p.amplitudes[1])})|1⟩.<br>Fase relativa: ${p.relative_phase===null?'indefinida (una amplitud es cero)':p.relative_phase.toFixed(4)+' rad'}.</p>
  <div style="overflow:auto"><table><thead><tr><th>Paso</th><th>α, β</th><th>Bloch X, Y, Z</th><th>P(0), P(1)</th></tr></thead><tbody>${p.steps.map((s,i)=>`<tr><td>${i} · ${esc(s.gate)}</td><td>${complex(s.amplitudes[0])}<br>${complex(s.amplitudes[1])}</td><td>${s.bloch.map(v=>v.toFixed(3)).join(', ')}</td><td>${s.probabilities.map(v=>v.toFixed(3)).join(', ')}</td></tr>`).join('')}</tbody></table></div>
  ${p.steps.map(s=>`<p>${esc(gateDescriptions[s.gate])}</p>`).join('')}<p>Los estados se comparan hasta fase global. Este sistema es de un qubit; las cartas de ambos jugadores son independientes.</p></details>`;
}

const percent = value => (100*value).toFixed(1).replace('.', ',')+' %';
const near = (a,b) => Math.abs(a-b)<1e-9;
function stateLabel(step){
  const [[a,ai],[b,bi]]=step.amplitudes;
  if(near(ai,0)&&near(bi,0)){
    if(near(a,1)&&near(b,0))return '|0⟩';
    if(near(a,0)&&near(b,1))return '|1⟩';
    if(near(a,Math.SQRT1_2)&&near(Math.abs(b),Math.SQRT1_2))return `(|0⟩ ${b<0?'−':'+'} |1⟩)/√2`;
    return `${a.toFixed(3).replace('.',',')}|0⟩ ${b<0?'−':'+'} ${Math.abs(b).toFixed(3).replace('.',',')}|1⟩`;
  }
  return `(${complex(step.amplitudes[0])})|0⟩ + (${complex(step.amplitudes[1])})|1⟩`;
}
function gateLesson(gate,before,after){
  if(gate==='H'){
    const base=near(before.amplitudes[0][0],1)&&near(before.probabilities[1],0);
    return {formula:base?'H|0⟩ = (|0⟩ + |1⟩)/√2':'H(α|0⟩ + β|1⟩) = ((α + β)|0⟩ + (α − β)|1⟩)/√2',
      text:base?'Como el qubit estaba en |0⟩, H crea una superposición con dos amplitudes iguales. Cada amplitud es 1/√2: al elevar su magnitud al cuadrado obtenemos (1/√2)² = 1/2, es decir, 50 % para cada resultado.':
      'H combina las amplitudes: las suma para |0⟩ y las resta para |1⟩. Los signos cuentan: pueden reforzarse o cancelarse (interferencia). Por eso H no da siempre 50/50; depende del estado que recibió.',
      path:'H gira el vector 180° alrededor del eje diagonal entre X y Z. El camino naranja muestra esa rotación.'};
  }
  if(gate==='X')return {formula:'X(α|0⟩ + β|1⟩) = β|0⟩ + α|1⟩',text:'X intercambia las amplitudes de |0⟩ y |1⟩, y con ellas sus probabilidades. Desde |0⟩ llega a |1⟩; si ya había 50/50, los porcentajes siguen siendo iguales.',path:'X gira el vector 180° alrededor del eje X. Seguí el camino verde.'};
  if(gate==='Z')return {formula:'Z(α|0⟩ + β|1⟩) = α|0⟩ − β|1⟩',text:'Z cambia el signo de la amplitud de |1⟩. Medir ahora en 0/1 conserva los mismos porcentajes: elevar al cuadrado elimina ese signo. Pero la fase puede cambiar lo que haga una H posterior. Si solo cambia una fase global, el estado físico queda igual.',path:'Z gira el vector 180° alrededor del eje Z. El camino celeste puede no moverse si el vector ya está en ese eje.'};
  const angle=gate==='RY+'?'+π/6':'−π/6';
  return {formula:`RY(θ)(α|0⟩ + β|1⟩) = (α cos(θ/2) − β sin(θ/2))|0⟩ + (α sin(θ/2) + β cos(θ/2))|1⟩; θ = ${angle}`,text:`Esta ficha gira ${gate==='RY+'?'+30°':'−30°'} alrededor de Y. Combina las amplitudes usando seno y coseno. El resultado depende del punto de partida: desde |0⟩ ambas direcciones dan aproximadamente 93,3 % / 6,7 %, pero después de H dan porcentajes distintos.`,path:`Seguí el camino ${GATE_COLOR_NAMES[gate]}; el signo indica el sentido del giro.`};
}
export function circuitStory(p,identities=null){
  const initial=identities?`|0⟩ representa tu ${identities.original.label}; |1⟩, la ligada ${identities.linked.label}.`:'|0⟩ y |1⟩ son los dos resultados posibles de la medición.';
  return `<section class="circuit-story" aria-label="Explicación paso a paso"><h3>Qué hizo cada compuerta</h3><p>Tu qubit comenzó en |0⟩: 100 % para 0 y 0 % para 1. ${esc(initial)} Cada compuerta actúa sobre el estado que dejó la anterior, sin medirlo.</p>${!p.gates.length?'<p>No usaste compuertas: el estado ideal sigue en |0⟩.</p>':`<ol class="gate-lessons">${p.gates.map((gate,i)=>{
    const n=i+1,before=p.steps[i],after=p.steps[n],lesson=gateLesson(gate,before,after),end=p.segments[i].end;
    const partial={...after,gates:p.gates.slice(0,n),steps:p.steps.slice(0,n+1),trajectory:p.trajectory.slice(0,end+1),segments:p.segments.slice(0,n)};
    return `<li class="gate-lesson" style="${gateStyle(gate)}"><div><h4>${n} · Tu ${['primera','segunda','tercera'][i]} compuerta fue ${esc(gate)}</h4><p>Recibió el estado <strong>${esc(stateLabel(before))}</strong>.</p><p>${esc(lesson.text)}</p><p class="gate-formula">${esc(lesson.formula)}</p><p>Dejó el estado <strong>${esc(stateLabel(after))}</strong>.</p><p class="step-probabilities">Antes: 0 → ${percent(before.probabilities[0])} · 1 → ${percent(before.probabilities[1])}<br><strong>Después: 0 → ${percent(after.probabilities[0])} · 1 → ${percent(after.probabilities[1])}</strong></p><p>${esc(lesson.path)}</p></div><div class="lesson-sphere">${sphere(partial,null,`story-${p.gates.join('-')}-${i}`,i)}<button data-replay-step="${i}">Ver de nuevo el paso ${n}</button></div></li>`;
  }).join('')}</ol>`}<p class="callout">Estos porcentajes describen qué podría salir si midieras en ese momento; no se midió entre compuertas. En una sola medición sale un único resultado. La trayectoria ilustra una rotación unitaria equivalente: no es un registro físico del dispositivo IonQ.</p><details><summary>Cómo leer la fórmula</summary><p>α (alfa) y β (beta) son amplitudes: los números que acompañan a |0⟩ y |1⟩. Las probabilidades son sus magnitudes al cuadrado: P(0) = |α|² y P(1) = |β|². Un signo negativo cambia la fase, no produce una probabilidad negativa. Los decimales mostrados están redondeados.</p><a href="https://quantum.cloud.ibm.com/docs/en/api/qiskit/2.2/circuit_library" target="_blank" rel="noopener">Referencia de compuertas: Qiskit / IBM Quantum</a></details></section>`;
}

export function quantumReport(q) {
  if (!q) return '';
  return ` ${preview(q.preview,q.result,q)}${circuitStory(q.preview,q)}
  <p class="callout">${esc(q.explanation)}</p><p>Fichas recibidas: ${q.tokens.map(esc).join(', ')}. Descartadas sin usar: ${q.discarded.map(esc).join(', ') || 'ninguna'}.</p>
  ${q.record?`<details><summary>Registro de la medición</summary><pre>${esc(JSON.stringify(q.record,null,2))}</pre></details>`:''}`;
}
export function measurementCard(q, animate=false, caption=true){
  if(!q || ![0,1].includes(q.result))return '';
  const result=q.result?q.linked:q.original;
  return `<div class="measurement-result" role="status" aria-label="Resultado ${q.result}: ${esc(result.label)}"><div class="measured-card ${animate?'measuring-transition':''}"><span class="measurement-before card-face" style="${faceStyle(q.original)}" aria-hidden="true"></span><span class="measurement-after card-face" style="${faceStyle(result)}" aria-hidden="true"></span></div>${caption?`<p><strong>${esc(result.label)}</strong><br>Resultado ${q.result} · Identidad fijada</p>`:''}</div>`;
}

function matches(n){return `<span class="match-tallies" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="match-stick ${i%5===4?'fifth':''}"></i>`).join('')}</span>`;}
export function scoreboard(g) {
  return `<aside class="scoreboard" aria-label="Puntuación"><h2>Puntuación</h2><div class="chalk-scores">${g.names.map((name,p)=>`<div><span class="score-name">${esc(name)}</span><strong>${g.scores[p]} <small>/ 15</small></strong>${matches(g.scores[p])}</div>`).join('')}</div><span class="score-sign">QRIOLLO</span></aside>`;
}
export function table(g, options={}) {
  const actor=g.actor??0, rival=1-actor;
  const remaining=3-g.table.filter(t=>t.player===rival).length;
  const hand=options.cards?.filter(c=>!c.played)||[];
  const prepare=!!options.prepare;
  return `<section class="table-scene ${prepare?'preparing':''}" aria-label="Mesa de juego"><img class="table-backdrop" src="${options.art}" alt="" draggable="false">${scoreboard(g)}<div class="opponent-hand" aria-label="${esc(g.names[rival])}: ${remaining} cartas ocultas"><span class="seat-name">${esc(g.names[rival])}</span><div>${Array.from({length:remaining},()=>'<div class="card-back" aria-hidden="true"><span>◈</span></div>').join('')}</div></div><div class="table-deck card-back" aria-hidden="true"><span>◈</span></div><div class="played-bazas" aria-label="Cartas jugadas">${[0,1,2].map(b=>`<div class="baza-column"><span class="baza-label">Baza ${b+1}</span>${[rival,actor].map(player=>{const t=g.table.slice(b*2,b*2+2).find(t=>t.player===player);return `<div class="played-slot">${t?(options.measurement?.tableIndex===g.table.indexOf(t)?measurementCard(options.measurement.q,true,false):card(t.card,`${g.names[player]}`)):'<span class="empty-slot" aria-hidden="true"></span>'}</div>`;}).join('')}</div>`).join('')}</div>${hand.length?`<div class="live-hand"><span class="seat-name">${esc(g.names[actor])} · ${prepare?'Elegí tu carta cuántica':'Tu mano'}</span><div class="cards">${hand.map(c=>card(c,c.quantum?(prepare?'Seleccionada':options.quantum?.result===null?'Q · medirá al jugar':'Q · identidad fijada'):'',c.quantum,prepare?'Elegir':'Jugar')).join('')}</div></div>`:''}${prepare?`<button id="activate-quantum" class="activate-quantum" ${options.quantum?'':'disabled'}><span aria-hidden="true">A</span>Activar<br>cuántico</button>`:'<div class="quantum-ornament" aria-hidden="true">|ψ⟩</div>'}<div class="table-status">Mano ${g.hand} · Mano: ${esc(g.names[g.mano])} · Truco: ${g.stake}</div></section>`;
}
