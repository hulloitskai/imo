# typed: true
# frozen_string_literal: true

class QuestSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :name, :description, :deadline
end
