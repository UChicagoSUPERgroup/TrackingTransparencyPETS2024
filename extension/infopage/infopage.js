var port = browser.runtime.connect({name:"port-from-infopage"});
port.postMessage({greeting: "hello from infopage"});

let pendingQueries = {};
var query;
let queryId = 0;
var getInferences = true;

port.onMessage.addListener(m => {
  switch (m.type) {
    case "database_query_response":
      // resolve pending query promise
      pendingQueries[m.id](m.response);
      break;
  }
});

async function onReady() {
  // let tabs = await browser.tabs.query({active: true, lastFocusedWindow: true})
  // let title = tabs[0].title;
  // if (title.length >= 30) {
  //   title = title.substring(0,30).concat("...");
  // }
  // $('#pagetitle').text(title);

  // port.postMessage({ type: "request_info_current_page" });

  query = await queryDatabase("get_top_trackers", {count: 2});
  for (let i=0; i < query.length; i++){
    makeTrackerAccordion(query[i]);
  }



}

async function queryDatabase(query,args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingQueries[queryId] = resolve;
  })
  // pendingQueries[queryId].promise = queryPromise;

  port.postMessage({
    type: "database_query",
    src: "infopage",
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  let res = await queryPromise;
  return res;
}

$('document').ready(onReady());

document.addEventListener("click", (e) => {
  const clickTarget = e.target

  if (clickTarget.classList[0]=="nav-link" && clickTarget.href.includes("#")) {
    const chosenContent = clickTarget.href.split("#")[1];
    switch(chosenContent) {
      case "who-is-tracking":
        break;
    }
  }
});



function makeTrackerAccordion(trackerName){
  let heading = 'heading-' + trackerName;
  let collapse = 'collapse-' + trackerName;
  let card = 'card-' + trackerName;
  let cardblock  = 'cardblock-' + trackerName;

  //framework of card, card header, and card block
  $("#frequentTrackerList2").append('<div class="card" id="' + card + '"></div>');
  let htmlHStr = '<div class="card-header" role="tab" id="' + heading + '"></div>';
  let htmlCStr = '<div id="' + collapse + '" class="collapse" role="tabpanel" aria-labelledby="';
  htmlCStr += heading + '"></div>';
  $('#' + card).html(htmlHStr + htmlCStr);
  //include the labeled header
  let htmlheader = '<h6><a data-toggle="collapse" data-parent="#accordion"';
  htmlheader += ' href="#' + collapse + '" aria-expanded="true" aria-controls="' + collapse +'">';
  htmlheader += trackerName + '</a></h6>';
  $('#' + heading).html(htmlheader);
  //include the card block body elements
  let htmlBody = '<div class="card-block" id="'+ cardblock +'"></div>';
  $('#' + collapse).html(htmlBody);

  $('#' + cardblock).html(trackerName + " was present on x% of the pages you visited today.");
}
