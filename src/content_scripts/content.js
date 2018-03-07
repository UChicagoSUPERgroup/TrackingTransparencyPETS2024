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
  
  await tt.sleep(5000);
  overlay.remove();
}

injectOverlay();

function runtimeOnMessage(m, sender, sendResponse) {
  console.log('got msg from background', m)
  switch (m.type) {
  case 'page_inference':
    if (overlay) {
      overlay.addInference(m.info.inference);
    }
    break;
  case 'page_trackers':
    if (overlay) {
      overlay.updateTrackers(m.trackers);
    }
    break;
  }
}
chrome.runtime.onMessage.addListener(runtimeOnMessage)