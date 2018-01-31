class Cms::BlogPostsController < ApplicationController
  before_filter :staff!
  before_action :set_blog_post, only: [:update, :destroy, :edit, :show]
  before_action :authors, :topics, only: [:edit, :new]

  def index
    @blog_posts_name_and_id = BlogPost.all.select('title', 'id', 'updated_at', 'created_at', 'topic')
    #cms/blog_posts/index.html.erb
  end

  def new
    #cms/blog_posts/new.html.erb
  end

  def edit
    #cms/blog_posts/edit.html.erb
  end

  def create
    blog_post = BlogPost.create(blog_post_params)
    render json: blog_post
  end

  def update
    @blog_post.update(blog_post_params)
    render json: @blog_post
  end

  def destroy
    @blog_post.destroy
    redirect_to cms_blog_posts_path
  end

  private

  def authors
    @authors = Author.all.select('name', 'id')
  end

  def blog_post_params
    params.require(:blog_post)
            .permit(:id,
                    :body,
                    :title,
                    :subtitle,
                    :author_id,
                    :topic,
                    :read_count,
                    :preview_card_content)
  end

  def set_blog_post
    @blog_post = BlogPost.find(params[:id])
  end

  def topics
    @topics = BlogPost::TOPICS
  end
end
