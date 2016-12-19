require 'rails_helper'
include AsyncHelper

feature 'Subscription to Progress Report', js: true do
  before(:each) { vcr_ignores_localhost }

  let!(:report_page) { Teachers::ActivityProgressReportPage.new }

  let!(:teacher) { FactoryGirl.create :user, role: 'teacher'}

  let!(:activity) { FactoryGirl.create(:activity) }
  let!(:classroom) { FactoryGirl.create(:classroom, teacher: teacher) }
  let!(:student) { FactoryGirl.create(:arnold_horshack, classrooms: [classroom]) }
  let!(:unit) {FactoryGirl.create(:unit)}
  let!(:classroom_activity) { FactoryGirl.create(:classroom_activity,
    classroom: classroom, unit: unit, activity: activity) }



  let!(:activity_session) {
    FactoryGirl.create(:activity_session,
                             user: student,
                             state: 'finished',
                             percentage: 1,
                             classroom_activity: classroom_activity,
                             completed_at: Date.today)
  }


  def trial_message
    "As a Quill Premium trial user"
  end

  def expired_trial_message
    "Trial Has Expired"
  end

  before do
    sign_in_user teacher
  end

  context 'trial has not begun' do



  end

  context 'no paid subscription' do
      before do
        report_page.visit
      end

      it "shows premium state as 'none'" do
        expect(teacher.premium_state).to eq('none')
      end

      it 'displays activity session data' do
        expect(report_page).to have_content(student.name)
      end

      it 'initiates a trial when "Try it Free for 30 Days" button is clicked ' do
         click_button('Try it Free for 30 Days')
         ##eventually comes from AsyncHelper.rb accepts arguments {timeout: x, interval: y}
         eventually {  expect(teacher.premium_state).to eq('trial') }
      end



    context 'trial is expired' do

      before do
        allow_any_instance_of(Teacher).to receive(:is_trial_expired?).and_return(true)
        report_page.visit
      end

      it 'flags div as premium-status-none to blur out elements' do
        eventually {expect(report_page).to have_css('div.premium-status-none')}
      end

      it 'shows expired trial message in premium banner' do
        expect(report_page).to have_content(expired_trial_message)
      end
    end

  end

  context 'has subscription' do
    let!(:subscription) {FactoryGirl.create(:subscription, user: teacher, expiration: Date.tomorrow, account_limit: 5, account_type: 'premium')}

    before do
      report_page.visit
    end

    it 'does not flags div as premium-status-none to blur out elements' do
      expect(report_page).to_not have_css('div.premium-status-none')
    end

    it 'displays activity session data' do
      expect(report_page.table_rows.first.first).to eq(student.name)
    end

    it 'does not display trial message' do
      expect(report_page).to_not have_content(trial_message)
    end

    it 'does not display premium tab' do
      expect(report_page).to_not have_css('div.premium-tab')
    end

    context 'that started that day' do
      it 'displays new sign up banner' do
        eventually {expect(report_page).to have_content('Success! You now have Premium')}
      end
    end

    context 'that did not start that day' do
      let!(:subscription) {FactoryGirl.create(:subscription, user: teacher, expiration: Date.tomorrow, account_limit: 5, account_type: 'premium', created_at: Time.current - 3.day, updated_at: Time.current - 2.day)}

      it 'does not display new sign up banner' do
        expect(report_page).to_not have_content('Success! You now have Premium')
      end
    end


  end
end
