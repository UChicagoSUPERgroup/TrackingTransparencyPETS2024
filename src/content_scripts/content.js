import makeInference from './inferencing'
import overlay from './overlay'

makeInference()

async function runtimeOnMessage (m) {
  console.log('got msg from background', m)
  switch (m.type) {
    case 'create_or_update_overlay':
      overlay.createOrUpdate(m.innerHTML)
      break
    case 'remove_overlay':
      overlay.remove()
      break
  }
}

chrome.runtime.onMessage.addListener(runtimeOnMessage)
