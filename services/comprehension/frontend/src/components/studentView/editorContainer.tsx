import * as React from 'react'
import ContentEditable from 'react-contenteditable'

const clearSrc =  `${process.env.QUILL_CDN_URL}/images/icons/clear.svg`
const disabledClearSrc =  `${process.env.QUILL_CDN_URL}/images/icons/clear-disabled.svg`


interface EditorContainerProps {
  promptText: string;
  stripHtml: (input: string) => input;
  html: string;
  disabled: boolean;
  resetText: (event: any) => void;
  innerRef: Function;
  handleTextChange: (event: any) => void;
  className: string;
}

export default class EditorContainer extends React.Component<EditorContainerProps, any> {
  componentDidMount() {
    window.addEventListener('paste', (e) => {
      e.preventDefault()
      return false
    }, true);
  }

  renderClear = () => {
    const { disabled, resetText, } = this.props
    if (disabled) {
      return (<img
        alt="circle with an x in it"
        className="clear"
        src={disabledClearSrc}
      />)
    }
    return (<img
      alt="circle with an x in it"
      className="clear"
      onClick={resetText}
      src={clearSrc}
    />)
  }

  render() {
    const { disabled, html, innerRef, handleTextChange, className, } = this.props
    return (<div className="editor-container">
      <ContentEditable
        className={className}
        data-gramm={false}
        disabled={disabled}
        html={html}
        innerRef={innerRef}
        onChange={handleTextChange}
        spellCheck={false}
      />
      {this.renderClear()}
    </div>)
  }
}
