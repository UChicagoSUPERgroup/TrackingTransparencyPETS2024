/** @module database_worker */

// import {primaryDbPromise, primarySchemaBuilder} from "setup.js";
import makeQuery from "queries.js";
import * as store from "storage.js";

let trackersWorkerPort;
let inferencingWorkerPort;

onmessage = onMessage; // web worker

/* WEB WORKER MESSAGES */
/* =================== */
/**
 * message listener from another background script or another worker
 * 
 * @param  {Object} m - message
 * @param {Object} m.data - content of message
 * @param {string} m.data.type - type of message (set by sender)
 */
async function onMessage(m) {
  // console.log(m);
  switch (m.data.type) {
    case "ping":
      console.log("database worker recieved ping");
      break;

    case "database_query":
      handleQuery(m.data.id, m.data.src, m.data.query, m.data.args);
      break;

    case "trackers_worker_port":
      trackersWorkerPort = m.data.port;
      trackersWorkerPort.onmessage = onMessage;
      break;
    case "inferencing_worker_port":
      inferencingWorkerPort = m.data.port;
      inferencingWorkerPort.onmessage = onMessage;
      break;

    // STORAGE

    case "store_page":
      store.storePage(m.data.info);
      break;
    case "store_tracker_array":
      store.storeTrackerArray(m.data.pageId, m.data.trackers, m.data.firstPartyDomain);
      break;
    case "store_inference":
      store.storeInference(m.data.info);
      break;

    default:
      console.log("database worker recieved bad message");
  }
}
/**
 * makes sent query and sends reponse
 * 
 * @param  {Number} id  - query id (set by sender)
 * @param  {string} dst - query destination
 * @param  {string} query - query name
 * @param  {Object} args - query arguments
 */
async function handleQuery(id, dst, query, args) {
    
  const res = await makeQuery(query, args);

  if (res) {
    postMessage({
      type: "database_query_response",
      id: id,
      dst: dst,
      response: res
    });
  }
}
