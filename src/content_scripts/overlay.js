/* OVERLAY */

$(document).ready(function() {
  var overlay = Boundary.createBox("overlay");
  Boundary.loadBoxCSS("#overlay", browser.extension.getURL('stylesheets/overlay-inner.css'));

  Boundary.rewriteBox("#overlay", "<div id='message'>Hi there!</div>");

  // Boundary.appendToBox("#overlay", "<div><button class='button'>Click me first!</button></div>");
	// /* add some silly interaction to box one */
	// Boundary.findElemInBox(".button", "#overlay").click(function() {
	// 	Boundary.appendToElemInBox("#message", "#yourBoxOneID", "<br>Now click on the second button.");
  // });
});
