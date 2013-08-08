class ChapterTest
  delegate :params, to: :@context

  def initialize context
    @context = context
  end

  def current_step
    if params[:controller] == "stories"
      :story
    elsif params[:step] == "practice"
      :practice
    elsif params[:step] == "review"
      :review
    else
      raise "unknown step."
    end
  end

  def current_rule
    step(current_step).rules.find{ |r| r.id.to_s == @context.params[:id] }.rule
  end

  def steps
    [:practice, :story, :review].map{ |s| Step.new(s, self) }
  end

  def step step
    steps.find{ |s| s.step == step }
  end

  def chapter
    @context.instance_variable_get(:@chapter)
  end

  def score
    @context.instance_variable_get(:@score)
  end

  class Step
    attr_reader :step

    delegate :current_step, :current_rule, :chapter, :score, to: :@context

    def initialize step, context
      @step = step
      @context = context
    end

    def css_class
      if current_step?
        "current"
      else
        "not-current"
      end
    end

    def title
      I18n.t(:title, scope: :"chapter_test_step.#{step}")
    end

    def current_step?
      current_step == step
    end

    def rules
      res = case step
      when :practice
        chapter.practice_rules
      when :story
        []
      when :review
        score.missed_rules
      end

      res.map{ |r| Rule.new(r, @context) }
    end

    def next_rule
      rules[rules.map(&:rule).index(current_rule) + 1]
    end
  end

  class Rule
    attr_reader :rule

    delegate :title, :id, to: :rule
    delegate :current_rule, to: :@context

    def initialize rule, context
      @rule = rule
      @context = context
    end

    def css_class
      if current_rule?
        "current-rule"
      else
        ""
      end
    end

    def current_rule?
      current_rule == rule
    end
  end
end

