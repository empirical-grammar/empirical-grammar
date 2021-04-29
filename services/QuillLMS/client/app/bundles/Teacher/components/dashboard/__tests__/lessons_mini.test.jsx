import * as React from 'react';
import { mount } from 'enzyme';
import request from 'request';

import LessonsMini from '../lessons_mini.tsx';

const lessons = [{"classroom_name":"Quill Classroom","activity_name":"Advanced Combining: Complex Sentences with Modifiers","activity_id":649,"classroom_unit_id":92,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/advanced_combining_modifiers/lesson2_complex_sentences_with_modifiers.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 1: And, Or, But, So","activity_id":563,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_sentences/lesson1_and_or_but_so.pdf"},{"classroom_name":"New Class","activity_name":"Complex Sentences Overview","activity_id":829,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/pronounproblems/lesson_1_complex_sentences_and_their_uses.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 1: Conjunctions of Time (After, Until, Before, etc.)","activity_id":566,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson1_conjunctions_of_time_after_until_before.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 1: Compound Objects and Predicates","activity_id":568,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson1_compound_objects_predicates.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 1: Participial Phrases ","activity_id":570,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/participial_phrases/lesson1_participial_phrases.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 2: Compound Subjects","activity_id":575,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson2_compound_subjects.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 2: Conjunctions of Opposition (Although, etc.)","activity_id":576,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson2_conjunctions_of _opposition_although_etc.pdf "},{"classroom_name":"New Class","activity_name":"Lesson 2: Participial Phrases Review","activity_id":577,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/participial_phrases/lesson2_participial_phrases_review.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 3: Compound Subjects, Objects, and Predicates Review","activity_id":578,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson3_compound_subjects_objects_predicates_review.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 4: Subordinating Conjunctions Review ","activity_id":579,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson4_subordinating_conjunctions_review.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 3: Conjunctions of Cause and Effect (Because, Since)","activity_id":580,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson3_conjunctions_of_cause_and_effect_because_ since.pdf"},{"classroom_name":"New Class","activity_name":"Lesson 2: And, Or, But, So Review","activity_id":581,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_sentences/lesson2_and_or_but_so_review.pdf"},{"classroom_name":"New Class","activity_name":"Advanced Combining: Complex Sentences with Modifiers","activity_id":649,"classroom_unit_id":91,"classroom_id":6,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/advanced_combining_modifiers/lesson2_complex_sentences_with_modifiers.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Advanced Combining: Complex Sentences with Modifiers","activity_id":649,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/advanced_combining_modifiers/lesson2_complex_sentences_with_modifiers.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: And, Or, But, So","activity_id":563,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_sentences/lesson1_and_or_but_so.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 3: Compound Subjects, Objects, and Predicates Review","activity_id":578,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson3_compound_subjects_objects_predicates_review.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: Compound Subjects","activity_id":575,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson2_compound_subjects.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Complex Sentences Overview","activity_id":829,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/pronounproblems/lesson_1_complex_sentences_and_their_uses.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: Conjunctions of Opposition (Although, etc.)","activity_id":576,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson2_conjunctions_of _opposition_although_etc.pdf "},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: Participial Phrases Review","activity_id":577,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/participial_phrases/lesson2_participial_phrases_review.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 4: Subordinating Conjunctions Review ","activity_id":579,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson4_subordinating_conjunctions_review.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: Conjunctions of Time (After, Until, Before, etc.)","activity_id":566,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson1_conjunctions_of_time_after_until_before.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 3: Conjunctions of Cause and Effect (Because, Since)","activity_id":580,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/complex_sentences/lesson3_conjunctions_of_cause_and_effect_because_ since.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: Compound Objects and Predicates","activity_id":568,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_subjects_objects_and_predicates/lesson1_compound_objects_predicates.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: Participial Phrases ","activity_id":570,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/participial_phrases/lesson1_participial_phrases.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: And, Or, But, So Review","activity_id":581,"classroom_unit_id":90,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/compound_sentences/lesson2_and_or_but_so_review.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: Adverbs ","activity_id":565,"classroom_unit_id":83,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/adverbs/lesson1_adverbs.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: Adverbs Review","activity_id":574,"classroom_unit_id":83,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/adverbs/lesson2_adverbs_review.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 2: Using In, At, and On to Show Location","activity_id":655,"classroom_unit_id":68,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/prepositions/lesson2_using_in_at_and_on_to_show_location.pdf"},{"classroom_name":"Quill Classroom","activity_name":"Lesson 1: Using In, At, and On to Show Time","activity_id":654,"classroom_unit_id":68,"classroom_id":1,"supporting_info":"https://assets.quill.org/documents/quill_lessons_pdf/prepositions/lesson1_using_in_at_and_on_to_show_time.pdf"}]

describe('LessonsMini component', () => {
  describe('on mobile', () => {

    it('should render when there are no lessons', () => {
      const wrapper = mount(<LessonsMini lessons={[]} onMobile={true} />)
      expect(wrapper).toMatchSnapshot();
    });

    it('should render when there are lessons', () => {
      const wrapper = mount(<LessonsMini lessons={lessons} onMobile={true} />)
      expect(wrapper).toMatchSnapshot();
    });

  })

  describe('not on mobile', () => {

    it('should render when there are no lessons', () => {
      const wrapper = mount(<LessonsMini lessons={[]} onMobile={false} />)
      expect(wrapper).toMatchSnapshot();
    });

    it('should render when there are lessons', () => {
      const wrapper = mount(<LessonsMini lessons={lessons} onMobile={false} />)
      expect(wrapper).toMatchSnapshot();
    });

  })

});