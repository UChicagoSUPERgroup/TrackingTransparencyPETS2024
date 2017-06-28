let tabRequestMap = {};
let mainFrameRequestInfo = {};

let trackersWorker = new Worker('/background_scripts/trackers_worker.js')

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
  console.log("webNavigation onCommitted - url:", details.url, "id:", mainFrameReqId);

  const tab = await browser.tabs.get(details.tabId);

  let parsedURL = document.createElement('a');
  parsedURL.href = details.url;
  mainFrameRequestInfo[mainFrameReqId] = {
    url: details.url,
    pageId: mainFrameReqId,
    domain: parsedURL.hostname,
    path: parsedURL.pathname,
    protocol: parsedURL.protocol,
    title: tab.title,
    trackers: []
  }
  storePage(mainFrameRequestInfo[mainFrameReqId]);
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


