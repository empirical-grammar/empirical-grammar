# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20200626181312) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "comprehension_activities", force: :cascade do |t|
    t.string   "title",              limit: 100
    t.integer  "parent_activity_id"
    t.integer  "target_level",       limit: 2
    t.string   "scored_level",       limit: 100
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "comprehension_activities", ["parent_activity_id"], name: "index_comprehension_activities_on_parent_activity_id", using: :btree

  create_table "comprehension_passages", force: :cascade do |t|
    t.integer  "activity_id"
    t.text     "text"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "comprehension_passages", ["activity_id"], name: "index_comprehension_passages_on_activity_id", using: :btree

  create_table "comprehension_prompts", force: :cascade do |t|
    t.integer  "activity_id"
    t.integer  "max_attempts",          limit: 2
    t.string   "conjunction",           limit: 20
    t.string   "text"
    t.text     "max_attempts_feedback"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  add_index "comprehension_prompts", ["activity_id"], name: "index_comprehension_prompts_on_activity_id", using: :btree

  create_table "comprehension_prompts_rule_sets", force: :cascade do |t|
    t.integer "prompt_id"
    t.integer "rule_set_id"
  end

  add_index "comprehension_prompts_rule_sets", ["prompt_id"], name: "index_comprehension_prompts_rule_sets_on_prompt_id", using: :btree
  add_index "comprehension_prompts_rule_sets", ["rule_set_id"], name: "index_comprehension_prompts_rule_sets_on_rule_set_id", using: :btree

  create_table "comprehension_rule_sets", force: :cascade do |t|
    t.integer  "activity_id"
    t.integer  "prompt_id"
    t.string   "name"
    t.string   "feedback"
    t.integer  "priority"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "comprehension_rule_sets", ["activity_id"], name: "index_comprehension_rule_sets_on_activity_id", using: :btree
  add_index "comprehension_rule_sets", ["prompt_id"], name: "index_comprehension_rule_sets_on_prompt_id", using: :btree

  create_table "comprehension_rules", force: :cascade do |t|
    t.integer  "rule_set_id"
    t.string   "regex_text"
    t.boolean  "case_sensitive"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  add_index "comprehension_rules", ["rule_set_id"], name: "index_comprehension_rules_on_rule_set_id", using: :btree

end
