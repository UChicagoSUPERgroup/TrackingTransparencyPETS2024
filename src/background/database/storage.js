/** @module storage */

import {primaryDbPromise} from './setup';
// import tt from "../helpers";

/* DATA STORAGE */
/* ============ */

/**
 * stores new page visit
 * 
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.title - page's title
 * @param {string} info.domain - page's domain
 * @param {string} info.path - page's path
 * @param {string} info.protocol - page's protocol (e.g. http)
 */
export async function storePage(info) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');

  const page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    'path': info.path,
    'protocol': info.protocol
  });
  return ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}

/**
 * stores records of trackers for given page
 * 
 * @param {Object} pageId - identifier for page that trackers come from
 * @param {Object[]} trackers - array of objects with information about each tracker
 */
export async function storeTrackerArray(pageId, trackers) {
  const ttDb = await primaryDbPromise;
  const trackerItem = ttDb.getSchema().table('Trackers');
  const rows = []

  for (let tracker of trackers) {
    const row = trackerItem.createRow({
      'tracker': tracker,
      'trackerCategory': '',
      'pageId': pageId
    });
    rows.push(row);
  }
  // console.log(rows);
  ttDb.insertOrReplace().into(trackerItem).values(rows).exec();
}

/**
 * stores new inference
 * 
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.inference - inference made
 * @param {string} info.inferenceCategory - unused
 * @param {Number} info.threshold - unused
 * 
 */
export async function storeInference(info) {
  const ttDb = await primaryDbPromise;
  const inferenceItem = ttDb.getSchema().table('Inferences');

  const inference = inferenceItem.createRow({
    'inference': info.inference,
    'inferenceCategory': info.inferenceCategory,
    'threshold': info.threshold,
    'pageId': info.pageId
  });
  return ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
}
