const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRUCO_URL||'http://127.0.0.1:8000';
const output=process.env.ARTIFACT_DIR||'/tmp/truco-0.2.1';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.addInitScript(()=>{
   localStorage.setItem('qriollo.preferences.v1',JSON.stringify({music:false,voices:true,timer:0,voiceVolume:.45}));
   window.spoken=[];window.voiceCancels=0;
   speechSynthesis.speak=utterance=>window.spoken.push({text:utterance.text,volume:utterance.volume});
   speechSynthesis.cancel=()=>window.voiceCancels++;
   window.audioContexts=[];
   const Context=window.AudioContext;
   if(Context)window.AudioContext=class extends Context{constructor(...args){super(...args);window.audioContexts.push(this);}};
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
  assert(await page.locator('#disable-music').isChecked());
  await page.locator('#disable-music').uncheck();
  await page.waitForFunction(()=>window.audioContexts[0]?.state==='running');
  await page.locator('#music-volume').evaluate(el=>{el.value='25';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#disable-music').check();
  assert(await page.locator('#disable-music').isChecked());
  await page.locator('#disable-voices').check();
  assert((await page.evaluate(()=>window.voiceCancels))>0);
  await page.locator('#disable-voices').uncheck();
  await page.locator('#learning-language').selectOption('en');
  await click('#values');await click('#full-rules');await page.getByRole('heading',{name:'How to play Truco Cuántico'}).waitFor();
  assert.match(await page.locator('.rules-guide').innerText(),/15 minus the leading score/);
  await noOverflow();
  await click('#home');await page.locator('#learning-language').selectOption('es');
  await click('#menu-credits');assert.match(await page.locator('.credits-page').innerText(),/Guidomc15/);
  await click('#home');await click('#start');
  assert(await page.locator('#noise-mode').isChecked());
  await click('#deal');
  for(let i=0;i<2;i++){
   await click('[data-card="0"]');await click('#activate-quantum');
   const privateView=await state('reveal');
   const tokens=privateView.private.quantum.tokens;
   const index=tokens.findIndex(token=>token==='H'||token==='X'||token.startsWith('RX:')||token.startsWith('RY:'));
   if(index>=0)await click(`[data-token="${index}"]`);
   await page.locator('#lock-ok').check();await click('#lock-circuit');
  }
  const before=(await state('reveal')).private.quantum.preview;
  await page.waitForTimeout(3200);
  const after=(await state('reveal')).private.quantum.preview;
  assert(after.noise.seconds>before.noise.seconds+2);
  if(before.noise.ideal_probabilities[1]>.00001)assert(after.probabilities[1]<before.probabilities[1]);
  await page.locator('.quantum-status summary').first().click();
  await page.waitForTimeout(250);
  const helpClock=(await state('reveal')).private.quantum.preview.noise.seconds;
  await page.waitForTimeout(1400);
  assert.equal((await state('reveal')).private.quantum.preview.noise.seconds,helpClock,'Reading help must pause noise');
  await page.locator('.quantum-status summary').first().click();
  assert.equal(await page.locator('.identity-probabilities p').count(),2);
  assert.equal(await page.locator('.identity-probabilities p').first().evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');
  assert((await page.locator('.quantum-status .sphere-caption').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)))>=16);
  await page.screenshot({path:path.join(output,'live-probabilities-mobile.png'),fullPage:true});
  const call=page.locator('[data-action="truco"]');await call.scrollIntoViewIfNeeded();
  const scroll=await page.evaluate(()=>scrollY);
  assert(scroll>200,'Test must actually be scrolled down');
  await call.click();await page.locator('[data-skip-presentation]').waitFor();
  assert.equal(await page.locator('[data-timer-label]').innerText(),'Manual');
  const frozen=(await state('reveal')).private.quantum.preview.noise.seconds;
  await page.waitForTimeout(3200);
  assert.equal((await state('reveal')).private.quantum.preview.noise.seconds,frozen,'Announcement must pause the next player noise clock');
  assert.equal(await page.locator('[data-skip-presentation]').count(),1,'Reduced motion must still allow reading manually');
  assert(Math.abs(await page.evaluate(()=>scrollY)-scroll)<=2,'Announcement moved page scroll');
  for(const label of ['1 s','3 s','7 s','Manual']){
   await page.locator('[data-presentation-timer]').click();
   assert.equal(await page.locator('[data-timer-label]').innerText(),label);
  }
  await page.waitForTimeout(1100);assert.equal(await page.locator('[data-skip-presentation]').count(),1);
  await page.screenshot({path:path.join(output,'manual-call.png')});
  const start=Date.now();await page.locator('[data-presentation-timer]').click();await idle();
  assert(Date.now()-start>=850,'One-second timer closed too early');
  assert(Math.abs(await page.evaluate(()=>scrollY)-scroll)<=2,'Turn changed page scroll');
  await page.locator('[data-action="accept"]').click();await page.locator('[data-skip-presentation]').waitFor();
  for(const label of ['3 s','7 s','Manual']){await page.locator('[data-presentation-timer]').click();assert.equal(await page.locator('[data-timer-label]').innerText(),label);}
  await drain();
  const spoken=await page.evaluate(()=>window.spoken);
  assert(spoken.some(s=>s.text.includes('Truco')));assert(spoken.some(s=>s.text.includes('Quiero')));
  assert(spoken.every(s=>Math.abs(s.volume-.45)<1e-6));
  const play=page.locator('[data-card="0"]');await play.scrollIntoViewIfNeeded();
  const measurementScroll=await page.evaluate(()=>scrollY);
  await play.click();await page.locator('.measurement-announcement').waitFor();
  assert.match(await page.locator('.measurement-announcement').innerText(),/Identidad fijada/);
  await page.waitForFunction(()=>document.querySelector('.measurement-announcement .fusion-original').style.clipPath.startsWith('polygon'));
  await page.waitForTimeout(1100);assert.equal(await page.locator('.measurement-announcement').count(),1);
  assert(Math.abs(await page.evaluate(()=>scrollY)-measurementScroll)<=2);
  await page.screenshot({path:path.join(output,'measurement-manual.png')});
  await drain();await click('[data-card="0"]');
  const played=await page.locator('.played-slot .card').first().boundingBox();assert(played.width>=59&&played.height>=95);
  await click('[data-action="fold"]');
  assert.equal(await page.locator('.public-summary').count(),0);
  await click('#view-summary');assert.equal(await page.locator('.player-summary').count(),2);
  await noOverflow();
  assert.deepEqual(errors,[]);
  console.log('PASS manual/1/3/7 timers, reduced-motion reading, scroll retention, live noise/paused announcements, EN/ES rules, music activation/mutes and voice requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
