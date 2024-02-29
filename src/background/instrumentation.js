import { queryDatabase } from './worker_manager';
import { hasTrackerBlocker } from './adblockChecking'
import loggingDefault from '../options/loggingDefault'

/// ///////// -- first set the uuid and the usage flag if they are not set
async function setUserParams () {
  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // console.log("\t\t\t\t\t ====> setting user params in instrumentation")
  // // check if the value is set
  // let userParams = await browser.storage.local.get({
  //   usageStatCondition: 'false',
  //   userId: 'no more tears2',
  //   mturkcode: 'no more tears2',
  //   startTS: 0
  // });
  // // this is the time when the user installed the app
  // if (userParams.startTS == 0) {
  //   let startTS = Date.now()
  //   await browser.storage.local.set({startTS: startTS})
  //   userParams.startTS = startTS;
  // }
  // // if usageStatCondition is not set then set it and store
  // // usageStatCondition should be set in options/loggingDefault.js
  // // if (userParams.usageStatCondition=='no more tears2'){
  // //  loggingDefault.setLoggingDefault();
  // // let x = await browser.storage.local.set({usageStatCondition: sendUsage})
  // // }
  // // console.log(userParams);

  // // if no mturk code then don't log stuff.
  // if (userParams.mturkcode == 'no more tears2') {
  //   // if there is no mturkid then do not log anything
  //   let x = await browser.storage.local.set({usageStatCondition: 'false'})
  //   // return
  // } else {
  //   // mturkcode is set, so set other parameters
  //   let uid = userParams.mturkcode;
  //   userParams.userId = uid;
  //   userParams.usageStatCondition = loggingDefault.setLoggingDefault();
  //   // let uid=Math.random().toString(36).substring(2)
  //   //        +(new Date()).getTime().toString(36);
  //   // console.log(uid)
  //   let salt = Math.random().toString(36).substring(2) +
  //           (new Date()).getTime().toString(36);
  //   await browser.storage.local.set({userId: uid})
  //   await browser.storage.local.set({salt: salt})

  //   // send a beacon that the user initialized app and created userparams
  //   // const blocker = await hasTrackerBlocker()
  //   const activityType = 'intialize logging'
  //   const timestamp = Date.now()
  //   const userId = uid
  //   const startTS = userParams.startTS
  //   let blockers_detail = await getAdblockers()
  //   let blocker = hasTrackerBlocker().then(n => {
  //     console.log(n)
  //     // console.log("that just came from n")
  //     const activityData = {
  //       hasTrackerBlocker: n,
  //       blockers_detail: blockers_detail,
  //     }
  //     logData(activityType, timestamp, userId, startTS, activityData);

  //   })
    
  // }
  // // if userId is not set, set it and store

  // /* if (userParams.userId==='no more tears2'){
  //   //uid = utilize both the random generator and time of install
  //   let uid=Math.random().toString(36).substring(2)
  //           +(new Date()).getTime().toString(36);
  //   //console.log(uid)
  //   await browser.storage.local.set({userId: uid})
  //   let salt=Math.random().toString(36).substring(2)
  //           +(new Date()).getTime().toString(36);
  //   await browser.storage.local.set({salt: salt})
  //   //return
  // } */

  // /* Now log the starting of the extension */
  // /* userParams = await browser.storage.local.get({
  //   usageStatCondition: 'no monster',
  //   userId: 'no monster',
  //   startTS: 0
  // }); */
  // // console.log("in send pop data")
  // // console.log(activityData)
  return true
}

async function getUserParams () {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // console.log("\t\t\t\t\t ====> getting user params in instrumentation")
  // let userParams = await browser.storage.local.get({
  //   usageStatCondition: 'no more tears2',
  //   userId: 'no more tears2',
  //   startTS: 0
  // });
  // // console.log('User parameters: ', userParams.usageStatCondition, userParams.userId, userParams.startTS)
}

async function sha256 (message) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // // encode as UTF-8
  // const msgBuffer = new TextEncoder('utf-8').encode(message);

  // // hash the message
  // const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // // convert ArrayBuffer to Array
  // const hashArray = Array.from(new Uint8Array(hashBuffer));

  // // convert bytes to hex string
  // const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  // return hashHex;
}

// currently hash just returns normal data
async function hashit (data) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // //now not hashing the trackers and interests
  // return data
  // //const hash = await sha256(String(data));
  // //return hash
}

async function hashit_salt (data) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // let salt = await browser.storage.local.get({salt: 'salt'});
  // const hash = await sha256(String(data) + String(salt.salt));
  // return hash;
}

// now write function to send database
async function sendDb () {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

 //  console.log("\t\t\t\t\t ====> send db in instrumentation")
 //  let userParams = await browser.storage.local.get({
 //    usageStatCondition: 'no monster',
 //    userId: 'no monster',
 //    startTS: 0
 //  });
 //  // if no PID then we don't want the data, return null 
 //  if (!userParams.userId.includes("-pid-")) { 
 //    console.log("\t\t\t\t\t ====> [-] no pid, no log", userParams.userId)
 //    return true 
 //  }
 //  // if usage condition is null just return
 //  if (!userParams.usageStatCondition) { return true }
 //  // var allData = await queryDatabase('getInferencesDomainsToSend', {});
 //  // var allData = await queryDatabase('getInferences', {});
 //  var allData_v2 = await queryDatabase('getInferencesDomainsToSend_v3', {});
 //  // hashing allData_v2
 //  for (let key of Object.keys(allData_v2)) {
 //     // console.log(allData_v2[key]) 
 //    let entry = allData_v2[key]
 //    // console.log(entry)
 //    if (entry.domain) {
 //      if (entry.ads != undefined) {
 //        for (let i = 0; i < entry.ads.length; i++){

 //          /* console.log(allData_v2[key].ads[i]) */
 //          delete allData_v2[key].ads[i]["dom"]; // to private, often includes homepage somewhere 
 //          allData_v2[key].ads[i].domain = await hashit_salt(allData_v2[key].ads[i].domain)
 //          allData_v2[key].ads[i].inference = await hashit(allData_v2[key].ads[i].inference)
 //          allData_v2[key].ads[i].inferencePath = await hashit(allData_v2[key].ads[i].inference)
 //          allData_v2[key].ads[i].url_landing_page_long = await hashit(allData_v2[key].ads[i].url_landing_page_long)
 //          allData_v2[key].ads[i].url_landing_page_short = await hashit(allData_v2[key].ads[i].url_landing_page_short)
 //        }
 //      }
      
 //      allData_v2[key].domain = await hashit_salt(entry.domain)
 //      allData_v2[key].hostname = await hashit_salt(entry.hostname)
 //      // allData_v2[key].inference = await hashit(entry.inference)
 //      // allData_v2[key].inferencePath = await hashit(entry.inferencePath)
 //      allData_v2[key].path = await hashit_salt(entry.path)
 //      allData_v2[key].title = await hashit_salt(entry.title)
 //      allData_v2[key].trackers = await hashit(entry.trackers)
 //    } if (key == "googleInferences_slice_current" && allData_v2['googleInferences_slice_current'][0].name) {

 //      // console.log(allData_v2['googleInferences_slice_current'].length)

 //      let total = allData_v2['googleInferences_slice_current'].length
 //      for (let p = 0; p < total; p++) {

 //        // console.log(entry)
 //        // console.log(entry.length)
 //        // console.log(allData_v2['googleInferences_slice_current'][0].name)
 //        allData_v2['googleInferences_slice_current'][p].name = await hashit_salt(allData_v2['googleInferences_slice_current'][p].name)
 //        for (let i = 0; i < allData_v2['googleInferences_slice_current'][p].data.length; i++) {
 //          allData_v2['googleInferences_slice_current'][p].data[i].account = await hashit_salt(allData_v2['googleInferences_slice_current'][p].data[i].account)
 //          // console.log(allData_v2['googleInferences_slice_current'][0].data[i])
 //          for (let q = 0; q < allData_v2['googleInferences_slice_current'][p].data[i].inferences.length; q++) {
 //            if (allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].type == 'my_name') {
 //              allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].value = await hashit_salt(allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].value)
 //            }
 //            if (allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].type == 'my_email') {
 //              allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].value = await hashit_salt(allData_v2['googleInferences_slice_current'][p].data[i].inferences[q].value)
 //            }
 //          }
 //        }
 //      }
 //    } if (key == "search_habits" && allData_v2['search_habits'][0] != undefined) {
 //      let total = allData_v2['search_habits'].length
 //      for (let i = 0; i < total; i++) {
 //        let entry = allData_v2['search_habits'][i]['data']
 //        // console.log(entry)
 //        // console.log(typeof(entry))
 //        if (entry[0][5] != undefined) {
 //          let domains = entry[0][5]
 //          let sanitized_domains = []
 //          console.log(domains)
 //          for (let domain of domains) {
 //            sanitized_domains.push(await hashit_salt(domain))
 //          }
 //          entry[0][5] = sanitized_domains
 //        }
 //        if (entry[0][7] != undefined) {
 //          let titles = entry[0][7]
 //          let sanitized_titles = []
 //          for (let title of titles) {
 //            sanitized_titles.push(await hashit_salt(title))
 //          }
 //          entry[0][7] = sanitized_titles
 //        }
 //      }
 //    } 
 //  }

 //  // // allData_v1 (TrTr 1.0)
 //  // for (var i = 0; i < allData.length; i++) {
 //  //   allData[i]['Pages']['domain'] = hashit_salt(allData[i]['Pages']['domain']);
 //  //   allData[i]['Inferences']['inference'] = hashit(allData[i]['Inferences']['inference']);
 //  //   allData[i]['Trackers']['tracker'] = hashit(allData[i]['Trackers']['tracker']);
 //  // }
 //  // console.log(allData)
 //  // for(const row of alldata){
 //  //  console.log(row)
 //  // }
 //  // var xs = cookie
 //  // let allData=""
 //  var data = new FormData();
 //  data.append('userId', userParams.userId);
 //  data.append('dumpTS', Date.now());
 //  data.append('startTS', userParams.startTS);
 //  data.append('version', EXT.VERSION); // global variable set by webpack
 //  data.append('dbname', 'getInferences');
 //  data.append('lfdb', JSON.stringify(allData_v2));

 //  // console.log(allData)
 //  console.log("\t\t\t\t\t ====> [+] lfdb data", allData_v2)
 //  // data.append('filename',xs.value+'.'+Date.now())
 //  var xhr = new XMLHttpRequest();
 //  // send asnchronus request
 //  xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/lfdb_second.php', true);
 //  // xhr.setRequestHeader("Content-Type", "application/json")
 //  xhr.send(data);

 //  /////////////////////////////////////////////////////////////////////////////////////////////
 //  // listening for answer 
	// // This will be called after the response is received
	// xhr.onload = function() {
	//   if (xhr.status != 200) { // analyze HTTP status of the response
	//     console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
	//   } else { // show the result
	//     console.log(`\t\t\t\t\t ====> [+] Done, got ${xhr.response.length} bytes`); // response is the server response
	//   }
	// };
	// xhr.onprogress = function(event) {
	//   if (event.lengthComputable) {
	//     console.log(`Received ${event.loaded} of ${event.total} bytes`);
	//   } else {
	//     console.log(`Received ${event.loaded} bytes`); // no Content-Length
	//   }

	// };
	// xhr.onerror = function() {
	//   console.log("Request failed");
	// };
	// /////////////////////////////////////////////////////////////////////////////////////////////
	
 //  console.log("\t\t\t\t\t ********************************** SENDING LFDB **********************************")
}

// now write fucntion to send activity data to server
function logData (activityType, timestamp, userId, startTS, activityData) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // console.log("\t\t\t\t\t ====> log data in instrumentation", "for user", userId)

  // if (!userId.includes("-pid-")) { 
  //   console.log("\t\t\t\t\t ====> [-] no pid, no log")
  //   return true 
  // }

  // var data = new FormData();
  // data.append('activityType', activityType);
  // data.append('timestamp', timestamp);
  // data.append('userId', userId)
  // data.append('startTS', startTS);
  // data.append('version', EXT.VERSION); // global variable set by webpack
  
  // // console.log('in logdata');
  // // console.log(activityData)

  // if (activityType == 'load dashboard home page' || activityType == 'load dashboard profile page') {
  //   // console.log("checking views")
  //   // console.log(localStorage.getItem("views"))
  //   if (localStorage.getItem("views") === null) {
  //     // console.log("views is empty")
  //     let temp = {"time": Date.now(), "count": parseInt(1)}
  //     localStorage.setItem("views", JSON.stringify(temp));
  //     // console.log("views set to", localStorage.getItem("views"))
  //   } else {
  //     // console.log("views is something")
  //     let views = JSON.parse(localStorage.getItem("views"))
  //     // console.log("this is views", views)
  //     // console.log(views)
  //     // 5 hours == 18000000 in ms
  //     if ((Date.now() - views['time']) >= 18000000) {
  //       console.log("\t\t\t\t\t ====> [+] not recent viewing of chrome extension, log this as new tally count!")
  //       let temp = {"time": Date.now(), "count": views['count'] += 1}
  //       localStorage.setItem("views", JSON.stringify(temp));
  //     } else {
  //       console.log("\t\t\t\t\t ====> [-] recent viewing of chrome extension, doesn't count!")
  //     }

  //     let most_recent_views = JSON.parse(localStorage.getItem("views"))
  //     activityData['view_count_as_reported_to_user'] = most_recent_views

  //   }
  // }

  // // console.log(activityData)
  // data.append('activityData', JSON.stringify(activityData));

  // // console.log("activity type==>" + activityType + "<==--", timestamp)
  // var xhr = new XMLHttpRequest();
  // // send asnchronus request
  // // console.log('sending req, ', activityType);
  // if (activityType == 'error') {
  //   xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/error_log.php', true);
  // } else {
  //   xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/activitylog_second.php', true);
  // }
  // // xhr.setRequestHeader("Content-Type", "application/json")
  // xhr.send(data);
  // console.log("\t\t\t\t\t ********************************** SENDING ACTIVITY **********************************")
}

/// function to detect if the window/tabs are closed
async function logLeave (tabId, removeInfo) {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // console.log("\t\t\t\t\t ====> log leave in instrumentation", removeInfo, tabId)
  // // console.log('In the log leave page ', tabId, removeInfo);
  // // logData('hehe', 0, 0, 0, {});
  // let userParams = await browser.storage.local.get({
  //   usageStatCondition: 'no monster',
  //   userId: 'no monster',
  //   startTS: 0
  // });
  // let x = 'clickData_tabId_' + String(tabId);
  // let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain': '', 'tabId': -1, 'pageId': '', 'numTrackers': 0})});
  // tabData = JSON.parse(tabData[x]);
  // if (tabData.tabId == -1) return true
  // // console.log('logLeave', JSON.stringify(tabData));
  // if (JSON.parse(userParams.usageStatCondition)) { // get data when the user load the page.
  //   let activityType = 'close dashboard page';
  //   let timestamp = Date.now();
  //   let userId = userParams.userId;
  //   let startTS = userParams.startTS;
  //   let activityData = {
  //     'tabId': tabId,
  //     'parentTabId': tabData['tabId'],
  //     'parentDomain': tabData['domain'],
  //     'parentPageId': tabData['pageId'],
  //     'parentNumTrackers': tabData['numTrackers']
  //   }
  //   logData(activityType, timestamp, userId, startTS, activityData);
  // }
  // await browser.storage.local.remove([x]);
}

async function firstInstall () {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////

  // console.log("\t\t\t\t\t ====> first install in instrumentation")
  // // code to set user params once during the installation
  // // let sendUsage=true; //flag to send the usage data
  // // the usage flag in the userstudy.js named as usageStatCondition
  // // console.log('Now at first install');
  // await setUserParams();

  // // just send the db once when installed, it would be mostly empty
  // await sendDb();
}

function setup () {

  ////
  /////
  /////// [no telemetry on release]
  /////
  ////
  
  // /** *********** Detecting if tab or window is closed ************/
  // browser.tabs.onRemoved.addListener(logLeave)

  // // for running in debugger and in external functions
  // window.sendDb = sendDb;
  // window.setUserParams = setUserParams;
  // window.logData = logData;
  // window.getUserParams = getUserParams;
  // window.hashit = hashit
  // window.hashit_salt = hashit_salt
}

export default {firstInstall, setup, hashit, hashit_salt, sendDb}
