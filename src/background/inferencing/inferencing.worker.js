import Snowball from 'snowball'

import buildCategoryTree from './build';
import infer_tfidf from './infer';
import tt from '../../helpers';

// newML
import {clean_text} from "./tl_inferencing/preprocessText";
import { predict } from './tl_inferencing/tf';

// the keywords file is bundled using webpack as keywordsjson
// it must NOT have .json as an extension in the bundle because then it goes over a file size limit with mozilla

import word2IndexFile from 'file-loader?name=data/words2idx_dictjson!../../data/inferencing/words2idx_dictjson';
import keywordsFile from 'file-loader?name=data/keywordsjson!../../data/inferencing/keywordsjson';
import cutOneFile from 'file-loader?name=data/cut_one_dictjson!../../data/inferencing/cut_one_dictjson';

const pg = require('predictgender');

import comfortData from '../../data/interests/interests.json'

let databaseWorkerPort;

onmessage = function (m) {
  switch (m.data.type) {
    case 'database_worker_port':
      databaseWorkerPort = m.data.port;
      break;

    case 'content_script_to_inferencing':
      inferencingMessageListener(m.data.article, m.data.mainFrameReqId, m.data.tabId);
      break;

    case 'content_script_to_inferencing__forad':
      inferencingMessageListener__forad(m.data.article, m.data.pageId, m.data.domain, m.data.url, m.data.initiator, m.data.url_explanation, m.data.url_landing_page_long, m.data.url_landing_page_short, m.data.explanation, m.data.dom);
      break;
  }
};

const tree = buildCategoryTree(keywordsFile, word2IndexFile, cutOneFile);

function stem (text, all_words, words2idx_dict) {
  var stemmer = new Snowball('English');
  var cur_word = null;
  let tokens = [];
  for (let i = 0; i < text.length; i++) {
    stemmer.setCurrent(text[i]);
    stemmer.stem();
    cur_word = stemmer.getCurrent();
    if (all_words.has(cur_word)) {
      tokens.push(words2idx_dict[cur_word]);
    }
  }
  return [tokens, text.length];
}


// this is a new function because we are not storing this information as a page
// we just need to get the inference and log it with the new ad table
async function inferencingMessageListener__forad (text, pageId, domain, url, initiator, url_explanation, url_landing_page_long, url_landing_page_short, explanation, dom) {

  // console.log("//////////////////// inferencing checker", text, pageId, domain, url, initiator, url_explanation, url_landing_page_long, url_landing_page_short, explanation, dom)

  ////////////////////////////////////////  newML start
  let text_cleaned = clean_text(text)
  // console.log("text_cleaned:", text_cleaned);
  let newer_result_category = await predict(text_cleaned);
  let category_all = await newer_result_category
  console.log(category_all)
  let category_last;
  let cat_as_array;
  if (category_all != "") {
    if (category_all != undefined) {
      category_all = category_all.split("/").filter(i => i)
      category_last = category_all[category_all.length-1]
      cat_as_array = []
      for (let obj of category_all) {
        cat_as_array.push(obj)
      }
    }
  }
  else {
    console.log("category_all was in error")
    category_last = "none"
    cat_as_array = ["none"]
  }

  // console.log(category_last)
  // console.log(cat_as_array)
  // console.log(category_all)
  // console.log(category_all.length == 0)
  // console.log(category_all == '')
  ////////////////////////////////////////  newML end

  // console.log("infernce new for ad specifically")
  // console.log(dom)

  let result_category = null;
  let conf_score = 0;
  const tr_struc = await tree;
  const tr = tr_struc[0];
  const word2idx = tr_struc[1];
  const allExistWords = tr_struc[2];
  const cutOneDict = tr_struc[3];

  text = text.toLowerCase();
  let stemmed = stem(text.split(' '), allExistWords, word2idx);
  text = stemmed[0];
  let totalLength = stemmed[1];

  ////////////////////////////////////////
  var output = pg(text);
  var gender_lex = Object.values(output);
  var gender_string = '';
  if (gender_lex > 0) {
    gender_string = 'Male';
  }
  else if (gender_lex < 0) {
    gender_string = 'Female';
  }
  else {
    gender_string = 'Bigender';
  }
  ////////////////////////////////////////

  const category = await infer_tfidf(text, tr, totalLength);
  result_category = cutOneDict[category[0].name];
  conf_score = category[1];


  let inferenceInfo = {
    inference: category_last, //result_category,
    inferenceCategory: category_last, // sanity check newML's model
    inferencePath: cat_as_array, // keep full path
    threshold: conf_score,
    pageId: pageId,
    domain: domain,
    // url: url,
    url_explanation: url_explanation,
    url_landing_page_long: url_landing_page_long,
    url_landing_page_short: url_landing_page_short,
    dom: dom,
    explanation: explanation,
    // initiator: initiator,
    gender: gender_string,
    genderLexical: gender_lex[0],
  };

  // console.log(inferenceInfo)
  // console.log(pageId)
  console.log("=============================> sending ad to database - " + url_landing_page_long);
  databaseWorkerPort.postMessage({
    type: 'store_ad',
    info: inferenceInfo
  });

  

}

async function inferencingMessageListener (text, mainFrameReqId, tabId) {

  let prolific_bug_flag = false
  if (text.includes("We want to make Prolific better for you, but we can't do that without knowing how you use our site.")) {
    prolific_bug_flag = true
  }

  // console.log(text)

  ////////////////////////////////////////  newML start
  let text_cleaned = clean_text(text)
  // console.log("text_cleaned:", text_cleaned);
  let newer_result_category = await predict(text_cleaned);
  let category_all = await newer_result_category
  // console.log(category_all)
  let category_last;
  let cat_as_array;
  // console.log("*******************", category_all)
  if (category_all != "") {
    if (category_all != undefined) {
      category_all = category_all.split("/").filter(i => i)
      category_last = category_all[category_all.length-1]
      cat_as_array = []
      for (let obj of category_all) {
        cat_as_array.push(obj)
      }
    }
  }
  else {
    category_last = "none"
    cat_as_array = ["none"]
  }
  ////////////////////////////////////////  newML end


  let result_category = null;
  let conf_score = 0;
  const tr_struc = await tree;
  const tr = tr_struc[0];
  const word2idx = tr_struc[1];
  const allExistWords = tr_struc[2];
  const cutOneDict = tr_struc[3];

  ////////////////////////////////////////
  // console.log(text);
  var output = pg(text);
  var gender_lex = Object.values(output);
  var gender_string = '';
  if (gender_lex > 0) {
    gender_string = 'Male';
  }
  else if (gender_lex < 0) {
    gender_string = 'Female';
  }
  else {
    gender_string = 'Bigender';
  }
  ////////////////////////////////////////

  text = text.toLowerCase();
  // console.log("comes from inferencing worker as non-ad inference", "\n", text)
  let plain_text = text
  let stemmed = stem(text.split(' '), allExistWords, word2idx);
  text = stemmed[0];
  let totalLength = stemmed[1];

  const category = await infer_tfidf(text, tr, totalLength);
  result_category = cutOneDict[category[0].name];
  conf_score = category[1];


  ////////////////////////////////////////
  let COMFORT_SETTING = -2.0
  let wordCloud_option = ''
  if (plain_text && newer_result_category != undefined) {
    if ((Object.keys(comfortData).includes(category_last) && comfortData[category_last].comfort <= COMFORT_SETTING) || newer_result_category.toLowerCase().includes("sensitive subjects") || newer_result_category.toLowerCase().includes("adult")) {
      wordCloud_option += text_cleaned
    }

    // // todo -- way too many categories are viewed as sensitive 
    // for (let cat of category_all.reverse()) {
    //   if (cat != '') {
    //     console.log("checking ====> " + cat)
    //     let ifCatExists;
    //     if (!Object.keys(comfortData).includes(cat)) {
    //       ifCatExists = 3
    //     } else {
    //       ifCatExists = comfortData[cat].comfort
    //     }
    //     if (ifCatExists < 0 || newer_result_category.toLowerCase().includes("sensitive subjects") || newer_result_category.toLowerCase().includes("adult")) {
    //       wordCloud_option += text_cleaned
    //       break;
    //     }
    //   }
    // }
  }
  ////////////////////////////////////////

  // console.log('Inference:', result_category);
  // prolific bug, patch on model error 
  // prolific was categorized as marraige, which is wrong and easily seen because survey redirects to prolific 
  // this is a patch
  if (prolific_bug_flag == true && category_last == "Marriage") {
    // console.log("BUG CAUGHT")
    category_last = cat_as_array[0]
    cat_as_array = [cat_as_array[0]]
  } 

  let inferenceInfo = {
    inference: category_last, //result_category,
    inferenceCategory: category_last, // sanity check newML's model
    inferencePath: cat_as_array, // keep full path
    wordCloud: wordCloud_option,
    threshold: conf_score,
    gender: gender_string,
    genderLexical: gender_lex[0],
    pageId: mainFrameReqId,
    tabId: tabId
  };

  console.log("=============================>  sending inference to database:", category_last); 
  // skip undeinfed here, if in ads, keep it
  if (category_last != undefined) { 
    databaseWorkerPort.postMessage({
      type: 'store_inference',
      info: inferenceInfo
    });

    postMessage({
      type: 'page_inference',
      info: inferenceInfo
    });
  }

  // storeInference(inferenceInfo);
}
