const {installAutoSkip}=require('./browser_support.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TRUCO_URL||'http://127.0.0.1:8000';
const output=process.env.ARTIFACT_DIR||'/tmp/truco-browser-checks';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:920},reducedMotion:'no-preference'});
  await installAutoSkip(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  const idle=()=>page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')==='false');
  const click=async s=>{await idle();await page.locator(s).click();await idle();};
  const state=async()=>await (await page.request.post(base+'/api',{data:{method:'dispatch_json',arg:JSON.stringify({action:'public'})}})).json();
  await page.goto(base);await page.locator('#start').waitFor();
  await page.evaluate(()=>{
   window.presentations=[];
   new MutationObserver(()=>{
    const el=document.querySelector('.turn-presentation');
    let type=el?.classList.contains('speech-bubble')?'speech':el?.classList.contains('points-presentation')?'points':el?'measurement':document.querySelector('.flipping-hand')?'flip-faces':document.querySelector('.live-hand .card-back')?'flip-backs':document.querySelector('.outcome')?'outcome':null;
    if(!type)return;
    const key=type+':'+(el?.innerText||'');
    if(window.presentations.at(-1)?.key!==key)window.presentations.push({key,type,text:el?.innerText||'',visiblePrivate:[...document.querySelectorAll('.live-hand .card-face')].some(face=>getComputedStyle(face).visibility!=='hidden'),rows:[...document.querySelectorAll('.point-row')].map(e=>e.innerText)});
   }).observe(document.querySelector('.app-shell'),{childList:true,subtree:true});
  });
  const prepare=async privacy=>{
   await click('#start');if(privacy)await page.locator('#privacy-mode').check();await click('#deal');
   for(let i=0;i<2;i++){
    if(privacy){await page.locator('#alone').check();await click('#reveal');}
    await click('[data-card="0"]');await click('#activate-quantum');
    assert.equal(await page.locator('.quantum-option').count(),2);
    await page.screenshot({path:path.join(output,privacy?'composer-private.png':'composer-desktop.png')});
    await click('#lock-circuit');
   }
   if(privacy){await page.locator('#alone').check();await click('#reveal');}
  };
  await prepare(false);await click('[data-action="envido"]');
  assert.equal(await page.locator('.live-hand .card').count(),3);
  const envidoClick=page.locator('[data-action="accept"]').click();await envidoClick;
  await page.waitForFunction(()=>window.presentations.some(e=>e.type==='speech'));await page.screenshot({path:path.join(output,'envido-dialogue.png')});await idle();
  const envido=(await state()).game.envido;
  const speeches=(await page.evaluate(()=>window.presentations)).filter(e=>e.type==='speech');
  assert(speeches.some(e=>/Quiero,/.test(e.text)));
  assert(speeches.some(e=>e.text.includes(`${envido.values[0]} tantos`)));
  assert(speeches.some(e=>e.text.includes(`${envido.values[1]} tantos`)));
  await click('[data-action="truco"]');assert.equal(await page.locator('.live-hand .card').count(),3);
  await click('[data-action="accept"]');await click('[data-card="0"]');await click('[data-card="0"]');
  await click('[data-action="fold"]');
  assert.equal(await page.locator('.public-summary').count(),0);
  await click('#view-summary');assert.equal(await page.locator('.player-summary').count(),2);
  await click('#close-summary');await click('#home');
  // A second hand with privacy verifies animations never reveal the next hand.
  await prepare(true);await click('[data-action="truco"]');
  assert.equal(await page.locator('.live-hand .card-face').count(),0);
  await page.locator('#alone').check();await click('#reveal');assert.equal(await page.locator('.live-hand .card').count(),3);
  await click('[data-action="reject"]');assert.equal(await page.locator('#alone').count(),0);
  await page.screenshot({path:path.join(output,'result-before-summary.png')});
  const seen=await page.evaluate(()=>window.presentations);
  assert(seen.some(e=>e.type==='flip-backs'));assert(seen.some(e=>e.type==='flip-faces'));
  assert(seen.filter(e=>['speech','points','measurement'].includes(e.type)).every(e=>!e.visiblePrivate));
  for(const points of seen.filter(e=>e.type==='points')){
   assert.equal(points.rows.length,2);
   assert(Number(points.rows[0].match(/\+(\d+)/)[1])>=Number(points.rows[1].match(/\+(\d+)/)[1]));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS normal-motion calls, automatic Envido values, sorted point awards, card flips, privacy and result before public summary');
  await click('#home');await prepare(false);
  // An unmeasured quantum play must visibly identify its card before any outcome.
  await page.evaluate(()=>window.presentations=[]);
  await click('[data-card="0"]');
  const measured=await page.evaluate(()=>window.presentations);
  assert(measured.some(e=>e.type==='measurement'&&/Identidad fijada/.test(e.text)));
  assert(measured.findIndex(e=>e.type==='measurement')<measured.findIndex(e=>e.type==='flip-backs'));
  assert.deepEqual(errors,[]);console.log('PASS public measurement identifies the collapsed card before the next turn');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
