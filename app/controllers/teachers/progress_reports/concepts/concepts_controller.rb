class Teachers::ProgressReports::Concepts::ConceptsController < Teachers::ProgressReportsController
  def index
    respond_to do |format|
      format.html do
        @student = student
      end
      format.json do
        render json: json_payload
      end
    end
  end

  private

  def json_payload
    {
      concepts: concepts_as_json,
      student: ::StudentSerializer.new(student).as_json(root: false)
    }
  end

  def concepts
    ::ProgressReports::Concepts::Concept.results(current_user, concept_filters)
  end

  def concept_filters
    { student_id: params[:student_id] }
  end

  def concepts_as_json
    concepts.map do |concept|
      serializer = ::ProgressReports::Concepts::ConceptSerializer.new(concept)
      serializer.as_json(root: false)
    end
  end

  def student
    current_user.students.find(params[:student_id])
  end
end
