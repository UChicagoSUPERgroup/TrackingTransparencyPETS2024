import overlayStyles from './overlay_styles'

let iframe, overlayContent

function createOrUpdate (innerHTML) {
  if (overlayContent) {
    overlayContent.innerHTML = innerHTML
  } else {
    injectOverlay(innerHTML)
  }
}

function remove () {
  iframe.parentElement.removeChild(iframe)
}

function injectOverlay (innerHTML) {
  // create div
  iframe = document.createElement('iframe')
  iframe.id = 'trackingtransparency_overlay'
  iframe.srcdoc = '<div id="tt_closebutton">&#10005;</div><div id="tt_overlay_content"></div>'
  iframe.style = overlayStyles.outer

  // add to page
  document.documentElement.appendChild(iframe)
  iframe.onclick = () => {
    iframe.parentElement.removeChild(iframe)
  }

  iframe.onload = () => {
    const style = document.createElement('style')
    style.textContent = overlayStyles.inner
    iframe.contentDocument.head.appendChild(style)

    iframe.contentDocument.getElementById('tt_overlay_content').innerHTML = innerHTML
    overlayContent = iframe.contentDocument.getElementById('tt_overlay_content')
    iframe.contentDocument.getElementById('tt_closebutton').onclick = () => {
      iframe.parentElement.removeChild(iframe)
    }
  }

  // dismiss overlay after 5 seconds
  setTimeout(() => {
    iframe.parentElement.removeChild(iframe)
  }, 5000)
}

export default { createOrUpdate, remove }
