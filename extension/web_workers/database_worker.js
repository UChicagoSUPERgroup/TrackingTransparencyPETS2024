importScripts('/lib/lovefield.min.js'); 
importScripts('/web_workers/query_controller.js'); 

/* DATABSE SETUP */
/* ============= */

let trackersWorkerPort;

console.log("database worker running");
var schemaBuilder = lf.schema.create('datastore', 1);

schemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addPrimaryKey(['id']).
    addIndex('idxTime', ['time'], false, lf.Order.DESC);


schemaBuilder.createTable('Trackers').
    addColumn('id', lf.Type.INTEGER).
    addColumn('tracker', lf.Type.STRING).
    addColumn('pageId', lf.Type.INTEGER).
    addPrimaryKey(['id'], true).
    addForeignKey('fk_pageId', {
         local: 'pageId',
         ref: 'Pages.id'
       });

schemaBuilder.createTable('Inferences').
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

let dbPromise = schemaBuilder.connect();
var pageItem;
var trackerItem;
var inferenceItem;

/* DATA STORAGE */
/* ============ */

async function storePage(info) {
  let ttDb = await dbPromise;
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
async function storeTracker(info) {
  let ttDb = await dbPromise;
  trackerItem = ttDb.getSchema().table('Trackers');

  var tracker = trackerItem.createRow({
    'tracker': info.trackerdomain,
    'pageId': info.pageId
  });

  return ttDb.insertOrReplace().into(trackerItem).values([tracker]).exec();
}

async function storeInference(info) {
  let ttDb = await dbPromise;
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

var Inferences = schemaBuilder.getSchema().table('Inferences');
var Trackers = schemaBuilder.getSchema().table('Trackers');
var Pages = schemaBuilder.getSchema().table('Pages');

// Get all inferences // Probably want to use idxThreshold to sort inferences eventually
async function getInferences() {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Inferences.inference).from(Inferences).exec(); // orderBy(Inferences.pageId, lf.Order.DESC) to get most recent
  return query.map(x => x.inference);
}

// Page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)

async function getPageVisitCountByTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.count(Pages.domain))
                        .from(Pages, Trackers)
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id),
                                          Trackers.tracker.eq(tracker)))
                        .exec();
  return query[0].Pages["COUNT(domain)"];
}

// Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)

async function getInferencesByTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Inferences.inference)
                        .from(Trackers, Inferences)
                        .where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), 
                                         Trackers.tracker.eq(tracker)))
                        .exec()
  return query.map(x => x.Inferences.inference);
}

// Tracker by inferences (i.e. the following trackers know INFERENCE)

async function getTrackersByInference(inference) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Inferences)
                        .where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), 
                                         Inferences.inference.eq(inference)))
                        .exec();
  return query.map(x => x.Trackers.tracker);
}

// Trackers by page visit (the following trackers know that you have been to DOMAIN)

async function getTrackersByPageVisited(domain) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Pages)
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id), 
                                        Pages.domain.eq(domain)))
                        .exec();
  return query.map(x => x.Trackers.tracker);
}

// get trackers by inferences count (e.g. use case: find tracker that has made most inferences about user)

async function getTrackersByInferenceCount() {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker)
                        .from(Trackers, Inferences)
                        .groupBy(Trackers.tracker)
                        .orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC)
                        .exec();
  return query.map(x => x.Trackers.tracker);
}

// given an inference and tracker, find domains where tracker made that inference 

async function getDomainsByInferenceAndTracker(Inference, Tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
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

// Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)

async function getPageVisitTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Pages.domain)
                        .from(Pages, Trackers)
                        .where(lf.op.and(Trackers.pageId.eq(Pages.id),
                                        Trackers.tracker.eq(tracker)))
                        .exec();
  return query.map(x => x.Pages.domain);
}

// Titles by Domain (i.e. User has visited TITLES on DOMAIN)

async function getTitlesByDomain(Domain) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.distinct(Pages.title).as("Title"))
                        .from(Pages)
                        .where(Pages.domain.eq(Domain))
                        .exec();
  return query.map(x => x.Title);
}

/* WEB WORKER MESSAGES */
/* =================== */

async function onMessage(m) {
  console.log('Message received from main script');
  console.log(m);
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

    // STORAGE

    case "store_page":
      console.log('database_worker received store_page msg');
      storePage(m.data.info);
      break;
    case "store_tracker":
      console.log('database_worker received store_tracker msg');
      storeTracker(m.data.info);
      break;
    case "store_inference":
      console.log('database_worker received store_inference msg');
      storeInference(m.data.info);
      break;

    default:
      console.log("database worker recieved bad message");
  }
}

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
