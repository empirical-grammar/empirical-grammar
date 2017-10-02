class ProfilesController < ApplicationController
  before_filter :signed_in!

  def show
    @user = current_user
    if current_user.role == 'student'
      @firewall_test = true
      @js_file = 'student'
      if current_user.classrooms.any?
        render 'student'
      else
        render 'students_classrooms/add_classroom'
      end
    else
      send current_user.role
    end
  end

  def user
    student
  end

  def student_profile_data
    if current_user.classrooms.any?
      render json: {scores: student_profile_data_sql(params[:current_classroom_id]), next_activity_session: next_activity_session, student: student_data}
    else
      render json: {error: 'Current user has no classrooms'}
    end
  end

  def get_mobile_profile_data
    if current_user.classrooms.any?
      grouped_scores = get_parsed_mobile_profile_data(params[:current_classroom_id])
      render json: {grouped_scores: grouped_scores}
    else
      render json: {error: 'Current user has no classrooms'}
    end
  end

  def students_classrooms_json
    render json: {classrooms: students_classrooms_with_join_info}
  end

  def teacher
    if @user.classrooms_i_teach.any? || @user.archived_classrooms.any?
      redirect_to dashboard_teachers_classrooms_path
    else
      redirect_to new_teachers_classroom_path
    end
  end

  def admin
    render :admin
  end

  def staff
    render :staff
  end

protected
  def user_params
    params.require(:user).permit(:classcode, :email, :name, :username, :password)
  end

  def student_data
    {
      name: current_user.name,
      classroom: {
        name: @current_classroom.name,
        id: @current_classroom.id,
        teacher: {
          name: @current_classroom.teacher.name
        }
      },
    }
  end

  def students_classrooms_with_join_info
    ActiveRecord::Base.connection.execute(
    "SELECT classrooms.name AS name, teacher.name AS teacher, classrooms.id AS id FROM classrooms
      JOIN students_classrooms AS sc ON sc.classroom_id = classrooms.id
      JOIN users AS teacher ON teacher.id = classrooms.teacher_id
      WHERE sc.student_id = #{current_user.id}
      AND classrooms.visible = true
      ORDER BY sc.created_at ASC").to_a
  end

  def student_profile_data_sql(classroom_id=nil)
    @current_classroom = current_classroom(classroom_id)
    @act_sesh_records = ActiveRecord::Base.connection.execute(
    "SELECT unit.name,
       activity.name,
       activity.description,
       activity.repeatable,
       activity.activity_classification_id,
       activity.repeatable,
       unit.id AS unit_id,
       unit.created_at AS unit_created_at,
       unit.name AS unit_name,
       ca.id AS ca_id,
       acts.activity_id,
       MAX(acts.updated_at) AS act_sesh_updated_at,
       ca.due_date,
       ca.created_at AS classroom_activity_created_at,
       ca.locked,
       ca.pinned,
       MAX(acts.percentage) AS max_percentage,
       SUM(CASE WHEN acts.state = 'started' THEN 1 ELSE 0 END) AS resume_link
    FROM activity_sessions AS acts
    JOIN classroom_activities AS ca ON ca.id = acts.classroom_activity_id
    JOIN units AS unit ON unit.id = ca.unit_id
    JOIN activities AS activity ON activity.id = ca.activity_id
    WHERE acts.user_id = #{current_user.id}
    AND ca.classroom_id = #{@current_classroom.id}
    AND acts.visible = true
    AND ca.visible = true
    AND unit.visible = true
    GROUP BY ca.id, activity.name, activity.description, acts.activity_id,
            unit.name, unit.id, unit.created_at, unit_name, activity.repeatable,
            activity.activity_classification_id, activity.repeatable
    ORDER BY pinned DESC, locked ASC, max_percentage DESC, unit.created_at ASC, ca.created_at ASC
            ").to_a
  end

  def next_activity_session
    # We only need to check the first activity session record here because of
    # the order in which the the query returns these.
    if @act_sesh_records.any?
      @act_sesh_records.first['max_percentage'] ? nil : @act_sesh_records.first
    end
  end

  def get_parsed_mobile_profile_data(classroom_id)
    # classroom = current_classroom(classroom_id)
    Profile::Mobile::ActivitySessionsByUnit.new.query(current_user, classroom_id)
  end

  def current_classroom(classroom_id = nil)
    if !classroom_id
       current_user.classrooms.last
    else
      Classroom.find(classroom_id.to_i) if !!classroom_id
    end
  end
end
