module Comprehension
  class Rule < ActiveRecord::Base
    MAX_NAME_LENGTH = 250
    ALLOWED_BOOLEANS = [true, false]
    STATES = [
      STATE_ACTIVE = 'active',
      STATE_INACTIVE = 'inactive'
    ]
    TYPES= [
      TYPE_AUTOML = 'autoML',
      TYPE_GRAMMAR = 'grammar',
      TYPE_OPINION = 'opinion',
      TYPE_PLAGIARISM = 'plagiarism',
      TYPE_REGEX = 'rules-based',
      TYPE_SPELLING = 'spelling'
    ]
    before_validation :assign_uid_if_missing

    has_many :feedbacks, inverse_of: :rule, dependent: :destroy
    has_one :plagiarism_text, inverse_of: :rule, dependent: :destroy
    has_one :label, inverse_of: :rule, dependent: :destroy
    has_many :prompts_rules, inverse_of: :rule
    has_many :prompts, through: :prompts_rules, inverse_of: :rules
    has_many :regex_rules, inverse_of: :rule, dependent: :destroy

    accepts_nested_attributes_for :plagiarism_text
    accepts_nested_attributes_for :feedbacks
    accepts_nested_attributes_for :label
    accepts_nested_attributes_for :regex_rules

    validates :uid, presence: true, uniqueness: true
    validates :name, presence: true, length: {maximum: MAX_NAME_LENGTH}
    validates :universal, inclusion: ALLOWED_BOOLEANS
    validates :optimal, inclusion: ALLOWED_BOOLEANS
    validates :rule_type, inclusion: {in: TYPES}
    validates :state, inclusion: {in: STATES}
    validates :suborder, numericality: {only_integer: true, greater_than_or_equal_to: 0}
    validates :suborder, numericality: {allow_blank: true, only_integer: true, greater_than_or_equal_to: 0}

    def serializable_hash(options = nil)
      options ||= {}

      super(options.reverse_merge(
        only: [:id, :uid, :name, :description, :universal, :rule_type, :optimal, :state, :suborder, :concept_uid, :prompt_ids],
        include: [:plagiarism_text, :feedbacks, :label, :regex_rules],
        methods: :prompt_ids
      ))
    end

    def determine_feedback_from_history(feedback_history)
      relevant_history = feedback_history.filter { |fb| fb['feedback_type'] == rule_type }
      relevant_feedback_text = relevant_history.map { |fb| fb['feedback'] }

      first_unused = feedbacks.where.not(text: relevant_feedback_text).order(:order).first
      return first_unused || feedbacks.order(order: :desc).first
    end

    def regex_is_passing?(entry)
      regex_rules.none? do |regex_rule|
        regex_rule.sequence_type == RegexRule::TYPE_INCORRECT ? Regexp.new(regex_rule.regex_text).match(entry) : !Regexp.new(regex_rule.regex_text).match(entry)
      end
    end

    private def assign_uid_if_missing
      self.uid ||= SecureRandom.uuid
    end
  end
end
