/** @module background */

import parseuri from "parseuri";

import {trackersWorker, databaseWorker, inferencingWorker} from "workers_setup.js";

let tabData = {};

let pendingTrackerMessages = {};
let trackerMessageId = 0;


/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

browser.tabs.onRemoved.addListener(clearTabData);


/** sends a message with information about each outgoing
 * web request to trackers worker
 * 
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest(details) {

  if (details.type === "main_frame") {
    // for main frame page loads, ignore
    return;
  }

  if (tabData[details.tabId]) {
    tabData[details.tabId].webRequests.push(details);
  }
}

/** called by listeners when user navigates to a new page
 * 
 * creates a new page id, associates page with the current tab, sends info about page to database worker
 * 
 * @param  {Object} details - object from onBeforeRequest or onHistoryStateUpdated listener
 * @param {Number} details.frameId - frame id (should be 0 for main frame)
 * @param {Number} details.tabId - tab id
 * @param {string} details.url - url
 * @param {Number} details.timeStamp - timestamp
 */
async function updateMainFrameInfo(details) {

  if (details.frameId !== 0 || 
      details.tabId === -1  || 
      details.tabId === browser.tabs.TAB_ID_NONE ||
      !details.url.startsWith("http") ||
      details.url.includes("_/chrome/newtab")) {
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
    console.log("can't updateMainFrame info for tab id", details.tabId);
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
    type: "store_page",
    info: tabData[tabId]
  });
}

/**
 * clears tabData info for a tab
 * called when page changed/reloaded or tab closed
 * 
 * @param  {} tabId - tab's id
 */
function clearTabData(tabId) {
  if (!tabData[tabId]) {
    // console.log("we tried to clear tab data for a tab we didn't have any data about");
    return;
  }

  trackersWorker.postMessage({
    type: "page_changed",
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

  let messagePromise = new Promise((resolve, reject) => {
    pendingTrackerMessages[trackerMessageId] = resolve;
  });

  trackersWorker.postMessage({
    id: trackerMessageId,
    type: "push_webrequests",
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
browser.runtime.onMessage.addListener(onContentScriptMessage);
databaseWorker.onmessage = onDatabaseWorkerMessage;
trackersWorker.onmessage = onTrackersWorkerMessage;

// -/** 
// - * listener function to run when connection is made with popup or infopage
// - * if we wanted to implement messaging between popup/dashboard and background we would do it here
// - *
// - * @param  {Object} p - port object
// - * @param {string} p.name - name of port object
// - */
// -async function runtimeOnConnect(p) {
// }

async function getTabData(tabId) {
  if (typeof tabData[tabId] == 'undefined') {
      return null;

  } else {

    let data = tabData[tabId];

    await updateTrackers(tabId);

    data.inference = "Warehousing";

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

let queryId = 0;
let pendingDatabaseQueries = {};
async function queryDatabase(query,args) {
  let queryPromise = new Promise((resolve) => {
    pendingDatabaseQueries[queryId] = resolve;
  });

  databaseWorker.postMessage({
    type: "database_query",
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  let res = await queryPromise;
  return res.response;
}
window.queryDatabase = queryDatabase; // exposes function to other extension components 

/* listener for messages recieved from database worker */
function onDatabaseWorkerMessage(m) {
  // console.log('Message received from database worker', m);
  if (m.data.type === "database_query_response") {
    pendingDatabaseQueries[m.data.id](m.data);
  }
}

function onTrackersWorkerMessage(m) {
  // console.log('Message received from database worker', m);
  if (m.data.type === "trackers") {
      pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}


/** listener function for messages from content script
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 */
async function onContentScriptMessage(message, sender) {
  let pageId;
  switch (message.type) {
    case "parsed_page":

        if (!sender.tab || !sender.url || sender.frameId !== 0) {
        // message didn't come from a tab, so we ignore
        return;
      }

      pageId = tabData[sender.tab.id].pageId;

      inferencingWorker.postMessage({
        type: "content_script_to_inferencing",
        article: message.article,
        mainFrameReqId: pageId
      })
      break;
  }
}

/* OTHER MISCELLANEOUS FUNCTIONS */
/* ============================= */

if (typeof browser.browserAction.setPopup === "undefined") { 
    // popups not supported
    // like firefox for android
    // so we directly open infopage instead
    browser.browserAction.onClicked.addListener((tab) => {
      let infopageData = {
        active: true,
        url: "../infopage/index.html"
        };
      browser.tabs.create(infopageData);
    });
}