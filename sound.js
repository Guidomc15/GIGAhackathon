import {preferences} from './preferences.js';
import {L} from './i18n.js';

// The game has no music: the only sound is the browser's speech for the calls.
export class SoundMixer {
  constructor(){this.utterance=null;}
  apply(){if(!preferences.voices)this.stopVoice();}
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
  status(){return window.speechSynthesis&&window.SpeechSynthesisUtterance?L('Voces según las instaladas en tu navegador','Voices depend on those installed in your browser'):L('Voces no disponibles en este navegador','Voices not available in this browser');}
}
