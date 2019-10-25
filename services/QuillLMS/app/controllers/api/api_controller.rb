class Api::ApiController < ActionController::Base

  before_filter :add_platform_doc_header

  rescue_from ActiveRecord::RecordNotFound do |e|
    not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render(json: e.record.errors.messages, status: :unprocessable_entity)
  end

  protected def not_found
    render json: {meta: { message: 'The resource you were looking for does not exist', status: :not_found }},
           status: 404
  end

  private def add_platform_doc_header
    response.headers['X-Platform-Spec'] = 'https://github.com/interagent/http-api-design'
    response.headers['X-API-Reference'] = 'http://docs.empirical.org/api-reference/'
  end

  private def current_user
    begin
      if session[:user_id]
        return @current_user ||= User.find(session[:user_id])
      elsif doorkeeper_token
        return User.find_by_id(doorkeeper_token.resource_owner_id) if doorkeeper_token
      else
        authenticate_with_http_basic do |username, password|
          return @current_user ||= User.find_by_token!(username) if username.present?
        end
      end
    rescue ActiveRecord::RecordNotFound
      sign_out
      nil
    end
  end

  private def doorkeeper_token
    return @token if instance_variable_defined?(:@token)
    methods = Doorkeeper.configuration.access_token_methods
    @token = Doorkeeper::OAuth::Token.authenticate(request, *methods)
  end
end
