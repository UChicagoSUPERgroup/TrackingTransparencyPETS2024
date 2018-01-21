/** @module InferencesSunburst */

import React from 'react';
import { Link } from 'react-router-dom';
import {Sunburst, LabelSeries} from 'react-vis';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import tt from '../helpers';

import categoryTree from '../data/categories_tree.json';
import sensitiveCats from '../data/categories_comfort_list.json';

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
    this.state = {
      pathValue: false,
      data: {},
      finalValue: 'Inferences',
      clicked: false
    }

    this.handleSensitivitySelection = this.handleSensitivitySelection.bind(this);
  }


  constructSunburstData(inferencesList) {
    if (inferencesList.length === 0) {
      // haven't received props
      return;
    }

    let sunburstData = categoryTree;

    this.recursiveApplySizes(sunburstData, inferencesList);
    sunburstData = updateData(sunburstData, false);
    console.log(sunburstData);

    this.decoratedData = sunburstData;

    // return sunburstData;

    this.setState({
      data: sunburstData
    });
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
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase('getInferences', {count: 100});
    console.log(inferences);
    this.constructSunburstData(inferences);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedInference) {
      this.setState({
        finalValue: nextProps.selectedInference,
        clicked: true
      });
    }
  }

  async handleSensitivitySelection(e) {
    const key = e.target.attributes.getNamedItem('data-key').value;
    console.log('key:', key);
    console.log(sensitiveCats);
    let cats = [];
    switch (key) {
    case 'all-senstive':
      // reset to default
      this.componentDidMount();
      return;
    case 'less-sensitve':
      cats = sensitiveCats.slice(-50).reverse(); // 50 least sensitive categories
      break;
    case 'more-sensitve':
      cats = sensitiveCats.slice(0,50);
      break;
    }
    console.log(cats);

    const background = await browser.runtime.getBackgroundPage();
    const queryPromises = cats.map(cat => {
      return background.queryDatabase('getInferenceCount', {inference: cat});
    });

    const counts = await Promise.all(queryPromises); // lets all queries happen async

    const data = cats.map((cat, i) => {
      return {
        'inference': cat,
        'COUNT(inference)': counts[i]
      }
    });

    this.constructSunburstData(data);
  }

  render() {
    const {clicked, data, finalValue, pathValue} = this.state;
    if (!data.name) return null;
    return (
      <div className="sunburst-wrapper">
        <div>
          <h3>Filters</h3>
          {/* <p>Prevalence: <ButtonGroup>
            <Button href="#">All Inferences</Button>
            <Button href="#">Common Inferences</Button>
            <Button href="#">Uncommon Inferences</Button>
          </ButtonGroup></p> */}
          <p>Sensitivity: <ButtonGroup onClick={this.handleSensitivitySelection}>
            <Button data-key='all-sensitive'>All Inferences</Button>
            <Button data-key='less-sensitive'>Less Sensitive Inferences</Button>
            <Button data-key='more-sensitive'>Sensitive Inferences</Button>
          </ButtonGroup></p>
          {/* <p>Date: <ButtonGroup>
            <Button href="#">All</Button>
            <Button href="#">Today</Button>
            <Button href="#">Last Week</Button>
            <Button href="#">Last Month</Button>
          </ButtonGroup></p> */}
        </div>
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
              data: updateData(this.decoratedData, pathAsMap)
            });
            // this.props.onSelectionChange(selectedInference);
          }}
          onValueMouseOut={() => {
            if (!clicked) {
              this.setState({
                pathValue: false,
                finalValue: false,
                data: updateData(this.decoratedData, false)
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
          //   getSize={d => d.value}
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