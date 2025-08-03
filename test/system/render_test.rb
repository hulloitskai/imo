# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class RenderTest < ApplicationSystemTestCase
  # == Tests
  test "renders start page" do
    visit(root_url)
    assert_selector("#app")
    assert_not_empty(find_by_id("app").find_all("*"))
  end
end
