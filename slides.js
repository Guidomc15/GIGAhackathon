// Tutorial slides shown before the guided match with Bot Q. Add a slide by adding an
// entry to SLIDES: `title` and `body` per language, plus an optional `kind` that draws
// an interactive part (suits, ladder, duel). In texts, **word** marks a Truco term:
// it is shown in bold and, when the word is in GLOSSARY, it opens its definition.
import {L,cardName,suitName} from './i18n.js';
import {esc,card} from './ui.js';

export const GLOSSARY={
  baza:{es:['Baza','Una carta de cada jugador. Gana la más fuerte; quien gana dos bazas gana la mano.'],en:['Baza (trick)','One card from each player. The stronger card wins; whoever wins two bazas wins the hand.']},
  mano:{es:['Mano','1) Cada reparto de tres cartas. 2) El jugador que sale primero: gana los empates de Envido.'],en:['Mano','1) Each deal of three cards (a hand). 2) The player who leads first: they win Envido ties.']},
  palo:{es:['Palo','El tipo de carta: espada, basto, oro o copa.'],en:['Palo (suit)','The kind of card: espada (swords), basto (clubs), oro (coins) or copa (cups).']},
  parda:{es:['Parda','Una baza empatada: las dos cartas tienen la misma fuerza.'],en:['Parda (tie)','A tied baza: both cards have the same strength.']},
  brava:{es:['Bravas','Las cuatro cartas más fuertes: 1 de espada, 1 de basto, 7 de espada y 7 de oro.'],en:['Bravas','The four strongest cards: 1 of swords, 1 of clubs, 7 of swords and 7 of coins.']},
  ancho:{es:['Ancho','Así se le dice al 1 (as). El ancho de espada es la carta más fuerte del juego.'],en:['Ancho','The 1 (ace). The ancho de espada is the strongest card in the game.']},
  falso:{es:['Anchos falsos','El 1 de copa y el 1 de oro: son unos, pero valen menos que los 2.'],en:['Anchos falsos','The 1 of cups and the 1 of coins: they are aces, yet weaker than the 2s.']},
  envido:{es:['Envido','Apuesta aparte sobre los «tantos» de tus cartas del mismo palo.'],en:['Envido','A side bet on the points (tantos) of your same-suit cards.']},
  truco:{es:['Truco','Apuesta que sube lo que vale ganar la mano: 2, 3 o 4 puntos.'],en:['Truco','A bet that raises what the hand is worth: 2, 3 or 4 points.']},
  retruco:{es:['Retruco','Subida del Truco: la mano pasa a valer 3. Solo la puede cantar quien aceptó el Truco.'],en:['Retruco','A raise of the Truco: the hand becomes worth 3. Only the player who accepted the Truco may call it.']},
  'vale cuatro':{es:['Vale Cuatro','La subida máxima: la mano vale 4. Solo la puede cantar quien aceptó el Retruco.'],en:['Vale Cuatro','The highest raise: the hand is worth 4. Only the player who accepted the Retruco may call it.']},
  quiero:{es:['Quiero','«Acepto»: se juega por lo que se cantó.'],en:['Quiero','“I accept”: the hand is played for what was called.']},
  'no quiero':{es:['No quiero','«No acepto»: quien cantó suma los puntos que ya estaban en juego y la mano termina. Es lo mismo que irse al mazo.'],en:['No quiero','“I decline”: the caller scores the points already at stake and the hand ends. It is the same as folding (irse al mazo).']},
};
const DEFINITIONS={bazas:'baza',palos:'palo',pardas:'parda',bravas:'brava',anchos:'ancho','anchos falsos':'falso','quiero retruco':'retruco','quiero vale cuatro':'vale cuatro'};

// Escaped text with **terms**: bold, and clickable when they have a definition.
export function terms(text){
  // Trailing punctuation stays glued to the term so a line never starts with a comma.
  return esc(text).replace(/\*\*(.+?)\*\*([.,:;)]?)/g,(_,word,tail)=>{
    const key=word.toLowerCase(),id=GLOSSARY[key]?key:DEFINITIONS[key];
    const html=id?`<button type="button" class="term" data-term="${id}" aria-haspopup="dialog">${word}</button>`:`<strong class="term-plain">${word}</strong>`;
    return tail?`<span class="nowrap">${html}${tail}</span>`:html;
  });
}
export function definition(id){const [name,text]=GLOSSARY[id][L('es','en')];return {name,text};}

const SUITS=['basto','oro','espada','copa'];
const NUMBERS=[1,2,3,4,5,6,7,10,11,12];
// Truco strength ladder: 14 levels, each with every card of equal strength.
export const LADDER=[[[1,'espada']],[[1,'basto']],[[7,'espada']],[[7,'oro']],SUITS.map(s=>[3,s]),SUITS.map(s=>[2,s]),[[1,'copa'],[1,'oro']],SUITS.map(s=>[12,s]),SUITS.map(s=>[11,s]),SUITS.map(s=>[10,s]),[[7,'copa'],[7,'basto']],SUITS.map(s=>[6,s]),SUITS.map(s=>[5,s]),SUITS.map(s=>[4,s])];
const strength=(n,s)=>14-LADDER.findIndex(level=>level.some(([a,b])=>a===n&&b===s));
// Duel rounds: the last one is a tie.
export const DUEL=[[[3,'copa'],[1,'espada']],[[12,'basto'],[7,'oro']],[[1,'oro'],[2,'copa']],[[3,'basto'],[3,'oro']]];

export const SLIDES=[
  {title:['Primero, las reglas del Truco','First, the rules of Truco'],
   body:[['Se juega con las 40 cartas de la baraja española y en cada **mano** se reparten tres cartas a cada jugador.',
          'La idea es simple: los dos tiran una carta y la más alta gana la **baza**. Si ganás dos de tres bazas, ganaste la mano.',
          'Se juega a 15 puntos y hay distintas formas de sumarlos: ganar la mano y ganar las apuestas, el **Envido** y el **Truco**.',
          '¿Cómo sé cuál es la carta más alta? Eso es lo que vemos ahora.'],
         ['The game uses the 40 cards of the Spanish deck, and in each **mano** (hand) every player gets three cards.',
          'The idea is simple: both players play one card and the higher card wins the **baza** (trick). Win two of three bazas and the hand is yours.',
          'The game goes to 15 points and there are several ways to score them: winning the hand and winning the bets, **Envido** and **Truco**.',
          'How do I know which card is higher? That is what comes next.']],
   kind:'rules'},
  {title:['Las cartas y sus palos','The cards and their suits'],
   body:[['La baraja española tiene cuatro **palos**: basto, oro, espada y copa. Cada palo tiene 10 cartas: del 1 al 7, el 10, el 11 y el 12. No hay 8 ni 9.',
          'Tocá cada palo para ver sus cartas.'],
         ['The Spanish deck has four **palos** (suits): basto (clubs), oro (coins), espada (swords) and copa (cups). Each suit has 10 cards: 1 to 7, 10, 11 and 12. There are no 8s or 9s.',
          'Tap each suit to see its cards.']],
   kind:'suits'},
  {title:['La escala: de la mejor a la peor','The ladder: from best to worst'],
   body:[['En el Truco la fuerza no sigue el número. La mejor es el 1 de espada, el **ancho** de espada; le siguen el ancho de basto y el 7 de espada… Las cuatro primeras son las **bravas**.',
          'Las cartas de una misma fila valen lo mismo: si se cruzan, la baza es **parda**. Ojo con el 1 de copa y el de oro, los **anchos falsos**: valen menos que los 2.'],
         ['In Truco strength does not follow the number. The best card is the 1 of swords, the **ancho** de espada; then the ancho de basto and the 7 of swords… The first four are the **bravas**.',
          'Cards in the same row are worth the same: if they meet, the baza is **parda** (tied). Watch out for the 1 of cups and the 1 of coins, the **anchos falsos**: they are weaker than the 2s.']],
   kind:'ladder'},
  {title:['Toda carta mata a las de abajo','Every card beats the ones below it'],
   body:[['Una carta le gana a todas las que están más abajo en la escala. Probá: tocá la carta que gana cada baza, o «Parda» si empatan.'],
         ['A card beats every card below it on the ladder. Try it: tap the card that wins each baza, or “Parda” if they tie.']],
   kind:'duel'},
  {title:['Cómo se ganan puntos: ganando la mano','How to score: winning the hand'],
   body:[['La forma básica de sumar es ganar la **mano**: gana el mejor de tres **bazas**.',
          'Ejemplo 1: arriba están tus cartas y abajo las del rival. Tocá «Jugar baza» para ver quién **mata** a quién.'],
         ['The basic way to score is winning the **mano** (hand): the best of three **bazas** wins it.',
          'Example 1: your cards are on top and your opponent’s below. Press “Play baza” to see which card **mata** (beats) which.']],
   kind:'bazas', example:{you:[[3,'oro'],[1,'oro'],[1,'espada']],rival:[[2,'copa'],[2,'espada'],[4,'copa']]}},
  {title:['A veces alcanza con dos bazas','Sometimes two bazas are enough'],
   body:[['Ejemplo 2: si ganás las dos primeras bazas, ya ganaste la mano. **No hace falta jugar la tercera**.'],
         ['Example 2: if you win the first two bazas, the hand is already yours. **There is no need to play the third one**.']],
   kind:'bazas', example:{you:[[7,'espada'],[1,'basto']],rival:[[7,'oro'],[2,'copa']]}},
  {title:['¿Dónde está el truco?','Where is the trick?'],
   body:[['Ganando la mano de cualquiera de estas formas, el ganador suma **1 punto**. Para ganar más puntos hay apuestas: el **Truco**, que sube lo que vale la mano, y el **Envido**, que se juega aparte con los tantos (lo vas a ver en la partida).',
          'El Truco tiene un orden: primero **Truco**, después **Retruco** y por último **Vale Cuatro**. Cada canto pone en juego más puntos.'],
         ['Winning the hand in any of these ways gives the winner **1 point**. To score more there are bets: **Truco**, which raises what the hand is worth, and **Envido**, a separate bet on your card points (you will see it in the game).',
          'Truco goes in order: first **Truco**, then **Retruco** and finally **Vale Cuatro**. Each call puts more points at stake.']],
   kind:'calls'},
  {title:['Ejemplo: cantar Truco','Example: calling Truco'],
   body:[['Tenés el **ancho** de espada, la carta más alta del juego. Es el momento de cantar: tocá **Truco**.',
          'Si cantás Truco antes de mostrar tus cartas, la mano pasa a valer 2 puntos si el rival acepta. Retruco y Vale Cuatro todavía no se pueden cantar: van en orden.'],
         ['You hold the **ancho** de espada, the highest card in the game. Time to call: tap **Truco**.',
          'If you call Truco before showing your cards, the hand is worth 2 points if your opponent accepts. Retruco and Vale Cuatro cannot be called yet: they go in order.']],
   kind:'callTruco'},
  {title:['Del lado del rival','From your opponent’s side'],
   body:[['Ahora sos el rival: te cantaron Truco. Tenés tres opciones; tocá cada una para ver qué pasa.',
          'Recordá: solo puede subir la apuesta quien acaba de aceptar. Si el rival canta **Quiero Retruco**, vos podés responder **Quiero Vale Cuatro**, que es lo máximo.'],
         ['Now you are the opponent: Truco was called on you. You have three options; tap each one to see what happens.',
          'Remember: only the player who has just accepted may raise. If your opponent says **Quiero Retruco**, you can answer **Quiero Vale Cuatro**, which is the maximum.']],
   kind:'rivalTruco'},
  {title:['Cómo termina la mano','How the hand ends'],
   body:[['Cuando termina la mano, quien ganó 2 de las 3 bazas se anota los puntos en juego: 1, 2, 3 o 4.',
          'El primero que llega a **15 puntos** gana la partida. Ahora sí: juguemos con Bot Q.'],
         ['When the hand ends, whoever won 2 of the 3 bazas scores the points at stake: 1, 2, 3 or 4.',
          'The first to reach **15 points** wins the game. Now let’s play with Bot Q.']],
   kind:'scoring'},
];

const cardData=([number,suit])=>({number,suit});
function rulesPart(){
  return `<div class="slide-visual rules-visual"><div class="rule-deal" aria-hidden="true">${[[3,'espada'],[7,'oro'],[12,'basto']].map(c=>card(cardData(c))).join('')}</div><ol class="rule-facts"><li><strong>40</strong><span>${L('cartas','cards')}</span></li><li><strong>3</strong><span>${L('por jugador','per player')}</span></li><li><strong>2/3</strong><span>${L('bazas para ganar la mano','bazas win the hand')}</span></li><li><strong>15</strong><span>${L('puntos para ganar','points to win')}</span></li></ol></div>`;
}
function suitsPart(state){
  const suit=SUITS[state.suit||0];
  return `<div class="slide-visual"><div class="suit-tabs" role="tablist">${SUITS.map((s,i)=>`<button role="tab" data-suit="${i}" aria-selected="${s===suit}" class="${s===suit?'current':''}">${esc(suitName(s))}</button>`).join('')}</div><div class="suit-row" role="tabpanel" aria-label="${esc(suitName(suit))}">${NUMBERS.map(n=>`<figure>${card({number:n,suit})}<figcaption>${n}</figcaption></figure>`).join('')}</div></div>`;
}
function ladderPart(){
  return `<div class="slide-visual"><ol class="ladder">${LADDER.map((level,i)=>`<li class="${i<4?'brava':level.length===2&&level[0][0]===1?'falso':''}"><span class="ladder-rank">${i+1}</span><span class="ladder-cards">${level.map(c=>card(cardData(c))).join('')}</span><span class="ladder-name">${esc(level.length===1?cardName(cardData(level[0])):level.length===4?L(`Todos los ${level[0][0]}`,`All ${level[0][0]}s`):level.map(c=>cardName(cardData(c))).join(L(' y ',' and ')))}</span></li>`).join('')}</ol><button type="button" class="slide-help" data-quick-help>${L('Ver en Ayuda rápida','Open Quick help')}</button></div>`;
}
function duelPart(state){
  const round=state.round||0;
  if(round>=DUEL.length)return `<div class="slide-visual duel-done"><p class="callout">${L('¡Muy bien! Ya sabés qué carta gana. Ahora veamos cómo se ganan los puntos.','Well done! You know which card wins. Now let’s see how points are scored.')}</p></div>`;
  const [a,b]=DUEL[round],sa=strength(...a),sb=strength(...b),answer=sa===sb?'tie':sa>sb?'0':'1';
  const feedback=state.feedback?`<p class="duel-feedback ${state.feedback.ok?'ok':'bad'}" role="status">${state.feedback.ok?L('¡Bien!','Right!'):L('No es esa.','Not that one.')} ${esc(state.feedback.why)}</p>`:'';
  return `<div class="slide-visual"><p class="duel-count">${L(`Baza ${round+1} de ${DUEL.length}`,`Baza ${round+1} of ${DUEL.length}`)}</p><div class="duel" data-answer="${answer}">${[a,b].map((c,i)=>`<button type="button" class="duel-card" data-pick="${i}" aria-label="${esc(cardName(cardData(c)))}">${card(cardData(c))}<span>${esc(cardName(cardData(c)))}</span></button>`).join(`<span class="duel-vs">vs</span>`)}</div><button type="button" class="duel-tie" data-pick="tie">${L('Parda (empate)','Parda (tie)')}</button>${feedback}</div>`;
}
// Explanation shown after an answer in the duel.
export function duelWhy(round){
  const [a,b]=DUEL[round],sa=strength(...a),sb=strength(...b),n=c=>cardName(cardData(c));
  if(sa===sb)return L(`${n(a)} y ${n(b)} están en la misma fila de la escala: es parda.`,`${n(a)} and ${n(b)} are on the same row of the ladder: it is a parda.`);
  const [w,l]=sa>sb?[a,b]:[b,a];
  return L(`${n(w)} (fila ${15-Math.max(sa,sb)}) está más arriba que ${n(l)} (fila ${15-Math.min(sa,sb)}).`,`${n(w)} (row ${15-Math.max(sa,sb)}) is higher than ${n(l)} (row ${15-Math.min(sa,sb)}).`);
}
export function duelAnswer(round){const [a,b]=DUEL[round],sa=strength(...a),sb=strength(...b);return sa===sb?'tie':sa>sb?'0':'1';}

// Example hand played baza by baza ("Jugar baza" reveals the next one).
function bazasPart(state,slide){
  const {you,rival}=slide.example,shown=state.step||0,wins=[0,0];
  const cols=you.map((c,i)=>{
    const sy=strength(...c),sr=strength(...rival[i]),winner=sy===sr?-1:sy>sr?0:1,open=i<shown;
    if(open&&winner>=0)wins[winner]++;
    const cell=(cc,who)=>`<div class="baza-card ${open&&winner===who?'wins':''} ${open&&winner===1-who?'loses':''}">${card(cardData(cc))}<span>${esc(cardName(cardData(cc)))}</span></div>`;
    return `<div class="baza-col ${open?'open':''}"><p class="baza-title">Baza ${i+1}</p>${cell(c,0)}<p class="baza-verdict">${open?(winner===-1?L('Parda','Parda'):winner===0?L('▲ mata','▲ mata (beats)'):L('▼ mata','▼ mata (beats)')):'·'}</p>${cell(rival[i],1)}</div>`;
  }).join('');
  const done=shown>=you.length,result=wins[0]>=2?L('Ganaste dos bazas: la mano es tuya.','You won two bazas: the hand is yours.'):wins[1]>=2?L('El rival ganó dos bazas: la mano es suya.','Your opponent won two bazas: the hand is theirs.'):'';
  return `<div class="slide-visual bazas-example"><p class="baza-legend">${L('Arriba: vos · Abajo: rival','Top: you · Bottom: opponent')}</p><div class="baza-cols">${cols}</div><div class="baza-actions">${done?`<p class="callout" role="status">${result}${you.length===2?' '+L('No hace falta la tercera.','No third baza needed.'):''}</p><button type="button" data-baza-reset>${L('Ver de nuevo','Replay')}</button>`:`<button type="button" class="primary" data-baza-next>${L('Jugar baza','Play baza')} ${shown+1}</button>`}</div></div>`;
}
function callsPart(){
  const steps=[['Mano sin cantos','Hand with no calls',1],['Truco','Truco',2],['Retruco','Retruco',3],['Vale Cuatro','Vale Cuatro',4]];
  return `<div class="slide-visual"><ol class="call-steps">${steps.map(([es,en,n],i)=>`<li style="--step:${i}"><strong>${n}</strong><span>${L(es,en)}</span><small>${L(n===1?'punto':'puntos',n===1?'point':'points')}</small></li>`).join('<li class="call-arrow" aria-hidden="true">→</li>')}</ol><p class="call-note">${L('Cada canto se responde con «Quiero» o «No quiero».','Each call is answered with “Quiero” (accept) or “No quiero” (decline).')}</p></div>`;
}
function handHtml(cards){return `<div class="pov-hand">${cards.map(c=>card(cardData(c))).join('')}</div>`;}
function callTrucoPart(state){
  const called=state.called;
  return `<div class="slide-visual pov">${handHtml([[1,'espada'],[3,'basto'],[2,'oro']])}<div class="pov-calls"><button type="button" class="${called?'called':'primary'}" data-call-truco ${called?'disabled':''}>Truco</button><button type="button" disabled>Retruco</button><button type="button" disabled>Vale Cuatro</button></div>${called?`<div class="pov-bubble" role="status"><strong>¡Truco!</strong><p>${L('Si el rival dice «Quiero» y ganás la mano, sumás 2 puntos. Si dice «No quiero», sumás 1 y la mano termina.','If your opponent says “Quiero” and you win the hand, you score 2. If they say “No quiero”, you score 1 and the hand ends.')}</p></div>`:''}</div>`;
}
const ANSWERS={
  quiero:['Quiero','Quiero','Se juega por 2 puntos: quien gane la mano se los lleva.','The hand is played for 2 points: whoever wins it takes them.'],
  noquiero:['No quiero','No quiero','La mano termina enseguida: quien cantó Truco suma 1 punto y se reparte otra vez.','The hand ends at once: the Truco caller scores 1 point and the cards are dealt again.'],
  retruco:['Quiero Retruco','Quiero Retruco','Aceptás y subís: si el otro acepta, se juega por 3. Ahora él puede responder «Quiero Vale Cuatro» y jugar por 4, lo máximo.','You accept and raise: if they accept, the hand is worth 3. Now they may answer “Quiero Vale Cuatro” and play for 4, the maximum.'],
};
function rivalTrucoPart(state){
  const pick=state.answer;
  return `<div class="slide-visual pov rival-pov"><div class="pov-bubble incoming"><strong>¡Truco!</strong></div>${handHtml([[3,'copa'],[5,'espada'],[2,'basto']])}<div class="pov-calls">${Object.entries(ANSWERS).map(([id,[es,en]])=>`<button type="button" data-reply="${id}" class="${pick===id?'called':''}">${esc(L(es,en))}</button>`).join('')}</div>${pick?`<p class="callout" role="status"><strong>${esc(L(ANSWERS[pick][0],ANSWERS[pick][1]))}:</strong> ${esc(L(ANSWERS[pick][2],ANSWERS[pick][3]))}</p>`:''}</div>`;
}
function scoringPart(){
  return `<div class="slide-visual"><div class="score-goal"><div><strong>1 · 2 · 3 · 4</strong><span>${L('puntos por mano, según los cantos','points per hand, depending on the calls')}</span></div><div><strong>15</strong><span>${L('puntos para ganar la partida','points to win the game')}</span></div></div></div>`;
}

export function slideHtml(index,state={}){
  const s=SLIDES[index],lang=L(0,1),parts={rules:rulesPart,suits:suitsPart,ladder:ladderPart,duel:duelPart,bazas:bazasPart,calls:callsPart,callTruco:callTrucoPart,rivalTruco:rivalTrucoPart,scoring:scoringPart};
  const last=index===SLIDES.length-1,locked=(s.kind==='duel'&&(state.round||0)<DUEL.length)||(s.kind==='callTruco'&&!state.called);
  return `<article class="panel slide slide-${s.kind}" aria-label="Tutorial"><header class="slide-head"><p class="coach-step">${L(`Antes de jugar · ${index+1} de ${SLIDES.length}`,`Before playing · ${index+1} of ${SLIDES.length}`)}</p><div class="slide-progress" aria-hidden="true">${SLIDES.map((_,i)=>`<span class="${i<=index?'done':''}"></span>`).join('')}</div><h2>${esc(s.title[lang])}</h2></header><div class="slide-body"><div class="slide-text">${s.body[lang].map(p=>`<p>${terms(p)}</p>`).join('')}</div>${parts[s.kind]?.(state,s)||''}</div><footer class="actions slide-nav"><button id="slide-prev" ${index===0?'disabled':''}>${L('← Anterior','← Previous')}</button><button id="slide-skip">${L('Saltar a la partida','Skip to the game')}</button><button id="slide-next" class="primary" ${locked?'disabled':''}>${last?L('Jugar con Bot Q →','Play with Bot Q →'):L('Siguiente →','Next →')}</button></footer><div id="term-popover" role="dialog" aria-live="polite" hidden></div></article>`;
}
