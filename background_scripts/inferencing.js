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

async function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case "parsed_page":
      inferencingMessageListener(message, sender);
      break;
    case "current_page_inference_request":
      popupMessageListener(message, sender, sendResponse);
      break;
  }
}

async function inferencingMessageListener(message, sender) {

  const tr = await tree;

  if (!sender.tab || !sender.url || sender.frameId !== 0) {
    // message didn't come from a tab, so we ignore
    return;
  }

  const mainFrameReqId = tabRequestMap[sender.tab.id];
  
  if (!mainFrameReqId) {
    return;
  }
  const info = mainFrameRequestInfo[mainFrameReqId];

  if (message.article.title) {
    // readability gives us a better title
    info.title = message.article.title;
  } else {
    info.title = sender.tab.title
  }

  const category = infer(message.article, tr);
  console.log(category[0].name);
  info.inference = category[0].name;

  let inferenceInfo = {
    inference: category[0].name,
    inferenceCategory: "",
    threshold: category[1],
    pageId: mainFrameReqId
  }
  storePage(info); // stores page info again with good title
  storeInference(inferenceInfo);


}

browser.runtime.onMessage.addListener(onMessage);
