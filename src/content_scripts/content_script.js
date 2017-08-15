import Readability from "readability";

/* OVERLAY */

$(document).ready(function() {
  var overlay = Boundary.createBox("overlay");
  Boundary.loadBoxCSS("#overlay", browser.extension.getURL('/stylesheets/overlay.css'));

  Boundary.rewriteBox("#overlay", "<div id='message'>Hi there!</div>");

  Boundary.appendToBox("#overlay", "<div><button class='button'>Click me first!</button></div>");
	/* add some silly interaction to box one */
	Boundary.findElemInBox(".button", "#overlay").click(function() {
		Boundary.appendToElemInBox("#message", "#yourBoxOneID", "<br>Now click on the second button.");
  });
});

/* INFERENCING */

// console.log("content script running");

var doc = document.cloneNode(true); 
var location = document.location;
var uri = {
    spec: location.href,
    host: location.host,
    prePath: location.protocol + "//" + location.host,
    scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
    pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
};
var article = new Readability(uri, doc).parse();
// console.log(article);

browser.runtime.sendMessage({ type: "parsed_page", article: article });
