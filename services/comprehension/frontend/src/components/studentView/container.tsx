import * as React from "react";
import queryString from 'query-string';
import { connect } from "react-redux";

import PromptStep from './promptStep'
import StepLink from './stepLink'
import LoadingSpinner from '../shared/loadingSpinner'
import { getActivity } from "../../actions/activities";
import { TrackAnalyticsEvent } from "../../actions/analytics";
import { Events } from '../../modules/analytics'
import { getFeedback } from '../../actions/session'
import { ActivitiesReducerState } from '../../reducers/activitiesReducer'
import { SessionReducerState } from '../../reducers/sessionReducer'

const bigCheckSrc =  `${process.env.QUILL_CDN_URL}/images/icons/check-circle-big.svg`
const tadaSrc =  `${process.env.QUILL_CDN_URL}/images/illustrations/tada.svg`

interface StudentViewContainerProps {
  dispatch: Function;
  activities: ActivitiesReducerState;
  session: SessionReducerState;
  location: any;
}

interface StudentViewContainerState {
  activeStep?: number;
  completedSteps: Array<number>;
  showFocusState: boolean;
}

const READ_PASSAGE_STEP = 1
const ALL_STEPS = [READ_PASSAGE_STEP, 2, 3, 4]

export class StudentViewContainer extends React.Component<StudentViewContainerProps, StudentViewContainerState> {
  private step1: any // eslint-disable-line react/sort-comp
  private step2: any // eslint-disable-line react/sort-comp
  private step3: any // eslint-disable-line react/sort-comp
  private step4: any // eslint-disable-line react/sort-comp

  constructor(props: StudentViewContainerProps) {
    super(props)

    this.state = {
      activeStep: READ_PASSAGE_STEP,
      completedSteps: [],
      showFocusState: false
    }

    this.step1 = React.createRef()
    this.step2 = React.createRef()
    this.step3 = React.createRef()
    this.step4 = React.createRef()
  }

  componentDidMount() {
    const { dispatch, session, } = this.props
    const { sessionID, } = session
    const activityUID = this.activityUID()

    if (activityUID) {
      dispatch(getActivity(sessionID, activityUID))
    }

    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  onMobile = () => window.innerWidth < 1100

  activityUID = () => {
    const { location, } = this.props
    const { search, } = location
    if (!search) { return }
    return queryString.parse(search).uid
  }

  submitResponse = (entry: string, promptID: string, promptText: string, attempt: number) => {
    const { dispatch, session, } = this.props
    const { sessionID, } = session
    const activityUID = this.activityUID()
    const previousFeedback = session.submittedResponses[promptID] || [];
    if (activityUID) {
      const args = {
        sessionID,
        activityUID,
        entry,
        promptID,
        promptText,
        attempt,
        previousFeedback,
        callback: this.scrollToHighlight
      }
      dispatch(getFeedback(args))
    }
  }

  getCurrentStepDataForEventTracking = () => {
    const { activities, session, } = this.props
    const { currentActivity, } = activities
    const { sessionID, } = session
    const activityID = this.activityUID()
    const { activeStep, } = this.state
    const promptIndex = activeStep - 2 // have to subtract 2 because the prompts array index starts at 0 but the prompt numbers in the state are 2..4

    if (promptIndex < 0 || !currentActivity.prompts[promptIndex]) return; // If we're on a step earlier than a prompt, or there's no prompt for this step then there's nothing to track

    const promptID = currentActivity.prompts[promptIndex].prompt_id

    return {
      activityID,
      sessionID,
      promptID,
    }
  }

  trackPassageReadEvent = () => {
    const { dispatch, } = this.props
    const { session, } = this.props
    const { sessionID, } = session
    const activityUID = this.activityUID()

    dispatch(TrackAnalyticsEvent(Events.COMPREHENSION_PASSAGE_READ, {
      activityID: activityUID,
      sessionID: sessionID
    }));
  }

  trackCurrentPromptStartedEvent = () => {
    //console.log('current prompt started event')
    const { dispatch, } = this.props

    const trackingParams = this.getCurrentStepDataForEventTracking()
    if (!trackingParams) return; // Bail if there's no data to track

    dispatch(TrackAnalyticsEvent(Events.COMPREHENSION_PROMPT_STARTED, trackingParams))
  }

  trackCurrentPromptCompletedEvent = () => {
    const { dispatch, } = this.props

    const trackingParams = this.getCurrentStepDataForEventTracking()
    if (!trackingParams) return; // Bail if there's no data to track

    dispatch(TrackAnalyticsEvent(Events.COMPREHENSION_PROMPT_COMPLETED, trackingParams))
  }

  trackActivityCompletedEvent = () => {
    const { dispatch, } = this.props
    const { session, } = this.props
    const { sessionID, } = session
    const activityID = this.activityUID()

    dispatch(TrackAnalyticsEvent(Events.COMPREHENSION_ACTIVITY_COMPLETED, {
      activityID,
      sessionID,
    }))
  }

  activateStep = (step?: number, callback?: Function) => {
    const { activeStep, completedSteps, } = this.state
    // don't activate a step if it's already active
    if (activeStep == step) return
    // don't activate steps before Done reading button has been clicked
    if (step && step > 1 && !completedSteps.includes(READ_PASSAGE_STEP)) return
    this.setState({ activeStep: step, }, () => {
      this.trackCurrentPromptStartedEvent()
      if (callback) { callback() }
    })
  }

  completeStep = (stepNumber: number) => {
    const { completedSteps, } = this.state
    const newCompletedSteps = completedSteps.concat(stepNumber)
    const uniqueCompletedSteps = Array.from(new Set(newCompletedSteps))
    this.trackCurrentPromptCompletedEvent()
    this.setState({ completedSteps: uniqueCompletedSteps }, () => {
      let nextStep: number|undefined = stepNumber + 1
      if (nextStep > ALL_STEPS.length || uniqueCompletedSteps.includes(nextStep)) {
        nextStep = ALL_STEPS.find(s => !uniqueCompletedSteps.includes(s))
      }
      nextStep ? this.activateStep(nextStep, () => this.scrollToStep(`step${nextStep}`)) : this.trackActivityCompletedEvent(); // If there is no next step, the activity is done
    })
  }

  handleKeyDown = (e) => {
    const { showFocusState, } = this.state

    if (e.key !== 'Tab' || showFocusState) { return }

    this.setState({ showFocusState: true })
  }

  handleDoneReadingClick = () => {
    this.completeStep(READ_PASSAGE_STEP);
    this.trackPassageReadEvent();
  }

  scrollToStep = (ref: string) => {
    if (this.onMobile()) {
      this.scrollToStepOnMobile(ref)
    } else {
      const scrollContainer = document.getElementsByClassName("steps-outer-container")[0]
      const el = this[ref]

      scrollContainer.scrollTo(0, el.offsetTop - 34)
    }
  }

  scrollToHighlight = () => {
    const passageHighlights = document.getElementsByClassName('passage-highlight')
    if (!passageHighlights.length) { return }

    const el = passageHighlights[0].parentElement

    // we want to scroll 24px above the top of the paragraph, but we have to use 84 because of the 60px padding set at the top of the activity-container element
    const additionalTopOffset = 84

    if (this.onMobile()) {
      el.scrollIntoView(true)
      window.scrollBy(0, -additionalTopOffset)
    } else {
      const scrollContainer = document.getElementsByClassName("read-passage-container")[0]
      scrollContainer.scrollTo(0, el.offsetTop - additionalTopOffset)
    }
  }

  scrollToStepOnMobile = (ref: string) => {
    this[ref].scrollIntoView(false)
  }

  clickStepLink = (stepNumber: number) => {
    this.activateStep(stepNumber)
    this.scrollToStepOnMobile(`step${stepNumber}`)
  }

  addPTagsToPassages = (passages) => {
    return passages.map(passage => {
      const paragraphArray = passage.match(/[^\r\n]+/g)
      return paragraphArray.map(p => `<p>${p}</p>`).join('')
    })
  }

  formatHtmlForPassage = () => {
    const { activeStep, } = this.state
    const { activities, session, } = this.props
    const { currentActivity, } = activities

    if (!currentActivity) { return }

    let passages = currentActivity.passages
    const passagesWithPTags = this.addPTagsToPassages(passages)

    if (!activeStep || activeStep === READ_PASSAGE_STEP) { return passagesWithPTags }

    const promptIndex = activeStep - 2 // have to subtract 2 because the prompts array index starts at 0 but the prompt numbers in the state are 2..4
    const activePromptId = currentActivity.prompts[promptIndex].prompt_id
    const submittedResponsesForActivePrompt = session.submittedResponses[activePromptId]

    if (!(submittedResponsesForActivePrompt && submittedResponsesForActivePrompt.length)) { return passagesWithPTags }

    const lastSubmittedResponse = submittedResponsesForActivePrompt[submittedResponsesForActivePrompt.length - 1]

    if (!lastSubmittedResponse.highlight) { return passagesWithPTags }

    const passageHighlights = lastSubmittedResponse.highlight.filter(hl => hl.type === "passage")

    passageHighlights.forEach(hl => {
      const characterStart = hl.character || 0
      passages = passages.map(passage => {
        const passageBeforeCharacterStart = passage.substring(0, characterStart)
        const passageAfterCharacterStart = passage.substring(characterStart)
        const highlightedPassageAfterCharacterStart = passageAfterCharacterStart.replace(hl.text, `<span class="passage-highlight">${hl.text}</span>`)
        return `${passageBeforeCharacterStart}${highlightedPassageAfterCharacterStart}`
      })
    })

    return this.addPTagsToPassages(passages)
  }

  renderStepLinks = () => {
    const { activities, } = this.props
    const { currentActivity, } = activities
    if (!currentActivity) return

    const links = []
    const numberOfLinks = ALL_STEPS.length

    for (let i=1; i <= numberOfLinks; i++ ) {
      links.push(<StepLink clickStepLink={this.clickStepLink} index={i} renderStepNumber={this.renderStepNumber} />)
    }

    return (<div className="hide-on-desktop step-links">
      {links}
    </div>)
  }

  renderStepNumber = (number: number) => {
    const { activeStep, completedSteps, } = this.state
    const active = activeStep === number
    const completed = completedSteps.includes(number)
    if (completed) {
      return <img alt="white check in green circle" className="step-number completed" key={number} src={bigCheckSrc} />
    }
    return <div className={`step-number ${active ? 'active' : ''}`} key={number}>{number}</div>
  }

  renderReadPassageStep = () => {
    const { activeStep, } = this.state
    const { activities, } = this.props
    const { currentActivity, } = activities
    if (!currentActivity) return
    let className = 'step'
    let button
    if (activeStep === READ_PASSAGE_STEP) {
      className += ' active'
      button = <button className='quill-button done-reading-button' onClick={this.handleDoneReadingClick} type="button">Done reading</button>
    }
    return (<div className={className} role="button" tabIndex={0}>
      <div className="step-content" ref={(node) => this.step1 = node}>
        <div className="step-header">
          {this.renderStepNumber(READ_PASSAGE_STEP)}
          <p className="directions">Read the passage:</p>
        </div>
        <p className="passage-title">{currentActivity.title}</p>
        {button}
      </div>
    </div>)
  }

  renderPromptSteps = () => {
    const { activities, session, } = this.props
    const { activeStep, completedSteps } = this.state
    const { currentActivity, } = activities
    const { submittedResponses, } = session
    if (!currentActivity) return
    return currentActivity.prompts.map((prompt, i) => {
      // using i + 2 because the READ_PASSAGE_STEP is 1, so the first item in the set of prompts will always be 2
      const stepNumber = i + 2
      const everyOtherStepCompleted = completedSteps.filter(s => s !== stepNumber).length === 3
      return (<PromptStep
        activateStep={this.activateStep}
        active={stepNumber === activeStep}
        className={`step ${activeStep === stepNumber ? 'active' : ''}`}
        completeStep={this.completeStep}
        everyOtherStepCompleted={everyOtherStepCompleted}
        key={stepNumber}
        passedRef={(node: JSX.Element) => this[`step${stepNumber}`] = node} // eslint-disable-line react/jsx-no-bind
        prompt={prompt}
        stepNumber={stepNumber}
        stepNumberComponent={this.renderStepNumber(stepNumber)}
        submitResponse={this.submitResponse}
        submittedResponses={submittedResponses[prompt.prompt_id] || []}
      />)
    })
  }

  renderReadPassageContainer = () => {
    const { activeStep, } = this.state
    const { activities, } = this.props
    const { currentActivity, } = activities
    if (!currentActivity) return

    return (<div className="read-passage-container">
      <div>
        <p className="directions">Read the passage</p>
        <h1 className="title">{currentActivity.title}</h1>
        <div className="passage" dangerouslySetInnerHTML={{__html: this.formatHtmlForPassage()}} />
      </div>
    </div>)
  }

  renderSteps = () => {
    return (<div className="steps-outer-container">
      <div className="steps-inner-container">
        {this.renderReadPassageStep()}
        {this.renderPromptSteps()}
      </div>
    </div>)
  }

  renderCompletedView() {
    return (<div className="activity-completed">
      <img alt="Party hat with confetti coming out" src={tadaSrc} />
      <h1>Activity Complete!</h1>
      <p>Thank you for taking the time to try our newest tool, Quill Comprehension.</p>
    </div>)
  }

  render() {
    const { activities, } = this.props
    const { showFocusState, completedSteps, } = this.state

    if (!activities.hasReceivedData) { return <LoadingSpinner /> }

    if (completedSteps.length === ALL_STEPS.length) { return this.renderCompletedView() }

    const className = `activity-container ${showFocusState ? '' : 'hide-focus-outline'}`

    return (<div className={className}>
      {this.renderStepLinks()}
      {this.renderReadPassageContainer()}
      {this.renderSteps()}
    </div>)
  }
}

const mapStateToProps = (state: any) => {
  return {
    activities: state.activities,
    session: state.session
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StudentViewContainer);
