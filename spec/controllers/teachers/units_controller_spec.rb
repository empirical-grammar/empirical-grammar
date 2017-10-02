require 'spec_helper'
require 'rails_helper'

describe Teachers::UnitsController, type: :controller do
  let!(:teacher) { FactoryGirl.create(:teacher) }
  let!(:student) {FactoryGirl.create(:student)}
  let!(:classroom) { FactoryGirl.create(:classroom, teacher: teacher, students: [student]) }
  let!(:unit) {FactoryGirl.create(:unit, user: teacher)}
  let!(:unit2) {FactoryGirl.create(:unit, user: teacher)}
  let!(:classroom_activity) { FactoryGirl.create(
    :classroom_activity_with_activity,
    unit: unit, classroom: classroom,
    assigned_student_ids: [student.id]
  )}

  before do
      session[:user_id] = teacher.id # sign in, is there a better way to do this in test?
  end

  describe '#create' do
    it 'kicks off a background job' do
      expect {
        post :create, classroom_id: classroom.id,
                      unit: {
                        name: 'A Cool Learning Experience',
                        classrooms: [],
                        activities: []
                      }
        expect(response.status).to eq(200)
      }.to change(AssignActivityWorker.jobs, :size).by(1)
    end
  end

  describe '#index' do
    let!(:activity) {FactoryGirl.create(:activity)}
    let!(:classroom_activity) {FactoryGirl.create(:classroom_activity, due_date: Time.now, unit: unit, classroom: classroom, activity: activity)}

    it 'should return json in the appropriate format' do
      response = get :index
      response = JSON.parse(response.body)
      expect(response[0]['unit_name']).to eq(unit.name)
      expect(response[0]['activity_name']).to eq(activity.name)
      expect(response[0]['class_name']).to eq(classroom.name)
      expect(response[0]['classroom_id']).to eq(classroom.id.to_s)
      expect(response[0]['activity_classification_id']).to eq(activity.activity_classification_id.to_s)
      expect(response[0]['classroom_activity_id']).to eq(classroom_activity.id.to_s)
      expect(response[0]['unit_id']).to eq(unit.id.to_s)
      expect(response[0]['class_size']).to eq(classroom.students.count.to_s)
      expect(response[0]['activity_uid']).to eq(activity.uid)
      expect(DateTime.parse(response[0]['due_date']).to_i).to eq(classroom_activity.due_date.to_i)
      expect(response[0]['unit_created_at'].to_i).to eq(unit.created_at.to_i)
      expect(response[0]['classroom_activity_created_at'].to_i).to eq(classroom_activity.created_at.to_i)
    end

    # TODO write a VCR-like test to check when this request returns something other than what we expect.
  end

  describe '#update' do

    it 'sends a 200 status code when a unique name is sent over' do
      put :update, id: unit.id,
                    unit: {
                      name: 'Super Unique Unit Name'
                    }
      expect(response.status).to eq(200)
    end

    it 'sends a 422 error code when a non-unique name is sent over' do
      put :update, id: unit.id,
                    unit: {
                      name: unit2.name
                    }
      expect(response.status).to eq(422)

    end
  end

  describe '#classrooms_with_students_and_classroom_activities' do

    it "returns #get_classrooms_with_students_and_classroom_activities when it is passed a valid unit id" do
        get :classrooms_with_students_and_classroom_activities, id: unit.id
        res = JSON.parse(response.body)
        expect(res["classrooms"].first["id"]).to eq(classroom.id)
        expect(res["classrooms"].first["name"]).to eq(classroom.name)
        expect(res["classrooms"].first["students"].first['id']).to eq(student.id)
        expect(res["classrooms"].first["students"].first['name']).to eq(student.name)
        expect(res["classrooms"].first["classroom_activity"]).to eq({"id" => classroom_activity.id, "assigned_student_ids" => classroom_activity.assigned_student_ids})
    end


    it "sends a 422 error code when it is not passed a valid unit id" do
      get :classrooms_with_students_and_classroom_activities, id: Unit.count + 1000
      expect(response.status).to eq(422)
    end

  end

  describe '#update_classroom_activities_assigned_students' do

    it "sends a 200 status code when it is passed valid data" do
      put :update_classroom_activities_assigned_students,
          id: unit.id,
          unit: {
            classrooms: "[{\"id\":#{classroom.id},\"student_ids\":[]}]"
          }
      expect(response.status).to eq(200)
    end

    it "sends a 422 status code when it is passed invalid data" do
      put :update_classroom_activities_assigned_students,
          id: unit.id + 500,
          unit: {
            classrooms: "[{\"id\":#{classroom.id},\"student_ids\":[]}]"
          }
      expect(response.status).to eq(422)
    end

  end

  describe '#update_activities' do

    it "sends a 200 status code when it is passed valid data" do
      activity = classroom_activity.activity
      put :update_activities,
          id: unit.id.to_s,
          data: {
            unit_id: unit.id,
            activities_data: [{id: activity.id, due_date: nil}]
          }.to_json
      expect(response.status).to eq(200)
    end

    it "sends a 422 status code when it is passed invalid data" do
      activity = classroom_activity.activity
      put :update_activities,
          id: unit.id + 500,
          data: {
            unit_id: unit.id + 500,
            activities_data: [{id: activity.id, due_date: nil}]
          }.to_json
      expect(response.status).to eq(422)
    end
  end

end
