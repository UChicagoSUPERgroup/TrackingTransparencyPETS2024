import React from 'react'
import ReactDOM from 'react-dom'

import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox'
import Button from '@instructure/ui-buttons/lib/components/Button'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'
import { Spinner as Spinner_grommet } from "grommet";
import {Checkmark} from "grommet-icons";
import tt from '../helpers'

const SpecialButton = ({ title, children, onClick }) => (
  <ToggleGroup
    summary={title}
    toggleLabel={title}
  >
    <View display='block' padding='small'>
      <Text>{children}</Text>
      <Button variant='danger' onClick={onClick}>{title}</Button>
    </View>
  </ToggleGroup>
)

export default class Options extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showOverlay: true,
      text: "Reset All Data!",
      opt_out: "Opt Out of Study!"
    }

    this.checkboxChangeHandler = this.checkboxChangeHandler.bind(this)
    this.setOption = this.setOption.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
    this.optOutOnClick = this.optOutOnClick.bind(this)
    this.updateText = this.updateText.bind(this);
    this.updateTextDONE = this.updateTextDONE.bind(this);
    this.updateText_optOut = this.updateText_optOut.bind(this);
    this.updateText_optOutDONE = this.updateText_optOutDONE.bind(this);
    this.resetOnClick = this.resetOnClick.bind(this);
  }

  updateText (event) {
    this.setState({
      text: <Spinner_grommet color='light-1' />,
    })
  }

  updateTextDONE (event) {
    this.setState({
      text: <Checkmark size="medium" />,
    })
  }

  updateText_optOut (event) {
    this.setState({
      opt_out: <Spinner_grommet color='light-1' />,
    })
  }

  updateText_optOutDONE (event) {
    this.setState({
      opt_out: <Checkmark size="medium" />,
    })
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
    this.setState({ text: this.state.text })
  }

  async resetOnClick () {
    this.updateText()
    const background = await browser.runtime.getBackgroundPage()
    await background.resetAllData()
    await tt.sleep(500)
    this.updateTextDONE()
  }

  optOutOnClick () {
    this.updateText_optOut()
    const { id } = this.state
    fetch('https://super.cs.uchicago.edu/trackingtransparency/removedata_v2.php?userId=' + id)
      .then((value) => {
        this.updateText_optOutDONE()
      })
      .then(browser.management.uninstallSelf({ showConfirmDialog: true }))
      .then(null, () => this.setState({alert: 'Uninstallation failed. Please uninstall the extension manually.'}))
  }


  resetInfo () {
    return (
      <SpecialButton
        variant='danger'
        onClick={this.resetOnClick}
        title={this.state.text}
      >

        <p>If you wish to reset all data currently being stored by {EXT.NAME}, click the button below. This will reset the data locally stored on your computer but the extension will remain installed.</p>
      </SpecialButton>
    )
  }

  optOutInfo () {
    return (
      <SpecialButton
        variant='danger'
        onClick={this.optOutOnClick}
        title={this.state.opt_out}
      >
        <p>You can stop participating at any time by clicking on the button. This will mark your data for deletion on our servers, and also uninstall the extension.</p>
      </SpecialButton>
    )
  }
  render () {
    const { id, alert } = this.state
    return (
      <div>
        {alert && <Text><strong>{alert}</strong></Text>}
        {id && id.split('-')[0] === '4' && <div>
          <Heading level='h2' margin='medium 0 medium 0'>Display options</Heading>
          <Checkbox
            value='showOverlay'
            label='Show in-page overlay'
            checked={this.state.showOverlay}
            onChange={this.checkboxChangeHandler}
            variant='toggle'
            layout='inline'
          />
        </div>}
        <Heading level='h2' margin='medium 0 medium 0'>Danger zone</Heading>
        {this.resetInfo()}
         {this.optOutInfo()} 
        <Text>
          <p><strong>User ID: {id}</strong></p>
        </Text>
      </div>
    )
  }
}
