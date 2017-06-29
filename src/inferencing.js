import buildCategoryTree from "build.js";
import infer from "infer.js";

const tree = buildCategoryTree("../lib/inferencing_data/categories.json");

async function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case "parsed_page":
      inferencingMessageListener(message, sender);
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

  const category = infer(message.article, tr);
  console.log(category[0].name);
  info.inference = category[0].name;

  let inferenceInfo = {
    inference: category[0].name,
    inferenceCategory: "",
    threshold: category[1],
    pageId: mainFrameReqId
  }
  console.log("sending inference to database");
  databaseWorker.postMessage({
    type: "store_inference",
    info: inferenceInfo
  });
  // storeInference(inferenceInfo);


}

browser.runtime.onMessage.addListener(onMessage);
