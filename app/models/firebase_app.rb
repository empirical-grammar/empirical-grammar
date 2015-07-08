require 'firebase_token_generator'

class FirebaseApp < ActiveRecord::Base

  def token_for(user)
    payload = {uid: user.present? ? user.id.to_s : ''}

    if user.nil?
      payload[:anonymous] = true
    elsif user.admin?
      payload[:admin] = true
    elsif user.teacher?
      payload[:teacher] = true
    elsif user.student?
      payload[:student] = true
    end

    token_generator.create_token(payload)
  end

  private

  def token_generator
    @generator ||= Firebase::FirebaseTokenGenerator.new(secret)
  end
end