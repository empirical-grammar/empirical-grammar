import React from 'react';
import {
  Cue,
  CueExplanation
} from 'quill-component-library/dist/componentLibrary';

const arrow = 'https://assets.quill.org/images/icons/arrow_icon.svg';

// temporarily making this an export and leaving the default export because of the other components that use it
export const Cues = ({ cues, }: { cues: string[] }) => {
  if (!(cues && cues.length)) { return <span /> }

  const cueDivs = cues.map((cue, i) => <Cue cue={cue} key={`${i}${cue}`} />)
  return (
    <div className="cues">
      {cueDivs}
      <img alt="Arrow Icon" src={arrow} />
      <CueExplanation text='choose one' />
    </div>
  )
}

export default class extends React.Component {
  getJoiningWordsText = () => {
    let text;
    if (this.props.getQuestion().cues && this.props.getQuestion().cuesLabel) {
      return this.props.getQuestion().cuesLabel;
    } else if (this.props.getQuestion().cues && this.props.getQuestion().cues.length === 1) {
      text = 'joining word';
      return text;
    }
    text = 'joining words';
    return text;
  };

  renderExplanation = () => {
    let text;
    if (this.props.customText) {
      text = this.props.customText;
    } else {
      text = this.getJoiningWordsText();
    }
    return (
      <CueExplanation text={text} />
    );
  };

  renderCues = () => {
    let arrowPicture,
      text;
    if (this.props.displayArrowAndText) {
      arrowPicture = this.props.getQuestion().cuesLabel !== ' ' ? <img src={arrow} /> : null
      text = this.renderExplanation()
    } else {
      arrowPicture = <span />;
      text = <span />;
    }
    if  (this.props.getQuestion().cues && this.props.getQuestion().cues.length > 0 && this.props.getQuestion().cues[0] !== '') {
      const cueDivs = this.props.getQuestion().cues.map((cue, i) => <Cue cue={cue} key={`${i}${cue}`} />)
      return (
        <div className="cues">
          {cueDivs}
          {arrowPicture}
          {text}
        </div>
      );
    }
  };

  render() {
    return <div>{this.renderCues()}</div>;
  }
}
