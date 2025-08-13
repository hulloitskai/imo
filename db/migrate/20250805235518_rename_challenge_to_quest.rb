# typed: true
# frozen_string_literal: true

class RenameChallengeToQuest < ActiveRecord::Migration[8.0]
  def change
    rename_table :challenge_steps, :milestones
    rename_table :challenges, :quests
  end
end
