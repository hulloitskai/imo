# typed: true
# frozen_string_literal: true

class CreateChallenges < ActiveRecord::Migration[8.0]
  def change
    create_table :challenges, id: :uuid do |t|
      t.text :goal
      t.text :description
      t.timestamptz :deadline

      t.timestamps
    end
  end
end
