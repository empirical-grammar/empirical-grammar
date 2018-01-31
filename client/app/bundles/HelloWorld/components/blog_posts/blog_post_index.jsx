import React from 'react';
import TopicSection from './topic_section.jsx';
import PreviewCard from '../shared/preview_card.jsx';
import _ from 'underscore';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articleFilter: 'all',
      loading: true
    };
  }

  filterArticlesBy(filter) {
    this.setState({ articleFilter: filter });
  }

  renderPreviewCards() {
    // todo use spread operator
    return this.props.blogPosts.map(article =>
      <PreviewCard content={article.preview_card_content} />
    )
  }

  renderPreviewCardsByTopic() {
    let sections = [];
    const articlesByTopic = _.groupBy(this.props.blogPosts, "topic");
    for(let topic in articlesByTopic) {
      var articlesInThisTopic = articlesByTopic[topic];
      sections.push(<TopicSection
          key={topic}
          title={topic}
          articles={articlesInThisTopic}
          articleCount={articlesInThisTopic.length}
        />
      );
    }
    return sections;
  }

  renderBasedOnArticleFilter() {
    let response;
    if(this.state.articleFilter === 'topic') {
      response = this.renderPreviewCardsByTopic();
    } else if(this.state.articleFilter === 'popularity') {
      response = <h1>most read</h1>
    } else {
      response = (
        <div id="article-container">
          {this.renderPreviewCards()}
        </div>
      )
    }
    return <main>{response}</main>
  }

  render() {
    return (
      <div id="knowledge-center">
        <header>
          <div className='container'>
            <h1>Knowledge Center</h1>
            <h2>Everything you need to know about Quill's pedgagogy and use in the classroom</h2>
            <div className='width-422'>
              <input type="text" placeholder="Search for posts" />
              <h3 className='most-read-post'>Most Read Post:</h3>
              <h3><a href="#">TODO: put the actual post here</a></h3>
            </div>
          </div>
        </header>
        <nav>
          <ul>
            <li className={this.state.articleFilter === 'all' ? 'active' : null} onClick={() => this.filterArticlesBy('all')}>All Articles</li>
            <li className={this.state.articleFilter === 'topic' ? 'active' : null} onClick={() => this.filterArticlesBy('topic')}>Topics</li>
            <li className={this.state.articleFilter === 'popularity' ? 'active' : null} onClick={() => this.filterArticlesBy('popularity')}>Most Read</li>
          </ul>
        </nav>
        {this.renderBasedOnArticleFilter()}
      </div>
    );
  }
}
