/** @module trackers_worker */

import parseUri from "parseUri.js";

importScripts('/lib/helpers.js'); 

// console.log("trackers worker running");
let databaseWorkerPort;

/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
let services = {};

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

readTextFile('../lib/disconnect.json').then(data => {
  processServices(data);
});


/** 
 * determines if a web request was for a tracker
 * 
 * @param  {Object} details - request object
 * @param {string} firstPartyHost - domain of page that originated request
 * @returns {string} domain of tracker, if request is known tracker domain
 */
function trackerMatch(details, firstPartyHost) {
  const parsedRequest = parseUri(details.url);

  if (parsedRequest.host === firstPartyHost) {
    return null;
  }

  let match = null;
  if (parsedRequest.host in services) {
    const domain = parsedRequest.host;
    match = {
        domain: domain,
        name: services[domain].name,
        category: services[domain].category
      }
  } else {
    const arr = parsedRequest.host.split('.');
    const domain = arr[arr.length -2] + '.' + arr[arr.length - 1]
    if (domain === firstPartyHost) {
      return null;
    }
    if (domain in services) {
      match = {
        domain: domain,
        name: services[domain].name,
        category: services[domain].category
      }
    }
  }
  return match;
}

/**
 * called when page is changed, recieves tabData from background script, processes webrequests to find trackers and sends to database
 * 
 * @param  {Object} tabData
 */
async function onReceiveTabData(tabData) {
  const firstPartyHost = tabData.domain;
  let requestsQueue = tabData.webRequests;
  let trackers = new Set();

  while (true) {
    const req = requestsQueue.pop();
    if (!req) break;

    const match = trackerMatch(req, firstPartyHost);
    if (match) {
      trackers.add(match.name);
      // {
      //   trackerdomain: match.domain,
      //   trackername: match.name,
      //   trackercategory: match.category
      // })
    }
  }

  databaseWorkerPort.postMessage({
    type: "store_tracker_array",
    pageId: tabData.pageId,
    trackers: trackers
  });
}

/**
 * function to run when message is received from background script
 */
onmessage = function(m) {
  switch (m.data.type) {
    case "database_worker_port":
      databaseWorkerPort = m.data.port;
      break;

    case "tab_data":
      onReceiveTabData(m.data.tabData);
      break;

  }
}
