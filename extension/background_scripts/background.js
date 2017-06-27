/* 
 * Tracking Transparency helpers
 * 
 * TODO: separate into more files as necessary
 * 
 */
var backgroundPage = browser.extension.getBackgroundPage();

/*
 * Runs after request completed, stores tracking transparency info
 */
function onLoadFinish(tabId, changeInfo, tab) {
  if (changeInfo.status && changeInfo.status == 'complete') {

    storeTabData(tab);

    return;
  }
}

function storeTabData(tab) {
  let tabId = tab.id;
  let tabData = badger.tabData[tabId];

  let tt_snitch_map = badger.storage.getBadgerStorageObject('tt_snitch_map');

  // we don't care about empty tabs
  if (tab.url === "chrome://newtab/") { return -1; }

  // this idea from https://gist.github.com/jlong/2428561
  let parser = document.createElement('a');
  parser.href = tab.url;

  const now = Date.now();

  const pageInfo = {
    protocol: parser.protocol,
    domain: parser.hostname,
    path: parser.pathname,
    title: tab.title,
    time: now,
  };

//   let trackers = badger.getAllOriginsForTab(tabId);
  let trackers = ["google.com", "doubleclick.com", "facebook.com"];

  for (const tracker_origin of trackers) {
    let firstParties = [];
    if (tt_snitch_map.hasItem(tracker_origin)) {
      firstParties = tt_snitch_map.getItem(tracker_origin);
    }
    firstParties.push(pageInfo);
    tt_snitch_map.setItem(tracker_origin, firstParties);
  }

  return;
}

/* 
 * picks a random tracker sample that isn't from the current domain
 */
function getRandomTrackerSample(origins, callback) {
  for (let i = 0; i < origins.length; i++) {
    let origin = backgroundPage.getBaseDomain(origins[i]);

    var entry = badger.storage.tt_snitch_map.getItem(origin);

    if (entry) {
      browser.tabs.query({active: true, lastFocusedWindow: true})
      .then(t => {
        console.log("starting promise chain");
        const tab = t[0];
        const currURL = tab.url;
        let parser = document.createElement('a');
        parser.href = currURL;
        const currDomain = parser.hostname;
        for (let entryItem in entry) {
          if (entryItem.domain !== currDomain) {
            // callback(null, entry[i]);
            return entryItem;
          }
        }
        // callback(new Error("site not found"));
        return null;
      })
      .then(otherFirstParty => {
        if (otherFirstParty) {
          let ret = {
            origin: origin,
            otherFirstParty: otherFirstParty
          };
          callback(null, ret);
        }
      })
      .catch(err => console.log(err));
    }

  }
}

function startListeners() {
  console.log("starting tracking transparency listeners");
  // chrome.webNavigation.onCompleted.addListener(webNavigationOnCompleted);
  browser.tabs.onUpdated.addListener(onLoadFinish);
}

startListeners();

