import { apiClient } from "./client.js";

/**
 * @typedef {Object} QuestionOption
 * @property {string} [id]
 * @property {string} content
 * @property {boolean} isCorrect
 * @property {string} [questionId]
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} enterpriseId
 * @property {string} title
 * @property {string} content
 * @property {'MCQ'|'TrueFalse'|'ShortAnswer'|'Essay'} type
 * @property {'Easy'|'Medium'|'Hard'} difficulty
 * @property {number} points
 * @property {number} negativePoints
 * @property {string} topic
 * @property {boolean} isActive
 * @property {string} mediaUrl
 * @property {QuestionOption[]} options
 * @property {Record<string, string>} metadata
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 */

/**
 * @typedef {Object} CreateQuestionPayload
 * @property {string} title
 * @property {string} content
 * @property {'MCQ'|'TrueFalse'|'ShortAnswer'|'Essay'} type
 * @property {'Easy'|'Medium'|'Hard'} difficulty
 * @property {number} points
 * @property {number} [negativePoints]
 * @property {string} [topic]
 * @property {boolean} [isActive]
 * @property {string} [mediaUrl]
 * @property {{ content: string, isCorrect: boolean }[]} [options]
 * @property {Record<string, string>} [metadata]
 */

export const questionApi = {
  /**
   * List questions for the caller enterprise.
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string, with_correct_answer?: boolean }} [params]
   * @returns {Promise<{ data: Question[], metadata: any }>}
   */
  list: async (params = {}) => {
    const { data } = await apiClient.get("/questions", { params });
    return data;
  },

  /**
   * Create a question.
   * @param {CreateQuestionPayload} payload
   * @returns {Promise<Question>}
   */
  create: async (payload) => {
    const { data } = await apiClient.post("/questions", payload);
    return data;
  },

  /**
   * Get a question by ID.
   * @param {string} id
   * @param {{ with_correct_answer?: boolean }} [params]
   * @returns {Promise<Question>}
   */
  getById: async (id, params = {}) => {
    const { data } = await apiClient.get(`/questions/${id}`, { params });
    return data;
  },

  /**
   * Update question fields.
   * @param {string} id
   * @param {Partial<CreateQuestionPayload>} payload
   * @returns {Promise<void>}
   */
  update: async (id, payload) => {
    await apiClient.patch(`/questions/${id}`, payload);
  },

  /**
   * Delete a question.
   * @param {string} id
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await apiClient.delete(`/questions/${id}`);
  },

  /**
   * Upload media (image, video, PDF) for a question. Max 5 MB.
   * @param {string} questionId
   * @param {File} file
   * @returns {Promise<{ mediaUrl: string }>}
   */
  uploadMedia: async (questionId, file) => {
    const formData = new FormData();
    formData.append("media", file);
    const { data } = await apiClient.post(`/questions/${questionId}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
