/** @module background */

import parseuri from 'parseuri';

import {trackersWorker, databaseWorker, inferencingWorker} from './workers_setup';
import userstudy from './userstudy';
import tt from '../helpers';


userstudy.setDefaultOptions();

let tabData = {};

let pendingTrackerMessages = {};
let trackerMessageId = 0;


/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

browser.tabs.onRemoved.addListener(clearTabData);


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
    recordNewPage(details.tabId, details.url, tab.title);
  } catch (err) {
    tt.log('can\'t updateMainFrame info for tab id', details.tabId);
  }
}

function recordNewPage(tabId, url, title) {
  const pageId = Date.now();
  let parsedURL = parseuri(url);
  tabData[tabId] = {
    pageId: pageId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: title,
    webRequests: [],
    trackers: []
  }

  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  });
}

/**
 * Clears tabData info for a tab.
 * Called when page changed/reloaded or tab closed.
 * 
 * @param  {} tabId - tab's id
 */
function clearTabData(tabId) {
  if (!tabData[tabId]) {
    // tt.log("we tried to clear tab data for a tab we didn't have any data about");
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
  return;
}


/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// browser.runtime.onConnect.addListener(runtimeOnConnect);
browser.runtime.onMessage.addListener(runtimeOnMessage);
databaseWorker.onmessage = onDatabaseWorkerMessage;
trackersWorker.onmessage = onTrackersWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 * 
 * @param  {number} tabId
 */
async function getTabData(tabId) {
  if (typeof tabData[tabId] == 'undefined') {
      return null;

  } else {

    let data = tabData[tabId];

    await updateTrackers(tabId);

    data.inference = 'Warehousing';

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

let queryId = 0;
let pendingDatabaseQueries = {};

/**
 * Sends database query message to database worker, waits for response, returns result.
 * 
 * @param  {string} query - name of query
 * @param  {Object} args - arguments object passed to database worker
 */
async function queryDatabase(query, args) {
  let queryPromise = new Promise((r) => {
    pendingDatabaseQueries[queryId] = r;
  });

  databaseWorker.postMessage({
    type: 'database_query',
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  let res = await queryPromise;
  return res.response;
}
window.queryDatabase = queryDatabase; // exposes function to other extension components 

/**
 * Run on message recieved from database worker.
 * 
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 */
function onDatabaseWorkerMessage(m) {
  // tt.log('Message received from database worker', m);
  if (m.data.type === 'database_query_response') {
    pendingDatabaseQueries[m.data.id](m.data);
  }
}

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
  // tt.log('Message received from database worker', m);
  if (m.data.type === 'trackers') {
      pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}


/** 
 * listener function for messages from content script
 * 
 * this function can NOT be an async function - if it is sendResponse won't work
 * 
 * if the response is the result of an async function (like queryDatabase),
 * you must put sendRsponse in .then(), and also have the original function return true
 * 
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * 
 */
function runtimeOnMessage(message, sender, sendResponse) {
  let pageId;
  let query;
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
        mainFrameReqId: pageId
      })
      break;
    
    case 'queryDatabase':
      query = queryDatabase(message.query, message.args);
      query.then(res => { // cannot use async/await
        sendResponse(res);
      })
      return true; // this tells browser that we will call sendResponse asynchronously
    }

}


/* OTHER MISCELLANEOUS FUNCTIONS */
/* ============================= */

if (typeof browser.browserAction.setPopup === 'undefined') { 
    // popups not supported
    // like firefox for android
    // so we directly open infopage instead
    browser.browserAction.onClicked.addListener(() => {
      let infopageData = {
        active: true,
        url: '../dashboard/index.html'
        };
      browser.tabs.create(infopageData);
    });
}