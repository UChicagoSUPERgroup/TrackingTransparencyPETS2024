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

browser.runtime.onConnect.addListener(runtimeOnConnect);
browser.runtime.onMessage.addListener(onContentScriptMessage);
databaseWorker.onmessage = onDatabaseWorkerMessage;
trackersWorker.onmessage = onTrackersWorkerMessage;

let portFromPopup;
let portFromInfopage;
/** 
 * listener function to run when connection is made with popup or infopage
 *
 * @param  {Object} p - port object
 * @param {string} p.name - name of port object
 */
async function runtimeOnConnect(p) {

  if (p.name === "port-from-popup") {
    portFromPopup = p;
    portFromPopup.onMessage.addListener(messageListener);

  } else if (p.name === "port-from-infopage") {
    portFromInfopage = p;
    portFromInfopage.onMessage.addListener(messageListener);
  }

}

let pendingPopupQueries = {};
let pendingInfopageQueries = {};
/** listener for messags from popup and infopage
 *
 * @param  {Object} m - message
 */
async function messageListener(m) {

  let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  let activeTab = activeTabs[0];

  if (m.type === "get_tab_data") {

    if (typeof tabData[m.tabId] == 'undefined') {
      if (m.src === "popup") {
        portFromPopup.postMessage({
          id: m.id,
          type: "tab_data_response",
          response: {
            error: "No tab data"
          }
        });
      }

    } else {

      let data = tabData[m.tabId];

      await updateTrackers(m.tabId);

      data.inference = "Warehousing";

      if (m.src === "popup") {
        portFromPopup.postMessage({
          id: m.id,
          type: "tab_data_response",
          response: data
        });
      }
    }

  } else if (m.type === "database_query") {
    if (m.src === "popup") {
      let queryPromise = new Promise((resolve, reject) => {
        pendingPopupQueries[m.id] = resolve;
      });

      databaseWorker.postMessage({
        id: m.id,
        type: m.type,
        src: m.src,
        query: m.query,
        args: m.args
      })

      let res = await queryPromise;
      portFromPopup.postMessage(res);
    } else if (m.src === "infopage") {
      let queryPromise = new Promise((resolve, reject) => {
        pendingInfopageQueries[m.id] = resolve;
      });

      databaseWorker.postMessage({
        id: m.id,
        type: m.type,
        src: m.src,
        query: m.query,
        args: m.args
      })

      let res = await queryPromise;
      portFromInfopage.postMessage(JSON.stringify(res));
    }
  }

}

/* listener for messages recieved from database worker */
function onDatabaseWorkerMessage(m) {
  // console.log('Message received from database worker', m);
  if (m.data.type === "database_query_response") {
    if (m.data.dst === "background-debug") {
      pendingDirectQueries[m.data.id](m.data);
    } else if (m.data.dst === "popup") {
      pendingPopupQueries[m.data.id](m.data);
    } else if (m.data.dst === "infopage") {
      pendingInfopageQueries[m.data.id](m.data);
    }
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


let pendingDirectQueries = {};
let directQueryId = 0;
/** function to make direct queries to database from background script
 *
 * used for debugging
 *
 * @param  {string} query - name of query
 * @param  {Object} args - arguments for query
 */
async function directQuery(query, args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingDirectQueries[directQueryId] = resolve;
  });

  databaseWorker.postMessage({
    id: directQueryId,
    type: "database_query",
    src: "background-debug",
    query: query,
    args: args
  });
  directQueryId++;

  let res = await queryPromise;
  return res.response;
}
