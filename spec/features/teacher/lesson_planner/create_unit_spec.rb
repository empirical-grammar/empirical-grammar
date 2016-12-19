require 'rails_helper'

feature 'Create Unit', js: true do
  it 'is skipped until we have a frontend testing framework compatible with react' do
    skip

    let!(:teacher) { FactoryGirl.create(:user, role: 'teacher') }
    let!(:classroom) { FactoryGirl.create(:classroom, teacher: teacher) }
    let!(:student) { FactoryGirl.create(:user, role: 'student', classrooms: [classroom]) }
    let!(:activity) { FactoryGirl.create(:activity) }
    before do
      vcr_ignores_localhost
      sign_in_user teacher
      visit('/teachers/classrooms/lesson_planner')
      page.find('a',  text: 'Assign a New Activity').trigger(:click)
      page.find('h3', text: 'Custom Activity Packs').trigger(:click)
    end

    context 'stage1' do
      it 'displays the right page' do
        expect(page).to have_content("Name the New Unit")
      end
    end

    # context 'stage2' do
    #   before do
    #     script = "$('#unit_name').val('unit1');"
    #     page.execute_script(script)
    #     script2 = "$('.css-checkbox').attr({checked: 'checked'});"
    #     page.execute_script(script2)
    #     page.find('button', text: 'Continue').trigger(:click)
    #   end

    #   it 'gets to stage2 when it should' do
    #     expect(page).to have_content("Select Students")
    #   end

    #   it 'shows student' do
    #     expect(page).to have_content(student.name)
    #   end

    # end
  end


end
