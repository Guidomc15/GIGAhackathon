// Fixed angles are also defined in truco/gates.py; rotations are never sliders.
import {L} from './i18n.js';
export const ANGLES=['pi/2','pi/6','-pi/6','pi/3'];
export const ROTATION_GATES=['RX','RY','RZ'].flatMap(axis=>ANGLES.map(angle=>`${axis}:${angle}`));
const DEGREES={'pi/2':'90°','pi/6':'30°','-pi/6':'−30°','pi/3':'60°'};
export function rotation(gate){
  const [axis,angle]=gate.split(':');return ANGLES.includes(angle)&&['RX','RY','RZ'].includes(axis)?{axis,angle}:null;
}
export function gateLabel(gate){const r=rotation(gate);return r?`${r.axis} ${r.angle.replace('pi','π').replace('-', '−')}`:gate;}
// Short help for each token. [X], [Y], [Z] are painted with the colour of that Bloch axis.
export function gateDescription(gate){
  const r=rotation(gate);
  if(r){
    const a=r.axis.slice(1),deg=DEGREES[r.angle];
    return a==='Z'?L(`${gateLabel(gate)}: gira ${deg} alrededor del eje [Z]. Cambia la fase: no cambia los porcentajes ahora, pero sí lo que haga una H después.`,`${gateLabel(gate)}: turns ${deg} around the [Z] axis. It changes the phase: today's percentages stay the same, but a later H behaves differently.`)
      :L(`${gateLabel(gate)}: gira ${deg} alrededor del eje [${a}]. Pasa probabilidad entre la original y la ligada; cuánto depende del estado que recibe.`,`${gateLabel(gate)}: turns ${deg} around the [${a}] axis. It moves probability between original and linked; how much depends on the state it receives.`);
  }
  return {H:L('H: media vuelta alrededor del eje diagonal entre [X] y [Z]. Desde la original deja 50 % / 50 %; después depende del circuito.','H: half turn around the diagonal axis between [X] and [Z]. From the original it gives 50% / 50%; later it depends on the circuit.'),
    X:L('X: media vuelta alrededor del eje [X]. Cambia la original por la ligada y al revés. Hay una sola X en el mazo.','X: half turn around the [X] axis. It swaps original and linked. There is only one X in the deck.'),
    Z:L('Z: media vuelta alrededor del eje [Z]. Cambia la fase: no cambia los porcentajes ahora, pero sí lo que haga una H después.','Z: half turn around the [Z] axis. It changes the phase: today\'s percentages stay the same, but a later H behaves differently.')}[gate]||gate;
}
