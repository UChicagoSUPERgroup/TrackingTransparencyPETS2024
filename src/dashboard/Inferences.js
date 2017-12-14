import React from 'react';
import { Route, Link } from 'react-router-dom';

import {Sunburst} from 'react-vis';

import ttDashboard from './dashboardHelpers';

import InferencesSunburst from './InferencesSunburst';

const InferencesListItem = (inference) => {
  const inferenceName = inference.inference;
  return (
    <div key={inferenceName}>
      <Link to={{
        pathname: '/inferences/' + inferenceName
      }}>
        {inferenceName}
      </Link>
    </div>
  );
}

class InferencesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inferences: null
    }
  }

  async getInferences() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getInferences", {count: 100});
    this.setState({
      inferences: inferences 
    });
  }

  async componentDidMount() {
    this.getInferences();
  }
  
  render() {

    return(
      <div>
        <h1>Inferences</h1>

        <Route path={`${this.props.match.url}/:name`}  component={InferenceDetails}/>
        <Route exact path={this.props.match.url} render={() => (
          <div>
            <InferencesSunburst/>
            {/* {this.state.inferences && <InferencesSunburst inferencesList={this.state.inferences}/>} */}
            {/* <InferencesSunburst inferencesList={this.state.inferences}/> */}
            {/* {this.state.inferences.map(inference => InferencesListItem(inference))} */}
          </div>
        )}/>


      </div>
    );
  }
}

class InferenceDetails extends React.Component {
  constructor(props) {
    super(props);

    this.inference = this.props.match.params.name;
    this.state = {
      inferences: []
    }
  }

  async componentDidMount() {
    // const background = await browser.runtime.getBackgroundPage();
    // const inferences = await background.queryDatabase("getInferencesByInference", {inference: this.inference, count: 100});
    // this.setState({
    //   inferences: inferences
    // })
  }

  render() {
    return (
      <div>
        <h2>{this.inference}</h2>
        {/* <pre>{JSON.stringify(this.state.inferences, null, '\t')}</pre> */}
      </div>
    );
  }
}

// class InferencesSunburst extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       sunburstData: {}
//     }
//   }


//   constructSunburstData(inferencesList) {
//     if (inferencesList.length === 0) {
//       // haven't received props
//       return;
//     }

//     let sunburstData = categoryTree;

//     this.recursiveApplySizes(sunburstData.children, inferencesList);
//     ttDashboard.log(sunburstData);

//     this.setState({
//       sunburstData: sunburstData
//     });
//   }

//   recursiveApplySizes(items, inferencesList) {
//     for (let item of items) {
//       if (!item.children) {
//         // no children, lookup size
//         const listItem = inferencesList.find(x => x.inference === item.title);
//         if (listItem) {
//           item.size = listItem["COUNT(inference)"];
//         } else {
//           item.size = 0;
//         }
//       } else {
//         this.recursiveApplySizes(item.children, inferencesList)
//       }
//     }
//   }

//   async componentDidMount() {
//     this.constructSunburstData(this.props.inferencesList);
//   }

//   componentWillReceiveProps(nextProps) {
//     this.constructSunburstData(nextProps.inferencesList)
//   }

//   render() {
//     return (
//       <Sunburst
//         hideRootNode
//         data={this.state.sunburstData}
//         colorType="literal"
//         height={500}
//         width={500}>
//         {/* <Hint value={hoveredValue} /> */}
//       </Sunburst>
//     );
//   }
// }

export default InferencesList;