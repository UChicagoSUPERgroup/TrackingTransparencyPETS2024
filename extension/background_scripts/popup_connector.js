/** @module popup_connector */

let portFromPopup;
let portFromInfopage;

let pendingDirectQueries = {};
let pendingPopupQueries = {};

/** listener function to run when connection is made with popup or infopage
 * 
 * sets up messageListener as listener function for received messages
 * 
 * @param  {Object} p - port object
 * @param {string} p.name - name of port object
 */
async function connected(p) {

  if (p.name === "port-from-popup") {
    portFromPopup = p;
    portFromPopup.onMessage.addListener(messageListener);

  } else if (p.name === "port-from-infopage") {
    portFromInfopage = p;
    portFromInfopage.onMessage.addListener(messageListener);
  }
    
}
browser.runtime.onConnect.addListener(connected);

/** listener for messags from popup and infopage
 * 
 * @param  {Object} m - message
 */
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

/* listener for messages recieved from database worker */
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


let directQueryId = 0;
/** function to make direct queries to database from background script
 * 
 * used for debugging
 * 
 * @param  {string} query - name of query
 * @param  {Object} args - arguments for query
 */
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

