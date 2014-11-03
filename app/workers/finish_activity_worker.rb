class FinishActivityWorker
  include Sidekiq::Worker

  def perform(uid)

    activity_session = ActivitySession.find_by_uid(uid)

    # set the time taken
    activity_session.calculate_time_spent!

    event_data = {
      event: 'finished',
      uid: activity_session.uid,
      time_spent: activity_session.time_spent,
      percentage: activity_session.percentage,
      percentile: activity_session.percentile,
      activity: ActivitySerializer.new(activity_session.activity),
      event_started: activity_session.created_at,
      event_finished: activity_session.completed_at
    }

    if activity_session.user_id.nil?
      event_data.merge!(anonymous: true)
    else
      event_data.merge!(anonymous: false, student: StudentSerializer.new(activity_session.user))
    end

    # publish event data
    Keen.publish(:activity_sessions, event_data)

    # add it to the student's scorebook
    #
    # anything else?

  end
end
