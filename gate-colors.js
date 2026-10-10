// Shared palette for gate tiles, circuit positions and Qiskit trajectory segments.
export const GATE_COLORS={H:'#ff9d32',X:'#77e08b',Z:'#67d3ff','RY+':'#d2a0ff','RY-':'#ffe477'};
export const GATE_COLOR_NAMES={H:'naranja',X:'verde',Z:'celeste','RY+':'violeta','RY-':'amarillo'};
export const gateStyle=gate=>`--gate-color:${GATE_COLORS[gate]||'#dceee8'}`;
