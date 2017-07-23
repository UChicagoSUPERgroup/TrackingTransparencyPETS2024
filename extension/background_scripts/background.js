let tabRequestMap = {};
let mainFrameRequestInfo = {};

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

async function logRequest(details) {

  if (details.type === "main_frame") {
    // for main frame page loads, ignore
    return;
  }

  details.parentRequestId = tabRequestMap[details.tabId];

  // send web request details to trackers worker
  trackersWorker.postMessage({
    type: "new_webrequest",
    details: details
  });
}

// called by either onBeforeRequest or onHistoryStateUpdated listener
// accepts details object from either one
async function updateMainFrameInfo(details) {

  if (details.frameId !== 0 || 
      details.tabId === -1  || 
      details.tabId === browser.tabs.TAB_ID_NONE ||
      !details.url.startsWith("http")) {
    // not a user-initiated page change
    return;
  }

  // take time stamp and use as ID for main frame page load
  // store in object to identify with tab
  const mainFrameReqId = details.timeStamp;
  tabRequestMap[details.tabId] = mainFrameReqId;

  const tab = await browser.tabs.get(details.tabId);

  let parsedURL = parseUri(details.url);
  mainFrameRequestInfo[mainFrameReqId] = {
    url: details.url,
    pageId: mainFrameReqId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: tab.title,
  }

  // tell trackers worker about main frame update
  // so it can update its tabRequestMap equivalent
  trackersWorker.postMessage({
    type: "main_frame_update",
    details: {
      tabId: details.tabId,
      mainFrameReqId: mainFrameReqId
    }
  });

  databaseWorker.postMessage({
    type: "store_page",
    info: mainFrameRequestInfo[mainFrameReqId]
  });

}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

// listeners to run updateMainFrameInfo when page changes
browser.webNavigation.onCommitted.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

trackersWorker.onmessage = function(e) {
  console.log('Message received from trackers worker');
}

// message from content script
async function onContentScriptMessage(message, sender) {
  switch (message.type) {
    case "parsed_page":

        if (!sender.tab || !sender.url || sender.frameId !== 0) {
        // message didn't come from a tab, so we ignore
        return;
      }

      const mainFrameReqId = tabRequestMap[sender.tab.id];
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


// TODO: clean data out of memory when tab closed
// also for trackers worker
