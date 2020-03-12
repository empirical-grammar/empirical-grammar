import * as React from 'react';
import { Cue, CueExplanation, } from 'quill-component-library/dist/componentLibrary'
const arrow = `${process.env.QUILL_CDN_URL}/images/icons/pointing-arrow.svg`;

interface CuesProps {
  cuesLabel?: string;
  cues?: string[];
}

const Cues = ({ cues, cuesLabel, }: CuesProps) => {
  if (!cues || !cues.length) { return <span /> }

  const arrowPicture = cuesLabel !== ' ' ? <img alt="Arrow Icon" src={arrow} /> : null
  const cueExplanation = cuesLabel !== ' ' ? <CueExplanation text={cuesLabel || 'choose one'} /> : null
  const cueDivs = cues.map((cue, i) => <Cue cue={cue} key={`${i}${cue}`} />)

  return (
    <div className="cues">
      {cueDivs}
      {arrowPicture}
      {cueExplanation}
    </div>
  );
}

export default Cues
