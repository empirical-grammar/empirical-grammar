class AccountsController < ApplicationController
  before_filter :signed_in!, only: [:edit, :update]
  before_filter :set_cache_buster, only: [:new]

  include CheckboxCallback

  def new
    ClickSignUpWorker.perform_async
    session[:role] = nil
    @teacherFromGoogleSignUp = false
  end

  def role
    session[:role] = params[:role]
    render json: {}
  end

  # creates a new user from params.
  # if a temporary_user_id is present in the session, it uses that
  # user record instead of creating a new one.
  def create
    role = params[:user].delete(:role)
    @user = User.find_by_id(session[:temporary_user_id]) || User.new

    @user.attributes = user_params
    @user.safe_role_assignment(role)
    @user.validate_username = true

    if @user.save
      sign_in @user
      ip = request.remote_ip
      AccountCreationCallbacks.new(@user, ip).trigger
      @user.subscribe_to_newsletter
      render json: @user
    else
      render json: {errors: @user.errors}, status: 422
    end
  end

  def select_school
    #if the school does not specifically have a name, we send the type (e.g. not listed, international, etc..)
    if School.find_by_id(params[:school_id_or_type]) 
      school = School.find(params[:school_id_or_type])
    else
      school = School.find_or_create_by(name: params[:school_id_or_type])
    end
    current_user.schools << school
    if current_user.schools.compact.any?
      find_or_create_checkbox('Add School', current_user)
    end
    render json: {}
  end

  def update
    user_params.delete(:password) unless user_params[:password].present?
    @user = current_user

    if user_params[:username] == @user.username
      validate_username = false
    else
      validate_username = true
    end

    user_params.merge! validate_username: validate_username
    if @user.update_attributes user_params
      redirect_to updated_account_path
    else
      render 'accounts/edit'
    end
  end

  def edit
    @user = current_user
  end

protected

  def user_params
    params.require(:user).permit(
                                 :classcode,
                                 :email,
                                 :name,
                                 :username,
                                 :password,
                                 :terms_of_service,
                                 :send_newsletter,
                                 :school_ids)
  end

end
