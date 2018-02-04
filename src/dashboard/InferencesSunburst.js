/** @module InferencesSunburst */

import React from 'react';
import { Link } from 'react-router-dom';
import {Sunburst, LabelSeries} from 'react-vis';

import tt from '../helpers';

import categoryTree from '../data/categories_tree.json';

const EXTENDED_DISCRETE_COLOR_RANGE = ['#19CDD7', '#DDB27C', '#88572C', '#FF991F', '#F15C17', '#223F9A', '#DA70BF', '#125C77', '#4DC19C', '#776E57', '#12939A', '#17B8BE', '#F6D18A', '#B7885E', '#FFCB99', '#F89570', '#829AE3', '#E79FD5', '#1E96BE', '#89DAC1', '#B3AD9E'];


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

/**
 * Recursively modify data depending on whether or not each cell has been selected by the hover/highlight
 * @param {Object} data - the current node being considered
 * @param {Object|Boolean} keyPath - a map of keys that are in the highlight path
 * if this is false then all nodes are marked as selected
 * @returns {Object} Updated tree structure
 */
function updateData(data, keyPath) {
  if (data.children) {
    data.children.map(child => updateData(child, keyPath));
  }
  // add a fill to all the uncolored cells
  if (!data.color) {
    const randomColor = EXTENDED_DISCRETE_COLOR_RANGE[Math.floor(Math.random()*EXTENDED_DISCRETE_COLOR_RANGE.length)];
    data.color = randomColor;
    // data.style = {
    //   fill: randomColor
    // };
  }
  data.style = {
    ...data.style,
    fillOpacity: keyPath && !keyPath[data.name] ? 0.2 : 1
    // fill: keyPath && !keyPath[data.name] ? "#cccccc" : data.color
  };

  return data;
}


export default class BasicSunburst extends React.Component {
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
    sunburstData = updateData(sunburstData, false);

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

  componentWillReceiveProps(nextProps) {
    if (!nextProps.selectedInference) {
      
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
      }
    }
    
  }


  render() {
    const {clicked, data, finalValue, pathValue} = this.state;
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
              data: updateData(data, pathAsMap)
            });
          }}
          onValueMouseOut={() => {
            if (!clicked) {
              this.setState({
                pathValue: false,
                finalValue: false,
                data: updateData(data, false)
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
          height={400}
          width={400}>
          {finalValue && <LabelSeries data={[
            {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
          ]} />}
        </Sunburst>
        <div><em>{clicked ? 'Click on the diagram to unselect the current category' : 'Click a category to see more information'}</em></div>
        <Link to={{pathname: '/inferences/' + finalValue}}>{pathValue}</Link>
      </div>
    );
  }

}