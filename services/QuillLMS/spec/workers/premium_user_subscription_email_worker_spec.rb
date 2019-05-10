require 'rails_helper'

describe PremiumUserSubscriptionEmailWorker do
  let(:subject) { described_class.new }

  describe '#perform' do
    let!(:user) { create(:user) }

    it 'should send the premium user subscription email' do
      expect_any_instance_of(User).to receive(:send_premium_user_subscription_email)
      subject.perform(user.id)
    end
  end
end
