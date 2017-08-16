var port = browser.runtime.connect({name:"port-from-infopage"});
port.postMessage({greeting: "hello from infopage"});

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


async function saveOptions(e) {
  e.preventDefault();

  let queryName = document.querySelector("#queryName").value;
  let queryArgs = document.querySelector("#queryArgs").value;
  let argsObject = JSON.parse(queryArgs);
  console.log(queryName, argsObject);

  let query = await queryDatabase(queryName, argsObject);
  console.log(query);

  document.getElementById("queryResult").textContent = query;
}

document.querySelector("form").addEventListener("submit", saveOptions);


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

  let htmlStr = '<div class="card"><div class="card-header" role="tab" id="';
  htmlStr += heading + '">';
  htmlStr += '<h6><a data-toggle="collapse" data-parent="#accordion"';
  htmlStr += ' href="#' + collapse + '" aria-expanded="true" aria-controls="' + collapse +'">';
  htmlStr += trackerName + '</a></h6></div>';

  htmlStr += '<div id="' + collapse + '" class="collapse" role="tabpanel" aria-labelledby="';
  htmlStr += heading + '">';

  htmlStr += '<div class="card-block">' + trackerName;
  htmlStr += '</div>';



  htmlStr+= '</div></div>';
  console.log(htmlStr);







  return htmlStr;

}
