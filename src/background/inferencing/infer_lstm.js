/*
 * Infer ad interest category given the webpage a user visits.
 */
import Tokenizer from 'tokenize-text';
import striptags from 'striptags';
import * as tf from '@tensorflow/tfjs';
let inputLength = 100;

function vectorize(model, words) {
	console.log("NUM words: ", words.length);
	let currentInputLength = Math.floor(words.length / inputLength) * inputLength;

	let input_data = [];
	console.log(model.existingWords);

	for (let i = 0; i < currentInputLength; i++) {
		// console.log(words[i]);
		if (model.existingWords.has(words[i])) {
			input_data.push(model.word2idx[words[i]]);
		}
		else {
			input_data.push(model.word2idx["<NULL>"]);
		}
	}
	let num_batchs = Math.floor(words.length / inputLength);
	let batched_input_tensor = tf.tensor(input_data, [num_batchs, inputLength]);
	// console.log(batched_input_tensor.print());
	return batched_input_tensor;
}


function lstmPredict(model, batched_input_tensor) {
	let prediction = model.model.predictOnBatch(batched_input_tensor);

	let conf_score = prediction.sum(0);
	// console.log("conf_score shape", conf_score.shape);
	let category_idx = tf.argMax(conf_score).get();
	// console.log("category_idx: ", category_idx);

	conf_score = tf.max(conf_score).get();

	let category = model.idx2category[category_idx];

	return [category, conf_score]
}



export default function (text, model) {
  // console.time('vectorize');
  let batched_input_tensor = vectorize(model, text);
  // console.timeEnd('vectorize');
  // console.time('lstmPredict');
  let category = lstmPredict(model, batched_input_tensor);
  // console.timeEnd('lstmPredict');
  return category;

}
