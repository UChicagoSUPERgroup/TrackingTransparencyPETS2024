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

var pageId;
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
    const req = requestsQueue.pop();
    if (!req) break;

    const match = trackerMatch(req);
    const info = mainFrameRequestInfo[req.parentRequestId];
    if (match && info && info.trackers && info.trackers.indexOf(match) === -1) {
      info.trackers.push(match);
      storeTracker({
        trackerdomain: match,
        pageId: req.parentRequestId
      })
    }
  }
}


async function logRequest(details) {

  let mainFrameReqId;
  if (details.type === "main_frame") {
    // // set new page id
    // mainFrameReqId = details.timeStamp;
    // tabRequestMap[details.tabId] = mainFrameReqId;
    // updateMainFrameInfo(details);
    return;
  }

  details.parentRequestId = tabRequestMap[details.tabId];

  requestsQueue.push(details);
}

// called by either onBeforeRequest or onDOMContentLoaded listener
// accepts details object from either one
async function updateMainFrameInfo(details) {

  if (details.frameId !== 0 || details.tabId === -1) {
    // console.log("nope");
    return;
  }
  const mainFrameReqId = details.timeStamp;
  tabRequestMap[details.tabId] = mainFrameReqId;
  console.log("webNavigation onCommitted - url:", details.url, "id:", mainFrameReqId);

  const tab = await browser.tabs.get(details.tabId);

  let parsedURL = document.createElement('a');
  parsedURL.href = details.url;
  mainFrameRequestInfo[mainFrameReqId] = {
    url: details.url,
    pageId: mainFrameReqId,
    domain: parsedURL.hostname,
    path: parsedURL.pathname,
    protocol: parsedURL.protocol,
    title: tab.title,
    trackers: []
  }
  storePage(mainFrameRequestInfo[mainFrameReqId]);
}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

browser.webNavigation.onCommitted.addListener(updateMainFrameInfo);

setInterval(processQueuedRequests, 5000);
