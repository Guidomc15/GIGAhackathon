// Plays the Truco tutorial from the start menu using only the controls Bot Q highlights.
const {installAutoSkip}=require('./browser_support.cjs');
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
    const idle=()=>page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')==='false'&&!document.querySelector('#presentation-layer'));
    await page.goto(base);
    await page.locator('#learn').click();
    await page.locator('.coach').waitFor();
    const seen=[];
    for(let i=0;i<60;i++){
      await idle();
      const step=await page.locator('.coach-step').textContent();
      const title=await page.locator('.coach h2').textContent();
      if(!seen.includes(step)){seen.push(step);await page.screenshot({path:path.join(output,`tutorial-${String(seen.length).padStart(2,'0')}.png`),fullPage:true});}
      if(await page.locator('#coach-play').count())break;
      assert.equal(await page.locator('.coach-target').count(),1,`Sin elemento resaltado en «${title}»`);
      if(await page.locator('#coach-next').count()){
        // Explanation steps keep every game control disabled.
        assert.equal(await page.locator('[data-action]:not([disabled]),[data-card]:not([disabled])').count(),0,`Controles activos en «${title}»`);
        await page.locator('#coach-next').click();
      }else{
        // Action steps leave exactly one game control: the highlighted one.
        assert.equal(await page.locator('[data-action]:not([disabled]),[data-card]:not([disabled])').count(),1,`Más de un control activo en «${title}»`);
        await page.locator('.coach-target').click();
      }
    }
    assert.match(await page.locator('.coach h2').textContent(),/Terminaste el tutorial/);
    assert.match(await page.locator('.round-meta').textContent(),/Vos: 7 · Bot Q: 0/);
    assert.equal(seen.length,27);
    await page.locator('#coach-play').click();
    await page.locator('#deal').waitFor();
    assert.deepEqual(errors,[]);
    console.log(`PASS tutorial: ${seen.length} pasos, 3 manos, marcador final 7–0`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
