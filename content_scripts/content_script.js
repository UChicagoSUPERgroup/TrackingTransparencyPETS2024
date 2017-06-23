console.log("content script running");

browser.runtime.sendMessage(document.all[0].outerHTML);
