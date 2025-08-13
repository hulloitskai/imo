# typed: true
# frozen_string_literal: true

class CreateChallengeSteps < ActiveRecord::Migration[8.0]
  def change
    create_table :challenge_steps, id: :uuid do |t|
      t.string :number
      t.timestamptz :completed_at
      t.belongs_to :challenge, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end
    add_index :challenge_steps, :number
  end
end
