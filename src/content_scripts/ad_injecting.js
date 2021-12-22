
/* INFERENCING */

export default function checkAd () {
  // extract text from page (see below)
  // const text = extractTextFromNode(document.body);
  // console.log(text);

  var all = document.getElementsByTagName("iframe");
  var array = [];
  var links = document.getElementsByTagName("a");
  for(var i=0, max=links.length; i<max; i++) {
      array.push(links[i].href);
  }
  // console.log(array);
  // ** // ** // 
  // we would need to allow cross site scripting if we want to modify/scrape iframe content
  // ** // ** // 
  // for (var i=0, max=all.length; i < max; i++) {
  //   console.log(all[i])
  //   // var doc=all[i].contentWindow.document;
  //   // console.log(doc);

  // }
  // console.log("===========================DONE===========================")
  return

  // if (!text || text.length === 0) {
  //   console.warn('unable to extract text from page');
  //   return;
  // }

  // // send page text back to background script
  // browser.runtime.sendMessage({ type: 'parsed_page', article: text });
}

function extractTextFromNode (node) {
  // node.tagName is in ALL CAPS
  if (node.tagName === 'FOOTER' || node.tagName === 'SCRIPT') {
    return '';
  }


  let res = node.innerText;
  for (let child of node.children) {
    res += (' ' + extractTextFromNode(child));
  }
  return res;
}
