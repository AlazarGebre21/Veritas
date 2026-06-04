import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ClipboardList,
  BarChart2,
  CreditCard,
  Settings,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore.js";
import { useUiStore } from "@/stores/uiStore.js";
import { authApi } from "@/lib/api/auth.api.js";
import { useMyEnterprise } from "@/roles/enterprise-admin/hooks/useMyEnterprise.js";
import { USER_ROLES } from "@/config/constants.js";
import { ROUTES } from "@/config/routes.js";
import { cn } from "@/lib/utils/cn.js";

const NAV_ITEMS = {
  [USER_ROLES.SYSTEM_ADMIN]: [
    { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.ADMIN },
    { label: "Enterprises", icon: Building2, to: ROUTES.ADMIN_ENTERPRISES },
    { label: "Subscriptions", icon: CreditCard, to: ROUTES.ADMIN_SUBSCRIPTIONS },
    { label: "Audit Log", icon: ScrollText, to: ROUTES.ADMIN_AUDIT_LOG },
  ],
  [USER_ROLES.ENTERPRISE_ADMIN]: [
    { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.DASHBOARD },
    { label: "Staff", icon: Users, to: ROUTES.STAFF },
    { label: "Candidates", icon: Users, to: ROUTES.CANDIDATES },
    { label: "Questions", icon: FileText, to: ROUTES.QUESTIONS },
    { label: "Exams", icon: ClipboardList, to: ROUTES.EXAMS },
    { label: "Audit Log", icon: ScrollText, to: ROUTES.AUDIT_LOGS },
    { label: "Billing", icon: CreditCard, to: ROUTES.BILLING },
    { label: "Settings", icon: Settings, to: ROUTES.SETTINGS },
  ],
  [USER_ROLES.ENTERPRISE_STAFF]: [
    { label: "Dashboard", icon: LayoutDashboard, to: ROUTES.STAFF_PORTAL },
    { label: "Exams", icon: ClipboardList, to: ROUTES.STAFF_EXAMS },
    { label: "Questions", icon: FileText, to: ROUTES.STAFF_QUESTIONS },
    { label: "Candidates", icon: Users, to: ROUTES.STAFF_CANDIDATES },
    { label: "Settings", icon: Settings, to: ROUTES.STAFF_SETTINGS },
  ],
};

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  // Only admins can call GET /enterprises/me — staff gets 403
  const isAdmin = user?.role === USER_ROLES.ENTERPRISE_ADMIN;

  const { data: enterprise } = useMyEnterprise({ enabled: isAdmin });

  const logoUrl = (isAdmin ? enterprise?.logoUrl : null) || "/logo.png";
  const brandName = (isAdmin && enterprise?.displayName) || "Veritas";

  const navItems = NAV_ITEMS[user?.role] ?? [];
  const queryClient = useQueryClient();

  async function handleLogout() {
    // 1. Invalidate the refresh token on the backend (best-effort)
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      authApi.logout({ refreshToken }).catch(() => {});
    }

    // 2. Clear all React Query cache so no stale data leaks to the next user
    queryClient.clear();

    // 3. Clear auth state (tokens + user from Zustand/localStorage)
    clearAuth();

    // 4. Redirect to login
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-brand-sidebar border-r border-whisper",
        "transition-all duration-200",
        sidebarOpen ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-20 border-b border-whisper shrink-0 overflow-hidden px-4">
        {sidebarOpen ? (
          <>
            <img
              src={logoUrl}
              alt={brandName}
              className="w-15 h-15 rounded-md object-contain shrink-0"
            />
            <span className="font-bold text-notion-black text-[18px] truncate">{brandName}</span>
          </>
        ) : (
          <div className="w-10 h-10 rounded-md bg-transparent flex items-center justify-center shrink-0 mx-auto">
            {/* If they explicitly want the name, we use the first letter as a bold recognizable emblem when space is tight */}
            <span className="font-bold text-notion-black text-[22px]">{brandName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-subtle px-2 py-2 text-[14px] font-medium transition-colors",
                "text-warm-gray-500 hover:bg-warm-white hover:text-notion-black",
                isActive && "bg-warm-white text-notion-black font-semibold"
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-whisper px-2 py-3 space-y-0.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-subtle px-2 py-2 text-[14px] font-medium text-warm-gray-500 hover:bg-warm-white hover:text-notion-black transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full rounded-subtle px-2 py-2 text-[14px] font-medium text-warm-gray-300 hover:text-notion-black transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {sidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
