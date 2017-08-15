function saveOptions(e) {
  e.preventDefault();
  let options = {
    popupCondition: document.querySelector("#popupCondition").value,
    infopageCondition: document.querySelector("#infopageCondition").value,
    inferencingCondition: document.querySelector("#inferencingCondition").value
  }
  browser.storage.local.set({options});
}

function restoreOptions() {

  function setCurrentChoices(result) {
    let options = result.options;
    document.querySelector("#popupCondition").value = options.popupCondition;
    document.querySelector("#infopageCondition").value = options.infopageCondition;
    document.querySelector("#inferencingCondition").value = options.inferencingCondition;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("options");
  getting.then(setCurrentChoices, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
