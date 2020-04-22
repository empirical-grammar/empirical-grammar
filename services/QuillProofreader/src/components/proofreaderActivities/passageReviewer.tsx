import * as React from 'react';

import { Concept } from '../../interfaces/concepts'
import Edit from './edit'

import {
  UNNECESSARY_SPACE,
  MULTIPLE_UNNECESSARY_DELETION,
  SINGLE_UNNECESSARY_DELETION,
  MULTIPLE_UNNECESSARY_ADDITION,
  SINGLE_UNNECESSARY_ADDITION,
  UNNECESSARY_CHANGE
} from '../../helpers/determineUnnecessaryEditType'

const unnecessaryArray = [UNNECESSARY_SPACE, MULTIPLE_UNNECESSARY_DELETION, SINGLE_UNNECESSARY_DELETION, MULTIPLE_UNNECESSARY_ADDITION, SINGLE_UNNECESSARY_ADDITION, UNNECESSARY_CHANGE]

interface PassageReviewerProps {
  text: string;
  concepts: Concept[];
  finishReview: Function;
}

interface PassageReviewerState {
  activeIndex: number;
  numberOfEdits: number;
}

export default class PassageReviewer extends React.Component<PassageReviewerProps, PassageReviewerState> {
  constructor(props: PassageReviewerProps) {
    super(props)

    const matches = props.text ? props.text.match(/{\+([^-]+)-([^|]*)\|([^}]*)}/g) : []
    const numberOfEdits = matches ? matches.length : 0

    this.state = {
      activeIndex: 0,
      numberOfEdits
    }
  }

  componentDidMount() {
    this.scrollToActiveIndex()
  }

  next = () => {
    const { activeIndex, numberOfEdits } = this.state
    if (activeIndex + 1 === numberOfEdits) {
      this.props.finishReview()
    } else {
      this.setState(prevState => ({ activeIndex: prevState.activeIndex + 1}), this.scrollToActiveIndex)
    }
  }

  back = () => {
    const { activeIndex, } = this.state
    if (activeIndex === 0) { return }

    this.setState(prevState => ({ activeIndex: prevState.activeIndex - 1}), this.scrollToActiveIndex)
  }

  scrollToActiveIndex() {
    const { activeIndex, } = this.state
    const el = document.getElementById(String(activeIndex))
    if (el) {
      el.scrollIntoView()
    }
  }

  renderFormattedText() {
    const { text, concepts } = this.props
    const paragraphs = text.split('</p><p>')
    const punctuationRegex = /^[.,:;]/
    const { activeIndex, numberOfEdits } = this.state
    let index = 0
    return paragraphs.map((paragraph: string) => {
      const parts: Array<string|JSX.Element> = paragraph.replace(/<p>|<\/p>/g, '').split(/{|}/g)
      for (let i = 0; i < parts.length; i +=1) {
        if (typeof parts[i] === "string" && parts[i][0] === '+') {
          const plusMatch = parts[i].match(/\+([^-]+)-/m)
          const plus = plusMatch ? plusMatch[1] : ''
          const conceptUIDMatch = parts[i].match(/\|([^-]+)/m)
          const conceptUID = conceptUIDMatch ? conceptUIDMatch[1] : ''
          const negativeMatch = parts[i].match(/\-([^-]+)\|/m)
          const negative = negativeMatch ? negativeMatch[1] : null
          const concept = this.props.concepts.find(c => c.uid === conceptUID)
          const indexToPass = index
          let state = 'correct'
          if (unnecessaryArray.includes(conceptUID)) {
            state = conceptUID
          } else if (negative) {
            state = 'incorrect'
          }
          index+=1
          parts[i] = (<Edit
            activeIndex={activeIndex}
            back={indexToPass ? this.back : null}
            concept={concept}
            displayText={plus}
            id={`${indexToPass}`}
            incorrectText={negative}
            index={indexToPass}
            next={this.next}
            numberOfEdits={numberOfEdits}
            state={state}
          />)
          if (punctuationRegex.test(parts[i + 1])) {
            parts[i + 1] = `${parts[i + 1]}`
          } else {
            parts[i + 1] = ` ${parts[i + 1]}`
          }
        }
      }
      return <p>{parts}</p>
    })
  }

  render() {
    if (this.props.text) {
      return (<div className="reviewer-container">
        <div className="reviewer" >
          {this.renderFormattedText()}
        </div>
      </div>)
    } else {
      return <p>No passage</p>
    }
  }

}
