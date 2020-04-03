require 'json'
require 'net/http'

MAX_RETRIES = 3

class RematchResponseWorker
  include Sidekiq::Worker
  sidekiq_options retry: 3

  DEFAULT_PARAMS_HASH = {
    "parent_id" => nil,
    "author" => nil,
    "feedback" => nil,
    "optimal" => nil,
    "weak" => false,
    "concept_results" => {},
    "spelling_error" => false
  }.freeze

  LMS_TYPES = {
    sentenceFragments: 'connect_sentence_fragments',
    questions: 'connect_sentence_combining',
    fillInBlankQuestions: 'connect_fill_in_blanks'
  }

  def perform(response_id, question_type, question_uid, reference_response_ids)
    response = Response.find_by(id: response_id)
    question = retrieve_question(question_uid, question_type)
    return unless question

    reference_responses = Response.where(id: reference_response_ids).to_a
    rematch_response(response, question_type, question, reference_responses)
  end

  def rematch_response(response, question_type, question, reference_responses)
    lambda_payload = construct_lambda_payload(response, question_type, question, reference_responses)
    updated_response = call_lambda_http_endpoint(lambda_payload)
    if updated_response.present?
      sanitized_response = sanitize_update_params(updated_response)
      response.update_attributes(sanitized_response)
    end
  end

  def sanitize_update_params(params)
    params.slice!(*DEFAULT_PARAMS_HASH.keys)
    ready_params = DEFAULT_PARAMS_HASH.merge(params)
  end

  def construct_lambda_payload(response, question_type, question, reference_responses)
    {
      response: response,
      type: question_type,
      question: question,
      referenceResponses: reference_responses
    }
  end

  def call_lambda_http_endpoint(lambda_payload)
    uri = URI(ENV['REMATCH_LAMBDA_URL'])
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    resp = http.post uri,
                     lambda_payload.to_json,
                     "Content-Type" => "application/json"
    raise Net::HTTPRetriableError.new("Timed out rematching response #{lambda_payload[:response][:id]}", 504) if resp.is_a?(Net::HTTPGatewayTimeOut)
    raise Net::HTTPError.new("Got a non-200 response trying to rematch #{lambda_payload[:response][:id]}", resp.code) if resp.code != '200'
    JSON.parse(resp.body)
  end

  def retrieve_question(question_uid, question_type)
    lms_type = LMS_TYPES[question_type.to_sym]
    response = HTTParty.get("#{ENV['LMS_URL']}/api/v1/questions.json?question_type=#{lms_type}")
    puts response.code
    question = response[question_uid]
    question[:key] = question_uid
    question.stringify_keys
  end
end
