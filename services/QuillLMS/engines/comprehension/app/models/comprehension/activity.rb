module Comprehension

  class Activity < ActiveRecord::Base
    include Comprehension::ChangeLog

    MIN_TARGET_LEVEL = 1
    MAX_TARGET_LEVEL = 12
    MIN_TITLE_LENGTH = 5
    MAX_TITLE_LENGTH = 100
    MAX_SCORED_LEVEL_LENGTH = 100

    after_create :log_creation
    before_destroy :expire_turking_rounds
    after_destroy :log_deletion
    before_validation :set_parent_activity, on: :create

    has_many :passages, inverse_of: :activity, dependent: :destroy
    has_many :prompts, inverse_of: :activity, dependent: :destroy
    has_many :turking_rounds, inverse_of: :activity
    has_many :change_logs
    belongs_to :parent_activity, class_name: Comprehension.parent_activity_class

    accepts_nested_attributes_for :passages, reject_if: proc { |p| p['text'].blank? }
    accepts_nested_attributes_for :prompts

    validates :parent_activity_id, uniqueness: {allow_nil: true}
    validates :target_level, presence: true,
      numericality: {
        only_integer: true,
        less_than_or_equal_to: MAX_TARGET_LEVEL,
        greater_than_or_equal_to: MIN_TARGET_LEVEL
      }
    validates :title, presence: true, length: {in: MIN_TITLE_LENGTH..MAX_TITLE_LENGTH}
    validates :name, presence: true, length: {in: MIN_TITLE_LENGTH..MAX_TITLE_LENGTH}
    validates :scored_level, length: { maximum: MAX_SCORED_LEVEL_LENGTH, allow_nil: true}

    def set_parent_activity
      if parent_activity_id
        self.parent_activity = Comprehension.parent_activity_class.find_by_id(parent_activity_id)
      else
        self.parent_activity = Comprehension.parent_activity_class.find_or_create_by(
          name: title,
          activity_classification_id: Comprehension.parent_activity_classification_class.comprehension&.id
        )
      end
    end

    # match signature of method
    def serializable_hash(options = nil)
      options ||= {}
      super(options.reverse_merge(
        only: [:id, :parent_activity_id, :title, :name, :target_level, :scored_level],
        include: [:passages, :prompts]
      ))
    end

    private def expire_turking_rounds
      turking_rounds.each(&:expire!)
    end

    private def log_creation
      log_change(:create_activity, self)
    end

    private def log_deletion
      log_change(:delete_activity, self)
    end
  end
end
