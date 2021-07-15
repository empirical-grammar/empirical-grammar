module Comprehension
  class Feedback < ApplicationRecord
    MIN_FEEDBACK_LENGTH = 10 
    MAX_FEEDBACK_LENGTH = 500

    belongs_to :rule, inverse_of: :feedbacks
    has_many :highlights, inverse_of: :feedback, dependent: :destroy

    accepts_nested_attributes_for :highlights

    validates_presence_of :rule
    validates :text, presence: true, length: {minimum: MIN_FEEDBACK_LENGTH, maximum: MAX_FEEDBACK_LENGTH}
    validates :order, numericality: {only_integer: true, greater_than_or_equal_to: 0}, uniqueness: {scope: :rule_id}
    
    def serializable_hash(options = nil)
      options ||= {}

      super(options.reverse_merge(
        only: [:id, :rule_id, :text, :description, :order],
        include: [:highlights]
      ))
    end
  end
end
