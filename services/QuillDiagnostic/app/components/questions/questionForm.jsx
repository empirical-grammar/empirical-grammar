import React from 'react'
import {
  TextEditor,
  hashToCollection,
  FlagDropdown
} from 'quill-component-library/dist/componentLibrary';
import { EditorState, ContentState } from 'draft-js'
import _ from 'lodash'
import ConceptSelector from '../shared/conceptSelector.jsx'

export default React.createClass({
  getInitialState: function () {
    return {
      prompt: "",
      concept: this.props.question.conceptID,
      instructions: this.props.question.instructions ? this.props.question.instructions : "",
      flag: this.props.question.flag ? this.props.question.flag : "alpha",
      cuesLabel: this.props.question.cuesLabel ? this.props.question.cuesLabel : ''
    }
  },

  submit: function () {
    const questionObj = {
      conceptUID: this.props.question.conceptUID,
      cuesLabel: this.props.question.cuesLabel,
      focusPoints: this.props.question.focusPoints,
      incorrectSequences: this.props.question.incorrectSequences,
      modelConceptUID: this.props.question.modelConceptUID,
      prompt: this.state.prompt,
      cues: this.refs.cues.value.split(','),
      instructions: this.state.instructions,
      flag: this.state.flag,
      cuesLabel: this.state.cuesLabel
    }
    if (this.props.new) {
      const optimalResponseObj = {text: this.refs.newQuestionOptimalResponse.value.trim(), optimal: true, count: 0, feedback: "That's a strong sentence!"}
      this.props.submit(questionObj, optimalResponseObj)
    } else {
      questionObj.conceptID = this.state.concept
      this.props.submit(questionObj)
    }
  },

  handlePromptChange: function (e) {
    this.setState({prompt: e})
  },

  handleInstructionsChange: function(e) {
    this.setState({instructions: e.target.value})
  },

  renderConceptSelector: function() {
    if (!this.props.new) {
      return (<div>
        <label className="label">Concept</label>
        <div>
          <ConceptSelector
            currentConceptUID={this.state.concept}
            handleSelectorChange={this.handleSelectorChange}
          />
        </div>
      </div>)
    }
  },

  renderOptimalResponse: function() {
    if (this.props.new) {
      return (<div>
        <label className="label">Optimal Response</label>
        <p className="control">
          <input className="input" ref="newQuestionOptimalResponse" type="text" />
        </p>
      </div>)
    }
  },

  handleSelectorChange: function(e) {
    this.setState({concept: e.value})
  },

  handleConceptChange: function() {
    this.setState({concept: this.refs.concept.value})
  },

  handleFlagChange: function(e) {
    this.setState({ flag: e.target.value, });
  },

  handleCuesLabelChange: function(e) {
    this.setState({ cuesLabel: e.target.value, });
  },

  render: function () {
    if(this.props.new || this.props.concepts.hasreceiveddata) {
      return (
        <div className="box">
          <h6 className="control subtitle">Create a new question</h6>
          <label className="label">Prompt</label>
          <TextEditor
            ContentState={ContentState}
            EditorState={EditorState}
            handleTextChange={this.handlePromptChange}
            text={this.props.question.prompt || ""}
          />
          <label className="label">Instructions for student</label>
          <p className="control">
            <textarea className="input" defaultValue={this.props.question.instructions} onChange={this.handleInstructionsChange} ref="instructions" type="text" />
          </p>
          <label className="label">Cues Label (default is "joining words"/"joining word" for single cues, enter a space to have no label)</label>
          <p className="control">
            <input className="input" defaultValue={this.props.question.cuesLabel} onChange={this.handleCuesLabelChange} type="text" />
          </p>
          <label className="label">Cues (separated by commas, no spaces eg "however,therefore,hence")</label>
          <p className="control">
            <input className="input" defaultValue={this.props.question.cues} ref="cues" type="text" />
          </p>
          {this.renderOptimalResponse()}

          <FlagDropdown flag={this.state.flag} handleFlagChange={this.handleFlagChange} isLessons={false} />
          {this.renderConceptSelector()}
          <br />
          <button className="button is-primary" onClick={this.submit}>Update Question</button>
        </div>
      )
    } else {
      return (<div>Loading...</div>)
    }
  }
})
