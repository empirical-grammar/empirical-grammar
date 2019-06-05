class Mutations::Concepts::Edit < Mutations::BaseMutation
  def self.authorized?(value, context)
    if !context[:current_user].staff?
      raise GraphQL::ExecutionError, "Only staff can run this mutation"
    else
      true
    end
  end

  null false

  argument :id, ID, required: true
  argument :name, String, required: false
  argument :description, String, required: false
  argument :parent_id, ID, required: false
  argument :visible, Boolean, required: false
  argument :change_logs, [Types::ChangeLogInput], required: true

  field :concept, Types::ConceptType, null: true
  field :errors, [String], null: false

  def resolve(inputs)
    concept = Concept.find(inputs[:id])
    change_logs = inputs[:change_logs].map do |cl|
      {
        explanation: cl[:explanation],
        action: cl[:action],
        changed_record_id: cl[:conceptID],
        changed_record_type: 'concept',
        user_id: context[:current_user].id
      }
    end
    values = inputs.reject{|k,v| k == :id || k === :change_logs}
    ChangeLog.create(change_logs)
    if concept.update(values)
      # Successful update, return the updated object with no errors
      {
        concept: concept,
        errors: [],
      }
    else
      # Failed save, return the errors to the client
      {
        concept: concept,
        errors: concept.errors.full_messages
      }
    end
  end
end
