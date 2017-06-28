
/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
let services = {};

let requestsQueue = [];

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

readTextFile('/lib/disconnect.json').then(data => {
  processServices(data);
});

/*
 * given a request object, returns a tracker if the request is
 * to known tracker, otherwise returns null
 */
function trackerMatch(details) {

  // let parsedRequest = document.createElement('a');
  // parsedRequest.href = details.url;
  let parsedRequest = parseUri(details.url);

  // TODO: maybe exclude first parties

  // let parsedTab = document.createElement('a');
  // parsedTab.href = details.tabURL;
  // let parsedTab = parseUri(details.tabURL);

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

onmessage = function(m) {
  console.log('Message received from main script');
  switch (m.data.type) {
    case "new_webrequest":
      requestsQueue.push(m.data.details);
      break;
  }
}

setInterval(processQueuedRequests, 5000);

// TODO: import this code from another file

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
