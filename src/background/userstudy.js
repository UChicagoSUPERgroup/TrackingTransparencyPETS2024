/** @module userstudy */

const isUserstudy = false;

async function setDefaultOptions() {
  let popupCondition, infopageCondition, inferencingCondition, overlayCondition, usageStatCondition, lightbeamcondition;

  if (!isUserstudy) {
    popupCondition = 'full';
    infopageCondition = 'full';
    inferencingCondition = 'full';
    overlayCondition = 'full';
    lightbeamcondition = 'true';//switch for the lightbeam tab
    usageStatCondition = 'true';//switch for the sending data
  } else {
    popupCondition = 'none';
    infopageCondition = 'none';
    inferencingCondition = 'none';
    overlayCondition = 'none';
    lightbeamcondition = 'true';//put it to false if necessary
    usageStatCondition = 'true';
  }

  browser.storage.local.set({popupCondition, infopageCondition, inferencingCondition, overlayCondition, usageStatCondition, lightbeamcondition});


  switch (popupCondition) {
  case 'none':
    browser.browserAction.disable();
    break;
  case 'full':
    // browser.browserAction.setPopup({popup: '/popup/index.html'});
    browser.browserAction.enable();
    break;
  default:
    browser.browserAction.disable();
  }

}

export default {setDefaultOptions};
