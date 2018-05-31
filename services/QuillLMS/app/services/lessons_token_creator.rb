require 'jwt'

class LessonsTokenCreator
  def initialize(user, classroom_activity_id)
    @user = user
    @classroom_activity_id = classroom_activity_id
  end

  def create
    JWT.encode(payload, private_key, 'RS256')
  end

  private

  def payload
    {
      data: data,
      exp: exp
    }
  end

  def exp
    Time.now.to_i + 4 * 3600
  end

  def data
    {
      user_id:               user_id,
      role:                  user_role,
      classroom_activity_id: classroom_activity_id
    }
  end

  def user_id
    if @user.present?
      @user.id
    else
      ''
    end
  end

  def user_role
    if @user.present?
      @user.role
    else
      'anonymous'
    end
  end

  def classroom_activity_id
    if valid_classroom_activity?
      classroom_activity.id
    else
      ''
    end
  end

  def valid_classroom_activity?
    classroom_activity.present? && (student_assigned? || teachers_activity?)
  end

  def student_assigned?
    classroom_activity.assigned_student_ids.include? user_id
  end

  def teachers_activity?
    classroom_activity.classroom.teachers.pluck(:id).include? user_id
  end

  def classroom_activity
    @classroom_activity ||= ClassroomActivity.find_by(id: @classroom_activity_id)
  end

  def private_key
    @private_key ||= OpenSSL::PKey::RSA.new(ENV['LESSONS_PRIVATE_KEY'])
  end
end
