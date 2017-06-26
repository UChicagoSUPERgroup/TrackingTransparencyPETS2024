// Background Script to manage methods that query database
// Skeleton for types of queries that we can reshape and parse when we know exactly what we want

var db;
var Inferences = schemaBuilder.getSchema().table('Inferences');
var Trackers = schemaBuilder.getSchema().table('Trackers');
var Pages = schemaBuilder.getSchema().table('Pages');


// Get all inferences // Probably want to use idxThreshold to sort inferences eventually
function getInferences(db) {

  return db.select(Inferences.inference).from(Inferences).exec();
}

// Page visit count by tracker (i.e. TRACKERNAME knows # sites you have visited)

function getPageVisitCountByTracker(db, tracker) {

  return db.select(lf.fn.count(Pages.domain)).from(Pages, Trackers).where(lf.op.and(Trackers.pageID.eq(Pages.id), Trackers.tracker.eq(tracker))).exec();
}

// Page visits by tracker (i.e. TRACKERNAME knows you have been to the following sites)

function getPageVisitTracker(db, tracker) {

  return db.select(Pages.domain).from(Pages, Trackers).where(lf.op.and(Trackers.pageID.eq(Pages.id), Trackers.tracker.eq(tracker))).exec();
}

// Inferences by Tracker (i.e. TRACKERNAME has made these inferences about you)

function getInferencesByTracker(db, tracker) {
  return db.select(Inferences.inference).from(Trackers, Inferences).where(lf.op.and(Trackers.pageID.eq(Inferences.pageID), Trackers.tracker.eq(tracker))).exec();
}

// Tracker by inferences (i.e. the following trackers know INFERENCE)

function getInferencesByTracker(db, inference) {
  return db.select(Trackers.tracker).from(Trackers, Inferences).where(lf.op.and(Trackers.pageID.eq(Inferences.pageID), Inferences.inference.eq(inference))).exec();
}

// Trackers by page visit (the following trackers know that you have been to DOMAIN)

function getTrackersByPageVisited(db, domain) {
  return db.select(Trackers.tracker).from(Trackers, Pages).where(lf.op.and(Trackers.pageID.eq(Pages.id), Pages.domain.eq(domain))).exec();
}
