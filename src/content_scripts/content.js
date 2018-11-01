import makeInference from './inferencing'
import overlay from './overlay'

async function runtimeOnMessage (m) {
  if (browser.extension.inIncognitoContext) {
    return
  }

  switch (m.type) {
    case 'make_inference':
      makeInference()
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

chrome.runtime.onMessage.addListener(runtimeOnMessage)
