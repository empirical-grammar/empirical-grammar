import React, { Component } from 'react';
import _ from 'underscore';
import ConceptSelector from '../shared/conceptSelector.jsx';
import { ConceptExplanation } from 'quill-component-library/dist/componentLibrary';

class ChooseModelContainer extends Component {
  constructor() {
    super();
    this.selectConcept = this.selectConcept.bind(this);
    this.removeModelConcept = this.removeModelConcept.bind(this);
  }

  removeModelConcept() {
    this.props.updateModelConcept(null)
  }

  selectConcept(e) {
    this.props.updateModelConcept(e.value)
  }

  renderButtons() {
    return (
      <p className="control">
        <button
          className="button is-outlined is-danger"
          onClick={this.removeModelConcept}
          style={{marginLeft: 5}}
        >
          Remove
        </button>
      </p>
    )
  }

  render() {
    return (
      <div className="box">
        <h4 className="title">Choose Model</h4>
        <div className="control">
          <ConceptSelector currentConceptUID={this.props.modelConceptUID} handleSelectorChange={this.selectConcept} onlyShowConceptsWithConceptFeedback />
          <ConceptExplanation {...this.props.conceptsFeedback.data[this.props.modelConceptUID]} />
          {this.props.children}
        </div>
        {this.renderButtons()}
      </div>
    )
  }

}

export default ChooseModelContainer;
