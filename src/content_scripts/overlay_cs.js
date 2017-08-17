/* OVERLAY */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function injectOverlay() {
  const q = await browser.storage.local.get("overlayCondition");

  if (q.overlayCondition == "none") {
    return;
  }

  var overlay = document.createElement("div");
  // var p = document.createElement("p");
  // overlay.appendChild(p);
  overlay.id = "tt_overlay_64f9de";
  overlay.innerHTML = '<div style="font: 10pt sans-serif; padding: 2px;">Tracking Transparency is tracking the trackers!</div>';

  document.body.appendChild(overlay);
}

injectOverlay();
