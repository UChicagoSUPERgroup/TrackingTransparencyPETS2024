/** @module trackers_worker */

import domainEntityMap from '../../data/trackers/domainEntityMap.json';

import parseuri from 'parseuri';
import tt from '../../helpers';

// console.log("trackers worker running");
let databaseWorkerPort;

let trackersByPageId = {};

/** 
 * determines if a web request was for a tracker
 * 
 * @param  {Object} details - request object
 * @param {string} firstPartyHost - domain of page that originated request
 * @returns {string} domain of tracker, if request is known tracker domain
 */
function trackerMatch(details, firstPartyHost) {
  const parsedRequest = parseuri(details.url);
  let requestDomain = parsedRequest.host;

  let match = checkForMatch(requestDomain, firstPartyHost);
  if (!match) {
    const arr = parsedRequest.host.split('.');
    requestDomain = arr[arr.length -2] + '.' + arr[arr.length - 1];
    match = checkForMatch(requestDomain, firstPartyHost);
  }
  return match;
}
  
function checkForMatch(requestDomain, firstPartyHost) {

  const firstPartyEntity = domainEntityMap[firstPartyHost];
  const trackerEntity = domainEntityMap[requestDomain];

  if (!trackerEntity) return null;
  
  // check to make sure request didn't come from first party
  // including other domains controlled by first party
  // i.e. loads from other google domains on a google site doesn't count as a google tracker
  if (!trackerEntity ||
    (requestDomain === firstPartyHost) || 
    (firstPartyEntity && trackerEntity && (firstPartyEntity === trackerEntity))
  ) {
    return null;
  }

  // if we got here we have a known third-party tracker

  return {
    domain: requestDomain,
    name: domainEntityMap[requestDomain]
  }
}

/**
 * called when page is changed, recieves tabData from background script, processes webrequests to find trackers and sends to database
 * 
 * @param  {Object} tabData
 */
async function onPageChanged(oldPageId, trackers) {

  databaseWorkerPort.postMessage({
    type: 'store_tracker_array',
    pageId: oldPageId,
    trackers: trackers
  });
}

function processWebRequests(pageId, firstPartyHost, webRequests) {
  if (!trackersByPageId[pageId]) {
    trackersByPageId[pageId] = new Set();
  }

  for (;;) {
    const req = webRequests.pop();
    if (!req) break;

    const match = trackerMatch(req, firstPartyHost);
    if (match) {
      trackersByPageId[pageId].add(match.name);
    }
  }

  return Array.from(trackersByPageId[pageId]);
}

/**
 * function to run when message is received from background script
 */
onmessage = function(m) {
  let trackers = [];

  switch (m.data.type) {
  case 'database_worker_port':
    databaseWorkerPort = m.data.port;
    break;

  case 'page_changed':
    trackers = processWebRequests(m.data.oldPageId, m.data.firstPartyHost, m.data.webRequests);
    onPageChanged(m.data.oldPageId, trackers);
    break;

  case 'push_webrequests': 
    trackers = processWebRequests(m.data.pageId, m.data.firstPartyHost, m.data.webRequests);
    postMessage({
      id: m.data.id,
      type: 'trackers',
      pageId: m.data.pageId,
      trackers: trackers
    });
    break;
  }
};
