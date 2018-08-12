import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'

import TTOptions from './TTOptions'
import { themeOverrides } from '../colors'

theme.use({
  overrides: themeOverrides
})

ReactDOM.render(<TTOptions />, document.getElementById('root'))
