import React from 'react';
import ReactDOM from 'react-dom'
import _ from 'underscore';
import icon from '../../img/question_icon.svg';
import revise from '../../img/revise_orange_icon.svg';
import multiple from '../../img/multiple_choice_icon.svg';
import success  from '../../img/check-mark.svg';
import getAnswerState from './answerState';
import {Response} from 'quill-marking-logic';
import StatelessFeedback from './components/feedback';

class Feedback extends React.Component<any, any> {
  constructor(props){
    super(props)
  }

  getFeedbackType(data?): string {
    if (data) {
      const latestAttempt = getLatestAttempt(data.question.attempts);
      if (latestAttempt) {
        if (data.override) {
          return "override"
        } else if (latestAttempt.response.feedback !== undefined) {
          const state = getAnswerState(latestAttempt);
          console.log("state: ", state, latestAttempt);
          return state ? 'correct-matched' : 'revise-matched'
        } else {
          return "revise-unmatched"
        }
      } else {
        if(!!data.question.instructions) {
          return "instructions"
        }
        else if(data.getQuestion && data.getQuestion().instructions!=="") {
          return "getQuestion-instructions"
        }
        else if (data.getQuestion && data.getQuestion().cues && data.getQuestion().cues.length > 0 && data.getQuestion().cues[0] !== "") {
          return "default-with-cues"
        } else {
          return "default"
        }
      }
    }
    return "default"
  }

  getFeedbackCopy(data): string {
    const latestAttempt = getLatestAttempt(data.question.attempts);
    let returnVal;
    switch (this.getFeedbackType(data)) {
      case "revise-unmatched":
        returnVal = (<p>{data.sentence}</p>);
        break;
      case "revise-matched":
      case "correct-matched":
        returnVal = data.renderFeedbackStatements(latestAttempt);
        break;
      case "override":
        returnVal = (<p>{data.sentence}</p>);
        break;
      case "instructions":
        returnVal = (<p>{data.question.instructions}</p>);
        break;
      case "getQuestion-instructions":
        returnVal = (<p>{data.getQuestion().instructions}</p>);
        break;
      case "default-with-cues":
        returnVal = (<p>Combine the sentences using {data.listCuesAsString(data.getQuestion().cues)}</p>);
        break;
      case "default":
        returnVal = (<p>Combine the sentences into one sentence.</p>)
        break;
      default:
        returnVal = (<p>Combine the sentences into one sentence.</p>)
    }
    return returnVal
  }

  render() {
    const key:number = this.props ? this.props.question.attempts.length : 0;
    return (
      <StatelessFeedback
        key={key}
        feedbackType={this.getFeedbackType(this.props)}
        feedback={this.getFeedbackCopy(this.props)}
      />
    )
  }
}

export default Feedback;

const getLatestAttempt = function (attempts: Array<any> = []): any {
  const lastIndex = attempts.length - 1;
  return attempts[lastIndex]
}
