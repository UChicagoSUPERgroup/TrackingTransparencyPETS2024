/** @module trackers_worker */

importScripts('/lib/parseUri.js'); 

// console.log("trackers worker running");
let databaseWorkerPort;

/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
let services = {};

let requestsQueue = [];

let trackerInfo = {};

/** destringifies an object
 * @param  {string} object
 */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/** 
 * takes the disconnect list object and formats it into the services object
 * 
 * from Disconnect browser extension code - services.js
 * 
 * @param  {Object} data
 */
function processServices(data) {
  data = deserialize(data);
  const categories = data.categories;

  for (let categoryName in categories) {
    const category = categories[categoryName];
    const serviceCount = category.length;

    for (let i = 0; i < serviceCount; i++) {
      const service = category[i];

      for (let serviceName in service) {
        const urls = service[serviceName];

        for (let homepage in urls) {
          const domains = urls[homepage];
          const domainCount = domains.length;

          for (let j = 0; j < domainCount; j++)
              services[domains[j]] = {
                category: categoryName,
                name: serviceName,
                url: homepage
              };
        }
      }
    }
  }
}

/** 
 * reads a json file with given path
 * 
 * credits: https://stackoverflow.com/a/34579496
 * 
 * @param  {string} path to file
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            resolve(rawFile.responseText);
        }
    }
    rawFile.send(null);
})}

readTextFile('/lib/disconnect.json').then(data => {
  processServices(data);
});


/** 
 * determines if a web request was for a tracker
 * 
 * @param  {Object} details - request object
 * @returns {string} domain of tracker, if request is known tracker domain
 */
function trackerMatch(details) {
  let parsedRequest = parseUri(details.url);

  // TODO: maybe exclude first parties

  let match = null;
  if (parsedRequest.host in services) {
    match = parsedRequest.host;
  } else {
    let arr = parsedRequest.host.split('.');
    let domain = arr[arr.length -2] + '.' + arr[arr.length - 1]
    if (domain in services) {
      match = domain;
    }
  }
  return match;
}


/** 
 * reads from requests queue and adds items to main frame visit objects
 */
function processQueuedRequests() {
  while (true) {
    const req = requestsQueue.pop();
    if (!req) break;

    const match = trackerMatch(req);
    const info = trackerInfo[req.tabId];
    if (match && 
        info && 
        info.mainFrameReqId === req.parentRequestId && 
        info.trackers && 
        info.trackers.indexOf(match) === -1) {
      info.trackers.push(match);
      // console.log("sending message to database worker");
      databaseWorkerPort.postMessage({
        type: "store_tracker",
        info: {
          trackerdomain: match,
          pageId: req.parentRequestId
        }
      });
    }
  }
}


/**
 * called when page is changed, updates mapping between page id and tab id
 * 
 * @param  {Object} details
 * @param {Number} details.tabId - tab id
 */
async function updateMainFrameInfo(details) {
  trackerInfo[details.tabId] = {
    mainFrameReqId: details.mainFrameReqId,
    trackers: []
  }
}

/**
 * function to run when message is received from background script
 */
onmessage = function(m) {
  switch (m.data.type) {
    case "database_worker_port":
      databaseWorkerPort = m.data.port;
      break;
    case "main_frame_update":
      updateMainFrameInfo(m.data.details);
      break;
    case "new_webrequest":
      // console.log('trackers_worker received new_webrequest msg');
      requestsQueue.push(m.data.details);
      break;

  }
}

setInterval(processQueuedRequests, 5000);
