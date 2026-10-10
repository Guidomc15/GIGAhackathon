// Fixed angles are also defined in truco/gates.py; rotations are never sliders.
export const ANGLES=['pi/2','pi/6','-pi/6','pi/3','pi/67'];
export const ROTATION_GATES=['RX','RY','RZ'].flatMap(axis=>ANGLES.map(angle=>`${axis}:${angle}`));
export function rotation(gate){
  if(gate==='RY+'||gate==='RY-')return {axis:'RY',angle:gate==='RY+'?'pi/6':'-pi/6'};
  const [axis,angle]=gate.split(':');return ANGLES.includes(angle)&&['RX','RY','RZ'].includes(axis)?{axis,angle}:null;
}
export function gateLabel(gate){const r=rotation(gate);return r?`${r.axis} ${r.angle.replace('pi','π').replace('-', '−')}`:gate;}
export function gateDescription(gate){
  const r=rotation(gate);
  if(r)return `${gateLabel(gate)}: gira alrededor de ${r.axis.slice(1)}. ${r.axis==='RZ'?'Cambia la fase; conserva las probabilidades de esta medición.':'Las probabilidades dependen del estado que dejó la compuerta anterior.'}`;
  return {H:'Combina las amplitudes. Desde la original da 50/50; después depende del circuito.',X:'Intercambia las amplitudes de ambas cartas. Solo hay una X en el mazo.',Z:'Cambia la fase; puede cambiar el efecto de una H posterior.'}[gate]||gate;
}
