/* 
 * script to help with manual testing
 *
 * loads chromium using puppeteer
 * then navigates to a few pages
 * and ends at the dashboard
 *
 */

const puppeteer = require('puppeteer')
const fs = require('fs')

const CRX_PATH = './extension/'

fs.readFile('./test/data/tt_export.json', 'utf8', (err, jsondata) => {
  startChromium(jsondata)
})

async function startChromium (data) {
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
  await sleep(1000)

  const id = await getExtensionId(browser)

  // naviagte to dashboard page
  const dashboard = await browser.newPage()
  await dashboard.goto('chrome-extension://' + id + '/dist/dashboard.html#/debug')
  await dashboard.evaluate(async (data) => {
    const background = await browser.runtime.getBackgroundPage()
    background.importData(data)
  }, data)
  await sleep(1000)
  await dashboard.close()
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
