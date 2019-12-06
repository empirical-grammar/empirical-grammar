class StudentsClassrooms < ActiveRecord::Base
  include CheckboxCallback
  belongs_to :student, class_name: "User"
  belongs_to :classroom, class_name: "Classroom"
  # validates uniqueness of student/classroom on db
  after_save :checkbox, :run_associator
  after_save :archive_student_associations_for_classroom, if: Proc.new { |sc| !sc.visible && sc.student && sc.classroom }
  after_commit :invalidate_classroom_minis

  default_scope { where(visible: true)}

  def archived_classrooms_manager
    {joinDate: created_at.strftime("%m/%d/%Y"), className: classroom.name, teacherName: classroom.owner.name, id: id}
  end

  def archive_student_associations_for_classroom
    ArchiveStudentAssociationsForClassroomWorker.perform_async(student_id, classroom_id)
  end

  private

  def run_associator
    if student && classroom && visible
      Associators::StudentsToClassrooms.run(student, classroom)
    end
  end

  def checkbox
    if classroom
      find_or_create_checkbox('Add Students', classroom.owner)
    end
  end

  def invalidate_classroom_minis
    if classroom.owner.present?
      $redis.del("user_id:#{classroom.owner.id}_classroom_minis")
    end
  end
end
