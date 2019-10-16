import React from 'react'

interface TooltipProps {
  tooltipText: string,
  tooltipTriggerText: string,
  tooltipTriggerTextClass?: string,
  tooltipTriggerTextStyle?: { [key:string]: any },
  tooltipTriggerStyle?: { [key:string]: any }
}

export class Tooltip extends React.Component<TooltipProps, {}> {
  static timer: any
  static tooltip: any
  static tooltipTrigger: any

  constructor(props) {
    super(props)

    document.addEventListener('click', this.hideTooltipOnClick.bind(this));

    this.timer = null

    this.showTooltip = this.showTooltip.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.hideTooltipOnClick, false)
  }

  hideTooltipOnClick(e) {
    if (this.tooltip && e.target !== this.tooltip && e.target !== this.tooltipTrigger) {
      this.hideTooltip()
    }
  }

  showTooltip() {
    const activeTooltips = document.getElementsByClassName('visible quill-tooltip')
    Array.from(activeTooltips).forEach(tooltip => tooltip.classList.remove('visible'))
    clearTimeout(this.timer)
    this.tooltip.classList.add('visible')
  }

  hideTooltip() {
    this.tooltip.classList.remove('visible')
  }

  startTimer() {
    this.timer = setTimeout(this.hideTooltip, 1500)
  }

  render() {
    const { tooltipText, tooltipTriggerText, tooltipTriggerTextClass, tooltipTriggerStyle, tooltipTriggerTextStyle, } = this.props
    return (
      <span
        className="quill-tooltip-trigger"
        onMouseEnter={this.showTooltip}
        onMouseLeave={this.startTimer}
        ref={node => this.tooltipTrigger = node}
        style={tooltipTriggerStyle}
      >
        <span
          className={`${tooltipTriggerTextClass}`}
          style={tooltipTriggerTextStyle}
        >
          {tooltipTriggerText}
        </span>
        <span
          className="quill-tooltip"
          ref={node => this.tooltip = node}
        >
          {tooltipText}
        </span>
      </span>)
  }
}
