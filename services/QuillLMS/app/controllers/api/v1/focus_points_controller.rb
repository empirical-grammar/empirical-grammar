class Api::V1::FocusPointsController < Api::ApiController
  before_filter :get_question_by_uid

  def index
    render(json: @question.data["focusPoints"])
  end

  def show
    render_focus_point
  end

  def create
    uid = @question.add_focus_point(valid_params)
    render(json: {uid => @question.data.dig("focusPoints", uid)})
  end

  def update
    return not_found unless @question.data.dig("focusPoints", params[:id])
    @question.set_focus_point(params[:id], valid_params)
    render_focus_point
  end

  def update_all
    @question.update_focus_points(valid_params)
    render_focus_point
  end

  def destroy
    @question.delete_focus_point(params[:id])
    render_focus_point
  end

  private def get_question_by_uid
    @question = Question.find_by!(uid: params[:question_id])
  end

  private def valid_params
    params.require(:focus_point).except(:uid)
  end

  private def render_focus_point
    focus_point = @question.data.dig("focusPoints", params[:id])
    return not_found unless focus_point
    render(json: focus_point)
  end
end
