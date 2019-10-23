import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'underscore';
import C from '../../constants';
import ConceptSelectorWithCheckbox from './conceptSelectorWithCheckbox.jsx';
import { TextEditor } from 'quill-component-library/dist/componentLibrary';
import { EditorState, ContentState } from 'draft-js'

export default React.createClass({

  propTypes: {
    item: React.PropTypes.obj,
    onSubmit: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    const item = this.props.item;
    return ({
      itemText: item ? `${item.text}|||` : '',
      itemFeedback: item ? item.feedback : '',
      itemConcepts: item ? (item.conceptResults ? item.conceptResults : {}) : {},
    });
  },

  addOrEditItemLabel() {
    return this.props.item ? `Edit ${this.props.itemLabel}` : `Add New ${this.props.itemLabel}`;
  },

  handleChange(stateKey, e) {
    const obj = {};
    let value = e.target.value;
    if (stateKey == 'itemText') {
      value = `${Array.from(document.getElementsByClassName('focus-point-text')).map(i => i.value).filter(val => val !== '').join('|||')}|||`;
    }
    obj[stateKey] = value;
    this.setState(obj);
  },

  handleConceptChange(e) {
    const concepts = this.state.itemConcepts;
    if (!concepts.hasOwnProperty(e.value)) {
      concepts[e.value] = { correct: true, name: e.label, conceptUID: e.value, };
      this.setState({
        itemConcepts: concepts,
      });
    }
  },

  handleFeedbackChange(e) {
    this.setState({itemFeedback: e})
  },

  submit(focusPoint) {
    const data = {
      text: this.state.itemText.split('|||').filter(val => val !== '').join('|||'),
      feedback: this.state.itemFeedback,
      conceptResults: this.state.itemConcepts,
    };
    this.props.onSubmit(data, focusPoint);
  },

  renderTextInputFields() {
    return this.state.itemText.split('|||').map(text => (
      <input className="input focus-point-text" onChange={this.handleChange.bind(null, 'itemText')} style={{ marginBottom: 5, }} type="text" value={text || ''} />
    ));
  },

  renderConceptSelectorFields() {
    const components = _.mapObject(Object.assign({}, this.state.itemConcepts, { null: { correct: false, text: 'This is a placeholder', }, }), (val, key) => (
      <ConceptSelectorWithCheckbox
        checked={val.correct}
        currentConceptUID={key}
        deleteConceptResult={() => this.deleteConceptResult(key)}
        handleSelectorChange={this.handleConceptChange}
        onCheckboxChange={() => this.toggleCheckboxCorrect(key)}
        selectorDisabled={key === 'null' ? false : true}
      />
    ));
    return _.values(components);
  },

  deleteConceptResult(key) {
    const newConceptResults = Object.assign({}, this.state.itemConcepts)
    delete newConceptResults[key]
    this.setState({itemConcepts: newConceptResults})
  },

  toggleCheckboxCorrect(key) {
    const data = this.state;
    data.itemConcepts[key].correct = !data.itemConcepts[key].correct;
    this.setState(data);
  },

  render() {
    return (
      <div className="box">
        <h4 className="title">{this.addOrEditItemLabel()}</h4>
        <div className="control">
          <label className="label">{this.props.itemLabel} Text</label>
          {this.renderTextInputFields()}
          <label className="label" style={{ marginTop: 10, }}>Feedback</label>
          <TextEditor
            ContentState={ContentState}
            EditorState={EditorState}
            handleTextChange={this.handleFeedbackChange}
            key={"feedback"}
            text={this.state.itemFeedback || ""}
          />
          <label className="label" style={{ marginTop: 10, }}>Concepts</label>
          {this.renderConceptSelectorFields()}
        </div>
        <p className="control">
          <button className={'button is-primary '} onClick={() => this.submit(this.props.item ? this.props.item.id : null)}>Submit</button>
          <button className={'button is-outlined is-info'} onClick={() => window.history.back()} style={{ marginLeft: 5, }}>Cancel</button>
        </p>
      </div>
    );
  },

});
