
/* INFERENCING */

function removeTagByTagName(tagName, doc) {
  var elems = doc.getElementsByTagName(tagName);
  for (let e of elems) {
    // console.log(e);
    e.parentNode.removeChild(e);
  }
  return;
} // from https://stackoverflow.com/questions/43072644/how-can-i-remove-a-footer-element-using-javascript

export default function makeInference() {
  let doc = document.cloneNode(true);
  // let doc = document.importNode(document.body, true);
  // console.log(doc);
  // let doc = document.body;
  removeTagByTagName('footer', doc);
  removeTagByTagName('script', doc);
  const text = doc.innerText;
  // console.log(text);
  if (!text || text.length === 0) {
    throw new Error('unable to extract text from page');
  }
  browser.runtime.sendMessage({ type: 'parsed_page', article: text });
}
