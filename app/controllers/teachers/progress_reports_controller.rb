class Teachers::ProgressReportsController < ApplicationController
  before_action :authorize!, except: :demo
  # before_action :handle_expired_trial, except: :demo
  before_action :set_vary_header, if: -> { request.xhr? || request.format == :json }
  layout 'progress_reports'

  def demo
    if params[:name]
      @user = User.find_by_email "hello+#{params[:name]}@quill.org"
      if @user.nil?
        @user = User.find_by_email 'hello+demo@quill.org'
      end
    else
      @user = User.find_by_email 'hello+demo@quill.org'
    end
    sign_in @user
    redirect_to teachers_progress_reports_standards_classrooms_path
  end

  private

  # def handle_expired_trial
  #   render :trial_expired if (current_user.premium_state == 'locked')
  # end

  def authorize!
    return if current_user.try(:teacher?)
    auth_failed
  end
end
