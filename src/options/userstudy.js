async function setOptions (newOptions) {
  browser.storage.local.set({ options: newOptions })
}

async function getOptions () {
  const store = await browser.storage.local.get('options')
  const options = store.options || {}
  return options
}

export default async function setUserstudyCondition (condition) {
  const options = await getOptions()
  options.userstudyCondition = condition

  switch (condition) {
    case 'staticExplanations':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = false
      options.showHistoryContent = false
      options.showInferenceContent = false
      // options.popupVariant = 'static'
      break
    case 'historyOnly':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = false
      options.showInferenceContent = false
      options.showHistoryContent = true
      // options.popupVariant = 'static'
      break
    case 'lightbeam':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = true
      options.showTrackerContent = false
      options.showInferenceContent = false
      options.showHistoryContent = false
      options.popupVariant = 'static'
      break
    case 'ghostery':
      options.showDashboard = false
      options.showOverlay = true
      options.showLightbeam = false
      options.showTrackerContent = true
      options.showInferenceContent = false
      options.showHistoryContent = false
      // options.popupVariant = 'ghostery'
      break
    case 'noInferences':
      options.showDashboard = true
      options.showOverlay = true
      options.showLightbeam = false
      options.showTrackerContent = true
      options.showInferenceContent = false
      options.showHistoryContent = true
      // options.popupVariant = 'default'
      break
    case 'everything':
      options.showDashboard = true
      options.showOverlay = true
      options.showLightbeam = false
      options.showTrackerContent = true
      options.showInferenceContent = true
      options.showHistoryContent = true
      // options.popupVariant = 'default'
      break
  }

  await setOptions(options)
  return options
}
