/* file based off of https://github.com/duckduckgo/duckduckgo-privacy-extension/blob/418e30d36e1c24e27930acb534caeb3ffc81c6a8/scripts/importers/companyList.js */

var request = require('request');
var fs = require('fs');
/**
 * Major tracking networks data:
 * percent of the top 1 million sites a tracking network has been seen on.
 * see: https://webtransparency.cs.princeton.edu/webcensus/
 */
const majorNetworks = {
  'google': 84,
  'facebook': 36,
  'twitter': 16,
  'amazon.com': 14,
  'appnexus': 10,
  'oracle': 10,
  'mediamath': 9,
  'yahoo': 9,
  'maxcdn': 7,
  'automattic': 7
}

let domainEntityMap = {};
let companyData = {};

fs.readFile('disconnect.json', 'utf8', (err, body) => {
  let disconnectList = JSON.parse(body);

  for (var type in disconnectList.categories) {
    disconnectList.categories[type].forEach((entry) => {
            
      for (var name in entry) {
        for (var domain in entry[name]){
          if (entry[name][domain].length) {

            // ItIsAtracker is not a real entry in the list
            if (name !== 'ItIsATracker') {

              entry[name][domain].forEach((trackerURL) => {
                let major = majorNetworks[name.toLowerCase()] ? majorNetworks[name.toLowerCase()] : null;

                const split = domain.split('//');
                let trimmedDomain = split[split.length-1].slice(0,-1);
                
                let data = {'domain': trimmedDomain, 'type': type, 'percent': major};
                domainEntityMap[trackerURL] = name;
                companyData[name] = data;
              });
            }
          }
        }
      }
    });
  }

  // facebook, twitter, and google are classified under the "disconnect" category for legacy reasons
  // so we recategorize them under the correct categories
  companyData['Facebook'].type = 'Social';
  companyData['Twitter'].type = 'Social';
  companyData['Google'].type = 'Advertising'; // what is google? Mozilla splits Google into advertising, content, and social

  fs.writeFile('../src/data/trackers/domainEntityMap.json', JSON.stringify(domainEntityMap), (err) => { if(err) console.log(err)} );
  fs.writeFile('../src/data/trackers/companyData.json', JSON.stringify(companyData), (err) => { if(err) console.log(err)} );
});