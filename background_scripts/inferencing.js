/* inferred data stored as object with structure:
 * url: inference
 */
let inferredData = {}

function inferencingMessageListener(message, sender) {
  if (!sender.tab || !sender.url) {
    // message didn't come from a tab, so we ignore
    return;
  }

  console.log(message);

  inferredData[sender.url] = "Hello!"
}

browser.runtime.onMessage.addListener(inferencingMessageListener);
