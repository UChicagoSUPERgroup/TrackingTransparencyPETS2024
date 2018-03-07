import makeInference from './inferencing';
import Overlay from './overlay';
import tt from '../helpers';

makeInference();

let overlay;

async function injectOverlay() {

  const q = await browser.storage.local.get('overlayCondition');

  if (q.overlayCondition == 'none') {
    return;
  }

  overlay = new Overlay();

  await tt.sleep(2000);
  overlay.inject();
}

injectOverlay();

function runtimeOnMessage(m, sender, sendResponse) {
  switch (m.type) {
  case 'page_inference':
    if (overlay) {
      overlay.addInference(m.info.inference);
    }
    break;
  }
}
chrome.runtime.onMessage.addListener(runtimeOnMessage)