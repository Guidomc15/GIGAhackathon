// Settings are optional: the game also works when browser storage is blocked.
const KEY='qriollo.preferences.v1';
// Default language follows the browser: Spanish for Spanish speakers, English otherwise.
const browserLanguage=(navigator.languages?.[0]||navigator.language||'en').toLowerCase().startsWith('es')?'es':'en';
export const preferences={timer:0,voices:true,voiceVolume:.85,language:browserLanguage};
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  if([0,1,3,7].includes(saved.timer))preferences.timer=saved.timer;
  if(typeof saved.voices==='boolean')preferences.voices=saved.voices;
  if(Number.isFinite(saved.voiceVolume))preferences.voiceVolume=Math.min(1,Math.max(0,saved.voiceVolume));
  if(['es','en'].includes(saved.language))preferences.language=saved.language;
}catch{}
export function savePreference(key,value){
  preferences[key]=value;
  try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{}
}
