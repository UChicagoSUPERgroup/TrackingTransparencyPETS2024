function generateInnerHTML(tabData) {
  let innerHTML;
  let trackerWords = '', inferWords = '';

  if (tabData.trackers && tabData.trackers.length === 0) {
    trackerWords = '<p>There are no trackers on this page!</p>'
  }

  if (tabData.trackers && tabData.trackers.length > 0) {
    trackerWords = `<p><strong>${tabData.trackers[0]}</strong> and 
    <span id="num-trackers">${(tabData.trackers.length - 1)}</span>
     others are tracking you on this page.</p>`
  }

  if (tabData.inference) {
    inferWords = `<p>We think this page is about <strong>${tabData.inference}</strong>.</p>`
  }

  innerHTML = trackerWords + inferWords;
  return innerHTML;

}

function createOrUpdate(tabId, tabData) {

  console.log('tabdata is', tabData)
  
  let innerHTML = generateInnerHTML(tabData);
  console.log('innerhtml is', innerHTML)

  if (innerHTML) {
    chrome.tabs.sendMessage(tabId, {
      type: 'create_or_update_overlay',
      innerHTML: innerHTML
    });
  }
}

export default {createOrUpdate}