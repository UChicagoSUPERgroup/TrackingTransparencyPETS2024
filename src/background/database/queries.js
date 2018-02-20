/** @module queries */

import lf from 'lovefield';
import _ from 'lodash';

import trackerData from '../../data/trackers/companyData.json';

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

async function getAllData() {
  let pages = await getAllPages();
  let trackers = await getAllTrackers();
  let inferences = await getAllInferences();
  return {'pages': pages, 'trackers': trackers, 'inferences': inferences};
}

async function getAllPages() {
  let query = ttDb.select()
    .from(Pages)
  return await query.exec();
}

async function getAllTrackers() {
  let query = ttDb.select()
    .from(Trackers)
  return await query.exec();
}

async function getAllInferences() {
  let query = ttDb.select()
    .from(Inferences)
  return await query.exec();
}

/** get domains by tracker count
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getDomains(args) {
  let sel = ttDb.select(Pages.domain, lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Trackers, Pages);
  let where;
  if (args.afterDate) {
    where = sel.where(lf.op.and(
      Pages.id.gte(args.afterDate),
      Trackers.pageId.eq(Pages.id)
    ))
  } else {
    where = sel.where(Trackers.pageId.eq(Pages.id))
  }
  let query = where.groupBy(Pages.domain)
    .orderBy(lf.fn.count(lf.fn.distinct(Trackers.tracker)), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** get trackers present on a given domain
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.domain - domain
 * @param  {number} [args.count] - number of entries to return
 */
async function getTrackersByDomain(args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query');
  }
  let sel = ttDb.select(Trackers.tracker, lf.fn.count(Pages.id))
    .from(Trackers, Pages);
  let where;
  if (args.afterDate) {
    where = sel.where(lf.op.and(
      Pages.id.gte(args.afterDate),
      lf.op.and(
        Trackers.pageId.eq(Pages.id),
        Pages.domain.eq(args.domain)
      ))
    );
  } else {
    where = sel.where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Pages.domain.eq(args.domain)
    ));
  }
  let query = where.groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Pages.id), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** gets all trackers
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getTrackers(args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** gets all trackers in reverse order
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getTrackersReverse(args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/** get inferences made by a specifc tracker
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
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

/** gets all inferences
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate]
 */
async function getInferences(args) {
  let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
    .from(Inferences);

  query = args.afterDate ? query.where(Inferences.pageId.gte(args.afterDate)) : query;

  query = query
    .groupBy(Inferences.inference)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);

  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/** get trackers that have made a given inference
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
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

/** get timestamps of all page visits
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.afterDate] - date to query for entries after
 * @param  {number} [args.count] - number of entries to return
 */
async function getTimestamps(args) {
  let query = ttDb.select(Pages.id)
    .from(Pages);
  query = args.afterDate ? query.where(Pages.id.gte(args.afterDate)) : query;
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** gets all timestamps for page visits for a specific inference
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 */
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

/** gets all timestamps for page visits for a specific tracker
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
 */
async function getTimestampsByTracker(args) {
  if (!args.tracker) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(Pages.id)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)));
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/* COUNTING */

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
 * get the total number of unique trackers
 *
 * @returns {Integer} number of trackers
 */
async function getNumberOfTrackers() {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Trackers)
    .exec();
  return (query[0])['COUNT(DISTINCT(tracker))'];
}

/**
 * get the total number of unique inferences
 *
 * @returns {Integer} number of inferences made
 */
async function getNumberOfInferences() {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Inferences.inference)))
    .from(Inferences)
    .exec();
  return (query[0])['COUNT(DISTINCT(inference))'];
}


/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * @param {Object} args - args object
 * @param {string} args.tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByInference(args) {
  let query = ttDb.select()
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Inferences.inference.eq(args.inference)
    ))
  let qRes = await query.exec();

  let merged = _.reduce(qRes, function(result, value, index) {
    const domain = value.Pages.domain;
    if (result[domain]) {
      result[domain]++;
    } else {
      result[domain] = 1;
    }
    return result;
  }, {});

  return merged;
  // return res.map(x => x.Pages.domain);
}

/**
 * Inferences by domain (i.e. INFERENCES have been made on DOMAIN)
 * @param {Object} args - args object
 * @param {string} args.domain - domain
 * @returns {string[]} array of inferences
 */
async function getInferencesByDomain(args) {
  let query = ttDb.select(Inferences.inference)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Pages.domain.eq(args.domain)
      //.groupBy(Inferences.inference)
      //.orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);
    ))
   //return await query.exec();

  let qRes = await query.exec();

  let merged = _.reduce(qRes, function(result, value, index) {
    const inference = value.Inferences.inference;
    if (result[inference]) {
      result[inference]++;
    } else {
      result[inference] = 1;
    }
    return result;
  }, {});

  return merged;
}


/**
 * get Titles on DOMAIN where INFERENCE made
 * @param {Object} args - args object
 * @param {string} args.domain - domain
 * @param {string} args.inference - inference
 * @returns {string[]} array of titles
 *
 * e.g. show titles on DICTIONARY.COM where REFERENCE INFERENCE made
 * this may help on inferencingSunburst, so when you click on a Top Site, you can see titles drop domain
 *
 */
async function getTitlesbyInferenceAndDomain(args) {
  let query = ttDb.select(Pages.title)
    .from(Pages, Inferences)
    .where(lf.op.and(
      Inferences.pageId.eq(Pages.id),
      Inferences.inference.eq(args.inference),
      Pages.domain.eq(args.domain)
    ));
   // .groupBy(Pages.title)
   // .orderBy(lf.fn.count(Pages.title), lf.Order.DESC);

  let qRes = await query.exec();

  let merged = _.reduce(qRes, function(result, value, index) {
    const title = value.Pages.title;
    if (result[title]) {
      result[title]++;
    } else {
      result[title] = 1;
    }
    return result;

  }, {});
  return merged;
}


/* OLD QUERIES */
/* ======= */


/**
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 *
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


/* simulates lighbeam */
async function lightbeam(args) {
  // this is very inefficient code but is easier to hack together this way

  /* WE WANT TO RETURN
    {
      "www.firstpartydomain.com": {
        favicon: "http://blah...",
        firstParty: true,
        firstPartyHostnames: false,
        hostname: "www.firstpartydomain.com",
        thirdParties: [
          "www.thirdpartydomain.com"
        ]
      },
      "www.thirdpartydomain.com": {
        favicon: "",
        firstParty: false,
        firstPartyHostnames: [
          "www.firstpartydomain.com"
        ],
        hostname: "www.thirdpartydomain.com",
        thirdParties: []
      }
    }
    */
  let websites = {};

  const domains = (await getDomains({afterDate: args.afterDate})).map(x => x['Pages']['domain']);

  await Promise.all(domains.map(async (domain) => {
    const trackers = (await getTrackersByDomain({domain: domain, afterDate: args.afterDate}))
      .map(x => {
        const company = x['Trackers']['tracker'];
        return trackerData[company].domain;
      });

    if (websites[domain]) {
      websites[domain].firstParty = true;
      websites[domain].thirdParties.concat(trackers);
    } else {
      websites[domain] = {
        favicon: 'http://' + domain + '/favicon.ico',
        firstParty: true,
        firstPartyHostnames: false,
        hostname: domain,
        thirdParties: trackers
      }
    }

    for (let tracker of trackers) {
      if (websites[tracker]) {
        if (websites[tracker].firstPartyHostnames) {
          websites[tracker].firstPartyHostnames.push(domain);
        } else {
          websites[tracker].firstPartyHostnames = [domain];
        }
      } else {
        websites[tracker] = {
          favicon: '',
          firstParty: false,
          firstPartyHostnames: [domain],
          hostname: tracker,
          thirdParties: []
        }
      }
    }
  }));

  return websites;
}



/**
 * get trackers by inferences count
 *
 * (e.g. use case: find tracker that has made most inferences about user)
 *
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
 * given an inference and tracker, find pages where tracker made that inference
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
 */
async function getPages(args) {
  let query = ttDb.select()
    .from(Pages, Trackers)
    .where(Trackers.pageId.eq(Pages.id))
    .orderBy(Pages.id, lf.Order.ASC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

async function getPagesNoTrackers(args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
  .from(Pages)
  .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
  .groupBy(Pages.id)
  .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC);

  let pages = new Set();
  var i, j;
  const pagesQuery = await query.exec();
  for (i=0; i < pagesQuery.length; i++) {
      if ( pagesQuery[i]['Trackers']['COUNT(tracker)'] == 0) {
	      pages.add(pagesQuery[i]['Pages']['domain'])
	     }
  	}
   return Array.from(pages)

}

/**
 * returns an array of domains where a user has never seen a tracker
 *
 *
 */

async function getDomainsNoTrackers(args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
    .groupBy(Pages.domain)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC)

  let domains = []
  var i;
  const domainsQuery = await query.exec();
  for (i=0; i < domainsQuery.length; i++) {
    ((domainsQuery[i]['Trackers']['COUNT(tracker)'] == 0) ? domains.push(domainsQuery[i]['Pages']['domain']) : i = domainsQuery.length)
      }
   return domains

}


/**
 * Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)
 * @param {Object} args - args object
 * @param {string} args.tracker - tracker domain
 * @returns {string[]} array of domains
 */
async function getDomainsByTracker(args) {
  let query = ttDb.select()
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
  let qRes = await query.exec();
  let merged = _.reduce(qRes, function(result, value, index) {
    const domain = value.Pages.domain;
    if (result[domain]) {
      result[domain]++;
    } else {
      result[domain] = 1;
    }
    return result;
  }, {});
  let mergedRes = [];
  mergedRes = Object.keys(merged).map(key => ({domain: key, count: merged[key]}));
  mergedRes.sort((a, b) => (b.count - a.count));
  return mergedRes;
}

/**
 * given an tracker and domain, give pages on that domain where tracker is present
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
 * gets a lot of info about a tracker
 * used for infopage
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

/**
 * get domains by visit (not tracker) count
 *
 *
 */

async function getDomainVisits(args) {
   let query = ttDb.select(Pages.domain, lf.fn.count(Pages.domain))
	.from(Pages)
	.groupBy(Pages.domain)
	.orderBy(lf.fn.count(Pages.domain), lf.Order.DESC);

  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**
 * gets all titles
 *
 *
 */


async function getTitles(args) {
   let query = ttDb.select(Pages.title, lf.fn.count(Pages.title))
	.from(Pages)
	.groupBy(Pages.title)
	.orderBy(lf.fn.count(Pages.title), lf.Order.DESC);
   query = args.count ? query.limit(args.count) : query;
   return await query.exec();
}

/**
 * get titles seen on a given domain
 *
 *
 */

async function getTitlesByDomain(args) {
   let query = ttDb.select(Pages.title, lf.fn.count(Pages.title))
        .from(Pages)
        .where(Pages.domain.eq(args.domain))
        .groupBy(Pages.title)
        .orderBy(lf.fn.count(Pages.title), lf.Order.DESC);
   query = args.count ? query.limit(args.count) : query;
   return await query.exec();
}


/** erases all entries in database
 */
async function emptyDB() {
  let emptyInferences = ttDb.delete().from(Inferences).exec();
  let emptyTrackers = ttDb.delete().from(Trackers).exec();
  let emptyPages = ttDb.delete().from(Pages).exec();
  return await Promise.all([emptyInferences, emptyTrackers, emptyPages]);
}

/* ========= */

const QUERIES = {
  getAllData: getAllData,
  getAllPages: getAllPages,
  getAllTrackers: getAllTrackers,
  getAllInferences: getAllInferences,

  getDomains: getDomains,
  getTrackersByDomain: getTrackersByDomain,
  getTrackers: getTrackers,
  getTrackersReverse: getTrackersReverse,
  getInferencesByTracker: getInferencesByTracker,
  getInferences: getInferences,
  getTrackersByInference: getTrackersByInference,
  getTimestamps: getTimestamps,
  getTimestampsByInference: getTimestampsByInference,
  getTimestampsByTracker: getTimestampsByTracker,

  getNumberOfPages: getNumberOfPages,
  getNumberOfTrackers: getNumberOfTrackers,
  getNumberOfInferences: getNumberOfInferences,

  getInferencesByDomain: getInferencesByDomain,
  getDomainsByInference: getDomainsByInference,
  getTitlesbyInferenceAndDomain: getTitlesbyInferenceAndDomain,
  getDomainsByTracker: getDomainsByTracker,

  lightbeam: lightbeam,

  // old
  getPageVisitCountByTracker: getPageVisitCountByTracker,
  getTrackersByInferenceCount: getTrackersByInferenceCount,
  getPagesByTrackerAndInference: getPagesByTrackerAndInference,
  getPagesWithNumberOfTrackers: getPagesWithNumberOfTrackers,
  // getDomainsWithNumberOfTrackers: getDomainsWithNumberOfTrackers(),
  getPagesByTrackerAndDomain: getPagesByTrackerAndDomain,
  getTrackerWithInferencesByDomain: getTrackerWithInferencesByDomain,
  getInfoAboutTracker: getInfoAboutTracker,
  getPagesNoTrackers: getPagesNoTrackers,
  getDomainsNoTrackers: getDomainsNoTrackers,
  getInferencesByTrackerCount: getInferencesByTrackerCount,
  getInferenceCount: getInferenceCount,
  getDomainVisits: getDomainVisits,
  getTitles: getTitles,
  getTitlesByDomain: getTitlesByDomain,
  emptyDB: emptyDB
};

export const queryNames = Object.keys(QUERIES);

/**
 * executes a query given query name as string and arguments object
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
