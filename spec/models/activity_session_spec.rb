require 'rails_helper'


describe ActivitySession, type: :model do

  describe "can behave like an uid class" do

    context "when behaves like uid" do
      it_behaves_like "uid"
    end

  end

  let(:activity_session) {FactoryGirl.build(:activity_session, completed_at: 5.minutes.ago)}

  describe "#activity" do

  	context "when there is a direct activity association" do

	  	let(:activity){ FactoryGirl.create(:activity) }
		  let(:activity_session){ FactoryGirl.build(:activity_session,activity_id: activity.id) }

  		it "must return the associated activity" do
  			expect(activity_session.activity).to eq activity
  		end

	end

	context "when there's not an associated activity but there's a classroom activity" do

	    let!(:activity){ FactoryGirl.create(:activity) }
	    let!(:student){ FactoryGirl.create(:student) }
	    let!(:classroom_activity) { FactoryGirl.create(:classroom_activity, activity_id: activity.id, classroom_id: student.classrooms.first.id) }
		  let(:activity_session){   FactoryGirl.build(:activity_session, classroom_activity_id: classroom_activity.id)                     }

  		it "must return the classroom activity" do
  			activity_session.activity_id=nil
  			expect(activity_session.activity).to eq activity_session.classroom_activity.activity
  		end

	end

  end

  describe "#classroom" do
  	it "TODO: must return a valid classroom object"
  end

  describe "#activity_uid=" do

  	let(:activity){ FactoryGirl.create(:activity) }

  	it "must associate activity by uid" do
  		activity_session.activity_id=nil
  		activity_session.activity_uid=activity.uid
  		expect(activity_session.activity_id).to eq activity.id
  	end

  end

  describe "#activity_uid" do

  	it "must return an uid when activity is present" do
  		expect(activity_session.activity_uid).to be_present
  	end

  end

  describe "#completed?" do

  	it "must be true when completed_at is present" do
  		expect(activity_session).to be_completed
  	end

  	it "must be false when copleted_at is not present" do
  		activity_session.completed_at=nil
  		expect(activity_session).to_not be_completed
  	end

  end

  describe "#by_teacher" do
    # This setup is very convoluted... the factories appear to be untrustworthy w/r/t generating extra records
    let!(:current_teacher) { FactoryGirl.create(:teacher) }
    let!(:current_teacher_student) { FactoryGirl.create(:student) }
    let!(:current_teacher_classroom) { FactoryGirl.create(:classroom, teacher: current_teacher, students: [current_teacher_student]) }
    let!(:current_teacher_classroom_activity) { FactoryGirl.create(:classroom_activity_with_activity, classroom: current_teacher_classroom)}
    let!(:other_teacher) { FactoryGirl.create(:teacher) }
    let!(:other_teacher_student) { FactoryGirl.create(:student) }
    let!(:other_teacher_classroom) { FactoryGirl.create(:classroom, teacher: other_teacher, students: [other_teacher_student]) }
    let!(:other_teacher_classroom_activity) { FactoryGirl.create(:classroom_activity_with_activity, classroom: other_teacher_classroom)}

    before do
      # Can't figure out why the setup above creates 2 activity sessions
      ActivitySession.destroy_all
      2.times { FactoryGirl.create(:activity_session, classroom_activity: current_teacher_classroom_activity, user: current_teacher_student) }
      3.times { FactoryGirl.create(:activity_session, classroom_activity: other_teacher_classroom_activity, user: other_teacher_student) }
    end

    it "only retrieves activity sessions for the students who have that teacher" do
      results = ActivitySession.by_teacher(current_teacher)
      expect(results.size).to eq(2)
    end
  end

  #--- legacy methods

  describe "#grade" do

  	it "must be equal to percentage" do
  		expect(activity_session.grade).to eq activity_session.percentage
  	end

  end

  describe "#owner" do

  	it "must be equal to user" do
  		expect(activity_session.owner).to eq activity_session.user
  	end

  end

  describe "#anonymous=" do

  	it "must be equal to temporary" do
  		expect(activity_session.anonymous=true).to eq activity_session.temporary
  	end

  	it "must return temporary" do
  		activity_session.anonymous=true
  		expect(activity_session.anonymous).to eq activity_session.temporary
  	end
  end

  describe "#owned_by?" do

  	let(:user) {FactoryGirl.build(:user)}

  	it "must return true if temporary true" do
  		activity_session.temporary=true
  		expect(activity_session.owned_by? user).to be_truthy
  	end

  	it "must be true if temporary false and user eq owner" do
  		expect(activity_session.owned_by? activity_session.user).to eq true
  	end

  end

  context "when before_create is fired" do

  	describe "#set_state" do

  		it "must set state as unstarted" do
  			activity_session.state=nil
  			activity_session.save!
  			expect(activity_session.state).to eq "unstarted"
  		end

  	end

  end

  context "when before_save is triggered" do

  	describe "#set_completed_at when state = finished" do
      before do
        activity_session.save!
        activity_session.state="finished"
      end

      context "when completed_at is already set" do
        before do
          activity_session.completed_at = 5.minutes.ago
        end

        it "should not change completed at "do
          expect {
            activity_session.save!
          }.to_not change {
            activity_session.reload.completed_at
          }
        end
      end

      context "when completed_at is not already set" do
        before do
          activity_session.completed_at = nil
          activity_session.save!
        end

        it "should update completed_at" do
          expect(activity_session.completed_at).to_not be_nil
        end
      end
  	end

  end

  context "when completed scope" do
  	describe ".completed" do
  		before do
			FactoryGirl.create_list(:activity_session_with_random_completed_date, 5)
  		end
  		it "must locate all the completed items" do
  			expect(ActivitySession.completed.count).to eq 5
  		end

  		it "completed_at must be present" do
  			ActivitySession.completed.each do |item|
  				expect(item.completed_at).to be_present
  			end
  		end

  		it "must order by date desc" do
  			#TODO: This test is not passing cause the ordering is wrong
  			# p completed=ActivitySession.completed
  			# current_date=completed.first.completed_at
  			# completed.each do |item|
  			# 	expect(item.completed_at).to satisfy { |x| p x.to_s+" <= "+current_date.to_s ||x <= current_date  }
  			# 	current_date=item.completed_at
  			# end
  		end
  	end
  end

  context "when incompleted scope" do

  	describe ".incomplete" do

  		before do
			FactoryGirl.create_list(:activity_session_incompleted, 3)
  		end

  		it "must locate all the incompleted items" do
  			expect(ActivitySession.incomplete.count).to eq 3
  		end

  		it "completed_at must be nil" do
  			ActivitySession.incomplete.each do |item|
  				expect(item.completed_at).to be_nil
  			end
  		end

  	end

  end

  describe "can act as ownable" do

    context "when it's an ownable model" do

      it_behaves_like "ownable"
    end

  end

  describe '#determine_if_final_score' do
    let!(:classroom) {FactoryGirl.create(:classroom)}
    let!(:student) {FactoryGirl.create(:student)}
    let!(:activity) {FactoryGirl.create(:activity)}

    let!(:classroom_activity)   {FactoryGirl.create(:classroom_activity, activity: activity, classroom: classroom)}
    let!(:previous_final_score) {FactoryGirl.create(:activity_session, completed_at: Time.now, percentage: 0.9, is_final_score: true, user: student, classroom_activity: classroom_activity, activity: classroom_activity.activity)}

    it 'updates when new activity session has higher percentage ' do
      new_activity_session =  FactoryGirl.create(:activity_session, is_final_score: false, user: student, classroom_activity: classroom_activity, activity: classroom_activity.activity)
      new_activity_session.update_attributes completed_at: Time.now, state: 'finished', percentage: 0.95
      expect([ActivitySession.find(previous_final_score.id).is_final_score, ActivitySession.find(new_activity_session.id).is_final_score]).to eq([false, true])
    end

    it 'doesnt update when new activity session has lower percentage' do
      new_activity_session =  FactoryGirl.create(:activity_session, completed_at: Time.now, state: 'finished', percentage: 0.5, is_final_score: false, user: student, classroom_activity: classroom_activity, activity: classroom_activity.activity)
      expect([ActivitySession.find(previous_final_score.id).is_final_score, ActivitySession.find(new_activity_session.id).is_final_score]).to eq([true, false])
    end

  end

  describe '#concept_results' do

    let!(:concept1){ FactoryGirl.create(:concept)}
    let!(:concept2){ FactoryGirl.create(:concept)}
    let!(:concept_result1){ FactoryGirl.create(:concept_result, concept_id: concept1.id)}
    let!(:concept_result2){ FactoryGirl.create(:concept_result, concept_id: concept2.id)}
    let!(:activity_session){ FactoryGirl.create(:activity_session) }

    it 'cannot have an invalid concept_id' do
      concept1.destroy!

      activity_session.update(concept_results_attributes: [{concept_id: concept1.id}])
      expect(activity_session.concept_results).to be_empty
    end

  end

  describe '#validations' do
    let!(:activity){ FactoryGirl.create(:activity) }
    let!(:assigned_student){ FactoryGirl.create(:student) }
    let!(:unassigned_student){ FactoryGirl.create(:student) }
    let!(:classroom_activity) { FactoryGirl.create(:classroom_activity, activity_id: activity.id, assigned_student_ids: [assigned_student.id] )}

    it 'ensures that the student was correctly assigned' do
      act_sesh = ActivitySession.create(user_id: unassigned_student.id, classroom_activity: classroom_activity)
      expect(act_sesh).not_to be_valid
    end
  end



end
