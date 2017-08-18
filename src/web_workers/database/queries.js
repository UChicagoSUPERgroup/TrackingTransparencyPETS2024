/** @module queries */

import lf from "lovefield";
import {primaryDbPromise, primarySchemaBuilder} from "setup.js";

/* QUERIES */
/* ======= */

const Inferences = primarySchemaBuilder.getSchema().table('Inferences');
const Trackers = primarySchemaBuilder.getSchema().table('Trackers');
const Pages = primarySchemaBuilder.getSchema().table('Pages');

/**
 * gets all inferences
 * 
 * @returns {string[]} array of inferences
 */
async function getInferences() {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Inferences.inference).from(Inferences).exec(); // orderBy(Inferences.pageId, lf.Order.DESC) to get most recent
  return query.map(x => x.inference);
}

/**
 * gets all trackers
 * 
 * @returns {string[]} array of trackers
 */
async function getTrackers() {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .exec();
  return query.map(x => x.tracker);
}

/**
 * gets n most frequently encountered trackers
 * 
 * @param {Number} n - number of trackers
 * @returns {string[]} array of trackers
 */
async function getTopTrackers(n) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .limit(n)
    .exec();
  return query.map(x => x.tracker);
}

/**
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 * 
 * @param {string} tracker - tracker domain
 * @returns {Number} number of pages where that tracker was present
 */
async function getPageVisitCountByTracker(tracker) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.count(Pages.domain))
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(tracker)
    ))
    .exec();
  return query[0].Pages["COUNT(domain)"];
}

/**
 * Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)
 * 
 * @param {string} tracker - tracker domain
 * @param {Number} count - how many inferences to give
 * @returns {string[]} array of inferences
 */
async function getInferencesByTracker(tracker, count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Inferences.inference)
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId), 
      Trackers.tracker.eq(tracker)
    ))
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC)
    .limit(count)
    .exec()
  let inferences = query.map(x => x.Inferences.inference);
  return Array.from(new Set(inferences)); //removes duplicates
}

/**
 * Tracker by inferences (i.e. the following trackers know INFERENCE)
 * 
 * @param {string} inference
 * @param {Number} count
 * @returns {string[]} array of trackers
 */
async function getTrackersByInference(inference, count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId), 
      Inferences.inference.eq(inference)
    ))
    .limit(count)
    .exec();
  return query.map(x => x.Trackers.tracker);
}

/**
 * Trackers by domain (the following trackers know that you have been to DOMAIN)
 * 
 * @param {string} domain - domain
 * @returns {string[]} array of trackers
 */
async function getTrackersByDomain(domain) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
    .from(Trackers, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id), 
      Pages.domain.eq(domain)
    ))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .exec();
  return query.map(x => x.Trackers.tracker);
  // return Array.from(new Set(trackers)); //removes duplicates
}

/**
 * get trackers by inferences count 
 * 
 * (e.g. use case: find tracker that has made most inferences about user)
 * 
 * @param {Number} count - count of trackers
 * @returns {string[]} array of trackers
 */
async function getTrackersByInferenceCount(count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
    .from(Trackers, Inferences)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .limit(count)
    .exec();
  return query.map(x => x.Trackers.tracker);
}

/**
 * @typedef {Object} PageInfo
 * @property {string} title - the page's title
 * @property {string} domain - the page's domain
 * @property {string} path - the page's path
 * @property {} time - time page was loaded
 */

/**
 * given an inference and tracker, find pages where tracker made that inference 
 * 
 * @param {string} tracker - tracker domain
 * @param {string} inference - inference
 * @param {Number} count - number of pages to return
 * 
 * @returns {PageInfo[]}
 * 
 */
async function getPagesByTrackerAndInference(tracker, inference, count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id),
      lf.op.and(
        Trackers.tracker.eq(tracker)),
        Inferences.inference.eq(inference))))
    .orderBy(Pages.id, lf.Order.DESC)
    .limit(count)
    .exec();
  return query.map(page => page.Pages);
}

/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * 
 * @param {string} tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByTracker(tracker, count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Pages.domain)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(tracker)
    ))
    .limit(count)
    .exec();
  return query.map(x => x.Pages.domain);
}

/**
 * given an tracker and domain, give pages on that domain where tracker is present
 * 
 * @param {string} tracker - tracker domain
 * @param {string} domain - first-party domain
 * @param {Number} count - number of pages to return
 * 
 * @returns {PageInfo[]}
 * 
 */
async function getPagesByTrackerAndDomain(tracker, domain, count) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id)),
     lf.op.and(
        Trackers.tracker.eq(tracker),
        Pages.domain.eq(domain))))
    .orderBy(Pages.id, lf.Order.DESC)
    .limit(count)
    .exec();
  return query;
}

async function getTrackerWithInferencesByDomain(domain) {
  let trackers = await getTrackersByDomain(domain);
  let inferences = await getInferencesByTracker(trackers[0]);
  let count = await getPageVisitCountByTracker(trackers[0]);
  return {
    tracker: trackers[0],
    inferences: inferences,
    count: count
  }
}

/**
 * @typedef {Object} InferenceInfo
 * @property {string} inference
 * @property {PageInfo[]} pages
 */

/**
 * gets a lot of info about a tracker
 * used for infopage
 * 
 * @param  {} tracker
 * @param  {} inferenceCount
 * @param  {} pageCount
 * @returns {InferenceInfo[]}
 */
async function getInfoAboutTracker(tracker, inferenceCount, pageCount) {

  let inferences = await getInferencesByTracker(tracker, inferenceCount);
  let inferenceInfo = [];
  for (let inference of inferences) {
    inferenceInfo.push({
      inference: inference,
      pages: await getPagesByTrackerAndInference(tracker, inference, pageCount)
    });
  }
  return inferenceInfo;
}

/**
 * gets domains by how many trackers they have
 * 
 * @param  {} count
 * @returns {Object}
 */
async function getTrackerCountByDomain(domain) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.count(Trackers.tracker))
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Pages.domain.eq(domain)
    ))
    .exec();
  return query[0].Trackers["COUNT(tracker)"];
}

/**
 * gets domains by how many trackers they have
 * 
 * @param  {} count
 * @returns {Object}
 */
async function getDomainsByTrackerCount(count) {

  // TODO: this function is both inefficent and wrong

  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let domainsq = await ttDb.select(Pages.domain)
    .from(Pages)
    .groupBy(Pages.domain)
    .exec();
  // console.log(domainsq);

  const res = domainsq.map(async x => {
    const tc = await getTrackerCountByDomain(x.domain);
    // console.log(tc);
    return {
      domain: x.domain,
      trackerCount: tc
    }
  });
  const ret = await Promise.all(res);
  ret.sort((y, x) => {
    if (x.trackerCount < y.trackerCount) {
      return -1;
    }
    if (x.trackerCount > y.trackerCount) {
      return 1;
    }
    return 0;
  })
  return ret;
}


/* ========= */

/**
 * makes a query given string query name and arguments object
 * 
 * @param  {string} query - query name
 * @param  {Object} args - query arguments
 */
export default async function makeQuery(query, args) {
  let res;
  switch (query) {
    case "get_trackers":
      res = await getTrackers();
      break;
    case "get_top_trackers":
      res = await getTopTrackers(args.count);
      break;
    case "get_inferences":
      res = await getInferences();
      break;
    case "get_page_visit_count_by_tracker":
      res = await getPageVisitCountByTracker(args.tracker, args.count);
      break;
    case "get_inferences_by_tracker":
      res = await getInferencesByTracker(args.tracker, args.count);
      break;
    case "get_trackers_by_inference":
      res = await getTrackersByInference(args.inference, args.count);
      break;
    case "get_trackers_by_domain":
      res = await getTrackersByDomain(args.domain);
      break;
    case "get_domains_by_tracker":
      res = await getDomainsByTracker(args.tracker, args.count);
      break;   
    case "get_trackers_by_inference_count":
      res = await getTrackersByInferenceCount(args.count);
      break;
    case "get_pages_by_tracker_and_inference":
      res = await getPagesByTrackerAndInference(args.tracker, args.inference, args.count);
      break;

    case "get_pages_by_tracker_and_domain":
      res = await getPagesByTrackerAndDomain(args.tracker, args.domain, args.count);
      break;
    case "get_tracker_with_inferences_by_domain":
      res = await getTrackerWithInferencesByDomain(args.domain);
      break;
    case "get_info_about_tracker":
      res = await getInfoAboutTracker(args.tracker, args.inferenceCount, args.pageCount);
      break;
    case "get_domains_by_tracker_count":
      res = await getDomainsByTrackerCount(args.count);
      break;
    }
    
  return res;
}
