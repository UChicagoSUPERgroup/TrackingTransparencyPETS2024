function saveOptions(e) {
  e.preventDefault();

  let popupCondition = document.querySelector('#popupCondition').value;
  let infopageCondition = document.querySelector('#infopageCondition').value;
  let inferencingCondition = document.querySelector('#inferencingCondition').value;
  let overlayCondition = document.querySelector('#overlayCondition').value;


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

async function restoreOptions() {

  const popupCondition = await browser.storage.local.get('popupCondition');
  document.querySelector('#popupCondition').value = popupCondition.popupCondition;

  const infopageCondition = await browser.storage.local.get('infopageCondition');
  document.querySelector('#infopageCondition').value = infopageCondition.infopageCondition;

  const inferencingCondition = await browser.storage.local.get('inferencingCondition');
  document.querySelector('#inferencingCondition').value = inferencingCondition.inferencingCondition;

  const overlayCondition = await browser.storage.local.get('overlayCondition');
  document.querySelector('#overlayCondition').value = overlayCondition.overlayCondition;

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
