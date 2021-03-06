class FullnameValidator < ActiveModel::Validator

  def validate(record)
    return if record.name.nil?
    f,l = SplitName.new(record.name).call
    if f.nil? or l.nil?
      record.errors.add(:name, :must_include_first_and_last_name)
    end
  end
end
