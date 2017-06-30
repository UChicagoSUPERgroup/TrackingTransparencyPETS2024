var port = browser.runtime.connect({name:"port-from-popup"});
port.postMessage({greeting: "hello from popup"});

let pendingQueries = {};

port.onMessage.addListener(m => {
  switch (m.type) {
    case "database_query_response":
      // resolve pending query promise
      pendingQueries[m.id](m.response);
      break;

    case "info_current_page":
      $('#pagetitle').text(m.info.title);
      $('#inference').text(m.info.inference);
      break;
    case "tracker_most_pages":
      $('#mosttrackername').text(m.trackerName);
      $('#mosttrackercount').text(m.count - 1);
      $('#mostrackerinferences').text(m.inferences.join(", "));
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
  port.postMessage({ type: "get_tracker_most_pages" });

}


let queryId = 0;
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

