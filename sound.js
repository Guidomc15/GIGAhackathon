import {preferences} from './preferences.js';

// Original procedural music: no recording, external download or audio dependency.
export class SoundMixer {
  constructor(){this.context=null;this.gain=null;this.loop=null;this.beat=0;this.utterance=null;}
  async unlock(){
    if(!preferences.music)return;
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return;
    try{
      if(!this.context){this.context=new Context();this.gain=this.context.createGain();this.gain.connect(this.context.destination);}
      await this.context.resume();this.apply();
    }catch{/* Autoplay restrictions never prevent playing. */}
  }
  apply(){
    if(!preferences.voices)this.stopVoice();
    if(!this.context)return;
    this.gain.gain.setTargetAtTime(preferences.music?preferences.musicVolume*.35:0,this.context.currentTime,.08);
    if(preferences.music&&!this.loop){this.loop=setInterval(()=>this.note(),460);this.note();}
    if(!preferences.music&&this.loop){clearInterval(this.loop);this.loop=null;}
  }
  note(){
    if(document.hidden||this.context.state!=='running')return;
    const melody=[196,246.94,293.66,246.94,220,261.63,329.63,261.63,174.61,220,261.63,220,146.83,196,246.94,196];
    const now=this.context.currentTime;
    const play=(hz,volume)=>{
      const oscillator=this.context.createOscillator(),envelope=this.context.createGain();
      oscillator.type='triangle';oscillator.frequency.value=hz;
      envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(volume,now+.015);
      envelope.gain.exponentialRampToValueAtTime(.0001,now+.42);
      oscillator.connect(envelope);envelope.connect(this.gain);oscillator.start(now);oscillator.stop(now+.45);
      oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
    };
    play(melody[this.beat%melody.length],.35);
    if(this.beat%4===0)play(melody[this.beat%melody.length]/2,.3);
    this.beat++;
  }
  speak(text){
    if(!preferences.voices||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
    this.stopVoice();
    const utterance=new SpeechSynthesisUtterance(text);
    const available=speechSynthesis.getVoices();
    utterance.voice=available.find(v=>v.lang==='es-AR'&&v.localService)||available.find(v=>v.lang.startsWith('es')&&v.localService)||available.find(v=>v.lang.startsWith('es'))||null;
    utterance.lang='es-AR';utterance.rate=.95;utterance.volume=preferences.voiceVolume;
    this.utterance=utterance;speechSynthesis.speak(utterance);
  }
  stopVoice(){if(window.speechSynthesis)speechSynthesis.cancel();this.utterance=null;}
  pause(){this.stopVoice();if(this.context?.state==='running')this.context.suspend().catch(()=>{});}
  status(){return `${window.AudioContext||window.webkitAudioContext?'Música disponible':'Música no disponible en este navegador'} · ${window.speechSynthesis&&window.SpeechSynthesisUtterance?'Voces según las instaladas en tu navegador':'Voces no disponibles en este navegador'}`;}
}
