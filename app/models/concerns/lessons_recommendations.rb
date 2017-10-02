include PublicProgressReports

module LessonsRecommendations
    extend ActiveSupport::Concern

    def get_recommended_lessons unit_id, classroom_id, activity_id
      @activity_id = activity_id
      @classroom_activity = ClassroomActivity.find_by(classroom_id: classroom_id, unit_id: unit_id, activity_id: activity_id)
      @activity_sessions_with_counted_concepts = act_sesh_with_counted_concepts
      get_recommendations
    end

    def get_activity_sessions
      ActivitySession.includes(concept_results: :concept)
                      .where(classroom_activity_id: @classroom_activity.id, is_final_score: true)
    end

    def act_sesh_with_counted_concepts
      @activity_sessions = get_activity_sessions
      PublicProgressReports.activity_sessions_with_counted_concepts(@activity_sessions)
    end

    def get_recommendations
      LessonRecommendations.new.send("recs_for_activity", @activity_id, @classroom_activity.classroom_id).map do |lessons_rec|
        fail_count = 0
        @activity_sessions_with_counted_concepts.each do |activity_session|
          lessons_rec[:requirements].each do |req|
            if req[:noIncorrect] && activity_session[:concept_scores][req[:concept_id]]["total"] > activity_session[:concept_scores][req[:concept_id]]["correct"]
              fail_count += 1
              break
            end
            if activity_session[:concept_scores][req[:concept_id]]["correct"] < req[:count]
              fail_count += 1
              break
            end
          end
        end
        return_value_for_lesson_recommendation(lessons_rec, fail_count)
      end
    end

    def return_value_for_lesson_recommendation(lessons_rec, fail_count)
      {
        activity_pack_id: lessons_rec[:activityPackId],
        name: lessons_rec[:recommendation],
        percentage_needing_instruction: percentage_needing_instruction(fail_count),
        activities: lessons_rec[:activities],
        previously_assigned: lessons_rec[:previously_assigned]
      }
    end

    def percentage_needing_instruction(fail_count)
      @total_count ||= @activity_sessions.length
      if fail_count.nil? && @total_count.nil?
        puts 'percentage_needing_instruction fail_count and @total_count are both nil'
        puts "Activity ID: #{@activity_id}"
        puts "Classroom ID: #{@classroom_activity.classroom_id}"
        return 0
      end
      ((fail_count.to_f/@total_count.to_f)*100).round
    end

end
