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
let recordedRequests = [];

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
function readTextFile(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

readTextFile('lib/disconnect.json', function(data) {
  processServices(data);
});

function processRequest(details) {
  if (details.tabId == browser.tabs.TAB_ID_NONE || details.tabId == -1) {
    return;
  }

  let parsedRequest = document.createElement('a');
  parsedRequest.href = details.url;

  // are first-parties trackers?

  let parsedTab = document.createElement('a');
  parsedTab.href = details.tabURL;
  // get hostname for active tab

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

function logRequest(details) {
  recordedRequests.push(details);
}

/*
 * Runs after request completed, processes recorded requests
 */

// there are probably bugs with certain edge cases such as closing tab before page load finishes
// if all items in matches array's aren't cleared out when they should be they might end up in the wrong place
async function onLoadFinish(tabId, changeInfo, tab) {
  if (changeInfo.status && changeInfo.status == 'complete') {

    let tab = await browser.tabs.get(tabId);

    let parsedTab = document.createElement('a');
    parsedTab.href = tab.url;

    let matches = [];
    for (request of recordedRequests) {
      // if (request.tabId === tabId) {
        const match = processRequest(request);
        if (match && matches.indexOf(match) === -1) {
          matches.push(match);
        }
      // }
    }
    // console.log(matches);
    recordedRequests = [];

    let dbInfo = {
      title: tab.title,
      domain: parsedTab.hostname,
      path: parsedTab.pathname,
      protocol: parsedTab.protocol,
      trackers: matches
    }
    storePage(dbInfo);

    return;
  }
}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);

browser.tabs.onUpdated.addListener(onLoadFinish);
