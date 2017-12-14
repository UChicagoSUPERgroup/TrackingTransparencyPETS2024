import React from 'react';

class InferenceDetails extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.match && this.props.match.params.name) {
        // loaded via URL
        this.inference = this.props.match.params.name;
    } else if (this.props.inference) {
        // loaded as in page component
        this.inference = this.props.inference;
    }
    this.state = {
      inferences: []
    }
  }

  async componentDidMount() {
    const background = await browser.runtime.getBackgroundPage();
    const inferences = await background.queryDatabase("getTrackersByInference", {inference: this.inference, count: 100});
    this.setState({
      inferences: inferences
    })
  }

  render() {
    if (!this.inference) {
        return (<div>Category does not exist</div>);
    }
    return (
      <div>
        <h2>{this.inference}</h2>
        <pre>{JSON.stringify(this.state.inferences, null, '\t')}</pre>
      </div>
    );
  }
}

export default InferenceDetails;