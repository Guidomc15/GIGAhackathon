const {installAutoSkip}=require('./browser_support.cjs');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=process.env.ARTIFACT_DIR || '/tmp/truco-browser-checks';
fs.mkdirSync(output,{recursive:true});
const base=process.env.TRUCO_URL || 'http://127.0.0.1:8000';
const privacy=process.env.TRUCO_PRIVACY==='1';
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    await installAutoSkip(page);
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const idle = () => page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('aria-busy') === 'false');
    const click = async selector => {await idle(); await page.locator(selector).click(); await idle();};
    await page.goto(base);
    await page.locator('#start').waitFor();
    await click('#start');
    await page.locator('#player-one').fill('Ana');
    await page.locator('#player-two').fill('Luis');
    assert.equal(await page.locator('#privacy-mode').isChecked(),false);
    if(privacy)await page.locator('#privacy-mode').check();
    await click('#deal');
    for (let step = 0; step < 700; step++) {
      await idle();
      const response = await page.request.post(base+'/api', {data:{method:'dispatch_json',arg:JSON.stringify({action:'public'})}});
      const view = await response.json();
      if (view.error) throw Error(view.error);
      const g = view.game;
      if (g.phase === 'match_end') {
        await page.getByText('Partida terminada',{exact:true}).waitFor();
        console.log('PASS full browser match', JSON.stringify({scores:g.scores,hands:g.hand,privacy}));
        assert.equal(await page.locator('.public-summary').count(),0);
        await click('#view-summary');
        assert.equal(await page.locator('.player-summary').count(),2);
        await page.locator('.player-summary details summary').first().click();
        await page.screenshot({path:path.join(output,'match-local.png')});
        break;
      }
      if(privacy&&await page.locator('#alone').count()){await page.locator('#alone').check();await click('#reveal');}
      else if(!privacy)assert.equal(await page.locator('#alone').count(),0,'Default game must have no privacy pauses');
      if (g.phase === 'prepare') {
        await click('[data-card="0"]'); await click('#activate-quantum');
        await click('[data-token="0"]'); 
        await click('#lock-circuit');
      } else if (g.phase === 'play') {
        if (await page.locator('[data-action="envido"]').count()) await click('[data-action="envido"]');
        else await click('[data-card] >> nth=0');
      } else if (g.phase === 'respond') {assert((await page.locator('.live-hand .card').count())>0);await click('[data-action="accept"]');}
      else if (g.phase === 'envido_reveal' || g.phase === 'report') await click('[data-action="hide"]');
      else if (g.phase === 'hand_end') await click('[data-action="next"]');
      else if (g.phase === 'reassert') await click('[data-action="reassert"]');
      else throw Error('Unexpected '+g.phase);
      if (step === 699) throw Error('Did not finish');
    }
    if (errors.length) throw Error(errors.join('\n'));
    console.log('PASS no browser errors');
  } finally {await browser.close();}
})().catch(e => {console.error(e);process.exitCode=1;});
