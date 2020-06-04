require 'rails_helper'

describe Activity, type: :model, redis: true do
  it { should have_and_belong_to_many(:unit_templates) }
  it { should belong_to(:classification).class_name("ActivityClassification") }
  it { should belong_to(:topic) }
  it { should have_one(:section).through(:topic) }
  it do
    should belong_to(:follow_up_activity).class_name("Activity")
      .with_foreign_key("follow_up_activity_id")
  end
  it { should have_many(:unit_activities).dependent(:destroy) }
  it { should have_many(:units).through(:unit_activities) }
  it { should have_many(:classroom_units).through(:units) }
  it { should have_many(:classrooms).through(:classroom_units) }
  it { should have_many(:recommendations).dependent(:destroy) }
  it { should have_many(:activity_category_activities).dependent(:destroy) }
  it { should have_many(:activity_categories).through(:activity_category_activities) }

  it { is_expected.to callback(:flag_as_beta).before(:create).unless(:flags?) }
  it do
    is_expected.to callback(:clear_activity_search_cache).after(:commit)
  end
  it { should delegate_method(:form_url).to(:classification) }

  let!(:activity){ build(:activity) }

  describe 'validations' do
    it 'requires a unique uid' do
      activity.save!
      invalid_activity = build(:activity, uid: activity.uid)
      invalid_activity.valid?
      expect(invalid_activity.errors).to include(:uid)
    end

    it 'should be invalid if data is not a hash' do
      invalid_activity = build(:activity, data: 1)
      expect(invalid_activity.valid?).to be false
      expect(invalid_activity.errors[:data]).to include('must be a hash')
    end
  end

  describe 'callbacks' do
    describe 'flagging the activity' do
      describe 'record is created and flag is not set' do
        it 'defaults the flag to beta' do
          activity.save!
          expect(activity.flags).to include(:beta)
        end
      end

      describe 'record is created and flag is already set' do
        before do
          activity.flag 'archived'
        end

        it 'does nothing' do
          activity.save!
          expect(activity.flags).to eq([:archived])
        end
      end
    end
  end

  describe ".find_by_id_or_uid" do
    it "can find by uid string" do
      uid = 'a2423kahfadf32'
      activity = create(:activity, id: '999', uid: uid)

      result = Activity.find_by_id_or_uid(uid)

      expect(result).to eq(activity)
    end

    it "can find by numeric id" do
      id = 999
      activity = create(:activity, id: id, uid: 'a2423kahfadf32')

      result = Activity.find_by_id_or_uid(id)

      expect(result).to eq(activity)
    end
  end

  describe "#classification_key" do
  	describe "#classification_key="
	  it "must set classification relationship" do
  	  	activity.classification=nil
	  	expect(activity.classification).to_not be_present
	  	expect(activity.classification_key=ActivityClassification.first.key || create(:classification).key).to be_present
	  end

  	describe "#classification_key"
  	  before do
  	  	activity.classification=nil
  	  	activity.classification_key=ActivityClassification.first.key || create(:classification).key
  	  end
	  it "must set classification relationship" do
	  	expect(activity.classification_key).to be_present
	  end
  end


  describe "#form_url" do
    it "must not include uid if hasn't been validated" do
      activity.uid = nil
      expect(activity.form_url.to_s).not_to include "uid="
    end

    it "must include uid after validate" do
      activity.valid?
      expect(activity.form_url.to_s).to include "uid="
    end
  end

  describe "#module_url" do
    let!(:student){ build(:student) }

    it "must add uid param of it's a valid student session" do
      activity.valid?
      expect(activity.module_url(student.activity_sessions.build()).to_s).to include "uid="
    end

    it "must add student param of it's a valid student session" do
      activity.valid?
      expect(activity.module_url(student.activity_sessions.build()).to_s).to include "student"
    end

    it "must use the connect_url_helper when the classification.key is 'connect'" do
      classification = build(:activity_classification, key: 'connect')
      classified_activity = build(:activity, classification: classification)
      activity_session = build(:activity_session)
      expect(classified_activity).to receive(:connect_url_helper).with({student: activity_session.uid}).and_call_original
      result = classified_activity.module_url(activity_session)
      expect(result.to_s).to eq("#{classification.module_url}#{classified_activity.uid}?student=#{activity_session.uid}")
    end

    it "must use the connect_url_helper when the classification.key is 'diagnostic'" do
      classification = build(:activity_classification, key: 'diagnostic')
      classified_activity = build(:activity, classification: classification)
      activity_session = build(:activity_session)
      expect(classified_activity).to receive(:connect_url_helper).with({student: activity_session.uid}).and_call_original
      result = classified_activity.module_url(activity_session)
      expect(result.to_s).to eq("#{classification.module_url}#{classified_activity.uid}?student=#{activity_session.uid}")
    end

  end

  describe '#anonymous_module_url' do
    it 'must add anonymous param' do
      expect(activity.anonymous_module_url.to_s).to include "anonymous=true"
    end

    it "must use the connect_url_helper when the classification.key is 'connect'" do
      classification = build(:activity_classification, key: 'connect')
      classified_activity = build(:activity, classification: classification)
      expect(classified_activity).to receive(:connect_url_helper).with({anonymous: true}).and_call_original
      result = classified_activity.anonymous_module_url
      expect(result.to_s).to eq("#{classification.module_url}#{classified_activity.uid}?anonymous=true")
    end

    it "must use the connect_url_helper when the classification.key is 'diagnostic'" do
      classification = build(:activity_classification, key: 'diagnostic')
      classified_activity = build(:activity, classification: classification)
      expect(classified_activity).to receive(:connect_url_helper).with({anonymous: true}).and_call_original
      result = classified_activity.anonymous_module_url
      expect(result.to_s).to eq("#{classification.module_url}#{classified_activity.uid}?anonymous=true")
    end
  end


  describe "#flag's overwritten methods" do
    it "must be nil if has not been set" do
      expect(activity.flag).to be_nil
    end

    it "must have a setter" do
      expect(activity.flag=:alpha).to eq :alpha
    end

    context "when is set it must preserve the value" do
      before do
        activity.flag=:alpha
      end
      it "must return the correct value" do
        expect(activity.flag).to eq :alpha
      end
    end

  end

  describe 'scope results' do
    let!(:production_activity){ create(:activity, flag: 'production') }
    let!(:beta_activity){ create(:activity, flag: 'beta') }
    let!(:alpha_activity){ create(:activity, flag: 'alpha') }
    let!(:archived_activity){ create(:activity, flag: 'archived') }
    let!(:all_types){[production_activity, beta_activity, alpha_activity, archived_activity]}

    context 'the default scope' do
      it 'must show all types of flagged activities when default scope' do
        expect(all_types - Activity.all).to eq []
      end
    end

    context 'the production scope' do
      it 'must show only production flagged activities' do
        expect(all_types - Activity.production.all).to eq [beta_activity, alpha_activity, archived_activity]
      end

      it 'must return the same thing as Activity.user_scope(nil)' do
        expect(Activity.production).to eq (Activity.user_scope(nil))
      end
    end

    context 'the beta scope' do
      it 'must show only production and beta flagged activities' do
        expect(all_types - Activity.beta_user).to eq [alpha_activity, archived_activity]
      end

      it 'must return the same thing as Activity.user_scope(beta)' do
        expect(Activity.beta_user).to eq (Activity.user_scope('beta'))
      end
    end

    context 'the alpha scope' do
      it 'must show all types of flags except for archived with alpha_user scope' do
        expect(all_types - Activity.alpha_user).to eq [archived_activity]
      end

      it 'must return the same thing as Activity.user_scope(alpha)' do
        expect(Activity.alpha_user).to eq (Activity.user_scope('alpha'))
      end
    end
  end

  describe "can behave like a flagged model" do
    context "when behaves like flagged" do
      it_behaves_like "flagged"
    end
  end

  describe "#clear_activity_search_cache" do
    it 'deletes the default_activity_search from the cache' do
      $redis.set('default_activity_search', {something: 'something'})
      Activity.clear_activity_search_cache
      expect($redis.get('default_activity_search')).to eq nil
    end
  end

  describe "#set_activity_search_cache" do
    let!(:cache_activity) { create(:activity, :production) }

    it 'sets the default_activity_search for the cache' do
      $redis.redis.flushdb
      Activity.set_activity_search_cache
      expect(JSON.parse($redis.get('default_activity_search'))['activities'].first['uid']).to eq(cache_activity.uid)
    end
  end

  describe 'diagnositic_activit_ids' do
    let(:classification) { create(:diagnostic)}
    let!(:activity_1) { create(:activity, classification: classification) }
    let!(:activity_2) { create(:activity, classification: classification) }

    it 'should have the correct values' do
      expect(Activity.diagnostic_activity_ids).to include(activity_1.id, activity_2.id)
    end
  end

  describe '#topic_uid =' do
    let(:activity) { create(:activity) }
    let(:topic) { create(:topic) }

    it 'should set the topic_uid' do
      activity.topic_uid = topic.uid
      expect(activity.topic_id).to eq(topic.id)
    end
  end

  describe '#activity_classification_uids=' do
    let(:activity) { create(:activity) }
    let(:classification) { create(:activity_classification) }

    it 'should set the activity_classification_uid' do
      activity.activity_classification_uid= classification.uid
      expect(activity.activity_classification_id).to eq(classification.id)
    end
  end

  describe 'user scope' do
    it 'should return the correct scope for the correct flag' do
      expect(Activity.user_scope('alpha')).to eq(Activity.alpha_user)
      expect(Activity.user_scope('beta')).to eq(Activity.beta_user)
      expect(Activity.user_scope('anything')).to eq(Activity.production)
    end
  end

  describe '#clear_activity_search_cache' do
    let(:activity) { create(:activity) }

    it 'should call clear_activity_search_cache' do
      expect(Activity).to receive(:clear_activity_search_cache)
      activity.clear_activity_search_cache
    end
  end

  describe '#data_as_json' do
    let(:activity) { create(:activity) }

    it 'should just be the data attribute' do
      expect(activity.data_as_json).to eq(activity.data)
    end
  end

  describe '#add_question' do
    let(:activity) { create(:connect_activity) }
    let(:question) { create(:question)}

    it 'should add a question to the lesson' do
      old_length = activity.data["questions"].length
      question_obj = {"key": question.uid, "questionType": "questions"}
      puts(activity.activity_classification_id)
      activity.add_question(question_obj)
      expect(activity.data["questions"].length).to eq(old_length+1)
      expect(activity.data["questions"][-1][:key]).to eq(question.uid)
      expect(activity.data["questions"][-1][:questionType]).to eq("questions")
    end

    it 'should throw error if the question does not exist' do
      question_obj = {"key": "fakeid", "questionType": "questions"}
      activity.add_question(question_obj)
      expect(activity.errors[:question]).to include('Question fakeid does not exist.')
    end

    it 'should throw error if the question type does not match' do
      question_obj = {"key": question.uid, "questionType": "faketype"}
      activity.add_question(question_obj)
      expect(activity.errors[:question]).to include("The question type faketype does not match the lesson's question type: questions")
    end

    it 'should throw error if the activity classification is Grammar or Lesson' do
      question_obj = {"key": question.uid, "questionType": "questions"}
      data = {"questionType": "questions"}
      grammar_activity = create(:grammar_activity, data: data)
      activity.add_question(question_obj)
      puts activity.errors
      expect(activity.errors[:activity]).to include("You can't add questions to this type of activity.")
    end
  end
end
