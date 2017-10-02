var port = browser.runtime.connect({name:"port-from-infopage"});
port.postMessage({greeting: "hello from infopage"});

//extension conditions
var getInferences = false;
var enoughInfo = true;

let pendingQueries = {};
var query;
let queryId = 0;

port.onMessage.addListener(m => {
  m = JSON.parse(m);
  switch (m.type) {
    case "database_query_response":
      // resolve pending query promise
      pendingQueries[m.id](m.response);
      break;
  }
});

async function onReady() {


  //get the top 10 trackers and set up accordion lists on two pages
  if (enoughInfo){
    runGeneralQueries();
  } else {
    //what we do if there isn't enough information (like the extension was just installed)
    //we haven't set this up yet. idea: have a message on the dashboard which tells the
    //user to come back later and either we disable all of the navigation links or we put
    //the same message on every page
  }

}

$('document').ready(onReady());

//this is not used, but could be useful for loading content selectively
document.addEventListener("click", (e) => {
  const clickTarget = e.target;
  if (clickTarget.classList[0]=="nav-link" && clickTarget.href.includes("#")) {
    const chosenContent = clickTarget.href.split("#")[1];
    switch(chosenContent) {
      case "who-is-tracking":
        break;
    }
  }
});



//we need to 'clean' tracker names before we use them inside html ids because
// trackers can have periods or spaces in their names which mess things up
function cleanName(trackerName){
  trackerName= trackerName.split(" ").join("");
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

//takes in the name of a tracker and creates a new card inside the accordion at a location
function makeTrackerAccordion(tracker, location){
  let trackerName = cleanName(tracker);
  let heading = 'heading-' + location + "-" + trackerName;
  let collapse = 'collapse-' + location + "-" +  trackerName;
  let card = 'card-' + location + "-" +  trackerName;
  let cardblock  = 'cardblock-' + location + "-" +  trackerName;

  //framework of card, card header, and card block
  $("#" + location).append('<div id="' + card + '"></div>');
  let cardDiv = $("#" + card).addClass("card");
  cardDiv.append('<div id="' + heading + '"></div>');
  $("#" + heading).addClass("card-header").attr("role","tab");
  cardDiv.append('<div id="' + collapse + '"></div>')
  $("#" + collapse).addClass("collapse").attr("role","tabpanel");

  //include the labeled header
  let headerContent = document.createElement("h6");
  headerContent.append(document.createElement("a"));
  $("#" + heading).append(headerContent);
  let linkContent = $("#" + heading).children("h6").children("a");
  linkContent.attr("data-toggle","collapse")
                .attr("data-parent","#"+ location +'accordion')
                .attr("href", "#"+ collapse)
                .text(tracker);

  //include the card block body elements
  $("#" + collapse).append('<div id="'+ cardblock +'"></div>');
  $("#" + cardblock).addClass("card-block");

}


//makes a list of all trackers along with the number of times they've been seen
function makeAllTrackerList(trackerList, totalPages){
  $('#allTrackerList').append(document.createElement("ul"));
  let listObj = $('#allTrackerList').children("ul");
  listObj.addClass("list-group list-group-flush");
  for (let i=0; i<trackerList.length; i++){
    let pageVisits = trackerList[i]["COUNT(tracker)"]
    let pagesStr = pageVisits > 1 ? " pages" : " page";
    let percent = (100*pageVisits / totalPages).toPrecision(2);
    listObj.append('<li class="list-group-item"><b>' + trackerList[i].tracker +
      "</b> on "+ pageVisits + pagesStr + ", or " + percent +
      '% of your browsing</li>');
  }
  $('.numberOfTrackers').html(trackerList.length);
}



//makes a tracker profile of name, inference and some pages
function makeTrackerProfile(tracker, trackerObject, inferences, location){
  let trackerName = cleanName(tracker);
  let cardblock  = 'cardblock-' + location + "-" +  trackerName;
  let textStr, listStr;
  //show trackers with inferences and pages?
  if (inferences){
    for (let j=0; j<trackerObject.length; j++){
      textStr = tracker + " has likely concluded that you are interested in <b>" +
        trackerObject[j].inference.inference.toLowerCase() + "</b> based on your visits to these pages:";
      $('#' + cardblock).append(textStr);
      $('#' + cardblock).append(document.createElement("ul"));
      let listObj = $('#' + cardblock).children(":last-child");
      listObj.addClass("list-group list-group-flush");
      let pageList = [];
      for (let i=0; i<trackerObject[j].pages.length; i++){
        let pageName = trackerObject[j].pages[i].title;
        if (!pageList.includes(pageName)) {
          pageList.push(pageName);
          listObj.append('<li class="list-group-item p-pages" >' + escapeHTML(pageName) + '</li>');
        }
      }
      listObj.append("<br>");
    }
  }
  //shows all trackers but no inferences
  else {
    textStr = "There were " + tracker + " trackers on these sites which you've visited:";
    $('#' + cardblock).append(textStr);
    $('#' + cardblock).append(document.createElement("ul"));
    let listObj = $('#' + cardblock).children(":last-child");
    listObj.addClass("list-group list-group-flush");
    let domainList = [];
    for (let i = 0; i<trackerObject.length; i++){
      let domainName = trackerObject[i];
      if (!domainList.includes(domainName)) {
        domainList.push(domainName);
        listObj.append('<li class="list-group-item">' + domainName + '</li>');
      }
    }
  }
}

function makeDomainsByTrackers(domainList){
  let loc = $("#sitesWithMostTrackers");
  let i = 0;
  while (i<5 && i<domainList.length){
    loc.append('<li><b>'+removeWWW(domainList[i].domain)+
                "</b> ("+ domainList[i].trackers + ' trackers)</li>');
    i++;
  }
  loc = $("#sites10trackers");
  while (domainList[i].trackers>=10 && i<domainList.length){
    loc.append('<li><b>'+removeWWW(domainList[i].domain)+
                "</b> ("+ domainList[i].trackers + ' trackers)</li>');
    i++;
  }
  $(".sumTrackers10orMore").append(i);
}

function removeWWW(domainName){
  domain = domainName.split(".");
  if (domain[0]=="www"){
    domain.shift();
  }
  return domain.join(".")
}

async function runGeneralQueries(){
  // fire off the queries we can right away
  // won't hold up execution until we have something awaiting them
  let trackerQueryPromise = queryDatabase("get_trackers", {count: 10});
  let domainsByNumberOfTrackersPromise = queryDatabase("get_domains_with_number_of_trackers", {});

  //query for the top 10 trackers
  let tracker_query = await trackerQueryPromise;
  for (let i=0; i < tracker_query.length; i++){
    makeTrackerAccordion(tracker_query[i].tracker, "frequentTrackerList");
    makeTrackerAccordion(tracker_query[i].tracker, "frequentTrackerListInferencing");
    $('.numberOfFrequentTrackers').html(tracker_query.length);
  }

  //set up list of all trackers
  document.getElementById("showalltrackers").onclick = async () => {
    let allTrackersPromise = queryDatabase("get_trackers", {});
    let sumPagesPromise = queryDatabase("get_number_of_pages",{});
    let allTrackers = await allTrackersPromise;
    let sumPages = await sumPagesPromise;
    makeAllTrackerList(allTrackers,sumPages);
  }

  //fill in the accordion lists with trackers and trackers + inferences
  let tracker_detailed_queries = [];
  let tracker_list_queries = [];
  for (let i=0; i < tracker_query.length; i++){
      let args = {tracker: tracker_query[i].tracker, inferenceCount: 3, pageCount: 15};
      tracker_detailed_queries[i] = await queryDatabase("get_info_about_tracker", args)
      makeTrackerProfile(tracker_query[i].tracker,
        tracker_detailed_queries[i], true, "frequentTrackerListInferencing");
  }
  for (let i=0; i < tracker_query.length; i++){
      let args = {tracker: tracker_query[i].tracker, count: 20}
      tracker_list_queries[i] = await queryDatabase("get_domains_by_tracker", args);
      makeTrackerProfile(tracker_query[i].tracker,
        tracker_list_queries[i], false, "frequentTrackerList");
  }

  //query for domains with the most trackers
  let domainsByNumberOfTrackers = await domainsByNumberOfTrackersPromise;
  makeDomainsByTrackers(domainsByNumberOfTrackers);

}

function escapeHTML(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

//the function to make database queries
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
