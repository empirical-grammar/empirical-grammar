import React from 'react';
import pluralize from 'pluralize'
import PreviewCard from '../shared/preview_card.jsx';

export default class extends React.Component {
  renderArticleCards() {
    return this.props.articles.slice(0, 3).map(article =>
      <PreviewCard content={article.preview_card_content} link={`/teacher_resources/${article.slug}`} />
    )
  }

  render() {
    return (
      <section>
        <div className='meta'>
          <h1>{this.props.title}</h1>
          <h2>{this.props.articleCount} {pluralize('article', this.props.articleCount)}</h2>
          <a href={`/teacher_resources/topic/${this.props.title.toLowerCase().replace(/\s/g, '_')}`}>Show All</a>
        </div>
        <div id="preview-card-container">
          {this.renderArticleCards()}
        </div>
      </section>
    )
  }
}
