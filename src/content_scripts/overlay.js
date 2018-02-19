'use strict';

import tt from '../helpers';

/* OVERLAY */


export default async function injectOverlay() {
  const q = await browser.storage.local.get('overlayCondition');

  if (q.overlayCondition == 'none') {
    return;
  }

  await tt.sleep(2000);

  var overlay = document.createElement('div');

  // note that we are using the CHROME api and not the BROWSER api
  // because the webextension polyfill does NOT work with sending a response because of reasons
  // so we have to use callbacks :(
  chrome.runtime.sendMessage({ type: 'getTabData' }, (tabData) => {
    if (!tabData) {
      throw new Error('no tab data');
    }

    overlay.id = 'trackingtransparency_overlay';
    overlay.innerHTML += '<div class="tt_closebutton"></div>'

    if (tabData.trackers.length > 0) {
      overlay.innerHTML += tabData.trackers[0] + ' and ' + (tabData.trackers.length - 1) + ' other trackers are on this page.';
    } else {
      overlay.innerHTML += 'There are no trackers on this page!';
    }

    document.body.appendChild(overlay);
    overlay.onclick = (() => {
      overlay.parentElement.removeChild(overlay);
    });
  });

  
}
