// Background Script to manage methods that query database
// Skeleton for types of queries that we can reshape and parse when we know exactly what we want

// var db;
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
  let query = await ttDb.select(Inferences.inference).from(Trackers, Inferences).where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), Trackers.tracker.eq(tracker))).exec()
  return query.map(x => x.Inferences.inference);
}

// Tracker by inferences (i.e. the following trackers know INFERENCE)

async function getTrackersByInference(inference) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker).from(Trackers, Inferences).where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), Inferences.inference.eq(inference))).exec();
  return query.map(x => x.Trackers.tracker);
}

// Trackers by page visit (the following trackers know that you have been to DOMAIN)

async function getTrackersByPageVisited(domain) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker).from(Trackers, Pages).where(lf.op.and(Trackers.pageId.eq(Pages.id), Pages.domain.eq(domain))).exec();
  return query.map(x => x.Trackers.tracker);
}

// get trackers by inferences count (e.g. use case: find tracker that has made most inferences about user)

async function getTrackersByInferenceCount() {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Trackers.tracker).from(Trackers, Inferences).groupBy(Trackers.tracker).orderBy(lf.fn.count(Trackers.tracker), lf.Order.DESC).exec();
  return query.map(x => x.Trackers.tracker);
}

// given an inference and tracker, find domains where tracker made that inference 

async function getDomainsByInferenceAndTracker(Inference, Tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = ttDb.select(lf.fn.distinct(Pages.domain).as("domain")).from(Trackers, Pages, Inferences).where(lf.op.and(lf.op.and(Trackers.pageId.eq(Pages.id), Trackers.tracker.eq(Tracker)), Inferences.inference.eq(Inference))).exec().then(function(rows) {
    return rows[0]["domain"]});
}

// These next two provide the functionality Min presented last week
// e.g. TRACKERNAME knows # sites you have visited > here are those sites > here are the titles within those sites

// Domain visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)

async function getPageVisitTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(Pages.domain).from(Pages, Trackers).where(lf.op.and(Trackers.pageId.eq(Pages.id), Trackers.tracker.eq(tracker))).exec();
  return query.map(x => x.Pages.domain);
}

// Titles by Domain (i.e. User has visited TITLES on DOMAIN)

async function getTitlesByDomain(Domain) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  let query = await ttDb.select(lf.fn.distinct(Pages.title).as("Title")).from(Pages).where(Pages.domain.eq(Domain)).exec();
  return query.map(x => x.Pages.title);
}
