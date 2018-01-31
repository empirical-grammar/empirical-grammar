class BlogPostsController < ApplicationController
  before_action :set_blog_post, only: [:show]

  def index
    @blog_posts = BlogPost.all
    #blog_posts/index.html.erb
  end

  def show
  end


  private

  def set_blog_post
    @blog_post = BlogPost.find(params[:id])
  end

end
