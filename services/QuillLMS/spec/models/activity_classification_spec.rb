# == Schema Information
#
# Table name: activity_classifications
#
#  id                :integer          not null, primary key
#  app_name          :string
#  form_url          :string
#  instructor_mode   :boolean          default(FALSE)
#  key               :string           not null
#  locked_by_default :boolean          default(FALSE)
#  module_url        :string
#  name              :string
#  order_number      :integer          default(999999999)
#  scored            :boolean          default(TRUE)
#  uid               :string           not null
#  created_at        :datetime
#  updated_at        :datetime
#
# Indexes
#
#  index_activity_classifications_on_uid  (uid) UNIQUE
#
require 'rails_helper'

describe ActivityClassification, type: :model, redis: true do
  it { should have_many(:activities) }
  it { should have_many(:concept_results) }

  it_behaves_like "uid"


  let(:activity_classification) { build(:activity_classification) }

  describe 'diagnostic' do
    context 'when it exists' do
      let!(:activity_classification) { create(:diagnostic) }

      it 'should find the activity_classification with diagnostic key' do
        expect(ActivityClassification.diagnostic).to eq(activity_classification)
      end
    end

    context 'when it does not exist' do
      it 'should return nil' do
        expect(ActivityClassification.diagnostic).to eq(nil)
      end
    end
  end

end
