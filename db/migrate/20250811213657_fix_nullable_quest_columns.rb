# typed: true
# frozen_string_literal: true

class FixNullableQuestColumns < ActiveRecord::Migration[8.0]
  def change
    change_column_null :quests, :name, false
    change_column_null :quests, :description, false
    change_column_null :quests, :deadline, false
  end
end
