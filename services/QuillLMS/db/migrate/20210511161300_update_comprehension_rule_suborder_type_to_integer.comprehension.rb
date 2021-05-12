# This migration comes from comprehension (originally 20210511160025)
class UpdateComprehensionRuleSuborderTypeToInteger < ActiveRecord::Migration
  def change
    change_column :comprehension_rules, :suborder, 'integer USING CAST(suborder AS integer)', null: true
  end
end
