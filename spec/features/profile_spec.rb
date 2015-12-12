require 'rails_helper'

feature 'Profile', js: true do
  include_context 'profile'

  before :each do
    vcr_ignores_localhost
    sign_in_user student
    visit('/')
  end

  it 'includes teacher name' do
    expect(page).to have_content(teacher.name)
  end

  it 'includes unit name' do
    expect(page).to have_content(unit1.name)
  end

  it 'includes activity name for unstarted activity_session' do
    expect(page).to have_content(as2.activity.name)
  end

  it 'includes activity name for finished activity_session' do
    expect(page).to have_content(as1.activity.name)
  end
end
