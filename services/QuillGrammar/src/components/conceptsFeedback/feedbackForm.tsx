import * as React from 'react'
import * as actions from '../../actions/conceptsFeedback'
import { connect } from 'react-redux'
import { ConceptExplanation } from 'quill-component-library/dist/componentLibrary'
import TextEditor from '../shared/textEditor'
import { EditorState, ContentState } from 'draft-js'

export default class FeedbackForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      description: this.props.description,
      leftBox: this.props.leftBox,
      rightBox: this.props.rightBox,
      editing: "title"
    }

    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
    this.cancel = this.cancel.bind(this)
    this.setEditor = this.setEditor.bind(this)
    this.renderEditor = this.renderEditor.bind(this)
  }

  handleChange(key, e) {
    const newState = {}
    newState[key] = e;
    this.setState(newState)
  }

  submit(e){
    const {
      description,
      leftBox,
      rightBox
    } = this.state
    const data = {
      description,
      leftBox,
      rightBox
    }
    this.props.submitNewFeedback(this.props.feedbackID, data)
  }

  cancel() {
    this.props.cancelEdit(this.props.feedbackID)
  }

  setEditor(part) {
    this.setState({editing: part})
  }

  renderEditor() {
    const parts = ["description", "leftBox", "rightBox"];
    return parts.map((part) => {
      if (part === this.state.editing) {
        return [
          (<label className="label">{part}</label>),
          (<TextEditor
            text={this.state[part]}
            handleTextChange={this.handleChange.bind(null, part)}
            key={part}
            ContentState={ContentState}
            EditorState={EditorState}
          />)
        ]
      } else {
        return [
          (<label className="label">{part}</label>),
          (<div>{this.state[part]}</div>),
          (<a onClick={this.setEditor.bind(null, part)}>Edit</a>)
        ]
      }

    })
  }

  render() {
    return (
      <div>
        <form className="box" onSubmit={this.submit}>
          {this.renderEditor()}
          <br />
          <button type="submit" className="button is-primary">Submit</button>
          <button className="button is-danger" onClick={this.cancel}>Cancel</button>
        </form>
        <ConceptExplanation {...this.state}/>
      </div>

    )
  }

}
