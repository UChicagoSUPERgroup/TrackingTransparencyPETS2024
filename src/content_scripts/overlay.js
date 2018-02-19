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

  // var p = document.createElement("p");
  // overlay.appendChild(p);

  // let response = await browser.runtime.sendMessage({ type: 'queryDatabase', query: 'getTrackers', args: {count: 5} });
  // console.log(response);

  const tabData = await browser.runtime.sendMessage({ type: 'getTabData' });

  if (!tabData) {
    throw new Error('no tab data');
  }

  overlay.id = 'trackingtransparency_overlay';
  overlay.innerHTML += '<div class="tt_closebutton"></div>'
  overlay.innerHTML += tabData.trackers[0] + ' and ' + (tabData.trackers.length - 1) + ' other trackers are on this page.';

  document.body.appendChild(overlay);
  overlay.onclick = (() => {
    overlay.parentElement.removeChild(overlay);
  });
}
