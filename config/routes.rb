# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects
  constraints SubdomainConstraint do
    get "(*any)" => redirect(subdomain: "", status: 302)
  end

  # == Errors
  scope controller: :errors do
    match "/401", action: :unauthorized, via: :all
    match "/404", action: :not_found, via: :all
    match "/422", action: :unprocessable_entity, via: :all
    match "/500", action: :internal_server_error, via: :all
  end

  # == Healthcheck
  defaults export: true do
    Healthcheck.routes(self)
  end

  # == Good Job
  mount GoodJob::Engine => "/good_job"

  # == Attachments
  resources :files, only: :show, param: :signed_id, export: true
  resources :images, only: :show, param: :signed_id, export: true do
    member do
      get :download
    end
  end

  # == Quests
  resources :quests, only: %i[show create], export: true

  # == Contact
  resource :contact_url, only: :show, export: { namespace: "contact_url" }

  # == Pages
  root "start#show", export: true
  get "/src" => redirect(
    "https://github.com/hulloitskai/imo",
    status: 302,
  )
  get "/sentry" => redirect(
    "https://imo.sentry.io/issues/",
    status: 302,
  )

  # == OpenAI
  resource :openai, controller: "openai", only: [], export: true do
    post :explore_chat
    post :generate_values_questions
    post :generate_challenges
  end

  # == Devtools
  if Rails.env.development?
    resource(
      :test,
      controller: "test",
      only: :show,
      export: { namespace: "test" },
    ) do
      post :submit
    end
    get "/mailcatcher" => redirect("//localhost:1080", status: 302)
  end
end
