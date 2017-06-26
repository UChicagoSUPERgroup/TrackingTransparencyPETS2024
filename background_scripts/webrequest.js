/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
let services = {};

/* The supplementary domain names, regexes, and categories. */
let filteringRules = {};

/* The matching regexes and replacement strings. */
let hardeningRules = [];

/* The rest of the matching regexes and replacement strings. */
let moreRules = [];

let requestsQueue = [];
let tabRequestMap = {};
let mainFrameRequestInfo = {};

var pageID;
/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* from Disconnect services.js */
/* Formats the blacklist. */
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

  filteringRules = data.filteringRules;
  hardeningRules = data.hardeningRules;
  moreRules = data.moreRules;
}

/* https://stackoverflow.com/a/34579496 */
// function readTextFile(file, callback) {
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

readTextFile('lib/disconnect.json').then(data => {
  processServices(data);
});

/*
 * given a request object, returns a tracker if the request is
 * to known tracker, otherwise returns null
 */
function trackerMatch(details) {

  let parsedRequest = document.createElement('a');
  parsedRequest.href = details.url;

  // TODO: maybe exclude first parties

  let parsedTab = document.createElement('a');
  parsedTab.href = details.tabURL;

  let match = null;
  if (parsedRequest.hostname in services) {
    match = parsedRequest.hostname;
  } else {
    let arr = parsedRequest.hostname.split('.');
    let domain = arr[arr.length -2] + '.' + arr[arr.length - 1]
    if (domain in services) {
      match = domain;
    }
  }
  return match;
}

/*
 * reads from requests queue and adds items to main frame visit objects
 */
function processQueuedRequests() {
  while (true) {
    req = requestsQueue.pop();
    if (!req) break;

    let match = trackerMatch(req);
    let info = mainFrameRequestInfo[req.parentRequestId];
    if (match && info && info.trackers && info.trackers.indexOf(match) === -1) {
      info.trackers.push(match);
    }
  }
}


async function logRequest(details) {


  let mainFrameReqId;
  if (details.type === "main_frame") {
    // console.log("main frame request", "url:", details.url, "originUrl:", details.originUrl, "requestId:", details.requestId);
    mainFrameReqId = details.timeStamp;
    tabRequestMap[details.tabId] = mainFrameReqId;
    if (details.tabId === -1) {
      return;
    }
    const tab = await browser.tabs.get(details.tabId);
    mainFrameRequestInfo[mainFrameReqId] = {
      url: tab.url,
      title: "",
      trackers: []
    }




  // Get Mock Data from Inferencing.js
  // This does not use the listener and should be deleted when we have real data
  // Pass data to inference object below
  mockData();

  let parsedRequest = document.createElement('a');
  parsedRequest.href = details.url;


  // are first-parties trackers?
  // if they aren't, we'll want to do something like this below
  // get hostname for active tab
  let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  let browsertab = activeTabs[0];
  let parsedTab = document.createElement('a');
  parsedTab.href = browsertab.url;
  // some more code goes here…
  // compare domain of tab with domain of request

  //let match = null;
  if (parsedRequest.hostname in services) {
    match = parsedRequest.hostname;
  } else {
    let arr = parsedRequest.hostname.split('.');
    let domain = arr[arr.length -2] + '.' + arr[arr.length - 1]
    if (domain in services) {
      match = domain;
    }
  }

  if (match) {
    console.log("we have a tracker! " + match);
    let pageInfo = {
      title: mainFrameRequestInfo[mainFrameReqId].title,
      domain: details.url,
      trackerdomain: match,
      path: parsedTab.pathname,
      protocol: parsedTab.protocol
    }
    storePage(pageInfo).then(function(results) {
      let trackerInfo = {
        trackerdomain: match,
        pageID: pageID = results[0]['id']
      }
      // THIS IS NOT REAL DATA, yet

      let inferenceInfo = {
        inference: _inference,
        inferenceCategory: _inferenceCat,
        threshold: _inferenceThreshold,
        pageID: pageID = results[0]['id']
      }
    storeTracker(trackerInfo);
    storeInference(inferenceInfo);

  });


  }

  details.parentRequestId = tabRequestMap[details.tabId];

  requestsQueue.push(details);
 }
}

// async function getTrackers(tabId) {
//   let matches = [];
//   for (request of requestsQueue) {
//     if (request.tabId === tabId) {
//       const match = processRequest(request);
//       if (match && matches.indexOf(match) === -1) {
//         matches.push(match);
//       }
//     }
//   }
//   // console.log(matches);
//   requestsQueue = requestsQueue.filter(x => x.parentRequestId !== parentRequestId);

//   return(matches);
// }


browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}

);
