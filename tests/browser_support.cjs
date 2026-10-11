exports.installAutoSkip=async page=>{
  // Drive the real Skip control so long match tests do not wait for manual input.
  await page.addInitScript(()=>{
    localStorage.setItem('qriollo.preferences.v1',JSON.stringify({music:false,voices:false,timer:0,language:'es'}));
    setInterval(()=>document.querySelector('[data-skip-presentation]')?.click(),80);
  });
};
