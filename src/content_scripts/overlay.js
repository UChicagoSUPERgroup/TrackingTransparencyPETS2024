/* OVERLAY */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onReady() {
  var overlay = Boundary.createBox("tt_overlay_64f9de");
  await sleep(200);
  Boundary.loadBoxCSS("#tt_overlay_64f9de", browser.extension.getURL('stylesheets/overlay-inner.css'));

  Boundary.rewriteBox("#tt_overlay_64f9de", "<div id='message'>Hi there!</div>");

  // Boundary.appendToBox("#overlay", "<div><button class='button'>Click me first!</button></div>");
	// /* add some silly interaction to box one */
	// Boundary.findElemInBox(".button", "#overlay").click(function() {
	// 	Boundary.appendToElemInBox("#message", "#yourBoxOneID", "<br>Now click on the second button.");
  // });
}

$(document).ready(onReady());
