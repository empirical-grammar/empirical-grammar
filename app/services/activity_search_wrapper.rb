class ActivitySearchWrapper
  RESULTS_PER_PAGE = 12

  def initialize(search_query, filters, sort)
    @search_query = search_query
    @filters = process_filters(filters)
    @sort = sort
    @activities = []
    @activity_classifications = []
    @topics = []
    @topic_categories = []
    @sections = []
    @number_of_pages = nil
  end

  def search
    @activities = ActivitySearch.search(@search_query, @filters, @sort)
    @activity_classifications = @activities.map(&:classification).uniq.compact
    @activity_classifications = @activity_classifications.map { |c| ClassificationSerializer.new(c).as_json(root: false) }

    @topics = @activities.includes(topic: [:topic_category, { section: :workbook }]).map(&:topic).uniq.compact
    @topic_categories = @topics.map(&:topic_category).uniq.compact
    @sections = @topics.map(&:section).uniq.compact

    @number_of_pages = (@activities.count.to_f / RESULTS_PER_PAGE.to_f).ceil
    @activities = @activities.map { |a| (ActivitySerializer.new(a)).as_json(root: false) }
  end

  def result
    hash = {
      activities: @activities,
      activity_classifications: @activity_classifications,
      topic_categories: @topic_categories,
      sections: @sections,
      number_of_pages: @number_of_pages
    }
    hash
  end

  private

  def process_filters(filters)
    filter_fields = [:activity_classifications, :topic_categories, :sections]
    filters.reduce({}) do |acc, filter|
      filter_value = filter[1]
      # activityClassification -> activity_classifications
      # Just for the record, this is a terrible hacky workaround.
      model_name = filter_value['field'].to_s.pluralize.underscore.to_sym
      model_id = filter_value['selected'].to_i
      if filter_fields.include?(model_name) && !model_id.zero?
        acc[model_name] = model_id
      end
      acc
    end
  end
end
