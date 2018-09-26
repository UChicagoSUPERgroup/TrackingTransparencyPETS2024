import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

const InfoPage = () => (
  <Grid>
    <GridRow>
      <GridCol>
        <Heading level='h1'>About</Heading>
      </GridCol>
    </GridRow>
    
    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>How the extension works</Heading>
          <Text>
            <p>
          With this extension, we hope to bring you more transparency about the world of online tracking, analytics, and advertising. We track the trackers by looking for trackers on all of the pages you visit while the extension is running. The extension keeps track of
          where and when you encountered these trackers. All of this information is used to show you personalized examples of how you interact with trackers during your normal browsing habits.
            </p>
            <p>
          Tracking Transparency runs in the background while you browse online to collect information about these online trackers.
            </p>
            <p>
        We collect information about:
              <ul>
                <li>Which websites you visit</li>
                <li>Which trackers are on these websites</li>
              </ul>
        Using this information, we show you:
              <ul>
                <li>Which <Link href='#/trackers'>trackers</Link> have tracked you </li>
                <li>Which <Link href='#/inferences'>inferences</Link> have been made about you based on the tracking</li>
                <li>When inferences have been made about you during your <Link href='#/activity'>recent activity</Link></li>
              </ul>
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
          The data that Tracking Transparency collects about you is securely stored in your local browser. Your data is never sent to another server, so not even the researchers and developers of Tracking Transparency have access to your data.
            </p>
            <p>
          To show you the data that other companies could gather about your browsing behavior, our extension logs your behavior and page visits in a local database on your computer. The extension also sends a limited number of anonymized statistics so we can understand how people are using the extension. We send information about ???, ???, and ???. The specific websites you visit and your browsing history never leave your computer and are not shared in any way. The statistics collected will only be accessed by the University of Chicago research team. We may publish aggregate statistics and findings from the reported data, but will never sell or share your data. (TODO confirm that we can actually say we will *never* share)
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
            <p>Should you have any questions about the plugin or our associated research, you may email the research team at <Link href='mailto:trackingtransparency@super.cs.uchicago.edu'>trackingtransparency@super.cs.uchicago.edu</Link>.</p>
            <p>Our extension is open source, and the code is available under Link free license at <Link href='https://github.com/UChicagoSUPERgroup/trackingtransparency' target='_blank' rel='noopener noreferrer'>GitHub</Link>.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>
  </Grid>
)

export default InfoPage
