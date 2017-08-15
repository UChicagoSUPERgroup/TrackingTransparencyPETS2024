/** 
 * @module userstudy.js
 * 
 * code related to the execution of the user study
 * 
 * i.e. options/test conditions, usage logging/reporting, etc.
 */

async function setDefaultOptions() {
  let options = {
    popupCondition: "full",
    infopageCondition: "full",
    inferencingCondition: "full"
  }

  browser.storage.local.set({options});
}

setDefaultOptions();
