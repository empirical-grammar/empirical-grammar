import React from 'react';
import { connect } from 'react-redux';
import {
  CarouselAnimation,
  hashToCollection,
  SmartSpinner,
  ProgressBar
} from 'quill-component-library/dist/componentLibrary';

import {
  clearData,
  loadData,
  nextQuestion,
  nextQuestionWithoutSaving,
  submitResponse,
  updateName,
  updateCurrentQuestion,
  resumePreviousDiagnosticSession,
  updateLanguage
} from '../../actions/diagnostics.js';
import _ from 'underscore';
import SessionActions from '../../actions/sessions.js';
import PlaySentenceFragment from './sentenceFragment.jsx';
import PlayDiagnosticQuestion from './sentenceCombining.jsx';
import PlayFillInTheBlankQuestion from '../fillInBlank/playFillInTheBlankQuestion'
import LandingPage from './landing.jsx';
import LanguagePage from './languagePage.jsx';
import PlayTitleCard from './titleCard.tsx'
import FinishedDiagnostic from './finishedDiagnostic.jsx';
import Footer from './footer'
import { getConceptResultsForAllQuestions } from '../../libs/conceptResults/diagnostic';
import {
  questionCount,
  answeredQuestionCount,
  getProgressPercent
} from '../../libs/calculateProgress'
import { getParameterByName } from '../../libs/getParameterByName';

const request = require('request');

class ELLStudentDiagnostic extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      saved: false,
      sessionID: this.getSessionId(),
      hasOrIsGettingResponses: false,
    }
  }

  componentWillMount() {
    const { dispatch, } = this.props
    const { sessionID, } = this.state
    dispatch(clearData());
    if (sessionID) {
      SessionActions.get(sessionID, (data) => {
        this.setState({ session: data, });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { playDiagnostic, } = this.props
    if (nextProps.playDiagnostic.answeredQuestions.length !== playDiagnostic.answeredQuestions.length) {
      this.saveSessionData(nextProps.playDiagnostic);
    }
  }

  getPreviousSessionData = () => {
    const { session, } = this.state
    return session;
  }

  resumeSession = (data) => {
    const { dispatch, } = this.props
    if (data) {
      dispatch(resumePreviousDiagnosticSession(data));
    }
  }

  getSessionId = () => {
    let sessionID = getParameterByName('student');
    if (sessionID === 'null') {
      sessionID = undefined;
    }
    return sessionID;
  }

  saveSessionData = (lessonData) => {
    const { sessionID, } = this.state

    if (sessionID) {
      SessionActions.update(sessionID, lessonData);
    }
  }

  hasQuestionsInQuestionSet = (props) => {
    const pL = props.playDiagnostic;
    return (pL && pL.questionSet && pL.questionSet.length);
  }

  saveToLMS = () => {
    const { playDiagnostic, } = this.props

    const { sessionID, } = this.state

    this.setState({ error: false, });
    const results = getConceptResultsForAllQuestions(playDiagnostic.answeredQuestions);

    if (sessionID) {
      this.finishActivitySession(sessionID, results, 1);
    } else {
      this.createAnonActivitySession('ell', results, 1);
    }
  }

  finishActivitySession = (sessionID, results, score) => {
    request(
      { url: `${process.env.EMPIRICAL_BASE_URL}/api/v1/activity_sessions/${sessionID}`,
        method: 'PUT',
        json:
        {
          state: 'finished',
          concept_results: results,
          percentage: score,
        },
      }, (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          SessionActions.delete(sessionID);
          document.location.href = process.env.EMPIRICAL_BASE_URL
          this.setState({ saved: true, });
        } else {
          this.setState({
            saved: false,
            error: body.meta.message,
          });
        }
      }
    );
  }

  createAnonActivitySession = (lessonID, results, score) => {
    request(
      { url: `${process.env.EMPIRICAL_BASE_URL}/api/v1/activity_sessions/`,
        method: 'POST',
        json:
        {
          state: 'finished',
          activity_uid: 'ell',
          concept_results: results,
          percentage: score,
        },
      }, (err, httpResponse, body) => {
        if (httpResponse && httpResponse.statusCode === 200) {
          // to do, use Sentry to capture error
          document.location.href = `${process.env.EMPIRICAL_BASE_URL}/activity_sessions/${body.activity_session.uid}`;
          this.setState({ saved: true, });
        }
      }
    );
  }

  submitResponse = (response) => {
    const { dispatch, } = this.props

    const action = submitResponse(response);
    dispatch(action);
  }

  renderQuestionComponent = () => {
    const { playDiagnostic, dispatch, } = this.props

    let component
    if (playDiagnostic.currentQuestion.type === 'SC') {
      component = (<PlayDiagnosticQuestion
        dispatch={dispatch}
        key={playDiagnostic.currentQuestion.data.key}
        language={this.language()}
        marking="diagnostic"
        nextQuestion={this.nextQuestion}
        question={playDiagnostic.currentQuestion.data}
      />);
    } else if (playDiagnostic.currentQuestion.type === 'SF') {
      component = (<PlaySentenceFragment
        currentKey={playDiagnostic.currentQuestion.data.key}
        dispatch={dispatch}
        key={playDiagnostic.currentQuestion.data.key}
        language={this.language()}
        markIdentify={this.markIdentify}
        nextQuestion={this.nextQuestion}
        question={playDiagnostic.currentQuestion.data}
        updateAttempts={this.submitResponse}
      />);
    } else if (playDiagnostic.currentQuestion.type === 'TL') {
      component = (
        <PlayTitleCard
          currentKey={playDiagnostic.currentQuestion.data.key}
          data={playDiagnostic.currentQuestion.data}
          dispatch={dispatch}
          handleContinueClick={this.nextQuestionWithoutSaving}
          key={playDiagnostic.currentQuestion.data.key}
          language={this.language()}
        />
      );
    } else if (playDiagnostic.currentQuestion.type === 'FB') {
      component = (
        <PlayFillInTheBlankQuestion
          currentKey={playDiagnostic.currentQuestion.data.key}
          dispatch={dispatch}
          key={playDiagnostic.currentQuestion.data.key}
          language={this.language()}
          nextQuestion={this.nextQuestion}
          question={playDiagnostic.currentQuestion.data}
        />
      );
    }
    return component
  }

  startActivity = () => {
    const { dispatch, } = this.props

    const data = this.getFetchedData()
    const action = loadData(data);
    dispatch(action);
    const next = nextQuestion();
    dispatch(next);
  }

  nextQuestion = () => {
    const { dispatch, } = this.props

    const next = nextQuestion();
    dispatch(next);
  }

  nextQuestionWithoutSaving = () => {
    const { dispatch, } = this.props

    const next = nextQuestionWithoutSaving();
    dispatch(next);
  }

  getLesson = () => {
    const { lessons, } = this.props

    return lessons.data['ell'];
  }

  questionsForLesson = () => {
    const { lessons, params, } = this.props

    const { data, } = lessons,
      { lessonID, } = params;
    if (data[lessonID].questions) {
      return _.values(data[lessonID].questions).map((question) => {
        const questions = this.props[question.questionType].data; // eslint-disable-line react/destructuring-assignment
        const qFromDB = Object.assign({}, questions[question.key]);
        qFromDB.questionType = question.questionType;
        qFromDB.key = question.key;
        return qFromDB;
      });
    }
  }

  markIdentify = (bool) => {
    const { dispatch, } = this.props
    const action = updateCurrentQuestion({ identified: bool, });
    dispatch(action);
  }

  getFetchedData = () => {
    const lesson = this.getLesson()
    if (lesson) {
      const filteredQuestions = lesson.questions.filter((ques) => {
        return this.props[ques.questionType] ? this.props[ques.questionType].data[ques.key] : null  // eslint-disable-line react/destructuring-assignment
      });
      // this is a quickfix for missing questions -- if we leave this in here
      // long term, we should return an array through a forloop to
      // cut the time from 2N to N
      return filteredQuestions.map((questionItem) => {
        const questionType = questionItem.questionType;
        const key = questionItem.key;
        const question = this.props[questionType].data[key]; // eslint-disable-line react/destructuring-assignment
        question.key = key;
        question.attempts = question.attempts ? question.attempts : []
        let type
        switch (questionType) {
          case 'questions':
          type = 'SC'
          break
          case 'fillInBlank':
          type = 'FB'
          break
          case 'titleCards':
          type = 'TL'
          break
          case 'sentenceFragments':
          default:
          type = 'SF'
        }
        return { type, data: question, };
      });
    }
  }

  updateLanguage = (language) => {
    const { dispatch, } = this.props
    dispatch(updateLanguage(language));
  }

  language = () => {
    const { playDiagnostic, } = this.props

    return playDiagnostic.language;
  }

  landingPageHtml = () => {
    const { lessons, } = this.props
    const { data, } = lessons
    return data['ell'].landingPageHtml
  }

  renderFooter = () => {
    if (!this.language()) { return }

    return (<Footer
      language={this.language()}
      updateLanguage={this.updateLanguage}
    />)
  }

  renderProgressBar = () => {
    const { playDiagnostic, } = this.props
    if (!playDiagnostic.currentQuestion || playDiagnostic.currentQuestion.type === 'TL') { return }

    return (<ProgressBar
      answeredQuestionCount={answeredQuestionCount(playDiagnostic)}
      percent={getProgressPercent(playDiagnostic)}
      questionCount={questionCount(playDiagnostic)}
    />)
  }

  render() {
    const { error, saved, } = this.state
    const { questions, sentenceFragments, playDiagnostic, fillInBlank, } = this.props

    let component;
    const minusHowMuch = this.language() ? 'minus-nav-and-footer' : 'minus-nav'
    const data = this.getFetchedData();
    if (!(data && questions.hasreceiveddata && sentenceFragments.hasreceiveddata && fillInBlank.hasreceiveddata)) {
      component = (<SmartSpinner
        key="step1"
        message='Loading Your Lesson 25%'
      />)
    } else if (playDiagnostic.currentQuestion) {
      component = this.renderQuestionComponent();
    } else if (playDiagnostic.answeredQuestions.length > 0 && playDiagnostic.unansweredQuestions.length === 0) {
      component = (<FinishedDiagnostic
        error={error}
        language={this.language()}
        saved={saved}
        saveToLMS={this.saveToLMS}
      />);
    } else if (playDiagnostic.language) {
      component = (<LandingPage
        begin={this.startActivity}
        landingPageHtml={this.landingPageHtml()}
        language={this.language()}
        resumeActivity={this.resumeSession}
        session={this.getPreviousSessionData()}

      />);
    } else {
      component = (<LanguagePage
        setLanguage={this.updateLanguage}
      />);
    }
    return (
      <div>
        <section className={`section is-fullheight student ${minusHowMuch}`}>
          {this.renderProgressBar()}
          <div className="student-container student-container-diagnostic">
            <CarouselAnimation>
              {component}
            </CarouselAnimation>
          </div>
        </section>
        {this.renderFooter()}
      </div>
    );
  }
}

function select(state) {
  return {
    routing: state.routing,
    questions: state.questions,
    playDiagnostic: state.playDiagnostic,
    sentenceFragments: state.sentenceFragments,
    fillInBlank: state.fillInBlank,
    sessions: state.sessions,
    lessons: state.lessons,
    titleCards: state.titleCards
  };
}
export default connect(select)(ELLStudentDiagnostic);
