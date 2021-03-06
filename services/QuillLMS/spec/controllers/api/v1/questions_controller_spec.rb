require 'json'
require 'rails_helper'

describe Api::V1::QuestionsController, type: :controller do
  let!(:question) { create(:question) }

  describe "#index" do
    it "should return a list of Questions" do
      expect($redis).to receive(:get).and_return(nil)
      get :index, params: { question_type: 'connect_sentence_combining' }
      expect(JSON.parse(response.body).keys.length).to eq(1)
    end

    it "should set cache if it is empty" do
      expect($redis).to receive(:get).and_return(nil)
      expect($redis).to receive(:set)
      get :index, params: { question_type: 'connect_sentence_combining' }
    end

    it "should not set cache if there is a cache hit" do
      mock_cached_data = {"foo" => "bar"}
      expect($redis).to receive(:get).and_return(JSON.dump(mock_cached_data))
      expect($redis).not_to receive(:set)
      get :index, params: { question_type: 'connect_sentence_combining' }
      expect(JSON.parse(response.body)).to eq(mock_cached_data)
    end

    it "should include the response from the db" do
      get :index, params: { question_type: 'connect_sentence_combining' }
      puts response.body
      expect(JSON.parse(response.body).keys.first).to eq(question.uid)
    end
  end

  describe "#show" do
    it "should return the specified question" do
      get :show, params: { id: question.uid }
      expect(JSON.parse(response.body)).to eq(question.data)
    end

    it "should set cache if it is empty" do
      expect($redis).to receive(:get).and_return(nil)
      expect($redis).to receive(:set)
      get :show, params: { id: question.uid }
    end

    it "should not set cache if there is a cache hit" do
      mock_cached_data = {"foo" => "bar"}
      expect($redis).to receive(:get).and_return(JSON.dump(mock_cached_data))
      expect($redis).not_to receive(:set)
      get :show, params: { id: question.uid }
      expect(JSON.parse(response.body)).to eq(mock_cached_data)
    end

    it "should return a 404 if the requested Question is not found" do
      get :show, params: { id: 'doesnotexist' }
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end

  describe "#create" do
    it "should create a new Question record" do
      uuid = SecureRandom.uuid
      data = {foo: "bar"}
      expect(SecureRandom).to receive(:uuid).and_return(uuid)
      pre_create_count = Question.count
      post :create, params: { question_type: 'connect_sentence_combining', question: data }
      expect(Question.count).to eq(pre_create_count + 1)
    end
  end

  describe "#update" do
    it "should update the existing record" do
      data = {"foo" => "bar"}
      put :update, params: { id: question.uid, question: data }
      question.reload
      expect(question.data).to eq(data)
    end

    it "should return a 404 if the requested Question is not found" do
      get :update, params: { id: 'doesnotexist' }
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end

  # Disabling these since we have no working auth
  #describe "#destroy" do
  #  it "should delete the existing record" do
  #    delete :destroy, id: question.uid
  #    expect(Question.find_by(uid: question.uid)).to be_nil
  #  end

  #  it "should return a 404 if the requested Question is not found" do
  #    delete :destroy, id: 'doesnotexist'
  #    expect(response.status).to eq(404)
  #    expect(response.body).to include("The resource you were looking for does not exist")
  #  end
  #end

  describe "#update_flag" do
    it "should update the flag attribute in the data" do
      new_flag = 'newflag'
      put :update_flag, params: { id: question.uid, question: {flag: new_flag} }
      question.reload
      expect(question.data["flag"]).to eq(new_flag)
    end

    it "should return a 404 if the requested Question is not found" do
      put :update_flag, params: { id: 'doesnotexist', question: {flag: nil} }
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end

  describe "#update_model_concept" do
    it "should update the model concept uid attribute in the data" do
      new_model_concept = SecureRandom.uuid
      put :update_model_concept, params: { id: question.uid, question: {modelConcept: new_model_concept} }
      question.reload
      expect(question.data["modelConceptUID"]).to eq(new_model_concept)
    end

    it "should return a 404 if the requested Question is not found" do
      put :update_model_concept, params: { id: 'doesnotexist', question: {flag: nil} }
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end
end
