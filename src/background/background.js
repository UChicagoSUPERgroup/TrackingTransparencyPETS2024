/** @module background */


import tldjs from 'tldjs';
import $ from 'jquery';

import {trackersWorker, databaseWorker, inferencingWorker, queryDatabase} from './worker_manager';
import overlayManager from './overlay_manager';
import instrumentation from './instrumentation';
import { getOption } from '../helpers';
import loggingDefault from '../options/loggingDefault';
import logging from "../dashboard/dashboardLogging";
import { hasTrackerBlocker } from './adblockChecking'
import { saveID } from '../options/userstudy'

const request = require('request')
const axios = require('axios')
const urldecode = require('urldecode')
import { parse } from 'node-html-parser';
import * as Papa from 'papaparse';
import Pattern from 'url-knife';

const moment = require('moment')

import { Readability } from '@mozilla/readability';

import Dexie from 'dexie';
import {importDB } from "dexie-export-import";
import tfModelJson from '../data/web-cat-model-exported.json';

var href_blocklist = new Array()
var one_back_storage = new Array() // keep a list of old PIDs in case we need to step back 
var handling_external_message = false // do not try and communicate multi-threaded

function load_list2() {

	Promise.all([
		fetch('https://easylist-downloads.adblockplus.org/easylist.txt'),
		fetch('https://adaway.org/hosts.txt'),
		fetch('https://pgl.yoyo.org/adservers/serverlist.php?hostformat=webclean'),
		fetch('https://sos-ch-dk-2.exo.io/noblt/RPZ/Hosts-database/full-alive.txt') // TODO slim me -- large, but looks like a really good list
    // fetch('https://raw.githubusercontent.com/badmojr/1Hosts/master/Pro/domains.txt')
	]).then(function (responses) {
		// Get a JSON object from each of the responses
		return Promise.all(responses.map(function (response) {
			return response.text();
		}));
	}).then(function (data) {
		// Log the data to the console
		let easylist = data[0]
		let adaway = data[1]
		let yoyo = data[2]
    let sos = data[3]
    // let onehosts = data[4]

    console.log("[-] starting adaway grab...")
		var arr = adaway.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]
			if (line !== '' && line[0] !== '#' && line[0] !== ':') {
				let matcher = line.split('127.0.0.1 ')[1]

				if (matcher !== ' localhost') {
                    href_blocklist.push(matcher)
				}
				
			}
		}
    console.log("[+] DONE adaway grab")

    console.log("[-] starting easylist grab...")
		var arr = easylist.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]

			if (line[0] == '#' && line[1] == '#' && line[2] =="a" && line[3] =="[" && line[4] =="h") { // this is an href
				let matcher2 = line.split('##')[1]
				var start = matcher2.indexOf('"');
				var rest_of_string = matcher2.substring(start + 1, matcher2.length) // add one for not finding the first quote
				var stop = rest_of_string.indexOf('"');
				matcher2 = rest_of_string.substring(0, stop)
        href_blocklist.push(matcher2)
			}
		}
    console.log("[+] DONE easylist grab")

		
    console.log("[-] starting yoyo grab...")
		var arr = yoyo.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]
			if (line.startsWith("pattern: ")) {
				var start = line.indexOf("://") + 4
				let is_letter = line[start].match(/[a-z]/i) 
				if (is_letter !== null) {
					let matcher3 = line.split("pattern: ^https?://")[1]
          href_blocklist.push(matcher3)
				}
			}
		}
    console.log("[+] DONE yoyo grab")

    console.log("[-] starting sos grab...")
    var arr = sos.split("\n")
    for (let i = 0; i < arr.length; i++) {
        let line = arr[i]
        if (line[0] != ' ' && line[0] != ';') {
            
            let matcher4 = line.split(" CNAME .")[0]
            // custom removals on noticed errors (going through top websites and looking for errors)
            if (!matcher4.includes('asacp')) {
              href_blocklist.push(matcher4)
            }
            
        }
    }
    console.log("[+] ... ending sos grab")

    /// too heavy
    // console.log("[-] starting onehosts grab...")
    // var arr = onehosts.split("\n")
    // for (let i = 0; i < arr.length; i++) {
    //   let line = arr[i]
    //   if (line !== '' && line[0] !== '#' && line[0] !== ':') {
    //     let matcher = line

    //     if (matcher !== ' localhost') {
    //       href_blocklist.push(matcher)
    //       // console.log(matcher)
    //     }
        
    //   }
    // }
    // console.log("[+] ... ending onehosts grab")


		// other common (top tranco) additions
    href_blocklist.push("prod-m-node-1113.ssp.yahoo.com")
    href_blocklist.push("pages.ebay.com")
    href_blocklist.push("adclick.g")
    href_blocklist.push("cdn.flashtalking.com")
    href_blocklist.push("s0.2mdn.net")
    href_blocklist.push("aax-")
    href_blocklist.push("/_xa/deep_click")
    href_blocklist.push("afcdn.net")
    // deep inspection of blocklist
    // console.log(href_blocklist)

    browser.storage.local.set({href_blocklist: href_blocklist})
    console.log("[+] DONE updating easylist, adaway, pgl.yoyo, and sos-ch-dk-2 adServers! Total strings: ", href_blocklist.length)

	}).catch(function (error) {
		// log error
		console.log(error);
	});

}


// used in google inferences
let google_ad_categories = {};

let tabData = {};

// used to filter out same-page logged ads 
let seen_it = new Set();
let seen_it2 = new Set();
let seen_it3 = new Set();

// filled with updated disconnect information
var companyData = new Object();
var domainEntityMap = new Object();

let pendingTrackerMessages = {};
let trackerMessageId = 0;

async function onInstall (details) {
  // also runs on update
  if (details.reason === 'install') {
    const welcomePageData = {
      active: true,
      url: '../dist/welcome.html'
    }

    await browser.tabs.create(welcomePageData)
  }
}
browser.runtime.onInstalled.addListener(onInstall)


// set up default for logging, currently it is true.
// loggingDefault.setLoggingDefault();

// set up instrumentation
instrumentation.setup()

async function hashit(data){return instrumentation.hashit(data)}
async function hashit_salt(data){return instrumentation.hashit_salt(data)}


/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping () {
  return 'ping'
}
window.ping = ping;

/* listener for all outgoing web requests */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate)
browser.webNavigation.onDOMContentLoaded.addListener(onDOMContentLoaded)
browser.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated)


/* listener for tab close */
browser.tabs.onRemoved.addListener(clearTabData);

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish); // for pages that do fancy javascript to change urls // cuases double hits on pages/inferences check out later

// survey function to check what data participant has
async function check_valid_data(data, sendResponse) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // // happens on second survey, to see which visualizations to ask about 
  // // this is a heavy operaiton, only do it once 
  // handling_external_message = true

  // console.log('received message from extension')
  // let google_demographics = queryDatabase('getGoogleInferencesTree_demographic', {})
  // let google_contactInfo = queryDatabase('getGoogleInferencesTree_nameData', {})
  // let google_interests = queryDatabase('getGoogleInferencesTree_interests', {})
  // let google_interests_bars = queryDatabase('getGoogleInferences_overview', {})
  // let heat_map_newer_newer = queryDatabase('PageIdDataStructure_revisedHeatmap_version2', {})
  // let allAdDOMs = queryDatabase('getAdDOMs_version2', {})
  // let adDOM_overview = queryDatabase('getAdDOMs_overview', {})
  // let getTopicsOfInterest = queryDatabase('getTopicsOfInterest', {}) 
  // let sensitive_info_v3 = queryDatabase('getInferencesMostSensitive_version3', {})
  // let sensitive_info_bubbles_v2 = queryDatabase('getInferencesMostSensitive_bubbles_version2', {})
  // let bedtime_v2 = queryDatabase('getPagesByTime_bedtime', {})
  // let valid_google_demographics,
  //     valid_google_interests,
  //     valid_google_interests_bars,
  //     valid_heat_map_newer_newer,
  //     valid_sensitive_info_v3, 
  //     valid_bedtime_v2,
  //     valid_getTopicsOfInterest,
  //     valid_sensitive_info_bubbles_v2,
  //     valid_adDOM_overview,
  //     valid_allAdDOMs;

  // Promise.all([google_demographics, google_contactInfo, google_interests, google_interests_bars,
  //              heat_map_newer_newer, allAdDOMs, adDOM_overview, getTopicsOfInterest,
  //              sensitive_info_v3, sensitive_info_bubbles_v2, bedtime_v2]).then((values) => {
    
  //   try {
  //     valid_google_demographics = (values[0] != null && values[1] != null && values[0]['children'].length != 0 && values[1]['children'].length != 0)
  //   } catch(e) {
  //     valid_google_demographics = false
  //   }
  //   try {
  //     valid_google_interests = (values[2] != null && values[2]['tree']['children'].length != 0)
  //   } catch(e) {
  //     valid_google_interests = false
  //   }
  //   try {
  //     valid_google_interests_bars = (values[3] != null && values[2] != null && values[2]['tree']['children'].length != 0)
  //   } catch(e) {
  //     valid_google_interests_bars = false
  //   }
  //   try {
  //     valid_heat_map_newer_newer = (values[4] != null && Object.keys(values[4].all).length != 0)
  //   } catch (e) {
  //     valid_heat_map_newer_newer = false
  //   }
  //   try {
  //     valid_sensitive_info_v3 =  (values[8] != null && values[8]['all '].outer_all.length != 0)
  //   } catch(e) {
  //     valid_sensitive_info_v3 = false
  //   }
  //   try {
  //     valid_bedtime_v2 = (values[10] != null && values[10].length != 0 )
  //   } catch(e) {
  //     valid_bedtime_v2 = false
  //   }
  //   try {
  //     valid_getTopicsOfInterest = (values[7] != null && values[7].length != 0) 
  //   } catch(e) {
  //     valid_getTopicsOfInterest = false
  //   }
  //   try {
  //     valid_sensitive_info_bubbles_v2 = (values[9] != null && values[9]['outer'].length != 0)
  //   } catch(e) {
  //     valid_sensitive_info_bubbles_v2 = false
  //   }
  //   try {
  //     valid_adDOM_overview = (values[6] != null && Object.values(values[6].breakdown).length != 0)
  //   } catch(e) {
  //     valid_adDOM_overview = false
  //   }
  //   try {
  //     valid_allAdDOMs = (values[5] != null && Object.keys(values[5]).length != 0)
  //   } catch(e) {
  //     valid_allAdDOMs = false
  //   }

  //   console.log("DONE, now crafting response")

  //   let valid_data = {"valid_google_demographics": String(valid_google_demographics),
  //                     "valid_google_interests": String(valid_google_interests),
  //                     "valid_google_interests_bars": String(valid_google_interests_bars),
  //                     "valid_heat_map_newer_newer": String(valid_heat_map_newer_newer),
  //                     "valid_sensitive_info_v3": String(valid_sensitive_info_v3),
  //                     "valid_bedtime_v2": String(valid_bedtime_v2),
  //                     "valid_getTopicsOfInterest": String(valid_getTopicsOfInterest),
  //                     "valid_sensitive_info_bubbles_v2": String(valid_sensitive_info_bubbles_v2),
  //                     "valid_adDOM_overview": String(valid_adDOM_overview),
  //                     "valid_allAdDOMs": String(valid_allAdDOMs)}
  //   console.log(valid_data)
  //   sendResponse({success: true, failure: false, valid_data: valid_data});
  //   handling_external_message = false
  // });

}

// ////
// /////
// /////// [no telemetry on release]
// /////
// ////

// // todo: remove this for real testing 
// async function openUrl(data, sendResponse) {
//   console.log("received message to validate extension installation!")
//   let full_url = data
//   // currently slotted into a random condition (1, 2, or 3) 
//   // this function should take that inforamtion, split off the condition, and keep the PID
//   // the prolific ID is needed to keep track longitudinally 
//   let checker = browser.storage.local.get('mturkcode').then(current_ID => {
//     // update unleses we've already set it
//     if (!current_ID['mturkcode'].includes('-pid-')) {
//       // console.log(full_url)
//       // console.log(current_ID['mturkcode']) 
//       let revised_ID_parsed = Pattern.UrlArea.parseUrl(full_url)
//       // console.log(revised_ID_parsed)
//       let prolific_PID = revised_ID_parsed.onlyParamsJsn.PROLIFIC_PID
//       let revised_condition = revised_ID_parsed.onlyParamsJsn.CONDITION_ID
//       // console.log(revised_condition)
//       const new_ID = revised_condition + "-pid-" + prolific_PID
//       // sanity check that this worked
//       saveID(new_ID).then(response => { 
//         browser.storage.local.get('mturkcode').then(resp => {
//           sendResponse({success: true, failure: false});
//           instrumentation.firstInstall()
//           browser.storage.local.get('original_extensions').then(original_extensions => {
//             logging.logPopupActions('***first install***', original_extensions)
//             browser.storage.local.remove("original_extensions")
//           }) 
//         }) 
//       });
//     } else {
//       sendResponse({success: true, failure: false});
//       console.log("already updated PID!")
//     }

//   })
// }


chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {

    ////
    /////
    /////// [no telemetry on release]
    /////
    ////

    // // alert("RECEIVED", JSON.stringify(request))
    // if (request.openUrlInEditor) {
    //   openUrl(request.openUrlInEditor, sendResponse);
    // }
    // if (request.check_valid_data) {
    //   if (handling_external_message == false) {
    //     check_valid_data(request.check_valid_data, sendResponse)
    //   } else {
    //     console.log("hey! I'm already looking into it, give me some time")
    //   }
      
    // }
  });


/* listeners to signal opener/closure of app for analytics */
// will not pick up un-focus events
chrome.runtime.onConnect.addListener(function(port) {

	// alert("extension has been opened")
	let activityType = '[---] opening extension [---]'
	getAdblockers().then(resp => {
		logging.logLoad(activityType, {"tracker blocker extension info": resp})
	}) 

  if (port.name === "app") {
    port.onDisconnect.addListener(function() {
			// alert("extension has been closed")
			let activityType = '[xxx] closing extension [xxx]'
    	logging.logLoad(activityType, {})
    });
  }
});

/** Sends a message with information about each outgoing
 * web request to trackers worker.
 *
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest (details) {
  if (details.type === 'main_frame') {
    // for main frame page loads, ignore
    return
  }

  if (tabData[details.tabId]) { 
    let dets_url = details.url;
    let dets_type = details.type; 
    let dets_initiator = details.initiator;
    tabData[details.tabId].webRequests.push(details)
  }
}

function isMainFramePage (details) {
  const { tabId, frameId, url } = details
  return (frameId === 0 &&
    tabId !== -1 &&
    tabId !== browser.tabs.TAB_ID_NONE &&
    url.startsWith('http') &&
    !url.includes('_/chrome/newtab')) &&
    !browser.extension.inIncognitoContext
}

function onBeforeNavigate (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return 

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId)
  }

  const pageId = Date.now()
  let urlObj = new URL(url)

  const domain = tldjs.getDomain(urlObj.hostname) || urlObj.hostname

  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: domain,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    url: url,
    webRequests: [],
    trackers: []
  }

  // to make sure we have pageId
  if (details.url.includes('adssettings.google.com/authenticated') || details.url.includes('adssettings.google.com/u/') || details.url.includes('myadcenter.google.com')) { // authenticated path so we know user is logged in

    let path_detail; 
    if (details.url.includes('adssettings.google.com/u/')) {
        console.log("secondary+ login")
        path_detail = details.url
    } else if (details.url.includes('myadcenter.google.com')) {
        console.log("new page")
        path_detail = 'myadcenter'
    } else {
        console.log("primary login")
        // (details.url.includes('adssettings.google.com/authenticated'))
        path_detail = null
    } 


  	update_google_ads_settings(path_detail)
  }

  // update google adsSettings scraper every 5th page visit 
  // checks on how often google is updating 
  function check_n(n) {
    let how_often = 5
    if (n%how_often == 0) {
        // alert("updating because were at " + n)
        update_google_ad_list()
        // also update IP address to check on location change
        getIP()
        // also update mondovo substring matches on pages
        update_search_habits()
        // also check to clear out extension with 24 hours flag set 
        // check_cyle_optimization()
    }
  }
  // ping on google adSettings 
  let num_pages_current = queryDatabase('getNumberOfPages', {})
  num_pages_current.then(n => check_n(n))

}

async function onDOMContentLoaded (details) {
  const { tabId } = details
  if (!isMainFramePage(details)) return

  console.log("FIRED, main page load, inside onDOMcontentLoaded")
  // we now have title
  // so we can add that to tabdata and push it to database
  const tab = await browser.tabs.get(details.tabId)
  if (tab.incognito) {
    // we don't want to store private browsing data
    tabData[tabId] = null
    return
  }
  tabData[tabId]['title'] = tab.title

  // keep a log for pages, else catching is odd
  // if we have data it means that we are about to navigate away, but will very likely have a timing event come in 
  // need to store that info somewhere and use it later 
  // console.log("pushing on ", [tabData[details.tabId].pageId, tabData[details.tabId].title])
  one_back_storage.push([tabData[tabId].pageId, tabData[tabId]['title']])

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })

  // console.log("FIRED, attempting inference storage, inside onDOMcontentLoaded")
  // page load times vary substantially depending on what third-party scripts are involved, but DOM content is prioritized to come first
  // grab inference as soon as page is loaded
  try {
    chrome.tabs.sendMessage(tabId, {type: 'make_inference'})
    // console.log("FIRED, initiating inference process, inside onDOMcontentLoaded", tabId)
  } catch (e) {
    console.log("error on make inference", e)
  }

  // ad grabbing
  chrome.tabs.executeScript(details.tabId,{
      frameId: details.frameId,
      file: 'dist/adGrab.js',
      matchAboutBlank: true,
      "allFrames" : true
  },function(result){
      // chrome.tabs.sendMessage(details.tabId, {type: "filters", allowlist: whitelist, blocklist: blacklist});
  });

}

async function onHistoryStateUpdated (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  // check if url is changed
  // a lot of pages (yahoo, duckduckgo) do extra redirects
  // trigger a call to this function but really aren't a page change
  if (tabData[tabId].hostname) {
    const u = new URL(url)
    const h1 = u.hostname.split('www.').pop()
    const h2 = tabData[tabId].hostname.split('www.').pop()
    const p1 = u.pathname
    const p2 = tabData[tabId].path
    if (h1 === h2 && p1 === p2) return
  }

  // simulate a new page load
  onBeforeNavigate(details)

  const tab = await browser.tabs.get(details.tabId)
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })

}


/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 *
 * also clears per-page-ad data to reserve
 * new-page-same-ad occurrence 
 *
 * @param  {number} tabId - tab's id
 */
function clearTabData (tabId) {

  if (!tabData[tabId]) {
    return;
  }

  // console.log(tabData)

  // clear out the ads seen by one page, because it is a 
  // new page wherever you go next
  seen_it.clear()
  seen_it2.clear()
  seen_it3.clear()

  trackersWorker.postMessage({
    type: 'page_changed',
    oldPageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests,
    updatedTrackerData: domainEntityMap,
  });

  tabData[tabId] = null;
}

/**
 * check pages titles for mondovo substring match 
 * computed here for optimization
 * this function updates pages in DB with mondovo info 
 *
 */
async function update_search_habits() {
  console.log("[-] attempting search habits title update list")
  let to_update = await queryDatabase('getPagesByEmptySearchHabits', {})

  for (let item of to_update){
    console.log(item)
    databaseWorker.postMessage({
      type: 'updatePage_search_habits',
      info: item
    });
  }
  console.log("[+] DONE -- attempting search habits title update list")
}


/**
 * forces update of tab data
 * web requests are queued in tabData, and then when this function is called
 * they are pushed to the trackers worker, which evaluates whether they are trackers
 * and if so stores them in the database
 *
 * this function also sends the updated data to the in-page overlay
 *
 * @param  {number} tabId - tab's id
 */
async function updateTrackers (tabId) {

  console.log("[+] updating trackers")
  console.log(tabData[tabId].pageId)

  if (typeof tabData[tabId] === 'undefined') {
    return;
  }

  let messagePromise = new Promise((resolve) => {
    pendingTrackerMessages[trackerMessageId] = resolve;
  });

  trackersWorker.postMessage({
    id: trackerMessageId,
    type: 'push_webrequests',
    pageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests,
    updatedTrackerData: domainEntityMap,
  });
  trackerMessageId++;
  tabData[tabId].webRequests = [];

  let trackers = await messagePromise;
  tabData[tabId].trackers = trackers;

}

async function onPageLoadFinish (details) {

  if (details.frameId === 0) {
    // console.log(details)
    // not an iframe
    const tabId = details.tabId
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'make_inference'
      })
    } catch (e) {
      console.log(e)
    }

    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/adGrab.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {type: "filters", allowlist: whitelist, blocklist: blacklist});
        // console.log("DONE (in parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + tabData[details.tabId].pageId +  JSON.stringify(details))
    });

  }
  else {

    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/adGrab.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {pageId: tabData[tabId].pageId});
        // console.log("DONE (in non-parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + JSON.stringify(details))
    });

  }

}

/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// note that we are using the CHROME api and not the BROWSER api
// because the webextension polyfill does NOT work with sending a response because of reasons
chrome.runtime.onMessage.addListener(runtimeOnMessage);

trackersWorker.onmessage = onTrackersWorkerMessage;
inferencingWorker.onmessage = onInferencingWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 *
 * @param  {number} tabId
 * @return {Object} tabData object
 */
async function getTabData (tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return null;
  } else {
    let data = tabData[tabId];

    await updateTrackers(tabId);

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

/**
 * takes google inferences and stores them in DB
 *
 * @param  {Object} google inferences scraped
 */
async function log_google_inference (message) {

  let info = message.article   

  // patch in updated google ad category information (fetched on startup)
  for (let i = 0; i < info.length; i++) {
    if (info[i].type == "-" || info[i].type == 'demographic') {
      try {

        if (info[i].type == 'my_name' || info[i].type == 'my_email') {
             
        } else if (info[i].type == 'demographic') {

        } else {
          // console.log(info[i].value + " --> and lookup --> " + google_ad_categories[info[i].value])
          let value_with_full_google_categories = google_ad_categories[info[i].value]
          if (value_with_full_google_categories == undefined) {
            info[i].type = "interest"
          } else {
            info[i].type = "interest"
            info[i].value = value_with_full_google_categories
          }
        }


      }catch (e) {
        console.log(e)
      }
    }
  }

  let googleInfo = {
    inferences: info,
    pageId: message.pageId,
  };
  // store the ad in database
  databaseWorker.postMessage({
    type: 'store_google_inference',
    info: googleInfo
  });

  return;

}
window.log_google_inference = log_google_inference; // exposes function to other extension components

/**
 * facilitates bulk import of data
 * takes in JSON of data to import, passes to database
 *
 * @param  {Object} dataString - JSON with data to import
 */
async function importData (dataString) {
  databaseWorker.postMessage({
    type: 'import_data',
    data: dataString
  })
}
window.importData = importData;

/**
 * resets all data
 * sends message to database worker to empty database
 */
function resetAllData () {
  databaseWorker.postMessage({
    type: 'empty_db'
  })

  // clear out the one back storage 
  one_back_storage.length = 0

}
window.resetAllData = resetAllData;

/**
 * Run on message recieved from trackers worker.
 *
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 * @param  {Object} m.data.type - Message type, set by sender
 * @param  {Object} m.data.id - Message id, set by sender
 * @param  {Object} m.data.trackers - Array of trackers, given by sender
 */
function onTrackersWorkerMessage (m) {
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}

async function onInferencingWorkerMessage (m) {
  const tabId = m.data.info.tabId;
  if (m.data.type === 'page_inference') {
    tabData[tabId].inference = m.data.info.inference;
  }
  const showOverlay = await getOption('showOverlay')
  if (showOverlay === true) {
    overlayManager.createOrUpdate(tabId, tabData[tabId])
  }
}



export default function makeInference (htmlDoc) {
  let dupDoc = htmlDoc
  let reader = new Readability(dupDoc,{}); //readability expect doc
  // console.log(reader)
  let article = reader.parse();
  let text;
  try {
    text = article.textContent;
  }
  catch(error_on_text_grab_original) {
    text = ''
  }

  try {
    text += htmlDoc.head.getElementsByTagName('meta')['og:description'].getAttribute('content')
    // console.log("successful add-in: ", htmlDoc.head.getElementsByTagName('meta')['og:description'].getAttribute('content'))
  } catch (err) {
    console.log("passing on og description add-in (((meta og:description)))")
  }
  try {
    text += htmlDoc.head.getElementsByTagName('meta')['description'].getAttribute('content')
    // console.log("successful add-in: ", htmlDoc.head.getElementsByTagName('meta')['description'].getAttribute('content'))
  } catch(err) {
    console.log("passing on description add-in (((meta description)))")
  }

  if (!text || text.length === 0) {
    console.log('xxx unable to extract text from page');
    return "error on text extract";
  }

  // send page text back to background script
  return text
}

function extractTextFromNode (node) {
  // node.tagName is in ALL CAPS
  if (node.tagName === 'FOOTER' || node.tagName === 'SCRIPT') {
    return '';
  }

  let res = node.innerText;
  for (let child of node.children) {
    res += (' ' + extractTextFromNode(child));
  }
  return res;
}


/**
 * listener function for messages from content script (from all content scripts)
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 *
 */
function runtimeOnMessage (message, sender, sendResponse) {
  let pageId;
  let domain;
  let query, tabDataRes;
  // sendResponse('swhooo');

  switch (message.type) {
    case 'parsed_page':

      if (!sender.tab || !sender.url || sender.frameId !== 0) {
        // message didn't come from a tab, so we ignore
        console.log("ignore because didn't come from tab")
        break;
      }
      if (!tabData[sender.tab.id]) {
        console.log("ignore because dead pageId")
        break;
      }

      // send page text off to inferencing web worker
      inferencingWorker.postMessage({
        type: 'content_script_to_inferencing',
        article: message.article,
        mainFrameReqId: tabData[sender.tab.id].pageId,
        tabId: sender.tab.id
      });
      // break;
      return true; // must do since calling sendResponse asynchronously

    case 'queryDatabase':
      query = queryDatabase(message.query, message.args);
      query.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously

    case 'getTabData':
      tabDataRes = getTabData(sender.tab.id);
      tabDataRes.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously


    case 'DOM':
    	// console.log(JSON.stringify(message))
    	let links = message.article.links 
    	let DOM_DOM = message.article.DOM

    	if (seen_it2.has(DOM_DOM) || seen_it3.has(links)) {
    		// console.log("Passing")
    	} else {
    		seen_it2.add(DOM_DOM)
    		seen_it3.add(links)

    	}
    	return true;

    case 'adGrabber':

      let id_to_update;
      let good_match_do_update = false
      if (message.article.title != tabData[sender.tab.id].title && message.article.title != '') {

        let counter = 0
        for (let entry of one_back_storage.reverse()) {
          if (good_match_do_update == true) {
            break;
          }
          let most_recent = entry
          let most_recent_pageId = most_recent[0]
          let most_recent_title = most_recent[1]
          if (message.article.title.includes(most_recent_title)) {
            id_to_update = most_recent_pageId
            good_match_do_update = true
          }
          counter += 1

        }
        if (good_match_do_update == false) {
          console.log("out of luck")
        }
      

      } else {
        id_to_update = tabData[sender.tab.id].pageId
        good_match_do_update = true 
      }

      if (good_match_do_update == true) {
        let current_time = Date.now()
        let activity_info_to_update = {
          pageId: id_to_update,
          activity_event: message.article,
          activity_time_to_log: current_time,
        };

        // store the ad in database
        databaseWorker.postMessage({
          type: 'update_page2',
          info: activity_info_to_update
        });
      }


      return true;

    case 'leaving_page':
      console.log("leaving page event (((" + JSON.stringify(message) + "))) -- " + tabData[sender.tab.id].pageId)

      let pageId = tabData[sender.tab.id].pageId
      let activity_event = message.article.activity_event

      let activity_info = {
        pageId: pageId,
        activity_event: message.article
      };

      // store the ad in database
      databaseWorker.postMessage({
        type: 'update_page',
        info: activity_info
      });

      return true; // must do since calling sendResponse asynchronously

    // used to log google ads settings content  
    case 'google_inference_done':

    	let ret;
      ret = log_google_inference(message);
      ret.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously

    case 'page_ads':

        console.log("-----------------------------------------------> incoming page ad")
        console.log(message)

        // do not double log work
        if (seen_it.has(message.article.ad_landing_page_long)) { // used to be ad_landing_page_long
          console.log("passing on: " + message.article.ad_landing_page_long)
          // this must stay on, and be cleared at pageLeave
          // otherwise you miss many ads that are served to the page
        } else {

          console.log("new: " + message.article.ad_landing_page_long)
          seen_it.add(message.article.ad_landing_page_long)


          // // ////////////////////////////////////////////////////////////////////////////
          // // ////////////////////////////////////////////////////////////////////////////
          // // ////////////////////////////////////////////////////////////////////////////
          // // // helpful for debugging, turn on this block to open ad grabs as new window
          // // sanity debugging 
          // var parser1 = new DOMParser();
          // // console.log(message.article.DOM)
          // var ishtml = parser1.parseFromString(message.article.DOM, 'text/html');
          // // opens the ad in a new window and writes it for display
          // var newWin = window.open("about:blank", "", "_blank");
          // // console.log(ishtml.documentElement.innerHTML)
          // var logger = String(tabData[sender.tab.id].pageId)
          // if (typeof logger == 'undefined') {
          //   logger = "error here"
          // }

          // // plain ad, fewer display issues 
          // // newWin.document.write(message.article.DOM);

          // newWin.document.write(`</head><br><br> pageId ` + logger + "<br><br>trigger: " + message.article.trigger + "<br><br><br>" + "ID: " + message.article.ID + "<br><br><br> oldHref:" + message.article.old_href + "<br><br><br> newHref:" + message.article.ad_landing_page_long + "<br><br><br>" + "caller: " + message.article.called_by + "<br><br><br>" + "landing page: " + message.article.ad_landing_page_long + "<br><br><br>" + "explanation: " + message.article.ad_explanation + "<br><br><br>" + `<!DOCTYPE html> <html><body> <div style='zoom: 0.75; -moz-transform: scale(0.75); -moz-transform-origin: 0 0; position: absolute; left: 50px; top: 50px'>` + ishtml.documentElement.innerHTML + "<div> </body> </html>");
          // // console.log(ishtml.documentElement.innerHTML)
          // // newWin.document.write(ishtml.documentElement.innerHTML);
          // // ////////////////////////////////////////////////////////////////////////////
          // // ////////////////////////////////////////////////////////////////////////////
          // // ////////////////////////////////////////////////////////////////////////////


          ///////////////////////////////////
          ////////////////////////
          //////////////
          //////
          //
          // 
          // 0. valid pageID
          // 1. sanitize 
          // 2. get all links that are viable, non-nothing 
          // 3. pick the best adURL link (valid inference)
          // 4. pick the best explanation (valid explanation) 
          // 5. log the vaid result 
          // 6. log an invalid result with "nothing" for inferences 


          ////////////////////////////////////////////////////////////////////
          // [0] instantiate and sanitize
          ////////////////////////////////////////////////////////////////////

          let checker = browser.storage.local.get('deepAdFetching').then(ret => {
            

            let sanitized_fetch;
            let this_ad_explanation;
            let ad_info = new Object();

            if (ret.deepAdFetching == true) {
              console.log("are we capturing deep ads with full legth fetch", ret)
              sanitized_fetch = message.article.ad_landing_page_long
              message.article.all_links_packaged = message.article.all_links_packaged
            } else {
              
              // fetching ad links sanitiziation 
              sanitized_fetch = String(message.article.ad_landing_page_long)
              let decoded_url = urldecode(sanitized_fetch)
              // get last http url link
              var re = /http/g
              var guard = 30;
              let matches = []
              let backup_sanitized_links = []
              let match
              while ((match = re.exec(decoded_url)) != null) {
                matches.push(match.index)
                if (guard-- < 0) {
                  console.error("Infinite loop detected")
                  break;
                }
              }
              // isolate last http in string
              if (matches.length < 2) {
                // the original URL does not have an explicit url
                // this is an accuray hit, but we prefer to avoid urls with ad parameters 
                sanitized_fetch = 'nothing'
              } else {
                let answer = decoded_url.slice(matches[matches.length - 1], decoded_url.length);
                // only keep string up through first query just in case ad parameters are there
                let first_query_char = answer.indexOf("?")
                if (first_query_char != -1) {
                  let final_answer = answer.slice(0, first_query_char);
                  sanitized_fetch = final_answer
                } else {
                  sanitized_fetch = answer
                }

                let target_info = tldjs.parse(sanitized_fetch)
                let target_hostname = target_info.hostname
                let target_subdomain = target_info.subdomain
                let target_domain = target_info.domain
                backup_sanitized_links.push('https://' + target_hostname) 
              }

              // do same sanitization for all secondary grab URLs
              let counter = 0
              let this_sanitized_fetch = '';
              for (let link of message.article.all_links_packaged) {
                let decoded_url = urldecode(String(link))
                // get last http url link
                var re = /http/g
                var guard = 30;
                let matches = []
                let match
                while ((match = re.exec(decoded_url)) != null) {
                  matches.push(match.index)
                  if (guard-- < 0) {
                    console.error("Infinite loop detected")
                    break;
                  }
                }
                // isolate last http in string
                if (matches.length < 2) {
                  // the original URL does not have an explicit url
                  // this is an accuray hit, but we prefer to avoid urls with ad parameters 
                  this_sanitized_fetch = 'nothing'
                } else {
                  let answer = decoded_url.slice(matches[matches.length - 1], decoded_url.length);
                  // only keep string up through first query just in case ad parameters are there
                  let first_query_char = answer.indexOf("?")
                  if (first_query_char != -1) {
                    let final_answer = answer.slice(0, first_query_char);
                    this_sanitized_fetch = final_answer
                  } else {
                    this_sanitized_fetch = answer
                  }
                  let target_info = tldjs.parse(this_sanitized_fetch)
                  let target_hostname = target_info.hostname
                  let target_subdomain = target_info.subdomain
                  let target_domain = target_info.domain
                  backup_sanitized_links.push('https://' + target_hostname)
                }
                message.article.all_links_packaged[counter] = this_sanitized_fetch
                counter += 1
              }

              let add_in_backups = [...message.article.all_links_packaged, ...backup_sanitized_links];
              add_in_backups.push(sanitized_fetch)
              add_in_backups = [...new Set(add_in_backups)];
              add_in_backups = add_in_backups.filter(item => item !== "nothing")
              add_in_backups.sort((a, b) => a.length - b.length);
              message.article.all_links_packaged = add_in_backups
              

              // console.log("original link", String(message.article.ad_landing_page_long))
              // console.log("all associated links sanitized", message.article.all_links_packaged)
              // console.log("sanitized original link", sanitized_fetch)

            }


            ////////////////////////////////////////////////////////////////////
            // [1] get the ad's inferred interest by visiting the ad 
            ////////////////////////////////////////////////////////////////////
            let backup_string = ''
            axios.get(sanitized_fetch) // rp(message.article.ad_landing_page_long)
              .then(function(html) {
                console.log("GOOD GRAB BASIC " + JSON.stringify(sanitized_fetch))
                backup_string = html.request.responseURL

                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(html.data, 'text/html');
                ad_info.text = makeInference(htmlDoc) // get text outside of normal function to not store ad as page visit
                if (ad_info.text == 'xxx unable to extract text from page') {
                  console.log('fail, should try again')
                  good_grab = false 
                  return false
                }

                ad_info.explanation = new Array("none provided by advertiser");
                if (message.article.ad_explanation != undefined) {
                  axios.get(String(message.article.ad_explanation)) //rp(url)
                    .then(function(html2) {
                      if (message.article.ad_explanation.includes('/whythisad')) {
                        var parser = new DOMParser();
                        var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                        var outer_element = htmlDoc.getElementsByClassName("Xkwrgc"); //Xkwrgc EmJRVd
                        const temp = new Set()
                        for (var i = 0; i < outer_element.length; i++) {
                          temp.add(outer_element[i].outerText)
                        }
                        ad_info.explanation = Array.from(temp);
                        this_ad_explanation = Array.from(temp)
                      }
                      if (message.article.ad_explanation.includes('criteo.com/adchoices')) {
                        var parser = new DOMParser();
                        var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                        var outer_element = htmlDoc.getElementsByClassName("mat-card-content")[0].textContent;
                        ad_info.explanation = Array.from(outer_element);
                        this_ad_explanation = Array.from(outer_element)
                      }

                      ////////////////////////////////////////////////////////////////////
                      // [2] log information, using pageId and domain and tabId
                      ////////////////////////////////////////////////////////////////////

                      if (ad_info.text != "error on text extract") {
                        inferencingWorker.postMessage({
                          type: 'content_script_to_inferencing__forad',
                          article: ad_info.text,
                          pageId: tabData[sender.tab.id].pageId,
                          domain: tabData[sender.tab.id].domain,
                          // url: message.article.ad,
                          // initiator: message.article.initiator,
                          url_explanation: message.article.ad_explanation,
                          url_landing_page_long: message.article.ad_landing_page_long,
                          url_landing_page_short: backup_string,
                          explanation: ad_info.explanation,
                          dom: message.article.DOM //"stub",//message.article.DOM,
                        });
                      }

                    })
                    .catch(function(err) {
                      //handle error
                      console.log("ERROR Grab on ad explanation - " + err + "--- " + String(message.article.ad_explanation))

                      ////////////////////////////////////////////////////////////////////
                      // [3] log information, if fail, using pageId and domain and tabId
                      ////////////////////////////////////////////////////////////////////

                      console.log(tabData[sender.tab.id].pageId)
                      console.log(ad_info)
                      let checker = {
                          type: 'content_script_to_inferencing__forad',
                          article: ad_info.text,
                          pageId: tabData[sender.tab.id].pageId,
                          domain: tabData[sender.tab.id].domain,
                          // url: message.article.ad,
                          // initiator: message.article.initiator,
                          url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                          url_landing_page_long: message.article.ad_landing_page_long,
                          url_landing_page_short: backup_string,
                          explanation: new Array("none provided by advertiser"),
                          dom: message.article.DOM //"stub",//message.article.DOM,
                        }
                      console.log(checker)

                      if (ad_info.text != "error on text extract") {
                        inferencingWorker.postMessage({
                          type: 'content_script_to_inferencing__forad',
                          article: ad_info.text,
                          pageId: tabData[sender.tab.id].pageId,
                          domain: tabData[sender.tab.id].domain,
                          // url: message.article.ad,
                          // initiator: message.article.initiator,
                          url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                          url_landing_page_long: message.article.ad_landing_page_long,
                          url_landing_page_short: backup_string,
                          explanation: new Array("none provided by advertiser"),
                          dom: message.article.DOM //"stub",//message.article.DOM,
                        });
                      }


                    });
                  } else {
                    // undefined ad explanation, but still do something with ad 
                    console.log("no ad explanation, still capture ad")
                    inferencingWorker.postMessage({
                      type: 'content_script_to_inferencing__forad',
                      article: ad_info.text,
                      pageId: tabData[sender.tab.id].pageId,
                      domain: tabData[sender.tab.id].domain,
                      // url: message.article.ad,
                      // initiator: message.article.initiator,
                      url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                      url_landing_page_long: message.article.ad_landing_page_long,
                      url_landing_page_short: backup_string,
                      explanation: new Array("none provided by advertiser"),
                      dom: message.article.DOM //"stub",//message.article.DOM,
                    });
                  }


              })
              .catch(function(err) {

                // check alternativel links before giving up and calling the ad inference "none"
                try {

                  //handle error
                  console.log("ERROR on axios url grab", err, message.article.ad_landing_page_long)
                  console.log(message.article.all_links_packaged)

                  let index_to_check = 1
                  let good_grab = false
                  let new_inference_on_this_take; 

                  for (let item of message.article.all_links_packaged) {
                    console.log("CHECKING", item)
                    try {
                      axios.get(String(item))
                        .then(function(html3) {
                          if (good_grab == false) {

                            //success!
                            console.log("success")

                            axios.get(String(message.article.ad_explanation)) //rp(url)
                              .then(function(html_explain) {
                                if (message.article.ad_explanation.includes('/whythisad')) {
                                  var parser = new DOMParser();
                                  var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                                  var outer_element = htmlDoc.getElementsByClassName("Xkwrgc"); //Xkwrgc EmJRVd
                                  const temp = new Set()
                                  for (var i = 0; i < outer_element.length; i++) {
                                    temp.add(outer_element[i].outerText)
                                  }
                                  ad_info.explanation = Array.from(temp);
                                  this_ad_explanation = Array.from(temp)
                                }
                                if (message.article.ad_explanation.includes('criteo.com/adchoices')) {
                                  var parser = new DOMParser();
                                  var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                                  var outer_element = htmlDoc.getElementsByClassName("mat-card-content")[0].textContent;
                                  ad_info.explanation = Array.from(outer_element);
                                  this_ad_explanation = Array.from(outer_element)
                                }
                                // do normal logging with updated ad-grab info
                                backup_string = html3.request.responseURL
                                console.log(html3)
                                var parser = new DOMParser();
                                var htmlDoc = parser.parseFromString(html3.data, 'text/html');
                                new_inference_on_this_take = makeInference(htmlDoc)
                                if (new_inference_on_this_take == 'xxx unable to extract text from page') {
                                  console.log('fail, should try again')
                                  good_grab = false 
                                  return false
                                }
                                inferencingWorker.postMessage({
                                  type: 'content_script_to_inferencing__forad',
                                  article: new_inference_on_this_take,
                                  pageId: tabData[sender.tab.id].pageId,
                                  domain: tabData[sender.tab.id].domain,
                                  // url: message.article.ad,
                                  // initiator: message.article.initiator,
                                  url_explanation: this_ad_explanation ? this_ad_explanation : "none",
                                  url_landing_page_long: message.article.ad_landing_page_long,
                                  url_landing_page_short: backup_string,
                                  explanation: ad_info.explanation,
                                  dom: message.article.DOM //"stub",//message.article.DOM,
                                });


                              })
                              .catch(function(err) {

                                // if explanation is not there, log anyways 
                                backup_string = html3.request.responseURL
                                var parser = new DOMParser();
                                var htmlDoc = parser.parseFromString(html3.data, 'text/html');
                                new_inference_on_this_take = makeInference(htmlDoc)
                                if (new_inference_on_this_take == 'xxx unable to extract text from page') {
                                  console.log('fail, should try again')
                                  good_grab = false 
                                  return false
                                }
                                inferencingWorker.postMessage({
                                  type: 'content_script_to_inferencing__forad',
                                  article: new_inference_on_this_take,
                                  pageId: tabData[sender.tab.id].pageId,
                                  domain: tabData[sender.tab.id].domain,
                                  // url: message.article.ad,
                                  // initiator: message.article.initiator,
                                  url_explanation: this_ad_explanation ? this_ad_explanation : "none",
                                  url_landing_page_long: message.article.ad_landing_page_long,
                                  url_landing_page_short: backup_string,
                                  explanation: ad_info.explanation,
                                  dom: message.article.DOM //"stub",//message.article.DOM,
                                });

                              })

                          }
                          good_grab = true


                        })
                        .catch(function(err_second_link_check) {
                          console.log("ERROR on axios url grab -- error secondary link checking")
                          good_grab = false 
                          return false
                        })
                    } catch(error) {
                      console.log("ERROR on axios url grab -- checking extra, no luck", error)
                      good_grab = false 
                      return false
                    }
                    index_to_check += 1
                  }


              } catch (erro) {

                // console.log("INNER Grab - ERROR -" + err + " -- " + "attempting to " + message.article.ad_landing_page_long)
                // console.log("script based redirect")
                // console.log(Pattern.UrlArea.normalizeUrl(message.article.ad_landing_page_long))
                // console.log(Pattern.UrlArea.normalizeUrl(backup_string))
                // onlyParamsJsn url 
                // onlyParamsJsn rdct_url
                // onlyParamsJsn adurl
                // console.log("sending ad to database anyways, without full information")
                inferencingWorker.postMessage({
                  type: 'content_script_to_inferencing__forad',
                  article: "redirect error",
                  pageId: tabData[sender.tab.id].pageId,
                  domain: tabData[sender.tab.id].domain,
                  // url: message.article.ad,
                  // initiator: message.article.initiator,
                  url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                  url_landing_page_long: message.article.ad_landing_page_long,
                  url_landing_page_short: backup_string,
                  explanation: new Array("none provided by advertiser"),
                  dom: message.article.DOM //"stub",//message.article.DOM,
                });
              }
            }); 
          })
        }
        }
        return true; // must do since calling sendResponse asynchronously
}

async function openDashboard () {
  const dashboardData = {
    active: true,
    url: browser.runtime.getURL('dist/dashboard.html')
  }
  await browser.tabs.create(dashboardData)
}


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.text == "what is my tab_id?") {
        sendResponse({tab: sender.tab.id});
     }
});

/**
 * fetch updated tracker list 
 *
 * @returns {Object} fills companyData and also domainEntityMap 
 *
 */
async function update_tracker_list() {
  try {
    fetch('https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json')
      .then(response => response.json())
      .then(data => {

        console.log("[+] fetching updated tracker list from disconnect (https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json)")

        for (var key of Object.keys(data)) {

          const cat = data['categories']

          for (var specific_category of Object.keys(cat)) {

            let target_entity_wrapper = cat[specific_category]

            for (var iterative_entity_list of Object.keys(target_entity_wrapper)) {

              let site_wrapper = target_entity_wrapper[iterative_entity_list]

              for (var website of Object.keys(site_wrapper)) {

                let domain_wrapper = site_wrapper[website]

                for (var domain_list_long of Object.keys(domain_wrapper)) {
                  // alert(specific_category + "--" + website + "--" + domain_list)

                  let list_long = domain_wrapper[domain_list_long]
                  
                  let entry = {
                    site: tldjs.parse(domain_list_long).hostname,
                    type: specific_category,
                    domains: list_long,
                  };

                  companyData[website] = entry;

                  for (var single_domain of Object.keys(list_long)) {
                    let this_domain = list_long[single_domain]
                    domainEntityMap[this_domain] = website
                  }

                }

              }

            }

          }

        }
        // console.log(companyData)
        // console.log(domainEntityMap)
        browser.storage.local.set({companyData: companyData});

        return domainEntityMap

      });
  } catch (e) {
    console.log("[-] error updating disconnect tracking list, default to stock")
  }

}


/**
 * fetch google ad categories to bucket interests/demographics in google adssettings
 *
 * @returns {Object} fills google ad categories in state
 *
 */
async function update_google_ad_list() {
  // const response = fetch('https://developers.google.com/google-ads/api/data/tables/verticals.csv') // older ad words
  const response = fetch('https://developers.google.com/static/google-ads/api/data/tables/verticals.csv') // newer ad words
   .then(response => response.text())
   .then(v => Papa.parse(v))
   .catch(err => console.log(err))

  response.then(
    v => {
    	console.log("[+] fetching updated google ad words list (https://developers.google.com/static/google-ads/api/data/tables/verticals.csv)")
      for (let i = 0; i < v['data'].length; i++) {
        let base = v['data'][i][2]
        if (base !== undefined && base !== 'Category') {
          let last_part = base.split("/")
          let key = last_part[last_part.length-1]
          let value = base
          // console.log(key + " ===> " + value)
          google_ad_categories[key] = value
        }
      }
      update_google_ads_settings()
      // return google_ad_categories
    }
  )
}


/**
 * fetch easylist
 * stores information in memory
 *
 * @returns {Object} successful flag or not
 *
 */
async function update_ad_server_list() {


	var href_blocklist = new Array()
	const response_second = fetch('https://adaway.org/hosts.txt')
	 .then(response_second => response_second.text())
	 .catch(err => console.log(err))

	response_second.then(
	  v2 => {

			var arr = v2.split("\n")
			for (let i = 0; i < arr.length; i++) {
				let line = arr[i]
				if (line !== '' && line[0] !== '#' && line[0] !== ':') {
					let matcher = line.split('127.0.0.1 ')[1]

					if (matcher !== ' localhost') {
						href_blocklist.push(matcher)
					}
					
				}
			}
			return href_blocklist
	  }
	  
	)

}

/**
 * fetch google ads settings, assuming user is logged in
 * do this at beginning to try and stock content 
 *
 * @returns {Object} successful flag or not
 *
 */
async function update_google_ads_settings(path=null) {

  let path_provided; // user logged in to secondary adssettings account
  if (path) {
    path_provided = path
  } else {
    path_provided = 'https://adssettings.google.com'
    path = 'myadcenter'
  }

  if (path.includes('myadcenter')){

   // https://myadcenter.google.com/
   // brands: EpBto
   // interests: YcxLyd
   // sensitive: ibnKdd
   // https://myadcenter.google.com/controls
   // demographics: Si6A0c

    // get interests and demographics
    const info = new Array()

    // first fetch demographics
    const respose_dem = fetch('https://myadcenter.google.com/controls')
     .then(respose_dem => respose_dem.text())
     .catch(err_dem => console.log(err_dem))
    respose_dem.then(
      v => {
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(v, 'text/html');

        var demographics_main = htmlDoc.getElementsByClassName("LCZ6Wc"); // all interest tiles
        var demographics_main_type = htmlDoc.getElementsByClassName("BUHCWd"); // all interest tiles
        for (var i = 0;i < demographics_main.length; i++){
          // alert(JSON.stringify(interests_all[i].innerText))
          var entry = new Object();
          let value;
          let type = demographics_main_type[i].innerText
          let val = demographics_main[i].innerText
          console.log("demo main" + val)
          if (!val.includes('enough info')) {
            if (type.includes("Age")) {
              let temp = demographics_main[i].innerText.replace(" years", "");
              value = temp + " years old"
            }
            if (type.includes("Language")) {
              value = "Language: " + demographics_main[i].innerText
            }
            if (value) {
              entry = {
                "type": "demographic",
                "value": value,
              }
            } else{
              entry = {
                "type": "demographic",
                "value": demographics_main[i].innerText,
              }
            }

            info.push(entry)
          }

        }

        var demographics_secondary = htmlDoc.getElementsByClassName("jHksfd"); // all interest tiles
        var demographics_secondary_type = htmlDoc.getElementsByClassName("vdBmL"); // all interest tiles
        for(var i = 0;i < demographics_secondary.length; i++){
          var entry = new Object();
          let value; 
          let type = demographics_secondary_type[i].innerText
          let val = demographics_secondary[i].innerText
          console.log("demo main secondary" + val)

          if (!val.includes('enough info')) {

            if (type.includes('Relationships')) {
              value = "Marital Status: " + demographics_secondary[i].innerText
            }
            if (type.includes("Employer Size")) {
              value = "Company Size: " + demographics_secondary[i].innerText
            }
            if (type.includes("Education")) {
              value = "Education Status: " + demographics_secondary[i].innerText
            }
            if (type.includes("Homeownership")) {
              value = "Homeownership Status: " + demographics_secondary[i].innerText
            }
            if (type.includes("Household Income")) {
              value = "Household Income: " + demographics_secondary[i].innerText
            }
            if (type.includes("Industry")) {
              value = "Job Industry: " + demographics_secondary[i].innerText
            }
            if (type.includes("Parenting")) {
              value = "Parental Status: " + demographics_secondary[i].innerText
            }

            if (value) {
              entry = {
                "type": "demographic",
                "value": value,
              }
            } else {
              entry = {
                "type": "demographic",
                "value": demographics_secondary[i].innerText,
              }
            }

            info.push(entry)

          }

        }

        // then fetch interests and brands and sensitive
        const response = fetch("https://myadcenter.google.com/customize")
         .then(response => response.text())
         .catch(err => console.log(err))
        response.then(
          v => {
            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(v, 'text/html');
            console.log(htmlDoc);

            let email_temp; 
            let name_temp;
            let email; 
            let name; 

            // get two factor
            let grouped_explanations;
            var scripts = htmlDoc.getElementsByTagName("script");
            for (var i = 0; i < scripts.length; i++) {
              if (scripts[i].src) {
                // console.log(i, scripts[i].src)
              }
              else {
                if (String(scripts[i].innerHTML).includes("AF_initDataCallback({key:")) {
                  var start = (scripts[i].innerHTML.indexOf('['))
                  var end = (scripts[i].innerHTML.lastIndexOf(']')+1)
                  var data = JSON.parse(scripts[i].innerHTML.substring(start,end));
                  grouped_explanations = data
                }
              }
            }


            // get name revision 2
            let possibilities = Array.from(htmlDoc.querySelectorAll("*")).filter(a => a.textContent.match("Google Account"))
            for (let i = 0; i < possibilities.length; i ++) {
              let outer_class = String(possibilities[i].className);
              var outer_name = htmlDoc.getElementsByClassName(outer_class);
              for(var p = 0; p < outer_name.length; p++) {

                const divs = outer_name[p].querySelectorAll('div');
                if (divs.length == 3) {
                  let subs = outer_name[p].getElementsByTagName('*');
                  for (var z = 0; z < subs.length; z++) {
                    if (subs[z].textContent !== 'Google Account' && subs[z].textContent !== '') {
                      if (subs[z].textContent.includes("@")) {
                        email_temp = subs[z].textContent
                      } else {
                        name_temp = subs[z].textContent 
                      }
                      if (name_temp && email_temp) {
                        name = name_temp; 
                        email = email_temp; 
                      }
                    }
                  }
                }
              }
            }

            var interests_all = htmlDoc.getElementsByClassName("YcxLyd"); // all interest tiles
            for(var i = 0;i < interests_all.length; i++){
              var entry = new Object();
              entry = {
                "type": "-",
                "value": interests_all[i].innerText,
              }
              info.push(entry)
            }

            var brands_all = htmlDoc.getElementsByClassName("ByHevf"); // all brand tiles
            for(var i = 0;i < brands_all.length; i++){
              var entry = new Object();
              entry = {
                "type": "interest - company",
                "value": brands_all[i].innerText,
              }
              // console.log(JSON.stringify(entry))
              info.push(entry)
            }

            var sensitive_all_type = htmlDoc.getElementsByClassName("I2wnPb");
            var sensitive_all_permission = htmlDoc.getElementsByClassName("CCxuc"); // all sensitive info

            let sensitive_list_temp = {}
            for(var i = 0;i < sensitive_all_type.length; i++){
              let category = sensitive_all_type[i].innerText
              let permissible_real = sensitive_all_permission[i].innerText
              let permissible;
              if (permissible_real.includes('Allowed')) {
                permissible = "yes"
              } else {
                permissible = "no"
              }
              sensitive_list_temp[category] = permissible
            }
            let sensitive_list = []
            for (const [key, value] of Object.entries(sensitive_list_temp)) {
              let temp = {"category": key, "permission": value}
              sensitive_list.push(temp)
            }

            if(typeof name !== "undefined") {
              info.push({"type": 'my_name', "value": name})
            }
            if(typeof email !== "undefined") {
              info.push({"type": 'my_email', "value": email})
            }
            if (Object.entries(sensitive_list).length != 0) {
              info.push({"type": 'demographic', "value": "Sensitivity:" + JSON.stringify(sensitive_list)})
            }
                 
            // console.log("[+] attempting google inference from (" + path_provided + ")")
            if (info.length !== 0) {
              let message = {article: info, pageId: Date.now()}
              log_google_inference(message)
            }

        })  

    })

  }
  else {
    const response = fetch(path_provided)
     .then(response => response.text())
     .catch(err => console.log(err))

    // this was built to work on the old adssettings page! 
    response.then(
      v => {

        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(v, 'text/html');
        // console.log(htmlDoc);

        let email_temp; 
        let name_temp;
        let email; 
        let name; 

        // get two factor
        let grouped_explanations;
        var scripts = htmlDoc.getElementsByTagName("script");
  			for (var i = 0; i < scripts.length; i++) {
  			  if (scripts[i].src) {
  			  }
  			  else {
  			  	if (String(scripts[i].innerHTML).includes("AF_initDataCallback({key:")) {
  						var start = (scripts[i].innerHTML.indexOf('['))
  						var end = (scripts[i].innerHTML.lastIndexOf(']')+1)
  						var data = JSON.parse(scripts[i].innerHTML.substring(start,end));
  						grouped_explanations = data
  			  	}
  			  }
  			}


        // get name revision 2
  	    let possibilities = Array.from(htmlDoc.querySelectorAll("*")).filter(a => a.textContent.match("Google Account"))
  	    for (let i = 0; i < possibilities.length; i ++) {
  	    	let outer_class = String(possibilities[i].className);
  	    	var outer_name = htmlDoc.getElementsByClassName(outer_class);
  	      for(var p = 0; p < outer_name.length; p++) {
  					const divs = outer_name[p].querySelectorAll('div');
  					if (divs.length == 3) {
  		        let subs = outer_name[p].getElementsByTagName('*');
  		        for (var z = 0; z < subs.length; z++) {
  		          if (subs[z].textContent !== 'Google Account' && subs[z].textContent !== '') {
  		            if (subs[z].textContent.includes("@")) {
  		              email_temp = subs[z].textContent
  		            } else {
  		              name_temp = subs[z].textContent 
  		            }
  		            if (name_temp && email_temp) {
  		            	name = name_temp; 
  		            	email = email_temp; 
  		            }
  		          }
  		        }
  		      }
  	      }
  			}



        // try for sensitive subjects 
        var outer_outer_sensitive = htmlDoc.getElementsByClassName("AhDyOb"); // for sensitive subjects you permit
        let sensitive_list_temp = {}
        let category; 
        let permissible; 
        for(var i = 0;i < outer_outer_sensitive.length; i++){
          for (let q = 0; q < outer_outer_sensitive[i].children.length; q++) {
            category = outer_outer_sensitive[i].children[q].children[1].children[0].innerText
            if (outer_outer_sensitive[i].children[q].className == "yRPqod") {
              permissible = "yes"
            } else {
              permissible = "no"
            }
            sensitive_list_temp[category] = permissible
          }
        }
        let sensitive_list = []
        for (const [key, value] of Object.entries(sensitive_list_temp)) {
          let temp = {"category": key, "permission": value}
          sensitive_list.push(temp)
        }

  			const info = new Array()

  			var outer_outer = htmlDoc.getElementsByClassName("JRGAPc");  //JRGAPc

  			for(var i = 0;i < outer_outer.length; i++){

  			  let subs = outer_outer[i].getElementsByTagName('*');

  			  let key; 
  			  let value;

  			  for (var q = 0; q < subs.length; q++) {

  			    if (subs[q].className == 'lSvC9c ') {
  			      // this is an interest or demographic //console.log(subs[q].src.split('/')[6])
  			      key = "-"
  			    } else if (subs[q].className.includes('lSvC9c')) {
  			      key = "interest - company"
  			    } if (subs[q].className == 'c7O9k') {
  			      value = subs[q].textContent
  			    }

  			    if (value !== undefined && key !== undefined) {

  			      var entry = new Object();
  			      entry = {
  			      	"type": key,
  			      	"value": value,
  			      }

  			      info.push(entry)

  			      let target = String(value.split(":")[0])
              let target_language = String(value.split("Language: ")[1])
              target_language = String(target_language.split(" and")[0])

  			      if (value != undefined && value.includes('factor') || value.includes('more') ){
  			      	for (let obj of grouped_explanations[0]){
  			      		for (let obj2 of obj){
  			      			for (let obj3 of obj2){
  			      				if (obj3){
                        if ((target.includes("Language")) && (value.includes("more"))) {
                          
                          try {
                            for (let obj4 of obj3) {
                              if (obj4.includes(target_language)) {
                                let further_detail = []
                                for (let hit of obj4){
                                  further_detail.push(hit)
                                }
                                entry.value = entry.value + ":"  + "," + further_detail.join(', ') 
                              }
                            }
                          } catch(error) {
                            // console.log(error)
                          }


                        }
  			      					try{
                          // catches other types with mulitple factors, like parenting or job industry
                          let grommet_version = []
  			      						if (obj3.includes(target)){
  			      							let further_detail = []
  			      							for (let hit of obj3[5]){
  			      								further_detail.push(hit[1])
  			      							}

  			      							entry.value = entry.value + ":"  + "," + further_detail.join(', ') 
  			      						}
  			      					}
  			      					catch(error){
  			      					}
  			      				}
  			      			}
  			      		}
  			      	}
  			      }
  			    }

  			  }
  			}

        if(typeof name !== "undefined") {
          info.push({"type": 'my_name', "value": name})
        }
        if(typeof email !== "undefined") {
          info.push({"type": 'my_email', "value": email})
        }
        if (Object.entries(sensitive_list).length != 0) {
          info.push({"type": 'demographic', "value": "Sensitivity:" + JSON.stringify(sensitive_list)})
        }
              
  			if (info.length !== 0) {
  				let message = {article: info, pageId: Date.now()}
  				log_google_inference(message)
  			}


  	  }

    )
  
  }

}


  ////
  /////
  /////// THIS IS NOT A REAL PID --> [no telemetry on release]
  /////
  //// 
async function storePID(url) {

  let full_url = url
  // currently slotted into a random condition (1, 2, or 3) 
  // this function should take that inforamtion, split off the condition, and keep the PID
  // the prolific ID is needed to keep track longitudinally 
  let checker = browser.storage.local.get('mturkcode').then(current_ID => {
    if (!current_ID['mturkcode'].includes('-pid-')) {
      let revised_ID_parsed = Pattern.UrlArea.parseUrl(full_url)
      let prolific_PID = revised_ID_parsed.onlyParamsJsn.PROLIFIC_PID
      let revised_condition = revised_ID_parsed.onlyParamsJsn.CONDITION_ID
      const new_ID = revised_condition + "-pid-" + prolific_PID
      saveID(new_ID).then(response => { 
        browser.storage.local.get('mturkcode').then(resp => {
          this.setState({ showInstallSuccess: true })
          // alert("DONE", new_ID)
        }) 
      });
    } else {
      console.log("already updated PID!")
    }

  })


}

async function doDeepAds () {
  console.log("[-] attempting to set deep ads from start")
  await browser.storage.local.set({deepAdFetching: true});
  console.log("[+] DONE deep ads from start")
}

///////////// would clear out extension history after 24 hours to conserve space/memory
// async function check_cyle_optimization () {
//   // await browser.storage.local.set({deepAdFetching: true});
//   browser.storage.local.get('time_check').then(last_time => {

//     if (Object.keys(last_time).length === 0) {
//       console.log("[-] SETTING checking clock for one-hour optimization")

//       var date_today = new Date();
//       let date_today_formatted = moment(date_today).format("YYYY-MM-DD");
//       console.log(date_today_formatted)
//       browser.storage.local.set({time_check: date_today_formatted})


//     } else {
//       // let one_day_ahead = moment(last_time).add(1, 'days').format('YYYY-MM-DD')
//       // console.log(one_day_ahead)

//       // today 
//       var date_today = new Date();
//       let date_today_formatted = moment(date_today).format("YYYY-MM-DD");
//       let one_day_ago = moment(date_today_formatted).subtract(1, 'days').format('YYYY-MM-DD')
//       let within_day = moment(last_time).isAfter(one_day_ago);
//       if (within_day == false) {

//         console.log('[-] check_cyle_optimization is removing all data now')
//         resetAllData()
//         // reset the clock
//         var curr_date_today = new Date();
//         let curr_date_today_formatted = moment(curr_date_today).format("YYYY-MM-DD");
//         browser.storage.local.set({time_check: curr_date_today_formatted})

//         console.log('[+] DONE check_cyle_optimization is removing all data now')
//       }

//     }


//   })
//   console.log("[+] DONE checking clock for one-hour optimization")
// }



async function getIP () {
  console.log("[-] attempting IP address lookup")

  $.getJSON('https://json.geoiplookup.io/?callback=?', function(data) {

    // only log new IP impressions
    let all_current_IPs = queryDatabase('getAllIPs', {})
    all_current_IPs.then(n => {
      if (n.includes(data.ip) == false) {
        let info = {
          "ip": data.ip,
          "isp": data.isp,
          "org": data.org,
          "hostname": data.hostname,
          "latitude": data.latitude,
          "longitude": data.longitude,
          "postal_code": data.postal_code,
          "city": data.city,
          "country_code": data.country_code,
          "country_name": data.country_name,
          "continent_code": data.continent_code,
          "continent_name": data.continent_name,
          "region": data.region,
          "district": data.district,
          "timezone_name": data.timezone_name,
          "connection_type": data.connectoin_type,
          "asn_number": data.asn_number,
          "asn_org": data.asn_org,
          "asn": data.asn,
          "currency_code": data.currency_code,
          "currency_name": data.currency_name,
          "success": data.success,
          "premium": data.premium,
        }

        // sometimes the IP location is wrong, use multiple services
        // do not use API because IP address sould be kept local
        fetch('https://ipapi.co/' + data.ip + '/json/')
        .then(function(response) {
          response.json().then(jsonData => {
            console.log(jsonData)
            let alterantive_ip = jsonData.region + ", " + jsonData.city;
            info.alternative_ip = alterantive_ip
            let IPAddressInfo = {
              IPaddress: info,
            };
            console.log(IPAddressInfo)
            // store the ad in database
            databaseWorker.postMessage({
              type: 'store_IPAddress',
              info: IPAddressInfo
            });

          });
        })
        .catch(function(error) {
          console.log(error)
          let IPAddressInfo = {
            IPaddress: info,
          };
          console.log(IPAddressInfo)
          // store the ad in database
          databaseWorker.postMessage({
            type: 'store_IPAddress',
            info: IPAddressInfo
          });

        });
        console.log("[+] DONE IP address lookup")
      } else {
      console.log("[+] DONE IP exists, moving along")
      }
    })
  });
}

// new model load function
async function loadTfjsModel() {
  Dexie.exists("tensorflowjs").then(function(exists) {
    if (exists) {
      console.log("[xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx] DB exists -- DONE tfModelJson");
    }
    else {
      console.log("[---------------------------------] starting tfModel loading...")
      let blob = new Blob([JSON.stringify(tfModelJson)], {type : 'application/json'})
      importDB(blob).then(response => { 
        console.log("[+++++++++++++++++++++++++++++++++] DONE tfModelJson");
      });

    }
  }).catch(function (error) {
      console.error("Oops, an error occurred when trying to check database existance");
  });
}

// // old model load function
// async function loadTfjsModel() {
//     console.log("[---------------------------------] starting tfModel loading...")
//     //remove old modeldb if any
//     await Dexie.delete('tensorflowjs')
//     let blob = new Blob([JSON.stringify(tfModelJson)], {type : 'application/json'})
//     await importDB(blob)
//     console.log("[+++++++++++++++++++++++++++++++++] DONE tfModelJson:");
// }


// anytime you start or stop chrome
window.onload = function() {
    // load tfJS model 
    loadTfjsModel();
    // clear out telemetry on viewing
    localStorage.removeItem("viewing") 
    // get most current ad list from google 
    update_google_ad_list();
    // get most current ad server list from providers 
    load_list2();
    // get most current trackers list from disconnect
    update_tracker_list();
    // get user IP address
    getIP();
    //deepFetchads first 
    doDeepAds();
    // check 24 hour clock
    // check_cyle_optimization();

};

