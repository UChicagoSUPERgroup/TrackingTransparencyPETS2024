import Readability from "readability"

console.log("content script running");

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

browser.runtime.sendMessage({ article: article });
