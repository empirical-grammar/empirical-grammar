class ContentPartner < ActiveRecord::Base
  has_many :content_partner_activities, dependent: :destroy
  has_many :activities, :through => :content_partner_activities

  validates :name, presence: true

  after_commit 'Activity.clear_activity_search_cache'
end
