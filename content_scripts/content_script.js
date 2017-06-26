console.log("content script running");


browser.runtime.sendMessage({html: document});
