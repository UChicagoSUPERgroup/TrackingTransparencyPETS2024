const puppeteer = require('puppeteer');

const CRX_PATH = '../extension/';

puppeteer.launch({
  headless: false, // extensions only supported in full chrome.
  args: [
    `--disable-extensions-except=${CRX_PATH}`,
    `--load-extension=${CRX_PATH}`,
    '--user-agent=PuppeteerAgent'
  ]
}).then(async browser => {
  
  // a hack to get id of current extension by loading options page and finding where it is displayed in texted
  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  const devToggle = await page.click('#toggle-dev-on');
  const idHandle = await (await page.$('.extension-id'));
  let id = await page.evaluate(body => body.textContent, idHandle);
  id = id.trim();
  const BASE_URL = 'chrome-extension://' + id + '/';

  // do some testing on the extension
  const background = await browser.newPage();
  await background.goto(BASE_URL + '_generated_background_page.html');

  const q = await background.evaluate(() => {
    // return await window.queryDatabase('getPages', {});
    // we can theoretically write code that runs inside the extension here?
    // but I cannot currently figure this out
  });
  console.log(q);

  // await runTests(id);
  await browser.close();
});