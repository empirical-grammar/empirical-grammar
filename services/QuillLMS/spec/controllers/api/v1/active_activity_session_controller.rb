require 'json'
require 'rails_helper'

describe Api::V1::ActiveActivitySessionsController, type: :controller do
  let!(:active_activity_session) { create(:active_activity_session) }

  describe "#show" do
    it "should return the specified active_activity_session" do
      get :show, id: active_activity_session.uid
      expect(JSON.parse(response.body)).to eq(active_activity_session.data)
    end

    it "should return a 404 if the requested activity session is not found" do
      get :show, id: 'doesnotexist'
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end

  describe "#update" do
    it "should update the existing record" do
      data = {"foo" => "bar"}
      put :update, id: active_activity_session.uid, active_activity_session: data
      active_activity_session.reload
      expect(active_activity_session.data).to eq(data)
    end

    it "should return a 404 if the requested activity session is not found" do
      data = {"foo" => "bar"}
      put :update, id: 'doesnotexist', active_activity_session: data
      expect(response.status).to eq(200)
      expect(response.body).to eq(data.to_json)
    end
  end

  describe "#destroy" do
    it "should destroy the existing record" do
      delete :destroy, id: active_activity_session.uid
      expect(ActiveActivitySession.where(uid: active_activity_session.uid).count).to eq(0)
    end

    it "should return a 404 if the requested activity session is not found" do
      delete :destroy, id: 'doesnotexist'
      expect(response.status).to eq(404)
      expect(response.body).to include("The resource you were looking for does not exist")
    end
  end
end
