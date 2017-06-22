/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
var services = {};

/* The supplementary domain names, regexes, and categories. */
var filteringRules = {};

/* The matching regexes and replacement strings. */
var hardeningRules = [];

/* The rest of the matching regexes and replacement strings. */
var moreRules = [];

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* from Disconnect services.js */
/* Formats the blacklist. */
function processServices(data) {
  data = deserialize(data);
  var categories = data.categories;

  for (var categoryName in categories) {
    var category = categories[categoryName];
    var serviceCount = category.length;

    for (var i = 0; i < serviceCount; i++) {
      var service = category[i];

      for (var serviceName in service) {
        var urls = service[serviceName];

        for (var homepage in urls) {
          var domains = urls[homepage];
          var domainCount = domains.length;

          for (var j = 0; j < domainCount; j++)
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
  // console.log(services);
});

function logRequest(details) {
  let parser = document.createElement('a');
  parser.href = details.url;
  let match = null;
  if (services.hasOwnProperty(parser.hostname)) {
    match = parser.hostname;
  } else {
    let arr = parser.hostname.split('.');
    let domain = arr[arr.length -2] + '.' + arr[arr.length - 1]
    if (services.hasOwnProperty(domain)) {
      match = domain;
    }
  }
  
  if (match) {
    console.log("we have a tracker! " + match);
  }
}

browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ["<all_urls>"]}
);
