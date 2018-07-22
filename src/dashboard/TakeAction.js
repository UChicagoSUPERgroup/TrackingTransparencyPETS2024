import React from 'react';
import { Link } from 'react-router-dom'

import Heading from '@instructure/ui-elements/lib/components/Heading'
import Text from '@instructure/ui-elements/lib/components/Text'
import ToggleDetails from '@instructure/ui-toggle-details/lib/components/ToggleDetails'
import ToggleGroup from '@instructure/ui-toggle-details/lib/components/ToggleGroup'
import View from '@instructure/ui-layout/lib/components/View'

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
      <Text>
        <Heading level='h1' margin='0 0 medium'>Settings</Heading>

        <Heading level='h2'>Take Action</Heading>
        <Text>
          <p>We hope that you have learned something about online tracking by using our extension.</p>
          <p>Indicate your preferences here about topics related to online tracking and consumer transparency. Your selections here will <strong>not</strong> change the operation of your browser, but will help us continue our work. We may add your selections as features in the future.</p>
        </Text>

        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Trackers"
        >
          <View display="block" padding="small">I want no tracking, even if I won't see any relevant advertisements</View>
          <View display="block" padding="small">I'm okay with some tracking, if it means that I will see advertisements relevant to me</View>
          <View display="block" padding="small">I'm okay with all tracking because I want to see advertisements relevant to me</View>
        </ToggleGroup>


        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Inferencing"
        >
          <View display="block" padding="small">I would opt-out of all inferencing</View>
          <View display="block" padding="small">I would only want non-sensitive inferencing</View>
          <View display="block" padding="small">Any and all inferencing is fine</View>
        </ToggleGroup>

        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Installing Tracker Blockers"
          >
            <p>Several browser extensions serve as tracker blockers. These extensions prevent advertisers and other third-party services from tracking where and what you browse. We recommend <a href='https://www.eff.org/privacybadger' target='_blank' rel='noopener noreferrer'>Privacy Badger</a> or <a href='https://www.ghostery.com/' target='_blank' rel='noopener noreferrer'>Ghostery</a>. Some ad-blocking services may have this feature as well.</p>
          <View display="block" padding="small">I would use a tracker blocker.</View>
          <View display="block" padding="small">I would not use a tracker blocker.</View>
        </ToggleGroup>

        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Cookies"
          >
            <p>Cookies are pieces of data maintained by the web browser to store information about the way you browse. They may be used to track you as well. Each advertiser gives you the option to disable cookie tracking. You can learn more  <a href='http://optout.aboutads.info/?c=2#!/' target='_blank' rel='noopener noreferrer'>here</a>.</p>
          <View display="block" padding="small">I would block cookies.</View>
          <View display="block" padding="small">I would not block cookies.</View>
        </ToggleGroup>

        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Do Not Track (DNT) setting"
          >
            <p>Do Not Track (DNT) is a browser setting that sends the request <q> don&#39;t want to be tracked</q> with every website you visit. it’s like a setting in your browser preferences. However, few companies respect this request.</p>
          <View display="block" padding="small">I would enable DNT.</View>
          <View display="block" padding="small">I would not enable DNT.</View>
        </ToggleGroup>


        <ToggleGroup
          transition={false}
          toggleLabel="This is the toggle button label for screenreaders"
          summary="Data Broker Profiles"
          >
            <p>Data brokers are third-parties that collect data about you when you use your browser. To prevent these third-parties from collecting information about you and remove any profiles they may already have of you, you can follow <a href='https://www.the-parallax.com/2016/04/07/how-to-clean-up-or-delete-data-brokers-profiles-of-you/' target='_blank' rel='noopener noreferrer'>this article</a>.</p>
          <View display="block" padding="small">I would adjust the profile that data brokers have about me.</View>
          <View display="block" padding="small">I would not adjust the profile that data brokers have about me.</View>
        </ToggleGroup>

      </Text>

    )
  }
}

export default TakeActionPage;
