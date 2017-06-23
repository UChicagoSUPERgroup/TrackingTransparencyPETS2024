var schemaBuilder = lf.schema.create('datastore', 1);

schemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addColumn('trackers', lf.Type.OBJECT).
    addColumn('categoryinference', lf.Type.STRING).
    addPrimaryKey(['id'], true).
    addIndex('idxTime', ['time'], false, lf.Order.DESC);

var ttDb;
var item;
schemaBuilder.connect().then(function(db) {
  ttDb = db;
  item = db.getSchema().table('Pages');
//   var row = item.createRow({
//     'title': 'example page',
//     'domain': 'example.com',
//     'path': '/',
//     'protocol': 'http',
//     'time': new Date(),
//     'categoryinference': 'Informational'
//   });

//   return db.insertOrReplace().into(item).values([row]).exec();
// }).then(function() {
//   return ttDb.select().from(item).where(item.time.lt(new Date())).exec();
// }).then(function(results) {
//   results.forEach(function(row) {
//     console.log(row['title'], 'visited at', row['time']);
//   });
});

function storePage(info) {
  var row = item.createRow({
    'title': info.title,
    'domain': info.domain,
    'path': info.path,
    'protocol': info.protocol,
    'time': new Date(),
    'categoryinference': info.categoryinference,
    'trackers': info.trackers
  });

  return ttDb.insertOrReplace().into(item).values([row]).exec();
}

/*

var schemaBuilder = lf.schema.create('datastore', 1);


schemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addPrimaryKey(['id'], true).		// true to auto-increment
    addIndex('idxTime', ['time'], false, lf.Order.DESC);


schemaBuilder.createTable('Inferences').
    addColumn('id', lf.Type.INTEGER).
    addColumn('inference', lf.Type.STRING).
    addColumn('inferenceCategory', lf.Type.STRING).
    addColumn('threshold', lf.Type.NUMBER)
    addColumn('trackerID, lf.Type.INT')
    addPrimaryKey(['id'], true).		// true to auto-increment
    addIndex('idxThreshold', ['threshold'], false, lf.Order.DESC);

// This is the additional foreign key we can add to get better data
// see note on the efficiency/data tradeoff when we add inferences
// to the database below


    // addForeignKey('fk_TrackerId', {
    //     local: 'trackerID',
    //     ref: 'Trackers.id',
    //     //action: lf.ConstraintAction.CASCADE,
    //     //timing: lf.ConstraintTiming.IMMEDIATE
});


});

schemaBuilder.createTable('Trackers').
    addColumn('id', lf.Type.INTEGER).
    addColumn('tracker_name', lf.Type.STRING).
  //addColumn('pageID', lf.Type.Integer)
    addPrimaryKey(['id'], true).		// true to auto-increment
    addForeignKey('fk_pageId', {
        local: 'pageID',
        ref: 'Pages.id',
        //action: lf.ConstraintAction.CASCADE,
        //timing: lf.ConstraintTiming.IMMEDIATE
});

var ttDb;
var pageItem;
var trackerItem;
var inferenceItem;




schemaBuilder.connect().then(function(db) {
  ttDb = db;
  pageIm = db.getSchema().table('Pages');
  trackerIm = db.getSchema().table('Trackers');
  inferenceIm = db.getSchema().table('Inferences');

  var pageData = pageIm.createRow({
    'title': info.title,
    'domain': info.domain,
    'path': info.path,
    'protocol': info.protocol,
    'time': new Date(),
});


  return ttDb.insertOrReplace().into(pageIm).values([pageData]).exec().then(function(results) {

	for (tracker in info.trackers) {

	var trackerData = trackerItem.createRow({
    	   'tracker': info.trackers[tracker],
    	   'pageID': pageData[0]['id']
	});


	}

	ttDb.insertOrReplace().into(trackerIm).values([trackerData]).exec().then(function(results) {

	// Inferencing should probably be handled here, but there are other ways to do it
	// We should probably discuss the following:
	// We can directly map complex inferences (i.e. not categorical) to individual page visits,
	// but it will push our insertions to quadratic time. Are the gains in efficiency here worth the data loss?


	// THIS IS NOT REAL DATA, yet

	var inferenceData = inferenceItem.createRow({
    	   'inference': "some inference",
    	   'inferenceCategory': "some inference category",
	   'threshold': 0.20,
	   'trackerID: trackerData[0]['id']
	});

	ttDb.insertOrReplace().into(inferenceItem).values([inferenceData]).exec().then(function(results) {

		});

	});

});
}
*/
