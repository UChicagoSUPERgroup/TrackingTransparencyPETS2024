import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'

import { themeOverrides } from '../colors'

import {
  SettingsPage
} from '../dashboard/loadable'

theme.use({
  overrides: themeOverrides
})

ReactDOM.render(<SettingsPage />, document.getElementById('root'))
