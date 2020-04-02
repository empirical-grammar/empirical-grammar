import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  hashToCollection,
  ArchivedButton
} from 'quill-component-library/dist/componentLibrary';
import { QuestionList } from '../shared/questionList.tsx'

class FillInBlankQuestions extends Component {
  constructor(props) {
    super(props)

    const { fillInBlank } = props

    this.state = {
      diagnosticQuestions: fillInBlank.data ? fillInBlank.data : null
    }
  }
  
  componentDidMount() {
    const { fillInBlank } = this.props
    const { data } = fillInBlank
    this.setState({ diagnosticQuestions: data })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { fillInBlank, lessons } = nextProps
    const { diagnosticQuestions } = this.state;
    if (fillInBlank.hasreceiveddata && lessons.hasreceiveddata) {
      if (Object.keys(diagnosticQuestions).length === 0 || !_.isEqual(this.props.fillInBlank.data, fillInBlank.data) || (!_.isEqual(this.props.lessons.data, lessons.data))) {
        this.setState({ diagnosticQuestions: fillInBlank.data })
      }
    }
  }

  toggleShowArchived = () => {
    const { showOnlyArchived } = this.state;
    this.setState({
      showOnlyArchived: !showOnlyArchived,
    });
  };

  render() {
    const { diagnosticQuestions, showOnlyArchived } = this.state;
    return (
      <section className="section">
        <div className="admin-container">
          <Link to={'/admin/fill-in-the-blanks/new'}>
            <button className="button is-primary">Create a New Fill In The Blank</button>
          </Link>
          <ArchivedButton lessons={false} showOnlyArchived={showOnlyArchived} toggleShowArchived={this.toggleShowArchived} />
          <p className="menu-label">Fill In The Blank</p>
          <QuestionList
            basePath="fill-in-the-blanks"
            questions={hashToCollection(diagnosticQuestions) || []}
            showOnlyArchived={showOnlyArchived}
          />
        </div>
      </section>
    );
  }
}

function select(props) {
  return {
    fillInBlank: props.fillInBlank,
    lessons: props.lessons,
    connectFillInBlankQuestions: props.connectFillInBlankQuestions

  };
}

export default connect(select)(FillInBlankQuestions);
