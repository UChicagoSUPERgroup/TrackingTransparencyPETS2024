
import { Readability } from '@mozilla/readability';
var ifvisible = require('ifvisible');

/* INFERENCING */

// import { Readability } from '@mozilla/readability'; // used in new version

export default function makeInference () {

  //
  // event listeners have to be in content scripts, this is why this appears here 
  //

  // console.log("FIRED, makeInference text processing 0")

  // ifvisible.setIdleDuration(5);
  // ifvisible.on('statusChanged', function(e){
  //   console.log(e.status);
  //   chrome.runtime.sendMessage({ type: 'testing_test', article: ["status change", e] });
  // });
  // ifvisible.idle(function(){
  //   // console.log("(-_-) Good bye. ZzzZZzz...    ", Date.now());
  //   chrome.runtime.sendMessage({ type: 'testing_test', article: ["go to sleep", Date.now()] });
  // });

  // ifvisible.wakeup(function(){
  //   // console.log("(O_o) Hey!, you woke me up.    ", Date.now());
  //   chrome.runtime.sendMessage({ type: 'testing_test', article: ["wake MEEEEEEEEEEE UP", Date.now()] });
  // });

  // ifvisible.onEvery(0.5, function(){
  //   // Clock, as simple as it gets
  //   var h = (new Date()).getHours();
  //   var m = (new Date()).getMinutes();
  //   var s = (new Date()).getSeconds();
  //   h = h < 10? "0"+h : h;
  //   m = m < 10? "0"+m : m;
  //   s = s < 10? "0"+s : s;
  //   // Update clock
  //   // console.log((h+':'+m+':'+s))
  // });

  // setInterval(function(){
  //     var info = ifvisible.getIdleInfo();
  //     // Give 3% margin to stabilaze user output
  //     if(info.timeLeftPer < 3){
  //         info.timeLeftPer = 0;
  //         info.timeLeft = ifvisible.getIdleDuration();
  //     }
  //     // console.log("SECONDS", parseInt(info.timeLeft / 1000), 10)
  //     // console.log("idleBAR", info.timeLeftPer+'%')
  // }, 100);


  // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // log activity event as user un-focusing this page
  // // focus event fires on new page visit, which is unneeded
  // window.addEventListener("visibilitychange", function(e) {
  //   // alert("EVENT FIRED: unfocus")
  //   let focus_event = Date.now()
  //   let activity_event = {type: "focus event", value: focus_event}
  //   chrome.runtime.sendMessage({ type: 'leaving_page', article: activity_event });
  // });

  // // log "close" event of tab or browser
  // window.addEventListener('beforeunload', function(e) {
  //   // alert("EVENT FIRED: close tab")
  //   let exit_event = Date.now()
  //   let activity_event = {type: "exit event", value: exit_event}
  //   chrome.runtime.sendMessage({ type: 'leaving_page', article: activity_event });
  // });
  // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // console.log("FIRED, makeInference text processing 1")

  // extract text from page (see below)

  // const text = extractTextFromNode(document.body);
  
  // get raw html content and parse to readability to process in the background
  // let text = document.getElementsByTagName('html')[0].outerHTML;
  // console.log("tex=:", text);

  let dupDoc = document.cloneNode(true);
  let reader = new Readability(dupDoc,{}); //readability expect doc
  let article = reader.parse();
  let text;
  try {
    text = article.textContent;
  }
  catch(error_on_text_grab_original) {
    text = ''
  }
  // console.log("comes from real")
  // console.log(text)
  // console.log(text.length)

  try {
    text += dupDoc.head.getElementsByTagName('meta')['og:description'].getAttribute('content')
    // console.log("successful add-in: ", dupDoc.head.getElementsByTagName('meta')['og:description'].getAttribute('content'))
  } catch (err) {
    // console.log("passing on og description add-in")
  }
  try {
    text += dupDoc.head.getElementsByTagName('meta')['description'].getAttribute('content')
    // console.log("successful add-in: ", dupDoc.head.getElementsByTagName('meta')['description'].getAttribute('content'))
  } catch(err) {
    // console.log("passing on description add-in")
  }

  // console.log("FIRED, makeInference text processing 2")

  if (!text || text.length === 0) {
    // console.warn('unable to extract text from page');
    return;
  }

  // console.log("FIRED, makeInference text processing 3")

  // send page text back to background script
  browser.runtime.sendMessage({ type: 'parsed_page', article: text }); 
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
