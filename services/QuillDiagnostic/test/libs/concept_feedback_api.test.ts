import {
  mockRequestDelete,
  mockRequestGet,
  mockRequestPost,
  mockRequestPut,
} from '../__mocks__/request_wrapper'
jest.mock('../../app/libs/request', () => ({
  requestDelete: mockRequestDelete,
  requestGet: mockRequestGet,
  requestPost: mockRequestPost,
  requestPut: mockRequestPut,
}))

import {
  ConceptFeedbackApi,
  conceptFeedbackApiBaseUrl,
  CONNECT_TYPE
} from '../../app/libs/concept_feedback_api'

import {
  ConceptFeedback,
} from '../../app/interfaces/concept_feedback'

describe('ConceptFeedbackApi calls', () => {
  describe('getAll', () => {
    it('should call requestGet', () => {
      const url = `${conceptFeedbackApiBaseUrl}.json?activity_type=${CONNECT_TYPE}`
      ConceptFeedbackApi.getAll()
      expect(mockRequestGet).toHaveBeenLastCalledWith(url)
    })
  })

  describe('get', () => {
    it('should call requestGet', () => {
      const MOCK_ID = 'id'
      const url = `${conceptFeedbackApiBaseUrl}/${MOCK_ID}.json?activity_type=${CONNECT_TYPE}`
      ConceptFeedbackApi.get(MOCK_ID)
      expect(mockRequestGet).toHaveBeenLastCalledWith(url)
    })
  })

  describe('create', () => {
    it('should call requestPost', () => {
      const MOCK_CONTENT : ConceptFeedback = {
        name: 'test',
      }
      const url = `${conceptFeedbackApiBaseUrl}.json?activity_type=${CONNECT_TYPE}`
      ConceptFeedbackApi.create(MOCK_CONTENT)
      expect(mockRequestPost).toHaveBeenLastCalledWith(url, {concept_feedback: MOCK_CONTENT})
    })
  })

  describe('update', () => {
    it('should call requestPut', () => {
      const MOCK_ID = 'id'
      const MOCK_CONTENT : ConceptFeedback = {
        name: 'test',
      }
      const url = `${conceptFeedbackApiBaseUrl}/${MOCK_ID}.json?activity_type=${CONNECT_TYPE}`
      ConceptFeedbackApi.update(MOCK_ID, MOCK_CONTENT)
      expect(mockRequestPut).toHaveBeenLastCalledWith(url, {concept_feedback: MOCK_CONTENT})
    })
  })

  describe('remove', () => {
    it('should call requestDelete', () => {
      const MOCK_QUESTION_ID = 'id'
      const url = `${conceptFeedbackApiBaseUrl}/${MOCK_QUESTION_ID}.json?activity_type=${CONNECT_TYPE}`
      ConceptFeedbackApi.remove(MOCK_QUESTION_ID)
      expect(mockRequestDelete).toHaveBeenLastCalledWith(url)
    })
  })
})
