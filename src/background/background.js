/** @module background */

import parseuri from 'parseuri';

import {trackersWorker, databaseWorker, inferencingWorker} from './workers_setup';
import userstudy from './userstudy';
// import tt from '../helpers';

import categoryTree from '../data/categories_tree.json';


userstudy.setDefaultOptions();

let tabData = {};

let pendingTrackerMessages = {};
let trackerMessageId = 0;


/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

function ping() {
  return 'ping'
}
window.ping = ping;

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

browser.tabs.onRemoved.addListener(clearTabData);


/** Sends a message with information about each outgoing
 * web request to trackers worker.
 * 
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest(details) {

  if (details.type === 'main_frame') {
    // for main frame page loads, ignore
    return;
  }

  if (tabData[details.tabId]) {
    tabData[details.tabId].webRequests.push(details);
  }
}

/** Called by listeners when user navigates to a new page
 * 
 * Creates a new page id, associates page with the current tab, sends info about page to database worker.
 * 
 * @param  {Object} details - object from onBeforeRequest or onHistoryStateUpdated listener
 * @param {number} details.frameId - frame id (should be 0 for main frame)
 * @param {number} details.tabId - tab id
 * @param {string} details.url - url
 * @param {number} details.timeStamp - timestamp
 */
async function updateMainFrameInfo(details) {

  if (details.frameId !== 0 || 
      details.tabId === -1  || 
      details.tabId === browser.tabs.TAB_ID_NONE ||
      !details.url.startsWith('http') ||
      details.url.includes('_/chrome/newtab')) {
    // not a user-initiated page change
    return;
  }

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId);

  }

  /* take time stamp and use as ID for main frame page load
   * store in object to identify with tab */
  try {
    const tab = await browser.tabs.get(details.tabId);
    recordNewPage(details.tabId, details.url, tab.title);
  } catch (err) {
    console.log("can't updateMainFrame info for tab id", details.tabId);
  }
}

function recordNewPage(tabId, url, title) {
  const pageId = Date.now();
  let parsedURL = parseuri(url);
  tabData[tabId] = {
    pageId: pageId,
    domain: parsedURL.host,
    path: parsedURL.path,
    protocol: parsedURL.protocol,
    title: title,
    webRequests: [],
    trackers: []
  };

  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  });
}

/**
 * Clears tabData info for a tab.
 * Called when page changed/reloaded or tab closed.
 * 
 * @param  {} tabId - tab's id
 */
function clearTabData(tabId) {
  if (!tabData[tabId]) {
    // console.log("we tried to clear tab data for a tab we didn't have any data about");
    return;
  }

  trackersWorker.postMessage({
    type: 'page_changed',
    oldPageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests
  });

  tabData[tabId] = null;
}

async function updateTrackers(tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return;
  }

  let messagePromise = new Promise((resolve) => {
    pendingTrackerMessages[trackerMessageId] = resolve;
  });

  trackersWorker.postMessage({
    id: trackerMessageId,
    type: 'push_webrequests',
    pageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests
  });
  trackerMessageId++;
  tabData[tabId].webRequests = [];

  let trackers = await messagePromise;
  tabData[tabId].trackers = trackers;

}


/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// browser.runtime.onConnect.addListener(runtimeOnConnect);
browser.runtime.onMessage.addListener(runtimeOnMessage);
databaseWorker.onmessage = onDatabaseWorkerMessage;
trackersWorker.onmessage = onTrackersWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 * 
 * @param  {number} tabId
 */
async function getTabData(tabId) {
  if (typeof tabData[tabId] == 'undefined') {
    return null;

  } else {

    let data = tabData[tabId];

    await updateTrackers(tabId);

    data.inference = 'Warehousing';

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

let queryId = 0;
let pendingDatabaseQueries = {};

/**
 * Sends database query message to database worker, waits for response, returns result.
 * 
 * @param  {string} query - name of query
 * @param  {Object} args - arguments object passed to database worker
 */
async function queryDatabase(query, args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingDatabaseQueries[queryId] = {resolve: resolve, reject: reject};
  });

  databaseWorker.postMessage({
    type: 'database_query',
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  try {
    let res = await queryPromise;
    return res.response;
  } catch(e) {
    throw new Error(e);
  }
}
window.queryDatabase = queryDatabase; // exposes function to other extension components 


/**
 * Makes database query recusively for all children of given inference in category tree, concatenating result
 * 
 * @param  {string} query - name of query
 * @param  {Object} args - arguments object passed to database worker
 * @param  {string} args.inference - inference
 */
async function queryDatabaseRecursive(query, args) {
  if (!args.inference) {
    return queryDatabase(query, args);
  }
  if (!query.endsWith('byInference')) {
    console.warn('Making a recursive query with a query that is not inference-specific. There may be unexpected results.');
  }

  args.count = null; // if we limit count for individual queries things get messed up

  const treeElem = findChildren(args.inference, categoryTree);
  console.log(treeElem);
  if (!treeElem) return false;
  let children = collapseChildren(treeElem);
  children.push(args.inference);
  console.log(children);

  let queries = [];
  for (let c of children) {
    let cargs = Object.assign({}, args);
    cargs.inference = c;
    const q = queryDatabase(query, cargs); // this is a PROMISE
    queries.push(q);
  }

  const results = await Promise.all(queries);

  let mergedRes;
  let tempObj;
  switch(query) {
  case 'getTrackersByInference':
    tempObj = {};
    for (let res of results) {
      for (let tracker of res) {
        let tn = tracker.Trackers['tracker'];
        let tc = tracker.Trackers['COUNT(tracker)'];
        if (tempObj[tn]) {
          tempObj[tn] += tc
        } else {
          tempObj[tn] = tc;
        }
      }        
    }
    mergedRes = Object.keys(tempObj).map(key => ({tracker: key, count: tempObj[key]}));
    mergedRes.sort((a, b) => (b.count - a.count));
    break;
  case 'getDomainsByInference':
    tempObj = {};
    for (let res of results) {
      Object.keys(res).forEach(domain => {
        if (tempObj[domain]) {
          tempObj[domain] += res[domain]
        } else {
          tempObj[domain] = res[domain];
        }
      })
    }
    mergedRes = Object.keys(tempObj).map(key => ({domain: key, count: tempObj[key]}));
    mergedRes.sort((a, b) => (b.count - a.count));
    break;
  case 'getTimestampsByInference':
    mergedRes = Array.prototype.concat.apply([], results);
    break;
  default:
    console.warn('Not sure how to put together separate queries. Results may be unexpected.')
    mergedRes = Array.prototype.concat.apply([], results);
  }

  return mergedRes;

}
window.queryDatabaseRecursive = queryDatabaseRecursive;

function findChildren(cat, root) {
  for (let c of root.children) {
    if (c.name === cat) {
      return c.children ? c.children : [];
    } else if (c.children) {
      let rec = findChildren(cat, c);
      if (rec) {
        return rec;
      }
    }
  }
  return false;
}

function collapseChildren(children) {
  let ret = [];
  for (let c of children) {
    ret.push(c.name);
    if (c.children) {
      ret = ret.concat(collapseChildren(c.children))
    }
  }
  return ret;
}

/**
 * Run on message recieved from database worker.
 * 
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 */
function onDatabaseWorkerMessage(m) {
  // console.log('Message received from database worker', m);
  
  if (m.data.type === 'database_query_response') {

    // if response isn't given a query id to associate with request, it's an error
    if (!m.data.id) {
      // since we don't know which promise to reject we have to just throw an error
      throw new Error ('malformed query response', m);
    }

    const p = pendingDatabaseQueries[m.data.id];
    if (m.data.error) {
      // database gave us an error
      // so we reject query promise
      p.reject(m.data.error);
      return;
    }

    p.resolve(m.data);

  }
}

/**
 * Run on message recieved from trackers worker.
 * 
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 * @param  {Object} m.data.type - Message type, set by sender
 * @param  {Object} m.data.id - Message id, set by sender
 * @param  {Object} m.data.trackers - Array of trackers, given by sender
 */
function onTrackersWorkerMessage(m) {
  // console.log('Message received from database worker', m);
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}


/** 
 * listener function for messages from content script
 * 
 * this function can NOT be an async function - if it is sendResponse won't work
 * 
 * if the response is the result of an async function (like queryDatabase),
 * you must put sendRsponse in .then(), and also have the original function return true
 * 
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * 
 */
function runtimeOnMessage(message, sender, sendResponse) {
  let pageId;
  let query;
  // sendResponse('swhooo');
  switch (message.type) {
  case 'parsed_page':

    if (!sender.tab || !sender.url || sender.frameId !== 0) {
      // message didn't come from a tab, so we ignore
      break;
    }
    if (!tabData[sender.tab.id]) break;
    pageId = tabData[sender.tab.id].pageId;

    inferencingWorker.postMessage({
      type: 'content_script_to_inferencing',
      article: message.article,
      mainFrameReqId: pageId
    });
    break;
    
  case 'queryDatabase':
    query = queryDatabase(message.query, message.args);
    query.then(res => { // cannot use async/await
      sendResponse(res);
    });
    return true; // this tells browser that we will call sendResponse asynchronously
  }

}


/* OTHER MISCELLANEOUS FUNCTIONS */
/* ============================= */

if (typeof browser.browserAction.setPopup === 'undefined') { 
  // popups not supported
  // like firefox for android
  // so we directly open infopage instead
  browser.browserAction.onClicked.addListener(() => {
    let infopageData = {
      active: true,
      url: '../dashboard/index.html'
    };
    browser.tabs.create(infopageData);
  });
}
