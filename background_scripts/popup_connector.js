var portFromPopup;

async function connected(p) {
  portFromPopup = p;
  // portFromPopup.postMessage({greeting: "connected"});
  portFromPopup.onMessage.addListener(async function(m) {
    switch (m.type) {
      case "request_inference_current_page":
        let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
        let activeTab = activeTabs[0];

        const mainFrameReqId = tabRequestMap[activeTab.id];
        const inference = mainFrameRequestInfo[mainFrameReqId].inference;

        portFromPopup.postMessage({
          type: "inference_current_page",
          inference: inference
        });
    }
  });
}

browser.runtime.onConnect.addListener(connected);
