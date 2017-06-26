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

/* The web requests that have been recorded, to be processed and cleared out after page loads */
let requestsQueue = [];

let tabRequestMap = {};
let mainFrameRequestInfo = {};

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
  }
  details.parentRequestId = tabRequestMap[details.tabId];

  requestsQueue.push(details);
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

// function storeDatabaseInfo(parentRequestId) {
//   // get tab info and fill into database
//   let parsedTab = document.createElement('a');
//   parsedTab.href = tab.url;

//   // let dbInfo = {
//   //   title: tab.title,
//   //   domain: parsedTab.hostname,
//   //   path: parsedTab.pathname,
//   //   protocol: parsedTab.protocol,
//   //   trackers: await trackers,
//   //   categoryinference: await inferredData
//   // }
//   // storePage(dbInfo);
// }

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]},
  ["blocking"]
);

setInterval(processQueuedRequests, 5000)
