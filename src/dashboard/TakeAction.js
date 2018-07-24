import React from 'react';
import { Link } from 'react-router-dom';

import Heading from '@instructure/ui-elements/lib/components/Heading';
import Text from '@instructure/ui-elements/lib/components/Text';
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails';
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup';
import View from '@instructure/ui-layout/lib/components/View';
import Checkbox from '@instructure/ui-forms/lib/components/Checkbox';

import logging from './dashboardLogging';

export class TakeActionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() {
    let activityType='load take action page';
    logging.logLoad(activityType, {});
  }

  render() {
    const {numTrackers, numInferences, numPages} = this.state;
    return (
      <div>
        <div>
          <Heading level='h1'>Take Action</Heading>
          <Text>
            <p>We hope that you have learned something about online tracking by using our extension.</p>
          </Text>
          <Text>
            <p>Although our extension does <em>not</em> change the operation of your browser, you can take action regarding online tracking. On this page, we list a number of options you could take. Please let us know if you plan to take any of these actions (or already do), as it will help us understand the impact of our extension. We may add your selections as features in the future.</p>
          </Text>
        </div>

        <div>
          <Heading level='h2' border="top">Installing Tracker Blockers</Heading>
          <Text>
            <p>Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. Examples include <a href='https://www.eff.org/privacybadger' target='_blank' rel='noopener noreferrer'>Privacy Badger</a> and <a href='https://www.ghostery.com/' target='_blank' rel='noopener noreferrer'>Ghostery</a>. Some ad-blocking services may have this feature as well.</p>
          </Text>
          <Checkbox label="I would use a tracker blocker." value="medium"/>
          <br />
        </div>

        <div>
          <Heading level='h2' border="top">Cookies</Heading>
          <Text>
            <p>Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. Each advertiser gives you the option to disable cookie tracking. You can learn more  <a href='http://optout.aboutads.info/?c=2#!/' target='_blank' rel='noopener noreferrer'>here</a>.</p>
          </Text>
          <Checkbox label="I would block cookies." value="medium"/>
          <br />
        </div>

        <div>
          <Heading level='h2' border="top">Do Not Track (DNT) Setting</Heading>
          <Text>
            <p>Do Not Track (DNT) is a browser setting that sends the request <q> don&#39;t want to be tracked</q> with every website you visit. it’s like a setting in your browser preferences. However, few companies respect this request.</p>
          </Text>
          <Checkbox label="I would enable the DNT setting." value="medium"/>
          <br />
        </div>

        <div>
          <Heading level='h2' border="top">Data Broker Profiles</Heading>
          <Text>
            <p>Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href='https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/' target='_blank' rel='noopener noreferrer'>this article</a>.</p>
          </Text>
          <Checkbox label="I would adjust the profile that data brokers have about me." value="medium"/>
          <br />
        </div>

      </div>

    )
  }
}

export default TakeActionPage;
