import {ROTATION_GATES,rotation} from './gates.js';
import {L} from './i18n.js';
// Rotation colours match the Bloch axis they turn around: RX coral, RY violet, RZ light blue.
export const GATE_COLORS={H:'#ff9d32',X:'#77e08b',Z:'#67d3ff'};
const NAMES={'#ff9d32':['naranja','orange'],'#77e08b':['verde','green'],'#67d3ff':['celeste','light blue'],'#d2a0ff':['violeta','violet'],'#ff8585':['coral','coral']};
for(const gate of ROTATION_GATES)GATE_COLORS[gate]={RX:'#ff8585',RY:'#d2a0ff',RZ:'#67d3ff'}[rotation(gate).axis];
export const gateColorName=gate=>{const n=NAMES[GATE_COLORS[gate]];return n?L(n[0],n[1]):'';};
export const gateStyle=gate=>`--gate-color:${GATE_COLORS[gate]||'#dceee8'}`;
