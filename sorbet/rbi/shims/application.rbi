# typed: strong

module Rails
  class << self
    sig { returns(Imo::Application) }
    def application; end
  end
end
