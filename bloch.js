import {GATE_COLORS} from './gate-colors.js';
import {AXIS_COLORS} from './i18n.js';
/* Adapted from Qollab, Interactive Bloch Sphere, owner qollab.
 * https://qollab.xyz/u/qollab/interactive-bloch-sphere
 * The supplied upstream export is not present in this checkout; see notices.
 * Reused: projection, front/back rings and axes, arrow, equatorial guide,
 * idle camera spin and pointer drag. No upstream gate UI or sampling imported.
 * Qriollo changes: lifecycle, keyboard view control, reduced motion, colors,
 * Qiskit unitary path/prefix markers and explicit measurement collapse.
 * No upstream license was included in the supplied export. See notices.
 */
const PI=Math.PI;
const remembered=new Map();
let active=[];
export function mountBloch(root){
  active.forEach(stop=>stop()); active=[];
  root.querySelectorAll('canvas.interactive-bloch').forEach((cv,index)=>{
    const data=JSON.parse(cv.dataset.bloch);
    const key=cv.dataset.blochKey+'-'+index;
    const signature=JSON.stringify([data.gates,data.collapse,data.activeStep]);
    let state=remembered.get(key);
    if(!state)state={az:-.55,el:.32,shown:[0,0,1],autoSpin:true,signature:null};
    if(state.signature!==signature){
      state.frames=data.trajectory;state.frame=data.activeStep===null?0:data.segments[data.activeStep].start;state.lastTime=null;
      state.shown=[...state.frames[Math.floor(state.frame)]];state.signature=signature;
    }
    remembered.set(key,state);
    if(remembered.size>64)remembered.delete(remembered.keys().next().value);
    const reduced=()=>!!root.closest('.reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height, CX = W / 2, CY = H / 2, R = W * 0.34;

let {az,el,shown,autoSpin} = state;   // slow idle rotation, stops the first time you drag

function project(p) {
  const ca = Math.cos(az), sa = Math.sin(az);
  const x1 = p[0] * ca - p[1] * sa;
  const y1 = p[0] * sa + p[1] * ca;
  const ce = Math.cos(el), se = Math.sin(el);
  const y2 = y1 * ce - p[2] * se;
  const z2 = y1 * se + p[2] * ce;
  return { x: CX + x1 * R, y: CY - z2 * R, d: y2 };
}

function ring(fn, front) {
  ctx.beginPath();
  let open = false;
  for (let i = 0; i <= 160; i++) {
    const p = project(fn((i / 160) * 2 * PI));
    if ((p.d <= 0) === front) {
      if (open) { ctx.lineTo(p.x, p.y); } else { ctx.moveTo(p.x, p.y); open = true; }
    } else { open = false; }
  }
  ctx.stroke();
}

const RINGS = [
  function (t) { return [Math.cos(t), Math.sin(t), 0]; },
  function (t) { return [Math.cos(t), 0, Math.sin(t)]; },
  function (t) { return [0, Math.cos(t), Math.sin(t)]; }
];

// Each axis keeps one colour; explanations paint the letters X, Y and Z with the same colour.
const AXES = [
  { a: [1, 0, 0], lab: 'X', c: AXIS_COLORS.X }, { a: [-1, 0, 0], lab: '', c: AXIS_COLORS.X },
  { a: [0, 1, 0], lab: 'Y', c: AXIS_COLORS.Y }, { a: [0, -1, 0], lab: '', c: AXIS_COLORS.Y },
  { a: [0, 0, 1], lab: 'Z', c: AXIS_COLORS.Z }, { a: [0, 0, -1], lab: '', c: AXIS_COLORS.Z }
];
const POLES = [{ a: [0, 0, 1], lab: '|0⟩' }, { a: [0, 0, -1], lab: '|1⟩' }];
// The other four poles: the equator states of the X and Y axes, in the colour of their axis.
const EQUATOR_POLES = [
  { a: [1, 0, 0], lab: '|+⟩', c: AXIS_COLORS.X }, { a: [-1, 0, 0], lab: '|−⟩', c: AXIS_COLORS.X },
  { a: [0, 1, 0], lab: '|+i⟩', c: AXIS_COLORS.Y }, { a: [0, -1, 0], lab: '|−i⟩', c: AXIS_COLORS.Y }
];

function axis(v, front) {
  const o = project([0, 0, 0]);
  const p = project(v);
  if ((p.d <= 0) !== front) { return; }
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function arrow(v) {
  const o = project([0, 0, 0]);
  const p = project(v);
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  const g = ctx.createLinearGradient(o.x, o.y, p.x, p.y);
  g.addColorStop(0, '#ff3b30');
  g.addColorStop(1, '#ff1717');
  ctx.strokeStyle = g;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.fillStyle = '#ff1717';
  if (len > 0.02) {
    const ang = Math.atan2(p.y - o.y, p.x - o.x);
    const hw = 0.42, hl = 26;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - hl * Math.cos(ang - hw), p.y - hl * Math.sin(ang - hw));
    ctx.lineTo(p.x - hl * Math.cos(ang + hw), p.y - hl * Math.sin(ang + hw));
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(o.x, o.y, 9, 0, 2 * PI);
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const g = ctx.createRadialGradient(CX - R * 0.4, CY - R * 0.5, R * 0.1, CX, CY, R * 1.25);
  g.addColorStop(0, 'rgba(76,194,255,0.13)');
  g.addColorStop(1, 'rgba(76,194,255,0.02)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, 2 * PI);
  ctx.fill();

  // back half of the globe
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(183,232,225,0.22)';
  for (let i = 0; i < RINGS.length; i++) { ring(RINGS[i], false); }
  ctx.globalAlpha = .45;
  for (let i = 0; i < AXES.length; i++) { ctx.strokeStyle = AXES[i].c; axis(AXES[i].a, false); }
  ctx.globalAlpha = 1;

  ctx.save();ctx.lineWidth=4;
  // Segment boundaries come from the Qiskit path, so shared endpoints are exact.
  (data.segments||[]).forEach(({gate,start,end},index)=>{
    ctx.globalAlpha=data.activeStep===null||index===data.activeStep?1:.2;ctx.strokeStyle=GATE_COLORS[gate];ctx.setLineDash(index===0?[]:index===1?[10,4]:[3,4]);ctx.beginPath();
    data.trajectory.slice(start,end+1).forEach((v,i)=>{const p=project(v);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();
  });
  ctx.globalAlpha=1;ctx.setLineDash([]);
  ctx.font='30px ui-monospace,monospace';ctx.fillStyle='#ffecac';
  data.steps.forEach((v,i)=>{ctx.fillStyle=i?GATE_COLORS[data.gates[i-1]]:'#ffecac';const p=project(v);ctx.beginPath();ctx.arc(p.x,p.y,4,0,2*PI);ctx.fill();ctx.fillText(String(i),p.x+9,p.y-9);});
  ctx.restore();
  arrow(shown);

  if(data.collapse!==null){
    const before=project(data.trajectory[data.trajectory.length-1]),after=project(data.vector);
    ctx.save();ctx.setLineDash([6,8]);ctx.strokeStyle='#fff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(before.x,before.y);ctx.lineTo(after.x,after.y);ctx.stroke();ctx.restore();
  }
  // dashed guide down to the equatorial plane
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(163,255,193,0.45)';
  const flat = project([shown[0], shown[1], 0]);
  const tip = project(shown);
  const orig = project([0, 0, 0]);
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(flat.x, flat.y);
  ctx.lineTo(orig.x, orig.y);
  ctx.stroke();
  ctx.restore();

  // front half
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = 'rgba(183,232,225,0.6)';
  for (let i = 0; i < RINGS.length; i++) { ring(RINGS[i], true); }
  ctx.lineWidth = 3.5;
  for (let i = 0; i < AXES.length; i++) { ctx.strokeStyle = AXES[i].c; axis(AXES[i].a, true); }

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(183,232,225,0.35)';
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, 2 * PI);
  ctx.stroke();

  ctx.font = '700 40px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < AXES.length; i++) {
    if (!AXES[i].lab) { continue; }
    const a = AXES[i].a, k = a[2] ? 1.42 : 1.4;
    const p = project([a[0] * k, a[1] * k, a[2] * k]);
    ctx.globalAlpha = (p.d <= 0) ? 1 : .45;
    ctx.fillStyle = AXES[i].c;
    ctx.fillText(AXES[i].lab, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.font = '700 34px ui-monospace, Menlo, monospace';
  for (let i = 0; i < POLES.length; i++) {
    const a = POLES[i].a, p = project([a[0] * 1.16, a[1] * 1.16, a[2] * 1.16]);
    ctx.fillStyle = (p.d <= 0) ? '#f4f1e6' : 'rgba(244,241,230,0.5)';
    ctx.fillText(POLES[i].lab, p.x + 34, p.y);
  }
  ctx.font = '700 32px ui-monospace, Menlo, monospace';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(10,16,14,0.85)';
  for (const pole of EQUATOR_POLES) {
    const p = project(pole.a.map(v => v * 1.14));
    ctx.globalAlpha = (p.d <= 0) ? 1 : .7;
    ctx.fillStyle = pole.c;
    ctx.strokeText(pole.lab, p.x, p.y);
    ctx.fillText(pole.lab, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  state.az=az; state.el=el; state.shown=shown; state.autoSpin=autoSpin;
}
let dragging = false, lastX = 0, lastY = 0;
cv.addEventListener('pointerdown', function (e) {
  dragging = true; autoSpin = false; lastX = e.clientX; lastY = e.clientY;
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', function (e) {
  if (!dragging) { return; }
  az += (e.clientX - lastX) * 0.012;
  el += (e.clientY - lastY) * 0.012;
  el = Math.max(-1.35, Math.min(1.35, el));
  lastX = e.clientX; lastY = e.clientY;
});
cv.addEventListener('pointerup', function () { dragging = false; });
cv.addEventListener('pointercancel', function () { dragging = false; });

    cv.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;
      e.preventDefault();autoSpin=false;
      if(e.key==='Home'){az=-.55;el=.32;}
      else if(e.key==='ArrowLeft')az-=.12;
      else if(e.key==='ArrowRight')az+=.12;
      else el=Math.max(-1.35,Math.min(1.35,el+(e.key==='ArrowDown'?.12:-.12)));
      draw();
    });
    // Lessons can slow the path down (data.speed, ms per frame) and repeat it (data.loop).
    const speed=data.speed||22;
    const replay=cv.closest('.lesson-sphere,.gate-demo')?.querySelector('[data-replay-step],[data-replay]');
    if(replay)replay.onclick=()=>{state.frame=data.activeStep===null||data.activeStep===undefined?0:data.segments[data.activeStep].start;state.lastTime=null;state.hold=null;shown=[...state.frames[Math.floor(state.frame)]];draw();};
    let raf=0, stopped=false;
    function tick(time){
      if(stopped||!cv.isConnected)return;
      if(reduced()){shown=[...data.vector];}
      else {
        if(state.lastTime!==null)state.frame=Math.min(state.frames.length-1,state.frame+(time-state.lastTime)/speed);
        shown=[...state.frames[Math.floor(state.frame)]];
        if(state.frame===state.frames.length-1){
          shown=[...data.vector];
          if(data.loop&&state.frames.length>1){state.hold??=time+1600;if(time>=state.hold){state.frame=0;state.hold=null;}}
        }
        if(autoSpin)az+=.0015;
      }
      state.lastTime=time;
      draw();raf=requestAnimationFrame(tick);
    }
    active.push(()=>{stopped=true;cancelAnimationFrame(raf);state.lastTime=null;});
    raf=requestAnimationFrame(tick);
  });
}
