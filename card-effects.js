import {GATE_COLORS} from './gate-colors.js';
// The split is a visual probability legend, not a spatial division of a qubit.
const remembered=new Map();
let active=[];
export function mountFusionCards(root){
  active.forEach(stop=>stop());active=[];
  root.querySelectorAll('[data-fusion]').forEach(element=>{
    const data=JSON.parse(element.dataset.fusion),key=element.dataset.fusionKey;
    const reduced=()=>!!root.closest('.reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
    const signature=JSON.stringify([data.gates,data.result,data.animate]);
    let state=remembered.get(key);
    if(!state||state.signature!==signature||data.animate&&data.result!==null){state={signature,start:null,frame:0};remembered.set(key,state);}
    if(remembered.size>64)remembered.delete(remembered.keys().next().value);
    const original=element.querySelector('.fusion-original'),linked=element.querySelector('.fusion-linked'),wave=element.querySelector('.fusion-wave');
    let raf=0,stopped=false;
    function tick(time){
      if(stopped||!element.isConnected)return;
      if(state.start===null)state.start=time;
      const elapsed=time-state.start,measured=data.result!==null;
      let probability=data.probability,color='#7dffd4';
      if(measured){
        const target=data.result===0?1:0;
        const t=reduced()||!data.animate?1:Math.min(1,elapsed/720);
        // This easing illustrates collapse only; it is not a computed intermediate state.
        probability=data.probability+(target-data.probability)*(t*t*(3-2*t));
        element.style.setProperty('--collapse-light',String(data.animate&&!reduced()?Math.sin(t*Math.PI):0));
      }else if(data.trajectory?.length){
        state.frame=reduced()?data.trajectory.length-1:Math.min(data.trajectory.length-1,elapsed/22);
        probability=(1+data.trajectory[Math.floor(state.frame)][2])/2;
        const segment=data.segments?.find(s=>state.frame>=s.start&&state.frame<=s.end);
        color=GATE_COLORS[segment?.gate]||color;
      }
      probability=Math.max(0,Math.min(1,probability));
      const amplitude=reduced()?0:Math.min(probability,1-probability)*7;
      const ripples=Array.from({length:21},(_,i)=>Math.sin(i*.55+time/450));
      const mean=(ripples.reduce((a,b)=>a+b,0)-.5*(ripples[0]+ripples[20]))/20;
      const points=ripples.map((r,i)=>{
        const x=i*5,y=160*probability+amplitude*(r-mean);
        return [x,Math.max(0,Math.min(160,y))];
      });
      const boundary=points.map(([x,y])=>`${x}% ${y/1.6}%`).join(',');
      original.style.clipPath=`polygon(0% 0%,100% 0%,${points.slice().reverse().map(([x,y])=>`${x}% ${y/1.6}%`).join(',')})`;
      linked.style.clipPath=`polygon(${boundary},100% 100%,0% 100%)`;
      wave.setAttribute('d',points.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join(' '));
      wave.style.stroke=color;
      wave.style.opacity=probability>.001&&probability<.999?'1':'0';
      element.classList.toggle('fusion-active',!measured&&probability>.001&&probability<.999);
      const panel=element.closest('.fusion-editor');
      if(panel){
        panel.querySelector('[data-probability-zero]').textContent=(100*probability).toFixed(1)+' %';
        panel.querySelector('[data-probability-one]').textContent=(100*(1-probability)).toFixed(1)+' %';
      }
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    active.push(()=>{stopped=true;cancelAnimationFrame(raf);});
  });
}
