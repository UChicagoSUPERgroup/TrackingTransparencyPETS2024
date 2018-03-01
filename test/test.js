const test = require('tape');
const puppeteer = require('puppeteer');

const CRX_PATH = '../extension/';

async function runTests() {
  const browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent'
    ]
  })
  
  const id = await getExtensionId(browser);
  const BASE_URL = 'chrome-extension://' + id + '/';

  // visit some pages
  const page = await browser.newPage();
  await page.goto('https://www.nytimes.com');
  await page.goto('https://super.cs.uchicago.edu');
  await page.goto('https://cs.uchicago.edu');
  await page.close();

  // do some testing on the extension
  const background = await browser.newPage();
  await background.goto(BASE_URL + '_generated_background_page.html');
  background.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const q = await background.evaluate(async () => {

    // WRITE TESTS HERE ???

    let ping = window.ping();
    console.log(ping) // this works

    // test('ping test', function (t) {
    //   let ping = window.ping();
    //   t.equal(ping, 'ping');
    // });

    // let query = await window.queryDatabase('getAllData', {});
    // console.log(query) // this hangs? idk why


  });
  console.log(q);

  // await runTests(id);
  await browser.close();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExtensionId(browser) {
  // a hack to get id of current extension by loading options page and finding where it is displayed in texted
  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  const devToggle = await page.click('#toggle-dev-on');
  const idHandle = await (await page.$('.extension-id'));
  let id = await page.evaluate(body => body.textContent, idHandle);
  await page.close()
  id = id.trim();
  return id;
}

runTests();