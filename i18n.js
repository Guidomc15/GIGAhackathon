// Interface language. Game terms (Truco, Envido, Quiero…) are proper names and stay in Spanish.
import {preferences} from './preferences.js';
export const lang=()=>preferences.language;
export const L=(es,en)=>preferences.language==='en'?en:es;
const SUITS={espada:['espada','Swords'],basto:['basto','Clubs'],oro:['oro','Coins'],copa:['copa','Cups']};
export const suitName=suit=>L(SUITS[suit][0],SUITS[suit][1]);
export const cardName=c=>c?L(`${c.number} de ${SUITS[c.suit][0]}`,`${c.number} of ${SUITS[c.suit][1]}`):'';
// Bloch-sphere axis colours. The same colours mark the axis letters in every explanation.
export const AXIS_COLORS={X:'#ff8585',Y:'#d2a0ff',Z:'#67d3ff'};
// Text already escaped: [X], [Y] and [Z] become axis letters in the colour of their axis.
export const axes=html=>String(html).replace(/\[(X|Y|Z)\]/g,(_,a)=>`<b class="axis axis-${a.toLowerCase()}" style="color:${AXIS_COLORS[a]}">${a}</b>`);

// In the practice with Bot Q the player is called «Vos» / «You»: texts about that player
// use the second person («Ganaste la baza») instead of «Ganó la baza Vos».
export const isYou=name=>name==='Vos'||name==='You';
