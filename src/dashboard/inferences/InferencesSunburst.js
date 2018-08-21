/** @module InferencesSunburst */

import React from 'react'
import {Sunburst, LabelSeries} from 'react-vis'
import { darken, lighten } from '@instructure/ui-themeable/lib/utils/color'

import categoryTree from '../../data/categories_tree.json'
import categoryPaths from '../../data/categories_paths.json'

import logging from '../dashboardLogging'
import { colors } from '../../colors'

const LABEL_STYLE = {
  fontSize: '14px',
  textAnchor: 'middle'
}

const topLevelCats = categoryTree.children.map(x => x.name)
const baseColor = lighten(colors.blue1, 25)

/**
 * Recursively work backwards from highlighted node to find path of valud nodes
 * @param {Object} node - the current node being considered
 * @returns {Array} an array of strings describing the key route to the current node
 */
function getKeyPath (node) {
  return categoryPaths[(node.data && node.data.name) || node.name] || []
}

function rand (min, max) {
  return parseInt(Math.random() * (max - min + 1), 10) + min
}

/**
 * Get a random (bluish) color
 * @returns {String} a hex color
 */
function getPrettyColor (name) {
  const index = topLevelCats.indexOf(name)

  return darken(baseColor, (4.6 * index) % 37.5)
}

/**
 * Recursively modify data depending on whether or not each cell has been selected by the hover/highlight
 * @param {Object} data - the current node being considered
 * @param {Object|Boolean} keyPath - a map of keys that are in the highlight path
 * if this is false then all nodes are marked as selected
 * @returns {Object} Updated tree structure
 */
function updateData (data, keyPath, parentColor) {
  // add a fill to all the uncolored cells

  if (!data.color) {
    if (!parentColor) {
      data.color = getPrettyColor(data.name)
    } else {
      data.color = parentColor
    }
  }
  if (data.children) {
    const childColor = (data.name === 'Categories') ? false : data.color
    data.children.map(child => updateData(child, keyPath, childColor))
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
  }

  return data
}

export default class InferencesSunburst extends React.Component {
  constructor (props) {
    super(props)
    const data = this.constructSunburstData(props.inferenceCounts)

    this.state = {
      pathValue: false,
      data: data,
      finalValue: ' ',
      clicked: false
    }

    this.constructSunburstData = this.constructSunburstData.bind(this)
    this.updateSelectionFromPath = this.updateSelectionFromPath.bind(this)
  }

  constructSunburstData (inferencesList) {
    if (inferencesList.length === 0) {
      // haven't received props
      return
    }

    // we have to do a deep copy of the category tree
    // and this is supposedly the best way to do it
    let sunburstData = JSON.parse(JSON.stringify(categoryTree))

    sunburstData = this.recursiveApplySizes(sunburstData, inferencesList)
    sunburstData = updateData(sunburstData, false, false)

    return sunburstData
  }

  recursiveApplySizes (root, inferencesList) {
    let newChildren = []
    for (let item of root.children) {
      const listItem = inferencesList.find(x => x.inference === item.name)
      if (listItem) {
        item.size = listItem['COUNT(inference)']
      }

      if (item.children) {
        this.recursiveApplySizes(item, inferencesList)
      }
      if (listItem || (item.children && item.children.length > 0)) {
        newChildren.push(item)
      }
    }
    root.children = newChildren
    return root
  }

  updateSelectionFromPath (path) {
    const pathAsMap = path.reduce((res, row) => {
      res[row] = true
      return res
    }, {})
    const newVal = path[path.length - 1]
    this.setState({
      finalValue: newVal,
      pathValue: path.join(' > '),
      data: updateData(this.state.data, pathAsMap, false)
    })
  }

  async componentDidMount () {

  }

  async componentWillReceiveProps (nextProps) {
    let value = this.state.finalValue
    if (value === 'Inferences' || value === false) { value = '' }
    if (!nextProps.selectedInference) {
      await logging.logSunburstSelect(false, value) // deselect all
      this.setState({
        finalValue: false,
        clicked: false
      })

      if (nextProps.inferenceCounts) {
        const data = this.constructSunburstData(nextProps.inferenceCounts)
        this.setState({
          data: data
        })
      }
    } else {
      if (nextProps.selectedInference !== this.props.selectedInference) {
        const path = categoryPaths[nextProps.selectedInference]
        this.updateSelectionFromPath(path)
        this.setState({
          clicked: true
        })
        await logging.logSunburstSelect(true, value) // select right stuff
      }
    }
  }

  render () {
    const { clicked, data, finalValue } = this.state
    if (!data) return null
    if (!data.name) return null
    return (
      <div className='sunburst-wrapper'>

        <Sunburst
          animation
          className='inferences-sunburst'
          hideRootNode
          onValueMouseOver={node => {
            if (clicked) {
              return
            }
            const path = getKeyPath(node).reverse()
            this.updateSelectionFromPath(path)
          }}
          onValueMouseOut={() => {
            if (!clicked) {
              this.setState({
                pathValue: false,
                finalValue: false,
                data: updateData(data, false, false)
              })
            }
          }}
          onValueClick={() => {
            if (clicked) {
              this.setState({clicked: false})
              this.props.onSelectionChange(false)
            } else {
              this.setState({clicked: true})
              this.props.onSelectionChange(finalValue)
            }
          }}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          colorType='literal'
          data={data}
          height={500}
          width={500}>
          {finalValue && <LabelSeries data={[
            {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
          ]} />}
        </Sunburst>

      </div>
    )
  }
}
