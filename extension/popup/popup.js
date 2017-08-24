var port = browser.runtime.connect({name:"port-from-popup"});

let queryId = 0;
let pendingQueries = {};

port.onMessage.addListener(m => {
  switch (m.type) {
    case "tab_data_response":
      pendingQueries[m.id](m.response);
      break;

    case "database_query_response":
      // resolve pending query promise
      pendingQueries[m.id](m.response);
      break;

    // case "info_current_page":
    //   $('#pagetitle').text(m.info.title);
    //   $('#inference').text(m.info.inference);
    //   break;
    // case "tracker_most_pages":
    //   $('#mosttrackername').text(m.trackerName);
    //   $('#mosttrackercount').text(m.count - 1);
    //   $('#mostrackerinferences').text(m.inferences.join(", "));
    //   break;
  }
});

async function onReady() {
  const tabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  const tab = tabs[0];

  // get tab data with trackers and stuff here
  const tabData = await getTabData(tab.id);
  console.log(tabData);

  /* looks something like:
    { 
      pageId: 1503590672929, 
      domain: "super.cs.uchicago.edu", 
      path: "/members.html", 
      protocol: "https", 
      title: "University of Chicago SUPERgroup: M…", 
      webRequests: Array[0], 
      trackers: ["Google", "DoubleClick"] 
      inference: "Warehousing" 
    }
  *
  * note that info about trackers on current page is NOT in the databse at the time this is run
  */


  const parsedURL = parseUri(tab.url);
  const query = await queryDatabase("get_tracker_with_inferences_by_domain", {domain: parsedURL.host});
  $('#mosttrackername').text(query.tracker);
  $('#mosttrackercount').text(query.count - 1);
  $('#mostrackerinferences').text(query.inferences.join(", "));
  // let title = tabs[0].title;
  // if (title.length >= 30) {
  //   title = title.substring(0,30).concat("...");
  // }
  // $('#pagetitle').text(title);

  // port.postMessage({ type: "request_info_current_page" });
  // port.postMessage({ type: "get_tracker_most_pages" });

}


async function queryDatabase(query, args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingQueries[queryId] = resolve;
  })
  // pendingQueries[queryId].promise = queryPromise;
  
  port.postMessage({
    type: "database_query",
    src: "popup",
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  let res = await queryPromise;
  return res;
}

async function getTabData(tabId) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingQueries[queryId] = resolve;
  })

  port.postMessage({
    type: "get_tab_data",
    src: "popup",
    id: queryId,
    tabId: tabId
  });
  
  queryId++;

  let res = await queryPromise;
  return res;
}


$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    let infopageData = {
      active: true,
      url: "../infopage/index.html"
      };
    browser.tabs.create(infopageData);

  }
});

