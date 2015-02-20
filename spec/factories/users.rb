# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  sequence(:name) { |i| "Name #{i}" }
  sequence(:username) { |i| "Username#{i}" }
  sequence(:key) { |i| "key-#{i}" }
  sequence(:description) { |i| "Description #{i}" }
  sequence(:email) { |n| "user#{n}@example.com" }

  factory :user do
    first_name 'Test'
    last_name  'User'
    role 'user'
    password '123456'
    password_confirmation '123456'
    email

    factory :admin do
      role 'admin'
    end

    factory :teacher do
      role 'teacher'

      factory :mr_kotter do
        first_name            'Gabe'
        last_name             'Kotter'
        username              'mrkotter'
        email                 'gabe.kotter@jamesbuchananhigh.edu'
        password              'sweathogs'
        password_confirmation { password }
      end
    end

    factory :student do
      role 'student'
      username
      classroom

      factory :arnold_horshack do
        first_name            'Arnold'
        last_name             'Horshack'
        username              'horshack'
        password              'dingfelder'
        password_confirmation { password }
        email                 'ahorshack@coldmail.com'
      end

      factory :vinnie_barbarino do
        first_name            'Vinnie'
        last_name             'Barbarino'
        username              'vinnie_barbarino'
        password              'sally'
        password_confirmation { password }
        email                 'vinnieb@geemail.com'
      end
    end

    factory :student_with_many_activities do
      role 'student'
      username
      classroom

      ignore do
        activity_count 5
      end

      after(:create) do |user, evaluator|
        create_list(:activity_session, evaluator.activity_count, user: user)
      end
    end


    factory :student_with_one_activity do
      role 'student'
      username
      classroom

      after(:create) do |user, evaluator|
        create_list(:activity_session, 1, user: user)
      end
    end

    factory :student_with_one_assigned_activity do
      role 'student'
      username
      classroom { FactoryGirl.create(:classroom_with_one_student) }

      after(:create) do |user, evaluator|
        create_list(:classroom_activity, 1, assigned_student_ids: [user.id], classroom: user.classroom)
      end
    end

  end
end
