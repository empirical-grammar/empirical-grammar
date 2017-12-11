import React from 'react';
import { connect } from 'react-redux';
import TextEditor from '../renderForQuestions/renderTextEditor.jsx';
import _ from 'underscore';
import ReactTransition from 'react-addons-css-transition-group';
import POSMatcher from '../../libs/sentenceFragmentML.js';
import { hashToCollection } from '../../libs/hashToCollection.js';
import {
  submitResponse,
  incrementResponseCount,
  getResponsesWithCallback,
  getGradedResponsesWithCallback
} from '../../actions/responses';
import updateResponseResource from '../renderForQuestions/updateResponseResource.js';
import ConceptExplanation from '../feedback/conceptExplanation.jsx';
import icon from '../../img/question_icon.svg';

const PlaySentenceFragment = React.createClass({
  getInitialState() {
    return {
      response: this.props.question.prompt,
      checkAnswerEnabled: true,
      editing: false,
    };
  },

  componentDidMount() {
    getGradedResponsesWithCallback(
      this.props.question.key,
      (data) => {
        this.setState({ responses: data, });
      }
    );
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.question !== nextProps.question) {
      return true;
    } else if (this.state.response !== nextState.response) {
      return true;
    } else if (this.state.responses !== nextState.responses) {
      return true;
    }
    return false;
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.question.attempts.length !== this.props.question.attempts.length) {
      this.setState({editing: false})
    }
  },

  showNextQuestionButton() {
    const { question, } = this.props;
    const latestAttempt = this.getLatestAttempt();
    const readyForNext =
      question.attempts.length > 4 || (latestAttempt && latestAttempt.response.optimal);
    if (readyForNext) {
      return true;
    } else {
      return false;
    }
  },

  getLatestAttempt() {
    return _.last(this.props.question.attempts || []);
  },

  getQuestion() {
    return this.props.question;
  },

  getResponses() {
    return this.state.responses;
    // return this.props.responses.data[this.props.question.key];
  },

  checkChoice(choice) {
    const questionType = this.props.question.isFragment ? 'Fragment' : 'Sentence';
    this.props.markIdentify(choice === questionType);
  },

  renderSentenceOrFragmentButtons() {
    return (
      <div className="sf-button-group">
        <button className="button sf-button" value="Sentence" onClick={() => { this.checkChoice('Sentence'); }}>Complete Sentence</button>
        <button className="button sf-button" value="Fragment" onClick={() => { this.checkChoice('Fragment'); }}>Incomplete Sentence</button>
      </div>
    );
  },

  choosingSentenceOrFragment() {
    const { question, } = this.props;
    return question.identified === undefined && (question.needsIdentification === undefined || question.needsIdentification === true);
    // the case for question.needsIdentification===undefined is for sentenceFragments that were created before the needsIdentification field was put in
  },

  handleChange(e) {
    this.setState({ 
      response: e,
      editing: true,
    });
  },

  checkAnswer() {
    if (this.state.checkAnswerEnabled && this.state.responses) {
      const key = this.props.currentKey;
      const { attempts, } = this.props.question;
      this.setState({ checkAnswerEnabled: false, }, () => {
        const { prompt, wordCountChange, ignoreCaseAndPunc, incorrectSequences } = this.getQuestion();
        const fields = {
          prompt,
          responses: hashToCollection(this.getResponses()),
          questionUID: key,
          wordCountChange,
          ignoreCaseAndPunc,
          incorrectSequences,
        };
        const responseMatcher = new POSMatcher(fields);
        const matched = responseMatcher.checkMatch(this.state.response, {
          updateResRes: updateResponseResource,
          key,
          attempts,
          dispatch: this.props.dispatch.bind(this),
          setState: this.setState.bind(this),
          handleAttemptSubmission: this.props.handleAttemptSubmission,
          updateAttempts: this.props.updateAttempts
        });
        console.log(typeof(matched), typeof(matched) === 'object')
        if (typeof(matched) === 'object') {
          updateResponseResource(matched, key, attempts, this.props.dispatch, );
          this.props.updateAttempts(matched);
          this.setState({ checkAnswerEnabled: true, });
          this.props.handleAttemptSubmission();
        }
      });
    }
  },

  getNegativeConceptResultsForResponse(conceptResults) {
    return _.reject(hashToCollection(conceptResults), cr => cr.correct);
  },

  getNegativeConceptResultForResponse(conceptResults) {
    const negCRs = this.getNegativeConceptResultsForResponse(conceptResults);
    return negCRs.length > 0 ? negCRs[0] : undefined;
  },

  renderConceptExplanation() {
    if (!this.showNextQuestionButton()) {
      const latestAttempt = getLatestAttempt(this.props.question.attempts);
      if (latestAttempt) {
        if (latestAttempt.found && !latestAttempt.response.optimal && latestAttempt.response.conceptResults) {
          const conceptID = this.getNegativeConceptResultForResponse(latestAttempt.response.conceptResults);
          if (conceptID) {
            const data = this.props.conceptsFeedback.data[conceptID.conceptUID];
            if (data) {
              return <ConceptExplanation {...data} />;
            }
          }
        } else if (this.getQuestion() && this.getQuestion().modelConceptUID) {
          const dataF = this.props.conceptsFeedback.data[this.getQuestion().modelConceptUID];
          if (dataF) {
            return <ConceptExplanation {...dataF} />;
          }
        } else if (this.getQuestion().conceptID) {
          const data = this.props.conceptsFeedback.data[this.getQuestion().conceptID];
          if (data) {
            return <ConceptExplanation {...data} />;
          }
        }
      }
    }
  },

  renderSentenceOrFragmentMode() {
    return (
      <div className="container">
        <div className="feedback-row">
          <img className="info" src={icon} />
          <p>Is this a complete or an incomplete sentence?</p>
        </div>
        {this.renderSentenceOrFragmentButtons()}
      </div>
    );
  },

  renderButton() {
    if (this.showNextQuestionButton()) {
      return (
        <button className="button student-submit" onClick={this.props.nextQuestion}>Next</button>
      );
    } else if (this.state.responses) {
      if (this.props.question.attempts.length > 0) {
        const buttonClass = this.state.editing ? "button student-recheck" : "button student-recheck is-disabled";
        return <button className={buttonClass} onClick={this.checkAnswer}>Recheck Your Answer</button>;
      } else {
        return <button className="button student-submit" onClick={this.checkAnswer}>Submit</button>;
      }
    } else {
      <button className="button student-submit is-disabled" onClick={() => {}}>Submit</button>;
    }
  },

  renderPlaySentenceFragmentMode() {
    const fragment = this.props.question;
    const button = this.renderButton();
    let instructions;
    const latestAttempt = this.getLatestAttempt();
    if (latestAttempt) {
      const component = <span dangerouslySetInnerHTML={{__html: latestAttempt.response.feedback}}/>
      instructions = latestAttempt.response.feedback ? component :
      'Revise your work. A complete sentence must have an action word and a person or thing doing the action.';
    } else if (fragment.instructions && fragment.instructions !== '') {
      instructions = this.props.question.instructions;
    } else {
      instructions = 'If it is a complete sentence, press submit. If it is an incomplete sentence, make it complete.';
    }
    // dangerously set some html in here
    return (
      <div className="container">
        <div className="feedback-row">
          <img className="info" src={icon} />
          <p>{instructions}</p>
        </div>
        <TextEditor
          value={this.state.response}
          handleChange={this.handleChange}
          disabled={this.showNextQuestionButton()}
          checkAnswer={this.checkAnswer}
          placeholder="Type your answer here. Remember, your answer should be just one sentence."
        />
        <div className="question-button-group">
          {this.renderButton()}
        </div>
        {this.renderConceptExplanation()}
      </div>
    );
  },

  renderInteractiveComponent() {
    if (this.choosingSentenceOrFragment()) {
      return this.renderSentenceOrFragmentMode();
    } else {
      return this.renderPlaySentenceFragmentMode();
    }
  },

  render() {
    if (this.props.question) {
      return (
        <div className="student-container-inner-diagnostic">
          <div className="draft-js sentence-fragments prevent-selection">
            <p>{this.getQuestion().prompt}</p>
          </div>
          {this.renderInteractiveComponent()}
        </div>
      );
    } else {
      return (<div className="container">Loading...</div>);
    }
  },
});

const getLatestAttempt = function (attempts = []) {
  const lastIndex = attempts.length - 1;
  return attempts[lastIndex];
};

function select(state) {
  return {
    conceptsFeedback: state.conceptsFeedback,
  };
}

export default connect(select)(PlaySentenceFragment);
