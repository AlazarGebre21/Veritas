import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore.js";
import { useMyProfile, useUpdateMyProfile, useChangeMyPassword } from "../hooks/useStaffSettings.js";
import { Card, CardContent, CardHeader } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { cn } from "@/lib/utils/cn.js";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
];

export default function StaffSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8">
      <div className="border-b border-whisper pb-6">
        <h1 className="text-2xl font-bold text-notion-black">Settings</h1>
        <p className="text-warm-gray-500 text-[15px] mt-1">
          Manage your profile and security settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-[6px] text-[14px] font-medium transition-all w-full text-left",
                  activeTab === id
                    ? "bg-notion-blue/10 text-notion-blue"
                    : "text-warm-gray-500 hover:bg-warm-white hover:text-notion-black"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "profile" ? (
            <ProfileTab user={user} />
          ) : (
            <PasswordTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ProfileTab({ user }) {
  const enterpriseId = user?.enterpriseId;
  const userId = user?.id || user?.sub;
  const updateProfile = useUpdateMyProfile(enterpriseId);
  const { data: profileResponse, isLoading } = useMyProfile(enterpriseId, userId);
  const profile = profileResponse?.data || user;

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    honorific: "",
    phone: "",
  });

  // Populate form from fetched profile (or JWT user fallback)
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.firstName || "",
        last_name: profile.lastName || "",
        honorific: profile.honorific || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const hasChanges =
    form.first_name !== (profile?.firstName || "") ||
    form.last_name !== (profile?.lastName || "") ||
    form.honorific !== (profile?.honorific || "") ||
    form.phone !== (profile?.phone || "");

  function handleSave() {
    updateProfile.mutate(
      { userId, payload: form },
      {
        onSuccess: () => {
          setToast({ type: "success", message: "Profile updated successfully." });
          setTimeout(() => setToast(null), 3000);
        },
        onError: (err) => {
          setToast({
            type: "error",
            message: err?.response?.data?.message || err?.response?.data?.error || "Failed to update profile.",
          });
          setTimeout(() => setToast(null), 4000);
        },
      }
    );
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-warm-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Profile Information</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Update your personal details.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] font-medium text-notion-black mb-1.5">Email</label>
              <div className="px-3.5 py-2 rounded-micro bg-warm-white border border-[#ddd] text-[14px] text-warm-gray-500 select-all">
                {profile?.email || user?.email || "—"}
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-notion-black mb-1.5">Role</label>
              <div className="px-3.5 py-2 rounded-micro bg-warm-white border border-[#ddd] text-[14px] text-warm-gray-500">
                Enterprise Staff
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="settings-first-name"
              label="First Name"
              value={form.first_name}
              onChange={update("first_name")}
              placeholder="Jane"
            />
            <Input
              id="settings-last-name"
              label="Last Name"
              value={form.last_name}
              onChange={update("last_name")}
              placeholder="Doe"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="settings-honorific"
              label="Honorific (optional)"
              value={form.honorific}
              onChange={update("honorific")}
              placeholder="e.g. Dr., Mr., Ms."
            />
            <Input
              id="settings-phone"
              label="Phone (optional)"
              value={form.phone}
              onChange={update("phone")}
              placeholder="+251 911 000 000"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-whisper">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateProfile.isPending}
            >
              <Save size={15} className="mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PASSWORD TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PasswordTab({ user }) {
  const enterpriseId = user?.enterpriseId;
  const userId = user?.id || user?.sub;
  const changePassword = useChangeMyPassword(enterpriseId);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = form.new_password === form.confirm_password;
  const canSubmit =
    form.current_password.length > 0 &&
    form.new_password.length >= 8 &&
    passwordsMatch;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    changePassword.mutate(
      {
        userId,
        payload: {
          current_password: form.current_password,
          new_password: form.new_password,
        },
      },
      {
        onSuccess: () => {
          setToast({ type: "success", message: "Password changed successfully." });
          setForm({ current_password: "", new_password: "", confirm_password: "" });
          setTimeout(() => setToast(null), 3000);
        },
        onError: (err) => {
          setToast({
            type: "error",
            message: err?.response?.data?.message || err?.response?.data?.error || "Failed to change password.",
          });
          setTimeout(() => setToast(null), 4000);
        },
      }
    );
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Change Password</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Update your password. Use at least 8 characters.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {/* Current Password */}
            <div>
              <label htmlFor="settings-current-pw" className="block text-[14px] font-medium text-notion-black mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="settings-current-pw"
                  type={showCurrent ? "text" : "password"}
                  value={form.current_password}
                  onChange={update("current_password")}
                  placeholder="Enter current password"
                  className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 pr-10 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all placeholder:text-warm-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-300 hover:text-notion-black transition-colors"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="settings-new-pw" className="block text-[14px] font-medium text-notion-black mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="settings-new-pw"
                  type={showNew ? "text" : "password"}
                  value={form.new_password}
                  onChange={update("new_password")}
                  placeholder="At least 8 characters"
                  className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 pr-10 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all placeholder:text-warm-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-300 hover:text-notion-black transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.new_password.length > 0 && form.new_password.length < 8 && (
                <p className="text-[12px] text-warm-gray-500 mt-1">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="settings-confirm-pw" className="block text-[14px] font-medium text-notion-black mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="settings-confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={update("confirm_password")}
                  placeholder="Re-enter new password"
                  className={cn(
                    "w-full border rounded-micro px-3.5 py-2 pr-10 text-[14px] text-notion-black focus:outline-none focus:ring-2 transition-all placeholder:text-warm-gray-300",
                    form.confirm_password.length > 0 && !passwordsMatch
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-[#ddd] focus:border-notion-blue focus:ring-notion-blue/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-300 hover:text-notion-black transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm_password.length > 0 && !passwordsMatch && (
                <p className="text-[12px] text-destructive mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-whisper">
              <Button type="submit" disabled={!canSubmit || changePassword.isPending}>
                <Lock size={15} className="mr-2" />
                {changePassword.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-standard text-[14px] font-medium transition-all",
        toast.type === "success"
          ? "bg-[#ebf5ed] text-success border border-success/20"
          : "bg-destructive/5 text-destructive border border-destructive/20"
      )}
    >
      {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {toast.message}
    </div>
  );
}
