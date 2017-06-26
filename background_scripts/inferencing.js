
/* inferred data stored as object with structure:
 * url: inference
 */
let inferredData = {}
var _inference = ""
var _inferenceCat = ""
var _inferenceThreshold = 0


function mockData () {
  _inference = "Hello";
  _inferenceCat = "Hello again";
  _inferenceThreshold = 1;

}

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

  mainFrameRequestInfo[mainFrameReqId].inference = "Hello!";
}

browser.runtime.onMessage.addListener(inferencingMessageListener);
