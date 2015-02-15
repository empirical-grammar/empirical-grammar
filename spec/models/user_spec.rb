require 'rails_helper'
require 'io/console'


describe User, :type => :model do

  let(:user) { FactoryGirl.build(:user) }


  describe "default scope" do

    let(:user1){FactoryGirl.create(:user)}
    let(:user2){FactoryGirl.create(:user)}
    let(:user2){FactoryGirl.create(:user, role: "temporary")}

    it "must list all users but the ones with temporary role" do
      User.all.each do |u|
        expect(u.role).to_not eq "temporary"
      end
    end

  end

  describe "User scope" do

    describe "::ROLES" do

      it "must contain all roles" do
        ["student", "teacher", "temporary", "user", "admin"].each do |role|
          expect(User::ROLES).to include role
        end
      end

    end

    describe "::SAFE_ROLES" do

      it "must contain safe roles" do
        ["student", "teacher", "temporary"].each do |role|
          expect(User::SAFE_ROLES).to include role
        end
      end

    end

  end

  #TODO: email is taken as username and email
  describe ".authenticate" do

    before do
      FactoryGirl.create(:user, username: 'test',          password: '123456', password_confirmation: '123456')
      FactoryGirl.create(:user, email: 'test@example.com', password: '654321', password_confirmation: '654321')
    end

    context "when username present" do

      it "password is not valid" do
        expect(User.authenticate(email: 'test',             password: 'xxxxxx')).to be_falsy
      end

      it 'authenticate a user by username' do
        expect(User.authenticate(email: 'test',             password: '123456')).to be_truthy
      end

    end

    context "when email present" do

      it "password is not valid" do
        expect(User.authenticate(email: 'test@example.com', password: 'xxxxxx')).to be_falsy
      end

      it 'authenticate a user by email' do
        expect(User.authenticate(email: 'test@example.com', password: '654321')).to be_truthy
      end

    end

  end

  describe "#password?" do

    it "returns false if password is not present" do
      user = FactoryGirl.build(:user,  password: nil)
      expect(user.send(:password?)).to be false
    end

    it "returns true if password is present" do
      user = FactoryGirl.build(:user,  password: "something")
      expect(user.send(:password?)).to be true
    end

  end

  describe "#role=" do

    it "return role name" do
      user = FactoryGirl.build(:user)
      expect(user.role="newrole").to eq "newrole"
    end

  end

  describe "#role" do

    let(:user) { FactoryGirl.build(:user) }

    it "returns role as instance of ActiveSupport::StringInquirer" do
      user.role='newrole'
      expect(user.role).to be_a ActiveSupport::StringInquirer
    end

    it "returns true for correct role" do
      user.role='newrole'
      expect(user.role.newrole?).to be true
    end

    it "returns false for incorrect role" do
      user.role='newrole'
      expect(user.role.invalidrole?).to be false
    end

  end

  describe "#safe_role_assignment" do

    let(:user) { FactoryGirl.build(:user) }

    it "must assign 'user' role by default" do
      expect(user.safe_role_assignment "nil").to eq("user")
    end

    it "must assign 'teacher' role even with spaces" do
      expect(user.safe_role_assignment " teacher ").to eq("teacher")
    end

    it "must assign 'teacher' role when it's chosen" do
      expect(user.safe_role_assignment "teacher").to eq("teacher")
    end

    it "must assign 'student' role when it's chosen" do
      expect(user.safe_role_assignment "student").to eq("student")
    end

    it "must change the role to 'student' inside the instance" do
      user.safe_role_assignment "student"
      expect(user.role).to be_student
    end

  end


  describe "#permanent?" do

    let(:user) { FactoryGirl.build(:user) }

    it "must be true for user" do
      user.safe_role_assignment "user"
      expect(user).to be_permanent
    end

    it "must be true for teacher" do
      user.safe_role_assignment "teacher"
      expect(user).to be_permanent
    end

    it "must be true for student" do
      user.safe_role_assignment "student"
      expect(user).to be_permanent
    end

    it "must be false for temporary" do
      user.safe_role_assignment "temporary"
      expect(user).to_not be_permanent
    end

  end

  describe "#requires_password?" do

    let(:user) { FactoryGirl.build(:user) }

    it "returns true for all roles but temporary" do
      user.safe_role_assignment "user"
      expect(user.send(:requires_password?)).to eq(true)
    end

    it "returns false for temporary role" do
      user.safe_role_assignment "temporary"
      expect(user.send(:requires_password?)).to eq(false)
    end

  end

  describe "#requires_password_confirmation?" do

    it "required confirmation if require_password? is true and password present" do
      user = FactoryGirl.build(:user,  password: "presentpassword")
      user.safe_role_assignment "user"
      expect(user.send(:requires_password_confirmation?)).to eq(true)
    end

    it "confirmation not required when password is not present" do
      user = FactoryGirl.build(:user,  password: nil)
      expect(user.send(:requires_password_confirmation?)).to eq(false)
    end

    it "confirmation not required when require_password? is false and password present" do
      user = FactoryGirl.build(:user,  password: "presentpassword")
      user.safe_role_assignment "temporary"
      expect(user.send(:requires_password_confirmation?)).to eq(false)
    end

  end

  describe "#generate_password" do

    let(:user) { FactoryGirl.build(:user, password: "currentpassword", last_name: "lastname") }

    it "sets password confirmation to value of last_name" do
      user.generate_password
      expect(user.password_confirmation).to eq(user.last_name)
    end

    it "sets password to value of last_name" do
      user.generate_password
      expect(user.password_confirmation).to eq(user.last_name)
    end

  end

  describe "#generate_username" do

    let(:user) { FactoryGirl.build(:user, first_name: "first", last_name: "last", classcode: "cc") }

    it "generates last name, first name, and class code" do
      expect(user.send(:generate_username)).to eq("first.last@cc")
    end

  end

  describe "#email_required?" do

    let(:user) { FactoryGirl.build(:user) }

    it "returns true for all roles but temporary" do
      user.safe_role_assignment "user"
      expect(user.send(:email_required?)).to eq(true)
    end

    it "returns false for temporary role" do
      user.safe_role_assignment "temporary"
      expect(user.send(:email_required?)).to eq(false)
    end

  end


  describe "#refresh_token!" do

    let(:user) { FactoryGirl.build(:user) }

    it "must change the token value" do
      expect(user.token).to be_nil
      expect(user.refresh_token!).to eq(true)
      expect(user.token).to_not be_nil
    end

  end

  context "when it runs validations" do
    let(:user) { FactoryGirl.build(:user) }

    it "is valid with valid attributes" do
      expect(user).to be_valid
    end

    describe "password attibute" do

      context "when role requires password" do
        it "is invalid without password" do
          user = FactoryGirl.build(:user,  password: nil)
          user.safe_role_assignment "student"
          expect(user).to_not be_valid
        end

        it "is valid with password" do
          user = FactoryGirl.build(:user,  password: "somepassword", password_confirmation: "somepassword" )
          user.safe_role_assignment "student"
          expect(user).to be_valid
        end
      end

      context "when role does not require password" do
        it "is valid without password" do
          user = FactoryGirl.build(:user,  password: nil)
          user.safe_role_assignment "temporary"
          expect(user).to be_valid
        end
      end
    end

    describe "email attribute" do
      it "is invalid when email is not unique" do
         FactoryGirl.create(:user,  email: "test@test.lan")
         user = FactoryGirl.build(:user,  email: "test@test.lan")
         expect(user).to_not be_valid
      end

      it "is valid when email is not unique" do
         user = FactoryGirl.build(:user,  email: "unique@test.lan")
         expect(user).to be_valid
      end

      context "when role requires email" do
        it "is invalid without email" do
          user.safe_role_assignment "student"
          user.email = nil
          expect(user).to_not be_valid
        end

        it "is valid with email" do
          user.safe_role_assignment "student"
          user.email = "email@test.lan"
          expect(user).to be_valid
        end
      end

      context "when role does not require email" do
        it "is valid without email" do
          user.safe_role_assignment "temporary"
          user.email = nil
          expect(user).to be_valid
        end
      end
    end

    describe "username attribute" do
      context "role is permanent" do
        it "is invalid without username and email" do
          user.safe_role_assignment "student"
          user.email = nil
          user.username = nil
          expect(user).to_not be_valid
        end

        it "is valid with username" do
          user.safe_role_assignment "student"
          user.email = nil
          user.username = "testusername"
          expect(user).to be_valid
        end
      end

      context "not permanent role" do
        it "is valid without username and email" do
          user.safe_role_assignment "temporary"
          user.email = nil
          expect(user).to be_valid
        end
      end
    end

    describe "terms_of_service attribute" do

        it "is valid if accepted" do
          #maps true to "1"
          user = FactoryGirl.build(:user,  terms_of_service: "1")
          expect(user).to be_valid
        end

        it "is invalid if not accepted" do
          #maps false to "0"
          user = FactoryGirl.build(:user,  terms_of_service: "0")
          expect(user).to_not be_valid
        end
    end

  end

  describe "#name" do

    context "with valid inputs" do

      it "has a first_name only" do
        user.last_name = nil
        expect(user.name).to eq('Test')
      end

      it "has a last name only" do
        user.first_name = nil
        expect(user.name).to eq('User')
      end

      it "has a full name" do
        expect(user.name).to eq('Test User')
      end

    end

  end


  describe "#student?" do

    let(:user) { FactoryGirl.build(:user) }

    it "must be true for 'student' roles" do
      user.safe_role_assignment "student"
      expect(user).to be_student
    end

    it "must be false for other roles" do
      user.safe_role_assignment "other"
      expect(user).to_not be_student
    end

  end

  describe "#teacher?" do

    let(:user) { FactoryGirl.build(:user) }

    it "must be true for 'teacher' roles" do
      user.safe_role_assignment "teacher"
      expect(user).to be_teacher
    end

    it "must be false for other roles" do
      user.safe_role_assignment "other"
      expect(user).to_not be_teacher
    end

  end

  describe "#admin?" do

    let(:user) { FactoryGirl.build(:user, role: "user") }
    let(:admin){ FactoryGirl.build(:admin)}

    it "must be true for admin role" do
      expect(admin).to be_admin
    end

    it "must be false for another roles" do
      expect(user).to_not be_admin
    end

  end

  describe "#generate_student" do

    let(:classroom) { Classroom.new(code: '101') }

    subject do
      student = classroom.students.build(first_name: 'John', last_name: 'Doe')
      student.generate_student
      student
    end

    describe '#username' do
      subject { super().username }
      it { is_expected.to eq('John.Doe@101') }
    end

    describe '#role' do
      subject { super().role }
      it { is_expected.to eq('student') }
    end

    it 'should authenticate with last name' do
      expect(subject.authenticate('Doe')).to be_truthy
    end

  end

  describe "#newsletter?" do

    let(:user) { FactoryGirl.build(:user) }

    it 'returns true when newsletter set to 1' do
      user.newsletter="1"
      expect(user.send(:newsletter?)).to eq(true)
    end
    it 'returns true when newsletter set to anything other than 1' do
      user.newsletter="anything"
      expect(user.send(:newsletter?)).to eq(false)
    end

  end

  describe "#subscribe_to_newsletter" do

    let(:user) { FactoryGirl.build(:user) }

    it "returns nil when user newletter attribute is 0" do
      user.newsletter="0"
      expect(user.send(:subscribe_to_newsletter)).to eq(nil)
    end

    it "calls MailchimpConnection subscribe when newletter attribute is 1" do
      user.newsletter="1"
      expect(MailchimpConnection).to receive(:connection).at_least(:once).and_return(double())
      expect(MailchimpConnection.connection).to receive(:lists).at_least(:once).and_return(double())
      expect(MailchimpConnection.connection.lists).to receive(:subscribe).and_return(true)
      user.send(:subscribe_to_newsletter)
    end

  end

  describe "#send_welcome_email" do

    let(:user) { FactoryGirl.build(:user) }

    it "sends welcome given email" do
      user.email="present@exmaple.lan"
      expect { user.send(:send_welcome_email) }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end


    it "does not send welcome without email" do
      user.email=nil
      expect { user.send(:send_welcome_email) }.to_not change { ActionMailer::Base.deliveries.count }
    end

  end

  describe "can behave as either a student or teacher" do

    context "when behaves like student" do
      it_behaves_like "student"
    end

    context "when behaves like teacher" do
      it_behaves_like "teacher"
    end

  end

  describe 'clever', :vcr do
    describe 'student' do
      let(:user) { FactoryGirl.build(:user, role: 'student', clever_id: '535ea6e816b90a4529c18feb') }

      it 'finds its clever user for a' do
        u = user.send(:clever_user)

        expect(u.id).to eq('535ea6e816b90a4529c18feb')
      end
    end

    describe 'teacher' do
      let(:user) { FactoryGirl.build(:user, role: 'teacher', clever_id: '535ea6e416b90a4529c18fd3') }

      it 'finds its clever user for a' do
        u = user.send(:clever_user)

        expect(u.id).to eq('535ea6e416b90a4529c18fd3')
      end
    end

    describe 'setup from clever' do
      it 'passes an auth hash for a user to be setup' do
        pending("This spec's VCR cassette returns a 404, so this test always fails")
        @user = User.setup_from_clever({
          info: {
            email: 'foo@bar.wee',
            id: '123',
            user_type: 'student',
            name: {first: 'Joshy', last: 'Washy'}
          },
          credentials: {
            token: '123'
          }
        })

        expect(@user.valid?).to be_truthy
        expect(@user.id).to_not be_nil
        expect(@user.email).to eq('foo@bar.wee')
      end
    end
  end

  describe 'student behavior' do
    let(:classroom_activity) { FactoryGirl.build(:classroom_activity_with_activity) }
    let(:activity) { classroom_activity.activity }
    let(:classroom) { FactoryGirl.create(:classroom, classroom_activities: [classroom_activity]) }
    let(:student) { FactoryGirl.create(:student, classroom: classroom) }

    it 'assigns newly-created students to all activities previously assigned to their classroom' do
      expect(student.activity_sessions.size).to eq(1)
      expect(student.activity_sessions.first.activity).to eq(activity)
    end
  end

  it 'does not care about all the validation stuff when the user is temporary'
  it 'disallows regular assignment of roles that are restricted'
end
