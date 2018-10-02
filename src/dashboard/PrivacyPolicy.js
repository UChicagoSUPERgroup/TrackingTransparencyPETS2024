import React from 'react'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import Text from '@instructure/ui-elements/lib/components/Text'
import Grid from '@instructure/ui-layout/lib/components/Grid'
import GridCol from '@instructure/ui-layout/lib/components/Grid/GridCol'
import GridRow from '@instructure/ui-layout/lib/components/Grid/GridRow'

import logging from './dashboardLogging'
import TTPanel from './components/TTPanel'

const PrivacyPolicyPage = () => (
  <Grid>
    <GridRow>
      <GridCol>
        <Heading level='h1'>Our Privacy Policy</Heading>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Text>
            <p>The goal of this project is to measure and study how users interact with personalized information regarding online tracking of their web history. All of the data for the project will be collected in an anonymized form which ensures that it is not Personally Identifiable Information, nor otherwise likely to lead to the identification or tracking of any web users.</p>
            <p>We are committed to protecting the privacy of all users of our extension. We have established this privacy policy to explain what information we collect through this extension and how it is used.</p>
            <p>In this policy, "the researchers" and "we" refer to any and all researchers or assistants otherwise involved in this research project.</p>
            <p>The researchers are located within the United States, and therefore will transfer, process, and store your information in the United States.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Information Gathered by the Extension</Heading>
          <Text>
            <p>In general, this extension collects anonymous data about the configuration of computers, operating systems, browsers, browsers' plugins, adblockers and other privacy software. Although these kinds of data may form a 'fingerprint' that could in principle be combined with information about page requests and identifying details in order to track people's browsing habits, we will never do so.</p>
            <p>The types of information we collect are:
              <ul>
                <li>ABC</li>
                <li>ABC</li>
                <li>ABC</li>
              </ul>
            </p>
            <p>Our practices and purposes for collecting this information is discussed below:
            </p>
            <Heading level='h4'>Timestamps</Heading>
            <p>We collect a timestamp each time a page in our extension is visited, as well as any time the mouse is clicked. This will be used to measure how fast ..., but for no other purpose.</p>
            <Heading level='h4'>foo</Heading>
            <p>foo</p>
            <Heading level='h4'>bar</Heading>
            <p>bar</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Updating or Removing Your Information</Heading>
          <Text>
            <p>To protect your privacy, we use various techniques to anonymize the data set, and have promised in this policy not to try to de-anonymize the data, which means we don't know which entry in our data set is from your browser. This also means that we have no way to allow you to access, update or remove that specific data. If you have any questions, please contact us.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Sharing of Our Data</Heading>
          <Text>
            <p>As part of this project, we may share datasets derived from this project with research partners working on topics related to Internet security or privacy. We may also publish datasets in an effort to further these objectives. The datasets we may share or publish will not intentionally contain personally identifiable information.</p>
            <p>Before sharing, we will evaluate whether further sanitization or aggregation of data is necessary to reduce the likelihood that inferences about identifiable individuals' activities might be made from the published dataset. Because anonymization is an algorithmically complex problem, we cannot promise that it will be flawless or attack-proof. When we believe that a dataset may contain information that is especially sensitive or vulnerable to de-anonymition, we will not publish it, and if we share such data with research partners, we will place them under a contractual obligation to keep the dataset confidential and avoid de-anonymization.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Data Storage and Retention</Heading>
          <Text>
            <p>...</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Security</Heading>
          <Text>
            <p>We employ industry standard security measures to protect the loss, misuse, and alteration of the information under our control, including appropriate technical and organizational measures to ensure a level of security appropriate to the risk, such as the pseudonymization and encryption of personal data, data backup systems, and engaging security professionals to evaluate our systems effectiveness. Although we make good faith efforts to store information collected by us in a secure operating environment, we cannot guarantee complete security.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Contacting Us</Heading>
          <Text>
            <p>If you have any questions about our privacy and data protection practices, you can reach our Principal Invesgitators at:</p>
            <p><strong>Blase Ur</strong><br/>Room 363<br/>5730 S Ellis Ave<br/>Chicago, IL 60637<br/>Email: blase@uchicago.edu</p>
            <p><strong>Michelle Mazurek</strong><br/>3421 A.V. Williams Building<br/>College Park, MD 20742<br/>Email: mmazurek@umd.edu</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>

    <GridRow>
      <GridCol>
        <TTPanel>
          <Heading level='h2'>Changes to Our Policies</Heading>
          <Text>
            <p>This extension's privacy policy may change from time to time. However, any revised privacy policy will be consistent with the purpose of this research project. If we make any substantive changes to our policies, we will post notice of changes on this page.</p>
          </Text>
        </TTPanel>
      </GridCol>
    </GridRow>
  </Grid>
)

export default PrivacyPolicyPage
