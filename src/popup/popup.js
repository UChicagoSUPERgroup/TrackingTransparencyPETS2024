'use strict';

import FrontendMessenger from '../frontendmessenger.js';

import 'bootstrap/dist/css/bootstrap.min.css';

import $ from 'jquery';
import popper from 'popper.js';
window.jQuery = $;
window.Popper = popper;
require("bootstrap");

const frontendmessenger = new FrontendMessenger("popup");

async function onReady() {
  const tabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  const tab = tabs[0];

  // get tab data with trackers and stuff here
  const tabData = await frontendmessenger.getTabData(tab.id);
  
  if (typeof tabData.error != 'undefined') {
    return;
  }
    
  console.log(tabData);    
  $("#pageinfo").show();

  /* looks something like:
    { 
      pageId: 1503590672929, 
      domain: "super.cs.uchicago.edu", 
      path: "/members.html", 
      protocol: "https", 
      title: "University of Chicago SUPERgroup: M…", 
      webRequests: Array[0], 
      trackers: ["Google", "DoubleClick"] 
      inference: "Warehousing" 
    }
  *
  * note that info about trackers on current page is NOT in the databse at the time this is run
  */

  let title = tabData.title;
  if (title.length >= 30) {
    title = title.substring(0,30).concat("...");
  }
  $('#pagetitle').text(title);
  $('#trackercount').text(tabData.trackers.length);

  if (tabData.trackers.length > 0) {
    const tracker = tabData.trackers[0];
    const pagecount = frontendmessenger.queryDatabase("get_page_visit_count_by_tracker", {tracker: tracker})
      $('#trackerinfo').show();
      $('#trackername').text(tracker);
      $('#trackerpagecount').text(await pagecount);
  }

  // port.postMessage({ type: "request_info_current_page" });
  // port.postMessage({ type: "get_tracker_most_pages" });

}


$('document').ready(onReady());

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("show-more-btn")) {

    let infopageData = {
      active: true,
      url: "../infopage/index.html"
      };
    browser.tabs.create(infopageData);

  }
});

