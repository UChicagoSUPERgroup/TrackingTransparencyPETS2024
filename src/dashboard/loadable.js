import React, {useEffect, useState} from 'react'
import Loadable from 'react-loadable'
import Text from '@instructure/ui-elements/lib/components/Text'
import Spinner from '@instructure/ui-elements/lib/components/Spinner'

import { Box } from "grommet";
import {Spinner as Spinner_grommet} from 'grommet';
import tt from '../helpers'
import pMinDelay from "p-min-delay"
import pWaitFor from 'p-wait-for';

const Loading = props => {

  // alert(JSON.stringify(props))
  // pWaitFor(() => props.isLoading==false);
  // pMinDelay(import(/* webpackChunkName: "dashboard/Profile" */'./Profile'), 0),

  if (props.error) {
    return <div>Error! <button onClick={props.retry}>Retry</button></div>;
  } else if (props.pastDelay) {
    return <Box> <Spinner_grommet /> </Box>
  } else {
    return null;
  }
}
export default Loading

export const Trackers = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/Trackers" */'./trackers'),
  loading: Loading
})

export const Inferences = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/Inferences" */'./inferences'),
  loading: Loading
})

export const Sites = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/Sites" */'./sites'),
  loading: Loading
})

export const Activity = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/ActivityOverview" */'./activity/ActivityOverview'),
  loading: Loading
})

// export const TakeActionPage = Loadable({
//   loader: () => import(/* webpackChunkName: "dashboard/TakeAction" */'./TakeAction'),
//   loading: Loading
// })

export const DebugPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/DebugPage" */'./Debug'),
  loading: Loading
})

export const InfoPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/InfoPage" */'./Info'),
  loading: Loading
})

export const SettingsPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/SettingsPage" */'./Settings'),
  loading: Loading
})

export const LightbeamWrapper = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/LightbeamWrapper" */'./LightbeamWrapper'),
  loading: Loading
})

export const ProfilePage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/Profile" */'./Profile'),
  loading: Loading,
  // delay: 0, // 200ms default

})

export const TakeActionPage = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard/TakeAction" */'./TakeAction'),
  loading: Loading
})