var schemaBuilder = lf.schema.create('datastore', 1);

schemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    //addColumn('trackerdomain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addColumn('categoryinference', lf.Type.STRING).
    addPrimaryKey(['id']).
    addIndex('idxTime', ['time'], false, lf.Order.DESC);


schemaBuilder.createTable('Trackers').
    addColumn('id', lf.Type.INTEGER).
    addColumn('tracker', lf.Type.STRING).
    addColumn('pageID', lf.Type.INTEGER).
    addPrimaryKey(['id'], true).
    addForeignKey('fk_pageId', {
         local: 'pageID',
         ref: 'Pages.id'
       });

schemaBuilder.createTable('Inferences').
    addColumn('id', lf.Type.INTEGER).
    addColumn('inference', lf.Type.STRING).
    addColumn('inferenceCategory', lf.Type.STRING).
    addColumn('pageID', lf.Type.INTEGER).
    addColumn('threshold', lf.Type.NUMBER).
    addPrimaryKey(['id'], true).
    addForeignKey('fk_pageId', {
        local: 'pageID',
        ref: 'Pages.id'
      }).
    addIndex('idxThreshold', ['threshold'], false, lf.Order.DESC);

var ttDb;
var pageItem;
var trackerItem;
var inferenceItem;

schemaBuilder.connect().then(function(db) {
  ttDb = db;
  pageItem = db.getSchema().table('Pages');
  trackerItem = db.getSchema().table('Trackers');
  inferenceItem = db.getSchema().table('Inferences');
});

function storePage(info) {
  var page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    //'trackerdomain': info.trackerdomain,
    'path': info.path,
    'protocol': info.protocol,
    'time': new Date(info.pageId),
    'categoryinference': ''
  });
  return ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}
function storeTracker(info) {
  var tracker = trackerItem.createRow({
    'tracker': info.trackerdomain,
    'pageID': pageID
  });

  return ttDb.insertOrReplace().into(trackerItem).values([tracker]).exec();
}

function storeInference(info) {
  var inference = inferenceItem.createRow({
    'inference': info.inference,
    'inferenceCategory': info.inferenceCategory,
    'threshold': info.threshold,
    'pageID': info.pageID
  });
  return ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
}
