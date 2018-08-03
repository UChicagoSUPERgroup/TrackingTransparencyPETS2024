import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import View from '@instructure/ui-layout/lib/components/View'

const TTPanel = (props) => (
  <View
    as='div'
    margin='none'
    padding='small'
    textAlign={props.textAlign || 'center'}
    background='default'
    borderWidth='small'
    borderRadius='medium'
  >
    {props.header &&
    <View
      as='header'
      margin='0 0 small'
      textAlign='center'
    >
      <Text weight="bold">{props.header}</Text>
    </View>}
    {props.children}
  </View>
)

export default TTPanel
