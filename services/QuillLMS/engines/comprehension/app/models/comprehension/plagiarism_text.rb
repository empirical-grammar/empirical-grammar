module Comprehension
  class PlagiarismText < ActiveRecord::Base
    include Comprehension::ChangeLog

    belongs_to :rule, inverse_of: :plagiarism_text

    validates_presence_of :rule
    validates :text, presence: true

    def serializable_hash(options = nil)
      options ||= {}
      super(options.reverse_merge(
        only: [:id, :rule_id, :text]
      ))
    end

    def change_log_name
      "Plagiarism Rule Text"
    end

    def url
      rule.url
    end

    private def log_creation
      log_change(nil, :update, self, {url: rule.url}.to_json, "text", nil, text)
    end

    def log_update
      return unless text_changed?
      log_change(nil, :update, self, {url: rule.url}.to_json, "text", text_was, text)
    end
  end
end
