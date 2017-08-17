var port = browser.runtime.connect({name:"port-from-infopage"});
port.postMessage({greeting: "hello from infopage"});

//extension conditions
var getInferences = false;


let pendingQueries = {};
var query;
let queryId = 0;

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


  //get the top 10 trackers and set up accordion lists on two pages
  tracker_query = await queryDatabase("get_top_trackers", {count: 10});
  for (let i=0; i < tracker_query.length; i++){
    makeTrackerAccordion(cleanName(tracker_query[i]), "frequentTrackerList");
    makeTrackerAccordion(cleanName(tracker_query[i]), "frequentTrackerListInferencing");
  }


  //fill in the accordion lists with trackers and inferences
  let tracker_detailed_queries = [];
  let tracker_list_queries = [];
  for (let i=0; i < tracker_query.length; i++){
      let args = {tracker: tracker_query[i], inferenceCount: 3, pageCount: 20};
      tracker_detailed_queries[i] = await queryDatabase("get_info_about_tracker", args)
      makeTrackerProfile(cleanName(tracker_query[i]),
        tracker_detailed_queries[i], true, "frequentTrackerListInferencing");
  }
  query = await queryDatabase("get_top_trackers", {count: 20});
  query1 = await queryDatabase("get_trackers", {});
  console.log(query);
  console.log(query1);
  for (let i=0; i < tracker_query.length; i++){
      args = {tracker: tracker_query[i], count: 20}
      tracker_list_queries[i] = await queryDatabase("get_domains_by_tracker", args);
      makeTrackerProfile(cleanName(tracker_query[i]),
        tracker_list_queries[i], false, "frequentTrackerList");
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


function cleanName(trackerName){
  if (trackerName.includes(".")){
    return trackerName.split(".")[0];
  }
  return trackerName;
}
/* checks
console.log(cleanName("amazon.com"));
console.log(cleanName("facebook"));
console.log(cleanName("google.analytics.com"));
*/

//These are the functions necessary for updating index.html with newly queried information

//takes in the name of a tracker and creates a new card inside the accordion on
//who is tracking me page with a header and block
function makeTrackerAccordion(trackerName, location){
  let heading = 'heading-' + location + "-" + trackerName;
  let collapse = 'collapse-' + location + "-" +  trackerName;
  let card = 'card-' + location + "-" +  trackerName;
  let cardblock  = 'cardblock-' + location + "-" +  trackerName;

  //framework of card, card header, and card block
  $("#" + location).append('<div class="card" id="' + card + '"></div>');
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

  //$('#' + cardblock).html(trackerName + " was present on x% of the pages you visited today.");
}

//makes a tracker profile of name, inference and some pages
function makeTrackerProfile(trackerName, trackerObject, inferences, location){
  let cardblock  = 'cardblock-' + location + "-" +  trackerName;
  let textStr, listStr;
  if (inferences){
    for (let j=0; j<trackerObject.length; j++){
      textStr = trackerName + " has likely concluded that you are interested in <b>" +
        trackerObject[j].inference.toLowerCase() + "</b> based on your visits to these sites:";
      listStr = '<ul class="list-group list-group-flush">';
      let domainList = [];
      for (let i=0; i<trackerObject[j].pages.length; i++){
        let domainName = trackerObject[j].pages[i].domain;
        if (!domainList.includes(domainName)) {
          domainList.push(domainName);
          listStr += '<li class="list-group-item">' + domainName +
            '</li>';
        }
      }
      listStr += '<br></ul>';
      $('#' + cardblock).append(textStr + listStr);
    }
  } else {
    textStr = "There were " + trackerName + " trackers on these sites which you've visited:";
    listStr = '<ul class="list-group list-group-flush">';
    let domainList = [];
    for (let i = 0; i<trackerObject.length; i++){
      let domainName = trackerObject[i];
      if (!domainList.includes(domainName)) {
        domainList.push(domainName);
        listStr += '<li class="list-group-item">' + domainName +
          '</li>';
      }
    }
    listStr += '</ul>';
    $('#' + cardblock).html(textStr + listStr);
  }
}
