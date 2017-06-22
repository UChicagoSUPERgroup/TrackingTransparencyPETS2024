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

async function logRequest(details) {
  let parsedRequest = document.createElement('a');
  parsedRequest.href = details.url;

  // are first-parties trackers?
  // if they aren't, we'll want to do something like this below
  // get hostname for active tab
  let activeTabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  let tab = activeTabs[0];
  let parsedTab = document.createElement('a');
  parsedTab.href = tab.url;
  // some more code goes here…
  // compare domain of tab with domain of request

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
  
  if (match) {
    console.log("we have a tracker! " + match);
    let dbInfo = {
      title: tab.title,
      domain: parsedTab.hostname,
      trackerdomain: match,
      path: parsedTab.pathname,
      protocol: parsedTab.protocol
    }
    storePage(dbInfo);
  }
}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);
