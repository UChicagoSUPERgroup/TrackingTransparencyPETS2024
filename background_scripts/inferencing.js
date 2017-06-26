import buildCategoryTree from "build.js";
import infer from "infer.js";

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

let tree = buildCategoryTree("../src/inferencing/data/categories.json");

async function inferencingMessageListener(message, sender) {

  let tr = await tree;

  if (!sender.tab || !sender.url || sender.frameId !== 0) {
    // message didn't come from a tab, so we ignore
    return;
  }

  const mainFrameReqId = tabRequestMap[sender.tab.id];
  if (mainFrameReqId && mainFrameRequestInfo[mainFrameReqId].title === "") {
    mainFrameRequestInfo[mainFrameReqId].title = sender.tab.title;
  }

  const category = infer(message.article, tr);
  console.log(category[0].name);
  mainFrameRequestInfo[mainFrameReqId].inference = category[0].name;
}

browser.runtime.onMessage.addListener(inferencingMessageListener);
