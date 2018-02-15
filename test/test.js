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
  // ... do some testing ...
  await runTests();
  await browser.close();
});

async function runTests() {
    console.log('hi')
}