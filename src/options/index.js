import React from 'react'
import ReactDOM from 'react-dom'

import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import RadioInputGroup from '@instructure/ui-forms/lib/components/RadioInputGroup'
import RadioInput from '@instructure/ui-forms/lib/components/RadioInput'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import theme from '@instructure/ui-themes/lib/canvas'

import { themeOverrides } from '../colors'

theme.use({ overrides: themeOverrides })

class Options extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showOverlay: true
    }

    this.checkboxChangeHandler = this.checkboxChangeHandler.bind(this)
    this.setOption = this.setOption.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
  }

  checkboxChangeHandler (e) {
    let name = e.target.value
    let state = e.target.checked
    this.setOption(name, state)
  }

  async setOption (name, state) {
    await this.setState({ [name]: state })
    browser.storage.local.set({ options: this.state })
  }

  async loadOptions () {
    const store = await browser.storage.local.get(['options', 'mturkcode'])
    const options = store.options
    const mturkcode = store.mturkcode
    this.setState({
      ...options,
      id: mturkcode
    })
  }

  async componentDidMount () {
    this.loadOptions()
  }

  render () {
    const id = this.state.id
    return (
      <div>
        <FormFieldGroup
          name='displayOptions'
          description='Display options'
          vAlign='top'
          rowSpacing='small'
        >
          <Checkbox
            value='showOverlay'
            label='Show in-page overlay'
            checked={this.state.showOverlay}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
        </FormFieldGroup>
        <Text>
          <p><strong>User ID: {id}</strong></p>
        </Text>
      </div>
    )
  }
}
ReactDOM.render(<Options />, document.getElementById('root'))
