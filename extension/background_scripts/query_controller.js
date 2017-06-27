// Background Script to manage methods that query database
// Skeleton for types of queries that we can reshape and parse when we know exactly what we want

// var db;
var Inferences = schemaBuilder.getSchema().table('Inferences');
var Trackers = schemaBuilder.getSchema().table('Trackers');
var Pages = schemaBuilder.getSchema().table('Pages');


// Get all inferences // Probably want to use idxThreshold to sort inferences eventually
async function getInferences() {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(Inferences.inference).from(Inferences).exec();
}

// Page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)

async function getPageVisitCountByTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(lf.fn.count(Pages.domain)).from(Pages, Trackers).where(lf.op.and(Trackers.pageId.eq(Pages.id), Trackers.tracker.eq(tracker))).exec();
}

// Page visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)

async function getPageVisitTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(Pages.domain).from(Pages, Trackers).where(lf.op.and(Trackers.pageId.eq(Pages.id), Trackers.tracker.eq(tracker))).exec();
}

// Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)

async function getInferencesByTracker(tracker) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(Inferences.inference).from(Trackers, Inferences).where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), Trackers.tracker.eq(tracker))).exec();
}

// Tracker by inferences (i.e. the following trackers know INFERENCE)

async function getInferencesByTracker(inference) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(Trackers.tracker).from(Trackers, Inferences).where(lf.op.and(Trackers.pageId.eq(Inferences.pageId), Inferences.inference.eq(inference))).exec();
}

// Trackers by page visit (the following trackers know that you have been to DOMAIN)

async function getTrackersByPageVisited(domain) {
  let ttDb = await dbPromise; // db is defined in datastore.js
  return ttDb.select(Trackers.tracker).from(Trackers, Pages).where(lf.op.and(Trackers.pageId.eq(Pages.id), Pages.domain.eq(domain))).exec();
}
