import buildCategoryTree from "./build";
import infer from "./infer";

import tt from "../helpers";

let databaseWorkerPort;

onmessage = function(m) {
  switch (m.data.type) {
    case "database_worker_port":
      databaseWorkerPort = m.data.port;
      break;
    
    case "content_script_to_inferencing":
      inferencingMessageListener(m.data.article, m.data.mainFrameReqId);
      break;
  }
}

const tree = buildCategoryTree("../lib/inferencing_data/categories.json");


// TODO: this function needs to be rewritten
async function inferencingMessageListener(article, mainFrameReqId) {

  // TODO: remove this when inferencing is working
  if (article === "null") {
    storeFakeInferenceInfo(mainFrameReqId);
    return;
  }

  const tr = await tree;
  // tt.log(tr);
  // const secondLevelCats = tr.children.concat.apply([], tr.children.map(x => x.children));
  // tt.log(secondLevelCats);
  // let secondLevelTr = Object.assign({}, tr);
  // secondLevelTr.children = secondLevelCats;
  
  const category = infer(article, tr);
  tt.log("Inference:", category[0].name);
  // const category2 = infer(article, secondLevelTr);
  // tt.log("Inference:", category2[0].name);
  // info.inference = category[0].name;

  let inferenceInfo = {
    inference: category[0].name,
    inferenceCategory: "",
    threshold: category[1],
    pageId: mainFrameReqId
  }
  // tt.log("sending inference to database");
  databaseWorkerPort.postMessage({
    type: "store_inference",
    info: inferenceInfo
  });
  // storeInference(inferenceInfo);


}

function storeFakeInferenceInfo(mainFrameReqId) {
  const inferences =  ["Warehousing", "Major Kitchen Appliances", "Air Travel", "Beach Vacations"];

  const randomInference = inferences[Math.floor(Math.random() * inferences.length)]

  let inferenceInfo = {
    inference: randomInference,
    inferenceCategory: "",
    threshold: Math.random(),
    pageId: mainFrameReqId
  }
  // tt.log("sending inference to database");
  databaseWorkerPort.postMessage({
    type: "store_inference",
    info: inferenceInfo
  });
}
