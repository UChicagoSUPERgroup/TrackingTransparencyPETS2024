// import tt from "../helpers";

// import Readability from "readability";

/* INFERENCING */

// tt.log("content script running");

// var doc = document.cloneNode(true); 
// var location = document.location;
// var uri = {
//     spec: location.href,
//     host: location.host,
//     prePath: location.protocol + "//" + location.host,
//     scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
//     pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
// };
// var article = new Readability(uri, doc).parse();
// tt.log(article);

export default function makeInference() {
    browser.runtime.sendMessage({ type: 'parsed_page', article: 'null' });
}
