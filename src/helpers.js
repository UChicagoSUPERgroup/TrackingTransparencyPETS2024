'use strict';

/** @module helpers */

/** 
 * Reads a json file with given path.
 * 
 * credits: https://stackoverflow.com/a/34579496
 * 
 * @param  {string} path to file
 */
export function readTextFile(file) {
  return new Promise((resolve, reject) => {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.send(null);
    resolve(rawFile.responseText);
  })
}
  
/** Destringifies an object.
 * @param  {string} object
 */
export function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}
/**
 * Asynchronous sleep function.
 * 
 * @param  {number} ms - milliseconds to sleep for
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
