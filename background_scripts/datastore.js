var schemaBuilder = lf.schema.create('datastore', 1);

schemaBuilder.createTable('Pages').
    addColumn('id', lf.Type.INTEGER).
    addColumn('title', lf.Type.STRING).
    addColumn('domain', lf.Type.STRING).
    addColumn('path', lf.Type.STRING).
    addColumn('protocol', lf.Type.STRING).
    addColumn('time', lf.Type.DATE_TIME).
    addColumn('categoryinference', lf.Type.STRING).
    addPrimaryKey(['id'], true).
    addIndex('idxTime', ['time'], false, lf.Order.DESC);

var ttDb;
var item;
schemaBuilder.connect().then(function(db) {
  ttDb = db;
  item = db.getSchema().table('Pages');
  var row = item.createRow({
    'title': 'example page',
    'domain': 'example.com',
    'path': '/',
    'protocol': 'http',
    'time': new Date(),
    'categoryinference': 'Informational'
  });

  return db.insertOrReplace().into(item).values([row]).exec();
}).then(function() {
  return ttDb.select().from(item).where(item.time.lt(new Date())).exec();
}).then(function(results) {
  results.forEach(function(row) {
    console.log(row['title'], 'visited at', row['time']);
  });
});

function storePage(info) {
  var row = item.createRow({
    'title': info.title,
    'domain': info.domain,
    'path': info.path,
    'protocol': info.protocol,
    'time': info.time,
    'categoryinference': info.categoryinference
  });

  return ttDb.insertOrReplace().into(item).values([row]).exec();
}
