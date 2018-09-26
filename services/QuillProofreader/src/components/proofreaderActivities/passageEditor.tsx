import * as React from 'react';
import { Editor } from 'slate-react'
import Html from 'slate-html-serializer'
import StickyInlines from 'slate-sticky-inlines'
import { stringNormalize } from 'quill-string-normalizer'

const BLOCK_TAGS = {
  blockquote: 'quote',
  p: 'paragraph',
  pre: 'code',
  span: 'span'
}
​
// Add a dictionary of mark tags.
const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline'
}
​
const rules = [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: type === 'span' ? 'inline': 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
            dataOriginalIndex: el.getAttribute('data-original-index')
          },
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === 'block' || obj.object === 'inline') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>
          case 'quote':
            return <blockquote>{children}</blockquote>
          case 'span':
            return <span data-original-index={obj.data.get('dataOriginalIndex')}>{children}</span>
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'mark',
          type: type,
          data: {
            id: el.getAttribute('id'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object == 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>
          case 'underline':
            return <u id={obj.data.get('id')}>{children}</u>
        }
      }
    },
  },

]

const html = new Html({ rules })

const plugins = [
  StickyInlines({
    // stickOnDelete: false
    canBeEmpty: true,
    hasStickyBoundaries: true,
    stickOnDelete: true,
  })
]

interface PassageEditorState {
  text: any;
  originalTextArray: Array<string>,
  indicesOfUTags: {[key:number]: number}
}

interface PassageEditorProps {
  handleTextChange: Function;
  text: string;
  savedText?: string;
}

class PassageEditor extends React.Component <PassageEditorProps, PassageEditorState> {
  constructor(props: PassageEditorProps) {
    super(props)

    const { paragraphWrappedText, originalTextArray, indicesOfUTags } = this.paragraphWrappedText(props.text)

    const text = props.savedText ? props.savedText : paragraphWrappedText

    this.state = {
      text: html.deserialize(text),
      originalTextArray,
      indicesOfUTags
    }

    this.handleTextChange = this.handleTextChange.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
  }

  trimWord(word: string) {
    return word.trim().replace(/\n/gm, '')
  }

  paragraphWrappedText(text: string) {
    const brStrippedText = text.replace(/(<br\/>)+/gm, '</p><p>').replace(/((<\/p><p>)(\s)*)(<\/p><p>)/gm, '</p><p>')
    const uTags = brStrippedText.match(/<u.+?<\/u>/gm)
    const punctuationRegex = /^[.,:;]/
    const originalTextArray: Array<string> = []
    let spannedText = ''
    let index = 0
    const spans = brStrippedText.split(/<u.+?<\/u>/gm)
    // { index: uTagId }
    const indicesOfUTags: {[key:number]: number} = {}
    spans.forEach((span, spanIndex) => {
      const words = span.trim().split(' ')
      words.forEach((word, wordIndex) => {
        const trimmedWord = this.trimWord(word)
        const trimmedNextWord = words[wordIndex + 1] ? this.trimWord(words[wordIndex + 1]) : ''
        if (trimmedWord.length) {
          // don't add a space after the  word if the next word starts with punctuation
          if (punctuationRegex.test(trimmedNextWord)) {
            spannedText += `<span> data-original-index=${index}${trimmedWord}</span>`
          } else {
            spannedText += `<span data-original-index=${index}>${trimmedWord} </span>`
          }
          originalTextArray.push(trimmedWord)
          index++
        }
      })
      if (uTags && uTags[spanIndex]) {
        const openingUTag = uTags[spanIndex].match(/<u id="(\d+)">/m)
        if (openingUTag) {
          const id = Number(openingUTag[1])
          indicesOfUTags[index] = id
        }
        // don't add a space after the tag if the next word starts with punctuation
        if (spans[spanIndex + 1] && punctuationRegex.test(spans[spanIndex + 1].trim())) {
          spannedText += `<span data-original-index=${index}>${uTags[spanIndex]}</span>`
        } else {
          spannedText += `<span data-original-index=${index}>${uTags[spanIndex]} </span>`
        }
        const text = uTags[spanIndex].match(/<u id="\d+">(.*)<\/u>/) ? uTags[spanIndex].match(/<u id="\d+">(.*)<\/u>/)[1] : ''
        originalTextArray.push(text)
        index++
      }
    })
    return { paragraphWrappedText: /^<p>/.test(spannedText) ? spannedText : `<p>${spannedText}</p>`, originalTextArray, indicesOfUTags }
  }

  renderNode = (args) => {
    switch (args.node.type) {
      case 'code':
        return (
          <pre {...args.attributes}>
            <code>{args.children}</code>
          </pre>
        )
      case 'paragraph':
        return (
          <p {...args.attributes} className={args.node.data.get('className')}>
            {args.children}
          </p>
        )
      case 'quote':
        return <blockquote {...args.attributes}>{args.children}</blockquote>
      case 'span':
        return <span {...args.attributes} data-original-index={args.node.data.get('dataOriginalIndex')}>{args.children}</span>
    }
  }
​
// Add a `renderMark` method to render marks.
  renderMark = (args) => {
    const { mark, attributes } = args
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{args.children}</strong>
      case 'italic':
        return <em {...attributes}>{args.children}</em>
      case 'underline':
        if (args.children.trim && !args.children.trim().length) {
          return args.children
        } else {
          return <u {...attributes}>{args.children}</u>
        }
    }
  }

  handleTextChange({value}) {
    this.setState({text: value}, () => this.props.handleTextChange(html.serialize(this.state.text)))
  }

  onKeyUp(event, change, editor) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') return

    const { value } = change
    const originalSelection = value.selection
    const { startInline } = value
    let currentInline = startInline

    // const previousInline = change.moveStartBackward(2).value.startInline
    const previousInline = change.moveStartBackward(1).value.inlines.first()
    console.log('previousInline', previousInline)
    console.log('equality', previousInline !== startInline)
    // if there is a previous inline which is not the same as the start inline,
    // you have crossed the boundary into the previous span
    if (previousInline !== startInline && previousInline) {
      currentInline = previousInline
    }

    if (currentInline && currentInline.nodes) {
      const dataOriginalIndex = currentInline.data.get('dataOriginalIndex')
      const originalText = this.state.originalTextArray[dataOriginalIndex]
      const newText = currentInline.text
      const normalizedText = stringNormalize(newText)
      const normalizedAndTrimmedNewText = normalizedText.trim()
      let node = change.moveToRangeOfNode(currentInline)

      if (newText.substr(newText.length - 1) === ' ') {
        node.moveEndBackward(1)
      }

      if (this.state.indicesOfUTags[dataOriginalIndex] || this.state.indicesOfUTags[dataOriginalIndex] === 0) {
        const id = this.state.indicesOfUTags[dataOriginalIndex]
        node = node.addMark({type: 'underline', data: {id}})
      }

      if (normalizedAndTrimmedNewText === stringNormalize(originalText).trim()) {
        node
        .removeMark('bold')
        .setStart(originalSelection.start)
        .setEnd(originalSelection.end)
      } else {
        node
        .addMark('bold')
        .setStart(originalSelection.start)
        .setEnd(originalSelection.end)
      }

    } else {
      const nextInline = change.moveEndForward(1).value.endInline
      const previousInline = change.moveStartBackward(1).value.startInline
      if (nextInline || previousInline) {
        if (nextInline) {
          const dataOriginalIndex = nextInline.data.get('dataOriginalIndex')
          const originalNextInlineText = this.state.originalTextArray[dataOriginalIndex]
          if (this.state.indicesOfUTags[dataOriginalIndex] || this.state.indicesOfUTags[dataOriginalIndex] === 0) {
            const id = this.state.indicesOfUTags[dataOriginalIndex]
            let node = change
            .setStart(originalSelection.start)
            .setEnd(originalSelection.end)
            .addMark({type: 'underline', data: {id}})
            if (stringNormalize(nextInline.text).trim() !== stringNormalize(originalNextInlineText).trim()) {
              node.addMark('bold')
            }
          }
        }
        if (previousInline) {
          const dataOriginalIndex = previousInline.data.get('dataOriginalIndex')
          const originalPreviousInlineText = this.state.originalTextArray[dataOriginalIndex]
          if (this.state.indicesOfUTags[dataOriginalIndex] || this.state.indicesOfUTags[dataOriginalIndex] === 0) {
            const id = this.state.indicesOfUTags[dataOriginalIndex]
            let node = change
            .setStart(originalSelection.start)
            .setEnd(originalSelection.end)
            .addMark({type: 'underline', data: {id}})
            if (stringNormalize(previousInline.text).trim() !== stringNormalize(originalPreviousInlineText).trim()) {
              node.addMark('bold')
            }
          }
        }
      } else {
        change.addMark('bold')
      }
    }
  }

  render() {
    if (this.state.text) {
      return (
        <Editor
          className='editor'
          value={this.state.text}
          onChange={this.handleTextChange}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          onKeyUp={this.onKeyUp}
          spellCheck={false}
        />)
    } else {
      return <span/>
    }
  }

}

export default PassageEditor
