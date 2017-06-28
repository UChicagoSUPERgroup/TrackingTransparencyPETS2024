let portFromPopup;
let portFromInfopage;

async function connected(p) {

  if (p.name === "port-from-popup") {
    portFromPopup = p;
    portFromPopup.onMessage.addListener(messageListener);
  } else if (p.name === "port-from-infopage") {
    portFromInfopage = p;
    portFromInfopage.onMessage.addListener(messageListener);
  }
    
}

async function messageListener(m) {
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
  const inferences = await getInferencesByTracker(domain);
  return {
    type: "tracker_most_pages",
    tracker: domain,
    trackerName: services[domain].name,
    count: count,
    inferences: inferences
  }
}


browser.runtime.onConnect.addListener(connected);
