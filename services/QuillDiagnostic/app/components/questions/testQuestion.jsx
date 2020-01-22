import React, { Component } from 'react';
import { connect } from 'react-redux';
import PlayLessonQuestion from '../diagnostics/sentenceCombining';
import { clearData, loadData, nextQuestion, submitResponse, updateName, updateCurrentQuestion, resumePreviousSession } from '../../actions.js';

class TestQuestion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      responsesForGrading: [],
      allResponses: [],
      key: 0,
    };
  }

  componentDidMount() {
    this.reset();
  }

  reset = () => {
    const { dispatch, } = this.props
    dispatch(clearData());
    this.startActivity();
    this.setState(prevState => ({ key: prevState.key + 1, }));
  }

  questionsForLesson = () => {
    const { params, } = this.props
    const question = this.getQuestion();
    question.key = params.questionID;
    return [
      {
        type: 'SC',
        question,
      }
    ];
  }

  startActivity = () => {
    const { dispatch, } = this.props
    const action = loadData(this.questionsForLesson());
    dispatch(action);
    const next = nextQuestion();
    dispatch(next);
  }

  getQuestion = () => {
    const { questions, params, } = this.props
    return questions.data[params.questionID];
  }

  render() {
    const { playLesson, dispatch, } = this.props
    const { key, } = this.state

    if (playLesson.currentQuestion) {
      const { question, } = playLesson.currentQuestion;
      return (
        <div className="test-question-container">
          <PlayLessonQuestion dispatch={dispatch} key={key} nextQuestion={this.reset} prefill={false} question={question} />
        </div>
      );
    } else {
      return (
        <p>Loading...</p>
      );
    }
  }

}

function select(props) {
  return {
    questions: props.questions,
    playLesson: props.playLesson,
  };
}

export default connect(select)(TestQuestion);
