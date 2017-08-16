/** 
 * @module userstudy.js
 * 
 * code related to the execution of the user study
 * 
 * i.e. options/test conditions, usage logging/reporting, etc.
 */

const isUserstudy = false;

async function setDefaultOptions() {
  let popupCondition, infopageCondition, inferencingCondition;

  if (!isUserstudy) {
    popupCondition = "full";
    infopageCondition = "full";
    inferencingCondition = "full";
  } else {
    popupCondition = "none";
    infopageCondition = "none";
    inferencingCondition = "none";
  }

  browser.storage.local.set({popupCondition, infopageCondition, inferencingCondition});


  switch (popupCondition) {
    case "none":
      browser.browserAction.disable();
      break;
    case "full":
      browser.browserAction.setPopup({popup: "/popup/popup.html"});
      browser.browserAction.enable();
      break;
    default:
      browser.browserAction.disable();
  }

}

setDefaultOptions();
