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
 * @returns {string[]} array of inferences
 */
async function getTrackers() {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker).from(Trackers).exec(); // orderBy(Inferences.pageId, lf.Order.DESC) to get most recent
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
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id),
                                          Trackers.tracker.eq(tracker)))
                        .exec();
  return query[0].Pages["COUNT(domain)"];
}

/**
 * Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)
 * 
 * @param {string} tracker - tracker domain
 * @returns {string[]} array of inferences
 */
async function getInferencesByTracker(tracker) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Inferences.inference)
                        .from(Trackers, Inferences)
                        .where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), 
                                         Trackers.tracker.eq(tracker)))
                        .exec()
  let inferences = query.map(x => x.Inferences.inference);
  return Array.from(new Set(inferences)); //removes duplicates
}

/**
 * Tracker by inferences (i.e. the following trackers know INFERENCE)
 * 
 * @param {string} inference
 * @returns {string[]} array of trackers
 */
async function getTrackersByInference(inference) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Inferences)
                        .where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), 
                                         Inferences.inference.eq(inference)))
                        .exec();
  return query.map(x => x.Trackers.tracker);
}

/**
 * Trackers by page visit (the following trackers know that you have been to DOMAIN)
 * 
 * @param {string} domain - domain
 * @returns {string[]} array of trackers
 */
async function getTrackersByPageVisited(domain) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Pages)
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id), 
                                        Pages.domain.eq(domain)))
                        .groupBy(Trackers.tracker)
                        .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
                        .exec();
  let trackers = query.map(x => x.Trackers.tracker);
  return Array.from(new Set(trackers)); //removes duplicates
}

/**
 * get trackers by inferences count 
 * 
 * (e.g. use case: find tracker that has made most inferences about user)
 * 
 * @returns {string[]} array of trackers
 */
async function getTrackersByInferenceCount() {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Inferences)
                        .groupBy(Trackers.tracker)
                        .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
                        .exec();
  return query.map(x => x.Trackers.tracker);
}

/**
 * given an inference and tracker, find domains where tracker made that inference 
 * 
 * @param {string} Inference - inference
 * @param {string} Tracker - tracker
 * @returns {string[]} array of domains
 */
async function getDomainsByInferenceAndTracker(Inference, Tracker) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.distinct(Pages.domain).as("domain"))
                  .from(Trackers, Pages, Inferences)
                  .where(lf.op.and(lf.op.and(Trackers.pageId.eq(Pages.id),
                                             Trackers.tracker.eq(Tracker)),
                                             Inferences.inference.eq(Inference)))
                  .exec();
  return query[0]["domain"];
}

// These next two provide the functionality Min presented last week
// e.g. TRACKERNAME knows # sites you have visited > here are those sites > here are the titles within those sites

/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * 
 * @param {string} tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getPageVisitTracker(tracker) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Pages.domain)
                        .from(Pages, Trackers)
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id),
                                        Trackers.tracker.eq(tracker)))
                        .exec();
  return query.map(x => x.Pages.domain);
}

/**
 * Titles by Domain (i.e. User has visited TITLES on DOMAIN)
 * 
 * @param {string} tracker - tracker domain
 * @returns {string[]} array of page titles
 */
async function getTitlesByDomain(Domain) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.distinct(Pages.title).as("Title"))
                        .from(Pages)
                        .where(Pages.domain.eq(Domain))
                        .exec();
  return query.map(x => x.Title);
}

async function getTrackerWithInferencesByDomain(domain) {
  let trackers = await getTrackersByPageVisited(domain);
  let inferences = await getInferencesByTracker(trackers[0]);
  let count = await getPageVisitCountByTracker(trackers[0]);
  return {
    tracker: trackers[0],
    inferences: inferences,
    count: count
  }
}

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
    case "get_inferences":
      res = await getInferences();
      break;
    case "get_page_visit_count_by_tracker":
      res = await getPageVisitCountByTracker(args.tracker);
      break;
    case "get_inferences_by_tracker":
      res = await getInferencesByTracker(args.tracker);
      break;
    case "get_trackers_by_inference":
      res = await getTrackersByInference(args.inference);
      break;
    case "get_trackers_by_page_visited":
      res = await getTrackersByPageVisited(args.domain);
      break;
    case "get_trackers_by_inference_count":
      res = await getTrackersByInferenceCount();
      break;
    case "get_domains_by_inference_and_tracker":
      res = await getDomainsByInferenceAndTracker(args.inference, args.tracker);
      break;
    case "get_page_visit_tracker":
      res = await getPageVisitTracker(args.tracker);
      break;
    case "get_titles_by_domain":
      res = await getTitlesByDomain(args.domain);
      break;
    case "get_tracker_with_inferences_by_domain":
      res = await getTrackerWithInferencesByDomain(args.domain);
      break;
    }
    
  return res;
}
