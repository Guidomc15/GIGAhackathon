import {preferences} from './preferences.js';
import {MUSIC_TRACK} from './music-data.js';
import {L} from './i18n.js';

// Looped background track plus browser speech for the calls. Audio starts after a user gesture.
export class SoundMixer {
  constructor(){this.audio=null;this.utterance=null;this.context=null;}
  async unlock(){
    if(!preferences.music)return;
    try{
      if(!this.audio){this.audio=new Audio(MUSIC_TRACK);this.audio.loop=true;this.audio.preload='auto';}
      this.apply();
      if(this.audio.paused&&!document.hidden){await this.audio.play();this.context={state:'running'};}
    }catch{/* Autoplay restrictions never prevent playing. */}
  }
  apply(){
    if(!preferences.voices)this.stopVoice();
    if(!this.audio)return;
    this.audio.volume=Math.min(1,Math.max(0,preferences.musicVolume));
    if(!preferences.music&&!this.audio.paused)this.audio.pause();
  }
  // Calls are proper names of the game, so they are always spoken by a Spanish voice when available.
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
  pause(){this.stopVoice();if(this.audio&&!this.audio.paused)this.audio.pause();}
  status(){return `${typeof Audio==='function'?L('Música disponible','Music available'):L('Música no disponible en este navegador','Music not available in this browser')} · ${window.speechSynthesis&&window.SpeechSynthesisUtterance?L('Voces según las instaladas en tu navegador','Voices depend on those installed in your browser'):L('Voces no disponibles en este navegador','Voices not available in this browser')}`;}
}
