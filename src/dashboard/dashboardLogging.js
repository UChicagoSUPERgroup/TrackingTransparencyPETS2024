async function logLoad() {
  //console.log('In the log load page')
  const background = await browser.runtime.getBackgroundPage();
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  let parentTabId = tabs[0].openerTabId;
  let tabId = tabs[0].id;
  let x = 'clickData_tabId_'+String(tabId);
  let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
  tabData = JSON.parse(tabData[x]);

  //console.log('About page', tabId, tabData);
  let userParams = await browser.storage.local.get({
    usageStatCondition: "no monster",
    userId: "no monster",
    startTS: 0
  });
  if (JSON.parse(userParams.usageStatCondition)){//get data when the user load the page.
    let activityType='load dashboard about page';
    let timestamp=Date.now();
    let userId=userParams.userId;
    let startTS=userParams.startTS;
    let activityData={
      'tabId': tabId,
      'parentTabId':parentTabId,
      'parentDomain':tabData.domain,
      'parentPageId':tabData.pageId,
      'parentNumTrackers':tabData.numTrackers
    }
    background.logData(activityType, timestamp, userId, startTS, activityData);
  }
}


// define functions to be exported here
export default {
  logLoad: logLoad
}