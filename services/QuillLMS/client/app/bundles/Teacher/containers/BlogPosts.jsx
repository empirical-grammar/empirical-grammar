import React from 'react';
import ReactTable from 'react-table';
import CreateOrEditBlogPost from '../components/cms/blog_posts/create_or_edit_blog_post.jsx';
import BlogPostTable from '../components/cms/blog_posts/blog_post_table.jsx';
import BlogPostIndex from '../components/blog_posts/blog_post_index.jsx';
import BlogPost from '../components/blog_posts/blog_post.jsx';
import request from 'request';
import moment from 'moment';

export default class BlogPosts extends React.Component {
  confirmDelete(e) {
    if(window.prompt('To delete this post, please type DELETE.') !== 'DELETE') {
      e.preventDefault();
    }
  }

  renderBlogPostsByTopic = () => {
    const allTopics = this.props.topics.concat(this.props.studentTopics)
    const tables = allTopics.map(t => {
      const filteredBlogPosts = this.props.blogPosts.filter(bp => bp.topic === t)
      if (filteredBlogPosts.length > 0) {
        return (<BlogPostTable
          blogPosts={filteredBlogPosts}
          topic={t}
        />)
      }
    }
    )
    return tables
  };

  render() {
    if (['new', 'edit'].includes(this.props.action)) {
      return <CreateOrEditBlogPost {...this.props} />;
    } else if (this.props.route === 'show') {
      return <BlogPost {...this.props} />;
    } else if (this.props.route === 'index') {
      return <BlogPostIndex {...this.props} />;
    }
    return (
      <div className="cms-blog-posts">
        <a className="btn button-green" href="/cms/blog_posts/new">New Blog Post</a>
        <br /><br />
        {this.renderBlogPostsByTopic()}
      </div>
    );
  }
};
