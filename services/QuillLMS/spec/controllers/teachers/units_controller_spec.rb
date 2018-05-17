require 'rails_helper'

describe Teachers::UnitsController, type: :controller do
  let!(:student) {create(:student)}
  let!(:classroom) { create(:classroom_with_students_and_activities, students: [student]) }
  let!(:teacher) { classroom.owner }
  let!(:unit) {create(:unit, user: teacher)}
  let!(:unit2) {create(:unit, user: teacher)}
  let!(:classroom_activity) { create(
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

  describe '#prohibited_unit_names' do
    let(:unit_names) { teacher.units.pluck(:name).map(&:downcase) }
    let(:unit_template_names) { UnitTemplate.pluck(:name).map(&:downcase) }

    it 'should render the correct json' do
      get :prohibited_unit_names, format: :json
      expect(response.body).to eq({
          prohibitedUnitNames: unit_names.concat(unit_template_names)
      }.to_json)
    end
  end

  describe '#last_assigned_unit_id' do
    it 'should render the current json' do
      get :last_assigned_unit_id, format: :json
      expect(response.body).to eq({
        id: Unit.where(user: teacher).last.id
      }.to_json)
    end
  end

  describe '#lesson_info_for_activity' do
    context 'when activities present' do
      let(:activities) { classroom.activities }

      before do
        allow(controller).to receive(:get_classroom_activities_for_activity) { activities }
      end

      it 'should render the correct json' do
        get :lesson_info_for_activity, activity_id: activities.first.id, format: :json
        expect(response.body).to eq({
          classroom_activities: activities,
          activity_name: Activity.select('name').where("id = #{activities.first.id}")
        }.to_json)
      end
    end

    context 'when activities not present' do
      before do
        allow(controller).to receive(:get_classroom_activities_for_activity) { [] }
      end

      it 'should render the correct json' do
        get :lesson_info_for_activity, activity_id: classroom.activities.first.id, format: :json
        expect(response.body).to eq({
          errors: "No activities found"
        }.to_json)
      end
    end

  end

  describe '#diagnostic_units' do
    before do
      # return unit on the first call and unit2 on the second call
      allow(ActiveRecord::Base.connection).to receive(:execute).and_return([unit.attributes.merge({"activity_classification_id" => "4"})], [unit2.attributes.merge({"activity_classification_id" => '2'})])
    end

    it 'should render the correct json' do
      get :diagnostic_units, report: true
      expect(response.body).to eq([unit.attributes.merge({"activity_classification_id" => "4"})].to_json)
    end
  end

  # the find line is commented out
  # describe '#destroy' do
  #   it 'should make the unit invisible' do
  #     expect(unit.visible).to eq true
  #     delete :destroy, id: unit.id
  #     expect(unit.reload.visible).to eq false
  #   end
  # end

  describe '#edit' do
    before do
      allow(LessonPlanner::UnitSerializer).to receive(:new) { "some json" }
    end

    it 'should find the unit and return the lesson planner' do
      expect(LessonPlanner::UnitSerializer).to receive(:new).with(unit, root: false)
      get :edit, id: unit.id
      expect(response.body).to eq("some json")
    end
  end

  describe '#index' do
    let!(:activity) {create(:activity)}
    let!(:classroom_activity) {create(:classroom_activity, due_date: Time.now, unit: unit, classroom: classroom, activity: activity, assigned_student_ids: [student.id])}
    let!(:activity_session) {create(:activity_session,
      activity: activity,
      classroom_activity: classroom_activity,
      user: student,
      state: 'finished'
    )}

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
        expect(res["classrooms"].first["classroom_activity"]).to eq({"id" => classroom_activity.id, "assigned_student_ids" => classroom_activity.assigned_student_ids, "assign_on_join" => true})
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

  describe '#select_lesson_with_activity_id' do
    let!(:activity) { create(:lesson_activity) }

    before(:each) do
      ClassroomActivity.destroy_all
      session['user_id'] = classroom_activity.classroom.owner.id
    end

    it 'should redirect to a lessons index if there are no lessons' do
      get :select_lesson_with_activity_id, activity_id: activity.id
      expect(response).to redirect_to("/teachers/classrooms/activity_planner/lessons_for_activity/#{activity.id}")
    end

    it 'should redirect to the lesson if there is only one lesson' do
      classroom_activity = create(:classroom_activity, activity: activity, classroom: current_user.classrooms_i_own.first)
      get :select_lesson_with_activity_id, activity_id: activity.id
      expect(response).to redirect_to("/teachers/classroom_activities/#{classroom_activity.id}/launch_lesson/#{activity.uid}")
    end

    it 'should redirect to a lessons index if there are multiple lessons' do
      create_pair(:classroom_activity, activity: activity)
      get :select_lesson_with_activity_id, activity_id: activity.id
      expect(response).to redirect_to("/teachers/classrooms/activity_planner/lessons_for_activity/#{activity.id}")
    end
  end

end
