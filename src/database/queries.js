/** @module queries */

import lf from "lovefield";
import {primaryDbPromise, primarySchemaBuilder} from "setup.js";

let ttDb;
(async function() {
  ttDb = await primaryDbPromise;
})();

import _ from "lodash";

/* QUERIES */
/* ======= */

const Inferences = primarySchemaBuilder.getSchema().table('Inferences');
const Trackers = primarySchemaBuilder.getSchema().table('Trackers');
const Pages = primarySchemaBuilder.getSchema().table('Pages');

/**
 * gets all inferences
 */
async function getInferences(count) {
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Inferences)
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
  query = count ? query.limit(count) : query;
  return await query.exec();
}

/**
 * gets all trackers
 *
 * @returns {string[]} array of trackers
 */
async function getTrackers(count) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = count ? query.limit(count) : query;
  return await query.exec();
}

/**
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 *
 * @param {string} tracker - tracker domain
 * @returns {Number} number of pages where that tracker was present
 */
async function getPageVisitCountByTracker(tracker) {
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
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Trackers.tracker.eq(tracker)
    ))
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
  query = count ? query.limit(count) : query;
  const res = await query.exec();
  return res.map(x => x.Inferences);
}

/**
 * Tracker by inferences (i.e. the following trackers know INFERENCE)
 *
 * @param {string} inference
 * @param {Number} count
 * @returns {string[]} array of trackers
 */
async function getTrackersByInference(inference, count) {
  let query = ttDb.select(Trackers.tracker)
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Inferences.inference.eq(inference)
    ));
  query = count ? query.limit(count) : query;
  const res = await query.exec();
  return res.map(x => x.Trackers.tracker);
}

/**
 * Trackers by domain (the following trackers know that you have been to DOMAIN)
 *
 * @param {string} domain - domain
 * @returns {string[]} array of trackers
 */
async function getTrackersByDomain(domain) {
  let ttDb = await primaryDbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker, lf.fn.count(Pages.id))
    .from(Trackers, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Pages.domain.eq(domain)
    ))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .exec();
  return query;
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
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Inferences.pageId.eq(Pages.id)))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = count ? query.limit(count) : query;
  return await query.exec();
}

/**
async function getTrackersByInferenceCount(count) {
  let query = await ttDb.select(Trackers.tracker, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Inferences.pageId.eq(Pages.id)))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .limit(count)
    .exec();
  return query;
}

*/

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
  let query = ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id),
      lf.op.and(
        Trackers.tracker.eq(tracker)),
        Inferences.inference.eq(inference))))
    .orderBy(Pages.id, lf.Order.DESC);
  query = count ? query.limit(count) : query;
  const res = await query.exec();
  return res.map(page => page.Pages);
}

/**
 * returns an array of pages with number of trackers
 *
 * @returns {}
 *
 */
async function getPagesWithNumberOfTrackers() {
  let pages = [];
  const query = await getPages();

  const grouped = _.groupBy(query, 'Pages.id');
  for (let page in grouped) {
    pages.push({
      page: (grouped[page])[0].Pages,
      count: (grouped[page]).length
    });
  }

  return pages.sort((a,b) => {
    return (b.count) - (a.count);
  });
}

/**
 * domains with number of trackers total
 *
 * @returns {}
 *
async function getDomainsWithNumberOfTrackers() {
  let domains = [];

  let query = await ttDb.select(Trackers.firstPartyDomain, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.firstPartyDomain)
    //.groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC)
    .exec();
  return query.map(row => {
    return {
      domain: row.firstPartyDomain,
      trackers: row['COUNT(tracker)']
    }
  });
}
*/

  // const query = await getPages();

  // const grouped = _.groupBy(query, 'Pages.domain');
  // // const grouped = _.groupBy(groupedDomain, 'Trackers.tracker')
  // for (let domain in grouped) {
  //   let trackers = new Set();
  //   for (let page of grouped[domain]) {
  //     trackers.add(page.Trackers.tracker)
  //   }
  //   domains.push({
  //     domain: domain,
  //     trackers: trackers.size
  //   });
  // }
  // return domains.sort((a,b) => {
  //   return (b.trackers) - (a.trackers);
  // });

// }

/**
 * returns an array of pages visited
 *
 * @returns {}
 *
 */
async function getPages() {
  let query = await ttDb.select()
    .from(Pages, Trackers)
    .where(Trackers.pageId.eq(Pages.id))
    .orderBy(Pages.id, lf.Order.ASC)
    .exec();
  return query;
}

/**

/**
 * returns an array of pages visited
 *
 * @returns {}
 *
 */
async function getPagesNoTrackers() {
  let query = await ttDb.select()
    .from(Pages)
    .leftOuterJoin(Pages, Trackers.pageId.eq(Pages.id))
    .where(Trackers.tracker.isNull())
    .orderBy(Pages.id, lf.Order.ASC)
    .exec();
  return query;
}


/**
 * returns an array of domains visited
 *
 * @returns {}
 *
 */


async function getDomainsNoTrackers() {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
  .from(Pages)
  .leftOuterJoin(Pages, Trackers.pageId.eq(Pages.id))
  .groupBy(Pages.domain)
  .having((lf.fn.count(Trackers.tracker).eq(0)))
  .orderBy(Pages.id, lf.Order.ASC)
  return query;
}

/**
 * get the total number of pages
 *
 * @returns {Integer} number of page visits
 */
async function getNumberOfPages() {
  let query = await ttDb.select(lf.fn.count(Pages.id))
    .from(Pages)
    .exec();
  return (query[0])['COUNT(id)'];
}

/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 *
 * @param {string} tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByTracker(tracker, count) {
  let query = ttDb.select(Pages.domain)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(tracker)
    ))
  query = count ? query.limit(count) : query;
  const res = await query.exec();
  return res.map(x => x.Pages.domain);
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
  let query = ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id)),
     lf.op.and(
        Trackers.tracker.eq(tracker),
        Pages.domain.eq(domain))))
    .orderBy(Pages.id, lf.Order.DESC);
  query = count ? query.limit(count) : query;
  return await query.exec();
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
      pages: await getPagesByTrackerAndInference(tracker, inference.inference, pageCount)
    });
  }
  return inferenceInfo;
}

/**

get inferences by tracker count

I think this is redundant with getInferences - unless we can make it only count unique trackers (though that may not be interesting)

*/

async function getInferencesByTrackerCount() {
  let query = await ttDb.select(Inferences.inference, lf.fn.count(Trackers.tracker))
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Inferences.pageId.eq(Pages.id)
    ))
    .groupBy(Inferences.inferences)
    // .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
    .exec();
  return query;
}

/**

get domains by tracker count

*/

async function getDomainsByTrackerCount() {
  let query = await ttDb.select(Pages.domain, lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Trackers, Pages)
    .where(Trackers.pageId.eq(Pages.id))
    .groupBy(Pages.domain)
    .exec();
  return query;
}

/**
 * Count of how many times an inference has been made
 *
 * TODO: right now we use this on infopage and make a query for every single possible inferce
 * when it would be better just to have one query that returns counts of all inferences
 *
 * @param {string} inference
 * @returns {string[]} array of trackers
 */
async function getInferenceCount(inference) {
  let query = await ttDb.select(lf.fn.count(Inferences.inference))
    .from(Inferences)
    .where(Inferences.inference.eq(inference))
    .groupBy(Inferences.inference)
    .exec();
  let res;
  if (typeof query != "undefined" && query != null && query.length > 0) {
    res = (query[0])['COUNT(inference)'];
  } else {
    res = "0";
  }
  return res;
}

// unsure how to chain these
async function emptyDB() {
    let emptyInferences = await ttDb.delete().from(Inferences).exec();
    //let emptyTrackers = await ttDb.delete().from(Trackers).exec();
    //let emptyPages = await ttDb.delete().from(Pages).exec();
    return emptyInferences;
}

/* ========= */

const QUERIES = {
  get_trackers: async args => await getTrackers(args.count),
  get_inferences: async args => getInferences(args.count),
  get_page_visit_count_by_tracker: async args => {
    return await getPageVisitCountByTracker(args.tracker);
  },
  get_inferences_by_tracker: async args => {
    return await getInferencesByTracker(args.tracker, args.count);
  },
  get_trackers_by_inference: async args => {
    return await getTrackersByInference(args.inference, args.count);
  },
  get_trackers_by_domain: async args => await getTrackersByDomain(args.domain),
  get_domains_by_tracker: async args => {
    return await getDomainsByTracker(args.tracker, args.count);
  },
  get_trackers_by_inference_count: async args => {
    return await getTrackersByInferenceCount(args.count);
  },
  get_pages_by_tracker_and_inference: async args => {
    return await getPagesByTrackerAndInference(args.tracker, args.inference, args.count);
  },
  get_pages_with_number_of_trackers: async args => {
    return await getPagesWithNumberOfTrackers(args.count);
  },
  // get_domains_with_number_of_trackers: async args => {
  //   return await getDomainsWithNumberOfTrackers();
  // }
  get_pages_by_tracker_and_domain: async args => {
    return await getPagesByTrackerAndDomain(args.tracker, args.domain, args.count);
  },
  get_number_of_pages: async () => await getNumberOfPages(),
  get_tracker_with_inferences_by_domain: async args => {
    return await getTrackerWithInferencesByDomain(args.domain);
  },
  get_info_about_tracker: async args => {
    return await getInfoAboutTracker(args.tracker, args.inferenceCount, args.pageCount);
  },
  get_pages_no_trackers: async () => await getPagesNoTrackers(),
  get_domains_no_trackers: async () => await getDomainsNoTrackers(),
  get_inferences_by_tracker_count: async () => await getInferencesByTrackerCount(),
  get_domains_by_tracker_count: async () => await getDomainsByTrackerCount(),
  get_inference_count: async args => await getInferenceCount(args.inference),
  emptyDB: async () => await emptyDB()
}

/**
 * makes a query given string query name and arguments object
 *
 * @param  {string} query - query name
 * @param  {Object} args - query arguments
 */
export default async function makeQuery(query, args) {
  return (QUERIES[query] || async () => {})(args);
}
