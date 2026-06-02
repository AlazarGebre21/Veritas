import { apiClient } from "./client.js";

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price
 * @property {string} currency
 * @property {'monthly'|'yearly'} billing_cycle
 * @property {boolean} is_active
 * @property {Record<string, string>} features
 * @property {string} stripe_price_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} number
 * @property {number} amount_due
 * @property {number} amount_paid
 * @property {number} amount_remaining
 * @property {string} currency
 * @property {string} status
 * @property {string} due_date
 * @property {string} paid_at
 * @property {string} enterprise_id
 * @property {string} subscription_id
 * @property {string} hosted_invoice_url
 * @property {string} invoice_pdf_url
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {number} amount
 * @property {string} currency
 * @property {string} status
 * @property {string} payment_method_type
 * @property {string} provider
 * @property {string} provider_payment_id
 * @property {string} provider_error_code
 * @property {string} provider_error_message
 * @property {string} invoice_id
 * @property {string} enterprise_id
 * @property {string} notes
 * @property {string} created_at
 */

/**
 * @typedef {Object} Subscription
 * @property {string} id
 * @property {string} enterprise_id
 * @property {string} plan_id
 * @property {string} status
 * @property {string} current_period_start
 * @property {string} current_period_end
 * @property {boolean} cancel_at_period_end
 * @property {string} canceled_at
 * @property {string} ended_at
 * @property {string} stripe_customer_id
 * @property {string} stripe_subscription_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} BillingSummary
 * @property {string} active_plan_name
 * @property {string} subscription_status
 * @property {string} next_billing_date
 * @property {number} outstanding_balance
 * @property {number} total_paid_ytd
 * @property {Payment|null} last_payment
 */

export const paymentApi = {
  // ── Public Endpoints ──────────────────────────────────────────────────────

  /**
   * List all active subscription plans (public endpoint).
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<{ data: SubscriptionPlan[], metadata: any }>}
   */
  listPlans: async (params) => {
    const { data } = await apiClient.get("/subscriptions/plans", { params });
    return data;
  },

  // ── System Admin Endpoints ────────────────────────────────────────────────

  /**
   * List all subscription plans, including inactive ones (admin only).
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<{ data: SubscriptionPlan[], metadata: any }>}
   */
  listAdminPlans: async (params) => {
    const { data } = await apiClient.get("/admin/plans", { params });
    return data;
  },

  /**
   * Create a new subscription plan (admin only).
   * @param {{ name: string, slug: string, description?: string, price: number, currency?: string, billing_cycle: string, is_active?: boolean, stripe_price_id?: string, features?: Record<string, string> }} payload
   * @returns {Promise<SubscriptionPlan>}
   */
  createPlan: async (payload) => {
    const { data } = await apiClient.post("/admin/plans", payload);
    return data;
  },

  /**
   * Update an existing subscription plan (admin only).
   * @param {string} planId
   * @param {Partial<{ name: string, slug: string, description: string, price: number, currency: string, billing_cycle: string, is_active: boolean, stripe_price_id: string, features: Record<string, string> }>} payload
   * @returns {Promise<SubscriptionPlan>}
   */
  updatePlan: async (planId, payload) => {
    const { data } = await apiClient.patch(`/admin/plans/${planId}`, payload);
    return data;
  },

  /**
   * Deactivate a subscription plan (sets is_active = false). Admin only.
   * @param {string} planId
   * @returns {Promise<void>}
   */
  deactivatePlan: async (planId) => {
    await apiClient.delete(`/admin/plans/${planId}`);
  },

  /**
   * Manually override an enterprise's subscription plan and status (admin only).
   * Bypasses payment providers.
   * @param {string} enterpriseId
   * @param {{ plan_id: string, status: string, period_start: string, period_end: string }} payload
   * @returns {Promise<void>}
   */
  overrideSubscription: async (enterpriseId, payload) => {
    await apiClient.post(`/admin/subscriptions/${enterpriseId}`, payload);
  },

  /**
   * Start a free trial subscription for an enterprise (admin only).
   * @param {string} enterpriseId
   * @param {{ plan_id: string, trial_days: number }} payload
   * @returns {Promise<void>}
   */
  startTrial: async (enterpriseId, payload) => {
    await apiClient.post(`/admin/subscriptions/${enterpriseId}/trial`, payload);
  },

  /**
   * Refund a specific invoice (admin only).
   * @param {string} invoiceId
   * @param {{ amount: number, reason: string }} payload
   * @returns {Promise<void>}
   */
  refundInvoice: async (invoiceId, payload) => {
    await apiClient.post(`/admin/invoices/${invoiceId}/refund`, payload);
  },

  // ── Shared Endpoints (SystemAdmin + EnterpriseAdmin) ──────────────────────

  /**
   * Get the current active subscription for an enterprise.
   * @param {string} enterpriseId
   * @returns {Promise<Subscription>}
   */
  getSubscription: async (enterpriseId) => {
    const { data } = await apiClient.get(`/subscriptions/${enterpriseId}`);
    return data;
  },

  /**
   * Get a single payment by ID.
   * @param {string} paymentId
   * @returns {Promise<Payment>}
   */
  getPayment: async (paymentId) => {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    return data;
  },

  /**
   * Get a single invoice by ID.
   * @param {string} invoiceId
   * @returns {Promise<Invoice>}
   */
  getInvoice: async (invoiceId) => {
    const { data } = await apiClient.get(`/invoices/${invoiceId}`);
    return data;
  },

  // ── Enterprise Admin Endpoints ────────────────────────────────────────────
  // No custom headers needed — backend resolves enterprise from JWT.

  /**
   * List invoices for the authenticated enterprise.
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<{ data: Invoice[], metadata: any }>}
   */
  listInvoices: async (params) => {
    const { data } = await apiClient.get("/invoices", { params });
    return data;
  },

  /**
   * Get payment history for the authenticated enterprise.
   * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string }} [params]
   * @returns {Promise<{ data: Payment[], metadata: any }>}
   */
  getPaymentHistory: async (params) => {
    const { data } = await apiClient.get("/payments/history", { params });
    return data;
  },

  /**
   * Get aggregated billing summary for the authenticated enterprise.
   * @returns {Promise<BillingSummary>}
   */
  getBillingSummary: async () => {
    const { data } = await apiClient.get("/billing/summary");
    return data;
  },

  /**
   * Cancel an enterprise subscription.
   * @param {string} enterpriseId
   * @param {{ cancel_at_period_end: boolean }} payload
   * @returns {Promise<void>}
   */
  cancelSubscription: async (enterpriseId, payload) => {
    await apiClient.post(`/subscriptions/${enterpriseId}/cancel`, payload);
  },

  /**
   * Reactivate a subscription scheduled for cancellation.
   * @param {string} enterpriseId
   * @returns {Promise<void>}
   */
  reactivateSubscription: async (enterpriseId) => {
    await apiClient.post(`/subscriptions/${enterpriseId}/reactivate`);
  },

  /**
   * Create a checkout session to upgrade an enterprise subscription.
   * @param {string} enterpriseId
   * @param {string} planId
   * @param {'stripe'|'chapa'} [provider] - Optional payment provider. Defaults to 'stripe'.
   * @returns {Promise<any>}
   */
  upgradeSubscription: async (enterpriseId, planId, provider) => {
    const body = { plan_id: planId };
    if (provider) body.provider = provider;
    const { data } = await apiClient.post(`/subscriptions/${enterpriseId}/upgrade`, body);
    return data;
  },
};
