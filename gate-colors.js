import {ROTATION_GATES,rotation} from './gates.js';
export const GATE_COLORS={H:'#ff9d32',X:'#77e08b',Z:'#67d3ff','RY+':'#d2a0ff','RY-':'#d2a0ff'};
export const GATE_COLOR_NAMES={H:'naranja',X:'verde',Z:'celeste','RY+':'violeta','RY-':'violeta'};
for(const gate of ROTATION_GATES){const axis=rotation(gate).axis;GATE_COLORS[gate]={RX:'#ff8585',RY:'#d2a0ff',RZ:'#67d3ff'}[axis];GATE_COLOR_NAMES[gate]={RX:'coral',RY:'violeta',RZ:'celeste'}[axis];}
export const gateStyle=gate=>`--gate-color:${GATE_COLORS[gate]||'#dceee8'}`;
