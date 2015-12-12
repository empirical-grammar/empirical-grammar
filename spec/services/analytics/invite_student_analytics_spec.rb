require 'rails_helper'

describe 'InviteStudentAnalytics' do
  let(:analytics) { InviteStudentAnalytics.new }
  let(:segment_analytics) { SegmentAnalytics.new }
  let(:track_calls) { segment_analytics.backend.track_calls }
  let(:identify_calls) { segment_analytics.backend.identify_calls }

  let(:teacher) { FactoryGirl.create(:teacher) }
  let(:student) { FactoryGirl.create(:student) }

  it 'identifies student' do
    analytics.track(teacher, student)
    expect(identify_calls[0][:traits].keys).to include(:id, :name, :role, :active, :username, :email, :created_at)
  end

  it 'identifies teacher' do
    analytics.track(teacher, student)
    expect(identify_calls[1][:traits].keys).to include(:id, :name, :role, :active, :username, :email, :created_at)
  end

  it 'sends event for student' do
    analytics.track(teacher, student)
    expect(track_calls[0][:event]).to eq(SegmentIo::Events::STUDENT_ACCOUNT_CREATION)
    expect(track_calls[0][:user_id]).to eq(student.id)
  end

  it 'sends event for teacher' do
    analytics.track(teacher, student)
    expect(track_calls[1][:event]).to eq(SegmentIo::Events::TEACHERS_STUDENT_ACCOUNT_CREATION)
    expect(track_calls[1][:user_id]).to eq(teacher.id)
  end
end
