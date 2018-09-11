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

function makeURL (Page) {
  return Page.protocol + '//' + Page.hostname + Page.path
}


/* QUERIES */
/* ======= */

/* used in dashboard */

async function getAllData() {
  let pages = ttDb.select().from(Pages).exec()
  let trackers = ttDb.select().from(Trackers).exec()
  let inferences = ttDb.select().from(Inferences).exec()
  return {
    pages: await pages, 
    trackers: await trackers, 
    inferences: await inferences
  }
}

/** get trackers present on a given domain
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.domain - domain
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
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
 * @returns {Object} query result
 */
async function getTrackers(args) {
  let query = ttDb.select(Trackers.tracker, lf.fn.count(Trackers.tracker))
    .from(Trackers)
    .groupBy(Trackers.tracker)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** get inferences made by a specifc tracker
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
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
  return res.map(x => ({
    name: x.Inferences['inference'],
    count: x.Inferences['COUNT(inference)']
  }))
}

/** gets all inferences
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
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

/** gets all inferences alongwith their page Id (which is basically timestamp) and domain
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate]
 */

async function getInferencesDomainsToSend(args) {
  //let query = ttDb.select(Inferences.inference, lf.fn.count(Inferences.inference))
  //  .from(Inferences);
  let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.domain, Trackers.tracker)
    .from(Inferences).
    innerJoin(Pages, Pages.id.eq(Inferences.pageId)).
    innerJoin(Trackers, Pages.id.eq(Trackers.pageId));
/*
let query = ttDb.select(Inferences.inference, Inferences.pageId, Inferences.id, Pages.domain)
  .from(Inferences).
  innerJoin(Pages, Pages.id.eq(Inferences.pageId));
*/
  query = args.afterDate ? query.where(Inferences.pageId.gte(args.afterDate)) : query;

  //query = query
  //  .groupBy(Inferences.inference)
  //  .orderBy(lf.fn.count(Inferences.inference), lf.Order.DESC);

  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/** get trackers that have made a given inference
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
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
 * @param  {number} [args.count] - number of entries to return
 * @param  {number} [args.afterDate] - only include page visits after this date,
 *                                     given as an integer for number of milliseconds since 1/1/1970
 * @returns {Object} query result
 */
async function getTimestamps(args) {
  let query = ttDb.select(Pages.id)
    .from(Pages);
  query = args.afterDate ? query.where(Pages.id.gte(args.afterDate)) : query;
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/** get domains by time window
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.startTime] - time start window
 * @param  {number} [args.endTime] - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getDomains(args) {

  let query = ttDb.select(lf.fn.distinct(Pages.domain))
    .from(Pages);
  if (args.startTime && args.endTime) {
    query = query.where(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)
      )
    )
  } else if (args.startTime) {
    query = query.where(Pages.id.gte(args.startTime))
  } else if (args.endTime) {
    query = query.where(Pages.id.lte(args.endTime))
  }
  query = query.orderBy(Pages.id, lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  const res = await query.exec();
  return res.map(x => x['DISTINCT(domain)']);
}

/** get inferences by time window-
 *
 * @param  {Object} args - arguments object
 * @param  {number} [args.count] - number of entries to return
 */
async function getInferencesByTime(args) {

  let query = ttDb.select(lf.fn.distinct(Inferences.inference))
    .from(Inferences)
    .orderBy(Inferences.pageId, lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}


/** get pages by time window- needs both start and end times
 *
 * @param  {Object} args - arguments object
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTime(args) {
  if (!args.startTime) {
    args.startTime = (new Date('January 1 2018')).getTime()
  }
  if (!args.endTime) {
    args.endTime = Date.now()
  }
  let noInferences = await getPagesNoInferences(args);
  noInferences = noInferences.map(x => x.Pages)

  let query = ttDb.select(Pages.title, Pages.id, Pages.domain, Inferences.inference)
    .from(Pages, Inferences);
  query = (args.startTime && args.endTime) ?
    query.where(lf.op.and(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime)),
      Inferences.pageId.eq(Pages.id))) :
    query;
  query = args.count ? query.limit(args.count) : query;
  query = query.orderBy(Pages.id, lf.Order.ASC);
  let withInferences = await query.exec();
  withInferences = withInferences.map(x => ({
    ...x.Pages,
    inference: x.Inferences.inference
  }))
  let combined = noInferences
    .concat(withInferences)
    .sort(function(a,b) {
      return a['id'] - b['id']
    })
  return combined;
}

/** get pages by tracker
 * 
 * @param  {Object} args - arguments object
 * @param  {number} args.tracker - tracker
 * @param  {number} [args.count] - number of entries to return
 */
async function getPagesByTracker (args) {
  if (!args.tracker) {
    throw new Error('Insufficient args provided for query')
  }

  let query = ttDb.select(Pages.id, Pages.title, Pages.domain, Pages.hostname, Pages.path, Pages.protocol)
    .from(Pages, Trackers)
    .where(lf.op.and(
      Trackers.pageId.eq(Pages.id),
      Trackers.tracker.eq(args.tracker)
    ))
  query = args.count ? query.limit(args.count) : query;
  query = query.orderBy(Pages.id, lf.Order.ASC);
  let pages = await query.exec();

  pages = pages.map(async (p) => {
    let page = p.Pages
    page.url = makeURL(page)
    
    let inferQ = ttDb.select(Inferences.inference)
      .from(Inferences)
      .where(Inferences.pageId.eq(page.id))
    let infer = (await inferQ.exec())
    
    if (infer[0] && infer[0].inference) {
      page.inference = infer[0].inference
    }
    return page
  })
  return await Promise.all(pages);
}

/** gets all timestamps for page visits for a specific inference
 *
 * @param  {Object} args - arguments object
 * @param  {string} args.inference - inference
 * @param  {number} [args.count] - number of entries to return
 * @returns {Object} query result
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
 * @returns {Object} query result
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
 * get the total number of domains
 *
 * @returns {Integer} number of domains
 */
async function getNumberOfDomains() {
  let query = await ttDb.select(lf.fn.count(lf.fn.distinct(Pages.domain)))
    .from(Pages)
    .exec();
  return (query[0])['COUNT(DISTINCT(domain))'];
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

  let merged = _.reduce(qRes, function(result, value) {
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
 * @returns {Object} infernce and count
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

  let merged = _.reduce(qRes, function(result, value) {
    const inference = value.Inferences.inference;
    if (result[inference]) {
      result[inference]++;
    } else {
      result[inference] = 1;
    }
    return result;
  }, {});

  let res = []
  Object.keys(merged).forEach(key => {
    res.push({
      name: key,
      count: merged[key]
    })
  })
  return res;
}


/**
 * simulates mozilla lighbeam
 *
 * @param {Object} args - args object
 * @param {string} args.domain - domain
 * @param {string} args.inference - inference
 * @returns {Object} object in desired lighbeam format
 */
async function lightbeam(args) {
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

  const domains = (await getDomains({startTime: args.afterDate}));

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
 * page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)
 *
 * @param {any} args
 * @returns {Object[]} trackers, with count of page visits
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
 * get domains by tracker count
 * (e.g. use case: find domain that has most trackers)
 *
 * @param {any} args
 * @returns {Object[]} trackers, with count of inferences
 */
async function getDomainsByTrackerCount(args) {
  let query = ttDb.select(Pages.domain, lf.fn.count(lf.fn.distinct(Trackers.tracker)))
    .from(Pages, Trackers)
    .where(Trackers.pageId.eq(Pages.id))
    .groupBy(Pages.domain)
    .orderBy(lf.fn.count(lf.fn.distinct(Trackers.tracker)), lf.Order.DESC);
  query = args.count ? query.limit(args.count) : query;
  return await query.exec();
}

/**
 * gets pages without trackers
 *
 * @param {any} args
 * @returns {Object[]} pages visited
 */
async function getPagesNoTrackers() {
  let query = ttDb.select(Pages.domain, lf.fn.count(Trackers.tracker))
    .from(Pages)
    .leftOuterJoin(Trackers, Pages.id.eq(Trackers.pageId))
    .groupBy(Pages.id)
    .orderBy(lf.fn.count(Trackers.tracker), lf.Order.ASC);

  let pages = new Set();
  var i;
  const pagesQuery = await query.exec();
  for (i=0; i < pagesQuery.length; i++) {
    if ( pagesQuery[i]['Trackers']['COUNT(tracker)'] == 0) {
      pages.add(pagesQuery[i]['Pages']['domain'])
    }
  }
  return Array.from(pages)

}

/**
 * gets pages without inferences
 *
 * @param {any} args
 * @param  {number} args.startTime - time start window
 * @param  {number} args.endTime - time end window
 * @returns {Object[]} pages visited
 */
async function getPagesNoInferences(args) {
  let query = ttDb.select(Pages.domain, Pages.id, Pages.title, lf.fn.count(Inferences.inference))
    .from(Pages)
    .leftOuterJoin(Inferences, Pages.id.eq(Inferences.pageId))
  query = (args.startTime && args.endTime) ?
    query.where(
      lf.op.and(
        Pages.id.gte(args.startTime),
        Pages.id.lte(args.endTime))) :
    query;
  query = query.groupBy(Pages.id)
    .orderBy(lf.fn.count(Inferences.inference), lf.Order.ASC);

  let pages = new Set();
  var i;
  const pagesQuery = await query.exec();
  for (i=0; i < pagesQuery.length; i++) {
    if ( pagesQuery[i]['Inferences']['COUNT(inference)'] == 0) {
      pages.add(pagesQuery[i])
    }
  }
  return Array.from(pages)

}


/** gets all domains without any trackers
 *
 * @param  {Object} args - no args accepted currently
 * @returns [domain] query result is an array of strings
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
    ((domainsQuery[i]['Trackers']['COUNT(tracker)'] == 0) ?
      domains.push(domainsQuery[i]['Pages']['domain']) :
      i = domainsQuery.length)
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
  let merged = _.reduce(qRes, function(result, value) {
    const domain = value.Pages.domain;
    if (result[domain]) {
      result[domain]++;
    } else {
      result[domain] = 1;
    }
    return result;
  }, {});
  let mergedRes = [];
  mergedRes = Object.keys(merged).map(key => ({name: key, count: merged[key]}));
  mergedRes.sort((a, b) => (b.count - a.count));
  return mergedRes;
}



async function getPagesByDomain(args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(lf.fn.distinct(Pages.title))
    .from(Pages)
    .where(Pages.domain.eq(args.domain))
    .orderBy(Pages.id, lf.Order.DESC)
  query = args.count ? query.limit(args.count) : query;

  return await query.exec();

}

async function getPageCountByDomain(args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(lf.fn.count(Pages.title))
    .from(Pages)
    .where(Pages.domain.eq(args.domain))

  return await query.exec();

}

async function getTrackerCountByDomain(args) {
  if (!args.domain) {
    throw new Error('Insufficient args provided for query');
  }
  let query = ttDb.select(lf.fn.count(Trackers.tracker))
    .from(Trackers, Pages)
    .where(lf.op.and(Trackers.pageId.eq(Pages.id), Pages.domain.eq(args.domain)))

  return await query.exec();

}

// /*
//  * gets a lot of info about a tracker
//  * used for infopage
//  */
// async function getInfoAboutTracker(args) {

//   let inferenceCount = args.count;
//   let pageCount = args.count;
//   let inferences = await getInferencesByTracker({
//     tracker: args.tracker,
//     count: inferenceCount
//   });
//   let inferenceInfo = [];
//   for (let inference of inferences) {
//     inferenceInfo.push({
//       inference: inference,
//       pages: await getPagesByTrackerAndInference({
//         tracker:args.tracker,
//         inference: inference.inference,
//         count: pageCount
//       })
//     });
//   }
//   return inferenceInfo;
// }

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

/* ========= */

const QUERIES = {

  getAllData: getAllData,
  getDomains: getDomains, // used in dashboard
  getDomainsByInference: getDomainsByInference,
  getDomainsByTracker: getDomainsByTracker,
  getDomainsNoTrackers: getDomainsNoTrackers,
  getPagesByDomain: getPagesByDomain,
  getPagesByTime: getPagesByTime, // used in activities
  getPagesByTracker: getPagesByTracker, // used in dashboard, trackers page
  getPageCountByDomain: getPageCountByDomain,
  getTrackerCountByDomain: getTrackerCountByDomain,
  getInferencesByDomain, // used in tests
  getInferencesDomainsToSend: getInferencesDomainsToSend, // this is to send data to server contaiing pageIds and inferences and domain names
  getInferenceCount: getInferenceCount, // used in dashboard
  getInferences: getInferences, // used in dashboard inferences page
  getInferencesByTracker, // used in dashboard
  getNumberOfDomains: getNumberOfDomains, // used in dashboard
  getNumberOfInferences: getNumberOfInferences, // used in popup, dashboard
  getNumberOfPages: getNumberOfPages, // used in popup, lighbeam, dashboard
  getNumberOfTrackers: getNumberOfTrackers, // used in popup, lightbeam, dashboard
  getPageVisitCountByTracker: getPageVisitCountByTracker, // used in popup
  getDomainsByTrackerCount: getDomainsByTrackerCount,
  getTimestamps: getTimestamps, // used in dashboard
  getTimestampsByInference: getTimestampsByInference,
  getTimestampsByTracker: getTimestampsByTracker,
  getInferencesByTime: getInferencesByTime,
  getTrackers: getTrackers, // used in dasboard
  getTrackersByDomain: getTrackersByDomain, // used in dashboard
  getTrackersByInference: getTrackersByInference, // used in dashboard
  lightbeam: lightbeam // used by lightbeam
};

export const queryNames = Object.keys(QUERIES);

/**
 * executes a query given query name as string and arguments object
 *
 * @param  {string} queryName - query name
 * @param  {Object} args - query arguments
 * @returns {any} result of query
 */
export default async function makeQuery(queryName, args) {
  if (!ttDb) {
    // try to connect to database again
    ttDb = await primaryDbPromise;

    // if that also fails throw an error
    if (!ttDb) {
      throw new Error('database not initialized');
    }
  }

  if (!QUERIES[queryName]) {
    throw new Error('Query ' + queryName + ' does not exist');
  }
  return await (QUERIES[queryName])(args);
}
