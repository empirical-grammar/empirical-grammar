class Api::V1::ConceptFeedbackController < Api::ApiController
  before_action :concept_feedback_by_uid, except: [:index, :create, :update]

  def index
    all_concept_feedbacks = ConceptFeedback.all.reduce({}) { |agg, q| agg.update({q.uid => q.as_json}) }
    render(json: all_concept_feedbacks)
  end

  def show
    render(json: @concept_feedback)
  end

  def create
    uid = SecureRandom.uuid
    @concept_feedback = ConceptFeedback.create!(uid: uid, data: valid_params)
    render(json: {@concept_feedback.uid => @concept_feedback.as_json})
  end

  def update
    # Because ConceptFeedback is tied to Concept via having the same UID, we need to allow
    # "updates" that are really creates with a specified UID
    begin
      @concept_feedback = ConceptFeedback.find_by!(uid: params[:id])
    rescue ActiveRecord::RecordNotFound
      @concept_feedback = ConceptFeedback.create!({uid: params[:id], data: valid_params})
    end
    render(json: @concept_feedback.as_json)
  end

  def destroy
    @concept_feedback.destroy
    render(plain: 'OK')
  end

  private def concept_feedback_by_uid
    @concept_feedback = ConceptFeedback.find_by!(uid: params[:id])
  end

  private def valid_params
    params.require(:concept_feedback).except(:uid)
  end
end
