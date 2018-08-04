/* 
 * script to help with manual testing
 *
 * loads chromium using puppeteer
 * then navigates to a few pages
 * and ends at the dashboard
 *
 */

const puppeteer = require('puppeteer')

const CRX_PATH = './extension/'

startChromium()

async function startChromium (t) {
  // set up puppeteer
  const browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent',
      '--enable-md-extensions --false'
    ]
  })

  // get browser extension's id
  const id = await getExtensionId(browser)

  // visit some pages
  const page = await browser.newPage()
  const pages = [
    'https://super.cs.uchicago.edu',
    'https://cs.uchicago.edu',
    'https://www.nytimes.com',
    'https://www.google.com/maps/place/Department+of+Computer+Science,+1100+E+58th+St,+Chicago,+IL+60637/@41.7943177,-87.5937424,13z/data=!4m2!3m1!1s0x880e29162042b8f1:0x1e9e400ccfae3c4d',
    'https://js.org/',
    'https://stats.js.org/'
  ]
  for (let p of pages) {
    await page.goto(p)
    await sleep(1000)
  }
  await page.close()

  // naviagte to dashboard page
  const dashboard = await browser.newPage()
  await dashboard.goto('chrome-extension://' + id + '/dist/dashboard.html')
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getExtensionId (browser) {
  // a hack to get id of current extension by loading options page and finding where it is displayed in text
  const page = await browser.newPage()
  await page.goto('chrome://system')
  await page.click('#extensions-value-btn')
  const idHandle = await page.$('#extensions-value')
  let extensions = await page.evaluate(body => body.textContent, idHandle)
  await page.close()
  let id = extensions.match(/[a-z]*(?= : Tracking Transparency)/)[0]
  id = id.trim()
  return id
}
