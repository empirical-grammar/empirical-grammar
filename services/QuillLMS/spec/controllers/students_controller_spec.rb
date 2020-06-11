require 'rails_helper'


describe StudentsController do
  it { should use_before_filter :authorize! }

  let(:user) { create(:user) }

  before do
    allow(controller).to receive(:current_user) { user }
  end

  describe '#index' do
    let!(:classroom) { create(:classroom) }
    let!(:students_classrooms) { create(:students_classrooms, student_id: user.id, classroom_id: classroom.id) }

    it 'should set the current user and js file' do
      get :index
      expect(assigns(:current_user)).to eq user
      expect(assigns(:js_file)).to eq "student"
    end

    it 'should find the classroom and set flash' do
      get :index, joined: "success", classroom: classroom.id
      expect(flash["join-class-notification"]).to eq "You have joined #{classroom.name} 🎉🎊"
    end
  end

  describe '#account_settings' do
    it 'should set the current user and js file' do
      get :account_settings
      expect(assigns(:current_user)).to eq user
      expect(assigns(:js_file)).to eq "student"
    end
  end

  describe '#student_demo' do
    context 'when maya angelou exists' do
      let!(:maya) { create(:user, email: 'maya_angelou_demo@quill.org') }

      it 'should sign in maya and redirect to profile' do
        get :student_demo
        expect(session[:user_id]).to eq maya.id
        expect(response).to redirect_to '/classes'
      end
    end

    context 'when maya angelou does not exist' do
      it 'should destroy recreate the demo and redirect to student demo' do
        expect(Demo::ReportDemoDestroyer).to receive(:destroy_demo).with(nil)
        expect(Demo::ReportDemoCreator).to receive(:create_demo).with(nil)
        get :student_demo
        expect(response).to redirect_to "/student_demo"
      end
    end
  end

  describe '#student_demo_ap' do
    context 'when bell hooks exists' do
      let!(:bell) { create(:user, email: 'bell_hooks_demo@quill.org') }

      it 'should sign in bell and redirect to profile' do
        get :demo_ap
        expect(session[:user_id]).to eq bell.id
        expect(response).to redirect_to '/classes'
      end
    end

    context 'when bell hooks does not exist' do
      it 'should recreate the demo and redirect to student demo' do
        expect(Demo::ReportDemoAPCreator).to receive(:create_demo).with(nil)
        get :demo_ap
        expect(response).to redirect_to "/student_demo_ap"
      end
    end
  end

  describe '#update_account' do
    let!(:user) { create(:user, name: "Maya Angelou", email: 'maya_angelou_demo@quill.org', username: "maya-angelou", role: "student") }
    let!(:second_user) { create(:user, name: "Harvey Milk", email: 'harvey@quill.org', username: "harvey-milk", role: "student") }
    it 'should update the name, email and username' do
      put :update_account, {email: "pablo@quill.org", username: "pabllo-vittar", name: "Pabllo Vittar"}
      expect(user.reload.email).to eq "pablo@quill.org"
      expect(user.reload.username).to eq "pabllo-vittar"
      expect(user.reload.name).to eq "Pabllo Vittar"
    end
    it 'should update only the fields that are changed' do
      put :update_account, {email: "pablo@quill.org", username: "rainha-do-carnaval", name: "Pabllo Vittar"}
      expect(user.reload.email).to eq "pablo@quill.org"
      expect(user.reload.username).to eq "rainha-do-carnaval"
      expect(user.reload.name).to eq "Pabllo Vittar"
    end
    it 'should not update the email or username if already taken' do
      put :update_account, {email: "harvey@quill.org", username: "pabllo-vittar", name: "Pabllo Vittar"}
      expect(user.reload.errors.messages[:email].first).to eq "That email is taken. Try another."
      put :update_account, {email: "pablo@quill.org", username: "harvey-milk", name: "Pabllo Vittar"}
      expect(user.reload.errors.messages[:username].first).to eq "That username is taken. Try another."
    end
  end
end
