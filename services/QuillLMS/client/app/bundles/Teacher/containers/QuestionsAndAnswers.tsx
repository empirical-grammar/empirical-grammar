import * as React from 'react'
import VisibilitySensor from 'react-visibility-sensor'

import QuestionAndAnswer from '../components/shared/QuestionAndAnswer.jsx'
import lessons from '../components/modules/questionsAndAnswers/lessons'
import admin from '../components/modules/questionsAndAnswers/admin'
import premium from '../components/modules/questionsAndAnswers/premium'
import preap from '../components/modules/questionsAndAnswers/preap'
import ap from '../components/modules/questionsAndAnswers/ap'
import springboard from '../components/modules/questionsAndAnswers/springboard'

export interface QuestionsAndAnswersProps {
  questionsAndAnswersFile: string;
  supportLink: string;
  handleChange?: Function;
}

interface QuestionsAndAnswersState {
  questionsAndAnswers: object[]
}

export default class QuestionsAndAnswers extends React.Component<QuestionsAndAnswersProps, QuestionsAndAnswersState> {
  constructor(props: QuestionsAndAnswersProps) {
    super(props)

    let questionsAndAnswers;
    switch (props.questionsAndAnswersFile) {
      case 'admin':
        questionsAndAnswers = admin
        break
      case 'lessons':
        questionsAndAnswers = lessons
        break
      case 'premium':
        questionsAndAnswers = premium
        break
      case 'preap':
        questionsAndAnswers = preap
        break
      case 'ap':
        questionsAndAnswers = ap
        break
      case 'springboard':
        questionsAndAnswers = springboard
        break
      default:
        questionsAndAnswers = []
        break
    }

    this.state = {
      questionsAndAnswers: questionsAndAnswers()
    }
  }

  renderQuestionsAndAnswers() {
    const { questionsAndAnswersFile } = this.props;
    const { questionsAndAnswers } = this.state;
    return questionsAndAnswers.map((qa, i) => <QuestionAndAnswer key={i} qa={qa} questionsAndAnswersFile={questionsAndAnswersFile} />)
  }

  render() {
    const { supportLink, handleChange } = this.props;
    const style = `support-link ${!supportLink ? 'hidden' : ''}`;
    return(
      <div id="q-and-a">
        <div className="q-and-a-inner-wrapper">
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <VisibilitySensor onChange={(isVisible) => handleChange(isVisible, 'Questions and Answers')}>
            <h1>Questions and Answers</h1>
          </VisibilitySensor>
          {this.renderQuestionsAndAnswers()}
          <a className={style} href={supportLink}>View all questions and answers</a>
        </div>
      </div>
    )
  }

}
