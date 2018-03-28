'use strict';

/** @module helpers */

const DEBUG = (process.env.NODE_ENV === 'production');

function enoughData() {
  return true;
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
 */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}
/**
 * Asynchronous sleep function.
 *
 * @param  {number} ms - milliseconds to sleep for
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export default {enoughData, readTextFile, deserialize, sleep};
