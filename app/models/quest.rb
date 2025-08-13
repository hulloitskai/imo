# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: quests
#
#  id          :uuid             not null, primary key
#  deadline    :datetime         not null
#  description :text             not null
#  name        :text             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Quest < ApplicationRecord
  generates_token_for :ownership

  # == Associations
  has_many :milestones, dependent: :destroy
  accepts_nested_attributes_for :milestones

  # == Validations
  validates :name, :description, :deadline, :milestones, presence: true

  # == Ownership
  sig { returns(String) }
  def generate_ownership_token
    generate_token_for(:ownership)
  end

  sig { params(token: String).returns(Quest) }
  def self.find_by_ownership_token!(token)
    find_by_token_for!(:ownership, token)
  end

  sig { params(token: String).returns(T.nilable(Quest)) }
  def self.find_by_ownership_token(token)
    find_by_token_for(:ownership, token)
  end
end
