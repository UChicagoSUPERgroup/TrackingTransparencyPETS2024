import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

export default class InfoPage extends React.Component {
  // constructor (props) {
  //   super(props)
  // }

  componentDidMount () {
    let activityType = 'load dashboard About page'
    logging.logLoad(activityType, {})
  }

  render () {
    return (
      <Grid>
        <GridRow>
          <GridCol>
            <Heading level='h1'><strong>About</strong></Heading>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>How the extension works</Heading>
              <Text>
                <p>
            With this extension, we hope to bring you more transparency about the world of online tracking, analytics, and advertising. Tracking Transparency runs in the background of your browser to collect information about online trackers that are tracking you.
                </p>
                <p>
            We track the trackers by looking for data being sent to or from known trackers. We determine whether an entity is a tracker with Disconnect's open-source  <a href = "https://disconnect.me/trackerprotection/blocked" target='_blank' rel='noopener noreferrer'>list of known trackers</a>. Unlike other ad or tracker blockers you might use, this extension does <em>not</em> block ads or otherwise change any aspect of your browsing. Instead, this extension reveals the hidden  where and when you may have encountered these trackers. 
                </p>
                <p>
            Tracking Transparency also makes guesses about what trackers could have learned about you. Many trackers operate by collecting information about you and your interests and selling this data to other entities. This extension has a built-in algorithm to guess the topic of a web page based on the content, and uses this information to help you understand what trackers could be learning about you.
                </p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>Your privacy</Heading>
              <Text>
                <p>
            The data that Tracking Transparency collects about you is securely stored in your local browser. Your personal data is never sent to another server, so not even the researchers and developers of Tracking Transparency have access to any personally-identifiable information.
                </p>
                <p>
            To show you the data that other companies could gather about your browsing behavior, our extension logs your behavior, page visits, and an inferred topic of your visited pages in a local database on your computer. The extension also sends a small number of anonymized statistics so we can understand how people are using the extension. The specific websites you visit and your browsing history never leave your computer and are not shared in any way. The statistics collected will only be accessed by the University of Chicago research team. We may publish aggregate statistics and findings from the reported data, but will never sell your data.
                </p>
                <p>
                  To learn more, please read our <a href='https://super.cs.uchicago.edu/trackingtransparency/privacy.html' target='_blank' rel='noopener noreferrer'>privacy policy</a>.
                </p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>

        <GridRow>
          <GridCol>
            <TTPanel>
              <Heading level='h2'>Who we are</Heading>
              <Text>
                <p>The Tracking Transparency extension was built by a research team at the <Link href='https://super.cs.uchicago.edu' target='_blank' rel='noopener noreferrer'>University of Chicago SUPERgroup</Link>. The project is advised by Blase Ur at the University of Chicago, Michelle L. Mazurek at the University of Maryland, and Lorrie Faith Cranor at Carnegie Mellon University.</p>
                <p>Should you have any questions about the plugin or our associated research, you may email the research team at <Link href='mailto:trackingtransparency@super.cs.uchicago.edu'>trackingtransparency@lists.uchicago.edu</Link>.</p>
                <p>Our extension is open source, and the code is available under Link-free license at <Link href='https://github.com/UChicagoSUPERgroup/trackingtransparency' target='_blank' rel='noopener noreferrer'>GitHub</Link>.</p>
              </Text>
            </TTPanel>
          </GridCol>
        </GridRow>
      </Grid>
    )
  }
}
