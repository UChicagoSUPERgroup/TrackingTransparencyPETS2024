/** @module background */

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

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping() {
  return 'ping'
}
window.ping = ping;

/* listener for all outgoing web requests */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onDOMContentLoaded.addListener(updateMainFrameInfo);
browser.webNavigation.onHistoryStateUpdated.addListener(updateMainFrameInfo);

/* listener for tab close */
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
    //console.log(tab)
    if (tab.hasOwnProperty("favIconUrl")){
      recordNewPage(details.tabId, details.url, tab.title, tab.favIconUrl);//add favicon url
    }
    else{
      //console.log("no favicon")
      recordNewPage(details.tabId, details.url, tab.title, "");//add empty favicon url
    }
  } catch (err) {
    console.log("can't updateMainFrame info for tab id", details.tabId);
  }
}

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/

async function fetchSetGetFavicon(url, faviconurl){
  //console.log(url)
  //console.log(faviconurl)
  let x = "favicon_"+url
  let checkFav = await browser.storage.local.get({[x]: "no favicon"});
  if(checkFav[x]!="no favicon"){
    //already stored favicon
    //and the favicon is same as before
    if(checkFav[x]["faviconurl"]==faviconurl){
      //console.log(checkFav[x]["favicondata"]);
      return checkFav[x]["favicondata"];
    }
  }
  if(faviconurl==""){
    //no favicon for this tab
    let setFav = await browser.storage.local.set(
      {[x]: {
        "url":url,
        "faviconurl":faviconurl,
        "favicondata":""}
      }
    );
    return "";
  }
  var favicon = new XMLHttpRequest();
  favicon.responseType = 'blob';
  favicon.open('get', faviconurl);
  favicon.onload = function() {
    var fileReader = new FileReader();
    fileReader.onloadend = async function() {
        // fileReader.result is a data-URL (string) in base 64 format
        //console.log(faviconurl)
        //console.log(fileReader.result);
        x = "favicon_"+url
        let setFav = await browser.storage.local.set(
          {
            [x]: {
              "url":url,
              "faviconurl":faviconurl,
              "favicondata":fileReader.result
            }
        });
    };
    // favicon.response is a Blob object
    fileReader.readAsDataURL(favicon.response);
  };
  favicon.send();
  checkFav = await browser.storage.local.get({[x]: "no favicon"});
  //console.log(checkFav[x]["favicondata"]);
  return checkFav[x]["favicondata"];
}

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
async function getFavicon(url) {
  let x = "favicon_"+url
  let checkFav = await browser.storage.local.get({[x]: "no favicon"});
  //console.log(checkFav)
  if(checkFav[x]!="no favicon"){
    //console.log(checkFav[x]["favicondata"])
    return checkFav[x]["favicondata"];
  }
  return ""
}

/**
 * creates a new record for the tab in database and tabData object
 * the tabData object stores basic info about the tab in memory
 * 
 * @param  {number} tabId
 * @param  {string} url
 * @param  {string} title
 */
function recordNewPage(tabId, url, title) {
  const pageId = Date.now();
  let urlObj = new URL(url)
  
  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    title: title,
    webRequests: [],
    trackers: []
  };

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  });
  //now fetch and store the favicon database
  x = fetchSetGetFavicon(url, faviconurl)
}

/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 * 
 * @param  {number} tabId - tab's id
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

/**
 * forces update of tab data
 * web requests are queued in tabData, and then when this function is called
 * they are pushed to the trackers worker, which evaluates whether they are trackers
 * and if so stores them in the database
 * 
 * this function also sends the updated data to the in-page overlay
 *  
 * @param  {number} tabId - tab's id
 */
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

  // notify content script to update overlay
  chrome.tabs.sendMessage(tabId, {
    type: 'page_trackers',
    trackers: trackers
  });

}


/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// note that we are using the CHROME api and not the BROWSER api
// because the webextension polyfill does NOT work with sending a response because of reasons
chrome.runtime.onMessage.addListener(runtimeOnMessage);

databaseWorker.onmessage = onDatabaseWorkerMessage;
trackersWorker.onmessage = onTrackersWorkerMessage;
inferencingWorker.onmessage = onInferencingWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 *
 * @param  {number} tabId
 * @return {Object} tabData object
 */
async function getTabData(tabId) {
  if (typeof tabData[tabId] == 'undefined') {
    return null;

  } else {

    let data = tabData[tabId];

    await updateTrackers(tabId);

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
 * @return {Object} database query response
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
 * @return {Object} database query response
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


/**
 * given a category name in the Google ad-interest categories, and an object for the entire tree,
 * returns a list with all child subtrees
 * 
 * helper for queryDatabaseRecursive
 * 
 * @param  {string} cat
 * @param  {Object} root
 * @returns {Object[]} branches of tree for each child
 * 
 */
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

/**
 * given a list of subtrees, returns a flattened list of node names
 * 
 * helper for queryDatabaseRecursive
 * 
 * @param  {Object[]} children - subtrees of category tree
 * @returns {string[]} - list of nodes in all subtrees input
 */
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
 * facilitates bulk import of data
 * takes in JSON of data to import, passes to database
 * 
 * @param  {Object} dataString - JSON with data to import
 */
async function importData(dataString) {
  databaseWorker.postMessage({
    type: 'import_data',
    data: dataString
  })
}
window.importData = importData;

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
  // console.log('Message received from trackers worker', m);
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}


function onInferencingWorkerMessage(m) {
  console.log('Message received from inferencing worker', m);
  const tabId = m.data.info.tabId;
  if (m.data.type === 'page_inference') {
    console.log(m.data.info.inference)
    tabData[tabId].inference = m.data.info.inference;
    console.log(tabData[tabId].inference)
  }
  chrome.tabs.sendMessage(tabId, m.data);
}

/**
 * listener function for messages from content script
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 * 
 */
function runtimeOnMessage(message, sender, sendResponse) {
  let pageId;
  let query, tabDataRes;
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
      mainFrameReqId: pageId,
      tabId: sender.tab.id
    });
    break;

  case 'queryDatabase':
    query = queryDatabase(message.query, message.args);
    query.then(res => sendResponse(res));
    return true; // must do since calling sendResponse asynchronously

  case 'getTabData':
    tabDataRes = getTabData(sender.tab.id);
    tabDataRes.then(res => sendResponse(res));
    return true; // must do since calling sendResponse asynchronously
  }

}

// for running in debugger and in external functions
window.sendDb=sendDb;
window.setUserParams=setUserParams;
window.fetchSetGetFavicon=fetchSetGetFavicon;
window.getFavicon=getFavicon;

/************** BEGIN Instrumentation ********************************/

//////////// -- first set the uuid and the usage flag if they are not set

async function setUserParams() {
  //check if the value is set
  let userParams = await browser.storage.local.get({
    usageStatCondition: "no more tears",
    userId: "no more tears",
    startTS: 0
  });
  //console.log(userParams)
  //if usageStatCondition is not set then set it and store
  //usageStatCondition should be set in userstudy.js
  //if (userParams.usageStatCondition!=sendUsage){
  //  let x = await browser.storage.local.set({usageStatCondition: sendUsage})
  //}
  //if userId is not set, set it and store
  if (userParams.userId=="no more tears"){
    //uid = utilize both the random generator and time of install
    let uid=Math.random().toString(36).substring(2)
            +(new Date()).getTime().toString(36);
    //console.log(uid)
    let x = await browser.storage.local.set({userId: uid})
    let salt=Math.random().toString(36).substring(2)
            +(new Date()).getTime().toString(36);
    let x1 = await browser.storage.local.set({salt: salt})
    //return
  }
  if (userParams.startTS==0){
    let startTS = Date.now()
    let x2 = await browser.storage.local.set({startTS: startTS})
  }

  /* Now log the starting of the extension */
  userParams = await browser.storage.local.get({
    usageStatCondition: "no monster",
    userId: "no monster",
    startTS: 0
  });
  let userId1 = userParams.userId;
  let startTS1 = userParams.startTS;
  //console.log(userParams)
  let activityType='initialized app and created userparams'
  let timestamp=Date.now()
  let activityData={}
  logData(activityType, timestamp, userId1, startTS1, activityData);
  //console.log("in send pop data")
  //console.log(activityData)
  return true
}

function hashit(data){
  var crypto = require('crypto');
  return crypto.createHash('md5').update(String(data)).digest("hex");
  //return data
}

async function hashit_salt(data){
  var crypto = require('crypto');
  let salt = await browser.storage.local.get({salt:'salt'});
  //console.log('SALT', salt.salt);
  return crypto.createHash('md5').update(String(data)+String(salt.salt)).digest("hex");
  //return data
}

// now write function to send database
async function sendDb() {
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
      startTS: 0
    });
    // if usage condition is null just return
    if (!JSON.parse(userParams.usageStatCondition)){return true}
    var allData = await queryDatabase('getInferencesDomainsToSend', {});
    //var allData = await queryDatabase('getInferences', {});


    for (var i = 0; i < allData.length; i++){
      allData[i]["Pages"]["domain"] = await hashit_salt(allData[i]["Pages"]["domain"]);
      allData[i]["Inferences"]["inference"] = hashit(allData[i]["Inferences"]["inference"]);
      allData[i]["Trackers"]["tracker"]= hashit(allData[i]["Trackers"]["tracker"]);
    }
    //console.log(allData)
    //for(const row of alldata){
    //  console.log(row)
    //}
    //var xs = cookie
    //let allData=""
    var data = new FormData();
    data.append("u", userParams.userId);
    data.append("t", Date.now());
    data.append("startTS", userParams.startTS);
    data.append("dbname", "getInferences");
    data.append("lfdb",JSON.stringify(allData));

    //console.log(allData)
    //data.append('filename',xs.value+'.'+Date.now())
    var xhr = new XMLHttpRequest();
    //send asnchronus request
    xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/lfdb.php', true);
    //xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(data);
    //return true
}

//now write fucntion to send activity data to server

function logData(activityType, timestamp, userId, startTS, activityData){
    var data = new FormData();
    data.append("activityType", activityType);
    data.append("timestamp",timestamp);
    data.append("userId", userId)
    data.append("startTS", startTS);
    data.append("activityData",JSON.stringify(activityData));
    //console.log('in logdata');
    //console.log(activityData)

    //console.log(allData)
    var xhr = new XMLHttpRequest();
    //send asnchronus request
    xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/activitylog.php', true);
    //xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(data);
}

/// function to detect if the window/tabs are closed

async function logLeave(tabId, removeInfo) {
    //console.log('In the log leave page ', tabId, removeInfo);
    //logData('hehe', 0, 0, 0, {});
    let userParams = await browser.storage.local.get({
      usageStatCondition: "no monster",
      userId: "no monster",
      startTS: 0
    });
    let x = 'clickData_tabId_'+String(tabId);
    let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':-1,'pageId':'','numTrackers':0})});
    tabData = JSON.parse(tabData[x]);
    if(tabData.tabId == -1) return true
    //console.log('logLeave', JSON.stringify(tabData));
    if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
      let activityType='close dashboard page';
      let timestamp=Date.now();
      let userId=userParams.userId;
      let startTS=userParams.startTS;
      let activityData={
        'tabId':tabId,
        'parentTabId':tabData['tabId'],
        'parentDomain':tabData['domain'],
        'parentPageId':tabData['pageId'],
        'parentNumTrackers':tabData['numTrackers']
      }
      logData(activityType, timestamp, userId, startTS, activityData);
    }
    await browser.storage.local.remove([x]);
    //return null;
  }


//code to set user params once during the installation
//let sendUsage=true; //flag to send the usage data
//the usage flag in the userstudy.js named as usageStatCondition
let x = setUserParams();
//just send the db once when installed, it would be mostly empty
sendDb();

/////////////----- periodically send the hashed lovefield db data to server
//create alarm to run the usageDb function periodically
browser.alarms.create("lfDb", {delayInMinutes:720 ,  periodInMinutes:1440});

// code to periodically (each day) call sendDb() function
browser.alarms.onAlarm.addListener(function(alarm){
  //the first call throws error and fails, so calling twice, possibly some
  //database worker issue
    sendDb();
    sendDb();
});

function printlog(msg){console.log(msg);}

window.hashit=hashit;
window.hashit_salt=hashit_salt;
window.logData=logData;
window.printlog=printlog;

/************* Detecting if tab or window is closed ************/
browser.tabs.onRemoved.addListener(logLeave)

/************** END Instrucmentation ********************************/
