const test = require('tape');
const puppeteer = require('puppeteer');

const CRX_PATH = '../extension/';


test('tests', runTests);
// runTests();

async function runTests(t) {

  // set up puppeteer
  const browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent'
    ]
  })
  
  // get browser extension's id
  const id = await getExtensionId(browser);
  
  // visit some pages
  const page = await browser.newPage();
  const pages = [
    'https://super.cs.uchicago.edu',
    'https://cs.uchicago.edu', 
    'https://www.nytimes.com',
    'https://www.google.com/maps/place/Department+of+Computer+Science,+1100+E+58th+St,+Chicago,+IL+60637/@41.7943177,-87.5937424,13z/data=!4m2!3m1!1s0x880e29162042b8f1:0x1e9e400ccfae3c4d'
  ];
  for (p of pages) {
    await page.goto(p);
  }
  await page.close();

  // naviagte to dashboard page
  const dashboard = await browser.newPage();
  await dashboard.goto('chrome-extension://' + id + '/dashboard/index.html');
  dashboard.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // allow us to access testing functions from page context
  await dashboard.exposeFunction('equal', t.equal);
  await dashboard.exposeFunction('ok', t.ok);
  await dashboard.exposeFunction('test', t.test);
  await dashboard.exposeFunction('sleep', sleep);
  
  // switch to page context and run tests
  await dashboard.evaluate(async (pages) => {

    const background = await browser.runtime.getBackgroundPage();

    let ping = background.ping();
    await equal(ping, 'ping', 'ping test');

    let query;

    query = await background.queryDatabase('getAllData', {});
    await ok(query.pages.length >= pages.length, 'pages were stored in database');

    // check to make sure google maps url was stored properly
    const domains = query.pages.map(x => x.domain);
    await ok(domains.indexOf('www.google.com') !== -1, 'google maps is stored as www.google.com');
    await ok(domains.indexOf('41.7943177,-87.5937424,13z') === -1, 'there are not gps-coordinate domains');

    // make sure we have some trackers stored
    query = await background.queryDatabase('getTrackersByDomain', {domain: 'www.nytimes.com'});
    await equal(query.length >= 0, true, 'there are trackers on nytimes in database');

    // make sure we have some inferences made
    query = await background.queryDatabase('getInferencesByDomain', {domain: 'cs.uchicago.edu'});
    await equal(Object.keys(query)[0], 'Internet & Telecom', 'inference for cs.uchicago is Internet & Telecom');

  }, pages);

  t.end();
  await browser.close();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExtensionId(browser) {
  // a hack to get id of current extension by loading options page and finding where it is displayed in text
  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  const devToggle = await page.click('#toggle-dev-on');
  const idHandle = await (await page.$('.extension-id'));
  let id = await page.evaluate(body => body.textContent, idHandle);
  await page.close()
  id = id.trim();
  return id;
}