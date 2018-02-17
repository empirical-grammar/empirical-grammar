require 'rails_helper'

describe BlogPost, type: :model do
  let(:blog_post) { create(:blog_post) }

  describe '#increment_read_count' do
    it 'should increment the view count by 1' do
      previous_read_count = blog_post.read_count
      blog_post.increment_read_count
      expect(blog_post.reload.read_count).to eq(previous_read_count + 1)
    end
  end

  describe '#path' do
    it 'should return the slug prefixed by the teacher resources path' do
      expect(blog_post.path).to eq("/teacher_resources/#{blog_post.slug}")
    end
  end

  describe '#topic_path' do
    it 'should return the path of the associated topic' do
      expect(blog_post.topic_path).to eq("/teacher_resources/topic/#{blog_post.topic_slug}")
    end
  end

  describe '#topic_slug' do
    it 'should return the slug of the associated topic' do
      expect(blog_post.topic_slug).to eq(blog_post.topic.downcase.gsub(' ', '_'))
    end
  end

  describe '#generate_slug' do
    let(:title) { blog_post.title }
    let(:slug) { title.gsub(/[^a-zA-Z\d\s]/, '').gsub(' ', '-').downcase }
    let(:blog_post_with_same_title) { create(:blog_post, title: title) }
    let(:another_blog_post_with_same_title) { create(:blog_post, title: blog_post_with_same_title.title) }

    it 'should generate an appropriately formatted slug' do
      expect(blog_post.slug).to eq(slug)
    end

    it 'should add append a number if the slug already exists' do
      expect(blog_post_with_same_title.slug).to eq("#{slug}-2")
    end

    it 'should increment the appended number of the slug that already exists' do
      expect(another_blog_post_with_same_title.slug).to eq("#{slug}-3")
    end
  end
end
