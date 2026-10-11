// Settings are optional: the game also works when browser storage is blocked.
const KEY='qriollo.preferences.v1';
// Default language follows the browser: Spanish for Spanish speakers, English otherwise.
const browserLanguage=(navigator.languages?.[0]||navigator.language||'en').toLowerCase().startsWith('es')?'es':'en';
export const preferences={timer:0,music:true,voices:true,musicVolume:.35,voiceVolume:.85,language:browserLanguage};
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  if([0,1,3,7].includes(saved.timer))preferences.timer=saved.timer;
  for(const key of ['music','voices'])if(typeof saved[key]==='boolean')preferences[key]=saved[key];
  for(const key of ['musicVolume','voiceVolume'])if(Number.isFinite(saved[key]))preferences[key]=Math.min(1,Math.max(0,saved[key]));
  if(['es','en'].includes(saved.language))preferences.language=saved.language;
}catch{}
export function savePreference(key,value){
  preferences[key]=value;
  try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{}
}
