import {L} from './i18n.js';
// Calls are proper names of the game: they stay in Spanish in both languages.
export const PHRASES={
  truco:['¡Truco!'], retruco:['¡Retruco!'], vale4:['¡Vale cuatro!'],
  envido:['¡Envido!'], real:['¡Real envido!'], falta:['¡Falta envido!'],
  accept:['¡Quiero!'], reject:['No quiero.'], fold:['Me voy al mazo.'],
};
const numbers=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve','treinta','treinta y uno','treinta y dos','treinta y tres'];
// Text spoken aloud (Spanish voice).
export function speechText(event){
  const amount=numbers[event.value]??String(event.value);
  if(event.speech==='envido_first')return `Quiero, ${amount}.`;
  if(event.speech==='envido_answer'){
    if(event.tie&&event.mano)return `${amount} también, y soy mano.`;
    if(event.better)return `${amount} son mejores.`;
    return 'Son buenas.';
  }
  const options=PHRASES[event.speech];return options?options[Math.floor(Math.random()*options.length)]:event.text;
}
// Text shown on screen: the call itself plus a short gloss in English.
const GLOSS={truco:'raise: the hand is worth 2',retruco:'raise: the hand is worth 3',vale4:'raise: the hand is worth 4',envido:'bet 2 points on the envido count',real:'bet 3 points on the envido count',falta:'bet what the leader needs to reach 15',accept:'I accept',reject:'I decline',fold:'I give up the hand'};
export function displayText(event){
  if(event.speech==='envido_first')return L(`Quiero, ${event.value}.`,`Quiero — my count is ${event.value}.`);
  if(event.speech==='envido_answer'){
    if(event.tie&&event.mano)return L(`${event.value} también, y soy mano.`,`${event.value} too — and I am mano, so ties are mine.`);
    if(event.better)return L(`${event.value} son mejores.`,`${event.value} — mine are better.`);
    return L('Son buenas.','Son buenas — yours are better.');
  }
  const call=PHRASES[event.speech]?.[0]??event.text;
  return L(call,GLOSS[event.speech]?`${call} (${GLOSS[event.speech]})`:call);
}
