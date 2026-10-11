const {installAutoSkip,coachStep}=require('./browser_support.cjs');
const fs=require('node:fs');
const path=require('node:path');
const output=process.env.ARTIFACT_DIR || '/tmp/truco-browser-checks';
fs.mkdirSync(output,{recursive:true});
const base=process.env.TRUCO_URL || 'http://127.0.0.1:8000';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await installAutoSkip(page);
    page.setDefaultTimeout(12000);
    await installAutoSkip(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const idle=()=>page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')==='false');
    const click=async selector=>{await idle();await page.locator(selector).click();await idle();};
    const noOverflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal page overflow');
    const api=async action=>{
      const r=await page.request.post(base+'/api',{data:{method:'dispatch_json',arg:JSON.stringify({action})}});
      return await r.json();
    };
    await page.goto(base);await page.locator('#start').waitFor();await noOverflow();
    // Quick help shows the same 14-level ladder as the slides, with all 40 cards.
    await click('#values');await noOverflow();
    assert.equal(await page.locator('.help-ladder .ladder li').count(),14);
    assert.equal(await page.locator('.help-ladder .card').count(),40);
    await click('#values-home');await click('#start');await page.locator('#privacy-mode').check();await click('#deal');
    await page.locator('#alone').check();await click('#reveal');
    await page.getByText('1 · Elegí tu carta cuántica',{exact:true}).waitFor();
    await click('[data-card="0"]');await click('#activate-quantum');await click('[data-token="0"]');
    await click('[data-token="1"]');await click('[data-token="2"]');
    await page.setViewportSize({width:320,height:740});
    await noOverflow();
    assert(await page.locator('#composer-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Dialog overflow at 320px');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(output,'mobile-composer.png'),fullPage:true});
    console.log('Mobile dialog sizing',await page.locator('#composer-dialog').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth})));
    await noOverflow();
    await page.locator('[data-left="1"]').focus();await page.keyboard.press('Enter');await idle();
    assert.equal(await page.locator('[data-left="1"]').evaluate(el=>document.activeElement===el),true,'Keyboard focus should survive reorder');
    await click('#reset');assert.equal(await page.locator('[data-remove]').count(),0);
    // Rejected edits must show an error and allow revealing the unchanged hand.
    await page.route('**/api',route=>{
      const request=route.request().postDataJSON();
      if(request.method==='dispatch_json'){
        const payload=JSON.parse(request.arg);
        if(payload.action==='edit'){payload.value=[-1];request.arg=JSON.stringify(payload);return route.continue({postData:JSON.stringify(request)});}
      }
      return route.continue();
    });
    await click('[data-token="0"]');await page.getByText('Cada ficha se usa una vez; máximo tres',{exact:false}).waitFor();
    assert.equal(await page.locator('[data-card]').count(),0);
    await page.unroute('**/api');await page.locator('#alone').check();await click('#reveal');await click('#activate-quantum');
    assert.equal(await page.locator('[data-remove]').count(),0);
    await click('#lock-circuit');
    assert.equal(await page.locator('[data-card]').count(),0,'Handoff must hide all cards');
    // Keep the following action's transport error visible until a successful retry.
    await page.locator('#alone').check();
    await page.route('**/api',route=>route.abort());
    await click('#reveal');
    await page.getByText('No se pudo completar la acción.',{exact:false}).waitFor();
    assert.equal(await page.locator('[data-card]').count(),0);
    await page.unroute('**/api');await page.locator('#alone').check();await click('#reveal');
    assert.equal(await page.locator('#notice').innerText(),'');
    await click('[data-card="0"]');await click('#activate-quantum');await click('#lock-circuit');
    await page.locator('#alone').check();await click('#reveal');
    await click('[data-action="truco"]');await page.locator('#alone').check();await click('#reveal');
    assert.match(await page.locator('[data-action="accept"]').innerText(),/2 puntos/);
    assert.match(await page.locator('[data-action="reject"]').innerText(),/1 punto/);
    assert.equal(await page.locator('.live-hand .card').count(),3,'Response must show the player hand');
    assert.equal(await page.locator('.live-hand [data-card]').count(),0,'Response cards cannot be played');
    await click('[data-action="reject"]');
    assert.equal(await page.locator('#alone').count(),0,'Outcome must be public');
    assert.equal(await page.locator('.public-summary').count(),0,'Summary requires the result button');
    await click('#view-summary');
    await page.getByText('Qué pasó en esta mano',{exact:true}).waitFor();
    assert.match(await page.locator('.hand-summary').innerText(),/Truco no querido/);
    await noOverflow();
    // Practice with Bot Q on a phone-sized screen: challenges, quizzes and highlighted controls.
    await click('#tutorial');await click('#hub-truco');await click('#slide-skip');
    for(let step=0;step<80;step++){
      if(await coachStep(page,idle,assert)==='final')break;
      if(step===79)throw Error('Tutorial did not finish');
    }
    assert.match(await page.locator('.coach h2').innerText(),/Terminaste el tutorial/);
    await noOverflow();
    await page.screenshot({path:path.join(output,'mobile-report.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    const disconnected=await browser.newPage();
    disconnected.on('pageerror',e=>errors.push(e.message));
    await disconnected.route('**/api',route=>route.abort());await disconnected.goto(base);
    await disconnected.getByText(/todavía no pudo conectarse|could not connect yet/).waitFor();
    assert(await disconnected.locator('#home').isDisabled());
    await disconnected.unroute('**/api');await disconnected.locator('#reload-game').click();await disconnected.locator('#start').waitFor();
    assert.deepEqual(errors,[]);await disconnected.close();
    console.log('PASS mobile, deck, composer, reorder keyboard focus, empty circuit, private handoff, transport error recovery, canto hints, reports and Truco tutorial');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
