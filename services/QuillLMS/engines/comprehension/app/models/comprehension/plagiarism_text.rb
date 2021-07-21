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

    private def log_creation
      ChangeLog.log_change(nil, :update_plagiarism_text, self, {url: rule.url}.to_json, "text", nil, text)
    end

    private def log_deletion
    end

    def log_update
      if text_changed?
        ChangeLog.log_change(nil, :update_plagiarism_text, self, {url: rule.url}.to_json, "text", text_was, text)
      end
    end
  end
end
