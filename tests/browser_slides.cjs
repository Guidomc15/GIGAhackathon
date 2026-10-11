// Tutorial slides before the guided match: rules, suits, ladder, duel, scoring and Truco calls, in ES and EN.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=process.env.ARTIFACT_DIR||'/tmp/truco-browser-checks';
fs.mkdirSync(output,{recursive:true});
const base=process.env.TRUCO_URL||'http://127.0.0.1:8000';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
  try{
    for(const [lang,width,height] of [['es',1366,768],['en',390,844]]){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
      await page.addInitScript(l=>localStorage.setItem('qriollo.preferences.v1',JSON.stringify({music:false,voices:false,timer:0,language:l})),lang);
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      page.setDefaultTimeout(12000);
      const shot=name=>page.screenshot({path:path.join(output,`slide-${lang}-${name}.png`),fullPage:true});
      await page.goto(base);await page.locator('#learn').click();await page.locator('#hub-truco').click();
      // 1 · Rules, with a glossary term that opens its definition.
      await page.locator('.slide-rules').waitFor();
      assert.equal(await page.locator('.rule-facts li').count(),4);
      await page.locator('[data-term="baza"]').first().click();
      assert.match(await page.locator('#term-popover').innerText(),lang==='es'?/Una carta de cada jugador/:/One card from each player/);
      await shot('1');
      await page.locator('#slide-next').click();
      // 2 · Suits: four tabs, ten cards each, no 8 or 9.
      await page.locator('.slide-suits').waitFor();
      assert.equal(await page.locator('[data-suit]').count(),4);
      for(let i=0;i<4;i++){await page.locator(`[data-suit="${i}"]`).click();assert.equal(await page.locator('.suit-row figure').count(),10);}
      assert.deepEqual(await page.locator('.suit-row figcaption').allInnerTexts(),['1','2','3','4','5','6','7','10','11','12']);
      await shot('2');
      await page.locator('#slide-next').click();
      // 3 · Ladder: 14 levels holding all 40 cards; four bravas and the anchos falsos marked.
      await page.locator('.slide-ladder').waitFor();
      assert.equal(await page.locator('.ladder li').count(),14);
      assert.equal(await page.locator('.ladder .card').count(),40);
      assert.equal(await page.locator('.ladder li.brava').count(),4);
      assert.equal(await page.locator('.ladder li.falso').count(),1);
      await shot('3');
      await page.locator('#slide-next').click();
      // 4 · Duel: Next stays locked until the four bazas are answered; a wrong answer explains why.
      await page.locator('.slide-duel').waitFor();
      assert(await page.locator('#slide-next').isDisabled());
      await page.locator('[data-pick="0"]').click();
      await page.locator('.duel-feedback.bad').waitFor();
      for(let round=0;round<4;round++){
        await page.locator('.duel').waitFor();
        const answer=await page.locator('.duel').getAttribute('data-answer');
        await page.locator(`[data-pick="${answer}"]`).click();
        await page.locator('.duel-feedback.ok').waitFor();
        if(round===3)await shot('4');
        await page.waitForFunction(r=>!document.querySelector('.duel')||document.querySelector('.duel-count').textContent.startsWith(`Baza ${r+2} `),round);
      }
      await page.locator('.duel-done').waitFor();
      assert(!(await page.locator('#slide-next').isDisabled()));
      const fits=async name=>{if(width>=900){assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight),0,`Slide ${name} fits the window`);assert(await page.evaluate(()=>{const b=document.querySelector('.slide-body');return b.scrollHeight<=b.clientHeight+1;}),`Slide ${name} has no inner scroll`);}};
      await fits('4');
      await page.locator('#slide-next').click();
      // 5 and 6 · Example hands played baza by baza: 3 bazas (2–1) and 2 bazas (2–0, no third).
      for(const [n,bazas,wins] of [['5',3,2],['6',2,2]]){
        await page.locator('.slide-bazas').waitFor();
        assert.equal(await page.locator('.baza-col').count(),bazas);
        for(let i=0;i<bazas;i++)await page.locator('[data-baza-next]').click();
        assert.equal(await page.locator('.baza-col.open').count(),bazas);
        assert.equal(await page.locator('.baza-card.wins').count(),bazas);
        assert.equal(await page.locator('.baza-col .baza-card:first-of-type.wins').count(),wins,'You win two bazas');
        assert.match(await page.locator('.bazas-example .callout').innerText(),lang==='es'?/la mano es tuya/:/the hand is yours/);
        await fits(n);await shot(n);
        await page.locator('#slide-next').click();
      }
      // 7 · Calls: 1, 2, 3 and 4 points.
      await page.locator('.slide-calls').waitFor();
      assert.deepEqual(await page.locator('.call-steps li:not(.call-arrow) strong').allInnerTexts(),['1','2','3','4']);
      await fits('7');await shot('7');
      await page.locator('#slide-next').click();
      // 8 · Calling Truco: Next stays locked and Retruco / Vale Cuatro stay disabled until Truco is called.
      await page.locator('.slide-callTruco').waitFor();
      assert(await page.locator('#slide-next').isDisabled());
      assert.equal(await page.locator('.pov-calls button:disabled').count(),2);
      await page.locator('[data-call-truco]').click();
      await page.locator('.pov-bubble').waitFor();
      assert(!(await page.locator('#slide-next').isDisabled()));
      await fits('8');await shot('8');
      await page.locator('#slide-next').click();
      // 9 · Opponent's side: each answer explains its outcome.
      await page.locator('.slide-rivalTruco').waitFor();
      for(const [id,re] of [['quiero',/2/],['noquiero',/1/],['retruco',/3[\s\S]*4/]]){
        await page.locator(`[data-reply="${id}"]`).click();
        assert.match(await page.locator('.rival-pov .callout').innerText(),re);
      }
      await fits('9');await shot('9');
      await page.locator('#slide-next').click();
      // 10 · Scoring and the 15-point goal; Next starts the match with Bot Q.
      await page.locator('.slide-scoring').waitFor();
      assert.match(await page.locator('#slide-next').innerText(),/Bot Q/);
      await fits('10');await shot('10');
      await page.locator('#slide-next').click();
      await page.locator('.coach').waitFor();
      assert.deepEqual(errors,[]);
      await page.close();
    }
    console.log('PASS slides: rules + glossary, 4 suits × 10 cards, 14-level ladder with 40 cards, 4-baza duel, 2 example hands, Truco call and answers, scoring, ES desktop and EN mobile');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
