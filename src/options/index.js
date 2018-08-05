import React from 'react'
import ReactDOM from 'react-dom'

import theme from '@instructure/ui-themes/lib/canvas'

import TTOptions from './TTOptions'
import { instuiOverrides } from '../colors'

theme.use({
  overrides: instuiOverrides
})

ReactDOM.render(<TTOptions />, document.getElementById('root'))
