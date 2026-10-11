// Language switch, Hard level, Confirm, axis colours, voices, timers and scroll; the game has no music.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRUCO_URL||'http://127.0.0.1:8000';
const output=process.env.ARTIFACT_DIR||'/tmp/truco-settings';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
 try{
  // No saved language: an English browser must open the English interface.
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',locale:'en-US'});
  await page.addInitScript(()=>{
   localStorage.setItem('qriollo.preferences.v1',JSON.stringify({voices:true,timer:0,voiceVolume:.45}));
   window.spoken=[];window.voiceCancels=0;window.played=[];
   speechSynthesis.speak=utterance=>window.spoken.push({text:utterance.text,volume:utterance.volume});
   speechSynthesis.cancel=()=>window.voiceCancels++;
   HTMLMediaElement.prototype.play=function(){window.played.push({src:this.src.slice(0,22),loop:this.loop,volume:this.volume});Object.defineProperty(this,'paused',{value:false,configurable:true});return Promise.resolve();};
   HTMLMediaElement.prototype.pause=function(){Object.defineProperty(this,'paused',{value:true,configurable:true});window.paused=(window.paused||0)+1;};
  });
  page.setDefaultTimeout(12000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const idle=()=>page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')==='false');
  const drain=async()=>{
   for(let i=0;i<180;i++){
    if(await page.locator('[data-skip-presentation]').count())await page.locator('[data-skip-presentation]').click();
    if(await page.locator('#stage').getAttribute('aria-busy')==='false')return;
    await page.waitForTimeout(80);
   }
   throw Error('Presentation did not finish');
  };
  const click=async selector=>{await idle();await page.locator(selector).click();await drain();};
  const state=async action=>await (await page.request.post(base+'/api',{data:{method:'dispatch_json',arg:JSON.stringify({action})}})).json();
  const noOverflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base);await page.locator('#start').waitFor();
  // Home from the team sketch: logo, tagline and four plaques, all in the chosen language.
  assert.deepEqual(await page.locator('.home-menu .plaque').allInnerTexts(),['Tutorial','Quick game','Quick help','Credits']);
  assert.match(await page.locator('.home-tagline').innerText(),/Argentine way to learn quantum computing/);
  assert.equal(await page.locator('.home-logo img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');
  // No music: the sound menu only has the voices, and nothing ever plays an audio track.
  await page.locator('.menu-sound summary').click();
  assert.equal(await page.locator('#disable-music,#music-volume').count(),0);
  await page.locator('#disable-voices').check();
  assert((await page.evaluate(()=>window.voiceCancels))>0);
  await page.locator('#disable-voices').uncheck();
  await page.locator('.menu-sound summary').click();
  assert.equal(await page.locator('.menu-sound[open]').count(),0);
  await click('#values');assert.match(await page.locator('.help').innerText(),/Card values/);
  await click('#full-rules');
  assert(await page.locator('.rules-tabs button').count()>=6,'Rules are split into tabs');
  await page.locator('.rules-tabs button',{hasText:'Envido'}).first().click();
  assert.match(await page.locator('.rules-guide').innerText(),/15 minus the leading score/);
  await noOverflow();
  // The header switch changes every screen at once.
  await page.locator('#language').selectOption('es');
  assert.match(await page.locator('.rules-guide').innerText(),/15 menos el puntaje/);
  assert.equal(await page.locator('#home').innerText(),'Inicio');
  await page.locator('#language').selectOption('en');
  await click('#home');await click('#menu-credits');assert.match(await page.locator('.credits-page').innerText(),/Gaspar Osterrieth/);
  // Quick game goes straight to the first hand with default names; then back to the custom setup.
  await click('#home');await click('#quick');
  assert.match(await page.locator('.round-meta').innerText(),/Player 1: 0 · Player 2: 0/);
  await click('#home');await click('#start');
  assert.equal(await page.locator('#noise-mode').count(),0,'Noise was removed');
  await page.locator('[name="difficulty"][value="hard"]').check();
  await click('#deal');
  assert.match(await page.locator('.round-meta').innerText(),/Hard level/);
  // First player: two removals, then removing is blocked and the engine explains why in English.
  await click('[data-card="0"]');await click('#activate-quantum');
  assert.equal(await page.locator('#lock-circuit').innerText(),'Confirm');
  assert.equal(await page.locator('#lock-ok').count(),0,'Confirm needs no checkbox');
  await click('[data-token="0"]');await click('[data-token="1"]');
  assert.match(await page.locator('.removals').innerText(),/removals left: 2 of 2/);
  await click('#undo');await click('#undo');
  assert.match(await page.locator('.removals').innerText(),/removals left: 0 of 2/);
  await click('[data-token="2"]');
  assert(await page.locator('#undo').isDisabled());assert(await page.locator('#reset').isDisabled());
  assert(await page.locator('[data-remove="0"]').isDisabled());
  const blocked=await (await page.request.post(base+'/api',{data:{method:'dispatch_json',arg:JSON.stringify({action:'edit',value:[],lang:'en'})}})).json();
  assert.equal(blocked.error,'Hard mode: you already used your 2 gate removals this hand');
  // Axis letters use the colour of their Bloch axis; there is no noise data anymore.
  assert.equal(await page.locator('.composer-sphere .axis-x').first().evaluate(el=>getComputedStyle(el).color),'rgb(255, 133, 133)');
  assert.equal(await page.locator('.composer-sphere .axis-z').first().evaluate(el=>getComputedStyle(el).color),'rgb(103, 211, 255)');
  assert.equal((await state('reveal')).private.quantum.preview.noise,undefined);
  await page.screenshot({path:path.join(output,'composer-hard-en.png'),fullPage:true});
  await click('#lock-circuit');
  await click('[data-card="0"]');await click('#activate-quantum');
  const tokens=(await state('reveal')).private.quantum.tokens;
  const index=tokens.findIndex(token=>token==='H'||token==='X'||token.startsWith('RX:')||token.startsWith('RY:'));
  if(index>=0)await click(`[data-token="${index}"]`);
  await click('#lock-circuit');
  assert.equal(await page.locator('.identity-probabilities p').count(),2);
  await page.screenshot({path:path.join(output,'table-en-mobile.png'),fullPage:true});
  const call=page.locator('[data-action="truco"]');await call.scrollIntoViewIfNeeded();
  const scroll=await page.evaluate(()=>scrollY);
  await call.click();await page.locator('[data-skip-presentation]').waitFor();
  assert.match(await page.locator('.speech-bubble h2').innerText(),/¡Truco! \(raise: the hand is worth 2\)/);
  assert.equal(await page.locator('[data-skip-presentation]').innerText(),'Continue');
  assert.equal(await page.locator('[data-timer-label]').innerText(),'Manual');
  assert(Math.abs(await page.evaluate(()=>scrollY)-scroll)<=2,'Announcement moved page scroll');
  for(const label of ['1 s','3 s','7 s','Manual']){
   await page.locator('[data-presentation-timer]').click();
   assert.equal(await page.locator('[data-timer-label]').innerText(),label);
  }
  await page.waitForTimeout(1100);assert.equal(await page.locator('[data-skip-presentation]').count(),1);
  const start=Date.now();await page.locator('[data-presentation-timer]').click();await idle();
  assert(Date.now()-start>=850,'One-second timer closed too early');
  await page.locator('[data-action="accept"]').click();await page.locator('[data-skip-presentation]').waitFor();
  for(const label of ['3 s','7 s','Manual']){await page.locator('[data-presentation-timer]').click();assert.equal(await page.locator('[data-timer-label]').innerText(),label);}
  await drain();
  assert.match(await page.locator('[data-action="fold"]').innerText(),/scores 2 points/);
  const spoken=await page.evaluate(()=>window.spoken);
  assert(spoken.some(s=>s.text.includes('Truco')));assert(spoken.some(s=>s.text.includes('Quiero')));
  assert(spoken.every(s=>Math.abs(s.volume-.45)<1e-6));
  // Switching language mid-game keeps the game and translates the table.
  await page.locator('#language').selectOption('es');
  assert.match(await page.locator('[data-action="fold"]').innerText(),/suma 2 puntos/);
  await page.locator('#language').selectOption('en');
  const play=page.locator('[data-card="0"]');await play.scrollIntoViewIfNeeded();
  await play.click();await page.locator('.measurement-announcement').waitFor();
  assert.match(await page.locator('.measurement-announcement').innerText(),/Identity fixed/);
  await page.screenshot({path:path.join(output,'measurement-en.png')});
  await drain();await click('[data-card="0"]');
  await click('[data-action="fold"]');
  await click('#view-summary');assert.equal(await page.locator('.player-summary').count(),2);
  assert.match(await page.locator('.hand-summary').innerText(),/What happened this hand/);
  await noOverflow();
  assert.deepEqual(errors,[]);
  assert.equal((await page.evaluate(()=>window.played)).length,0,'No audio track is played');
  console.log('PASS EN default/ES switch, no music, hard level, Confirm, axis colours, timers, scroll and voices');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
