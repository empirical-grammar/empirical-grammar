class Teachers::ProgressReports::Standards::ClassroomStudentsController < Teachers::ProgressReportsController
  include UnitsWithCompletedActivities

  def index
    respond_to do |format|
      format.html
      format.json do
        students = ::ProgressReports::Standards::Student.new(current_user).results(params)
        students_json = students.map do |student|
          serializer = ::ProgressReports::Standards::StudentSerializer.new(student)
          # Doing this because can't figure out how to get custom params into serializers
          serializer.classroom_id = params[:classroom_id]
          serializer.as_json(root: false)
        end

        cas = Classroom.where(id: params[:classroom_id]).includes(:classroom_activities).map(&:classroom_activities).flatten

        render json: {
          students: students_json,
          classroom: current_user.classrooms_i_teach.find(params[:classroom_id]),
          units: units_with_completed_activities(cas),
          teacher: UserWithEmailSerializer.new(current_user).as_json(root: false)
        }
      end
    end
  end
end
