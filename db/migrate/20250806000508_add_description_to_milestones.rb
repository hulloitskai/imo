# typed: true
# frozen_string_literal: true

class AddDescriptionToMilestones < ActiveRecord::Migration[8.0]
  def change
    add_column :milestones, :description, :text, null: false
    change_column_null :milestones, :number, false
  end
end
