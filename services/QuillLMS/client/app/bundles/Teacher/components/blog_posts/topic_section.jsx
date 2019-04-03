import React from 'react';
import pluralize from 'pluralize'
import PreviewCard from '../shared/preview_card.jsx';

export default class TopicSection extends React.Component {
  displayTitle() {
    return this.props.role === 'student' ? this.props.title.replace('Student ', '') : this.props.title
  }

  sectionLink() {
    return this.props.role === 'student' ? 'student-center' : 'teacher-center'
  }

  renderArticleCards() {
    return this.props.articles.slice(0, 3).map(article =>
      <PreviewCard
        content={article.preview_card_content}
        link={article.external_link ? article.external_link : `/${this.sectionLink()}/${article.slug}`}
        externalLink={!!article.external_link}
      />
    )
  }

  topicIcon() {
    switch (this.props.title) {
      case 'Getting Started':
        return <img src="https://assets.quill.org/images/teacher_center/gettingstarted-gray.svg" />
      case 'Announcements':
        return <img src="https://assets.quill.org/images/teacher_center/announcement-gray.svg" />
      case 'Teacher Stories':
        return <img src="https://assets.quill.org/images/teacher_center/casestudies-gray.svg" />
      case 'Writing Instruction Research':
        return <img src="https://assets.quill.org/images/teacher_center/research-gray.svg" />
      case 'Press':
        return <img src="https://assets.quill.org/images/teacher_center/inthepress-gray.svg" />
      default:
        return ''
    }
  }

  render() {
    return (
      <section>
        <div className='meta'>
          <h1>{this.topicIcon()}{this.displayTitle()}</h1>
          <h2>{this.props.articleCount} {pluralize('article', this.props.articleCount)}</h2>
          <a href={`/${this.sectionLink()}/topic/${this.props.slug}`}>Show All</a>
        </div>
        <div id="preview-card-container">
          {this.renderArticleCards()}
        </div>
      </section>
    )
  }
}
