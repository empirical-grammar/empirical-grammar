# This migration comes from comprehension (originally 20200701183039)
class AddUidToTurkingRound < ActiveRecord::Migration
  def change
    add_column :comprehension_turking_rounds, :uuid, :uuid
    add_index :comprehension_turking_rounds, :uuid, unique: true
  end
end
