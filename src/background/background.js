/** @module background */

import tldjs from 'tldjs';

import {trackersWorker, databaseWorker, inferencingWorker, queryDatabase} from './worker_manager';
import overlayManager from './overlay_manager';
import instrumentation from './instrumentation';
import { getOption } from '../helpers';
import setDefaultOptions from '../options/defaults'

let tabData = {};

let pendingTrackerMessages = {};
let trackerMessageId = 0;

async function onInstall(details) {
  // also runs on update
  if (details.reason === 'install') {
    setDefaultOptions()
    instrumentation.firstInstall();

    const welcomePageData = {
      active: true,
      url: '../dist/welcome.html'
    }

    await browser.tabs.create(welcomePageData)
  }
}
browser.runtime.onInstalled.addListener(onInstall)

// set up instrumentation
instrumentation.setup()

/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping() {
  return 'ping'
}
window.ping = ping;

/* listener for all outgoing web requests */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

/* listener for tab close */
browser.tabs.onRemoved.addListener(clearTabData);

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish);


/** Sends a message with information about each outgoing
 * web request to trackers worker.
 *
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest(details) {

  if (details.type === 'main_frame') {
    // for main frame page loads, ignore
    return;
  }

  if (tabData[details.tabId]) {
    tabData[details.tabId].webRequests.push(details);
  }
}

/** Called by listeners when user navigates to a new page
 *
 * Creates a new page id, associates page with the current tab, sends info about page to database worker.
 *
 * @param  {Object} details - object from onBeforeRequest or onHistoryStateUpdated listener
 * @param {number} details.frameId - frame id (should be 0 for main frame)
 * @param {number} details.tabId - tab id
 * @param {string} details.url - url
 * @param {number} details.timeStamp - timestamp
 */
async function updateMainFrameInfo(details) {

  if (details.frameId !== 0 ||
      details.tabId === -1  ||
      details.tabId === browser.tabs.TAB_ID_NONE ||
      !details.url.startsWith('http') ||
      details.url.includes('_/chrome/newtab')) {
    // not a user-initiated page change
    return;
  }

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId);

  }

  /* take time stamp and use as ID for main frame page load
   * store in object to identify with tab */
  try {
    const tab = await browser.tabs.get(details.tabId);
    if (tab.hasOwnProperty('favIconUrl')){
      recordNewPage(details.tabId, details.url, tab.title, tab.favIconUrl);
    }
    else{
      recordNewPage(details.tabId, details.url, tab.title, '');
    }
  } catch (err) {
    console.log("can't updateMainFrameInfo for tab id", details.tabId);
  }
}

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/

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

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
async function getFavicon(url) {
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    return checkFav[x]['favicondata'];
  }
  return ''
}
window.getFavicon=getFavicon;

/**
 * creates a new record for the tab in database and tabData object
 * the tabData object stores basic info about the tab in memory
 *
 * @param  {number} tabId
 * @param  {string} url
 * @param  {string} title
 * @param  {string} faviconUrl
 */
function recordNewPage(tabId, url, title, faviconUrl) {
  const pageId = Date.now();
  let urlObj = new URL(url);

  let domain = tldjs.getDomain(urlObj.hostname);
  domain = domain ? domain : urlObj.hostname; // in case above line returns null

  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: domain,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    title: title,
    webRequests: [],
    trackers: []
  };

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  });
  //now fetch and store the favicon database
  fetchSetGetFavicon(url, faviconUrl)
}

/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 *
 * @param  {number} tabId - tab's id
 */
function clearTabData(tabId) {
  if (!tabData[tabId]) {
    return;
  }

  trackersWorker.postMessage({
    type: 'page_changed',
    oldPageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests
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
async function updateTrackers(tabId) {
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
    webRequests: tabData[tabId].webRequests
  });
  trackerMessageId++;
  tabData[tabId].webRequests = [];

  let trackers = await messagePromise;
  tabData[tabId].trackers = trackers;
}

async function onPageLoadFinish(details) {
  if (details.frameId === 0) {
    // not an iframe
    const tabId = details.tabId
    chrome.tabs.sendMessage(tabId, {
      type: 'make_inference'
    })

    const data = await getTabData(tabId)
    const showOverlay = await getOption('showOverlay')
    if (showOverlay === true) {
      overlayManager.createOrUpdate(tabId, data)
    }
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
async function getTabData(tabId) {
  if (typeof tabData[tabId] == 'undefined') {
    return null;

  } else {

    let data = tabData[tabId];

    await updateTrackers(tabId);

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components



/**
 * facilitates bulk import of data
 * takes in JSON of data to import, passes to database
 *
 * @param  {Object} dataString - JSON with data to import
 */
async function importData(dataString) {
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
function resetAllData() {
  databaseWorker.postMessage({
    type: 'empty_db'
  })

  setDefaultOptions();

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
function onTrackersWorkerMessage(m) {
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}


async function onInferencingWorkerMessage(m) {
  const tabId = m.data.info.tabId;
  if (m.data.type === 'page_inference') {
    tabData[tabId].inference = m.data.info.inference;
  }
  const showOverlay = await getOption('showOverlay')
  if (showOverlay === true) {
    overlayManager.createOrUpdate(tabId, tabData[tabId])
  }
}

/**
 * listener function for messages from content script
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 *
 */
function runtimeOnMessage(message, sender, sendResponse) {
  let pageId;
  let query, tabDataRes;
  // sendResponse('swhooo');
  switch (message.type) {
  case 'parsed_page':

    if (!sender.tab || !sender.url || sender.frameId !== 0) {
      // message didn't come from a tab, so we ignore
      break;
    }
    if (!tabData[sender.tab.id]) break;
    pageId = tabData[sender.tab.id].pageId;

    inferencingWorker.postMessage({
      type: 'content_script_to_inferencing',
      article: message.article,
      mainFrameReqId: pageId,
      tabId: sender.tab.id
    });
    break;

  case 'queryDatabase':
    query = queryDatabase(message.query, message.args);
    query.then(res => sendResponse(res));
    return true; // must do since calling sendResponse asynchronously

  case 'getTabData':
    tabDataRes = getTabData(sender.tab.id);
    tabDataRes.then(res => sendResponse(res));
    return true; // must do since calling sendResponse asynchronously
  }
}
