module Units::Updater


  # in this file, 'unit' refers to a unit object, 'activities_data' to an array of objects
  # with activity ids and due_dates, and 'classrooms_data' to an array of objects with an id
  # and array of student ids.

  # TODO: rename this -- it isn't always the method called on the instance
  def self.run(unit_id, activities_data, classrooms_data)
    self.update_helper(unit_id, activities_data, classrooms_data)
  end

  def self.assign_unit_template_to_one_class(unit_id, classrooms_data)
    activities_data = ClassroomActivity.where(unit_id: unit_id).select('activity_id AS id, NULL as due_date').symbolize_keys
    self.update_helper(unit_id, activities_data, classrooms_data)
  end

  def self.fast_assign_unit_template(teacher_id, unit_template, unit_id)
    activities_data = unit_template.activities.select('activity_id AS id, NULL as due_date')
    classrooms_data = Classroom.where(teacher_id: teacher_id).ids.map{|id| {id: id, student_ids: []}}
    self.update_helper(unit_id, activities_data, classrooms_data)
  end

  private

  def self.matching_or_new_classroom_activity(activity_data, classroom_id, extant_classroom_activities, new_cas, hidden_cas_ids, classroom)
    visible = classroom[:student_ids] != false
    matching_activity = extant_classroom_activities.find{|ca| (ca.activity_id == activity_data[:id] && ca.classroom_id == classroom_id)}
    if matching_activity
      if !visible
        # then there are no assigned students and we should hide the cas
        hidden_cas_ids.push(matching_activity.id)
      elsif (matching_activity.due_date != activity_data[:due_date]) || (matching_activity.assigned_student_ids != classroom[:student_ids])
        # then something changed and we should update
        matching_activity.update(due_date: activity_data[:due_date], assigned_student_ids: classroom[:student_ids])
      end
    elsif visible
      # making an array of hashes to create in one bulk option
      new_cas.push({activity_id: activity_data[:id],
         classroom_id: classroom_id,
         due_date: activity_data[:due_date],
         assigned_student_ids: classroom[:student_ids]})
    end
  end

  def self.update_helper(unit_id, activities_data, classrooms_data)
    unit = Unit.find unit_id
    extant_classroom_activities = ClassroomActivity.where(unit_id: unit_id)
    new_cas = []
    hidden_cas_ids = []
    classrooms_data.each do |classroom|
        product = activities_data.product([classroom[:id].to_i])
        product.each do |pair|
          activity_data, classroom_id = pair
          self.matching_or_new_classroom_activity(activity_data.symbolize_keys, classroom_id, extant_classroom_activities, new_cas, hidden_cas_ids, classroom)
        end
    end
    new_cas.any? ? ClassroomActivity.bulk_insert(values: new_cas) : nil
    hidden_cas_ids.any? ? ClassroomActivity.where(id: hidden_cas_ids).update_all(visible: false) : nil
    if (hidden_cas_ids.any?) && (new_cas.none?)
      # then there is a chance that there are no existing classroom activities
      unit.hide_if_no_visible_classroom_activities
    end
    # necessary activity sessions are created in an after_create and after_save callback
    # in activity_sessions.rb
    # TODO: Assign Activity Worker should be labeled as an analytics worker
    AssignActivityWorker.perform_async(unit.user_id)
  end


  #TODO: find out if this code is worth salvaging
  # def self.run(teacher, id, name, activities_data, classrooms_data)
  #   extant = Unit.find(id)
  #   extant.update(name: name)
  #   classroom_activities = extant.classroom_activities
  #   pairs = activities_data.product(classrooms_data)
  #   self.create_and_update_cas(classroom_activities, pairs)
  #   self.hide_cas(classroom_activities, pairs)
  #   self.create_activity_sessions(extant)
  # end
  #
  # private
  #
  # def self.create_and_update_cas(classroom_activities, pairs)
  #   pairs.each do |pair|
  #     activity_data, classroom_data = pair
  #     hash = {activity_id: activity_data[:id], classroom_id: classroom_data[:id]}
  #     ca = classroom_activities.find_by(hash)
  #     if ca.present?
  #       self.maybe_hide_some_activity_sessions(ca, classroom_data[:student_ids])
  #     else
  #       ca = classroom_activities.create(hash)
  #     end
  #     ca.update(due_date: activity_data[:due_date], assigned_student_ids: classroom_data[:student_ids])
  #   end
  # end
  #
  # def self.maybe_hide_some_activity_sessions(classroom_activity, new_assigned_student_ids)
  #
  #   all_student_ids = classroom_activity.classroom.students.map(&:id)
  #   formerly_assigned = self.helper(classroom_activity.assigned_student_ids, all_student_ids)
  #   now_assigned = self.helper(new_assigned_student_ids, all_student_ids)
  #
  #   no_longer_assigned = formerly_assigned - now_assigned
  #   no_longer_assigned.each do |student_id|
  #     as = classroom_activity.activity_sessions.find_by(user_id: student_id)
  #     self.hide_activity_session(as)
  #   end
  # end
  #
  # def self.helper(student_ids1, student_ids2)
  #   student_ids1.any? ? student_ids1 : student_ids2
  # end
  #
  # def self.hide_activity_session(activity_session)
  #   Units::Hiders::ActivitySession.run(activity_session)
  # end
  #
  # def self.hide_cas(classroom_activities, pairs)
  #   classroom_activities.each do |ca|
  #     self.maybe_hide_ca(ca, pairs)
  #   end
  # end
  #
  # def self.maybe_hide_ca(ca, pairs)
  #   e = pairs.find do |pair|
  #     activity_data, classroom_data = pair
  #     a = (activity_data[:id] == ca.activity_id)
  #     b = (classroom_data[:id] == ca.classroom_id)
  #     a && b
  #   end
  #   if e.nil?
  #     self.hide_classroom_activity(ca)
  #   end
  # end
  #
  # def self.hide_classroom_activity(classroom_activity)
  #   Units::Hiders::ClassroomActivity.run(classroom_activity)
  # end
  #
  # def self.create_activity_sessions(unit)
  #   unit.reload.classroom_activities.each do |ca|
  #     ca.assign_to_students
  #   end
  # end

end
