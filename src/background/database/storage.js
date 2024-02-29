/** @module storage */

import tldjs from 'tldjs';

import {primaryDbPromise} from './setup';
import {primarySchemaBuilder} from './setup'

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
  console.log("<<<storage, storePage>>>", info)
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');

  const activity_starter = [{'start': info.pageId, 'overall_time': 0}]
  const activity_starter2 = [{'type': 'start', 'value': info.pageId, 'overall_time': 0}]
  // const search_habits_starter = []

  const page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    'hostname': info.hostname,
    'path': info.path,
    'protocol': info.protocol,
    'search_habits': null,
    'activity_events': activity_starter2,
  });
  ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}


// /**
//  * updates page visit times (existing page)
//  *
//  * @param {Object} info - info about the page
//  * @param {Number} info.pageId - page's unique identifer
//  * @param {Number} info.activity_events - page's {type [focus event, exit event], value [timestamp]}
//  */
// export async function updatePage (info) {
//   console.log("<<<storage, updatePage>>>", info)
//   const ttDb = await primaryDbPromise;
//   const pageItem = ttDb.getSchema().table('Pages');


//   // const old = await ttDb.select(pageItem.activity_event).
//   //   from(pageItem).
//   //   where(lf.op.and(
//   //       pageItem.pageId.eq(info.pageId))).
//   //   exec();

//   let query = ttDb.select()
//     .from(pageItem)
//     .where(lf.op.and(
//       pageItem.id.eq(info.pageId)
//     ))
//   let qRes = await query.exec()
//   // qRes is empty when focus event fires on new page, because page does not have existing activity_events yet
//   if (qRes.length !== 0) {

//     console.log("this is qres", qRes[0])

//     let edited_activity_events = qRes[0].activity_events
//     edited_activity_events.push(info.activity_event)

//     const page = pageItem.createRow({
//       'id': qRes[0].id,
//       'title': qRes[0].title,
//       'domain': qRes[0].domain,
//       'hostname': qRes[0].hostname,
//       'path': qRes[0].path,
//       'protocol': qRes[0].protocol,
//       'search_habits': qRes[0].search_habits,
//       'activity_events': edited_activity_events,
//       // 'activity_events2': null, // for now
//     });
//     ttDb.insertOrReplace().into(pageItem).values([page]).exec();

//   }

// }

/**
 * updates page visit times (existing page) (((revised)))
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {Number} info.activity_events - page's {type [focus event, exit event], value [timestamp]}
 */
export async function updatePage2 (info) {
  // console.log("<<<storage, updatePage(((REVISED)))>>>", info)
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

  if (qRes.length != 0) {

    let most_recent_event = qRes[0].activity_events[qRes[0].activity_events.length - 1].type
    // console.log("most recent event", most_recent_event)
    if (most_recent_event != info.activity_event.type) {
      let new_overall_time;
      let current_overall_time = qRes[0].activity_events[qRes[0].activity_events.length - 1].overall_time

      let most_recent_time = qRes[0].activity_events[qRes[0].activity_events.length - 1].value

      switch (most_recent_event) {
        case 'start':
          new_overall_time = (info.activity_time_to_log - most_recent_time) + current_overall_time
          break;
        case 'active':
          new_overall_time = (info.activity_time_to_log - most_recent_time) + current_overall_time
          break;
        case 'idle':
          new_overall_time = current_overall_time
          break;
        case 'hidden':
          new_overall_time = current_overall_time
          break;
      }

      let to_log = {'type': info.activity_event.type, "value": info.activity_time_to_log, "overall_time": new_overall_time}

      let curr_activity_events = qRes[0].activity_events
      curr_activity_events.push(to_log)

      const page = pageItem.createRow({
        'id': qRes[0].id,
        'title': qRes[0].title,
        'domain': qRes[0].domain,
        'hostname': qRes[0].hostname,
        'path': qRes[0].path,
        'protocol': qRes[0].protocol,
        'search_habits': qRes[0].search_habits,
        'activity_events': curr_activity_events,
      });
      ttDb.insertOrReplace().into(pageItem).values([page]).exec();


    } else {
      // console.log("we've seen this before, no need to double count it ")
    }


  } else {
    console.log("we have an update condition but do not have a base page loaded yet, skip this")
  }

}

/**
 * updates 'search habits' on pages per mondovo list (existing page)
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {Number} info.activity_events - page's {type [focus event, exit event], value [timestamp]}
 */
export async function updatePage_search_habits (info) {
  console.log("<<<storage, updatePage with Mondovo>>>", info)
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');

  let query = ttDb.select()
    .from(pageItem)
    .where(lf.op.and(
      pageItem.id.eq(info.pageId)
    ))
  let qRes = await query.exec()

  let curr;
  if (qRes[0].search_habits != null) {
    curr = qRes[0].search_habits
    curr.push([info.search_habits])
  } else {
    curr = [[info.search_habits]]
  }

  const page = pageItem.createRow({
      'id': qRes[0].id,
      'title': qRes[0].title,
      'domain': qRes[0].domain,
      'hostname': qRes[0].hostname,
      'path': qRes[0].path,
      'protocol': qRes[0].protocol,
      'search_habits': curr,
      'activity_events': qRes[0].activity_events,
  });
  ttDb.insertOrReplace().into(pageItem).values([page]).exec();

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
  console.log("<<<storage, storeAd>>>", info)
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
  ttDb.insertOrReplace().into(adItem).values([ad]).exec();
  
}

/**
 * stores google inference list 
 *
 * @param {Object} info - info about the current google inferences
 * @param {Number} info.pageId - page's unique identifer, as timestamp
 */
export async function storeGoogleInference (info) {
  console.log("<<<storage, storeGoogleInference>>>")
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
 * stores IP location information
 *
 * @param {Object} info - info about the IP address
 */
export async function storeIPAddress (info) {
  console.log("<<<storage, storeIPAddress>>>", info)
  const ttDb = await primaryDbPromise;
  const IPAddressItem = ttDb.getSchema().table('IPAddress');

  const IPaddress = IPAddressItem.createRow({
    "ip": info.IPaddress.ip || "None",
    "alternative_ip": info.IPaddress.alternative_ip || "None",
    "isp": info.IPaddress.isp || "None",
    "org": info.IPaddress.org || "None",
    "hostname": info.IPaddress.hostname || "None",
    "latitude": info.IPaddress.latitude || 0,
    "longitude": info.IPaddress.longitude || 0,
    "postal_code": info.IPaddress.postal_code || "None",
    "city": info.IPaddress.city || "None",
    "country_code": info.IPaddress.country_code || "None",
    "country_name": info.IPaddress.country_name || "None",
    "continent_code": info.IPaddress.continent_code || "None",
    "continent_name": info.IPaddress.continent_name || "None",
    "region": info.IPaddress.region || "None",
    "district": info.IPaddress.district || "None",
    "timezone_name": info.IPaddress.timezone_name || "None",
    "connection_type": info.IPaddress.connectoin_type || "None",
    "asn_number": info.IPaddress.asn_number || "None",
    "asn_org": info.IPaddress.asn_org || "None",
    "asn": info.IPaddress.asn || "None",
    "currency_code": info.IPaddress.currency_code || "None",
    "currency_name": info.IPaddress.currency_name || "None",
    "success": info.IPaddress.success || "None",
    "premium": info.IPaddress.premium || "None",
  });
  // console.log(IPaddress)
  ttDb.insertOrReplace().into(IPAddressItem).values([IPaddress]).exec();
}


/**
 * stores records of trackers for given page
 *
 * @param {Object} pageId - identifier for page that trackers come from
 * @param {Object[]} trackers - array of objects with information about each tracker
 */
export async function storeTrackerArray (pageId, trackers) {
  console.log("<<<storage, storeTrackerArray>>>", trackers)
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
  console.log("<<<storage, inference>>>", info)
  const ttDb = await primaryDbPromise;
  const inferenceItem = ttDb.getSchema().table('Inferences');

  let query = ttDb.select()
    .from(inferenceItem)
    .where(lf.op.and(
      inferenceItem.pageId.eq(info.pageId)
    ))
  let qRes = await query.exec()

  if (qRes.length == 0) {
    let wordCloud_option; 
    if (info.wordCloud !== undefined && info.wordCloud !== null) {
      wordCloud_option = info.wordCloud
    } else {
      wordCloud_option = ''
    }

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
    
    ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
  }
}

export async function importData2 (dataString) {
  // console.log("<<<storage, importData2>>>", dataString)
  const data = JSON.parse(dataString);

  if (!data.lfdb) {
    throw new Error('not correctly framed for data viewing. I need lfdb data')
  }


  var all_data = data.lfdb;
  if (typeof all_data === 'object')
    all_data = all_data; // dont parse if its object
  else if (typeof all_data === 'string')
    all_data = JSON.parse(data.lfdb)

  console.log(all_data)

  let count_all_pages = 0
  let pages_set = new Set()
  let interests_set = new Set()

  for (let entry of Object.keys(all_data)) {

    // console.log("<<<storage, MODIFIED storePage>>>", entry)
    const ttDb = await primaryDbPromise;
    const pageItem = ttDb.getSchema().table('Pages');

    if (all_data[entry].id != undefined) {
      let temp = {"pageId": all_data[entry].id,
                  "title": all_data[entry].title,
                  "domain": all_data[entry].domain,
                  "hostname": all_data[entry].hostname,
                  "path": all_data[entry].path,
                  "protocol": all_data[entry].protocol,
                  "activity_events": all_data[entry].activity_events,
                  "search_habits": all_data[entry].search_habits,
                }
      const page = pageItem.createRow({
        'id': temp.pageId,
        'title': temp.title,
        'domain': temp.domain,
        'hostname': temp.hostname,
        'path': temp.path,
        'protocol': temp.protocol,
        'activity_events': temp.activity_events,
        'search_habits': temp.search_habits,

      });
      // do not call storePage function because it would wipe out certain attributes, instead directly insert 
      ttDb.insertOrReplace().into(pageItem).values([page]).exec();
      count_all_pages += 1
      pages_set.add(all_data[entry].id)
    } 
    
    ///////////////////////////////////////////// inferences
    if (all_data[entry].inferences != null && all_data[entry].inferences.length != 0) {
      for (let inference of all_data[entry].inferences) {
        let temp = {"inferenceCategory": inference.inferenceCategory,
                    "inference": inference.inferenceCategory,
                    "inferencePath": inference.inferencePath,
                    "pageId": inference.pageId,
                    "threshold": inference.threshold,
                    "wordCloud": inference.wordCloud,
                    "gender": inference.gender,
                    "genderLexical": inference.genderLexical}
        storeInference(temp)
        interests_set.add(inference.inferenceCategory)
      }
      
    }

    ///////////////////////////////////////////// trackers
    
    if (all_data[entry].trackers != null && all_data[entry].trackers.length != 0) {
      storeTrackerArray(all_data[entry].id, all_data[entry].trackers)
    }

    ///////////////////////////////////////////// ads
    if (all_data[entry].ads != null && all_data[entry].ads.length != 0) {
      for (let ad of all_data[entry].ads) {
        let temp = {
                  'domain': ad.domain,
                  'url_landing_page_long': ad.url_landing_page_long,
                  'url_landing_page_short': ad.url_landing_page_short,
                  'inference': ad.inference,
                  'inferenceCategory': ad.inferenceCategory,
                  'inferencePath': ad.inferencePath,
                  'threshold': ad.threshold,
                  'gender': ad.gender,
                  'genderLexical': ad.genderLexical,
                  'url_explanation': ad.url_explanation,
                  'explanation': ad.explanation,
                  'dom': ad.dom || 'not shared',
                  'pageId': ad.pageId,
                  }
        storeAd(temp)
      }
    }

    ///////////////////////////////////////////// google inferences
    if (entry == 'googleInferences_slice_current') {

      if (all_data[entry] != 'No grabs yet, try re-scraping google after some website activity!') {
        let gSlice = all_data[entry][0].data
        console.log(gSlice[0].name)
        for (let slice of gSlice) {
          console.log(slice)
          let temp = {"inferences": slice.inferences,
                      "pageId": slice.date}
          storeGoogleInference(temp)
        }
      }
    }
    // // sanity checks
    // console.log(count_all_pages)
    // console.log(pages_set)
    // console.log(interests_set)
  }
}



export async function importData (dataString) {
  console.log("<<<storage, importData>>>", dataString)
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
