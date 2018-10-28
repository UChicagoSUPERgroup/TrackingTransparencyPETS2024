/** @module helpers */

const production = (process.env.NODE_ENV === 'production');

async function enoughData() {
  const background = await browser.runtime.getBackgroundPage();
  const numPages = await background.queryDatabase('getNumberOfPages', {});

  if (numPages > 0) {
    return true;
  }

  return false;
}

/**
 * Reads a json file with given path.
 *
 * credits: https://stackoverflow.com/a/34579496
 *
 * @param  {string} path to file
 */
function readTextFile(file) {
  return new Promise((resolve) => {
    let rawFile = new XMLHttpRequest();
    rawFile.open('GET', file, false);
    rawFile.send(null);
    resolve(rawFile.responseText);
  })
}

/** Destringifies an object.
 * @param  {string} object
 * @returns {Object}
 */
function deserialize(object) {
  return typeof object === 'string' ? JSON.parse(object) : object
}
/**
 * Asynchronous sleep function.
 *
 * @param  {number} ms - milliseconds to sleep for
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function getOption (key) {
  const store = await browser.storage.local.get('options') || {}
  const val = store['options'][key]
  return store['options'][key]
}

export default { production, enoughData, readTextFile, deserialize, sleep, getOption }
