import tt from '../../helpers';
import * as tf from '@tensorflow/tfjs';

/*
 * Build tree from given JSON file listing nodes with keywords.
 */

class Model {
  constructor(model, word2idx={}) {
    this.model = model;
    this.word2idx = word2idx;
  }
}

function buildDictionary(json_string) {
  var obj = JSON.parse(json_string);
  return obj;
}

export default async function (word2idx_file) {

  var file = await tt.readTextFile(word2idx_file);
  var word2idx = buildDictionary(file);

  const model = await tf.loadModel("https://super.cs.uchicago.edu/~shawn/lstm_small_model_js/model.json");
  const lstmModel = new Model(model, word2idx);

  return lstmModel;
}