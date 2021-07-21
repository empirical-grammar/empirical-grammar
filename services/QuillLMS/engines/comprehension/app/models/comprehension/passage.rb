module Comprehension
  class Passage < ActiveRecord::Base
    include Comprehension::ChangeLog

    MIN_TEXT_LENGTH = 50

    belongs_to :activity, inverse_of: :passages

    validates_presence_of :activity
    validates :text, presence: true, length: {minimum: MIN_TEXT_LENGTH}

    def serializable_hash(options = nil)
      options ||= {}
      super(options.reverse_merge(
        only: [:id, :text, :image_link, :image_alt_text]
      ))
    end

    private def log_creation
      ChangeLog.log_change(nil, :update_passage, self, {url: activity.url}.to_json, "text", nil, text)
    end

    private def log_deletion
    end

    private def log_update
      if text_changed?
        ChangeLog.log_change(nil, :update_passage, self, {url: activity.url}.to_json, "text", text_was, text)
      end
    end
  end
end
