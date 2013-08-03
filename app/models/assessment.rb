class Assessment < ActiveRecord::Base
  attr_accessible :body, :chapter_id
  belongs_to :chapter

  def chunks
    @chunks ||= ::GrammarChunker.chunk(parsed)
  end

  def parsed
    @parsed ||= ::GrammarParser.new.parse(body)[:questions]
  end

  def as_json *args
    super.merge({
      rule_position: chapter.rule_position
    })
  end
end
