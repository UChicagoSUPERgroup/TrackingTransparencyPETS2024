let portFromPopup;
let portFromInfopage;

let pendingDirectQueries = {};
let pendingPopupQueries = {};

async function connected(p) {

  if (p.name === "port-from-popup") {
    portFromPopup = p;
    portFromPopup.onMessage.addListener(messageListener);

  } else if (p.name === "port-from-infopage") {
    portFromInfopage = p;
    portFromInfopage.onMessage.addListener(messageListener);
  }
    
}

async function messageListener(m) {

  let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  let activeTab = activeTabs[0];

  if (m.type === "database_query") {
    if (m.src === "popup") {
      let queryPromise = new Promise((resolve, reject) => {
        pendingPopupQueries[m.id] = resolve;
      });

      databaseWorker.postMessage({
        id: m.id,
        type: m.type,
        src: m.src,
        query: m.query,
        args: m.args
      })

      let res = await queryPromise;
      portFromPopup.postMessage(res);
    }
  }

}

databaseWorker.onmessage = function(m) {
  console.log('Message received from database worker');
  if (m.data.type === "database_query_response") {
    if (m.data.dst === "background-debug") {
      pendingDirectQueries[m.data.id](m.data);
    } else if (m.data.dst === "popup") {
      pendingPopupQueries[m.data.id](m.data);
    }
  }
}

/* functionality to make queries directly from background script
 * currently used only for debugging
 */
let directQueryId = 0;
async function directQuery(query, args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingDirectQueries[directQueryId] = resolve;
  });

  databaseWorker.postMessage({
    id: directQueryId,
    type: "database_query",
    src: "background-debug",
    query: query,
    args: args
  });
  directQueryId++;

  let res = await queryPromise;
  console.log(res.response);
}

browser.runtime.onConnect.addListener(connected);
