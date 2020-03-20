import React from 'react';
import BlogPostRow from './blog_post_row.jsx';
import SortableList from '../../shared/sortableList'
import request from 'request';
import moment from 'moment';
import getAuthToken from '../../modules/get_auth_token';

export default class BlogPostTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {blogPosts: props.blogPosts.sort((bp1, bp2) => bp1.order_number - bp2.order_number)}
  }

  confirmDelete(e) {
    if(window.prompt('To delete this post, please type DELETE.') !== 'DELETE') {
      e.preventDefault();
    }
  }

  saveOrder = () => {
    const link = `${process.env.DEFAULT_URL}/cms/blog_posts/update_order_numbers`
    const data = new FormData();
    data.append( "blog_posts", JSON.stringify(this.state.blogPosts) );
    fetch(link, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      body: data,
      headers: {
        'X-CSRF-Token': getAuthToken()
      }
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    }).then((response) => {
      alert(`Order for ${this.props.topic} blog posts has been saved.`)
    }).catch((error) => {
      // to do, use Sentry to capture error
    })
  };

  updateOrder = sortInfo => {
    const originalOrder = this.state.blogPosts;
    const newOrder = sortInfo.data.items.map(item => item.key);
    const newOrderedBlogPosts = newOrder.map((key, i) => {
      const newBlogPost = originalOrder[key];
      newBlogPost.order_number = i;
      return newBlogPost;
    });
    this.setState({blogPosts: newOrderedBlogPosts});
  };

  renderTableHeader() {
    return (<tr>
      <th />
      <th>Title</th>
      <th>Topic</th>
      <th>Created</th>
      <th>Updated</th>
      <th>Rating</th>
      <th>Views</th>
      <th />
      <th />
      <th />
    </tr>)
  }

  renderTableRow(blogPost, index) {
    return (<BlogPostRow
      createdAt={moment(blogPost.created_at).format('MM-DD-YY')}
      deleteLink={`/cms/blog_posts/${blogPost.id}/delete`}
      draft={blogPost.draft ? 'DRAFT' : ''}
      editLink={`/cms/blog_posts/${blogPost.id}/edit`}
      key={index}
      previewLink={blogPost.external_link ? blogPost.external_link : `/teacher-center/${blogPost.slug}`}
      rating={blogPost.rating}
      title={blogPost.title}
      topic={blogPost.topic}
      updatedAt={moment(blogPost.updated_at).format('MM-DD-YY')}
      views={blogPost.read_count}
    />)
  }

  render() {
    const blogPostRows = this.state.blogPosts.map((bp, i) => this.renderTableRow(bp, i))
    return (<div>
      <h1>{this.props.topic} <span className="save-order" onClick={this.saveOrder}>Save Order</span></h1>
      <div className="blog-post-table">
        <table>
          {this.renderTableHeader()}
          <SortableList data={blogPostRows} sortCallback={this.updateOrder} />
        </table>
      </div>
    </div>)
  }
};
