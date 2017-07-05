import buildCategoryTree from "build.js";
import infer from "infer.js";

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

  const tr = await tree;
  
  const category = infer(article, tr);
  console.log(category[0].name);
  // info.inference = category[0].name;

  let inferenceInfo = {
    inference: category[0].name,
    inferenceCategory: "",
    threshold: category[1],
    pageId: mainFrameReqId
  }
  console.log("sending inference to database");
  databaseWorkerPort.postMessage({
    type: "store_inference",
    info: inferenceInfo
  });
  // storeInference(inferenceInfo);


}
