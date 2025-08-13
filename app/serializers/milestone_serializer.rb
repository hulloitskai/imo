# typed: true
# frozen_string_literal: true

class MilestoneSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :number,
             :description,
             completed?: { as: :completed, type: :boolean }
end
