require 'rails_helper'
describe Teachers::ProgressReports::DiagnosticReportsController, type: :controller do
include_context "Unit Assignments Variables"

  before do
    session[:user_id] = teacher.id
  end

  describe 'getting the report for a completed activity session' do


    describe 'updating existing recommendations' do
      let(:unit) {FactoryGirl.create(:unit)}
      let!(:classroom_activity) { FactoryGirl.create(:classroom_activity, activity: activity, unit: unit) }
      let!(:activity_session) { FactoryGirl.create(:activity_session, classroom_activity: classroom_activity, activity: activity, user: student) }
      it "returns a json with the url" do
          get :report_from_activity_session, ({activity_session: activity_session.id})
          response_body = JSON.parse(response.body)
          expect(response_body["url"]).to eq("/teachers/progress_reports/diagnostic_reports#/u/#{unit.id}/a/#{activity.id}/c/#{classroom.id}/student_report/#{student.id}")
      end
    end
  end

  describe 'assign_selected_packs recommendations' do

      it 'can create new units and classroom activities' do
          data = {"selections":[
                    {"id":unit_template1.id,"classrooms":[{"id":classroom.id,"student_ids":[144835]}]},
                    {"id":unit_template2.id,"classrooms":[{"id":classroom.id,"student_ids":[144835, 144836]}]},
                    {"id":unit_template3.id,"classrooms":[{"id":classroom.id,"student_ids":[144835, 144836, 144837]}]},
                    {"id":unit_template4.id,"classrooms":[{"id":classroom.id,"student_ids":[144835, 144836, 144837, 144838]}]}
                  ]}
          post "assign_selected_packs", (data)
          unit_template_ids = data[:selections].map{ |sel| sel[:id] }
          expect(unit_templates_have_a_corresponding_unit?(unit_template_ids)).to eq(true)
          expect(units_have_a_corresponding_classroom_activities?(unit_template_ids)).to eq(true)
      end

      it 'does not create new units or classroom activities if passed no students ids' do
        data = {"selections":[
                  {"id":unit_template1.id,"classrooms":[{"id":classroom.id,"student_ids":[]}]},
                  {"id":unit_template2.id,"classrooms":[{"id":classroom.id,"student_ids":[]}]},
                  {"id":unit_template3.id,"classrooms":[{"id":classroom.id,"student_ids":[]}]},
                  {"id":unit_template4.id,"classrooms":[{"id":classroom.id,"student_ids":[]}]}
                ]}
        post "assign_selected_packs", (data)
        unit_template_ids = data[:selections].map{ |sel| sel[:id] }
        expect(unit_templates_have_a_corresponding_unit?(unit_template_ids)).to eq(false)
        expect(units_have_a_corresponding_classroom_activities?(unit_template_ids)).to eq(false)
      end

      it 'can update existing units without duplicating them' do

          old_data = {"selections":[
                        {"id":unit_template3.id,"classrooms":[{"id":classroom.id,"student_ids":[student1.id]}]}
                      ]}
          post "assign_selected_packs", (old_data)

          new_data = {"selections":[
                        {"id":unit_template3.id,"classrooms":[{"id":classroom.id,"student_ids":[student1.id, student2.id]}]}
                      ]}

          post "assign_selected_packs", (new_data)

          expect(Unit.where(name: unit_template3.name).count).to eq(1)
          expect(Unit.find_by_name(unit_template3.name)
                .classroom_activities.map(&:assigned_student_ids).flatten.uniq.sort)
                .to eq(new_data[:selections].first[:classrooms].first[:student_ids].sort)
      end

    end



    # describe 'for an existing unit' do
    #
    #   it "updates packs with new student ids if they should be updated" do
    #
    #   end
    #
    #   describe "does not duplicate the original" do
    #     it "unit" do
    #
    #     end
    #
    #     it "classroom activities" do
    #
    #     end
    #
    #     it "activity sessions" do
    #
    #     end
    #
    #   end
    #
    #   describe "if necessary, it assigns new" do
    #     it "activity packs" do
    #
    #     end
    #     it "classroom activities" do
    #
    #     end
    #
    #     it "activity sessions" do
    #
    #     end
    #   end
    #
    #
    # end





end
