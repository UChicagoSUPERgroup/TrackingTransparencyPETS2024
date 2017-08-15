function saveOptions(e) {
  e.preventDefault();

  let popupCondition = document.querySelector("#popupCondition").value;
  let infopageCondition = document.querySelector("#infopageCondition").value;
  let inferencingCondition = document.querySelector("#inferencingCondition").value;

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

async function restoreOptions() {

  const popupCondition = await browser.storage.local.get("popupCondition");
  const infopageCondition = await browser.storage.local.get("infopageCondition");
  const inferencingCondition = await browser.storage.local.get("inferencingCondition");


  document.querySelector("#popupCondition").value = popupCondition.popupCondition;
  document.querySelector("#infopageCondition").value = infopageCondition.infopageCondition;
  document.querySelector("#inferencingCondition").value = inferencingCondition.inferencingCondition;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
