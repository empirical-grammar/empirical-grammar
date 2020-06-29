require 'test_helper'

module Comprehension
  class RuleTest < ActiveSupport::TestCase


    context 'relationships' do
      should belong_to(:rule_set)
    end

    context 'validations' do
      should validate_presence_of(:rule_set)
      should validate_presence_of(:regex_text)
      should validate_length_of(:regex_text).is_at_most(200)
    end

    context 'custom validations' do
      setup do
        @rule_set = create(:comprehension_rule_set, name: 'Test Rule Set', feedback: 'Feedback' * 10, priority: 0)
        @rule = Rule.create(rule_set: @rule_set, regex_text: 'test regex')
      end

      should 'provide a default value for "case_sensitive"' do
        assert_equal @rule.case_sensitive, true
      end

      should 'not override a "case_sensitive" with the default if one is provided' do
        rule = Rule.create(rule_set: @rule_set, regex_text: 'test regex', case_sensitive: false)
        assert rule.valid?
        assert_equal rule.case_sensitive, false
      end

      should 'validate the presence of "case_sensitive"' do
        @rule.case_sensitive = nil
        assert_equal @rule.valid?, false
      end
    end
  end
end
