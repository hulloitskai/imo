# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions
  # GET /
  def show
    render(inertia: "StartPage")
  end
end
