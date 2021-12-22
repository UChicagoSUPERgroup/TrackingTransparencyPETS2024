import { Readability } from '@mozilla/readability';

/* INFERENCING */

export default function makeInference () {

  
  //
  // event listeners have to be in content scripts, this is why this appears here 
  //

  // log activity event as user un-focusing this page
  // focus event fires on new page visit, which is unneeded
  window.addEventListener("visibilitychange", function(e) {
    let focus_event = Date.now()
    let activity_event = {type: "focus event", value: focus_event}
    chrome.runtime.sendMessage({ type: 'leaving_page', article: activity_event });
  });

  // log "close" event of tab or browser
  window.addEventListener('beforeunload', function(e) {
    let exit_event = Date.now()
    let activity_event = {type: "exit event", value: exit_event}
    chrome.runtime.sendMessage({ type: 'leaving_page', article: activity_event });
  });


  // extract text from page (see below)

  // const text = extractTextFromNode(document.body);
  
  // get raw html content and parse to readability to process in the background
  // let text = document.getElementsByTagName('html')[0].outerHTML;
  // console.log("tex=:", text);

  let dupDoc = document.cloneNode(true);
  let reader = new Readability(dupDoc,{}); //readability expect doc
  let article = reader.parse();
  let text = article.textContent;
  console.log("readability:", text);

  if (!text || text.length === 0) {
    console.log('unable to extract text from page');
    return;
  }

  // send page text back to background script
  browser.runtime.sendMessage({ type: 'parsed_page', article: text });
}

// function extractTextFromNode (node) {
//   // node.tagName is in ALL CAPS
//   if (node.tagName === 'FOOTER' || node.tagName === 'SCRIPT') {
//     return '';
//   }

//   let res = node.innerText;
//   for (let child of node.children) {
//     res += (' ' + extractTextFromNode(child));
//   }
//   return res;
// }
