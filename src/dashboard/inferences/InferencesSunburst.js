/** @module InferencesSunburst */

import React from 'react';
import { Link } from 'react-router-dom';
import {Sunburst, LabelSeries} from 'react-vis';

import categoryTree from '../../data/categories_tree.json';

import logging from '../dashboardLogging';

import COLORS from '../../colors';
// const PRIMARIES = [COLORS.UC_YELLOW_1, COLORS.UC_ORANGE_1, COLORS.UC_RED_1, COLORS.UC_LT_GREEN_1, COLORS.UC_DK_GREEN_1, COLORS.UC_BLUE_1, COLORS.UC_VIOLET_1];

const LABEL_STYLE = {
  fontSize: '14px',
  textAnchor: 'middle'
};

/**
 * Recursively work backwards from highlighted node to find path of valud nodes
 * @param {Object} node - the current node being considered
 * @returns {Array} an array of strings describing the key route to the current node
 */
function getKeyPath(node) {
  if (!node.parent) {
    return [];
  }

  return [node.data && node.data.name || node.name].concat(getKeyPath(node.parent));
}

let colorCounter = 0;

function rand(min, max) {
    return parseInt(Math.random() * (max-min+1), 10) + min;
}

/**
 * Get a random (bluish) color
 * @returns {String} a hex color
 */
function getPrettyColor() {
  var h = rand(180, 250);
  var s = rand(30, 100);
  var l = rand(20, 70);
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

/**
 * Recursively modify data depending on whether or not each cell has been selected by the hover/highlight
 * @param {Object} data - the current node being considered
 * @param {Object|Boolean} keyPath - a map of keys that are in the highlight path
 * if this is false then all nodes are marked as selected
 * @returns {Object} Updated tree structure
 */
function updateData(data, keyPath, parentColor) {
  // add a fill to all the uncolored cells

  if (!data.color) {
    if (!parentColor) {
      // data.color = PRIMARIES[(colorCounter++) % PRIMARIES.length]
      // data.color = COLORS.UC_BLUE_1;
      data.color = getPrettyColor();
    } else {
      data.color = parentColor;
    }


    // data.style = {
    //   fill: randomColor
    // };
  }
  if (data.children) {
    const childColor = (data.name === 'Categories') ? false : data.color;
    data.children.map(child => updateData(child, keyPath, childColor));
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
    // fill: keyPath && !keyPath[data.name] ? "#cccccc" : data.color
  };

  return data;
}


export default class InferencesSunburst extends React.Component {
  constructor(props) {
    super(props);
    // this.decoratedData = this.constructSunburstData(this.props.inferencesList);
    const data = this.constructSunburstData(props.inferenceCounts);

    this.state = {
      pathValue: false,
      data: data,
      finalValue: 'Inferences',
      clicked: false
    }

    this.constructSunburstData = this.constructSunburstData.bind(this);
    //this.logSelect = this.logSelect.bind(this);
  }


  constructSunburstData(inferencesList) {
    if (inferencesList.length === 0) {
      // haven't received props
      return;
    }

    // we have to do a deep copy of the category tree
    // and this is supposedly the best way to do it
    let sunburstData = JSON.parse(JSON.stringify(categoryTree));

    sunburstData = this.recursiveApplySizes(sunburstData, inferencesList);
    sunburstData = updateData(sunburstData, false, false);

    return sunburstData;
  }

  recursiveApplySizes(root, inferencesList) {
    let newChildren = [];
    for (let item of root.children) {
      const listItem = inferencesList.find(x => x.inference === item.name);
      if (listItem) {
        item.size = listItem['COUNT(inference)'];
      }

      if (item.children) {
        this.recursiveApplySizes(item, inferencesList);
      }
      if (listItem || (item.children && item.children.length > 0)) {
        newChildren.push(item);
      }
    }
    root.children = newChildren;
    return root;
  }

  async componentDidMount() {

  }

  async  componentWillReceiveProps(nextProps) {
    colorCounter = 0;
    let value = this.state.finalValue;
    if (value === 'Inferences' || value === false){value = ''}
    //console.log('SUNBURST ', value);
    if (!nextProps.selectedInference) {
      //console.log('SUNBURST1 ', value);
      await logging.logSunburstSelect(false, value);//deselect all
      // clear any selections
      this.setState({
        finalValue: false,
        clicked: false
      });

      if (nextProps.inferenceCounts) {
        const data = this.constructSunburstData(nextProps.inferenceCounts);
        this.setState({
          data: data
        });
      }
    } else {
      if (nextProps.selectedInference !== this.props.selectedInference) {
        this.setState({
          finalValue: nextProps.selectedInference,
          clicked: true
        });
        //console.log('SUNBURST2 ', value);
        await logging.logSunburstSelect(true, value);//select right stuff
      }
    }

  }


  render() {
    const {clicked, data, finalValue, pathValue} = this.state;
    if (!data) return null;
    if (!data.name) return null;
    return (
      <div className="sunburst-wrapper">

        <Sunburst
          animation
          className="inferences-sunburst"
          hideRootNode
          onValueMouseOver={node => {
            if (clicked) {
              return;
            }
            const path = getKeyPath(node).reverse();
            const pathAsMap = path.reduce((res, row) => {
              res[row] = true;
              return res;
            }, {});
            const newVal = path[path.length - 1];
            this.setState({
              finalValue: newVal,
              pathValue: path.join(' > '),
              data: updateData(data, pathAsMap, false)
            });
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
              this.setState({clicked: false});
              this.props.onSelectionChange(false);
            } else {
              this.setState({clicked: true});
              this.props.onSelectionChange(finalValue);
            }

          }}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          colorType="literal"
          data={data}
          height={500}
          width={500}>
          {finalValue && <LabelSeries data={[
            {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
          ]} />}
        </Sunburst>

      </div>
    );
  }

}
