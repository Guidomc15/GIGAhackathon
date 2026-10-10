import {preferences,savePreference} from './preferences.js';

// Reading time is independent of reduced motion. Every announcement can be skipped.
export class PresentationPlayer {
  constructor(){this.resolve=null;this.timeout=null;this.root=null;}
  controls(){return `<div class="presentation-controls"><button data-skip-presentation class="primary">Skip · Continuar</button><button data-presentation-timer aria-label="Cambiar temporizador: ${preferences.timer?preferences.timer+' segundos':'avance manual'}. Ciclo: 1, 3, 7 segundos, manual."><span aria-hidden="true">⏱</span> <span data-timer-label>${preferences.timer?preferences.timer+' s':'Manual'}</span></button></div>`;}
  wait(root){
    this.root=root;
    return new Promise(resolve=>{
      this.resolve=resolve;
      root.querySelector('[data-skip-presentation]').onclick=()=>this.finish();
      root.querySelector('[data-presentation-timer]').onclick=()=>{
        const sequence=[0,1,3,7];
        savePreference('timer',sequence[(sequence.indexOf(preferences.timer)+1)%sequence.length]);
        root.querySelector('[data-timer-label]').textContent=preferences.timer?preferences.timer+' s':'Manual';
        root.querySelector('[data-presentation-timer]').setAttribute('aria-label',`Cambiar temporizador: ${preferences.timer?preferences.timer+' segundos':'avance manual'}. Ciclo: 1, 3, 7 segundos, manual.`);
        this.schedule();
      };
      this.schedule();
    });
  }
  schedule(){
    clearTimeout(this.timeout);
    if(preferences.timer)this.timeout=setTimeout(()=>this.finish(),preferences.timer*1000);
  }
  finish(){
    clearTimeout(this.timeout);
    const resolve=this.resolve;this.resolve=null;this.root=null;
    resolve?.();
  }
}
