import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import Button from '@instructure/ui-buttons/lib/components/Button'
import CloseButton from '@instructure/ui-buttons/lib/components/CloseButton'
import Modal from '@instructure/ui-overlays/lib/components/Modal'
import ModalBody from '@instructure/ui-overlays/lib/components/Modal/ModalBody'
import ModalHeader from '@instructure/ui-overlays/lib/components/Modal/ModalHeader'
import ModalFooter from '@instructure/ui-overlays/lib/components/Modal/ModalFooter'

const inferenceList = (data) => {
  return (
    <p>
      {data.map((p, i, arr) => {
        const last = (i === (arr.length - 1))
        const inference = p['DISTINCT(inference)']
        return (
          <span key={inference}>
            {inference}{!last ? ', ' : ''}
          </span>
        )
      })}
    </p>
  )
}

const trackerList = (data) => {
  return (
    <p>
      {data.map((p, i, arr) => {
        const last = (i === (arr.length - 1))
        return (
          <span key={p.tracker}>
            {p.tracker}{!last ? ', ' : ''}
          </span>
        )
      })}
    </p>
  )
}

export default class IntroModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  async getData () {
    const background = await browser.runtime.getBackgroundPage()
    let args = {count: 5}

    const numPages = background.queryDatabase('getNumberOfPages', {})
    const numTrackers = background.queryDatabase('getNumberOfTrackers', {})
    const numInferences = background.queryDatabase('getNumberOfInferences', {})
    const recentInferences = background.queryDatabase('getInferencesByTime', args)
    const topTrackers = background.queryDatabase('getTrackers', args)

    // we use promises here instead of async/await because queries are not dependent on each other
    numPages.then(n => this.setState({numPages: n}))
    numTrackers.then(n => this.setState({numTrackers: n}))
    numInferences.then(n => this.setState({numInferences: n}))
    recentInferences.then(n => this.setState({recentInferences: n}))
    topTrackers.then(n => this.setState({topTrackers: n}))
  }

  async componentDidMount () {
    this.getData()
  }

  renderCloseButton () {
    return (
      <CloseButton
        placement='end'
        offset='medium'
        variant='icon'
        onClick={this.handleButtonClick}
      >
         Close
      </CloseButton>
    )
  }

  render () {
    const {numTrackers, numInferences, numPages, recentInferences, topTrackers} = this.state
    return (
      <Modal
        open={this.props.show}
        onDismiss={this.props.onHide}
        label='Welcome modal'
      >
        <ModalHeader>
          {this.renderCloseButton()}
          <Heading>Welcome to Tracking Transparency!</Heading>
        </ModalHeader>

        <ModalBody>
          <Text>
            <p> When you browse the Internet, third-party companies can track your browsing activity and use this information to target ads and for other purposes. We hope this extension will help you understand who is tracking you and what they could have learned.</p>
            <p> In the last week, you visited <strong>{numPages} pages</strong> and encountered <strong>{numTrackers} trackers</strong>.</p>
            <hr />
            {topTrackers && topTrackers.length > 0 && <div>
              <p><strong>Your top 5 trackers:</strong></p>
              <div>{trackerList(topTrackers)}</div>
              <hr />
            </div>}
            {recentInferences && recentInferences.length > 0 && <div>
              <p><strong>Your top 5 inferred interests:</strong></p>
              <div>{inferenceList(recentInferences)}</div>
              <hr />
            </div>}
            <p>Continue to the homepage to learn more about the trackers you have encountered, what they might have learned about you, and more.</p>
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button onClick={this.props.onHide}>Continue</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export const WaitingDataIntro = () => (
  <div>
    <h1>Tracking Transparency</h1>
    <div className='homeText'>
      <p>The Tracking Tranparency extension is currently running in the background to collect information about the trackers in your browsing.</p>
      <p>Continue using the internet and come back here in a few days to see what they might know about your browsing!</p>
    </div>
  </div>
)
