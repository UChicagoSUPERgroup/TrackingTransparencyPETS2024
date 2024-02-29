import makeInference from './inferencing'
import overlay from './overlay'
// import checkAd from './ad_injecting'
// import getGoogleInferences from './gInferences'
import getAdDom from './adGrab'

async function runtimeOnMessage (m) {
  if (browser.extension.inIncognitoContext) {
    return
  }

  switch (m.type) {
    case 'make_inference':
      makeInference()
      break
    // case 'get_ad_dom':
    //   getAdDom(m.pageId)
    //   break
    // case 'google_inferences':
    //   getGoogleInferences(m.pageId)
    //   break
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

