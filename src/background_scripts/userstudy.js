/** @module userstudy */

// import {trackersWorker, databaseWorker, inferencingWorker} from "workers_setup.js";

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
