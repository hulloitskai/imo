# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: milestones
#
#  id           :uuid             not null, primary key
#  completed_at :datetime
#  description  :text             not null
#  number       :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  quest_id     :uuid             not null
#
# Indexes
#
#  index_milestones_on_number    (number)
#  index_milestones_on_quest_id  (quest_id)
#
# Foreign Keys
#
#  fk_rails_...  (quest_id => quests.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Milestone < ApplicationRecord
  # == Attributes
  sig { returns(T::Boolean) }
  def completed?
    completed_at?
  end

  # == Associations
  belongs_to :quest

  # == Validations
  validates :number, :description, presence: true
end
