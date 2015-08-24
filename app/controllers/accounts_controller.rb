class AccountsController < ApplicationController
  before_filter :signed_in!, only: [:edit, :update]

  def new
    @user = User.new(role: params[:as] || 'student')
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
      AccountCreationWorker.perform_async(@user.id)
      @user.subscribe_to_newsletter
      render json: @user
    else
      render json: {errors: @user.errors}, status: 422
    end
  end

  def select_school
    current_user.schools << School.find(params[:school_id])
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
                                 :newsletter,
                                 :terms_of_service,
                                 :send_newsletter,
                                 :school_ids)
  end

end