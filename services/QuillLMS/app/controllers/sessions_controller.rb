require 'newrelic_rpm'
require 'new_relic/agent'

class SessionsController < ApplicationController
  CLEAR_ANALYTICS_SESSION_KEY = "clear_analytics_session"

  before_action :signed_in!, only: [:destroy]
  before_action :set_cache_buster, only: [:new]

  def create
    email_or_username = params[:user][:email].downcase.strip unless params[:user][:email].nil?
    @user =  User.find_by_username_or_email(email_or_username)
    if @user.nil?
      report_that_route_is_still_in_use
      login_failure_message
    elsif @user.signed_up_with_google
      report_that_route_is_still_in_use
      login_failure 'You signed up with Google, please log in with Google using the link above.'
    elsif @user.password_digest.nil?
      report_that_route_is_still_in_use
      login_failure 'Login failed. Did you sign up with Google? If so, please log in with Google using the link above.'
    elsif @user.authenticate(params[:user][:password])
      sign_in(@user)
      if session[ApplicationController::POST_AUTH_REDIRECT].present?
        redirect_to URI.parse(session.delete(ApplicationController::POST_AUTH_REDIRECT)).path
      elsif params[:redirect].present?
        redirect_to URI.parse(params[:redirect]).path
      elsif session[:attempted_path]
        redirect_to URI.parse(session.delete(:attempted_path)).path
      else
        redirect_to profile_path
      end
    else
      login_failure_message
    end
  end

  def login_through_ajax
    email_or_username = params[:user][:email].downcase.strip unless params[:user][:email].nil?
    @user =  User.find_by_username_or_email(email_or_username)
    if @user.nil?
      render json: {message: 'An account with this email or username does not exist. Try again.', type: 'email'}, status: 401
    elsif @user.signed_up_with_google
      render json: {message: 'Oops! You have a Google account. Log in that way instead.', type: 'email'}, status: 401
    elsif @user.clever_id
      render json: {message: 'Oops! You have a Clever account. Log in that way instead.', type: 'email'}, status: 401
    elsif @user.password_digest.nil?
      render json: {message: 'Did you sign up with Google? If so, please log in with Google using the link above.', type: 'email'}, status: 401
    elsif @user.authenticate(params[:user][:password])
      sign_in(@user)

      session[ApplicationController::KEEP_ME_SIGNED_IN] = params[:keep_me_signed_in]

      if session[ApplicationController::POST_AUTH_REDIRECT].present?
        url = session[ApplicationController::POST_AUTH_REDIRECT]
        session.delete(ApplicationController::POST_AUTH_REDIRECT)
        render json: {redirect: url}
      elsif params[:redirect].present?
        render json: {redirect: URI.parse(params[:redirect]).path}
      elsif session[:attempted_path]
        render json: {redirect: URI.parse(session.delete(:attempted_path)).path}
      elsif @user.auditor? && @user.subscription&.school_subscription?
        render json: {redirect: '/subscriptions'}
      else
        render json: {redirect: '/'}
      end
    else
      render json: {message: 'Wrong password. Try again or click Forgot password to reset it.', type: 'password'}, status: 401
    end
  end

  def destroy
    admin_id = session.delete(:admin_id)
    admin = User.find_by_id(admin_id)
    staff_id = session.delete(:staff_id)
    cookies[:webinar_banner_recurring_closed] = { expires: Time.now }
    cookies[:webinar_banner_one_off_closed] = { expires: Time.now }
    cookies[:student_feedback_banner_1_closed] = { expires: Time.now }
    if admin.present? and (admin != current_user)
      sign_out
      sign_in(admin)
      session[:staff_id] = staff_id unless staff_id.nil? # since it will be lost in sign_out
      redirect_to profile_path
    else # we must go deeper
      staff = User.find_by_id(staff_id)
      if staff.present? and (staff != current_user)
        sign_out
        sign_in(staff)
        redirect_to cms_users_path
      else
        sign_out
        # Wherever our user eventually lands after logout, we want to do some special stuff
        # So we set a session value here for the final controller to pick up and convert into
        # a variable for the view
        session[CLEAR_ANALYTICS_SESSION_KEY] = true
        redirect_to signed_out_path
      end
    end
  end

  def new
    @js_file = 'login'
    @user = User.new
    @title = 'Log In'
    @clever_link = clever_link
    @google_link = GoogleIntegration::AUTHENTICATION_ONLY_PATH
    session[:role] = nil
    session[ApplicationController::POST_AUTH_REDIRECT] = params[:redirect] if params[:redirect]
  end

  def failure
    login_failure_message
    # redirect_to signed_out_path
  end

  def clever_link
    "https://clever.com/oauth/authorize?#{clever_link_query_params}"
  end

  def clever_link_query_params
    {
      response_type: 'code',
      redirect_uri: Clever::REDIRECT_URL,
      client_id: Clever::CLIENT_ID,
      scope: QuillClever.scope
    }.to_param
  end


  def set_post_auth_redirect
    session[ApplicationController::POST_AUTH_REDIRECT] = params[ApplicationController::POST_AUTH_REDIRECT]
    render json: {}
  end

  def finish_sign_up
    if session[ApplicationController::POST_AUTH_REDIRECT]
      url = session[ApplicationController::POST_AUTH_REDIRECT]
      session.delete(ApplicationController::POST_AUTH_REDIRECT)
      return redirect_to url
    end
    redirect_to profile_path
  end

  private def report_that_route_is_still_in_use
    begin
      raise 'sessions/create original route still being called here'
    rescue => e
      NewRelic::Agent.notice_error(e)
    end
  end
end
