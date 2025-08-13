# typed: true
# frozen_string_literal: true

class RenameChallengeIdToQuestIdOnMilestones < ActiveRecord::Migration[8.0]
  def change
    rename_column :milestones, :challenge_id, :quest_id
  end
end
