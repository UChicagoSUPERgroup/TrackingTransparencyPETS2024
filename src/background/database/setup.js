import lf from 'lovefield';

/* DATABSE SETUP */
/* ============= */


import Dexie from 'dexie';
import {importDB } from "dexie-export-import";

import tfModelJson from '../../data/web-cat-model-exported.json';

async function loadTfjsModel() {
    console.log("[-] starting tfModel loading...")
    //remove old modeldb if any
    await Dexie.delete('tensorflowjs')
    let blob = new Blob([JSON.stringify(tfModelJson)], {type : 'application/json'})
    await importDB(blob)
    console.log("[+] DONE tfModelJson:", tfModelJson);
}

loadTfjsModel();


var primarySchemaBuilder = lf.schema.create('datastore', 2);

primarySchemaBuilder.createTable('Pages')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('domain', lf.Type.STRING)
  .addColumn('hostname', lf.Type.STRING)
  .addColumn('path', lf.Type.STRING)
  .addColumn('protocol', lf.Type.STRING)
  .addColumn('activity_events', lf.Type.OBJECT)
  .addPrimaryKey(['id']);

primarySchemaBuilder.createTable('Trackers')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('tracker', lf.Type.STRING) // company name
  .addColumn('pageId', lf.Type.INTEGER)
  .addPrimaryKey(['id'], true)
  .addForeignKey('fk_pageId', {
    local: 'pageId',
    ref: 'Pages.id'
  });

primarySchemaBuilder.createTable('Ads')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('domain', lf.Type.STRING) // top level domain hosting ad
  // .addColumn('initiator', lf.Type.STRING) // ad server name
  // .addColumn('url', lf.Type.STRING) // ad url
  .addColumn('url_landing_page_long', lf.Type.STRING) // ad long domain
  .addColumn('url_landing_page_short', lf.Type.STRING) // ad tldjs
  .addColumn('inference', lf.Type.STRING) // ad interest inference 
  .addColumn('inferenceCategory', lf.Type.STRING) // updated Bruce model on contentCategory
  .addColumn('inferencePath',  lf.Type.OBJECT) // updated Bruce model full path
  .addColumn('threshold', lf.Type.STRING) // ad interest inference threshold 
  .addColumn('gender', lf.Type.STRING)
  .addColumn('genderLexical', lf.Type.INTEGER)
  .addColumn('url_explanation', lf.Type.STRING) // ad explanation url
  .addColumn('explanation', lf.Type.OBJECT) // text explanations from url as array
  .addColumn('dom', lf.Type.STRING) // HTML DOM of the ad as it was served to the user
  .addColumn('pageId', lf.Type.INTEGER)
  .addPrimaryKey(['id'], true)
  .addForeignKey('fk_pageId', {
    local: 'pageId',
    ref: 'Pages.id'
  });

primarySchemaBuilder.createTable('GoogleInference')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('inferences', lf.Type.OBJECT) // google inference list as array
  .addColumn('pageId', lf.Type.INTEGER)
  .addPrimaryKey(['id'], true)
  // .addForeignKey('fk_pageId', { // no FK because we load this information before we have pageIds
  //   local: 'pageId',
  //   ref: 'Pages.id'
  // })
  ;

primarySchemaBuilder.createTable('Inferences')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('gender', lf.Type.STRING)
  .addColumn('genderLexical', lf.Type.INTEGER)
  .addColumn('inference', lf.Type.STRING)
  .addColumn('wordCloud', lf.Type.STRING) // to use for wordCloud on sensitive interest webpages
  .addColumn('inferenceCategory', lf.Type.STRING) // updated Bruce model on contentCategory
  .addColumn('inferencePath',  lf.Type.OBJECT) // updated Bruce model full path
  .addColumn('pageId', lf.Type.INTEGER)
  .addColumn('threshold', lf.Type.NUMBER)
  .addPrimaryKey(['id'], true)
  .addForeignKey('fk_pageId', {
    local: 'pageId',
    ref: 'Pages.id'
  })
  .addIndex('idxThreshold', ['threshold'], false, lf.Order.DESC);

let primaryDbPromise = primarySchemaBuilder.connect({storeType: lf.schema.DataStoreType.INDEXED_DB});

export {primaryDbPromise, primarySchemaBuilder};
