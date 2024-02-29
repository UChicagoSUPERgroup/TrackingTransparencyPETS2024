async function setOptions (newOptions) {
  browser.storage.local.set({ options: newOptions })
}

async function getOptions () {
  const store = await browser.storage.local.get('options')
  const options = store.options || {}
  return options
}

const dev = (process.env.NODE_ENV === 'development')

export async function generateID (cond) {
  /* eslint-disable no-undef */
  let condition
  const v = EXT.VERSION.replace(/\./g, '')
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox') 
  const br = isFirefox ? 'f' : 'c'
  // USERSTUDY_CONDITION is set in webpack.dev.js
  // should utilize randomizer in userstudy mode
  // console.log(cond)
  // console.log(USERSTUDY_CONDITION)
  if (cond) {
    condition = cond
    // alert("CONDITION already set")
  } else if (typeof USERSTUDY_CONDITION !== 'undefined') {
    // alert("CONDITION !== undefined")
    condition = USERSTUDY_CONDITION
  } else {
    // alert("CONDITION being set randomly")
    // 1.0 version, set condition randomly here (but not much control)
    // condition = Math.ceil(Math.random() * 3)
    condition = 6 // 2.0 sets condition randomly via qualtrics 
    // console.log(condition)
  }
  console.log(condition)
  const rand = Math.random().toString(16).substr(2, 12)
  let id
  if (dev) {
    id = condition.toString() + '-' + v + br + '-' + rand + '-dev-3.0'
  } else {
    id = condition.toString() + '-' + v + br + '-' + rand
  }
  return id
  /* eslint-enable no-undef */
}

export async function saveID (id) {
  // console.log(id)
  const cond = +(id.toString()[0]) // first digit of id
  // const conditions = ['staticExplanations', 'historyOnly', 'lightbeam', 'ghostery', 'noInferences', 'everything'] // 1.0
  const conditions = ['static_1.0','everything_1.0','profile_2.0','pending_survey','pending_survey','pending_survey',] // 2.0
  const condStr = conditions[cond - 1]
  // console.log(cond, condStr)
  await setUserstudyCondition(condStr)
  await browser.storage.local.set({ mturkcode: id })
  await browser.storage.local.set({ userId: id })
}

export async function setUserstudyCondition (condition) {
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
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = true
      options.showInferenceContent = false
      options.showHistoryContent = true
      // options.popupVariant = 'default'
      break
    // 2.0 conditions
    case 'static_1.0':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = false
      options.showInferenceContent = false
      options.showHistoryContent = false
      options.showProfile = false
      options.showTakeAction = true
      // options.popupVariant = 'default'
      break
    case 'everything_1.0':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = true
      options.showInferenceContent = true
      options.showHistoryContent = true
      options.showProfile = false
      options.showTakeAction = true
      // options.popupVariant = 'default'
      break
    case 'profile_2.0':
      options.showDashboard = true
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = false
      options.showInferenceContent = false
      options.showHistoryContent = false
      options.showProfile = true
      options.showTakeAction = true
      // options.popupVariant = 'default'
      break
    case 'pending_survey':
      options.showDashboard = false
      options.showOverlay = false
      options.showLightbeam = false
      options.showTrackerContent = false
      options.showInferenceContent = false
      options.showHistoryContent = false
      options.showProfile = false
      options.showTakeAction = false
      // options.popupVariant = 'default'
      break

  }

  await setOptions(options)
  return options
}
