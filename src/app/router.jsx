import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import DashboardLayout from "@/components/layout/DashboardLayout.jsx";
import PublicLayout from "@/components/layout/PublicLayout.jsx";
import ExamLayout from "@/components/layout/ExamLayout.jsx";

// Guards
import ProtectedRoute from "@/components/shared/ProtectedRoute.jsx";
import RoleGuard from "@/components/shared/RoleGuard.jsx";

import { USER_ROLES } from "@/config/constants.js";
import { ROUTES } from "@/config/routes.js";

// ── Lazy page imports ────────────────────────────────────────────────────────

// Public
const LandingPage = lazy(() => import("@/roles/public/pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("@/roles/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/roles/auth/pages/RegisterPage.jsx"));
const ForgotPasswordPage = lazy(() => import("@/roles/auth/pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("@/roles/auth/pages/ResetPasswordPage.jsx"));

// SystemAdmin
const SystemAdminDashboardPage = lazy(() =>
  import("@/roles/system-admin/pages/SystemAdminDashboardPage.jsx")
);
const EnterprisesPage = lazy(() =>
  import("@/roles/system-admin/pages/EnterprisesPage.jsx")
);
const EnterpriseDetailPage = lazy(() =>
  import("@/roles/system-admin/pages/EnterpriseDetailPage.jsx")
);
const SubscriptionPlansPage = lazy(() =>
  import("@/roles/system-admin/pages/SubscriptionPlansPage.jsx")
);
const SystemAuditLogPage = lazy(() =>
  import("@/roles/system-admin/pages/SystemAuditLogPage.jsx")
);

// EnterpriseAdmin
const EnterpriseDashboardPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/EnterpriseDashboardPage.jsx")
);
const StaffManagementPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/StaffManagementPage.jsx")
);
const CandidatesPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/CandidatesPage.jsx")
);
const ExamsPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/ExamsPage.jsx")
);
const ExamCreatePage = lazy(() =>
  import("@/roles/enterprise-admin/pages/ExamCreatePage.jsx")
);
const ExamDetailPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/ExamDetailPage.jsx")
);
const ExamMonitoringPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/ExamMonitoringPage.jsx")
);
const QuestionsPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/QuestionsPage.jsx")
);
const SubjectQuestionsPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/SubjectQuestionsPage.jsx")
);
const QuestionDetailPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/QuestionDetailPage.jsx")
);
const BillingPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/BillingPage.jsx")
);
const EnterpriseSettingsPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/EnterpriseSettingsPage.jsx")
);
const AuditLogsPage = lazy(() =>
  import("@/roles/enterprise-admin/pages/AuditLogsPage.jsx")
);

// EnterpriseStaff
const StaffDashboardPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffDashboardPage.jsx")
);
const StaffExamsPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffExamsPage.jsx")
);
const StaffExamDetailPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffExamDetailPage.jsx")
);
const StaffQuestionsPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffQuestionsPage.jsx")
);
const StaffSubjectQuestionsPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffSubjectQuestionsPage.jsx")
);
const StaffQuestionDetailPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffQuestionDetailPage.jsx")
);
const StaffCandidatesPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffCandidatesPage.jsx")
);
const StaffSettingsPage = lazy(() =>
  import("@/roles/enterprise-staff/pages/StaffSettingsPage.jsx")
);

// Candidate
const CandidateAccessPage = lazy(() =>
  import("@/roles/candidate/pages/CandidateAccessPage.jsx")
);
const ExamSessionPage = lazy(() =>
  import("@/roles/candidate/pages/ExamSessionPage.jsx")
);
const CandidateResultsPage = lazy(() =>
  import("@/roles/candidate/pages/CandidateResultsPage.jsx")
);

// ── Page wrapper with Suspense ────────────────────────────────────────────────
function Page({ children }) {
  return <Suspense fallback={<div className="page-loading" />}>{children}</Suspense>;
}

// ── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <Page><LandingPage /></Page> },
  
  // ── Public routes ──────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <Page><LoginPage /></Page> },
      { path: ROUTES.REGISTER, element: <Page><RegisterPage /></Page> },
      { path: ROUTES.FORGOT_PASSWORD, element: <Page><ForgotPasswordPage /></Page> },
      { path: ROUTES.RESET_PASSWORD, element: <Page><ResetPasswordPage /></Page> },
    ],
  },

  // ── Candidate exam routes (token auth — no JWT) ─────────────────────────
  {
    element: <ExamLayout />,
    children: [
      { path: ROUTES.EXAM_ACCESS, element: <Page><CandidateAccessPage /></Page> },
      { path: ROUTES.EXAM_START, element: <Page><CandidateAccessPage /></Page> },
      { path: ROUTES.EXAM_SESSION, element: <Page><ExamSessionPage /></Page> },
      { path: ROUTES.EXAM_RESULT, element: <Page><CandidateResultsPage /></Page> },
    ],
  },

  // ── Dashboard routes (JWT auth + role guards) ───────────────────────────
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // SystemAdmin
      {
        element: <RoleGuard roles={[USER_ROLES.SYSTEM_ADMIN]} />,
        children: [
          { path: ROUTES.ADMIN, element: <Page><SystemAdminDashboardPage /></Page> },
          { path: ROUTES.ADMIN_ENTERPRISES, element: <Page><EnterprisesPage /></Page> },
          { path: ROUTES.ADMIN_ENTERPRISE_DETAIL, element: <Page><EnterpriseDetailPage /></Page> },
          { path: ROUTES.ADMIN_SUBSCRIPTIONS, element: <Page><SubscriptionPlansPage /></Page> },
          { path: ROUTES.ADMIN_AUDIT_LOG, element: <Page><SystemAuditLogPage /></Page> },
        ],
      },

      // EnterpriseAdmin
      {
        element: <RoleGuard roles={[USER_ROLES.ENTERPRISE_ADMIN]} />,
        children: [
          { path: ROUTES.DASHBOARD, element: <Page><EnterpriseDashboardPage /></Page> },
          { path: ROUTES.STAFF, element: <Page><StaffManagementPage /></Page> },
          { path: ROUTES.CANDIDATES, element: <Page><CandidatesPage /></Page> },
          { path: ROUTES.QUESTIONS, element: <Page><QuestionsPage /></Page> },
          { path: ROUTES.QUESTIONS_SUBJECT, element: <Page><SubjectQuestionsPage /></Page> },
          { path: ROUTES.QUESTION_DETAIL, element: <Page><QuestionDetailPage /></Page> },
          { path: ROUTES.EXAMS, element: <Page><ExamsPage /></Page> },
          { path: ROUTES.EXAM_NEW, element: <Page><ExamCreatePage /></Page> },
          { path: ROUTES.EXAM_DETAIL, element: <Page><ExamDetailPage /></Page> },
          { path: ROUTES.EXAM_MONITOR, element: <Page><ExamMonitoringPage /></Page> },
          { path: ROUTES.AUDIT_LOGS, element: <Page><AuditLogsPage /></Page> },
          { path: ROUTES.BILLING, element: <Page><BillingPage /></Page> },
          { path: ROUTES.SETTINGS, element: <Page><EnterpriseSettingsPage /></Page> },
        ],
      },

      // EnterpriseStaff
      {
        element: <RoleGuard roles={[USER_ROLES.ENTERPRISE_STAFF]} />,
        children: [
          { path: ROUTES.STAFF_PORTAL, element: <Page><StaffDashboardPage /></Page> },
          { path: ROUTES.STAFF_EXAMS, element: <Page><StaffExamsPage /></Page> },
          { path: ROUTES.STAFF_EXAM_DETAIL, element: <Page><StaffExamDetailPage /></Page> },
          { path: ROUTES.STAFF_QUESTIONS, element: <Page><StaffQuestionsPage /></Page> },
          { path: ROUTES.STAFF_QUESTIONS_SUBJECT, element: <Page><StaffSubjectQuestionsPage /></Page> },
          { path: ROUTES.STAFF_QUESTION_DETAIL, element: <Page><StaffQuestionDetailPage /></Page> },
          { path: ROUTES.STAFF_CANDIDATES, element: <Page><StaffCandidatesPage /></Page> },
          { path: ROUTES.STAFF_SETTINGS, element: <Page><StaffSettingsPage /></Page> },
        ],
      },

    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────
  { path: "*", element: <Navigate to={ROUTES.LOGIN} replace /> },
]);
