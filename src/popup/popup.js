import tt from '../helpers';

async function onReady() {
  const background = await browser.runtime.getBackgroundPage();

  const tabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
  const tab = tabs[0];

  // get tab data with trackers and stuff here
  const tabData = await background.getTabData(tab.id);
  
  if (!tabData) {
    return;
  }
    
  tt.log(tabData);    
  $('#pageinfo').show();

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
    title = title.substring(0,30).concat('...');
  }
  $('#pagetitle').text(title);
  $('#trackercount').text(tabData.trackers.length);

  if (tabData.trackers.length > 0) {
    const tracker = tabData.trackers[0];
    try {
      const pagecount = background.queryDatabase('getPageVisitCountByTracker', {tracker: tracker});
      $('#trackerinfo').show();
      $('#trackername').text(tracker);
      $('#trackerpagecount').text(await pagecount);
    } catch (e) {
      ; // eslint-disable-line no-extra-semi
    }
  }

  // port.postMessage({ type: "requestInfoCurrentPage" });
  // port.postMessage({ type: "getTrackerMostPages" });

}


$('document').ready(onReady());

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('show-more-btn')) {

    let dashboardData = {
      active: true,
      url: '../dashboard/index.html'
    };
    browser.tabs.create(dashboardData);

  }
});

