var portFromPopup;

async function connected(p) {
  portFromPopup = p;
  // portFromPopup.postMessage({greeting: "connected"});
  portFromPopup.onMessage.addListener(async function(m) {
    let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
    let activeTab = activeTabs[0];

    const mainFrameReqId = tabRequestMap[activeTab.id];
    const info =  mainFrameRequestInfo[mainFrameReqId];

    let msg;
    switch (m.type) {
      case "request_info_current_page":
        if (!info.title) {
          info.title = activeTab.title;
        }
        portFromPopup.postMessage({
          type: "info_current_page",
          info: info
        });
        break;
      case "get_tracker_most_pages":
        msg = await getTrackerMostPages(info)
        portFromPopup.postMessage(msg);
        break;
    }
  });
}

async function getTrackerMostPages(info) {
  let domain;
  let count = 0;
  for (let tracker of info.trackers) {
    const query = await getPageVisitCountByTracker(tracker);
    if (query > count) {
      domain = tracker;
      count = query;
    }
  }
  return {
    type: "tracker_most_pages",
    tracker: domain,
    count: count
  }
}


browser.runtime.onConnect.addListener(connected);
