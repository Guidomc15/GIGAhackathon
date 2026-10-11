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
};
const DEFINITIONS={bazas:'baza',palos:'palo',pardas:'parda',bravas:'brava',anchos:'ancho','anchos falsos':'falso'};

// Escaped text with **terms**: bold, and clickable when they have a definition.
export function terms(text){
  return esc(text).replace(/\*\*(.+?)\*\*/g,(_,word)=>{
    const key=word.toLowerCase(),id=GLOSSARY[key]?key:DEFINITIONS[key];
    return id?`<button type="button" class="term" data-term="${id}" aria-haspopup="dialog">${word}</button>`:`<strong class="term-plain">${word}</strong>`;
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
  if(round>=DUEL.length)return `<div class="slide-visual duel-done"><p class="callout">${L('¡Muy bien! Ya sabés qué carta gana. Ahora juguemos una partida con Bot Q.','Well done! You know which card wins. Now let’s play a game with Bot Q.')}</p></div>`;
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

export function slideHtml(index,state={}){
  const s=SLIDES[index],lang=L(0,1),parts={rules:rulesPart,suits:suitsPart,ladder:ladderPart,duel:duelPart};
  const last=index===SLIDES.length-1,locked=s.kind==='duel'&&(state.round||0)<DUEL.length;
  return `<article class="panel slide slide-${s.kind}" aria-label="Tutorial"><header class="slide-head"><p class="coach-step">${L(`Antes de jugar · ${index+1} de ${SLIDES.length}`,`Before playing · ${index+1} of ${SLIDES.length}`)}</p><div class="slide-progress" aria-hidden="true">${SLIDES.map((_,i)=>`<span class="${i<=index?'done':''}"></span>`).join('')}</div><h2>${esc(s.title[lang])}</h2></header><div class="slide-body"><div class="slide-text">${s.body[lang].map(p=>`<p>${terms(p)}</p>`).join('')}</div>${parts[s.kind]?.(state)||''}</div><footer class="actions slide-nav"><button id="slide-prev" ${index===0?'disabled':''}>${L('← Anterior','← Previous')}</button><button id="slide-skip">${L('Saltar a la partida','Skip to the game')}</button><button id="slide-next" class="primary" ${locked?'disabled':''}>${last?L('Jugar con Bot Q →','Play with Bot Q →'):L('Siguiente →','Next →')}</button></footer><div id="term-popover" role="dialog" aria-live="polite" hidden></div></article>`;
}
