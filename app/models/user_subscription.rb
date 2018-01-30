class UserSubscription < ActiveRecord::Base
  validates :user_id, :subscription_id, presence: true
  belongs_to :user
  belongs_to :subscription
  after_commit :send_premium_emails, on: :create

  def self.update_or_create(user_id, subscription_id)

      user_sub = self.find_or_initialize_by(user_id: user_id)
      user_sub.subscription_id = subscription_id
      user_sub.save!
  end

  def self.create_user_sub_from_school_sub(user_id, subscription_id)
      self.redeem_present_and_future_subscriptions_for_credit(user_id)
      # create a new user sub pointing at the school
      self.create(user_id: user_id, subscription_id: subscription_id)
  end

  def send_premium_emails
    if Rails.env.production? || User.find(user_id).email.match('quill.org')
      if subscription.account_type.downcase != 'teacher trial' && subscription.school_subscriptions.empty?
        PremiumUserSubscriptionEmailWorker.perform_async(user_id)
      elsif subscription.account_type.downcase != 'teacher trial'
        PremiumSchoolSubscriptionEmailWorker.perform_async(user_id)
      end
    end
  end

  def self.redeem_present_and_future_subscriptions_for_credit(user_id)
    # iterate through all remaining subs and convert them into credit
    p_and_f_subs = User.find(user_id).present_and_future_subscriptions
    if p_and_f_subs.any?
      additional_credit = 0
      p_and_f_subs.each do |sub|
        # find later of start date or today's date
        credit_start = [sub.start_date, Date.today].max
        # add remaining time on each sub to creditDate
        credit_end = sub.expiration
        additional_credit = additional_credit + (credit_end - credit_start)
        sub.update(expiration: Date.today)
      end
      if additional_credit > 0
        return additional_credit
        # TODO: execute credit action
      end
    end
  end



end
