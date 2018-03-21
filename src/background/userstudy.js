/** @module userstudy */

const isUserstudy = false;

async function setDefaultOptions() {
  let popupCondition, infopageCondition, inferencingCondition, overlayCondition, usageStateCondition;

  if (!isUserstudy) {
    popupCondition = 'full';
    infopageCondition = 'full';
    inferencingCondition = 'full';
    overlayCondition = 'full';
    
    //usageStatCondition = true;
  } else {
    popupCondition = 'none';
    infopageCondition = 'none';
    inferencingCondition = 'none';
    overlayCondition = 'none';
    //usageStatCondition = true;
  }

  browser.storage.local.set({popupCondition, infopageCondition, inferencingCondition, overlayCondition});


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
