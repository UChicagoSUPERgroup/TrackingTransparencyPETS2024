/** @module userstudy */

const isUserstudy = false;

async function setDefaultOptions() {
  let popupCondition, infopageCondition, inferencingCondition, overlayCondition, usageStateCondition, lightbeamcondition;

  if (!isUserstudy) {
    popupCondition = 'full';
    infopageCondition = 'full';
    inferencingCondition = 'full';
    overlayCondition = 'full';
    lightbeamcondition = false;//put it to false if necessary

    //usageStatCondition = true;
  } else {
    popupCondition = 'none';
    infopageCondition = 'none';
    inferencingCondition = 'none';
    overlayCondition = 'none';
    lightbeamcondition = false;//put it to false if necessary
    //usageStatCondition = true;
  }

  browser.storage.local.set({popupCondition, infopageCondition, inferencingCondition, overlayCondition, lightbeamcondition});


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
