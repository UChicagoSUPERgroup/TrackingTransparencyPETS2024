'use strict';

import {sleep} from 'helpers.js';

/* OVERLAY */


export default async function injectOverlay() {
  const q = await browser.storage.local.get("overlayCondition");

  if (q.overlayCondition == "none") {
    return;
  }

  await sleep(2000);

  var overlay = document.createElement("div");

  // var p = document.createElement("p");
  // overlay.appendChild(p);
  overlay.id = "trackingtransparency_overlay";
  overlay.innerHTML = `<div class="tt_closebutton"></div>
  <p>Tracking Transparency is tracking the trackers!</p>
  `;

  document.body.appendChild(overlay);
  overlay.onclick = (() => {
    overlay.parentElement.removeChild(overlay);
  });
}
