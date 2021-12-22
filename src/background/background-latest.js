/** @module background */

import tldjs from 'tldjs';

import {trackersWorker, databaseWorker, inferencingWorker, queryDatabase} from './worker_manager';
import overlayManager from './overlay_manager';
import instrumentation from './instrumentation';
// import adblockChecking from './adblockChecking'
import { getOption } from '../helpers';
// import loggingDefault from '../options/loggingDefault'

// import html2canvas from 'html2canvas';   // delete me later
// import domtoimage from 'dom-to-image';
const request = require('request')
const axios = require('axios')
import { parse } from 'node-html-parser';
import * as Papa from 'papaparse';
import Pattern from 'url-knife';

import { Readability } from '@mozilla/readability';

import {HashMap, LinkedHashMap} from '@mootable/hashmap';


//////////////////////////////////////
var ss = require("simple-storage");
// const {Cc, Ci} = require("chrome");
// const self = require("self");
const urlModule = require("url");
const tabsModule = require("tabs");
const Request = require("request").Request;


// // global objects for ad parsing 
// var whitelist = []; 
// var blacklist = [];
var href_blocklist = new Array()
//////////////////////////////////////




function load_list2() {

    const hashmap = new HashMap();

	Promise.all([
		fetch('https://easylist-downloads.adblockplus.org/easylist.txt'),
		fetch('https://adaway.org/hosts.txt'),
		fetch('https://pgl.yoyo.org/adservers/serverlist.php?hostformat=webclean'),
		fetch('https://sos-ch-dk-2.exo.io/noblt/RPZ/Hosts-database/full-alive.txt') // TODO slim me -- large, but looks like a really good list
	]).then(function (responses) {
		// Get a JSON object from each of the responses
		return Promise.all(responses.map(function (response) {
			return response.text();
		}));
	}).then(function (data) {
		// Log the data to the console
		let easylist = data[0]
		let adaway = data[1]
		let yoyo = data[2]
        let sos = data[3]

        console.log("[-] starting adaway grab...")
		var arr = adaway.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]
			if (line !== '' && line[0] !== '#' && line[0] !== ':') {
				let matcher = line.split('127.0.0.1 ')[1]

				if (matcher !== ' localhost') {
                    href_blocklist.push(matcher)
                    hashmap.set(matcher)
				}
				
			}
		}
        console.log("[+] DONE adaway grab")


        console.log("[-] starting easylist grab...")
		var arr = easylist.split("\n")
		for (let i = 0; i < arr.length; i++) {
			// console.log(arr[i])
			let line = arr[i]
			// if (line[0] == '|' && line[1]=="|") { // this is a domain (but we are on href, so take this out)
			// 	let matcher = line.split("||")[1]
			// 	matcher = matcher.split("^")[0] // drop any hard stop rules from 
			// 	matcher = matcher.split("*")[0] // keey everything before wildcard, becuase we will match on 'includes' not exact
			// 	matcher = matcher.split(",")[0] // easylist explains domain after comma, we don't need it
			// 	href_blocklist.push(matcher)
			// 	// console.log("matcher1 --" + matcher)
			// }
			if (line[0] == '#' && line[1] == '#' && line[2] =="a" && line[3] =="[" && line[4] =="h") { // this is an href
				let matcher2 = line.split('##')[1]
				var start = matcher2.indexOf('"');
				var rest_of_string = matcher2.substring(start + 1, matcher2.length) // add one for not finding the first quote
				// console.log(rest_of_string)
				var stop = rest_of_string.indexOf('"');
				matcher2 = rest_of_string.substring(0, stop)
                href_blocklist.push(matcher2)
                hashmap.set(matcher2)
				// console.log(rest_of_string.substring(0, stop) + "==> " + line)
			}
		}
        console.log("[+] DONE easylist grab")

		
        console.log("[-] starting yoyo grab...")
		var arr = yoyo.split("\n")
		for (let i = 0; i < arr.length; i++) {
			let line = arr[i]
			if (line.startsWith("pattern: ")) {
				// // too onerous
				// // console.log(line)
				// let match_part_regex = line.split("pattern: ")[1]
				// match_part_regex = match_part_regex.replace("://", ":\\/\\/")
				// match_part_regex = "pattern: " + "/" + match_part_regex +"/gm"
				// href_blocklist.push(match_part_regex)

				var start = line.indexOf("://") + 4
				let is_letter = line[start].match(/[a-z]/i) 
				if (is_letter !== null) {
					// console.log(line)
					let matcher3 = line.split("pattern: ^https?://")[1]
					// console.log(matcher3)
                    href_blocklist.push(matcher3)
                    hashmap.set(matcher3)
				}
				// console.log( line[start].match(/[a-z]/i)  )
			}
		}
        console.log("[+] DONE yoyo grab")

        console.log("[-] starting sos grab...")
        var arr = sos.split("\n")
        for (let i = 0; i < arr.length; i++) {
            let line = arr[i]
            if (line[0] != ' ' && line[0] != ';') {
                
                let matcher4 = line.split(" CNAME .")[0]
                
                href_blocklist.push(matcher4)
                hashmap.set(matcher4)
                
            }
        }
        console.log("[+] ... ending sos grab")

		// personal adds
		href_blocklist.push("prod-m-node-1113.ssp.yahoo.com")
        href_blocklist.push("pages.ebay.com")
        href_blocklist.push("ssp.yahoo")
        href_blocklist.push("adclick.g.")
        // console.log(href_blocklist)
        // console.log(hashmap)
        // console.log(hashmap.has("adclick.g"))

        browser.storage.local.set({href_blocklist: href_blocklist})
        console.log("[+] DONE updating easylist, adaway, pgl.yoyo, and sos-ch-dk-2 adServers! Total strings: ", href_blocklist.length)

	}).catch(function (error) {
		// log error
		console.log(error);
	});

}





































let ME = "123"


// alert(details)


// loads specified list of uris and returns as array of strings
// Usage:
//       load_list(String filename)

function load_list() {

  const response = fetch('https://easylist-downloads.adblockplus.org/easylist.txt')
   .then(response => response.text())
   .catch(err => console.log(err))

  response.then(
    v => {

			var txtArr = v.split("\n")
			categorize(txtArr)
    }
  )

  // const response_second = fetch('https://adaway.org/hosts.txt')
  //  .then(response_second => response_second.text())
  //  .catch(err => console.log(err))

  // response_second.then(
  //   v2 => {

		// 	var txtArr2 = v2.split("\n")
		// 	categorize(txtArr2)
  //   }
  // )

  return;

    // // Use this for loading the Easylist from online
    // var easylist;

    // Request({
    //     url: "https://easylist-downloads.adblockplus.org/easylist.txt",
    //     onComplete: function (response) {
    //     		console.log(response)
    //         categorize(response.text.split("\n"));
    //     }
    // }).get();
    // return easylist;

    // Use this for loading Easylist from file
    // return self.data.load("easylist/easylist.txt").split("\n");
}

// Categorizes the easylist into a whitelist and a blacklist. It also divides 
// the blacklist into general domains, exact domains, and just by parts. All 
// arrays are stored as global variables because they will need to get used 
// repeatedly during the life of program
// Usage:
//       categorize(String[] list)

function categorize(easylist) {
    var rules = [];
    var exceptions = [];
    var i;
    // divides easy list into blacklist and exceptions in blacklist (whitelist)
    for (i in easylist) {
        var line = easylist[i];
        //DOESN'T add any lines with two hashes in them, they are not requests
        if (line.indexOf("##") == -1 && line.indexOf("#@#" != -1)) {
            if (line.match(/^@@.*/)) {
                exceptions.push(line);
            } else {
                if (line.charAt(0) != "!") {
                    rules.push(line);
                }
            }
        }
    }
    for (i in rules) {
        var line = rules[i];
        if (line.match(/^\|\|.*/)) {
            line = line.substring(2, line.length)
        }
        blacklist.push(line);
    }
    for (i in exceptions) {
        var line = exceptions[i];
        if (line.match(/^@@.*/)) {
            if (line.match(/^\|\|.*/)) {
                line = line.substring(4, line.length)
            }
            else {
                line = line.substring(2, line.length)
            }
        }
        else if (line.match(/^\|\|.*/)) {
            line = line.substring(2, line.length)
        }
        whitelist.push(line);
    }

    // console.log("'" + whitelist.join("','") + "'")
    // console.log("'" + blacklist.join("','") + "'")
    // console.log(blacklist)
    // console.log(whitelist)
    console.log(is_Ad("https://1fdd52dc6c008ac86aef645a976cf0a0.safeframe.googlesyndication.com/safeframe/1-0-38/html/container.html"))

}


// This function returns if the following is image or not, "image" if image 
// and "~image" if not an image
// Usage:
//       is_image(String url)

function is_image(url) {
    var arr = url.split(".");
    var ext = arr[arr.length - 1];

    if (ext == "png" || ext == "rif" || ext == "tif" || ext == "tiff" || ext == "jpeg" ||
        ext == "jpg" || ext == "pcd" || ext == "jif" || ext == "gif" || ext == "jfif" ||
        ext == "jp2" || ext == "jpx" || ext == "pcd") {
        return "image";
    }
    else {
        return "~image";
    }
}

// This function returns if the following is script or not, "script" if script 
// and "~script" if not a script
//Usage:
//      is_script(String url)

function is_script(url) {
    var arr = url.split(".");
    var ext = arr[arr.length - 1];

    if (ext == "js") {
        return "script";
    }
    else {
        return "~script";
    }
}

// This function returns if the following is object or not, "object" if object 
// and "~object" if not an object
// Usage:
//       is_object(String url)

function is_object(url) {
    var arr = url.split(".");
    var ext = arr[arr.length - 1];

    if (ext == "swf" || ext == "class") {
        return "object";
    }
    else {
        return "~object";
    }
}

// This function returns if the following is stylesheet or not, "stylesheet" if stylesheet 
// and "~stylesheet" if not a stylesheet
// Usage:
//       is_stylesheet(String url)

function is_stylesheet(url) {
    var arr = url.split(".");
    var ext = arr[arr.length - 1];

    if (ext == "css") {
        return "stylesheet";
    }
    else {
        return "~stylesheet";
    }
}

// This function returns if the following is thirdparty or not, "thirdparty" if thirdparty
// and "~thirdparty" if not a thirdparty
// Usage:
//       is_thirdparty(String url)

function is_thirdparty(url) {
    //url = url request. window.location.hostname = host of current page
    //var hostname = window.location.hostname;

    //urlModule.URL(chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){return (d[0].url)})).host
    
    var hostname = ME;
    alert(hostname)
    if (hostname.indexOf("www") == 0) {
        hostname = hostname.replace("www.", "");
    }

    if (url.match(escape_reg_exp(hostname))) {
        return "~third-party";
    }
    else return "third-party";
}

//returns a JSON object representing the URL passed as a parameter.
// Usage: 
//       JSONObject parseUri(String sourceUri)
function parseUri(sourceUri) {
    var uriPartNames = ["source", "protocol", "authority", "domain", "port", "path", "directoryPath", "fileName", "query", "anchor"],
        uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
        uri = {};

    for (var i = 0; i < 10; i++) {
        uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }

    /* Always end directoryPath with a trailing backslash if a path was present in the source URI
     Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key */
    if (uri.directoryPath.length > 0) {
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }

    if (uri.domain.indexOf("www.") == 0) {
        uri.domain = uri.domain.substring(4, uri.domain.length);
    }

    return uri;
}

// Changes string rule into regular expression equivalent for comparison. This
// is so the request domain can be matched against the AdBlock rule.
// Usage:
//       escape_reg_exp(String rule)

function escape_reg_exp(str) {
    var newStr = str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\$\|]/g, "\\$&");
    newStr = newStr.replace("^", "\($|\/|\:\)");
    newStr = newStr.replace("*", "\(.*\)");
    newStr = newStr + "\(.*\)"
    return new RegExp(newStr);
}


// Determines whether or not a request URL is an ad or not. This is the 
// function that will be called by the other classes. The method first checks
// the request against the user blacklist. Then it checks the default AdBlock
// blacklist for a match. If there is a match, it checks the request against 
// the whitelist. If a request matches the blaclist and the whitelist, it is 
// not an ad, but otherwise, it is. If there is no match at all, the request
// is, by default, not an ad.
// Usage:
//       is_Ad(String url_request)

function is_Ad(url) {
    for (var i = 0; i < blacklist.length; i++) {
        if (parseUri(url).domain.match(escape_reg_exp(blacklist[i]))) {
            return true;
        }
    }
    if (is_blacklisted(url)) {
        if (is_whitelisted(url))
            return false;
        else return true;
    }
    else return false;
}

function is_whitelisted(url) {
    return matching_urls(url, whitelist);
}

function is_blacklisted(url) {
    return matching_urls(url, blacklist);
}


// This function is the main functionality of adblock_filter.js. This function
// checks a single request against a given list (whitelist/blacklist in our
// case) and then checks for additional options at the end of the the rule 
// (separated by a "$" delimeter). These options are then parsed and each rule
// is assigned file types it should and should not be applied to. If the 
// file type matches the rule's file types to block, it is blocked. Otherwise,
// it is not. 
// Usage:
//       matching_urls(String url, String[] rule_list)

function matching_urls(url, rule_list) {

    for (var i = 0; i < rule_list.length; i++) {

        var domain = rule_list[i].split("$");

        if (url.match(escape_reg_exp(domain[0]))) {
            // if there are no additional options and the url matches the rule,
            // return true.
            if (domain.length == 1) {
                return true;
            }

            //else, if additional options are present, check them all
            else {

                var options = domain[1].split(",");
                var domain_present = false;
                var domain_sublist = "";
                var blocked_rule;
                var negated = false;

                if (options[0].indexOf("~") == 0) {
                    negated = true;
                }

                for (var p = 0; p < options.length; p++) {
                    if (options[p].indexOf("domain=") != -1) {
                        domain_present = true;
                        domain_sublist = options[p].replace("domain=", "").split("|");
                    }

                    // since our rule consisted of several possible types of file types
                    // and different origins we decided creating an "object-like" structure
                    // would make the most sense. our object is basically a pool of all the
                    // possible type the rule can be, and whenever one of hte options is true
                    // it gets set to true in the object

                    // the later code inside this loop simply modifies this object as
                    // the url gets further parsing

                    // if ~ exists, we know all the rules will be negated 
                    if (negated == true) {
                        blocked_rule = {
                            "stylesheet": true,
                            "script": true,
                            "obj": true,
                            "image": true,
                            "obj_sub": true,
                            "subrequest": true
                        };
                        if (options[p] == "~stylesheet") {
                            blocked_rule.stylesheet = false;
                        }
                        else if (options[p] == "~script") {
                            blocked_rule.script = false;
                        }
                        else if (options[p] == "~object") {
                            blocked_rule.obj = false;
                        }
                        else if (options[p] == "~image") {
                            blocked_rule.image = false;
                        }
                        else if (options[p] == "~object-subrequest") {
                            blocked_rule.obj_sub = false;
                        }
                        else if (options[p] == "~subdocument") {
                            blocked_rule.subrequest = false;
                        }
                    }
                    else {
                        blocked_rule = {
                            "stylesheet": false,
                            "script": false,
                            "obj": false,
                            "image": false,
                            "obj_sub": false,
                            "subrequest": false
                        };
                        if (options[p] == "stylesheet") {
                            blocked_rule.image = true;
                        }
                        else if (options[p] == "script") {
                            blocked_rule.script = true;
                        }
                        else if (options[p] == "object") {
                            blocked_rule.obj = true;
                        }
                        else if (options[p] == "image") {
                            blocked_rule.image = true;
                        }
                        else if (options[p] == "obj_sub") {
                            blocked_rule.obj_sub = true;
                        }
                        else if (options[p] == "subdocument") {
                            blocked_rule.subrequest = true;
                        }
                    }

                }


                if (blocked_rule.stylesheet == false && blocked_rule.script == false &&
                    blocked_rule.obj == false && blocked_rule.image == false && blocked_rule.obj_sub == false
                    && blocked_rule.subrequest == false) {
                    blocked_rule = {"stylesheet": true, "script": true, "obj": true, "image": true, "obj_sub": true}
                }

                if (is_image(url) == "image") {
                    if (!blocked_rule.image) {
                        return false;
                    }

                }
                else if (is_stylesheet(url) == "stylesheet") {
                    if (!blocked_rule.stylesheet) {
                        return false;
                    }
                }
                else if (is_script(url) == "script") {
                    if (!blocked_rule.script) {
                        return false;
                    }
                }
                else if (is_object(url) == "object") {
                    if (!blocked_rule.obj) {
                        return false;
                    }
                }

                if (options.indexOf("third-party") != -1 && is_thirdparty(url) == "~third-party") {
                    return false;
                }

                else if (options.indexOf("~third-party") != -1 && is_thirdparty(url) == "third-party") {
                    return false;
                }

                // in this portion we iterate over the domains if any are present, these domains can
                // either be accepted or negated
                var n;
                if (domain_present) {
                    if (domain_sublist[0].indexOf("~") != -1) {
                        for (n = 0; n < domain_sublist.length; n++) {
                            if (ME.match(escape_reg_exp(domain_sublist[n].replace("~", "")))) {
                                return false;
                            }
                        }
                    }
                    else {
                        var matched = false;
                        for (n = 0; n < domain_sublist.length; n++) {
                            if (ME.match(escape_reg_exp(domain_sublist[n]))) {
                                matched = true;
                            }
                        }
                        if (!matched) return false;
                    }
                }
            }
            return true;
        }
    }
    ;

    return false;
}












































// used in google inferences
let google_ad_categories = {};

let tabData = {};

// used to filter out same-page logged ads 
let seen_it = new Set();

let seen_it2 = new Set();
let seen_it3 = new Set();

// filled with updated disconnect information
var companyData = new Object();
var domainEntityMap = new Object();

let pendingTrackerMessages = {};
let trackerMessageId = 0;

async function onInstall (details) {
  // also runs on update
  if (details.reason === 'install') {
    const welcomePageData = {
      active: true,
      url: '../dist/welcome.html'
    }

    await browser.tabs.create(welcomePageData)
  }
}
browser.runtime.onInstalled.addListener(onInstall)

// set up default for logging, currently it is true.
// loggingDefault.setLoggingDefault();

// set up instrumentation
// console.log("[+] attempting instrumentation setup")
// instrumentation.setup()

// async function hashit(data){return instrumentation.hashit(data)}
// async function hashit_salt(data){return instrumentation.hashit_salt(data)}

/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping () {
  return 'ping'
}
window.ping = ping;

/* listener for all outgoing web requests */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate)
browser.webNavigation.onDOMContentLoaded.addListener(onDOMContentLoaded)
browser.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated)

/* listener for tab close */
browser.tabs.onRemoved.addListener(clearTabData);

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish); // for pages that do fancy javascript to change urls // cuases double hits on pages/inferences check out later

/** Sends a message with information about each outgoing
 * web request to trackers worker.
 *
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest (details) {
  if (details.type === 'main_frame') {
    // for main frame page loads, ignore
    return
  }

  // alert(JSON.stringify(details))

  if (tabData[details.tabId]) { 
    let dets_url = details.url;
    let dets_type = details.type; 
    let dets_initiator = details.initiator;
    // console.log(dets)
    //*** https://pgl.yoyo.org/as/serverlist.php?showintro=0;hostformat=hosts ***// 
    //*** https://stackoverflow.com/a/11326942 ***//
    //*** dets.includes("tpc.googlesyndication.com/simgad/") ***//
    // where initaiator is same as first party domain
    // where it is image or sub_frame (can be html)

   //  if (dets_url.includes("s0.2mdn.net")) {
   //   console.log(dets_url);
   //  }

   //  if (dets_url.includes("s0.2mdn.net") && (dets_type === 'sub_frame') && (!dets_url.includes('richmedia'))) {
      // let temp = tabData[details.tabId]
      // // alert(JSON.stringify(temp))
      // // console.log(temp)
      // console.log(details)
      // console.log(dets_url.length)
      // console.log(temp)


      // // ///////////// super hack for show //////////////////
      // let adInfo = {
      //  url: dets_url,
      //  initiator: dets_initiator,
      //  pageId: tabData[details.tabId].pageId,
      //  domain: tabData[details.tabId].domain,
      // };
      // // console.log("sending inference to database");
      // databaseWorker.postMessage({
      //  type: 'store_ad',
      //  info: adInfo
      // });

   //  }
    tabData[details.tabId].webRequests.push(details)
  }
}

function isMainFramePage (details) {
  const { tabId, frameId, url } = details
  return (frameId === 0 &&
    tabId !== -1 &&
    tabId !== browser.tabs.TAB_ID_NONE &&
    url.startsWith('http') &&
    !url.includes('_/chrome/newtab')) &&
    !browser.extension.inIncognitoContext
}

function onBeforeNavigate (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return 

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId)
  }

  const pageId = Date.now()
  let urlObj = new URL(url)

  const domain = tldjs.getDomain(urlObj.hostname) || urlObj.hostname

  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: domain,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    url: url,
    webRequests: [],
    trackers: []
  }

  // to make sure we have pageId
  if (details.url.includes('adssettings.google.com/authenticated') || details.url.includes('adssettings.google.com/u/')) { // authenticated path so we know user is logged in

    let path_detail; 
    if (details.url.includes('adssettings.google.com/u/')) {
        console.log("secondary+ login")
        path_detail = details.url
    } else if (details.url.includes('adssettings.google.com/authenticated')) {
        console.log("primary login")
        path_detail = null
    }

  	update_google_ads_settings(path_detail)

    // console.log("[+] google inference observed")

    // try {
    // 	console.log("[+] sending it away")
    //   chrome.tabs.sendMessage(details.tabId, {
    //     type: 'google_inferences',
    //     pageId: pageId
    //   })
    // } catch (e) {
    //   console.log("[-] There was an error in ad dom capture:" + e)
    // }
  }


  // update google adsSettings scraper every 5th page visit 
  // checks on how often google is updating 
  function check_n(n) {
    let how_often = 10
    if (n%how_often == 0) {
        // alert("updating because were at " + n)
        update_google_ad_list()
    }
  }
  // ping on google adSettings 
  let num_pages_current = queryDatabase('getNumberOfPages', {})
  num_pages_current.then(n => check_n(n))


}

async function onDOMContentLoaded (details) {
  const { tabId } = details
  if (!isMainFramePage(details)) return

  // we now have title
  // so we can add that to tabdata and push it to database
  const tab = await browser.tabs.get(details.tabId)
  if (tab.incognito) {
    // we don't want to store private browsing data
    tabData[tabId] = null
    return
  }
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })
  // now fetch and store the favicon database
  // fetchSetGetFavicon(url, faviconUrl)

  // //////////////////////////////////////////////////////////////////////////// super hack for show ///////
  // // if (details.url === 'https://adssettings.google.com/authenticated'){
  // if (details.url.includes('https://adssettings.google.com/')) {

  //   chrome.tabs.executeScript(details.tabId,{
  //       frameId: details.frameId,
  //       file: 'dist/feeler.js',
  //       matchAboutBlank: true,
  //       "allFrames" : true
  //   },function(result){
  //       console.log("checked out adSettings")
  //   });
  // }





    // const rp = require('request-promise');
    // const url = 'https://adssettings.google.com';

    // const inferences = new Array();
    // // this is redundant, fix later

    // alert(window)

    // rp(url)
    //   .then(function(html){
    //     //success!

    //     var parser = new DOMParser();
    //     var htmlDoc = parser.parseFromString(html, 'text/html');
    //     console.log(htmlDoc);
    //     var outer_element = htmlDoc.getElementsByClassName("c7O9k");

    //     // if "lSvC9c " then interest (ad category) or attribute
    //     // if "lSvC9c <something>" then advertiser 

    //     const info = new Array()

    //     var outer_outer = htmlDoc.getElementsByClassName("JRGAPc");  //JRGAPc
    //     alert(outer_outer.length)
    //     for(var i = 0;i < outer_outer.length; i++){

    //       // console.log(outer_outer[i])
    //       let subs = outer_outer[i].getElementsByTagName('*');

    //       let key; 
    //       let value;


    //       // console.log(v)

    //       for (var q = 0; q < subs.length; q++) {
    //         // console.log(subs[q])

    //         if (subs[q].className == 'lSvC9c ') {
    //           // this is an interest or demographic //console.log(subs[q].src.split('/')[6])
    //           key = "-"
    //         } else if (subs[q].className.includes('lSvC9c')) {
    //           key = "interest - company"
    //         } if (subs[q].className == 'c7O9k') {
    //           value = subs[q].textContent
    //         }

    //         if (value !== undefined && key !== undefined) {

    //           if (key == "-") {
    //             try {
    //               // console.log(value + " --> and lookup --> " + google_ad_categories[value])
    //               let value_with_full_google_categories = google_ad_categories[value]
    //               if (value_with_full_google_categories == undefined) {
    //                 key = "demographic"
    //                 value = value
    //               } else {
    //                 key = "interest"
    //                 value = value_with_full_google_categories
    //               }
    //             } catch(e) {
    //               console.log(e)
    //             }
    //           }


    //           var entry = {};
    //           entry[key] = value
    //           // alert(entry)
    //           info.push(entry)
    //         }

    //       }
    //     }

    //     console.log(info)

    //     for(var i = 0;i < outer_element.length; i++){
    //       inferences.push(outer_element[i].textContent)
    //     }

    //     // alert(inferences)
    //     // get metadata
    //     let pageId = tabData[tabId].pageId;

    //     // ///////////// super hack for show //////////////////
    //     let googleInfo = {
    //       inferences: inferences,
    //       pageId: pageId,
    //     };

    //     // alert(JSON.stringify(googleInfo));

    //     // store the ad in database
    //     databaseWorker.postMessage({
    //       type: 'store_google_inference',
    //       info: googleInfo
    //     });

    //   })
    //   .catch(function(err){
    //     //handle error
    //     alert("Grab - ERROR - make me a background async function later")
    //   });
  
  // }

}

async function onHistoryStateUpdated (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  // check if url is changed
  // a lot of pages (yahoo, duckduckgo) do extra redirects
  // that call this function but really aren't a page change
  if (tabData[tabId].hostname) {
    const u = new URL(url)
    const h1 = u.hostname.split('www.').pop()
    const h2 = tabData[tabId].hostname.split('www.').pop()
    const p1 = u.pathname
    const p2 = tabData[tabId].path
    if (h1 === h2 && p1 === p2) return
  }

  // simulate a new page load
  onBeforeNavigate(details)

  const tab = await browser.tabs.get(details.tabId)
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })


  // // update our page activity information                                                  //gawker          //TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO//TODO
  // let exit_event = Date.now()
  // let activity_event = {type: "exit event", value: exit_event}
  // let activity_info = {
  //   pageId: tabData[tabId].pageId,
  //   activity_event: activity_event
  // };
  // // store the ad in database
  // databaseWorker.postMessage({
  //   type: 'update_page',
  //   info: activity_info
  // });

}

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/
/*
async function fetchSetGetFavicon(url, faviconurl){
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    //already stored favicon
    //and the favicon is same as before
    if(checkFav[x]['faviconurl']==faviconurl){
      return checkFav[x]['favicondata'];
    }
  }
  if(faviconurl==''){
    //no favicon for this tab
    await browser.storage.local.set(
      {[x]: {
        'url':url,
        'faviconurl':faviconurl,
        'favicondata':''}
      }
    );
    return '';
  }
  var favicon = new XMLHttpRequest();
  favicon.responseType = 'blob';
  favicon.open('get', faviconurl);
  favicon.onload = function() {
    var fileReader = new FileReader();
    fileReader.onloadend = async function() {
      // fileReader.result is a data-URL (string) in base 64 format
      x = 'favicon_'+url
      await browser.storage.local.set(
        {
          [x]: {
            'url':url,
            'faviconurl':faviconurl,
            'favicondata':fileReader.result
          }
        });
    };
    // favicon.response is a Blob object
    fileReader.readAsDataURL(favicon.response);
  };
  favicon.send();
  checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  return checkFav[x]['favicondata'];
}
window.fetchSetGetFavicon=fetchSetGetFavicon;
*/

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
/*
async function getFavicon(url) {
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    return checkFav[x]['favicondata'];
  }
  return ''
}
window.getFavicon=getFavicon;
*/

/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 *
 * also clears per-page-ad data to reserve
 * new-page-same-ad occurrence 
 *
 * @param  {number} tabId - tab's id
 */
function clearTabData (tabId) {

  if (!tabData[tabId]) {
    return;
  }

  // clear out the ads seen by one page, because it is a 
  // new page wherever you go next
  // alert(Array.from(seen_it))
  seen_it.clear()
  seen_it2.clear()
  seen_it3.clear()

  // old placement of update trackers
  // has bug where tracker count won't update until you move away from page
  trackersWorker.postMessage({
    type: 'page_changed',
    oldPageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests,
    updatedTrackerData: domainEntityMap,
  });

  tabData[tabId] = null;
}


/**
 * forces update of tab data
 * web requests are queued in tabData, and then when this function is called
 * they are pushed to the trackers worker, which evaluates whether they are trackers
 * and if so stores them in the database
 *
 * this function also sends the updated data to the in-page overlay
 *
 * @param  {number} tabId - tab's id
 */
async function updateTrackers (tabId) {

  console.log("[+] updating trackers")

  if (typeof tabData[tabId] === 'undefined') {
    return;
  }



  let messagePromise = new Promise((resolve) => {
    pendingTrackerMessages[trackerMessageId] = resolve;
  });

  trackersWorker.postMessage({
    id: trackerMessageId,
    type: 'push_webrequests',
    pageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests,
    updatedTrackerData: domainEntityMap,
  });
  trackerMessageId++;
  tabData[tabId].webRequests = [];

  let trackers = await messagePromise;
  tabData[tabId].trackers = trackers;

  // // update trackers, used to simluate ajax on tracker counts
  // // same page shows tracker count even before move-away
  // trackersWorker.postMessage({
  //   type: 'page_changed',
  //   oldPageId: tabData[tabId].pageId,
  //   firstPartyHost: tabData[tabId].domain,
  //   webRequests: tabData[tabId].webRequests,
  //   updatedTrackerData: domainEntityMap,
  // });


}

async function onPageLoadFinish (details) {

  // signal content script to make an inference (parent frame)

  // alert(JSON.stringify(details))
  // if (details.url == "about:blank") {
  //   return
  // }



  if (details.frameId === 0) {

    console.log(details)

    // not an iframe
    const tabId = details.tabId
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'make_inference'
      })
    } catch (e) {
      console.log(e)
    }

    // extra stuff for overlay (ghostery condition)
    const data = await getTabData(tabId)
    const showOverlay = await getOption('showOverlay')
    if (showOverlay === true) {
      overlayManager.createOrUpdate(tabId, data)
    }

    // const frameId = details.frameId
    // try {
    //   chrome.tabs.sendMessage(tabId, {
    //     type: 'get_ad_links',
    //     options: frameId,
    //   })
    // } catch (e) {
    //   console.log(e)
    // }

  // //////////////////////////////////////////////////////////////////////// captures less for some reason
  // console.log(details.url) 
  // try {
  // chrome.tabs.sendMessage(tabId, {
  // type: 'ad_dom'
  // })
  // } catch (e) {
  // console.log("There was an error in ad dom capture:" + e)
  // }

  // tabData[tabId].pageId

  // alert(tabData[tabId].pageId)


  ///////////////////////////////////////////////////////////////////////////// default
    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/tester2.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {type: "filters", allowlist: whitelist, blocklist: blacklist});
        // // console.log("DONE (in parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + JSON.stringify(details))
    });
    ///////////////////////////////////////////////////////////////////////////// default

  }
  else {
    // console.log(details)
    // this is the non-parent frame
    // this is an iframe containing the ad, we capture relevant information here
    // include adlist here: https://pgl.yoyo.org/as/serverlist.php?hostformat=adblockplus
    // if (details.url.includes('adclick') || details.url.includes('googleadservices') || details.url.includes('s0.2mdn.net') || details.url.includes('doubleclick') || details.url.includes('googlesyndication'))  {


 /// captures less for some reason
  // console.log(details.url) 
  // const tabId = details.tabId
  // try {
  // chrome.tabs.sendMessage(tabId, {
  // type: 'ad_dom'
  // })
  // } catch (e) {
  // console.log("There was an error in ad dom capture:" + e)
  // }



    ///////////////////////////////////////////////////////////////////////////// default
    chrome.tabs.executeScript(details.tabId,{
        frameId: details.frameId,
        file: 'dist/tester2.js',
        matchAboutBlank: true,
        "allFrames" : true
    },function(result){
        // chrome.tabs.sendMessage(details.tabId, {pageId: tabData[tabId].pageId});
        // console.log("DONE (in non-parent) with frame " + details.frameId + " on tabId " + details.tabId + "\n" + JSON.stringify(details))
    });
    ///////////////////////////////////////////////////////////////////////////// default





    // }



  }

}

/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// note that we are using the CHROME api and not the BROWSER api
// because the webextension polyfill does NOT work with sending a response because of reasons
chrome.runtime.onMessage.addListener(runtimeOnMessage);

trackersWorker.onmessage = onTrackersWorkerMessage;
inferencingWorker.onmessage = onInferencingWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 *
 * @param  {number} tabId
 * @return {Object} tabData object
 */
async function getTabData (tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return null;
  } else {
    let data = tabData[tabId];

    await updateTrackers(tabId);

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

/**
 * takes google inferences and stores them in DB
 *
 * @param  {Object} google inferences scraped
 */
async function log_google_inference (message) {

  let info = message.article   

  // patch in updated google ad category information (fetched on startup)
  for (let i = 0; i < info.length; i++) {
    if (info[i].type == "-") {
      try {

        if (info[i].type == 'my_name' || info[i].type == 'my_email') {
             
        } else {
            // console.log(info[i].value + " --> and lookup --> " + google_ad_categories[info[i].value])
            let value_with_full_google_categories = google_ad_categories[info[i].value]
            if (value_with_full_google_categories == undefined) {
              info[i].type = "demographic"
              // info[i].value = info[i].value
            } else {
              info[i].type = "interest"
              info[i].value = value_with_full_google_categories
            }
        }


      }catch (e) {
        console.log(e)
      }
    }
  }

  let googleInfo = {
    inferences: info,
    pageId: message.pageId,
  };
  // store the ad in database
  databaseWorker.postMessage({
    type: 'store_google_inference',
    info: googleInfo
  });

  return;

}
window.log_google_inference = log_google_inference; // exposes function to other extension components

/**
 * facilitates bulk import of data
 * takes in JSON of data to import, passes to database
 *
 * @param  {Object} dataString - JSON with data to import
 */
async function importData (dataString) {
  databaseWorker.postMessage({
    type: 'import_data',
    data: dataString
  })
}
window.importData = importData;

/**
 * resets all data
 * sends message to database worker to empty database
 */
function resetAllData () {
  databaseWorker.postMessage({
    type: 'empty_db'
  })

  // TODO: send message to server to wipe all data
}
window.resetAllData = resetAllData;

/**
 * Run on message recieved from trackers worker.
 *
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 * @param  {Object} m.data.type - Message type, set by sender
 * @param  {Object} m.data.id - Message id, set by sender
 * @param  {Object} m.data.trackers - Array of trackers, given by sender
 */
function onTrackersWorkerMessage (m) {
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}

async function onInferencingWorkerMessage (m) {
  const tabId = m.data.info.tabId;
  if (m.data.type === 'page_inference') {
    tabData[tabId].inference = m.data.info.inference;
  }
  const showOverlay = await getOption('showOverlay')
  if (showOverlay === true) {
    overlayManager.createOrUpdate(tabId, tabData[tabId])
  }
}



////////////////////////////////////////////////////////// only for ads
export default function makeInference (htmlDoc) {

  let dupDoc = htmlDoc
  let reader = new Readability(dupDoc,{}); //readability expect doc
  let article = reader.parse();
  let text = article.textContent;

  if (!text || text.length === 0) {
    alert('xxx unable to extract text from page');
    return "error on text extract";
  }

  // send page text back to background script
  return text
}

function extractTextFromNode (node) {
  // node.tagName is in ALL CAPS
  if (node.tagName === 'FOOTER' || node.tagName === 'SCRIPT') {
    return '';
  }

  let res = node.innerText;
  for (let child of node.children) {
    res += (' ' + extractTextFromNode(child));
  }
  return res;
}
////////////////////////////////////////////////////////// only for ads



/**
 * listener function for messages from content script (from all content scripts)
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 *
 */
function runtimeOnMessage (message, sender, sendResponse) {
  let pageId;
  let domain;
  let query, tabDataRes;
  // sendResponse('swhooo');

  // alert(JSON.stringify(message.article)) //////////////////////////////////////////////////////////////////////////////////////////////////// this is content cleaned


 //   // captures a screenshot of visible tab and then crops it to ad size (but determinining ad size is hard)
  // chrome.tabs.captureVisibleTab(null,{},function(dataUrl){
  //  var img=new Image();
  //  img.crossOrigin='anonymous';
  //  var mod = dataUrl.replace("image/png", "image/octet-stream");
  //  img.onload=start;

  //  img.src=mod;
  //  function start(){
  //    var croppedURL=cropPlusExport(img,0,0,970,550);
  //    // console.log(croppedURL);
  //    // var cropImg=new Image();
  //    // cropImg.src=croppedURL;
  //    // document.body.appendChild(cropImg);
  //  }

  //  function cropPlusExport(img,cropX,cropY,cropWidth,cropHeight){
  //    // create a temporary canvas sized to the cropped size
  //    var canvas1=document.createElement('canvas');
  //    var ctx1=canvas1.getContext('2d');
  //    canvas1.width=cropWidth;
  //    canvas1.height=cropHeight;
  //    // use the extended from of drawImage to draw the
  //    // cropped area to the temp canvas
  //    ctx1.drawImage(img,cropX,cropY,cropWidth,cropHeight,0,0,cropWidth,cropHeight);
  //    // return the .toDataURL of the temp canvas
  //    return(canvas1.toDataURL());
  //  }

  // });


  switch (message.type) {
    case 'parsed_page':

      if (!sender.tab || !sender.url || sender.frameId !== 0) {
        // message didn't come from a tab, so we ignore
        alert("ignore because didn't come from tab")
        break;
      }
      if (!tabData[sender.tab.id]) {
        alert("ignore because dead pageId")
        break;
      }


      // alert("yo " + tabData[sender.tab.id].pageId + "-----" + sender.tab.id + "--- ")


      // pageId = tabData[sender.tab.id].pageId;


      // send page text off to inferencing web worker
      inferencingWorker.postMessage({
        type: 'content_script_to_inferencing',
        article: message.article,
        mainFrameReqId: tabData[sender.tab.id].pageId,
        tabId: sender.tab.id
      });
      // break;
      return true; // must do since calling sendResponse asynchronously

    case 'queryDatabase':
      query = queryDatabase(message.query, message.args);
      query.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously

    case 'getTabData':
      tabDataRes = getTabData(sender.tab.id);
      tabDataRes.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously


    case 'DOM':
    	// console.log(JSON.stringify(message))
    	let links = message.article.links 
    	let DOM_DOM = message.article.DOM

    	if (seen_it2.has(DOM_DOM) || seen_it3.has(links)) {
    		// console.log("Passing")
    	} else {
    		seen_it2.add(DOM_DOM)
    		seen_it3.add(links)

	    // 	if (is_Ad(links)) {
  			// 	console.log(links)
  			// 	// // sanity debugging 
  			// 	console.log(DOM_DOM)
				 //  // var parser1 = new DOMParser();
				 //  // var ishtml = parser1.parseFromString(DOM_DOM, 'text/html');
				 //  // // opens the ad in a new window and writes it for display
				 //  // var newWin = window.open("about:blank", "", "_blank");
				 //  // // console.log(ishtml.documentElement.innerHTML)
				 //  // newWin.document.write("<br><br>trigger: " + "case DOM" + "<br><br><br>" + "<!DOCTYPE html> <html> <body> <div style='zoom: 0.75; -moz-transform: scale(0.75); -moz-transform-origin: 0 0; position: absolute; left: 50px; top: 50px'>" + ishtml.documentElement.innerHTML + "<div> </body> </html>");
				 //  // // console.log(ishtml.documentElement.innerHTML)
				 //  // // newWin.document.write(ishtml.documentElement.innerHTML);
  			// }



    	}




    	// console.log(is_Ad("https://googleads.g.doubleclick.net/aclk?sa=l&ai=Ck7TzQzIlYaS6LompnASNxpW4DKLYt6BklvvG5rMOrgIQASCf-9kfYMmGo4fUo4AQoAGGjJGhA8gBAuACAKgDAcgDCKoE-QFP0PUlk1TDFeKH5wFrfe-xLBrJAIccrgsoji1OnN20Cwu1KQyF6L9V4r5gixh8ouS-PO8LwLPiTBw9GPRfFaEH2BZLMuIUXPM8_l5CRPOVHuOz-Se0C-Fhqd_rFS5u7U6JKJY-VTRaUwZFkMXm-BM-ymkzcDJdg1vHAtgtWsIa-ecSquSEDBFHj93s0rUzEn2LehmA_CcJ0yflkNusnBZI99d40nkJmfFpAW1n9ZU1ERM7N9pgyq4QiIgvGWpV9-wUhZ468MS9Y9xVv-Oqg6LwUeNIf-lgdSw0KJy03deJ9WSoixMO9w-81KeZ6-VD15jdTfa2ZAYsv1zABOfM_IbRA-AEAYgF96ie7DSgBgLYBgKAB-Lz7l6oB9XJG6gH8NkbqAfy2RuoB47OG6gHk9gbqAe6BqgH7paxAqgHpr4bqAfs1RuoB_PRG6gH7NUbqAeW2BuoB6qbsQLYBwGgCKWHqQSwCALSCAcIjGMQARgdsQlUo_-o7BgmKYAKA5gLAcgLAbgMAdgTA4IUDBoKbnlwb3N0LmNvbdAVAYAXAQ&ae=1&num=1&sig=AOD64_1dKY02jWsgBKQh5Z6zzuFotgPlmg&client=ca-pub-9386487545679073&nx=CLICK_X&ny=CLICK_Y&nb=2&adurl=https://rentrelief.maryland.gov") + "--" + details.url)
    	return true;

    // used to track time on websites
    case 'leaving_page':
      

      console.log("leaving page event (((" + JSON.stringify(message) + "))) -- " + tabData[sender.tab.id].pageId)

      let pageId = tabData[sender.tab.id].pageId
      // let title = tabData[sender.tab.id].title
      // let domain = tabData[sender.tab.id].domain
      // let hostname = tabData[sender.tab.id].hostname
      // let path = tabData[sender.tab.id].path
      // let protocol = tabData[sender.tab.id].protocol
      let activity_event = message.article.activity_event

      let activity_info = {
        pageId: pageId,
        // title: title,
        // domain: domain, 
        // hostname: hostname,
        // path: path,
        // protocol: protocol,
        activity_event: message.article
      };

      // alert('attempting to update pageId with exit or focus_event' + JSON.stringify(activity_info))

      // store the ad in database
      databaseWorker.postMessage({
        type: 'update_page',
        info: activity_info
      });

      return true; // must do since calling sendResponse asynchronously

    // used to log google ads settings content  
    case 'google_inference_done':

    	let ret;
      ret = log_google_inference(message);
      ret.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously


      // console.log("[+] storing google inference -- " + message.pageId)

      // let info = message.article 

      // // patch in updated google ad category information (fetched on startup)
      // for (let i = 0; i < info.length; i++) {
      //   if (info[i].type == "-") {
      //     try {
      //       // console.log(info[i].value + " --> and lookup --> " + google_ad_categories[info[i].value])
      //       let value_with_full_google_categories = google_ad_categories[info[i].value]
      //       if (value_with_full_google_categories == undefined) {
      //         info[i].type = "demographic"
      //         // info[i].value = info[i].value
      //       } else {
      //         info[i].type = "interest"
      //         info[i].value = value_with_full_google_categories
      //       }
      //     }catch (e) {
      //       console.log(e)
      //     }
      //   }
      // }
      // // console.log(info)

      // // alert("[+] logged" + tabData[Object.keys(tabData)].pageId)


      // let googleInfo = {
      //   inferences: info,
      //   pageId: message.pageId,
      // };
      // // store the ad in database
      // databaseWorker.postMessage({
      //   type: 'store_google_inference',
      //   info: googleInfo
      // });


      // // wrapper for waiting on pageId to not be undefined
      // let obj = {} || window;
      // (async() => {
      //   let _pageId = await new Promise(res => {
      //     Object.defineProperty(obj, "pageId", { set: res });
      //   });
      //   // alert(_pageId + "--" + tabData[Object.keys(tabData)].domain)
        
      //   let googleInfo = {
      //     inferences: info,
      //     pageId: _pageId,
      //   };


      //   // alert(JSON.stringify(googleInfo));

      //   // store the ad in database
      //   databaseWorker.postMessage({
      //     type: 'store_google_inference',
      //     info: googleInfo
      //   });

      //   // alert("[+] stored")

      // })();
      // setTimeout(async () => {
      //   try {obj.pageId = tabData[Object.keys(tabData)].pageId}
      //   catch (e) {alert("[bad fail] waiting on pageId: " + e)}
      // }, 100);

      // return true; // must do since calling sendResponse asynchronously





    case 'page_ads':
			// chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){
			//   alert(JSON.stringify(tabData[d[0].id].pageId) + " from another way" + JSON.stringify(tabData[d[0].id].domain));
			//   pageId = tabData[d[0].id].pageId
			//   domain = tabData[d[0].id].domain
			// })

			// alert("coming from (((" + message.article + ")))")

			// const str = `https://tsyndicate.com/do2/click?c=e0SgKROGTBk5c0TokDGDhYgwY-gslPGQzpmFImrUCGMjBo0cZVrcGIMjRwsaMcLgaJEjjAwYLXDEmGFjzJgZZHCUyTFDxMMwdcZkNBOmTAwxOWa2mGHGRg2UOGzEnBlx5BgxJsf0zFHjRo6fEMnYWTgjRg0cNB7CqSNmIQ0YN2AAhQPnrYwcD-fAmagjRo4bNR6OaWNXx4waNGg0BErGzMIYD8W4cUORxtSnkUW0cYORoQwcMtSKgMPZ88cYMXA8rCOHDcUbilPOFVFHRkY0dOjAmaPjxYuIbcqoeZPHxZg3bV4gZ8OmjMQ0b9zMedEmzBw6rcWEoRPdTYsxdeC8gCPnDRmhdKjfCePGeQuoMlqkcTMGzfzpCOmEEfPeThox5OCOvjNaoAMNOerAjsAW5CiIjTQWHKMFtuaYI48WrMNOuwGlA0-8H-qgo40v5nijtTHK6IEOAc0wI40xsAsjIS7qgAEGGWwQkUThyEijjjZ6mAKJJLIosooab8xxxy_GCKOwMNI4w40esvCIhhtaqGKKFqAYogUquHSCCitaKAKKsMhILqM72nShDDjekMMNhI5bc7AZF5JqNRGc7GsLhwTLsYu15BhKBxpcmEEkGAQT4Y3yDq2BUUfFeEwHGFyAQbMxSvsi0oUyhQExG_ISQQ47DIvhhoeeKy1UTR2to440MroBBxxgGCOGMmyArwYbyEAph4Na4G-GGYwNY6PtyNjUKBjCSsMwEVBz4SwbrrUBB0Vve0iOL6bNyFpsteV2Bm9rCyOjJt7QI43mwnihBk1BQKGJiOij44050NgBhCTcoKMMNkDAdwwQnpgCBCxAiAGGL8764oYUQAiiLueuKEOMJdKgY94ZblDUBnuXQIKKJphgAQQI1ygDhCOeW-ONiodAMLkyXshBBk1doKGGs66tIQcQpgijKDnSAFnkmsK6KaMtw5KzyUNFiPohNqouwok0y7DjCwdf88sroNGCizY5pnzrxtEO-jpAPR9y-4s2zqNoprbNg-whfsvie44v7ECorLMKfQOPPPYWgYw8KtOBxTrK-LaMSwfSjTffXmjzjjfjnLNO5JQL646MgIYpLDQyAi3XsOZANSPz9ttXjhbqcMPjFnB0wY3E5a5awS94D2tEyGzAK4eHZ0jLojZu88v4HJAfNa0bGBML7DL2-oK74o9PfnmIxOhrccqDYmOitbIOtQ8FAgI%3D&s=8b6c1afc59568ab446db41c349d9bfbde87ff0f6203c1fc5646ebb744ded9bdb1629910384`
			// alert(str.match(/^https?:\/\/tsyndicate.com/gm) )

			/////////////////////////////////////////////////////////// temporary patch
			/////////////////////////////////////////////////////////// still don't know why trigger multiple times
			if (seen_it.has(message.article.ad_landing_page_long)) { // used to be ad_landing_page_long
			  console.log("passing on: " + message.article.ad_landing_page_long)
			  // this must stay on, and be cleared at pageLeave
			  // otherwise you miss many ads that are served to the page
			  // to fix the duplicates, you could also turn off all-frames on the tester2 grabber
			  // but that means you will miss ads
			} else {

			  console.log("new: " + message.article.ad_landing_page_long)
			  seen_it.add(message.article.ad_landing_page_long)

			  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			  // var tab = tabs[0];
			  // var url_name = new URL(tab.url);
			  // var info = new Object();
			  // info.hostname = url_name.hostname
			  // info.domain = tldjs.getDomain(url_name.hostname) || url_name.hostname;
			  // alert(JSON.stringify(info))

			  // insert into DB the hostname,adInfo

			  // let pageId = tabData[tabId].pageId



			  // function waitForPageInformation(){
			  //     if(typeof tabData[Object.keys(tabData)].pageId !== "undefined" || typeof tabData[Object.keys(tabData)].domain !== "undefined"){
			  //         pageId = tabData[Object.keys(tabData)].pageId
			  //         domain = tabData[Object.keys(tabData)].domain
			  //     }
			  //     else{
			  //       alert("waiting for pageId")
			  //       setTimeout(waitForPageInformation, 250);

			  //     }
			  // }
			  // waitForPageInformation()
			  // // alert(JSON.stringify(tabData))
			  // alert(typeof tabData[Object.keys(tabData)].pageId)
			  // let tabId = Object.keys(tabData)
			  // let pageId = tabData[tabId].pageId
			  // let domain = tabData[tabId].domain


            //           ////////////////////////////////////////////////////////////////////////////
            //           ////////////////////////////////////////////////////////////////////////////
            //           ////////////////////////////////////////////////////////////////////////////
            // sanity debugging 
            var parser1 = new DOMParser();
            console.log(message.article.DOM)
            var ishtml = parser1.parseFromString(message.article.DOM, 'text/html');
            // opens the ad in a new window and writes it for display
            var newWin = window.open("about:blank", "", "_blank");
            // console.log(ishtml.documentElement.innerHTML)
            var logger = String(tabData[sender.tab.id].pageId)
            if( typeof logger == 'undefined' ) {
                logger = "error here"
            }

            // plain ad, fewer display issues 
            // newWin.document.write(message.article.DOM);

            newWin.document.write(`</head><br><br> pageId ` + logger + "<br><br>trigger: " + message.article.trigger + "<br><br><br>" + "ID: " + message.article.ID + "<br><br><br> oldHref:" + message.article.old_href + "<br><br><br> newHref:" + message.article.ad_landing_page_long + "<br><br><br>" + "caller: " + message.article.called_by + "<br><br><br>" + "landing page: " + message.article.ad_landing_page_long + "<br><br><br>" + "explanation: " + message.article.ad_explanation + "<br><br><br>" + `<!DOCTYPE html> <html><body> <div style='zoom: 0.75; -moz-transform: scale(0.75); -moz-transform-origin: 0 0; position: absolute; left: 50px; top: 50px'>` + ishtml.documentElement.innerHTML + "<div> </body> </html>");
            // console.log(ishtml.documentElement.innerHTML)
            // newWin.document.write(ishtml.documentElement.innerHTML);
            //           ////////////////////////////////////////////////////////////////////////////
            //           ////////////////////////////////////////////////////////////////////////////
            //           ////////////////////////////////////////////////////////////////////////////



			  ///////////////////////////////////////////////////////// also cannot use phantomJS within chrome extension 


			  // ////////////////////////////////////////////////////// not a great option because it will get very pricey 
			  // const data = {
			  //   html: ishtml.documentElement.innerHTML,
			  //   // css: ".box { border: 4px solid #03B875; padding: 20px; font-family: 'Roboto'; }",
			  //   // google_fonts: "Roboto"
			  // }
			  // request.post({ url: 'https://hcti.io/v1/image', form: data})
			  //   .auth("1008dd88-0590-4999-ab6b-dde7f7359f99", "aaef028d-2d63-44d4-ba43-c5ce001ff596")
			  //   .on('data', function(data) {
			  //     console.log(JSON.parse(data))
			  //   })
			  // // console.log(browser.windows.getCurrent())



			  ////////////////////////////////////////////////////// attempt at capturevisibletab 
			  // function logTabsForWindows(windowInfoArray) {
			  //   let counter = 1
			  //   for (let windowInfo of windowInfoArray) {
			  //     let current = windowInfoArray.length
			  //     if (counter == current) {
			  //       alert(JSON.stringify(windowInfo))
			  //       try {
			  //         // https://stackoverflow.com/questions/25964869/chrome-screenshot-works-only-when-extension-is-clicked-first
			  //         // this likely won't work because we are attempting to capture on about:blank
			  //         // captures a screenshot of visible tab and then crops it to ad size (but determinining ad size is hard)
			  //         chrome.tabs.captureVisibleTab(windowInfo.id,{},function(dataUrl){
			  //           console.log(dataUrl)
			  //         });
			  //       } catch (e) {
			  //         alert(e)
			  //       }
			  //     }
			  //     counter += 1
			  //     console.log(windowInfo.tabs.map(tab => tab.url));
			  //   }
			  // }
			  // function onError(error) {
			  //   console.log(`Error: ${error}`);
			  // }
			  // var getting = browser.windows.getAll({
			  //   populate: true,
			  //   windowTypes: ["popup"]
			  // });
			  // getting.then(logTabsForWindows, onError);




			  // console.log(ishtml.documentElement.innerHTML)


			  // // this is not the solution, the back-to-back ads are not seen here
			  // // query = queryDatabase("getAdMatch", "https://www.googleadservices.com/pagead/aclk?sa=L&ai=CTKTVJDDTYOX1L4GMxAP_4bcY7Lu0pF_hrvqh2Q22lZ3DxSIQASDJq6QgYMmGo4fUo4AQoAG8jbD8A8gBCeACAKgDAcgDCqoEhAJP0CSr5dJNIiwDGdvhqJ6crN6IYN-pOsqOQHC-jpC4lusTTlE-hj1x6b-euir4YrO4R8-iXiumZRZBwqrZ4LBNcQMPFZM7dNfg_Ab_pexrtSs46Oz2rXGn3yLRzRlgiHQwlY0v9TCN1y6gpQq-dAd2JhjBUv5oNM88JM3mLk3JvVbOg3veIcMSBSX8NXErlxte5x3rriKSlL1gSx3qZJxTvl6qBW1rUDrSMBiwBuaB1mV0N7uYWL3Zpty8MMjDwTuyQLV0AQxR16LTsja40bFfjvXr8dALWfrX1_FKhWVw8sdARoN2XhcAhdu6XGW_UbNcItpE4XAt0eJJMUDwYQWrk4kXUMAEoJ_Gy9YD4AQBiAXE1qj8BqAGLtgGAoAHrPLPA6gHipyxAqgH1ckbqAfw2RuoB_LZG6gHjs4bqAeT2BuoB7oGqAfulrECqAemvhuoB-zVG6gH89EbqAfs1RuoB5bYG9gHAKAIpYepBLAIAtIIBwiAIRABGB2xCShdekHTXvDBgAoDmAsByAsBgAwBuAwBuBOIJ9gTDYIUGRoXd3d3LnNtYWxsbmV0YnVpbGRlci5jb23QFQGYFgGAFwE&ae=1&num=1&cid=CAASEuRoHv6CVJNC8pb4kJZLAS-kiQ&sig=AOD64_21qxVdFyfU5_-T46d8UZChbOtq2g&client=ca-pub-9579993617424571&nb=8&adurl=https://www.iqair.com/us/lp/home-air-purifiers/healthproplus%3Futm_source%3DGoogle%26utm_medium%3DDisplay_Retargeting%26utm_campaign%3DHealthProPlus_Retargeting%26utm_source%3Dadwords%26utm_term%3D%26utm_campaign%3D%26utm_medium%3Dppc%26hsa_tgt%3Daud-1186894138038%26hsa_src%3Dd%26hsa_mt%3D%26hsa_net%3Dadwords%26hsa_cam%3D1871326020%26hsa_kw%3D%26hsa_acc%3D8638054135%26hsa_ver%3D3%26hsa_ad%3D528660016013%26hsa_grp%3D126323101600%26gclid%3DEAIaIQobChMI5Zf1yuet8QIVAQZxCh3_8A0DEAEYASAAEgJ9DfD_BwE");
			  //   var string_to_check = String(message.article.ad_landing_page_long)
			  //   alert(string_to_check)
			  //   query = queryDatabase("getAdMatch", string_to_check);
			  //   query.then(ret => console.log("THIS IS AD COMPARE STRING\n" + ret + String(message.article.ad_landing_page_long)));

			  // alert(JSON.stringify(tabData))
			  // alert(Object.keys(tabData).length)


			  ////////////////////////////////////////////////////////////////////
			  // [0] instantiate
			  ////////////////////////////////////////////////////////////////////
			  // alert(JSON.stringify(tabData[sender.tab.id].pageId))
			  const ad_info = new Object();


			  ////////////////////////////////////////////////////////////////////
			  // [1] get ad explanation 
			  ////////////////////////////////////////////////////////////////////

			  // get the ad expalantion text
			  // *** this should be a background function that collects and logs information *** //
			  // const rp = require('request-promise');

			  // if (String(message.article.ad_explanation) !== "undefined") {
			  //   try {
			  //     axios.get(String(message.article.ad_explanation)) //rp(url)
			  //       .then(function(html) {
			  //         //success!
			  //         var parser = new DOMParser();
			  //         var htmlDoc = parser.parseFromString(html.data, 'text/html');
			  //         var outer_element = htmlDoc.getElementsByClassName("Xkwrgc"); //Xkwrgc EmJRVd
			  //         const temp = new Set()
			  //         for (var i = 0; i < outer_element.length; i++) {
			  //           temp.add(outer_element[i].outerText)
			  //         }
			  //         ad_info.explanation = Array.from(temp);
     //                  alert(ad_info.explanation + "--" + message.article.ad_explanation)
			  //       })
			  //       .catch(function(err) {
			  //         //handle error
			  //         alert("ERROR Grab on ad explanation - " + err)
			  //       });
			  //   } catch (err) {
			  //     ad_info.explanation = new Array("unable to grab OR none provided");
			  //   }
			  // } else {
			  //   message.article.ad_explanation = new Array("none provided by advertiser");
			  //   ad_info.explanation = new Array("none provided by advertiser");
			  // }
     //          alert(ad_info.explanation)

			  ////////////////////////////////////////////////////////////////////
			  // [2] get the ad's inferred interest by visiting the ad 
			  ////////////////////////////////////////////////////////////////////



                // axios.get(String(message.article.ad_landing_page_long))
                //   .then(function(response){
                //     //console.log(response.data); // ex.: { user: 'Your User'}
                //     console.log(response.status); // ex.: 200
                //     console.log("axios!! " + response.request.responseURL)
                //     console.log("DOMAIN " + tldjs.getDomain(response.request.responseURL) )
                //   });  


              let backup_string = ''
			  axios.get(String(message.article.ad_landing_page_long))// rp(message.article.ad_landing_page_long)
			    .then(function(html) {
			      //success!
                  backup_string = html.request.responseURL
                  console.log(html)
			      var parser = new DOMParser();
			      var htmlDoc = parser.parseFromString(html.data, 'text/html');
			      // console.log(htmlDoc)
			      // 1. get cleaned text ==> inferencing.js
			      // ad_info.text = extractTextFromNode(htmlDoc.body); // this is an old function, let the inferencing worker do it for us 
                  ad_info.text = makeInference(htmlDoc) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			      // send page text back to background script
			      // send page text off to inferencing web worker
			      // 2. get inference ==> inferencing.worker.js
			      // 3. store inference in ad information 


			      // let pageId = tabData[sender.tab.id].pageId;
			      // let domain = tabData[sender.tab.id].domain;
			      // let landing_page_short = tldjs.getDomain(message.article.ad_landing_page_long) || message.article.ad_landing_page_long



                    // message.article.ad_explanation = new Array("none provided by advertiser");
                    ad_info.explanation = new Array("none provided by advertiser");

                    axios.get(String(message.article.ad_explanation)) //rp(url)
                        .then(function(html2) {
                          //success!

                          if (message.article.ad_explanation.includes('adchoices?')) {
                                // parsing doesn't work here for some reason, using string method
                                let str = html22.data
                                let start = str.split("You have enabled ad personalization</b>.")[1]
                                let end = start.split("</mat-card>")[0]
                                let reasons = end.replace(/(<([^>]+)>)/gi, "")
                                ad_info.explanation = [reasons]
                                alert([reasons])

                                // var htmlDoc = parser.parseFromString(html22, 'text/html');
                                // console.log(String(html22.data))

                                // .querySelector( '.mat-card-content' ).textContent 
                                // console.log("poof2", html22.querySelector( '.mat-card-content' ))
                                // var outer_element = html22.data.querySelector( '.mat-card-content' ) 
                                // const temp = new Set()
                                // for (var i = 0; i < outer_element.length; i++) {
                                //     temp.add(outer_element[i].outerText)
                                // }
                          }
                          if (message.article.ad_explanation.includes('/whythisad')) {
                              var parser = new DOMParser();
                              var htmlDoc = parser.parseFromString(html2.data, 'text/html');
                              var outer_element = htmlDoc.getElementsByClassName("Xkwrgc"); //Xkwrgc EmJRVd
                              const temp = new Set()
                              for (var i = 0; i < outer_element.length; i++) {
                                temp.add(outer_element[i].outerText)
                              }
                              ad_info.explanation = Array.from(temp);
                              // alert(ad_info.explanation + "--" + message.article.ad_explanation)
                          }




                          ////////////////////////////////////////////////////////////////////
                          // [3] log information, using pageId and domain and tabId
                          ////////////////////////////////////////////////////////////////////

                          if (ad_info.text != "error on text extract") {
                            inferencingWorker.postMessage({
                              type: 'content_script_to_inferencing__forad',
                              article: ad_info.text,
                              pageId: tabData[sender.tab.id].pageId,
                              domain: tabData[sender.tab.id].domain,
                              // url: message.article.ad,
                              // initiator: message.article.initiator,
                              url_explanation: message.article.ad_explanation,
                              url_landing_page_long: message.article.ad_landing_page_long,
                              url_landing_page_short: backup_string,
                              explanation: ad_info.explanation,
                              dom: message.article.DOM //"stub",//message.article.DOM,
                            });
                          }

                        })
                        .catch(function(err) {
                          //handle error
                          console.log("ERROR Grab on ad explanation - " + err + "--- "+ String(message.article.ad_explanation))

                          ////////////////////////////////////////////////////////////////////
                          // [3] log information, using pageId and domain and tabId
                          ////////////////////////////////////////////////////////////////////

                          // let explanation_url; 
                          // if (message.article.ad_explanation != "undefined") {
                          //   explanation_url = essage.article.ad_explanation
                          // } else {
                          //   explanation_url = "none"
                          // }

                          if (ad_info.text != "error on text extract") {
                            inferencingWorker.postMessage({
                              type: 'content_script_to_inferencing__forad',
                              article: ad_info.text,
                              pageId: tabData[sender.tab.id].pageId,
                              domain: tabData[sender.tab.id].domain,
                              // url: message.article.ad,
                              // initiator: message.article.initiator,
                              url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                              url_landing_page_long: message.article.ad_landing_page_long,
                              url_landing_page_short: backup_string,
                              explanation: new Array("none provided by advertiser"),
                              dom: message.article.DOM //"stub",//message.article.DOM,
                            });
                          }







                        });





			      // // TODO this needs to be redone because you won't have first tab always and also 
			      // // TODO you don't want to have a timeout 
			      // // chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){return (tabData[d[0].id].pageId)})
			      // // wrapper for waiting on pageId to not be undefined
			      // let obj = {} || window;
			      // (async () => {
			      //   let _pageId = await new Promise(res => {
			      //     Object.defineProperty(obj, "pageId", {
			      //       set: res
			      //     });

			      //   });
			      //   // alert(_pageId + "--" + tabData[Object.keys(tabData)].domain)


			      //   inferencingWorker.postMessage({
			      //     type: 'content_script_to_inferencing__forad',
			      //     article: ad_info.text,
			      //     pageId: tabData[sender.tab.id].pageId,
			      //     domain: tabData[sender.tab.id].domain,
			      //     // url: message.article.ad,
			      //     // initiator: message.article.initiator,
			      //     url_explanation: message.article.ad_explanation,
			      //     url_landing_page_long: message.article.ad_landing_page_long,
			      //     // url_landing_page_short: landing_page_short,
			      //     explanation: ad_info.explanation,
			      //     dom: message.article.DOM //"stub",//message.article.DOM,
			      //   });
			      // })();
			      // setTimeout(async () => {
			      //   try {
			      //     obj.pageId = tabData[Object.keys(tabData)].pageId
			      //   } catch (e) {
			      //     alert("[also bad fail] waiting on pageId: " + e)
			      //   }
			      // }, 200);


			    })
			    .catch(function(err) {
			      //handle error
			      
			      console.log(message)

					  // inferencingWorker.postMessage({
		     //      type: 'content_script_to_inferencing__forad',
		     //      article: "none",
		     //      pageId: tabData[sender.tab.id].pageId,
		     //      domain: tabData[sender.tab.id].domain,
		     //      // url: message.article.ad,
		     //      // initiator: message.article.initiator,
		     //      url_explanation: message.article.ad_explanation,
		     //      url_landing_page_long: message.article.ad_landing_page_long,
		     //      // url_landing_page_short: landing_page_short,
		     //      explanation: ad_info.explanation,
		     //      dom: message.article.DOM //"stub",//message.article.DOM,
		     //    });
                      if (String(message.article.ad_explanation) == "undefined") {
                        // we are passing on this, 
                        // something to fix in the adGrabbing
                      }


					  // alert("INNER Grab - ERROR -" + err + " -- " + "attempting to " +  message.article.ad_landing_page_long)
					  console.log("INNER Grab - ERROR -" + err + " -- " + "attempting to " + message.article.ad_landing_page_long)
                        // error likely occurs because the webpage is pulled from a script tag redirect
                      console.log("script based redirect")
                      console.log(Pattern.UrlArea.normalizeUrl(message.article.ad_landing_page_long))
                      console.log(Pattern.UrlArea.normalizeUrl(backup_string))
                    // onlyParamsJsn url 
                    // onlyParamsJsn rdct_url
                    // onlyParamsJsn adurl
                    // what if we logged the information anyways
                    console.log("sending ad to database anyways, without full information")
                        inferencingWorker.postMessage({
                          type: 'content_script_to_inferencing__forad',
                          article: "redirect error",
                          pageId: tabData[sender.tab.id].pageId,
                          domain: tabData[sender.tab.id].domain,
                          // url: message.article.ad,
                          // initiator: message.article.initiator,
                          url_explanation: message.article.ad_explanation ? message.article.ad_explanation : "none",
                          url_landing_page_long: message.article.ad_landing_page_long,
                          url_landing_page_short: backup_string,
                          explanation: new Array("none provided by advertiser"),
                          dom: message.article.DOM //"stub",//message.article.DOM,
                        });


                      
                      // axios.get(String(message.article.ad_landing_page_long)).then(function(html) {
                      //   const root = parse(html.data)
                      //   console.log(root.toString())

                      //   var newWin = window.open("about:blank", "", "_blank");
                      //   newWin.document.write(``);



                      // })
                    
			    });




			  // })

			}



			// chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){
			//   return processTab(tabData[d[0].id]);
			// })

			// function processTab(data){
			//     // Use url & tab as you like
			//     alert(JSON.stringify(data.pageId));
			// }


			}

			return true; // must do since calling sendResponse asynchronously
}

// async function maybeDashboardNudge () {
//   const store = await browser.storage.local.get(['startTS', 'lastNudgeShown'])
//   const startTS = store.startTS || undefined
//   const lastNudgeShown = store.lastNudgeShown || 0
//   if (!startTS) {
//     return
//   }
//   const now = Date.now()
//   const day = 24 * 60 * 60 * 1000
//   // const day = 20000
//   if (now > startTS + 4 * day && now < startTS + 5 * day) {
//     // day 4
//     if (lastNudgeShown < 4) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 4})
//     }
//   } else if (now > startTS + 5 * day && now < startTS + 6 * day) {
//     // day 5
//     if (lastNudgeShown < 5) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 5})
//     }
//   } else if (now > startTS + 6 * day && now < startTS + 7 * day) {
//     // day 6
//     if (lastNudgeShown < 6) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 6})
//     }
//   }
// }

// async function dashboardNudgeNotification () {
//   await browser.notifications.create({
//     type: 'basic',
//     title: EXT.NAME,
//     message: 'Click to learn more about your web browsing!',
//     iconUrl: '/icons/logo.svg'
//   })
// }

async function openDashboard () {
  const dashboardData = {
    active: true,
    url: browser.runtime.getURL('dist/dashboard.html')
  }
  await browser.tabs.create(dashboardData)
}

/**
 * fetch updated tracker list 
 *
 * @returns {Object} fills companyData and also domainEntityMap 
 *
 */
async function update_tracker_list() {
  try {
    fetch('https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json')
      .then(response => response.json())
      .then(data => {

        console.log("[+] fetching updated tracker list from disconnect (https://raw.githubusercontent.com/disconnectme/disconnect-tracking-protection/master/services.json)")

        for (var key of Object.keys(data)) {
          // alert(key + " -> " + data[key])

          const cat = data['categories']

          for (var specific_category of Object.keys(cat)) {
            // alert(specific_category + "---->" + JSON.stringify(cat[specific_category]))

            let target_entity_wrapper = cat[specific_category]

            for (var iterative_entity_list of Object.keys(target_entity_wrapper)) {
              // alert(specific_category + "---->" + JSON.stringify(target_entity[iterative_entity_list]))

              let site_wrapper = target_entity_wrapper[iterative_entity_list]

              for (var website of Object.keys(site_wrapper)) {
                // alert(specific_category + "--" + website + "---->" + JSON.stringify(site_wrapper[website]))

                let domain_wrapper = site_wrapper[website]

                for (var domain_list_long of Object.keys(domain_wrapper)) {
                  // alert(specific_category + "--" + website + "--" + domain_list)

                  let list_long = domain_wrapper[domain_list_long]

                  // alert(specific_category + "---" + website + "--" + domain_list_long + "--" + list_long)
                  
                  // name = website
                  // site = domain_list_long
                  // type = specific_category
                  // domains = list_long

                  // alert(website + "--" + tldjs.parse(domain_list_long).hostname + "--" + specific_category + "--" + list_long)

                  let entry = {
                    site: tldjs.parse(domain_list_long).hostname,
                    type: specific_category,
                    domains: list_long,
                  };

                  // alert(JSON.stringify(entry))
                  companyData[website] = entry;

                  for (var single_domain of Object.keys(list_long)) {
                    let this_domain = list_long[single_domain]
                    domainEntityMap[this_domain] = website
                  }

                }

              }

            }

          }

        }
        // console.log(companyData)
        // console.log(domainEntityMap)
        browser.storage.local.set({companyData: companyData});

        return domainEntityMap

      });
  } catch (e) {
    console.log("[-] error updating disconnect tracking list, default to stock")
  }

}


/**
 * fetch google ad categories to bucket interests/demographics in google adssettings
 *
 * @returns {Object} fills google ad categories in state
 *
 */
async function update_google_ad_list() {
  const response = fetch('https://developers.google.com/google-ads/api/data/tables/verticals.csv')
   .then(response => response.text())
   .then(v => Papa.parse(v))
   .catch(err => console.log(err))

  response.then(
    v => {
    	console.log("[+] fetching updated google ad words list (https://developers.google.com/google-ads/api/data/tables/verticals.csv)")
      for (let i = 0; i < v['data'].length; i++) {
        let base = v['data'][i][2]
        if (base !== undefined && base !== 'Category') {
          let last_part = base.split("/")
          let key = last_part[last_part.length-1]
          let value = base
          // console.log(key + " ===> " + value)
          google_ad_categories[key] = value
        }
      }
      update_google_ads_settings()
      // return google_ad_categories
    }
  )
}


/**
 * fetch easylist
 * stores information in memory
 *
 * @returns {Object} successful flag or not
 *
 */
async function update_ad_server_list() {


	var href_blocklist = new Array()
	const response_second = fetch('https://adaway.org/hosts.txt')
	 .then(response_second => response_second.text())
	 .catch(err => console.log(err))

	response_second.then(
	  v2 => {

			var arr = v2.split("\n")
			for (let i = 0; i < arr.length; i++) {
				let line = arr[i]
				if (line !== '' && line[0] !== '#' && line[0] !== ':') {
					let matcher = line.split('127.0.0.1 ')[1]

					if (matcher !== ' localhost') {
						href_blocklist.push(matcher)
					}
					
				}
			}
			return href_blocklist
	  }
	  
	)




  // const response = fetch('https://easylist-downloads.adblockplus.org/easylist.txt')
  //  .then(response => response.text())
  //  .catch(err => console.log(err))

  // response.then(
  //   v => {
  //   	console.log("[+] attempting to fetch updated easyList")
  //     // console.log(v)

		// 	var txtArr = v.split("\n").reverse() 
  //     var selectors = txtArr 
  //     			.filter(line => line.includes('href'))
  //           .filter(function (line) {
  //             return /^##/.test(line)
  //           })
  //           .map(function (line) {
  //             return line.replace(/^##/, '')
  //           })



  //     // var whitelist = txtArr
  //     //       .filter(function (line){
  //     //         return /^[a-z0-9]/.test(line) && !/##/.test(line)
  //     //       })
  //     //       .map(R.split('#@#'))

  //     // console.log(selectors)




  //   }
  // )
}

/**
 * fetch google ads settings, assuming user is logged in
 * do this at beginning to try and stock content 
 *
 * @returns {Object} successful flag or not
 *
 */
async function update_google_ads_settings(path=null) {
  let path_provided; // user logged in to secondary adssettings account
  if (path) {
    path_provided = path
  } else {
    path_provided = 'https://adssettings.google.com'
  }
  const response = fetch(path_provided)
   .then(response => response.text())
   .catch(err => console.log(err))

  response.then(
    v => {

            var parser = new DOMParser();
            var htmlDoc = parser.parseFromString(v, 'text/html');
            // console.log(htmlDoc);

            let email; 
            let name;

            // get name 
            var outer_name = htmlDoc.getElementsByClassName("gb_8d");  //JRGAPc
            for(var p = 0; p < outer_name.length; p++) {
                let subs = outer_name[p].getElementsByTagName('*');
                for (var z = 0; z < subs.length; z++) {
                    if (subs[z].textContent !== 'Google Account') {
                        if (subs[z].textContent.includes("@")) {
                            email = subs[z].textContent
                        } else {
                            name = subs[z].textContent
                        }
                    }
                    
                }
            }

            // get interests and demographics
			const info = new Array()


			var outer_outer = htmlDoc.getElementsByClassName("JRGAPc");  //JRGAPc

            // attempt at clicking into items
            // console.log("pandas start")
            // let elem2 = htmlDoc.querySelector("div.JRGAPc")
            // let check_down = elem2.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
            // let check_up = elem2.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }))
            // // let elem3 = htmlDoc.getElementsByClassName("qZZcg")
            // console.log(elem2)
            // console.log(check_down)
            // console.log(check_up)
            // console.log("pandas end")

			for(var i = 0;i < outer_outer.length; i++){

			  // console.log(outer_outer[i])
			  let subs = outer_outer[i].getElementsByTagName('*');

			  let key; 
			  let value;

			  for (var q = 0; q < subs.length; q++) {
			    // console.log(subs[q])

			    if (subs[q].className == 'lSvC9c ') {
			      // this is an interest or demographic //console.log(subs[q].src.split('/')[6])
			      key = "-"
			    } else if (subs[q].className.includes('lSvC9c')) {
			      key = "interest - company"
			    } if (subs[q].className == 'c7O9k') {
			      value = subs[q].textContent
			    }

			    if (value !== undefined && key !== undefined) {

                  // console.log(key + '__' + value)

			      var entry = new Object();
			      entry = {
			      	"type": key,
			      	"value": value,
			      }
			      // entry[key] = value
			      // alert(entry)
			      info.push(entry)
			    }

			  }
			}

            if(typeof name !== "undefined") {
                info.push({"type": 'my_name', "value": name})
            }
            if(typeof email !== "undefined") {
                info.push({"type": 'my_email', "value": email})
            }
            

			// console.log(info)

			// there is no pageId because user didn't actually visit this site
			// we create one 
			// runtime won't activate until we visit pages, which we can't assume, so we have to duplicate work here
			// chrome.runtime.sendMessage({ type: 'google_inference_done', article: info, pageId: Date.now() });
			console.log("[+] attempting google inference from (" + path_provided + ")")
			// console.log(info)
			if (info.length !== 0) {
				let message = {article: info, pageId: Date.now()}
				log_google_inference(message)
			}


	  }

  )

}


// // this works, but is too rote???
// // update adSettings page to see changes reflected 
// browser.alarms.create('update_google_ad_list', {delayInMinutes: 1, periodInMinutes: 1})
// browser.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === 'update_google_ad_list') {
//     update_google_ad_list()
//   } 
// })

// anytime you start or stop chrome
window.onload = function() {
    // clear out telemetry on viewing
    localStorage.removeItem("viewing") 
    // get most current ad list from google 
    update_google_ad_list();
    // get most current ad server list from providers 
    load_list2();
    // get most current trackers list from disconnect
    update_tracker_list();

};

// browser.alarms.create("5min", {
//   delayInMinutes: 1,
//   periodInMinutes: 1
// });

// browser.alarms.onAlarm.addListener(function(alarm) {
//   if (alarm.name === "5min") {
//     alert("HI there i'm the alarm")
//   }
// });


// browser.notifications.onClicked.addListener(openDashboard)

// browser.alarms.create('lfDb', {delayInMinutes: 10, periodInMinutes: 60})
// browser.alarms.create('dashboard-nudge', {delayInMinutes: 1, periodInMinutes: 10})

// browser.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === 'lfdb') {
//     await instrumentation.sendDb();
//   } else if (alarm.name === 'dashboard-nudge') {
//     maybeDashboardNudge()
//   }
// })

















// 1. get this adParsing into tester2
// 2. make sure adParsing is not overzealous 
// 3. 




















