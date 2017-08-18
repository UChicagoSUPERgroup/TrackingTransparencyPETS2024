var port = browser.runtime.connect({name:"port-from-infopage"});
port.postMessage({greeting: "hello from infopage"});

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


async function saveOptions(e) {
  e.preventDefault();
  let select = document.getElementById("queryName");
  let queryName = select.options[select.selectedIndex].text;

  let argsObject = {
    domain: document.querySelector("#domain").value,
    tracker: document.querySelector("#tracker").value,
    inference: document.querySelector("#inference").value,
    count: +document.querySelector("#count").value,
    inferenceCount: +document.querySelector("#inferenceCount").value,
    pageCount: +document.querySelector("#pageCount").value,
  }
  console.log(queryName, argsObject);

  let query = await queryDatabase(queryName, argsObject);
  console.log(query);

  document.getElementById("queryResult").textContent = JSON.stringify(query, null, 4);
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
