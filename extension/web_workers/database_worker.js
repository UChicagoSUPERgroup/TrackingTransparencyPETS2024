/** @module database_worker */


importScripts('/lib/lovefield.min.js'); 

/* DATABSE SETUP */
/* ============= */

let trackersWorkerPort;
let inferencingWorkerPort;

// console.log("database worker running");
var primarySchemaBuilder = lf.schema.create('datastore', 1);

primarySchemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addPrimaryKey(['id']).
    addIndex('idxTime', ['time'], false, lf.Order.DESC);


primarySchemaBuilder.createTable('Trackers').
    addColumn('id', lf.Type.INTEGER).
    addColumn('tracker', lf.Type.STRING). // company name
    addColumn('trackerCategory', lf.Type.STRING).
    addColumn('pageId', lf.Type.INTEGER).
    addPrimaryKey(['id'], true).
    addForeignKey('fk_pageId', {
         local: 'pageId',
         ref: 'Pages.id'
       });

primarySchemaBuilder.createTable('Inferences').
    addColumn('id', lf.Type.INTEGER).
    addColumn('inference', lf.Type.STRING).
    addColumn('inferenceCategory', lf.Type.STRING).
    addColumn('pageId', lf.Type.INTEGER).
    addColumn('threshold', lf.Type.NUMBER).
    addPrimaryKey(['id'], true).
    addForeignKey('fk_pageId', {
        local: 'pageId',
        ref: 'Pages.id'
      }).
    addIndex('idxThreshold', ['threshold'], false, lf.Order.DESC);

let primaryDbPromise = primarySchemaBuilder.connect();
var pageItem;
var trackerItem;
var inferenceItem;

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
async function storePage(info) {
  let ttDb = await primaryDbPromise;
  pageItem = ttDb.getSchema().table('Pages');

  var page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    'path': info.path,
    'protocol': info.protocol,
    'time': new Date(info.pageId),
  });
  return ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}

/**
 * stores new tracker record
 * 
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.trackerdomain - trackers's domain
 */
async function storeTracker(info) {
  let ttDb = await primaryDbPromise;
  trackerItem = ttDb.getSchema().table('Trackers');

  var tracker = trackerItem.createRow({
    'tracker': info.trackername,
    'trackerCategory': info.trackercategory,
    'pageId': info.pageId
  });

  return ttDb.insertOrReplace().into(trackerItem).values([tracker]).exec();
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
async function storeInference(info) {
  let ttDb = await primaryDbPromise;
  inferenceItem = ttDb.getSchema().table('Inferences');

  var inference = inferenceItem.createRow({
    'inference': info.inference,
    'inferenceCategory': info.inferenceCategory,
    'threshold': info.threshold,
    'pageId': info.pageId
  });
  return ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
}

/* QUERIES */
/* ======= */

var Inferences = primarySchemaBuilder.getSchema().table('Inferences');
var Trackers = primarySchemaBuilder.getSchema().table('Trackers');
var Pages = primarySchemaBuilder.getSchema().table('Pages');

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

/* WEB WORKER MESSAGES */
/* =================== */
/**
 * message listener from another background script or another worker
 * 
 * @param  {Object} m - message
 * @param {Object} m.data - content of message
 * @param {string} m.data.type - type of message (set by sender)
 */
async function onMessage(m) {
  // console.log('Message received from main script');
  // console.log(m);
  switch (m.data.type) {
    case "ping":
      console.log("database worker recieved ping");
      break;

    case "database_query":
      handleQuery(m.data.id, m.data.src, m.data.query, m.data.args);
      break;

    case "trackers_worker_port":
      trackersWorkerPort = m.data.port;
      trackersWorkerPort.onmessage = onMessage;
      break;
    case "inferencing_worker_port":
      inferencingWorkerPort = m.data.port;
      inferencingWorkerPort.onmessage = onMessage;
      break;

    // STORAGE

    case "store_page":
      // console.log('database_worker received store_page msg');
      storePage(m.data.info);
      break;
    case "store_tracker":
      // console.log('database_worker received store_tracker msg');
      storeTracker(m.data.info);
      break;
    case "store_inference":
      // console.log('database_worker received store_inference msg');
      storeInference(m.data.info);
      break;

    default:
      console.log("database worker recieved bad message");
  }
}
/**
 * makes sent query and sends reponse
 * 
 * @param  {Number} id  - query id (set by sender)
 * @param  {string} dst - query destination
 * @param  {string} query - query name
 * @param  {Object} args - query arguments
 */
async function handleQuery(id, dst, query, args) {
  let res;
  switch (query) {
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

  if (res) {
    postMessage({
      type: "database_query_response",
      id: id,
      dst: dst,
      response: res
    });
  }
}

onmessage = onMessage; // web worker
