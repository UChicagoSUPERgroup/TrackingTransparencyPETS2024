/** @module database_worker */

import tt from "../helpers";
// import {primaryDbPromise, primarySchemaBuilder} from "setup.js";
import makeQuery from "./queries";
import * as store from "./storage";

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
  // tt.log(m);
  switch (m.data.type) {
    case "ping":
      tt.log("database worker recieved ping");
      break;

    case "database_query":
      handleQuery(m.data);
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
      store.storeTrackerArray(m.data.pageId, m.data.trackers);
      break;
    case "store_inference":
      store.storeInference(m.data.info);
      break;

    default:
      tt.log("database worker recieved bad message");
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
async function handleQuery(data) {
    
  const res = await makeQuery(data.query, data.args);

  if (res) {
    postMessage({
      type: "database_query_response",
      id: data.id,
      response: res
    });
  }
}
