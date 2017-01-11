class Teachers::UnitsController < ApplicationController
  include Units

  respond_to :json
  before_filter :teacher!

  def create
    units_with_same_name = units_with_same_name_by_current_user(unit_params[:name], current_user.id)
    if units_with_same_name.any?
      Units::Updater.run(units_with_same_name.first, unit_params[:activities], unit_params[:classrooms])
    else
      Units::Creator.run(current_user, unit_params[:name], unit_params[:activities], unit_params[:classrooms])
    end
    render json: {}
  end

  def unit_names
    render json: { unitNames: current_user.units.map { |unit| unit.name.downcase }.uniq }.to_json
  end


  def index
    cas = current_user.classrooms_i_teach.includes(:students, classroom_activities: [{activity: :classification}, :topic]).map(&:classroom_activities).flatten
    units = cas.group_by{|ca| ca.unit_id}
    arr = []
    units.each do |unit_id, classroom_activities|

      if params[:report]
        classroom_activities =  classroom_activities.select{|ca| ca.has_a_completed_session? && ca.from_valid_date_for_activity_analysis?}
        next if classroom_activities.empty?
      end


      x1 = classroom_activities.compact

      x1 = ClassroomActivitySorter::sort(x1)

      x1 = x1.map{|ca| (ClassroomActivitySerializer.new(ca)).as_json(root: false)}

      classrooms = x1.map{|ca| ca[:classroom]}.compact.uniq

      assigned_student_ids = []

      classroom_activities.each do |ca|
        if ca.assigned_student_ids.nil? or ca.assigned_student_ids.length == 0
          y = ca.classroom.students.map(&:id)
        else
          y = ca.assigned_student_ids
        end
        assigned_student_ids = assigned_student_ids.concat(y)
      end

      num_students_assigned = assigned_student_ids.uniq.length

      x1 = x1.uniq{|y| y[:activity_id] }

      unit = Unit.where(id: unit_id).first
      if unit.present?
        ele = {unit: unit, classroom_activities: x1, num_students_assigned: num_students_assigned, classrooms: classrooms}
        arr.push ele
      end
    end

    arr1, arr2 = arr.partition{|a| a[:unit].created_at.present? }
    arr1 = arr1.sort_by{|ele| ele[:unit].created_at}.reverse
    render json: {units: arr1.concat(arr2)}.to_json
  end

  def hide
    unit = Unit.find(params[:id])
    unit.update(visible: false)
    ArchiveUnitsClassroomActivitiesWorker.perform_async(unit.id)
    render json: {}
  end

  def destroy
    (Unit.find params[:id]).destroy
    render json: {}
  end

  def edit
    unit = Unit.find(params[:id])
    render json: LessonPlanner::UnitSerializer.new(unit, root: false)
  end


  private

  def unit_params
    params.require(:unit).permit(:id, :name, classrooms: [:id, :all_students, student_ids: []], activities: [:id, :due_date])
  end

#   def setup
#     @classroom = current_user.classrooms.find(params[:classroom_id])
#   end
end
