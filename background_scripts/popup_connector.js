var portFromPopup;

async function connected(p) {
  portFromPopup = p;
  // portFromPopup.postMessage({greeting: "connected"});
  portFromPopup.onMessage.addListener(async function(m) {
    let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
    let activeTab = activeTabs[0];

    const mainFrameReqId = tabRequestMap[activeTab.id];
    const info =  mainFrameRequestInfo[mainFrameReqId];

    switch (m.type) {
      case "request_info_current_page":
        if (!info.title) {
          info.title = activeTab.title;
        }
        portFromPopup.postMessage({
          type: "info_current_page",
          info: info
        });
    }
  });
}

browser.runtime.onConnect.addListener(connected);
