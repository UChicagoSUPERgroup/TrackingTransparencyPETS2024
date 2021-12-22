import makeInference from './inferencing'
import overlay from './overlay'
import checkAd from './ad_injecting'
import getGoogleInferences from './feeler'
import getAdDom from './tester2'

async function runtimeOnMessage (m) {
  if (browser.extension.inIncognitoContext) {
    return
  }

  console.log("RECEIVED")
  // console.log("message received" + JSON.stringify(m))

  switch (m.type) {
    case 'make_inference':
      makeInference()
      break
    case 'get_ad_dom':
      getAdDom(m.pageId)
      break
    case 'google_inferences':
      getGoogleInferences(m.pageId)
      break
    case 'create_or_update_overlay':
      overlay.createOrUpdate(m.innerHTML)
      break
    case 'remove_overlay':
      overlay.remove()
      break
  }
  return true
}

// set listener for messages from background script
chrome.runtime.onMessage.addListener(runtimeOnMessage)
// this works better as chrome.runtime and not browser.runtime (bug in mozilla webextension-polyfill, may be fixed)

