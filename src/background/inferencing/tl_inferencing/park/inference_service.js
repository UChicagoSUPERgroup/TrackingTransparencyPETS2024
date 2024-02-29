import { init_onnx_model, predict_category } from "./onnx"


const onnx_session = init_onnx_model();

//predict the result and post it to db
async function predict_and_post(text, mainFrameReqId, tabId, databaseWorker){
  let result_category = await predict_category(onnx_session,text);
  let conf_score = 0.9;
  console.log('Inference:', result_category);
  let inferenceInfo = {
      inference: result_category,
      inferenceCategory: '',
      threshold: conf_score,
      pageId: mainFrameReqId,
      tabId: tabId
    };
  
    // console.log("sending inference to database");
    databaseWorker.postMessage({
      type: 'store_inference',
      info: inferenceInfo
    });
  
    postMessage({
      type: 'page_inference',
      info: inferenceInfo
    });
}

export { predict_and_post }