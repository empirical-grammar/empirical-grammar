import * as React from 'react'
import { Link } from 'react-router-dom'

import parsedQueryParams from './parsedQueryParams'
import { COLLEGE_BOARD_SLUG } from './assignmentFlowConstants'
import LeavingModal from './leaving_modal'

const quillLogoGreenSrc =  `${process.env.CDN_URL}/images/logos/quill-logo-green.svg`

interface AssignmentFlowNavigationProps {
  button?: JSX.Element;
  unitTemplateId?: string;
  unitTemplateName?: string;
  isFromDiagnosticPath?: boolean;
}

const learningProcessSlug = 'learning-process'
const diagnosticSlug = 'diagnostic'
const activityTypeSlug = 'activity-type'
const collegeBoardSlug = COLLEGE_BOARD_SLUG
const createActivityPackSlug = 'create-activity-pack'
const selectClassesSlug = 'select-classes'
const featuredActivityPacksSlug = 'featured-activity-packs'
const preApSlug = 'pre-ap'
const apSlug = 'ap'

const slash = (index: number) => <span className="slash" key={index}>/</span>
const learningProcess = () => <Link key="learning-process" to={`/assign/${learningProcessSlug}`}>Learning process</Link>
const diagnostic = () => <Link key="diagnostic" to={`/assign/${diagnosticSlug}`}>Diagnostic</Link>
const activityType = () => <Link key="activity-type" to={`/assign/${activityTypeSlug}`}>Activity type</Link>
const collegeBoard = () => <Link key="college-board" to={`/assign/${collegeBoardSlug}`}>College Board</Link>
const createActivityPack = () => <Link key="custom-activity-pack" to={`/assign/${createActivityPackSlug}`}>Custom activity pack</Link>
const selectClasses = () => <Link key="assign-" to={`/assign/${selectClassesSlug}`}>Assign</Link>
const activityPack = () => <Link key="activity-pack" to={`/assign/${featuredActivityPacksSlug}`}>Activity pack</Link>
const preAp = () => <Link key="activity-pack" to={`/assign/${preApSlug}`}>Pre-AP</Link>
const ap = () => <Link key="activity-pack" to={`/assign/${apSlug}`}>AP</Link>
const individualFeaturedActivityPack = (unitTemplateId, unitTemplateName) => {
  let link = `/assign/${featuredActivityPacksSlug}/${unitTemplateId}`
  const collegeBoardActivityTypeSlug = parsedQueryParams()[collegeBoardSlug]
  if (collegeBoardActivityTypeSlug) {
    link+= `?${collegeBoardSlug}=${collegeBoardActivityTypeSlug}`
  }
  return <Link key="featured-activity-pack" to={link}>{unitTemplateName}</Link>
}

const collegeBoardSlugsToLinks = {
  [preApSlug]: preAp(),
  [apSlug]: ap()
}

const routeLinks = {
  [learningProcessSlug]: () => [slash(1), learningProcess()],
  [diagnosticSlug]: () => [slash(1), learningProcess(), slash(2), diagnostic()],
  [activityTypeSlug]: () => [slash(1), learningProcess(), slash(2), activityType()],
  [preApSlug]: () => [slash(1), learningProcess(), slash(2), collegeBoard(), slash(3), preAp()],
  [apSlug]: () => [slash(1), learningProcess(), slash(2), collegeBoard(), slash(3), ap()],
  [collegeBoardSlug]: () => [slash(1), learningProcess(), slash(2), collegeBoard()],
  [createActivityPackSlug]: () => [slash(1), learningProcess(), slash(2), activityType(), slash(3), createActivityPack()],
  [selectClassesSlug]: (unitTemplateId, unitTemplateName, isFromDiagnosticPath) => {
    if (isFromDiagnosticPath) {
      return [
        slash(1),
        learningProcess(),
        slash(2),
        diagnostic(),
        slash(3),
        selectClasses()
      ]
    }

    const collegeBoardActivityTypeSlug = parsedQueryParams()[collegeBoardSlug]
    if (collegeBoardActivityTypeSlug) {
      return [slash(1), learningProcess(), slash(2), collegeBoard(), slash(3), collegeBoardSlugsToLinks[collegeBoardActivityTypeSlug], slash(4), individualFeaturedActivityPack(unitTemplateId, unitTemplateName), slash(5), selectClasses()]
    }

    const base = [slash(1), learningProcess(), slash(2), activityType(), slash(3)]
    if (unitTemplateId && unitTemplateName) {
      return base.concat(
        [activityPack(),
          slash(4),
          individualFeaturedActivityPack(unitTemplateId, unitTemplateName),
          slash(5),
          selectClasses()
        ]
      )
    }
    return base.concat([createActivityPack(), slash(4), selectClasses()])
  },
  [featuredActivityPacksSlug]: (unitTemplateId, unitTemplateName) => {
    const collegeBoardActivityTypeSlug = parsedQueryParams()[collegeBoardSlug]
    if (collegeBoardActivityTypeSlug) {
      return [slash(1), learningProcess(), slash(2), collegeBoard(), slash(3), collegeBoardSlugsToLinks[collegeBoardActivityTypeSlug], slash(4), individualFeaturedActivityPack(unitTemplateId, unitTemplateName)]
    }

    const base = [slash(1), learningProcess(), slash(2), activityType(), slash(3), activityPack()]
    if (unitTemplateId && unitTemplateName) {
      return base.concat([slash(4), individualFeaturedActivityPack(unitTemplateId, unitTemplateName)])
    }
    return base
  }
}

const routeProgress = {
  [learningProcessSlug]: () => 'step-one',
  [diagnosticSlug]: () => 'step-two',
  [activityTypeSlug]: () => 'step-two',
  [collegeBoardSlug]: () => 'step-two',
  [preApSlug]: () => 'step-three',
  [apSlug]: () => 'step-three',
  [createActivityPackSlug]: () => 'step-three',
  [selectClassesSlug]: () => 'step-five',
  [featuredActivityPacksSlug]: (unitTemplateId, unitTemplateName) => {
    if (unitTemplateId && unitTemplateName) {
      return 'step-four'
    }
    return 'step-three'
  }
}

export default class AssignmentFlowNavigation extends React.Component<AssignmentFlowNavigationProps, any> {
  constructor(props) {
    super(props)

    this.state = {
      showLeavingModal: false
    }
  }

  toggleLeavingModal = () => {
    this.setState({ showLeavingModal: !this.state.showLeavingModal })
  }

  getSlug() {
    const path = location.pathname
    // will grab whatever comes after '/assign/' and before another slash
    return path.split('/')[2]
  }

  renderButton() {
    const { button, } = this.props
    return button ? button : null
  }

  renderLinks() {
    const { unitTemplateId, unitTemplateName, isFromDiagnosticPath } = this.props
    let elements
    try {
      elements = routeLinks[this.getSlug()](unitTemplateId, unitTemplateName, isFromDiagnosticPath)
    } catch {
      elements = []
    }
    return <div className="links">{elements}</div>
  }

  renderProgressBar() {
    const { unitTemplateId, unitTemplateName } = this.props
    let className
    try {
      className = routeProgress[this.getSlug()](unitTemplateId, unitTemplateName)
    } catch {
      className = null
    }
    return <div className='progress-bar'><div className={className} /></div>
  }

  renderLeavingModal() {
    if (this.state.showLeavingModal) {
      return <LeavingModal cancel={this.toggleLeavingModal} />
    }
  }

  render() {
    return (<div className="assignment-flow-navigation">
      {this.renderLeavingModal()}
      <div className="assignment-flow-navigation-container">
        <div className="left">
          <img alt="green Quill logo" onClick={this.toggleLeavingModal} src={quillLogoGreenSrc} />
          {this.renderLinks()}
        </div>
        <div className="right">
          {this.renderButton()}
        </div>
      </div>
      {this.renderProgressBar()}
    </div>)
  }
}
