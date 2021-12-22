/** @module storage */

import tldjs from 'tldjs';

import {primaryDbPromise} from './setup';

/* DATA STORAGE */
/* ============ */

/**
 * stores new page visit
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.title - page's title
 * @param {string} info.domain - page's domain, which signifies unique website
 * @param {string} info.hostname - page's hostname, this is the part between // and /
 * @param {string} info.path - page's path
 * @param {string} info.protocol - page's protocol (e.g. http)
 */
export async function storePage (info) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');

  const activity_starter = [{'start': info.pageId}]

  const page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    'hostname': info.hostname,
    'path': info.path,
    'protocol': info.protocol,
    'activity_events': activity_starter
  });
  ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}


/**
 * updates page visit times (exiting page)
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {Number} info.activity_events - page's {type [focus event, exit event], value [timestamp]}
 */
export async function updatePage (info) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');


  // const old = await ttDb.select(pageItem.activity_event).
  //   from(pageItem).
  //   where(lf.op.and(
  //       pageItem.pageId.eq(info.pageId))).
  //   exec();

  let query = ttDb.select()
    .from(pageItem)
    .where(lf.op.and(
      pageItem.id.eq(info.pageId)
    ))
  let qRes = await query.exec()
  // qRes is empty when focus event fires on new page, because page does not have existing activity_events yet
  if (qRes.length !== 0) {
    let edited_activity_events = qRes[0].activity_events
    edited_activity_events.push(info.activity_event)

    const page = pageItem.createRow({
      'id': qRes[0].id,
      'title': qRes[0].title,
      'domain': qRes[0].domain,
      'hostname': qRes[0].hostname,
      'path': qRes[0].path,
      'protocol': qRes[0].protocol,
      'activity_events': edited_activity_events
    });
    ttDb.insertOrReplace().into(pageItem).values([page]).exec();

  }

}

/**
 * stores new ad seen on page
 *
 * @param {Object} info - info about the ad
 * @param {Number} info.pageId - page's unique identifer, as timestamp
 * @param {String} info.url - ad's identifier, rendered as image
 * @param {String} info.initiator - the server responsible for sending this ad
 */
export async function storeAd (info) {
  const ttDb = await primaryDbPromise;
  const adItem = ttDb.getSchema().table('Ads');

  // TODO: this assumes we are not repeating ads
  const ad = adItem.createRow({
    'url': info.url,
    'url_explanation': info.url_explanation,
    'url_landing_page_long': info.url_landing_page_long,
    'url_landing_page_short': info.url_landing_page_short,
    'dom': info.dom,
    'gender': info.gender,
    'genderLexical': info.genderLexical,
    'explanation': info.explanation,
    'initiator': info.initiator,
    'inference': info.inference,
    'inferenceCategory': info.inferenceCategory, // sanity check bruce's model
    'inferencePath': info.inferencePath, // sanity check bruce's model
    'threshold': info.threshold,
    'domain': info.domain,
    'pageId': info.pageId
  });
  // console.log(info.explanation)
  ttDb.insertOrReplace().into(adItem).values([ad]).exec();
}

/**
 * stores google inference list 
 *
 * @param {Object} info - info about the current google inferences
 * @param {Number} info.pageId - page's unique identifer, as timestamp
 */
export async function storeGoogleInference (info) {
  const ttDb = await primaryDbPromise;
  const googleInferenceItem = ttDb.getSchema().table('GoogleInference');

  const inference = googleInferenceItem.createRow({
    'inferences': info.inferences,
    'pageId': info.pageId
  });
  // console.log(inference)
  ttDb.insertOrReplace().into(googleInferenceItem).values([inference]).exec();
}


/**
 * stores records of trackers for given page
 *
 * @param {Object} pageId - identifier for page that trackers come from
 * @param {Object[]} trackers - array of objects with information about each tracker
 */
export async function storeTrackerArray (pageId, trackers) {
  const ttDb = await primaryDbPromise;
  const trackerItem = ttDb.getSchema().table('Trackers');
  const rows = [];

  for (let tracker of trackers) {
    const row = trackerItem.createRow({
      'tracker': tracker,
      'pageId': pageId
    });
    rows.push(row);
  }
  // console.log(rows);
  ttDb.insertOrReplace().into(trackerItem).values(rows).exec();
}

/**
 * stores new inference
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.inference - inference made
 * @param {string} info.gender - inference made on gender
 * @param {Number} info.genderLexical - inference made on gender using Lexical score
 * @param {string} info.inferenceCategory - unused
 * @param {Number} info.threshold - unused
 *
 */
export async function storeInference (info) {
  const ttDb = await primaryDbPromise;
  const inferenceItem = ttDb.getSchema().table('Inferences');

  let wordCloud_option; 
  if (info.wordCloud !== undefined && info.wordCloud !== null) {
    wordCloud_option = info.wordCloud
  } else {
    wordCloud_option = ''
  }

  console.log("happycat" + [info.inferencePath])

  const inference = inferenceItem.createRow({
    'inference': info.inference,
    'wordCloud': wordCloud_option,
    'gender': info.gender,
    'genderLexical': info.genderLexical,
    'inferenceCategory': info.inferenceCategory,
    'inferencePath': info.inferencePath, // sanity check bruce's model
    'threshold': info.threshold,
    'pageId': info.pageId
  });
  // console.log(inference)
  ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
}

export async function importData (dataString) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');
  const trackerItem = ttDb.getSchema().table('Trackers');
  const inferenceItem = ttDb.getSchema().table('Inferences');

  const data = JSON.parse(dataString);

  if (!data.pages || !data.trackers || !data.inferences) {
    // bad
    throw new Error('bad')
  }

  data.pages.forEach(page => {
    if (!page.hostname) {
      let domain = tldjs.getDomain(page.domain);
      domain = domain || page.domain; // in case above line returns null

      page.hostname = page.domain;
      page.domain = domain;
    }

    const pageData = pageItem.createRow({
      'id': page.id,
      'title': page.title,
      'domain': page.domain,
      'hostname': page.hostname,
      'path': page.path,
      'protocol': page.protocol
    });
    return ttDb.insertOrReplace().into(pageItem).values([pageData]).exec();
  })

  data.trackers.forEach(tracker => {
    const row = trackerItem.createRow({
      'tracker': tracker.tracker,
      'pageId': tracker.pageId
    });

    return ttDb.insertOrReplace().into(trackerItem).values([row]).exec();
  })

  data.inferences.forEach(inference => {
    const row = inferenceItem.createRow({
      'inference': inference.inference,
      'inferenceCategory': inference.inferenceCategory,
      'threshold': inference.threshold,
      'pageId': inference.pageId
    });

    return ttDb.insertOrReplace().into(inferenceItem).values([row]).exec();
  })
}
