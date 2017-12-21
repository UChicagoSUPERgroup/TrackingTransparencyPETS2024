/** @module queries */

import lf from 'lovefield';
import _ from 'lodash';

import {primaryDbPromise, primarySchemaBuilder} from './setup';

let ttDb;
(async function() {
  ttDb = await primaryDbPromise;
})();

const Inferences = primarySchemaBuilder.getSchema().table('Inferences');
const Trackers = primarySchemaBuilder.getSchema().table('Trackers');
const Pages = primarySchemaBuilder.getSchema().table('Pages');


/* QUERIES */
/* ======= */

/* used in dashboard */

/**
get domains by tracker count
*/
async function getDomains(args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Trackers, Pages)
    .where(Trackers.pageId.eq(Pages.id))
    .groupBy(Pages.domain)
    .orderBy(lf.fn.count(lf.fn.distinct(Trackers.tracker)), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**
 * Trackers by domain (the following trackers know that you have been to DOMAIN)
 */
async function getTrackersByDomain(args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Pages.id))
    .from(Trackers, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Pages.domain.eq(args.domain)
    ))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Pages.id), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**
 * gets all trackers
 *
 */
async function getTrackers(args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**
 * Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)
 */
async function getInferencesByTracker(args) {
  if (!args.tracker) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Trackers.tracker.eq(args.tracker)
    ))
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  const res = await query.exec();
  return res.map(x => x.Inferences);
}

/**
 * gets all inferences
 */
async function getInferences(args) {
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Inferences)
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/**
 * Tracker by inferences (i.e. the following trackers know INFERENCE)
 */
async function getTrackersByInference(args) {
  if (!args.inference) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Inferences.pageId),
      Inferences.inference.eq(args.inference)
    ))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/* gets all timestamps of page visits */
async function getTimestamps(args) {
  let query = ttDb.select(Pages.id)
    .from(Pages)
  query = args.afterDate ? query.where(Pages.id.gte(args.afterDate)) : query;
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/* gets all timestaps for page visits for a specific inference */
async function getTimestampsByInference(args) {
  if (!args.inference) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(Pages.id)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Inferences.inference.eq(args.inference)));
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/* OLD QUERIES */
/* ======= */



/**
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 *
 * @param {string} tracker - tracker domain
 * @returns {Number} number of pages where that tracker was present
 */
async function getPageVisitCountByTracker(args) {
  let query = await ttDb.select(lf.fn.count(Pages.domain))
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
    .exec();
  return query[0].Pages['COUNT(domain)'];
}





/**
 * get trackers by inferences count
 *
 * (e.g. use case: find tracker that has made most inferences about user)
 *
 * @param {Number} count - count of trackers
 * @returns {string[]} array of trackers
 */
async function getTrackersByInferenceCount(args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Inferences.inference))
    .from(Trackers, Inferences, Pages)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Inferences.pageId.eq(Pages.id)))
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
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
async function getPagesByTrackerAndInference(args) {
  let query = ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id),
        lf.op.and(
          Trackers.tracker.eq(args.tracker)),
        Inferences.inference.eq(args.inference))))
    .orderBy(Pages.id, lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
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
 * returns an array of pages visited
 *
 * @returns {}
 *
 */
async function getPages(args) {
  let query = ttDb.select()
    .from(Pages, Trackers)
    .where(Trackers.pageId.eq(Pages.id))
    .orderBy(Pages.id, lf.Order.ASC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**

/**
 * returns an array of pages visited
 *
 * @returns {}
 *
 */
async function getPagesNoTrackers(args) {
  let query = ttDb.select()
    .from(Pages)
    .leftOuterJoin(Pages, Trackers.pageId.eq(Pages.id))
    .where(Trackers.tracker.isNull())
    .orderBy(Pages.id, lf.Order.ASC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/**
 * returns an array of domains visited
 *
 * @returns {}
 *
 */


async function getDomainsNoTrackers(args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Pages, Trackers.pageId.eq(Pages.id))
    .groupBy(Pages.domain)
    .having((lf.fn.count(Trackers.tracker).eq(0)))
    .orderBy(Pages.id, lf.Order.ASC)
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
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
async function getDomainsByTracker(args) {
  let query = ttDb.select(Pages.domain)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
  query = args.count ? query.limit(args.count) : query;
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
async function getPagesByTrackerAndDomain(args) {
  let query = ttDb.select()
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Inferences.pageId.eq(Pages.id)),
      lf.op.and(
        Trackers.tracker.eq(args.tracker),
        Pages.domain.eq(args.domain))))
    .orderBy(Pages.id, lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

async function getTrackerWithInferencesByDomain(args) {
  let trackers = await getTrackersByDomain({domain: args.domain});
  let inferences = await getInferencesByTracker({tracker: trackers[0]});
  let count = await getPageVisitCountByTracker({tracker: trackers[0]});
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
async function getInfoAboutTracker(args) {

  let inferenceCount = args.count;
  let pageCount = args.count;
  let inferences = await getInferencesByTracker({
    tracker: args.tracker, 
    count: inferenceCount
  });
  let inferenceInfo = [];
  for (let inference of inferences) {
    inferenceInfo.push({
      inference: inference,
      pages: await getPagesByTrackerAndInference({
        tracker:args.tracker, 
        inference: inference.inference,
        count: pageCount
      })
    });
  }
  return inferenceInfo;
}

/**

get inferences by tracker count

I think this is redundant with getInferences - unless we can make it only count unique trackers (though that may not be interesting)

*/

async function getInferencesByTrackerCount(args) {
  let query = ttDb.select(Inferences.inference, lf.fn.count(Trackers.tracker))
    .from(Trackers, Pages, Inferences)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Inferences.pageId.eq(Pages.id)
    ))
    .groupBy(Inferences.inferences);
    // .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
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
async function getInferenceCount(args) {
  let query = await ttDb.select(lf.fn.count(Inferences.inference))
    .from(Inferences)
    .where(Inferences.inference.eq(args.inference))
    .groupBy(Inferences.inference)
    .exec();
  let res;
  if (typeof query != 'undefined' && query != null && query.length > 0) {
    res = (query[0])['COUNT(inference)'];
  } else {
    res = '0';
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
  getDomains: getDomains,
  getTrackersByDomain: getTrackersByDomain,
  getTrackers: getTrackers,
  getInferencesByTracker: getInferencesByTracker,
  getInferences: getInferences,
  getTrackersByInference: getTrackersByInference,
  getTimestamps: getTimestamps,
  getTimestampsByInference: getTimestampsByInference,

  // old
  getPageVisitCountByTracker: getPageVisitCountByTracker,
  getDomainsByTracker: getDomainsByTracker,
  getTrackersByInferenceCount: getTrackersByInferenceCount,
  getPagesByTrackerAndInference: getPagesByTrackerAndInference,
  getPagesWithNumberOfTrackers: getPagesWithNumberOfTrackers,
  // getDomainsWithNumberOfTrackers: getDomainsWithNumberOfTrackers(),
  getPagesByTrackerAndDomain: getPagesByTrackerAndDomain,
  getNumberOfPages: getNumberOfPages,
  getTrackerWithInferencesByDomain: getTrackerWithInferencesByDomain,
  getInfoAboutTracker: getInfoAboutTracker,
  getPagesNoTrackers: getPagesNoTrackers,
  getDomainsNoTrackers: getDomainsNoTrackers,
  getInferencesByTrackerCount: getInferencesByTrackerCount,
  getInferenceCount: getInferenceCount,
  emptyDB: emptyDB
}

export const queryNames = Object.keys(QUERIES);

/**
 * makes a query given string query name and arguments object
 *
 * @param  {string} queryName - query name
 * @param  {Object} args - query arguments
 */
export default async function makeQuery(queryName, args) {
  if (!QUERIES[queryName]) {
    throw new Error('Query does not exist');
  }
  return await (QUERIES[queryName])(args);
}
