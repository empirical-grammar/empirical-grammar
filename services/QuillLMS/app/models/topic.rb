# == Schema Information
#
# Table name: topics
#
#  id         :integer          not null, primary key
#  level      :integer          not null
#  name       :string           not null
#  visible    :boolean          default(TRUE), not null
#  created_at :datetime
#  updated_at :datetime
#  parent_id  :integer
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => topics.id)
#
class Topic < ApplicationRecord
  validates :name, presence: true
  validates :visible, :inclusion => { :in => [true, false] } # presence: true doesn't work for booleans because false will fail
  validates_inclusion_of :level, :in => 0..3

  has_many :activity_topics, dependent: :destroy
  has_many :activities, through: :activity_topics
  has_many :change_logs, as: :changed_record

  accepts_nested_attributes_for :change_logs

  after_commit { Activity.clear_activity_search_cache }

  before_save :validate_parent_by_level

  def validate_parent_by_level
    # level 2s must have level 3 parent. all other levels must not have parent.
    if parent_id.present?
      return level == 2 && Topic.find(parent_id)&.level == 3
    else
      return level != 2
    end
  end
end
