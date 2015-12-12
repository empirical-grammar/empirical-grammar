require 'rails_helper'

describe Teachers::ProgressReports::CsvExportsController, type: :controller do
  include_context 'Activity Progress Report'

  describe 'POST #create' do
    let(:export_type) { 'activity_sessions' }
    let(:filters) { { unit_id: '123' } }
    subject do
      post :create,         report_url: "/teachers/progress_reports/standards/classrooms/#{sweathogs.id}/students",
                            csv_export: {
                              export_type: export_type,
                              filters: filters
                            }
    end

    context 'when authenticated as a teacher' do
      before do
        session[:user_id] = mr_kotter.id
      end

      let(:response_json) { JSON.parse(response.body)['csv_export'] }

      it 'creates a CSV export with the specified type' do
        expect do
          subject
        end.to change(CsvExport, :count).by(1)
        expect(response_json['export_type']).to eq(export_type)

        expect(response_json['teacher_id']).to eq(mr_kotter.id)
      end

      it 'assigns filters from the request params' do
        subject
        expect(response_json['filters']).to have_key('unit_id')
      end

      it 'parses additional filters from the report_url' do
        subject
        expect(response_json['filters']).to have_key('classroom_id')
        expect(response_json['filters']['classroom_id'].to_i).to eq(sweathogs.id)
      end

      it 'kicks off a background job to email generate/email the CSV' do
        expect do
          subject
        end.to change(CsvExportWorker.jobs, :size).by(1)
      end

      context 'with nested export params' do
        let(:filters) { { 'sort' => { 'baz' => 'blah', 'bar' => 'bar' } } }

        it 'continues to work properly' do
          subject
          expect(response.status).to eq(200)
        end
      end

      context 'with a nonsense export type' do
        let(:export_type) { 'foobar' }

        it 'responds with an error' do
          expect do
            subject
          end.to_not change(CsvExport, :count)
          expect(response.status).to eq(422)
        end
      end
    end

    context 'when not authenticated as a teacher' do
      it 'requires a logged-in teacher' do
        subject
        expect(response.status).to eq(303)
      end
    end
  end
end
