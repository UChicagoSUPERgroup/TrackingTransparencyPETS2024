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

// Function to take exponents and obtain the best (which) categories:
// minProb (max=1): minimum probability displayed.
function expAndRank(outputTensor, minProb=0.05) {
  const logit_outs = outputTensor.dataSync();   //.dataSync() gets the flattened array in tensor.
  let probs = logit_outs.map(Math.exp);
  const probs_sorted = probs.sort().reverse();
  probs = logit_outs.map(Math.exp);
  let cats = Object.keys(label_to_ix);

  // minProb case.
  var probs_satisfy = probs_sorted.filter(x => x>=minProb);
  var topXidxs = [];
  for (var i=0; i<probs_satisfy.length; i++) {
    let top_i_prob = probs_satisfy[i];
    let idx_i = probs.indexOf(top_i_prob);
    topXidxs.push(idx_i);
  }

  let best_cats = topXidxs.map(x=>cats[x]);
  // Compose the two arrays as a dict, {best_cat: prob}
  var best_cats_dict =  probs_satisfy.reduce(function(result, field, index) {
    result[best_cats[index]] = field;
    return result;
  }, {})

  // console.log(best_cats_dict)

  return best_cats_dict
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
    // console.log("indexeddb exists, init model:", model);
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
  let out_tensor = model.predict(input_tensor);
  let pred_dict = expAndRank(out_tensor, 0.10);  //0.10 is the minimum threshold probability. This can be modified. Min=0, Max=1.
  let pred_cat = Object.keys(pred_dict)[0];
  // console.log(pred_cat); //the predicted cat
  // console.log(Object.values(pred_dict)[0]); //the predicted cat's probability

  tf.engine().endScope();
  return pred_cat
}

export { predict} 
