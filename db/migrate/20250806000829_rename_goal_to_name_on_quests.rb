# typed: true
# frozen_string_literal: true

class RenameGoalToNameOnQuests < ActiveRecord::Migration[8.0]
  def change
    rename_column :quests, :goal, :name
  end
end
