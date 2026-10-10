// Edit these phrases to give the table a different voice. They never alter rules.
export const PHRASES={
  truco:['¡Truco!'], retruco:['¡Retruco!'], vale4:['¡Vale cuatro!'],
  envido:['¡Envido!'], real:['¡Real envido!'], falta:['¡Falta envido!'],
  accept:['¡Quiero!'], reject:['No quiero.'], fold:['Me voy al mazo.'],
};
const numbers=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve','treinta','treinta y uno','treinta y dos','treinta y tres'];
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
