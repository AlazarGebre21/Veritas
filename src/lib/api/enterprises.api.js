import { apiClient } from "./client.js";

/**
 * @typedef {Object} RegisterEnterprisePayload
 * @property {string} contactEmail
 * @property {string} displayName
 * @property {string} legalName
 * @property {string} ownerEmail
 * @property {string} ownerPassword
 * @property {string} slug
 */

export const enterpriseApi = {
  /**
   * Register a new enterprise (public endpoint).
   * @param {RegisterEnterprisePayload} payload
   * @returns {Promise<any>}
   */
  register: async (payload) => {
    // According to API docs, public registration uses POST /enterprises
    const { data } = await apiClient.post("/enterprises", payload);
    return data;
  },

  /**
   * List enterprises (System Admin only)
   * @param {{ status?: string, subscription_status?: string, search?: string, page?: number, limit?: number, sort?: string, sort_dir?: string }} params
   * @returns {Promise<any>}
   */
  list: async (params) => {
    const { data } = await apiClient.get("/enterprises", { params });
    return data;
  },

  /**
   * Get an enterprise by ID.
   * @param {string} id
   * @returns {Promise<any>}
   */
  getById: async (id) => {
    const { data } = await apiClient.get(`/enterprises/${id}`);
    return data;
  },

  /**
   * Update enterprise status (System Admin).
   * @param {{ id: string, status: string, reason?: string }} params
   * @returns {Promise<any>}
   */
  updateStatus: async ({ id, status, reason }) => {
    const { data } = await apiClient.patch(`/enterprises/${id}/status`, { status, reason });
    return data;
  },

  /**
   * Get audit logs for an enterprise (System Admin & Enterprise Admin).
   * @param {string} enterpriseId
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<any>}
   */
  getAuditLogs: async (enterpriseId, params = {}) => {
    const { data } = await apiClient.get(`/enterprises/${enterpriseId}/audit-logs`, { params });
    return data;
  },

  /**
   * Soft-delete an enterprise (System Admin only).
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteEnterprise: async (id) => {
    await apiClient.delete(`/enterprises/${id}`);
  },

  /**
   * Permanently delete an enterprise (System Admin only).
   * @param {string} id
   * @returns {Promise<void>}
   */
  hardDelete: async (id) => {
    await apiClient.delete(`/enterprises/${id}/permanent`);
  },

  /**
   * Approve a pending enterprise.
   * @param {string} id
   * @returns {Promise<void>}
   */
  approve: async (id) => {
    await apiClient.post(`/enterprises/${id}/approve`);
  },

  /**
   * Reactivate a suspended enterprise.
   * @param {string} id
   * @returns {Promise<void>}
   */
  reactivate: async (id) => {
    await apiClient.post(`/enterprises/${id}/reactivate`);
  },

  /**
   * Restore a soft-deleted enterprise.
   * @param {string} id
   * @returns {Promise<void>}
   */
  restore: async (id) => {
    await apiClient.post(`/enterprises/${id}/restore`);
  },

  /**
   * Suspend an active enterprise.
   * @param {string} id
   * @returns {Promise<void>}
   */
  suspend: async (id) => {
    await apiClient.post(`/enterprises/${id}/suspend`);
  },

  /**
   * Get detailed enterprise status.
   * @param {string} id
   * @returns {Promise<any>}
   */
  getStatus: async (id) => {
    const { data } = await apiClient.get(`/enterprises/${id}/status`);
    return data;
  },


  // ── Enterprise Admin Methods ────────────────────────────────────────────

  /**
   * Get the enterprise for the current authenticated user.
   * @returns {Promise<any>}
   */
  getMe: async () => {
    const { data } = await apiClient.get("/enterprises/me");
    return data;
  },

  /**
   * Get enterprise by slug (requires valid token).
   * @param {string} slug
   * @returns {Promise<any>}
   */
  getBySlug: async (slug) => {
    const { data } = await apiClient.get(`/enterprises/slug/${slug}`);
    return data;
  },

  /**
   * Update enterprise profile fields.
   * @param {string} id
   * @param {Object} payload
   * @returns {Promise<void>}
   */
  update: async (id, payload) => {
    await apiClient.patch(`/enterprises/${id}`, payload);
  },

  /**
   * Update enterprise branding (logo, colors).
   * @param {string} id
   * @param {{ logo_url?: string, primary_color?: string, secondary_color?: string }} payload
   * @returns {Promise<void>}
   */
  updateBranding: async (id, payload) => {
    await apiClient.patch(`/enterprises/${id}/branding`, payload);
  },

  /**
   * Upload enterprise logo image (png, jpg, jpeg — max 3 MB).
   * @param {string} id
   * @param {File} file
   * @returns {Promise<any>}
   */
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await apiClient.post(`/enterprises/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  /**
   * Merge-patch the enterprise settings object.
   * @param {string} id
   * @param {Object} payload
   * @returns {Promise<void>}
   */
  updateSettings: async (id, payload) => {
    await apiClient.patch(`/enterprises/${id}/settings`, payload);
  },

  /**
   * Get compact operational summary for an enterprise.
   * @param {string} id
   * @returns {Promise<any>}
   */
  getSummary: async (id) => {
    const { data } = await apiClient.get(`/enterprises/${id}/summary`);
    return data;
  },

  // ── User / Staff Management ─────────────────────────────────────────────

  /**
   * List users belonging to an enterprise (paginated).
   * @param {string} enterpriseId
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<{ data: any[], metadata: any }>}
   */
  listUsers: async (enterpriseId, params = {}) => {
    const { data } = await apiClient.get(`/enterprises/${enterpriseId}/users`, { params });
    return data;
  },

  /**
   * Create a user scoped to an enterprise.
   * @param {string} enterpriseId
   * @param {{ email: string, first_name: string, last_name: string, password: string, role: string, honorific?: string, phone?: string }} payload
   * @returns {Promise<any>}
   */
  createUser: async (enterpriseId, payload) => {
    const { data } = await apiClient.post(`/enterprises/${enterpriseId}/users`, payload);
    return data;
  },

  /**
   * Get a specific user within an enterprise.
   * @param {string} enterpriseId
   * @param {string} userId
   * @returns {Promise<any>}
   */
  getUser: async (enterpriseId, userId) => {
    const { data } = await apiClient.get(`/enterprises/${enterpriseId}/users/${userId}`);
    return data;
  },

  /**
   * Update profile and role fields for an enterprise user.
   * @param {string} enterpriseId
   * @param {string} userId
   * @param {{ first_name?: string, last_name?: string, role?: string, honorific?: string, phone?: string }} payload
   * @returns {Promise<void>}
   */
  updateUser: async (enterpriseId, userId, payload) => {
    await apiClient.patch(`/enterprises/${enterpriseId}/users/${userId}`, payload);
  },

  /**
   * Deactivate a user without permanent deletion.
   * @param {string} enterpriseId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  deactivateUser: async (enterpriseId, userId) => {
    await apiClient.patch(`/enterprises/${enterpriseId}/users/${userId}/deactivate`);
  },

  /**
   * Reactivate a previously deactivated user.
   * @param {string} enterpriseId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  activateUser: async (enterpriseId, userId) => {
    await apiClient.patch(`/enterprises/${enterpriseId}/users/${userId}/activate`);
  },

  /**
   * Delete a user within an enterprise.
   * @param {string} enterpriseId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  deleteEnterpriseUser: async (enterpriseId, userId) => {
    const { data } = await apiClient.delete(`/enterprises/${enterpriseId}/users/${userId}`);
    return data;
  },

  /**
   * Reset a user password → returns temporary password.
   * @param {string} enterpriseId
   * @param {string} userId
   * @returns {Promise<{ temporary_password: string }>}
   */
  resetUserPassword: async (enterpriseId, userId) => {
    const { data } = await apiClient.post(`/enterprises/${enterpriseId}/users/${userId}/reset-password`);
    return data;
  },

  /**
   * Self-service password change for an authenticated user.
   * @param {string} enterpriseId
   * @param {string} userId
   * @param {{ current_password: string, new_password: string }} payload
   * @returns {Promise<void>}
   */
  changePassword: async (enterpriseId, userId, payload) => {
    await apiClient.post(`/enterprises/${enterpriseId}/users/${userId}/change-password`, payload);
  },
};
