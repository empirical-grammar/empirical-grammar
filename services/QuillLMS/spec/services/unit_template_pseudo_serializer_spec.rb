require 'rails_helper'

describe UnitTemplatePseudoSerializer do
  let(:diagnostic) { create(:diagnostic_activity) }
  let(:lesson) { create(:lesson_activity) }
  let(:grammar) { create(:grammar_activity) }
  let(:unit_template) { create(:unit_template, unit_template_category_id: 0, activities: [grammar] ) }
  let(:unit_template_with_diagnostic) { create(:unit_template, activities: [diagnostic] ) }
  let(:unit_template_with_lesson) { create(:unit_template, activities: [lesson] ) }

  it('will have nil values for the unit template category attributes if there is no unit template category') do
    serialized_ut = UnitTemplatePseudoSerializer.new(unit_template)
    expect(serialized_ut.unit_template_category['primary_color']).not_to be
    expect(serialized_ut.unit_template_category['secondary_color']).not_to be
    expect(serialized_ut.unit_template_category[:name]).not_to be
    expect(serialized_ut.unit_template_category['id']).not_to be
  end

  it('will have a Diagnostic type if it includes a diagnostic activity') do
    serialized_ut = UnitTemplatePseudoSerializer.new(unit_template_with_diagnostic)
    expect(serialized_ut.type[:name]).to eq 'Diagnostic'
  end

  it('will have a Whole class + Independent practice type if it includes a lessons activity') do
    serialized_ut = UnitTemplatePseudoSerializer.new(unit_template_with_lesson)
    expect(serialized_ut.type[:name]).to eq 'Whole class + Independent practice'
  end

  it('will have an Independent practice type if it includes neither a diagnostic nor a lessons activity') do
    serialized_ut = UnitTemplatePseudoSerializer.new(unit_template)
    expect(serialized_ut.type[:name]).to eq 'Independent practice'
  end
end
