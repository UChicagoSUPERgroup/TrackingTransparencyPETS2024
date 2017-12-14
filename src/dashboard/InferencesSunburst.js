import React from 'react';
import {Sunburst, LabelSeries} from 'react-vis';
import ttDashboard from './dashboardHelpers';

import categoryTree from './data/categories_no_duplicate.json';

const EXTENDED_DISCRETE_COLOR_RANGE = ['#19CDD7', '#DDB27C', '#88572C', '#FF991F', '#F15C17', '#223F9A', '#DA70BF', '#125C77', '#4DC19C', '#776E57', '#12939A', '#17B8BE', '#F6D18A', '#B7885E', '#FFCB99', '#F89570', '#829AE3', '#E79FD5', '#1E96BE', '#89DAC1', '#B3AD9E'];


const LABEL_STYLE = {
  fontSize: '12px',
  textAnchor: 'middle'
};

/**
 * Recursively work backwards from highlighted node to find path of valud nodes
 * @param {Object} node - the current node being considered
 * @returns {Array} an array of strings describing the key route to the current node
 */
function getKeyPath(node) {
  if (!node.parent) {
    return ['root'];
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
    this.state = {
        pathValue: false,
        data: {},
        originalData: {},
        finalValue: 'SUNBURST',
        clicked: false
    }
  }


  constructSunburstData(inferencesList) {
    if (inferencesList.length === 0) {
      // haven't received props
      return;
    }

    let sunburstData = categoryTree;

    this.recursiveApplySizes(sunburstData, inferencesList);
    const updated = updateData(sunburstData, false);
    ttDashboard.log(sunburstData);

    this.decoratedData = sunburstData;

    // return sunburstData;

    this.setState({
    //   originalData: sunburstData,
      data: sunburstData
    });
  }

  recursiveApplySizes(root, inferencesList) {
    let newChildren = [];
    for (let item of root.children) {
      const listItem = inferencesList.find(x => x.inference === item.name);
      if (listItem) {
        item.size = listItem["COUNT(inference)"];
      }
      
      if (item.children) {
        this.recursiveApplySizes(item, inferencesList);
      }
      if (listItem || (item.children && item.children.length > 0)) {
        newChildren.push(item);
      }
    }
    root.children = newChildren;
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getInferences", {count: 100});
    ttDashboard.log(inferences);
    this.constructSunburstData(inferences);
  }

  render() {
    const {clicked, data, originalData, finalValue, pathValue} = this.state;
    if (!data.name) return null;
    return (
      <div className="sunburst-wrapper">
        <div>{clicked ? 'Click to unlock selection' : 'Click to lock selection'}</div>
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
            this.setState({
              finalValue: path[path.length - 1],
              pathValue: path.join(' > '),
              data: updateData(this.decoratedData, pathAsMap)
            });
          }}
          onValueMouseOut={() => clicked ? () => {} : this.setState({
            pathValue: false,
            finalValue: false,
            data: updateData(this.decoratedData, false)
          })}
          onValueClick={() => this.setState({clicked: !clicked})}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          colorType="literal"
        //   getSize={d => d.value}
          data={data}
          height={500}
          width={500}>
          {finalValue && <LabelSeries data={[
            {x: 0, y: 0, label: finalValue, style: LABEL_STYLE}
          ]} />}
        </Sunburst>
        <div className="sunburst-path-name">{pathValue}</div>
      </div>
    );
  }

}