import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  QuestionList,
  hashToCollection,
  ArchivedButton
} from 'quill-component-library/dist/componentLibrary';

class FillInBlankQuestions extends Component {
  constructor() {
    super();
    this.state = {
      showOnlyArchived: false,
      questions: {}
    }
    this.toggleShowArchived = this.toggleShowArchived.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { fillInBlank, } = nextProps
    if (fillInBlank.hasreceiveddata) {
      if (Object.keys(this.state.questions).length === 0 || !_.isEqual(this.props.fillInBlank.data, fillInBlank.data) || (!_.isEqual(this.props.diagnosticLessons.data, diagnosticLessons.data))) {
        this.setState({ questions: fillInBlank.data, })
      }
    }
  }

  toggleShowArchived() {
    this.setState({
      showOnlyArchived: !this.state.showOnlyArchived,
    });
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <Link to={'admin/fill-in-the-blanks/new'}>
            <button className="button is-primary">Create a New Fill In The Blank</button>
          </Link>
          <ArchivedButton lessons={false} showOnlyArchived={this.state.showOnlyArchived} toggleShowArchived={this.toggleShowArchived} />
          <p className="menu-label">Fill In The Blank</p>
          <QuestionList
            basePath="fill-in-the-blanks"
            questions={hashToCollection(this.state.questions) || []}
            showOnlyArchived={this.state.showOnlyArchived}
          />
        </div>
      </section>
    );
  }

}

function select(props) {
  return {
    fillInBlank: props.fillInBlank
  };
}

export default connect(select)(FillInBlankQuestions);
