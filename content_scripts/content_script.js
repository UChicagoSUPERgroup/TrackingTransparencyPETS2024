console.log("content script running");

console.log(document);
// const documentJSON = JSON.stringify(document);
const doc = {
    location: document.location,
    documentElement: document.documentElement,
    title: document.title
}
browser.runtime.sendMessage({ document: doc });
