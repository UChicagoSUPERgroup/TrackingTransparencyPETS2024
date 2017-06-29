let tabRequestMap = {};
let mainFrameRequestInfo = {};

/* web workers setup */

let trackersWorker = new Worker('/web_workers/trackers_worker.js');
let databaseWorker = new Worker('/web_workers/database_worker.js');

const channel = new MessageChannel();
trackersWorker.postMessage({type: "database_worker_port", port: channel.port1}, [channel.port1]);
databaseWorker.postMessage({type: "trackers_worker_port", port: channel.port2}, [channel.port2]);

async function logRequest(details) {

  // let mainFrameReqId;
  if (details.type === "main_frame") {
    // // set new page id
    // mainFrameReqId = details.timeStamp;
    // tabRequestMap[details.tabId] = mainFrameReqId;
    // updateMainFrameInfo(details);
    return;
  }

  details.parentRequestId = tabRequestMap[details.tabId];

  // requestsQueue.push(details);
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
    return;
  }

  const mainFrameReqId = details.timeStamp;
  tabRequestMap[details.tabId] = mainFrameReqId;

  const tab = await browser.tabs.get(details.tabId);

  // let parsedURL = document.createElement('a');
  let parsedURL = parseUri(details.url);
  // console.log(parsedURL);
  mainFrameRequestInfo[mainFrameReqId] = {
    url: details.url,
    pageId: mainFrameReqId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: tab.title,
    trackers: []
  }

  // trackersWorker.postMessage({
  //   type: "main_frame_update",
  //   details: details
  // });

  databaseWorker.postMessage({
    type: "store_page",
    info: mainFrameRequestInfo[mainFrameReqId]
  });

}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

browser.webNavigation.onCommitted.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

// browser.webNavigation.onDOMContentLoaded.addListener(details => {
  // console.log("webNavigation onDOMContentLoaded");
// });

trackersWorker.onmessage = function(e) {
  console.log('Message received from trackers worker');
}
databaseWorker.onmessage = function(e) {
  console.log('Message received from database worker');
}
