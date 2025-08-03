# typed: strict
# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    extend T::Sig
    extend T::Helpers

    # == Connection
    sig { void }
    def connect
      # if (friend = find_verified_friend) || (user = find_verified_user)
      #   self.current_friend = friend
      #   self.current_user = user
      # else
      #   reject_unauthorized_connection
      # end
    end
  end
end
