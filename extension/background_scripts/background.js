/** @module background */

// let tabRequestMap = {};
// let mainFrameRequestInfo = {};
let tabData = {};

/* web workers setup */
let trackersWorker = new Worker('../web_workers/trackers_worker.js');
let databaseWorker = new Worker('../web_workers/database_worker.js');
let inferencingWorker = new Worker('../dist/inferencing.js');

/* connect database worker and trackers worker */
/* this involves creating a MessageChannel and passing a message with
 * the channel to each worker */
const trackerDatabaseChannel = new MessageChannel();
trackersWorker.postMessage({type: "database_worker_port", port: trackerDatabaseChannel.port1}, [trackerDatabaseChannel.port1]);
databaseWorker.postMessage({type: "trackers_worker_port", port: trackerDatabaseChannel.port2}, [trackerDatabaseChannel.port2]);

/* connect database worker and inferencing worker */
const inferencingDatabaseChannel = new MessageChannel();
inferencingWorker.postMessage({type: "database_worker_port", port: inferencingDatabaseChannel.port1}, [inferencingDatabaseChannel.port1]);
databaseWorker.postMessage({type: "inferencing_worker_port", port: inferencingDatabaseChannel.port2}, [inferencingDatabaseChannel.port2]);

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

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);


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

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId);

  }

  /* take time stamp and use as ID for main frame page load
   * store in object to identify with tab */
  const mainFrameReqId = details.timeStamp;
  let parsedURL = parseUri(details.url);
  const tab = await browser.tabs.get(details.tabId);
  tabData[details.tabId] = {
    pageId: mainFrameReqId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: tab.title,
    webRequests: []
  }

  databaseWorker.postMessage({
    type: "store_page",
    info: tabData[details.tabId]
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
    console.log("we tried to clear tab data for a tab we didn't have any data about");
  }

  trackersWorker.postMessage({
    type: "tab_data",
    tabData: tabData[tabId]
  });

  tabData[tabId] = null;
}

/* set listener functions */
browser.webNavigation.onCommitted.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);
browser.tabs.onRemoved.addListener(clearTabData);



/* message listener for trackers worker */
trackersWorker.onmessage = function(e) {
  console.log('Message received from trackers worker');
}

/** listener function for messages from content script
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 */
async function onContentScriptMessage(message, sender) {
  switch (message.type) {
    case "parsed_page":

        if (!sender.tab || !sender.url || sender.frameId !== 0) {
        // message didn't come from a tab, so we ignore
        return;
      }

      const mainFrameReqId = tabData[sender.tab.id].pageId;
      // const info = mainFrameRequestInfo[mainFrameReqId];

      inferencingWorker.postMessage({
        type: "content_script_to_inferencing",
        article: message.article,
        mainFrameReqId: mainFrameReqId
      })
      break;
  }
}
browser.runtime.onMessage.addListener(onContentScriptMessage);
