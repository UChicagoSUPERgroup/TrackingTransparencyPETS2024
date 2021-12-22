/** @module background */

import tldjs from 'tldjs';

import {trackersWorker, databaseWorker, inferencingWorker, queryDatabase} from './worker_manager';
import overlayManager from './overlay_manager';
import instrumentation from './instrumentation';
import { getOption } from '../helpers';
// import loggingDefault from '../options/loggingDefault'

const request = require('request')
const axios = require('axios')
import { parse } from 'node-html-parser';
import * as Papa from 'papaparse';
import Pattern from 'url-knife';

import { Readability } from '@mozilla/readability';

var href_blocklist = new Array()

function load_list2() {

	Promise.all([
		fetch('https://easylist-downloads.adblockplus.org/easylist.txt'),
		fetch('https://adaway.org/hosts.txt'),
		fetch('https://pgl.yoyo.org/adservers/serverlist.php?hostformat=webclean'),
		fetch('https://sos-ch-dk-2.exo.io/noblt/RPZ/Hosts-database/full-alive.txt') // TODO slim me -- large, but looks like a really good list
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
			// console.log(arr[i])
			let line = arr[i]
			// if (line[0] == '|' && line[1]=="|") { // this is a domain (but we are on href, so take this out)
			// 	let matcher = line.split("||")[1]
			// 	matcher = matcher.split("^")[0] // drop any hard stop rules from 
			// 	matcher = matcher.split("*")[0] // keey everything before wildcard, becuase we will match on 'includes' not exact
			// 	matcher = matcher.split(",")[0] // easylist explains domain after comma, we don't need it
			// 	href_blocklist.push(matcher)
			// 	// console.log("matcher1 --" + matcher)
			// }
			if (line[0] == '#' && line[1] == '#' && line[2] =="a" && line[3] =="[" && line[4] =="h") { // this is an href
				let matcher2 = line.split('##')[1]
				var start = matcher2.indexOf('"');
				var rest_of_string = matcher2.substring(start + 1, matcher2.length) // add one for not finding the first quote
				// console.log(rest_of_string)
				var stop = rest_of_string.indexOf('"');
				matcher2 = rest_of_string.substring(0, stop)
                href_blocklist.push(matcher2)
				// console.log(rest_of_string.substring(0, stop) + "==> " + line)
			}
		}
        console.log("[+] DONE easylist grab")

		
        console.log("[-] starting yoyo grab...")
		var arr = yoyo.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]
			if (line.startsWith("pattern: ")) {
				// // too onerous
				// // console.log(line)
				// let match_part_regex = line.split("pattern: ")[1]
				// match_part_regex = match_part_regex.replace("://", ":\\/\\/")
				// match_part_regex = "pattern: " + "/" + match_part_regex +"/gm"
				// href_blocklist.push(match_part_regex)

				var start = line.indexOf("://") + 4
				let is_letter = line[start].match(/[a-z]/i) 
				if (is_letter !== null) {
					// console.log(line)
					let matcher3 = line.split("pattern: ^https?://")[1]
					// console.log(matcher3)
                    href_blocklist.push(matcher3)
				}
				// console.log( line[start].match(/[a-z]/i)  )
			}
		}
        console.log("[+] DONE yoyo grab")

        console.log("[-] starting sos grab...")
        var arr = sos.split("\n")
        for (let i = 0; i < arr.length; i++) {
            let line = arr[i]
            if (line[0] != ' ' && line[0] != ';') {
                
                let matcher4 = line.split(" CNAME .")[0]
                
                href_blocklist.push(matcher4)
                
            }
        }
        console.log("[+] ... ending sos grab")

		// personal adds
		href_blocklist.push("prod-m-node-1113.ssp.yahoo.com")
        href_blocklist.push("pages.ebay.com")
        href_blocklist.push("ssp.yahoo")
        href_blocklist.push("adclick.g.")
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
// console.log("[+] attempting instrumentation setup")
// instrumentation.setup()

// async function hashit(data){return instrumentation.hashit(data)}
// async function hashit_salt(data){return instrumentation.hashit_salt(data)}

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

  // alert(JSON.stringify(details))

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
  if (details.url.includes('adssettings.google.com/authenticated') || details.url.includes('adssettings.google.com/u/')) { // authenticated path so we know user is logged in

    let path_detail; 
    if (details.url.includes('adssettings.google.com/u/')) {
        console.log("secondary+ login")
        path_detail = details.url
    } else if (details.url.includes('adssettings.google.com/authenticated')) {
        console.log("primary login")
        path_detail = null
    }

  	update_google_ads_settings(path_detail)
  }


  // update google adsSettings scraper every 5th page visit 
  // checks on how often google is updating 
  function check_n(n) {
    let how_often = 10
    if (n%how_often == 0) {
        // alert("updating because were at " + n)
        update_google_ad_list()
    }
  }
  // ping on google adSettings 
  let num_pages_current = queryDatabase('getNumberOfPages', {})
  num_pages_current.then(n => check_n(n))


}

async function onDOMContentLoaded (details) {
  const { tabId } = details
  if (!isMainFramePage(details)) return

  // we now have title
  // so we can add that to tabdata and push it to database
  const tab = await browser.tabs.get(details.tabId)
  if (tab.incognito) {
    // we don't want to store private browsing data
    tabData[tabId] = null
    return
  }
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })

}

async function onHistoryStateUpdated (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  // check if url is changed
  // a lot of pages (yahoo, duckduckgo) do extra redirects
  // that call this function but really aren't a page change
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

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/
/*
async function fetchSetGetFavicon(url, faviconurl){
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    //already stored favicon
    //and the favicon is same as before
    if(checkFav[x]['faviconurl']==faviconurl){
      return checkFav[x]['favicondata'];
    }
  }
  if(faviconurl==''){
    //no favicon for this tab
    await browser.storage.local.set(
      {[x]: {
        'url':url,
        'faviconurl':faviconurl,
        'favicondata':''}
      }
    );
    return '';
  }
  var favicon = new XMLHttpRequest();
  favicon.responseType = 'blob';
  favicon.open('get', faviconurl);
  favicon.onload = function() {
    var fileReader = new FileReader();
    fileReader.onloadend = async function() {
      // fileReader.result is a data-URL (string) in base 64 format
      x = 'favicon_'+url
      await browser.storage.local.set(
        {
          [x]: {
            'url':url,
            'faviconurl':faviconurl,
            'favicondata':fileReader.result
          }
        });
    };
    // favicon.response is a Blob object
    fileReader.readAsDataURL(favicon.response);
  };
  favicon.send();
  checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  return checkFav[x]['favicondata'];
}
window.fetchSetGetFavicon=fetchSetGetFavicon;
*/

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
/*
async function getFavicon(url) {
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    return checkFav[x]['favicondata'];
  }
  return ''
}
window.getFavicon=getFavicon;
*/

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

  // clear out the ads seen by one page, because it is a 
  // new page wherever you go next
  // alert(Array.from(seen_it))
  seen_it.clear()
  seen_it2.clear()
  seen_it3.clear()

  // old placement of update trackers
  // has bug where tracker count won't update until you move away from page
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

  // // update trackers, used to simluate ajax on tracker counts
  // // same page shows tracker count even before move-away
  // trackersWorker.postMessage({
  //   type: 'page_changed',
  //   oldPageId: tabData[tabId].pageId,
  //   firstPartyHost: tabData[tabId].domain,
  //   webRequests: tabData[tabId].webRequests,
  //   updatedTrackerData: domainEntityMap,
  // });


}

async function onPageLoadFinish (details) {


  if (details.frameId === 0) {

    console.log(details)

    // not an iframe
    const tabId = details.tabId
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'make_inference'
      })
    } catch (e) {
      console.log(e)
    }

    // extra stuff for overlay (ghostery condition)
    const data = await getTabData(tabId)
    const showOverlay = await getOption('showOverlay')
    if (showOverlay === true) {
      overlayManager.createOrUpdate(tabId, data)
    }

    ///////////////////////////////////////////////////////////////////////////// default
    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/tester2.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {type: "filters", allowlist: whitelist, blocklist: blacklist});
        // // console.log("DONE (in parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + JSON.stringify(details))
    });
    ///////////////////////////////////////////////////////////////////////////// default

  }
  else {


    ///////////////////////////////////////////////////////////////////////////// default
    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/tester2.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {pageId: tabData[tabId].pageId});
        // console.log("DONE (in non-parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + JSON.stringify(details))
    });
    ///////////////////////////////////////////////////////////////////////////// default

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
    if (info[i].type == "-") {
      try {

        if (info[i].type == 'my_name' || info[i].type == 'my_email') {
             
        } else {
            // console.log(info[i].value + " --> and lookup --> " + google_ad_categories[info[i].value])
            let value_with_full_google_categories = google_ad_categories[info[i].value]
            if (value_with_full_google_categories == undefined) {
              info[i].type = "demographic"
              // info[i].value = info[i].value
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

  // TODO: send message to server to wipe all data
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



////////////////////////////////////////////////////////// only for ads
export default function makeInference (htmlDoc) {

  let dupDoc = htmlDoc
  let reader = new Readability(dupDoc,{}); //readability expect doc
  let article = reader.parse();
  let text = article.textContent;

  if (!text || text.length === 0) {
    alert('xxx unable to extract text from page');
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
////////////////////////////////////////////////////////// only for ads



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
        alert("ignore because didn't come from tab")
        break;
      }
      if (!tabData[sender.tab.id]) {
        alert("ignore because dead pageId")
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

        // do not double log work
        if (seen_it.has(message.article.ad_landing_page_long)) { // used to be ad_landing_page_long
          console.log("passing on: " + message.article.ad_landing_page_long)
          // this must stay on, and be cleared at pageLeave
          // otherwise you miss many ads that are served to the page
        } else {

          console.log("new: " + message.article.ad_landing_page_long)
          seen_it.add(message.article.ad_landing_page_long)


          // //           ////////////////////////////////////////////////////////////////////////////
          // //           ////////////////////////////////////////////////////////////////////////////
          // //           ////////////////////////////////////////////////////////////////////////////
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
          // //           ////////////////////////////////////////////////////////////////////////////
          // //           ////////////////////////////////////////////////////////////////////////////
          // //           ////////////////////////////////////////////////////////////////////////////




          ////////////////////////////////////////////////////////////////////
          // [0] instantiate
          ////////////////////////////////////////////////////////////////////
          // alert(JSON.stringify(tabData[sender.tab.id].pageId))
          const ad_info = new Object();


          ////////////////////////////////////////////////////////////////////
          // [1] get the ad's inferred interest by visiting the ad 
          ////////////////////////////////////////////////////////////////////


          let backup_string = ''
          axios.get(String(message.article.ad_landing_page_long)) // rp(message.article.ad_landing_page_long)
            .then(function(html) {
              //success!
              backup_string = html.request.responseURL
              console.log(html)
              var parser = new DOMParser();
              var htmlDoc = parser.parseFromString(html.data, 'text/html');
              // console.log(htmlDoc)
              // 1. get cleaned text ==> inferencing.js
              // ad_info.text = extractTextFromNode(htmlDoc.body); // this is an old function, let the inferencing worker do it for us 
              ad_info.text = makeInference(htmlDoc) // get text outside of normal function to not store ad as page visit


              // message.article.ad_explanation = new Array("none provided by advertiser");
              ad_info.explanation = new Array("none provided by advertiser");

              axios.get(String(message.article.ad_explanation)) //rp(url)
                .then(function(html2) {
                  //success!

                  if (message.article.ad_explanation.includes('adchoices?')) {
                    // parsing doesn't work here for some reason, using string method
                    let str = html22.data
                    let start = str.split("You have enabled ad personalization</b>.")[1]
                    let end = start.split("</mat-card>")[0]
                    let reasons = end.replace(/(<([^>]+)>)/gi, "")
                    ad_info.explanation = [reasons]
                    alert([reasons])
                  }
                  if (message.article.ad_explanation.includes('/whythisad')) {
                    var parser = new DOMParser();
                    var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                    var outer_element = htmlDoc.getElementsByClassName("Xkwrgc"); //Xkwrgc EmJRVd
                    const temp = new Set()
                    for (var i = 0; i < outer_element.length; i++) {
                      temp.add(outer_element[i].outerText)
                    }
                    ad_info.explanation = Array.from(temp);
                    // alert(ad_info.explanation + "--" + message.article.ad_explanation)
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



            })
            .catch(function(err) {
              //handle error
              console.log("ERROR on axios url grab", err, message.article.ad_landing_page_long)

              // alert("INNER Grab - ERROR -" + err + " -- " + "attempting to " +  message.article.ad_landing_page_long)
              console.log("INNER Grab - ERROR -" + err + " -- " + "attempting to " + message.article.ad_landing_page_long)
              // error likely occurs because the webpage is pulled from a script tag redirect
              console.log("script based redirect")
              console.log(Pattern.UrlArea.normalizeUrl(message.article.ad_landing_page_long))
              console.log(Pattern.UrlArea.normalizeUrl(backup_string))
              // onlyParamsJsn url 
              // onlyParamsJsn rdct_url
              // onlyParamsJsn adurl
              // what if we logged the information anyways
              console.log("sending ad to database anyways, without full information")
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


            });

        }

        }

        return true; // must do since calling sendResponse asynchronously
}

// async function maybeDashboardNudge () {
//   const store = await browser.storage.local.get(['startTS', 'lastNudgeShown'])
//   const startTS = store.startTS || undefined
//   const lastNudgeShown = store.lastNudgeShown || 0
//   if (!startTS) {
//     return
//   }
//   const now = Date.now()
//   const day = 24 * 60 * 60 * 1000
//   // const day = 20000
//   if (now > startTS + 4 * day && now < startTS + 5 * day) {
//     // day 4
//     if (lastNudgeShown < 4) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 4})
//     }
//   } else if (now > startTS + 5 * day && now < startTS + 6 * day) {
//     // day 5
//     if (lastNudgeShown < 5) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 5})
//     }
//   } else if (now > startTS + 6 * day && now < startTS + 7 * day) {
//     // day 6
//     if (lastNudgeShown < 6) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 6})
//     }
//   }
// }

// async function dashboardNudgeNotification () {
//   await browser.notifications.create({
//     type: 'basic',
//     title: EXT.NAME,
//     message: 'Click to learn more about your web browsing!',
//     iconUrl: '/icons/logo.svg'
//   })
// }

async function openDashboard () {
  const dashboardData = {
    active: true,
    url: browser.runtime.getURL('dist/dashboard.html')
  }
  await browser.tabs.create(dashboardData)
}

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
          // alert(key + " -> " + data[key])

          const cat = data['categories']

          for (var specific_category of Object.keys(cat)) {
            // alert(specific_category + "---->" + JSON.stringify(cat[specific_category]))

            let target_entity_wrapper = cat[specific_category]

            for (var iterative_entity_list of Object.keys(target_entity_wrapper)) {
              // alert(specific_category + "---->" + JSON.stringify(target_entity[iterative_entity_list]))

              let site_wrapper = target_entity_wrapper[iterative_entity_list]

              for (var website of Object.keys(site_wrapper)) {
                // alert(specific_category + "--" + website + "---->" + JSON.stringify(site_wrapper[website]))

                let domain_wrapper = site_wrapper[website]

                for (var domain_list_long of Object.keys(domain_wrapper)) {
                  // alert(specific_category + "--" + website + "--" + domain_list)

                  let list_long = domain_wrapper[domain_list_long]

                  // alert(specific_category + "---" + website + "--" + domain_list_long + "--" + list_long)
                  
                  // name = website
                  // site = domain_list_long
                  // type = specific_category
                  // domains = list_long

                  // alert(website + "--" + tldjs.parse(domain_list_long).hostname + "--" + specific_category + "--" + list_long)

                  let entry = {
                    site: tldjs.parse(domain_list_long).hostname,
                    type: specific_category,
                    domains: list_long,
                  };

                  // alert(JSON.stringify(entry))
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
  const response = fetch('https://developers.google.com/google-ads/api/data/tables/verticals.csv')
   .then(response => response.text())
   .then(v => Papa.parse(v))
   .catch(err => console.log(err))

  response.then(
    v => {
    	console.log("[+] fetching updated google ad words list (https://developers.google.com/google-ads/api/data/tables/verticals.csv)")
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
  }
  const response = fetch(path_provided)
   .then(response => response.text())
   .catch(err => console.log(err))

  response.then(
    v => {

            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(v, 'text/html');
            // console.log(htmlDoc);

            let email; 
            let name;

            // get name 
            var outer_name = htmlDoc.getElementsByClassName("gb_8d");  //JRGAPc
            for(var p = 0; p < outer_name.length; p++) {
                let subs = outer_name[p].getElementsByTagName('*');
                for (var z = 0; z < subs.length; z++) {
                    if (subs[z].textContent !== 'Google Account') {
                        if (subs[z].textContent.includes("@")) {
                            email = subs[z].textContent
                        } else {
                            name = subs[z].textContent
                        }
                    }
                    
                }
            }

            // get interests and demographics
			const info = new Array()


			var outer_outer = htmlDoc.getElementsByClassName("JRGAPc");  //JRGAPc

			for(var i = 0;i < outer_outer.length; i++){

			  // console.log(outer_outer[i])
			  let subs = outer_outer[i].getElementsByTagName('*');

			  let key; 
			  let value;

			  for (var q = 0; q < subs.length; q++) {
			    // console.log(subs[q])

			    if (subs[q].className == 'lSvC9c ') {
			      // this is an interest or demographic //console.log(subs[q].src.split('/')[6])
			      key = "-"
			    } else if (subs[q].className.includes('lSvC9c')) {
			      key = "interest - company"
			    } if (subs[q].className == 'c7O9k') {
			      value = subs[q].textContent
			    }

			    if (value !== undefined && key !== undefined) {

                  // console.log(key + '__' + value)

			      var entry = new Object();
			      entry = {
			      	"type": key,
			      	"value": value,
			      }
			      // entry[key] = value
			      // alert(entry)
			      info.push(entry)
			    }

			  }
			}

            if(typeof name !== "undefined") {
                info.push({"type": 'my_name', "value": name})
            }
            if(typeof email !== "undefined") {
                info.push({"type": 'my_email', "value": email})
            }
            

			// console.log(info)

			// there is no pageId because user didn't actually visit this site
			// we create one 
			// runtime won't activate until we visit pages, which we can't assume, so we have to duplicate work here
			// chrome.runtime.sendMessage({ type: 'google_inference_done', article: info, pageId: Date.now() });
			console.log("[+] attempting google inference from (" + path_provided + ")")
			// console.log(info)
			if (info.length !== 0) {
				let message = {article: info, pageId: Date.now()}
				log_google_inference(message)
			}


	  }

  )

}


// anytime you start or stop chrome
window.onload = function() {
    // clear out telemetry on viewing
    localStorage.removeItem("viewing") 
    // get most current ad list from google 
    update_google_ad_list();
    // get most current ad server list from providers 
    load_list2();
    // get most current trackers list from disconnect
    update_tracker_list();

};

