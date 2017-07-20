class Activity < ActiveRecord::Base
  include Flags
  include Uid

  has_and_belongs_to_many :unit_templates
  belongs_to :classification, class_name: 'ActivityClassification', foreign_key: 'activity_classification_id'
  belongs_to :topic

  has_one :section, through: :topic

  has_many :classroom_activities, dependent: :destroy
  has_many :classrooms, through: :classroom_activities
  has_many :units, through: :classroom_activities
  before_create :flag_as_beta, unless: :flags?
  after_commit :clear_activity_search_cache

  scope :production, -> {
    where(<<-SQL, :production)
      activities.flags = '{}' OR ? = ANY (activities.flags)
    SQL
  }

  scope :beta_user, -> { where("'beta' = ANY(activities.flags) OR 'production' = ANY(activities.flags)")}
  scope :alpha_user, -> { where("'alpha' = ANY(activities.flags) OR 'beta' = ANY(activities.flags) OR 'production' = ANY(activities.flags)")}

  scope :with_classification, -> { includes(:classification).joins(:classification) }

  def topic_uid= uid
    self.topic_id = Topic.find_by_uid(uid).id
  end

  def activity_classification_uid= uid
    self.activity_classification_id = ActivityClassification.find_by(uid: uid).id
  end

  # filters = hash of model_name/model_id pairs
  # sort = hash with 'field' and 'asc_or_desc' (?) as keys
  def self.search(search_text, filters, sort)
    query = includes(:classification, topic: [:section, :topic_category])
      .where("'production' = ANY(activities.flags)")
      .where("(activities.name ILIKE ?) OR (topic_categories.name ILIKE ?)", "%#{search_text}%", "%#{search_text}%")
      .where("topic_categories.id IS NOT NULL AND sections.id IS NOT NULL")
      .order(search_sort_sql(sort)).references(:topic)

    # Sorry for the meta-programming.
    filters.each do |model_name, model_id| # :activity_classifications, 123
      query = query.where("#{model_name}.id = ?", model_id)
    end

    query
  end

  def self.user_scope(user_flag)
    if user_flag == 'alpha'
      Activity.alpha_user
    elsif user_flag == 'beta'
      Activity.beta_user
    else
      Activity.production
    end
  end

  def self.search_sort_sql(sort)
    return 'sections.name asc' if sort.blank?

    if sort['asc_or_desc'] == 'desc'
      order = 'desc'
    else
      order = 'asc'
    end

    case sort['field']
    when 'activity'
      field = 'activities.name'
    when 'activity_classification'
      field = 'activity_classifications.name'
    when 'section'
      field = 'sections.name'
    when 'topic_category'
      field = 'topic_categories.name'
    end

    field + ' ' + order
  end

  def classification_key= key
    self.classification = ActivityClassification.find_by_key(key)
  end

  def classification_key
    classification.try(:key)
  end

  def form_url
    url = Addressable::URI.parse(classification.form_url)

    if uid.present?
      params = (url.query_values || {})
      params[:uid] = uid
      url.query_values = params
    end

    url
  end

  def module_url(activity_session)
    @activity_session = activity_session
    initial_params = {student: activity_session.uid}
    module_url_helper(initial_params)
  end

  def anonymous_module_url
    initial_params = {anonymous: true}
    module_url_helper(initial_params)
  end

  # TODO cleanup
  def flag flag = nil
    return super(flag) unless flag.nil?
    flags.first
  end

  def flag= flag
    flag = :archived if flag.to_sym == :archive
    self.flags = [flag]
  end

  def clear_activity_search_cache
    # can't call class methods from callback
    self.class.clear_activity_search_cache
  end

  def self.clear_activity_search_cache
    $redis.del('default_activity_search')
  end

  def self.set_activity_search_cache
    $redis.set('default_activity_search', ActivitySearchWrapper.new.search.to_json)
  end

  private

  def flag_as_beta
    flag 'beta'
  end

  def lesson_url_helper
    # replace non-alphanumeric characters with underscore
    @url += name.gsub(/(\W|\d)/, "_").downcase + '?'
    @url.query_values = {classroom_activity_id: @activity_session.classroom_activity.id, student: @activity_session.id}
    @url
  end

  def module_url_helper(initial_params)
    @url = Addressable::URI.parse(classification.module_url)
    if classification.key == 'lessons'
      lesson_url_helper
    else
      params = (@url.query_values || {})
      params.merge!(initial_params)
      params[:uid] = uid if uid.present?
      @url.query_values = params
      fix_angular_fragment!
    end
  end

  def homepage_path(path, classification)
    case classification.app_name.to_sym
    when :grammar
      '/stories/homepage'
    when :writer
      '/'
    end
  end

  def fix_angular_fragment!

    unless @url.fragment.blank?
      @url.path = "/##{url.fragment}"
      @url.fragment = nil
    end

    return @url
  end



end
