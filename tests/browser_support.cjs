exports.installAutoSkip=async page=>{
  // Drive the real Skip control so long match tests do not wait for manual input.
  await page.addInitScript(()=>{
    localStorage.setItem('qriollo.preferences.v1',JSON.stringify({voices:false,timer:0,language:'es'}));
    setInterval(()=>document.querySelector('[data-skip-presentation]')?.click(),80);
  });
};
// Game controls the coach may enable: cards, calls, tokens, Confirm and the composer opener.
exports.CONTROLS=['[data-action]','[data-card]','[data-token]','#lock-circuit','#activate-quantum'].map(s=>s+':not([disabled])').join(',');
// Plays one step of the practice with Bot Q. Quizzes and challenges are answered by trying
// each option in order, so every wrong answer is checked to leave the step with a hint.
// Returns the kind of step ('next', 'quiz', 'challenge', 'guided') or 'final'.
exports.coachStep=async(page,idle,assert)=>{
  await idle();
  if(await page.locator('#coach-play').count())return 'final';
  const step=await page.locator('.coach-step').textContent();
  const moved=async()=>{await idle();return (await page.locator('.coach-step').count())===0||await page.locator('.coach-step').textContent()!==step||await page.locator('#coach-play').count()>0;};
  const tryAll=async selectors=>{
    for(const s of selectors){
      await page.locator(s).click();
      if(await moved())return;
      assert.equal(await page.locator('.coach-feedback.bad').count(),1,`Wrong answer ${s} needs a hint at «${step}»`);
    }
    throw Error(`No option advanced «${step}»`);
  };
  if(await page.locator('[data-quiz]').count()){
    assert.equal(await page.locator(exports.CONTROLS).count(),0,`Game controls active during a quiz at «${step}»`);
    await tryAll(await page.locator('[data-quiz]').evaluateAll(els=>els.map(e=>`[data-quiz="${e.dataset.quiz}"]`)));
    return 'quiz';
  }
  if(await page.locator('#coach-next').count()){
    assert.equal(await page.locator(exports.CONTROLS).count(),0,`Game controls active at «${step}»`);
    await page.locator('#coach-next').click();return 'next';
  }
  if(await page.locator('.coach-badge').count()){
    const options=await page.locator('[data-card]:not([disabled]),[data-action]:not([disabled])').evaluateAll(els=>els.map(e=>e.dataset.card!==undefined?`[data-card="${e.dataset.card}"]`:`[data-action="${e.dataset.action}"]`));
    assert(options.length>1,`A challenge leaves several moves at «${step}»`);
    await tryAll(options);
    return 'challenge';
  }
  const enabled=await page.locator(exports.CONTROLS).evaluateAll(els=>els.map(el=>el.id||el.outerHTML.slice(0,60)));
  assert.equal(enabled.length,1,`More than one control at «${step}»: ${enabled.join(' | ')}`);
  await page.locator('.coach-target').click();
  return 'guided';
};
