import buildCategoryTree from './build';
import buildLstmModel from './build_lstm';

import infer_tfidf from './infer';
import infer_lstm from './infer_lstm';

import * as tf from '@tensorflow/tfjs';



// the keywords file is bundled using webpack as keywordsjson
// it must NOT have .json as an extension in the bundle because then it goes over a file size limit with mozilla
import keywordsFile from 'file-loader?name=keywordsjson!../../data/inferencing/keywordsjson';
import word2idxFile from 'file-loader?name=word2idxjson!../../data/inferencing/word2idxjson';
import idx2categoryFile from 'file-loader?name=idx2categoryjson!../../data/inferencing/idx2categoryjson';


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
const model = buildLstmModel(word2idxFile, idx2categoryFile);


// TODO: this function needs to be rewritten
async function inferencingMessageListener(text, mainFrameReqId, tabId, inferencing_alg) {
  let result_category = "foo";
  let conf_score = 0;
  if (inferencing_alg === "tfidf") {
    const tr = await tree;
    const category = await infer_tfidf(text, tr);
    result_category = category[0].name;
    conf_score = category[1];
  }

  else if (inferencing_alg === "lstm") {
    const lstmModel = await model;
    const category = await infer_lstm(text, tr); 
    result_category = category[0];
    conf_score = category[1];
  }
  else {
    console.log("Please choose an inferencing ALG");
  }
  
  console.log('Inference:', result_category);

  let inferenceInfo = {
    inference: result_category,
    inferenceCategory: '',
    threshold: conf_score,
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
