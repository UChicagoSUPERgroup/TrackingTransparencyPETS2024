import tt from '../../helpers';
import * as tf from '@tensorflow/tfjs';

/*
 * Build lstm model from given word and category dictionary
 */

class Model {
  constructor(model, word2idx={}, idx2category={}) {
    this.model = model;
    this.word2idx = word2idx;
    this.idx2category = idx2category;
    this.existingWords = new Set(word2idx.keys);
  }
}



export default async function (word2idx_file, idx2category_file) {

  // Load word to index dictionary for model prediction
  var word2idx_raw = await tt.readTextFile(word2idx_file);
  var word2idx = JSON.parse(word2idx_raw);

  // Load index to category dictionary for model to convert prediction to category
  var idx2category_raw = await tt.readTextFile(idx2category_file);
  var idx2category = JSON.parse(idx2category_raw);

  // TODO: need to host model on client side
  const model = await tf.loadModel("https://super.cs.uchicago.edu/~shawn/lstm_small_model_js/model.json");
  const lstmModel = new Model(model, word2idx, idx2category);

  return lstmModel;
}