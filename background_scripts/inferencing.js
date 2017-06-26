import buildCategoryTree from "build.js";
import infer from "infer.js";

/* inferred data stored as object with structure:
 * url: inference
 */
let inferredData = {}

var tree = buildCategoryTree("../inferencing/data/categories.json");

function inferencingMessageListener(message, sender) {
  if (!sender.tab || !sender.url || sender.frameId !== 0) {
    // message didn't come from a tab, so we ignore
    return;
  }

  const mainFrameReqId = tabRequestMap[sender.tab.id];
  if (mainFrameReqId && mainFrameRequestInfo[mainFrameReqId].title === "") {
    mainFrameRequestInfo[mainFrameReqId].title = sender.tab.title;
  }
  // console.log(message);

  infer(message.html, tree);

  mainFrameRequestInfo[mainFrameReqId].inference = "Hello!"
}

browser.runtime.onMessage.addListener(inferencingMessageListener);
