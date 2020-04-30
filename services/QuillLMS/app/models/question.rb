class Question < ActiveRecord::Base
  TYPES = [
    TYPE_CONNECT_SENTENCE_COMBINING = 'connect_sentence_combining',
    TYPE_CONNECT_SENTENCE_FRAGMENTS = 'connect_sentence_fragments',
    TYPE_CONNECT_FILL_IN_BLANKS = 'connect_fill_in_blanks',
    TYPE_DIAGNOSTIC_SENTENCE_COMBINING = 'diagnostic_sentence_combining',
    TYPE_DIAGNOSTIC_SENTENCE_FRAGMENTS = 'diagnostic_sentence_fragments',
    TYPE_DIAGNOSTIC_FILL_IN_BLANKS = 'diagnostic_fill_in_blanks',
    TYPE_GRAMMAR_QUESTION = 'grammar',
    TYPE_PROOFREADER_PASSAGE = 'proofreader_passage'
  ]
  validates :data, presence: true
  validates :question_type, presence: true, inclusion: {in: TYPES}
  validates :uid, presence: true, uniqueness: true
  validate :data_must_be_hash

  after_save :expire_all_questions_cache
  after_destroy :expire_all_questions_cache

  def as_json(options=nil)
    data
  end

  def add_focus_point(new_data)
    set_focus_point(new_uuid, new_data)
  end

  def set_focus_point(focus_point_id, new_data)
    data['focusPoints'] ||= {}
    data['focusPoints'][focus_point_id] = new_data
    save
    focus_point_id
  end

  def update_focus_points(new_data)
    data['focusPoints'] = new_data
    save
  end

  def delete_focus_point(focus_point_id)
    data['focusPoints'].delete(focus_point_id)
    save
  end

  def update_flag(flag_value)
    data['flag'] = flag_value
    save
  end

  def update_model_concept(model_concept_id)
    data['modelConceptUID'] = model_concept_id
    save
  end

  def get_incorrect_sequence(incorrect_sequence_id)
    return nil if !data['incorrectSequences']
    incorrect_sequence_id = incorrect_sequence_id.to_i if stored_as_array('incorrectSequences')
    return data['incorrectSequences'][incorrect_sequence_id]
  end

  def add_incorrect_sequence(new_data)
    if stored_as_array('incorrectSequences')
      new_id = data['incorrectSequences'].length
    else
      new_id = new_uuid
    end
    set_incorrect_sequence(new_id, new_data)
  end

  def set_incorrect_sequence(incorrect_sequence_id, new_data)
    data['incorrectSequences'] ||= {}
    incorrect_sequence_id = incorrect_sequence_id.to_i if stored_as_array('incorrectSequences')
    data['incorrectSequences'][incorrect_sequence_id] = new_data
    save
    incorrect_sequence_id
  end

  def update_incorrect_sequences(new_data)
    data['incorrectSequences'] = new_data
    save
  end

  def delete_incorrect_sequence(incorrect_sequence_id)
    if stored_as_array('incorrectSequences')
      data['incorrectSequences'].delete_at(incorrect_sequence_id.to_i)
    else
      data['incorrectSequences'].delete(incorrect_sequence_id)
    end
    save
  end

  private def expire_all_questions_cache
    cache_key = Api::V1::QuestionsController::ALL_QUESTIONS_CACHE_KEY + "_#{question_type}"
    $redis.del(cache_key)
    cache_key = "#{Api::V1::QuestionsController::QUESTION_CACHE_KEY_PREFIX}_#{uid}"
    $redis.del(cache_key)
  end

  private def new_uuid
    SecureRandom.uuid
  end

  private def data_must_be_hash
    errors.add(:data, "must be a hash") unless data.is_a?(Hash)
  end

  private def stored_as_array(key)
    data[key].class == Array
  end
end
