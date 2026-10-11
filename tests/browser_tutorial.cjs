// Plays the Truco tutorial from the start menu using only the controls Bot Q highlights.
const {installAutoSkip,coachStep}=require('./browser_support.cjs');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=process.env.ARTIFACT_DIR || '/tmp/truco-browser-checks';
fs.mkdirSync(output,{recursive:true});
const base=process.env.TRUCO_URL || 'http://127.0.0.1:8000';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
  try{
    const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1280,height:900}});
    await installAutoSkip(page);
    page.setDefaultTimeout(12000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Each qubit measurement is logged to the console with its raw Qiskit record.
    const measurements=[];
    page.on('console',async msg=>{if(msg.text().startsWith('[Qriollo] Medición'))measurements.push([msg.text(),await msg.args()[1]?.jsonValue()]);});
    const idle=()=>page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')==='false'&&!document.querySelector('#presentation-layer'));
    await page.goto(base);
    // TRUCO_LANG=en plays the same tutorial with the English interface.
    if(process.env.TRUCO_LANG==='en'){await page.locator('#menu-language').selectOption('en');await idle();}
    await page.locator('#learn').click();
    await page.locator('#hub-truco').click();
    await page.locator('#slide-skip').click();
    await page.locator('.coach').waitFor();
    const seen=[],kinds={};
    for(let i=0;i<80;i++){
      await idle();
      const step=await page.locator('.coach-step').textContent();
      const title=await page.locator('.coach h2').textContent();
      // The player is addressed in the second person: «Tu turno», never «Turno de Vos».
      const third=(await page.locator('body').innerText()).match(/Turno de (Vos|You)|(Vos|You)'s turn|(de|for) (Vos|You)\b|Ganó( la baza)? (Vos|You)|(Vos|You) (jugó|suma|propone|played|scores|calls|wins|loses)|Victoria de (Vos|You)|Mano: (Vos|You)|\(leads\): You/);
      assert.equal(third,null,`Texto en tercera persona en «${title}»: ${third?.[0]}`);
      if(!seen.includes(step)){seen.push(step);await page.screenshot({path:path.join(output,`tutorial-${String(seen.length).padStart(2,'0')}.png`),fullPage:true});}
      if(await page.locator('#coach-play').count())break;
      assert.equal(await page.locator('#view-summary').count(),0,`«Ver resumen» se oculta hasta el final, pero aparece en «${title}»`);
      assert.equal(await page.locator('.coach-target').count(),1,`Sin elemento resaltado en «${title}»`);
      const kind=await coachStep(page,idle,assert);
      kinds[kind]=(kinds[kind]||0)+1;
    }
    assert.match(await page.locator('.coach h2').textContent(),/Terminaste el tutorial|You finished the Truco tutorial/);
    assert.match(await page.locator('.round-meta').textContent(),/(Vos|You): 8 · Bot Q: 0/);
    assert.equal(seen.length,33);
    assert.equal(await page.locator('#view-summary').count(),1,'El paso final muestra «Ver resumen»');
    assert.equal(measurements.length,2,'Dos mediciones en la mano cuántica');
    assert(measurements.every(([,record])=>record.method==='Qiskit Statevector.sample_memory(1)'&&record.shots===1));
    assert(measurements.some(([text,record])=>/7 de espada|7 of Swords/.test(text)&&record.result===1&&record.gates.join()==='X'));
    // The summary is longer than the window: the stage scrolls to the measurement record.
    await page.locator('#view-summary').click();await idle();
    await page.locator('.public-summary details').evaluateAll(els=>els.forEach(e=>e.open=true));
    await page.locator('.public-summary pre').last().scrollIntoViewIfNeeded();
    assert(await page.locator('.public-summary pre').last().isVisible());
    assert(await page.evaluate(()=>document.querySelector('#stage').scrollTop>0));
    await page.locator('#close-summary').click();
    assert.equal(kinds.challenge,6,'Six challenges');assert.equal(kinds.quiz,6,'Six quick questions');
    await page.locator('#coach-play').click();
    await page.locator('#deal').waitFor();
    assert.deepEqual(errors,[]);
    // Gate lessons: every lesson renders an animated sphere and its odds.
    await page.locator('#tutorial').click();await page.locator('#hub-gates').click();
    for(let i=0;i<9;i++){
      await idle();
      assert.equal(await page.locator('.gate-demo canvas').count(),1);
      for(const tab of await page.locator('[data-circuit]').all()){await tab.click();await idle();assert.equal(await page.locator('.odds-row').count(),2);}
      if(i===3)await page.screenshot({path:path.join(output,'lesson-z.png')});
      if(i<8)await page.locator('#lesson-next').click();
    }
    assert(await page.locator('#lesson-next').isDisabled());
    assert(await page.locator('.lesson .axis-x').count()>0,'Axis letters are coloured in lessons');
    assert.deepEqual(errors,[]);
    console.log(`PASS tutorial: ${seen.length} pasos (6 desafíos y 6 preguntas), 4 manos (la última cuántica), marcador 8–0 y 9 lecciones de compuertas`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
