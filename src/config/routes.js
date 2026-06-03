/**
 * @fileoverview All application route paths defined in one place.
 * Never hardcode path strings in components — always use ROUTES.*
 */

export const ROUTES = {
  // Public
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Candidate exam (token auth, no JWT)
  EXAM_ACCESS: "/exam",
  EXAM_START: "/exam/start",
  EXAM_SESSION: "/exam/session/:id",
  EXAM_RESULT: "/exam/result/:sessionId",

  // SystemAdmin
  ADMIN: "/admin",
  ADMIN_ENTERPRISES: "/admin/enterprises",
  ADMIN_ENTERPRISE_DETAIL: "/admin/enterprises/:id",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_AUDIT_LOG: "/admin/audit-log",

  // EnterpriseAdmin
  DASHBOARD: "/dashboard",
  STAFF: "/staff",
  CANDIDATES: "/candidates",
  QUESTIONS: "/questions",
  QUESTIONS_SUBJECT: "/questions/subject/:subjectName",
  QUESTION_DETAIL: "/questions/:id",
  EXAMS: "/exams",
  EXAM_NEW: "/exams/new",
  EXAM_DETAIL: "/exams/:id",
  EXAM_MONITOR: "/exams/:id/monitor",
  RESULTS: "/results",
  AUDIT_LOGS: "/audit-log",
  BILLING: "/billing",
  SETTINGS: "/settings",

  // EnterpriseStaff
  STAFF_PORTAL: "/staff-portal",
  STAFF_EXAMS: "/staff-portal/exams",
  STAFF_EXAM_DETAIL: "/staff-portal/exams/:id",
  STAFF_QUESTIONS: "/staff-portal/questions",
  STAFF_QUESTIONS_SUBJECT: "/staff-portal/questions/subject/:subjectName",
  STAFF_QUESTION_DETAIL: "/staff-portal/questions/:id",
  STAFF_CANDIDATES: "/staff-portal/candidates",
  STAFF_SETTINGS: "/staff-portal/settings",
};
