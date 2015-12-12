require 'rails_helper'

describe CsvExporter::ActivitySession do
  include_context 'Activity Progress Report'
  let(:teacher) { mr_kotter }

  it_behaves_like 'CSV Exporter' do
    let(:expected_header_row) do
      [
        'Page Title',
        'Student',
        'Date',
        'Activity',
        'Score',
        'Standard Level',
        'Standard',
        'App'
      ]
    end

    let(:model_instance) do
      horshack_session
    end

    let(:filters) { { 'classroom_id' => sweathogs.id } }

    let(:expected_data_row) do
      [
        'Activities: All Students',
        horshack_session.user.name,
        horshack_session.completed_at.to_formatted_s(:quill_default),
        horshack_session.activity.name,
        horshack_session.percentage_as_decimal,
        horshack_session.activity.topic.section.name,
        horshack_session.activity.topic.name,
        # Concept (Topic Category(?)) -
        horshack_session.activity.classification.name
      ]
    end

    let(:expected_model_data_size) do
      sweathogs_sessions.size
    end
  end
end
