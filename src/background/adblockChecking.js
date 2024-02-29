let to_share = []

async function getAdblockers () {
  // alert("checking for adblocks")
  const blockerNames = ['ublock','ublocker', 'adblock', 'ghostery', 'disconnect', 'privacy badger', 
                        'duckduckgo', '1blocker', 'adlock', 'adaway', 'adblocker', 'adguard adblocker', 
                        'adblock for youtube™', 'adblock for you', 'xb, block all ads', 'fair adblocker',
                        'adblock plus', 'ublock origin', 'blur', 'adBlocker: adblock for chrome', 
                        'adblock max - ad blocker', 'alerabat.com | kupony i cashback',
                        'ad-defender youtube™ by extra thinkers', 'crystal ad block', 
                        'Adblocker - YOUTUBE™, HOTSTAR, SONYLIV etc', 'Adblock - No More Ads',
                        'WAB - Wise Ads Block', 'uBlock Pro - #1 Adblocker', 'Adblock Unblock',
                        'R1 AdBlocker', 'StopAll Ads', 'LionBlock', 'FlexBlock',
                        'Pop Guard, Complete Browser Protection !!', 'FlexBlock',
                        'Windscribe - Free Proxy and Ad Blocker']
  const exts = await browser.management.getAll()
  const res = exts.filter(ext => {
    for (let blocker of blockerNames) {
      if (ext.name.toLowerCase().includes(blocker.toLowerCase())) {
        // alert("has adBlocker")
        to_share.push(ext.name)
      }
    }

    for (let blocker of blockerNames) {
      if (ext.name.toLowerCase().includes(blocker.toLowerCase())) {
        // alert("has adBlocker")
        return ext.enabled
      }
    }
    return false
  })// .sort((a, b) => (a.id > b.id))
  // alert(JSON.stringify(res))
  return res
}

export async function hasTrackerBlocker () {
  const blockers = await getAdblockers()
  if (to_share.length > 0) {
    // alert(to_share)
    // return unique names of blockers
    return to_share.filter((item, i, ar) => ar.indexOf(item) === i)
  }
  if (browser.privacy.websites.trackingProtectionMode) {
    const t = await browser.privacy.websites.trackingProtectionMode.get({})
    if (t.value === 'always') {
      return true
    }
  }
  return false
}
function setExtEnabled (id, val) {
  return browser.management.setEnabled(id, val)
}

window.getAdblockers = getAdblockers
window.hasTrackerBlocker = hasTrackerBlocker
window.setExtEnabled = setExtEnabled
