# This migration comes from comprehension (originally 20200630161345)
class CreateComprehensionTurkingRounds < ActiveRecord::Migration
  def change
    create_table :comprehension_turking_rounds do |t|
      t.integer :activity_id
      t.datetime :expires_at

      t.timestamps null: false
    end
    add_index :comprehension_turking_rounds, :activity_id
  end
end
