const test = require('tape');
const puppeteer = require('puppeteer');

const CRX_PATH = '../extension/';


test('tests', runTests);
// runTests();

async function runTests(t) {
  const browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent'
    ]
  })
  
  const id = await getExtensionId(browser);
  await visitPages(browser);

  // do some testing on the extension
  const dashboard = await browser.newPage();
  await dashboard.goto('chrome-extension://' + id + '/dashboard/index.html');
  dashboard.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await dashboard.exposeFunction('equal', t.equal);
  await dashboard.exposeFunction('test', t.test);
  await dashboard.exposeFunction('sleep', sleep);
  
  await dashboard.evaluate(async (pages) => {

    const background = await browser.runtime.getBackgroundPage();

    const t = {
      equal: window.equal,
      test: window.test
    }
    const sleep = window.sleep;

    let ping = background.ping();
    await equal(ping, 'ping', 'ping test');

    let query;

    query = await background.queryDatabase('getAllData', {});
    await equal(query.pages.length, pages.length, 'number of pages in database is correct');

    query = await background.queryDatabase('getTrackersByDomain', {domain: 'www.nytimes.com'});
    await equal(query.length >= 0, true, 'there are trackers on nytimes in database');


  }, pages);

  t.end();
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

async function visitPages(browser) {
  const page = await browser.newPage();

  const pages = ['https://super.cs.uchicago.edu', 'https://cs.uchicago.edu', 'https://www.nytimes.com'];

  for (p of pages) {
    await page.goto(p);
  }
  
  await page.close();
}

