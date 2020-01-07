import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'underscore';
import { checkFillInTheBlankQuestion } from 'quill-marking-logic'
import { getGradedResponsesWithCallback } from '../../actions/responses.js';
import {
  hashToCollection,
  WarningDialogue,
  Prompt,
  Feedback
 } from 'quill-component-library/dist/componentLibrary';
import { submitResponse, } from '../../actions/diagnostics.js';
import submitQuestionResponse from '../renderForQuestions/submitResponse.js';
import updateResponseResource from '../renderForQuestions/updateResponseResource.js';
import Cues from '../renderForQuestions/cues.jsx';
import translations from '../../libs/translations/index.js';
import translationMap from '../../libs/translations/ellQuestionMapper.js';
import { stringNormalize } from 'quill-string-normalizer'

const styles = {
  container: {
    marginTop: 35,
    marginBottom: 18,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: 24,
  },
  input: {
    color: '#3D3D3D',
    fontSize: 24,
    marginRight: 10,
    width: 75,
    textAlign: 'center',
    boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderImageSource: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1) 5%, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0))',
    borderImageSlice: 1,
  },
  text: {
    marginRight: 5,
  },
};

export class PlayFillInTheBlankQuestion extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {}
  }

  componentWillMount() {
    const { question, } = this.props

    this.setQuestionValues(question)
  }

  componentWillReceiveProps(nextProps) {
    const { question, } = this.props
    if (nextProps.question.prompt !== question.prompt) {
      this.setQuestionValues(nextProps.question)
    }
  }

  setQuestionValues = (question) => {
    const q = question;
    const splitPrompt = q.prompt.replace(/<p>/g, '').replace(/<\/p>/g, '').split('___');
    const numberOfInputVals = q.prompt.match(/___/g).length
    this.setState({
      splitPrompt,
      inputVals: this.generateInputs(numberOfInputVals),
      inputErrors: new Set(),
      cues: q.cues,
      blankAllowed: q.blankAllowed,
    }, () => this.getGradedResponsesWithCallback(question));
  }

  getGradedResponsesWithCallback = (question) => {
    getGradedResponsesWithCallback(
      question.key,
      (data) => {
        this.setState({ responses: data, });
      }
    );
  }

  getQuestion = () => {
    const { question, } = this.props
    return question
  }

  getInstructionText = () => {
    const { language, } = this.props
    const q = this.getQuestion()
    const textKey = translationMap[q.key];
    let text = q.instructions ? q.instructions : translations.english[textKey];
    if (language && language !== 'english') {
      const textClass = language === 'arabic' ? 'right-to-left' : '';
      text += `<br/><br/><span class="${textClass}">${translations[language][textKey]}</span>`;
    }
    return (<p dangerouslySetInnerHTML={{ __html: text, }} />);
  }

  generateInputs(numberOfInputVals: number) {
    const inputs:Array<string> = [];
    for (let i = 0; i < numberOfInputVals; i+=1) {
      inputs.push('');
    }
    return inputs;
  }

  handleChange = (i, e) => {
    const { inputVals, } = this.state
    const existing = [...inputVals];
    existing[i] = e.target.value;
    this.setState({
      inputVals: existing,
    });
  }

  getChangeHandler = (index) => {
    return (e) => {
      this.handleChange(index, e);
    };
  }

  getBlurHandler = index => {
    return () => {
      this.validateInput(index)
    }
  }

  renderText(text, i) {
    let style = {};
    if (text.length > 0) {
      style = styles.text;
    }
    const textArray = text.split(' ')
    const spanArray:Array<JSX.Element> = []
    textArray.forEach((word, index) => {
      spanArray.push(<span key={`${i}-${index}`} style={style}>{word}</span>)
    })
    return spanArray;
  }

  validateInput = (i) => {
    const { inputErrors, inputVals, blankAllowed, cues, } = this.state
    const newErrors = new Set(inputErrors);
    const inputVal = inputVals[i] || '';
    const inputSufficient = blankAllowed ? true : inputVal;
    const cueMatch = (inputVal && cues.some(c => stringNormalize(c).toLowerCase() === stringNormalize(inputVal).toLowerCase().trim())) || inputVal === ''
    if (inputSufficient && cueMatch) {
      newErrors.delete(i);
    } else {
      newErrors.add(i);
    }
    // following condition will return false if no new errors
    if (newErrors.size) {
      const newInputVals = inputVals
      this.setState({ inputErrors: newErrors, inputVals: newInputVals })
    } else {
      this.setState({ inputErrors: newErrors });
    }
  }

  renderWarning(i) {
    const warningStyle:any = {
      border: '1px #ff3730 solid',
      color: '#ff3730',
      fontSize: '14px',
      top: '-34px',
      position: 'absolute',
      textAlign: 'center',
      backgroundColor: 'white',
      borderRadius: '3px',
      height: '26px',
      zIndex: '100',
      padding: '2px 7px',
    };
    const body:ClientRect|null = document.getElementsByTagName('body')[0].getBoundingClientRect();
    const inputFromDom:HTMLElement|null = document.getElementById(`input${i}`)
    const rectangle:ClientRect|null =  inputFromDom ? inputFromDom.getBoundingClientRect() : null;
    let chevyStyle:any = this.chevyStyleLeft();
    if (rectangle && body && rectangle.left > (body.width / 2)) {
      warningStyle.right = '-73px';
      chevyStyle = this.chevyStyleRight();
    }
    return (
      <WarningDialogue
        chevyStyle={chevyStyle}
        key={`warning${i}`}
        style={warningStyle}
        text={this.warningText()}
      />
    );
  }

  warningText = () => {
    const { blankAllowed, } = this.state
    const text = 'Use one of the options below';
    return `${text}${blankAllowed ? ' or leave blank.' : '.'}`;
  }

  chevyStyleRight() {
    return {
      float: 'right',
      marginRight: '20px',
      position: 'relative',
      top: '-3px',
    };
  }

  chevyStyleLeft():object {
    return {
      float: 'left',
      marginLeft: '20px',
      position: 'relative',
      top: '-3px',
    };
  }

  renderInput = (i) => {
    const { inputErrors, cues, inputVals, } = this.state

    let styling:any = styles.input;
    let warning;
    if (inputErrors.has(i)) {
      warning = this.renderWarning(i);
      styling = Object.assign({}, styling);
      styling.borderColor = '#ff7370';
      styling.borderWidth = '2px';
      delete styling.borderImageSource;
    }
    const longestCue = cues && cues.length ? cues.sort((a, b) => b.length - a.length)[0] : null
    const width = longestCue ? (longestCue.length * 15) + 10 : 50
    styling.width = `${width}px`
    return (
      <span key={`span${i}`}>
        <div style={{ position: 'relative', height: 0, width: 0, }}>
          {warning}
        </div>
        <input
          autoComplete="off"
          id={`input${i}`}
          key={i + 100}
          onBlur={this.getBlurHandler(i)}
          onChange={this.getChangeHandler(i)}
          style={styling}
          type="text"
          value={inputVals[i]}
        />
      </span>
    );
  }

  getPromptElements = () => {
    const { splitPrompt, } = this.state

    if (splitPrompt) {
      const l = splitPrompt.length;
      const splitPromptWithInput:Array<JSX.Element|Array<JSX.Element>> = [];
      splitPrompt.forEach((section, i) => {
        if (i !== l - 1) {
          splitPromptWithInput.push(this.renderText(section, i));
          splitPromptWithInput.push(this.renderInput(i));
        } else {
          splitPromptWithInput.push(this.renderText(section, i));
        }
      });
      return _.flatten(splitPromptWithInput);
    }
  }

  zipInputsAndText = () => {
    const { splitPrompt, inputVals, } = this.state
    const zipped = _.zip(splitPrompt, inputVals);
    return _.flatten(zipped).join('').trim();
  }

  handleSubmitResponse = () => {
    const { inputErrors, responses, blankAllowed, inputVals, } = this.state
    const { question, nextQuestion, } = this.props
    if (!inputErrors.size && responses) {
      if (!blankAllowed) {
        if (inputVals.filter(Boolean).length !== inputVals.length) {
          inputVals.forEach((val, i) => this.validateInput(i))
          return
        }
      }
      const zippedAnswer = this.zipInputsAndText();
      const questionUID = question.key
      const responsesArray = hashToCollection(responses)
      const response = {response: checkFillInTheBlankQuestion(questionUID, zippedAnswer, responsesArray)}
      this.setResponse(response);
      this.updateResponseResource(response);
      this.submitResponse(response);
      this.setState({
        response: '',
      });
      nextQuestion();
    }
  }

  setResponse = (response) => {
    const { setResponse, } = this.props
    if (!setResponse) { return }

    setResponse(response)
  }

  submitResponse = (response) => {
    const { sessionKey, } = this.state
    submitQuestionResponse(response, this.props, sessionKey, submitResponse);
  }

  updateResponseResource = (response) => {
    const { question, dispatch, } = this.props
    updateResponseResource(response, question.key, question.attempts, dispatch);
  }

  renderMedia = () => {
    const { question, } = this.props
    if (question.mediaURL) {
      return (
        <div className='ell-illustration' style={{ marginTop: 15, minWidth: 200 }}>
          <img alt={question.mediaAlt} src={question.mediaURL} />
        </div>
      );
    }
  }

  customText = () => {
    const { language, } = this.props
    const { blankAllowed, } = this.state
    const cuesLabel = this.getQuestion().cuesLabel
    if (cuesLabel) {
      return cuesLabel
    } else {
      let text = translations.english['add word bank cue'];
      text = `${text}${blankAllowed ? ' or leave blank' : ''}`;
      if (language && language !== 'english') {
        text += ` / ${translations[language]['add word bank cue']}`;
      }
      return text;
    }
  }

  getSubmitButtonText = () => {
    const { language, } = this.props
    let text = translations.english['submit button text'];
    if (language && language !== 'english') {
      text += ` / ${translations[language]['submit button text']}`;
    }
    return text;
  }

  render() {
    const { language, question, } = this.props
    const { responses, } = this.state

    let fullPageInstructions
    if (language === 'arabic' && !(question.mediaURL)) {
      fullPageInstructions = { maxWidth: 800, width: '100%' }
    } else {
      fullPageInstructions = { display: 'block' }
    }
    const button = responses ? <button className="button student-submit" onClick={this.handleSubmitResponse} type="button">{this.getSubmitButtonText()}</button> : <button className="button student-submit is-disabled" type="button">Submit</button>;
    return (
      <div className="student-container-inner-diagnostic">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={fullPageInstructions}>
            <div>
              <Prompt elements={this.getPromptElements()} style={styles.container} />
              <Cues
                customText={this.customText()}
                displayArrowAndText={true}
                getQuestion={this.getQuestion}
              />
              <Feedback feedback={this.getInstructionText()} feedbackType="instructions" />
            </div>
          </div>
          {this.renderMedia()}
        </div>
        <div className="question-button-group button-group" style={{marginTop: 20}}>
          {button}
        </div>
      </div>
    );
  }

}

function select(props) {
  return {
  };
}

export default connect(select)(PlayFillInTheBlankQuestion);
