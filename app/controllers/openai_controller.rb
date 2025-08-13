# typed: true
# frozen_string_literal: true

require "openai"

class OpenaiController < ApplicationController
  extend T::Sig

  # == Prompts
  EXPLORE_PROMPT_ID = "pmpt_688f7b838bc881948f44796b2a2f346c06603bd4ac233e59"
  VALUES_PROMPT_ID = "pmpt_688f87bd27408197a3a62f7afd64d60d0c216644b938783c"
  CHALLENGES_PROMPT_ID = "pmpt_688f91907b2c8193babf232fa293a7bd0501849131e10741"

  # == Actions
  sig { void }
  def explore_chat
    messages = extract_messages_param
    response = openai_client.responses.create(
      prompt: { id: EXPLORE_PROMPT_ID },
      input: messages.map do |message|
        OpenAI::Models::Responses::EasyInputMessage.new(**message)
      end,
    )
    text = T.unsafe(response).output.first.content.first.text
    render(json: { "outputText" => text })
  end

  sig { void }
  def generate_values_questions
    interview_messages = extract_user_problem_interview_messages_param
    response = openai_client.responses.create(
      prompt: { id: VALUES_PROMPT_ID },
      input: JSON.generate({
        userProblemInterviewMessages: interview_messages,
      }),
    )
    text = T.unsafe(response).output.first.content.first.text
    result = safely_parse_json(text)
    render(json: result)
  end

  sig { void }
  def generate_challenges
    interview_messages = extract_user_problem_interview_messages_param
    values_choices = extract_values_discovery_questions_param
    response = openai_client.responses.create(
      prompt: { id: CHALLENGES_PROMPT_ID },
      input: JSON.generate({
        userProblemInterviewMessages: interview_messages,
        valuesDiscoveryQuestions: values_choices,
      }),
    )
    text = T.unsafe(response).output.first.content.first.text
    result = safely_parse_json(text)
    render(json: result)
  end

  private

  # == OpenAI
  sig { returns(OpenAI::Client) }
  def openai_client
    @openai_client ||= OpenAI::Client.new(
      api_key: Rails.application.credentials.openai!.api_key!,
    )
  end

  # == Helpers
  sig { returns(T::Array[{ role: String, content: String }]) }
  def extract_messages_param
    raw = params.permit(messages: %i[role content]).to_h[:messages]
    array = raw.is_a?(Array) ? raw : []
    array.filter_map do |item|
      role = item["role"] || item[:role]
      content = item["content"] || item[:content]
      next if role.nil? || content.nil?

      { role:, content: }
    end
  end

  sig { returns(T::Array[{ role: String, content: String }]) }
  def extract_user_problem_interview_messages_param
    raw = params[:user_problem_interview_messages]
    array = raw.is_a?(Array) ? raw : []
    array.filter_map do |item|
      role = item["role"] || item[:role]
      content = item["content"] || item[:content]
      next if role.nil? || content.nil?

      { role:, content: }
    end
  end

  sig { returns(T::Hash[String, String]) }
  def extract_values_discovery_questions_param
    raw = params[:values_discovery_questions]
    if raw.is_a?(Hash)
      raw.to_h.transform_keys(&:to_s).transform_values(&:to_s)
    else
      {}
    end
  end

  sig { params(input: T.anything).returns(T::Hash[String, T.untyped]) }
  def safely_parse_json(input)
    if String === input
      JSON.parse(input)
    else
      {}
    end
  end
end
