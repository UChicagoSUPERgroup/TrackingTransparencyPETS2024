/* inferred data stored as object with structure:
 * url: inference
 */
let inferredData = {}

function inferencingMessageListener(message, sender) {
  if (!sender.tab || !sender.url) {
    // message didn't come from a tab, so we ignore
    return;
  }

  const mainFrameReqId = tabRequestMap[sender.tab.id];
  if (mainFrameReqId && mainFrameRequestInfo[mainFrameReqId].title === "") {
    mainFrameRequestInfo[mainFrameReqId].title = sender.tab.title;
  }
  // console.log(message);

  mainFrameRequestInfo[mainFrameReqId].inference = "Hello!"
}

browser.runtime.onMessage.addListener(inferencingMessageListener);
