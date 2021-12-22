import { Tensor, InferenceSession } from "onnxjs";

import clean_text from "./preprocessText";

import word_to_ix  from './data_word_to_ix.json';
import label_to_ix from './data_label_to_ix.json';
console.log("DEBUG word_to_ix:", word_to_ix);
console.log("DEBUG label_to_ix:", label_to_ix);

import onnxModelContent from "../../data/webCatClassify.onnx";

// function parse_and_clean_document(document) {
//     // var doc = new JSDOM(html);
//     // let reader = new Readability(doc.window.document,{});
//     let reader = new Readability(document,{});
//     let article = reader.parse();
//     // console.log(article.textContent)
//     return preprocessText.clean_text(article.textContent)
// }

// Get Vocab Size by counting the keys of word_to_ix dictionary. The size here is 26824.
const vocab_size = Object.keys(word_to_ix).length;

// Initiate an array of zeros, and append to respective positions by word index.
function make_input_array(vocab_size, input_words) {
  let input_array =  new Array(vocab_size).fill(0);
  for (const word of input_words) {   // ES6 for-of statement
    let index = word_to_ix[word]
    input_array[index] = input_array[index] + 1
  }
  return input_array
}

// Get the maximum value of array. For argmax for outputTensor.
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
}

// outputTensor to predicted category
function predict_outTensor_cat(outputTensor) {
  tensorArray = outputTensor.data
  let pred = indexOfMax(tensorArray);
  let cats = Object.keys(label_to_ix);
  let pred_cat = cats[pred];
  return pred_cat;
}

async function init_onnx_model(){
  let session = new InferenceSession();
  await session.loadModel(onnxModelContent);
  return session;
}

// MAIN FUNCTION
async function predict_category(session, text) {
  await session.loadModel("webCatClassify.onnx");

  let input_words = clean_text(text);

  let input_array = make_input_array(vocab_size, input_words);
  let input_tensor = [new onnx.Tensor(input_array, "float32", [1,vocab_size])];
  let outputMap = await session.run(input_tensor);
  let outputTensor = outputMap.values().next().value;
  let pred_cat = predict_outTensor_cat(outputTensor)
  console.log(pred_cat)
  return pred_cat

}

export {init_onnx_model, predict_category};