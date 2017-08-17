/** @module background */

import parseuri from "parseuri";

import {trackersWorker, databaseWorker, inferencingWorker} from "workers_setup.js";

let tabData = {};

/* set listener functions */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

browser.tabs.onRemoved.addListener(clearTabData);

browser.runtime.onMessage.addListener(onContentScriptMessage);

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
      !details.url.startsWith("http")) {
    // not a user-initiated page change
    return;
  }
  // console.log("updateMainFrameInfo", details);
  // console.log("page has changed, so we make make a new page record");

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId);

  }

  /* take time stamp and use as ID for main frame page load
   * store in object to identify with tab */
  const tab = await browser.tabs.get(details.tabId);
  // console.log(tab.title);
  recordNewPage(details.tabId, details.url, tab.title);
}


/// function not used - don't delete just yet until we're sure we don't need to listen to tab events
// browser.tabs.onUpdated.addListener(onTabUpdate);

// async function onTabUpdate(tabId, changeInfo, tab) {
//   console.log("onTabUpdate", tabId, changeInfo, tab);
//   // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/onUpdated

//   if (tabId === -1  || 
//       tabId === browser.tabs.TAB_ID_NONE ||
//       !tab.url.startsWith("http")) {
//     // not a user-initiated page change
//     return;
//   }

//   if (changeInfo.title && tab.url) {
//     console.log("title change");
    
//     // title update, so we update database
//     tabData[tabId].title = changeInfo.title;
//     console.log("storing title update to database");
//     databaseWorker.postMessage({
//       type: "store_page",
//       info: tabData[tabId]
//     });
//   }
// }

function recordNewPage(tabId, url, title) {
  const pageId = Date.now();
  let parsedURL = parseuri(url);
  tabData[tabId] = {
    pageId: pageId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: title,
    webRequests: []
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
  }

  trackersWorker.postMessage({
    type: "tab_data",
    tabData: tabData[tabId]
  });

  tabData[tabId] = null;
}

/* message listener for trackers worker */
// trackersWorker.onmessage = function(m) {
//   // console.log('Message received from trackers worker');
// }

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
      // const info = mainFrameRequestInfo[mainFrameReqId];

      inferencingWorker.postMessage({
        type: "content_script_to_inferencing",
        article: message.article,
        mainFrameReqId: pageId
      })
      break;
  }
}
