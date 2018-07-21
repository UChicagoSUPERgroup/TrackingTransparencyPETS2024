import buildCategoryTree from './build';
import infer from './infer';

// the keywords file is bundled using webpack as keywordsjson
// it must NOT have .json as an extension in the bundle because then it goes over a file size limit with mozilla
import keywordsFile from 'file-loader?name=keywordsjson!../../data/inferencing/keywordsjson';

let databaseWorkerPort;

onmessage = function(m) {
  switch (m.data.type) {
  case 'database_worker_port':
    databaseWorkerPort = m.data.port;
    break;
    
  case 'content_script_to_inferencing':
    inferencingMessageListener(m.data.article, m.data.mainFrameReqId, m.data.tabId);
    break;
  }
};

const tree = buildCategoryTree(keywordsFile);


// TODO: this function needs to be rewritten
async function inferencingMessageListener(text, mainFrameReqId, tabId) {

  const tr = await tree;
  // console.log(tr);
  // const secondLevelCats = tr.children.concat.apply([], tr.children.map(x => x.children));
  // console.log(secondLevelCats);
  // let secondLevelTr = Object.assign({}, tr);
  // secondLevelTr.children = secondLevelCats;
  
  const category = infer(text, tr);
  console.log('Inference:', category[0].name);
  // const category2 = infer(article, secondLevelTr);
  // console.log("Inference:", category2[0].name);
  // info.inference = category[0].name;

  let inferenceInfo = {
    inference: category[0].name,
    inferenceCategory: '',
    threshold: category[1],
    pageId: mainFrameReqId,
    tabId: tabId
  };
  // console.log("sending inference to database");
  databaseWorkerPort.postMessage({
    type: 'store_inference',
    info: inferenceInfo
  });

  postMessage({
    type: 'page_inference',
    info: inferenceInfo
  })
  // storeInference(inferenceInfo);


}
