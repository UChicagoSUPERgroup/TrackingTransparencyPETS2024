import buildCategoryTree from './build';
import buildLstmModel from './build_lstm';

import infer_tfidf from './infer';
import infer_lstm from './infer_lstm';

import * as tf from '@tensorflow/tfjs';



// the keywords file is bundled using webpack as keywordsjson
// it must NOT have .json as an extension in the bundle because then it goes over a file size limit with mozilla
import keywordsFile from 'file-loader?name=keywordsjson!../../data/inferencing/keywordsjson';
import word2idxFile from 'file-loader?name=word2idxjson!../../data/inferencing/word2idxjson';
// import lstmModelFile from 'file-loader?name=model.json!../../data/inferencing/lstm_small_model_js/model.json';

let databaseWorkerPort;
let inferencing_alg = "tfidf";

onmessage = function(m) {
  switch (m.data.type) {
  case 'database_worker_port':
    databaseWorkerPort = m.data.port;
    break;
    
  case 'content_script_to_inferencing':
    inferencingMessageListener(m.data.article, m.data.mainFrameReqId, m.data.tabId, inferencing_alg);
    break;
  }
};



const tree = buildCategoryTree(keywordsFile);
const model = buildLstmModel(keywordsFile);


// TODO: this function needs to be rewritten
async function inferencingMessageListener(text, mainFrameReqId, tabId, inferencing_alg) {

  if (inferencing_alg == "tfidf") {
    const tr = await tree;
    const category = infer_lstm(text, tr);
    let result_category = category[0].name;
    let conf_score = category[1];
  }

  else if (inferencing_alg == "lstm") {
    const lstmModel = await model;
    const category = infer_tfidf(text, tr); 
    let result_category = category[0];
    let conf_score = category[1];
  }
  
  console.log('Inference:', result_category);

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
