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
