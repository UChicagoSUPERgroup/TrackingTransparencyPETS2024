import makeInference from 'inferencing.js';
import injectOverlay from 'overlay.js';

injectOverlay();
makeInference();


// this is example of how to do database query for content script
(async () => {
    let response = await browser.runtime.sendMessage({ type: "queryDatabase", query: "getTrackers", args: {} });
    console.log(response);
})();