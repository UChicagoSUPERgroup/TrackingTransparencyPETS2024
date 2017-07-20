/*
 * Infer ad interest category given the webpage a user visits.
 */
import Tokenizer from "tokenize-text";
import striptags from "striptags";
import {AllHtmlEntities as Entities} from "html-entities"


function scoreCategory(category, words) {
  var total = words.length;

  words = words.filter(function(n) {
    return category.keywords.indexOf(n) !== -1;
  });

  // console.log(words.length);

  return (words.length / total);
}

/* find child category with highest score and return it with its score
 * if it has a higher score than the parent. If not, return null.
 */
function findBestChild(category, words, parentScore) {
  var highestScore = 0;
  var bestChild, curScore, child;

  for (let i = 0; i < category.children.length; i++) {
    curScore = scoreCategory(category.children[i], words);

    if (curScore > highestScore) {
      highestScore = curScore;
      bestChild = category.children[i];
    }

    console.log("trying",category.children[i].name , "score", curScore);
  }

  if (highestScore >= parentScore + 0.015) {
    return [bestChild, highestScore];
  } else {
    return null;
  }
}

/* recursively find best category given an array of words from given
 * Category tree.
 */
function findBestCategory(root, words, rootScore) {
  var result, bestChild, bestChildScore;

  if (!root) {
    return;
  } else if (root.children === []) {
    return [root, rootScore];
  } else { // root exists and has children
    result = findBestChild(root, words, rootScore);

    // if result is null, then that means parent has better score
    // than children
    if (!result) {
      return [root, rootScore];
    }

    bestChild = result[0];
    bestChildScore = result[1];
    console.log("going with", bestChild.name, "score", bestChildScore);

    return findBestCategory(bestChild, words, bestChildScore);
  }
}

export default function (article, tree) {
  var words, text, tokenizer, tokens;

  // text = [
  //   article.title,
  //   article.textContent,
  // ];

  // join list and decode html

  // const entities = new Entities();
  // text = entities.decode(text.join(" "));

  // striptags
  // text = striptags(text, [], " ");
  // text = article.title.concat(" ", article.excerpt);
  text = article.title.concat(" ", article.excerpt, " ", article.textContent);
  // console.log("article text is:", text);
  // text = article.textContent;

  // tokenize
  tokenizer = new Tokenizer();
  tokens = tokenizer.words()(text);

  words = tokens.map((token) => token.value.toLowerCase());

  // console.log(words);
  // findBestCategory(tree, words, 0);

  const cat = (findBestCategory(tree, words, 0));
  // console.log(cat);
  return cat;

}
