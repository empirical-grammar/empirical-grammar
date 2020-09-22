class Api::V1::ActiveActivitySessionsController < Api::ApiController
  before_action :activity_session_by_uid, only: [:show, :destroy]

  def show
    render json: @activity_session.as_json
  end

  def update
    begin
      @activity_session = ActiveActivitySession.find_or_initialize_by(uid: params[:id])
      @activity_session.data ||= {}
      @activity_session.data = @activity_session.data.merge(valid_params)
      @activity_session.save!
    rescue ActiveRecord::RecordNotUnique
      # Due to the way that ActiveRecord handles unique validations such as the one on UID,
      # it is possible that parallel calls to "update" will result in two threads trying
      # to create the same UID record and running into the RecordNotUnique error.  If this
      # happens, it should be safe to just re-run the function because now the record is
      # in the database so find_or_initialize_by should locate the existing record
      return update
    end
    render json: @activity_session.as_json
  end

  def destroy
    @activity_session.destroy
    render(plain: 'OK')
  end

  private def valid_params
    params.require(:active_activity_session).except(:uid)
  end

  private def activity_session_by_uid
    @activity_session = ActiveActivitySession.find_by!(uid: params[:id])
  end
end
