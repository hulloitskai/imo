# typed: true
# frozen_string_literal: true

class QuestsController < ApplicationController
  # GET /quest/:id?ownership_token=...
  def show
    quest = Quest.find(params.fetch(:id))
    owned_quest = if (token = params[:ownership_token]) &&
        (found_quest = Quest.find_by_ownership_token(token))
      found_quest if found_quest.id == quest.id
    end
    render(inertia: "QuestPage", props: {
      quest: QuestSerializer.one(quest),
      milestones: MilestoneSerializer.many(quest.milestones),
      "ownershipToken" => owned_quest&.generate_ownership_token,
    })
  end

  # == Actions
  # POST /quests
  def create
    quest_params = params.expect(quest: [
      :name,
      :description,
      :deadline,
      milestones_attributes: [%i[
        number
        description
      ]],
    ])
    quest = Quest.create!(**quest_params)
    ownership_token = quest.generate_ownership_token
    render(
      json: {
        quest: QuestSerializer.one(quest),
        "ownershipToken" => ownership_token,
      },
      status: :created,
    )
  end
end
