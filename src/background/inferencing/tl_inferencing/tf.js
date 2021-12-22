import Dexie from 'dexie';
import * as tf from '@tensorflow/tfjs';

const word_to_ix = require('./data_word_to_ix.json');
const label_to_ix = require('./data_label_to_ix.json')
// Get Vocab Size by counting the keys of word_to_ix dictionary. The size here is 26824.
const vocab_size = Object.keys(word_to_ix).length;

//////////*Helper Functions*//////////

// Initiate an array of zeros, and append to respective positions by word index.
function make_input_array(vocab_size, input_words) {
  let input_array =  new Array(vocab_size).fill(0);
  for (let word of input_words) {   // ES6 for-of statement
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
  let max = arr[0];
  let maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
}

// outputTensor to predicted category
function predict_outTensor_cat(outputTensor) {
  let tensorArray = outputTensor.dataSync() //.dataSync() gets the flattened array in tensor.
  let pred = indexOfMax(tensorArray);
  let cats = Object.keys(label_to_ix);
  let pred_cat = cats[pred];
  return pred_cat;
}

// should have some mechanism to wait for the db is loaded...
let model = null;

async function loadTfModel(){
  let dbExist =  await Dexie.exists("tensorflowjs")
  if (dbExist) {
    model = await tf.loadGraphModel('indexeddb://web-cat');
    console.log("indexeddb exists, init model:", model);
  }else {
    console.log("tensorflow db not exists!");
  }
}

async function predict(input_words){
  if (model === null) {
    await loadTfModel();
  }
  // console.log("in predict(), model:", model);

  if(input_words.length < 10) {
    console.log("too little text to predict")
    return ""
  }

  tf.engine().startScope();
  let input_array = make_input_array(vocab_size, input_words);
  let input_tensor = [tf.tensor(input_array, [1,vocab_size], "float32")];
  let out_tensor = model.predict(input_tensor)
  let pred_cat = predict_outTensor_cat(out_tensor)
  console.log(pred_cat)

  tf.engine().endScope();  
  return pred_cat
}

export { predict} 
