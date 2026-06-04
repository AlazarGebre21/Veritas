import { useState, useEffect, useRef } from "react";
import {
  Palette, Building2, Save, Check, AlertCircle, RotateCcw, Upload, Image, X,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore.js";
import { useMyEnterprise } from "../hooks/useMyEnterprise.js";
import { useUpdateEnterprise, useUpdateBranding, useUpdateSettings, useUploadLogo } from "../hooks/useSettingsMutations.js";
import { Card, CardContent, CardHeader } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { cn } from "@/lib/utils/cn.js";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
];

const COLOR_PRESETS = [
  { label: "Default Blue", primary: "#0075de", secondary: "#005bab" },
  { label: "Emerald", primary: "#059669", secondary: "#047857" },
  { label: "Violet", primary: "#7c3aed", secondary: "#6d28d9" },
  { label: "Rose", primary: "#e11d48", secondary: "#be123c" },
  { label: "Amber", primary: "#d97706", secondary: "#b45309" },
  { label: "Teal", primary: "#0d9488", secondary: "#0f766e" },
  { label: "Indigo", primary: "#4f46e5", secondary: "#4338ca" },
  { label: "Slate", primary: "#475569", secondary: "#334155" },
];

const FONT_OPTIONS = [
  "Default", "Inter", "Roboto", "Outfit", "Poppins", "Open Sans",
  "Lato", "Montserrat", "Source Sans 3", "Nunito", "Raleway",
];

/* ─── Defaults ───────────────────────────────────────────────────────────────── */
const DEFAULTS = {
  primaryColor: "#0075de",
  secondaryColor: "#005bab",
  bgColor: "#f6f5f4",
  sidebarColor: "#ffffff",
  textColor: "#191919",
  fontFamily: "Default",
};

/* ─── Main Page ──────────────────────────────────────────────────────────────── */

export default function EnterpriseSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const user = useAuthStore((s) => s.user);
  const enterpriseId = user?.enterpriseId;
  const { data: enterprise, isLoading } = useMyEnterprise();

  return (
    <div className="space-y-8">
      <div className="border-b border-whisper pb-6">
        <h1 className="text-2xl font-bold text-notion-black">Settings</h1>
        <p className="text-warm-gray-500 text-[15px] mt-1">
          Manage your enterprise profile, branding, and customizations.
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
                    ? "bg-brand-primary/10 text-brand-primary"
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-64 w-full rounded-comfortable" />
            </div>
          ) : activeTab === "general" ? (
            <GeneralTab enterprise={enterprise} enterpriseId={enterpriseId} />
          ) : (
            <BrandingTab enterprise={enterprise} enterpriseId={enterpriseId} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   GENERAL TAB
   ═══════════════════════════════════════════════════════════════════════════════ */

function GeneralTab({ enterprise, enterpriseId }) {
  const updateMutation = useUpdateEnterprise(enterpriseId);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    displayName: "", legalName: "", contactEmail: "",
    contactPhone: "", addressLine1: "", city: "", country: "",
  });

  useEffect(() => {
    if (enterprise) {
      setForm({
        displayName: enterprise.displayName || "",
        legalName: enterprise.legalName || "",
        contactEmail: enterprise.contactEmail || "",
        contactPhone: enterprise.contactPhone || "",
        addressLine1: enterprise.addressLine1 || "",
        city: enterprise.city || "",
        country: enterprise.country || "",
      });
    }
  }, [enterprise]);

  const hasChanges = enterprise && Object.keys(form).some(
    (k) => form[k] !== (enterprise[k] || "")
  );

  function handleSave() {
    updateMutation.mutate(form, {
      onSuccess: () => { setToast({ type: "success", message: "Profile updated successfully." }); setTimeout(() => setToast(null), 3000); },
      onError: (err) => { setToast({ type: "error", message: err?.response?.data?.message || "Failed to update profile." }); setTimeout(() => setToast(null), 4000); },
    });
  }

  function handleReset() {
    if (enterprise) {
      setForm({
        displayName: enterprise.displayName || "", legalName: enterprise.legalName || "",
        contactEmail: enterprise.contactEmail || "", contactPhone: enterprise.contactPhone || "",
        addressLine1: enterprise.addressLine1 || "", city: enterprise.city || "", country: enterprise.country || "",
      });
    }
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-notion-black">General Information</h2>
            <p className="text-[13px] text-warm-gray-500 mt-0.5">Update your enterprise&apos;s profile details.</p>
          </div>
          <Badge variant={enterprise?.status === "Active" ? "success" : "warning"}>{enterprise?.status || "—"}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] font-medium text-notion-black mb-1.5">Slug</label>
              <div className="px-3.5 py-2 rounded-micro bg-warm-white border border-[#ddd] text-[14px] text-warm-gray-500 select-all">{enterprise?.slug || "—"}</div>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-notion-black mb-1.5">Enterprise ID</label>
              <div className="px-3.5 py-2 rounded-micro bg-warm-white border border-[#ddd] text-[14px] text-warm-gray-500 font-mono text-[12px] select-all truncate">{enterprise?.id || "—"}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input id="settings-display-name" label="Display Name" value={form.displayName} onChange={update("displayName")} placeholder="My Organization" />
            <Input id="settings-legal-name" label="Legal Name" value={form.legalName} onChange={update("legalName")} placeholder="My Organization PLC" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input id="settings-contact-email" label="Contact Email" type="email" value={form.contactEmail} onChange={update("contactEmail")} placeholder="admin@example.com" />
            <Input id="settings-contact-phone" label="Contact Phone" value={form.contactPhone} onChange={update("contactPhone")} placeholder="+251 911 000 000" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input id="settings-address" label="Address" value={form.addressLine1} onChange={update("addressLine1")} placeholder="123 Main St" />
            <Input id="settings-city" label="City" value={form.city} onChange={update("city")} placeholder="Addis Ababa" />
            <Input id="settings-country" label="Country" value={form.country} onChange={update("country")} placeholder="Ethiopia" />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-whisper">
            <Button onClick={handleSave} isLoading={updateMutation.isPending} disabled={!hasChanges} leftIcon={<Save size={15} />}>Save Changes</Button>
            {hasChanges && <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw size={15} />}>Reset</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BRANDING TAB
   ═══════════════════════════════════════════════════════════════════════════════ */

function BrandingTab({ enterprise, enterpriseId }) {
  const brandingMutation = useUpdateBranding(enterpriseId);
  const settingsMutation = useUpdateSettings(enterpriseId);
  const logoMutation = useUploadLogo(enterpriseId);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Core branding
  const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondaryColor);

  // Extended customizations (stored in settings)
  const [bgColor, setBgColor] = useState(DEFAULTS.bgColor);
  const [sidebarColor, setSidebarColor] = useState(DEFAULTS.sidebarColor);
  const [textColor, setTextColor] = useState(DEFAULTS.textColor);
  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);

  useEffect(() => {
    if (enterprise) {
      setPrimaryColor(enterprise.primaryColor || DEFAULTS.primaryColor);
      setSecondaryColor(enterprise.secondaryColor || DEFAULTS.secondaryColor);
      setBgColor(enterprise.settings?.bgColor || DEFAULTS.bgColor);
      setSidebarColor(enterprise.settings?.sidebarColor || DEFAULTS.sidebarColor);
      setTextColor(enterprise.settings?.textColor || DEFAULTS.textColor);
      setFontFamily(enterprise.settings?.fontFamily || DEFAULTS.fontFamily);
    }
  }, [enterprise]);

  // Live preview: apply all brand tokens as the user changes them
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-brand-primary", primaryColor);
    root.style.setProperty("--color-brand-secondary", secondaryColor);
    root.style.setProperty("--color-brand-bg", bgColor);
    root.style.setProperty("--color-brand-sidebar", sidebarColor);
    root.style.setProperty("--color-brand-text", textColor);
    // Override design-system tokens so all existing components update in real-time
    root.style.setProperty("--color-notion-black", textColor);
    root.style.setProperty("--color-warm-white", bgColor);
    if (fontFamily && fontFamily !== "Default") {
      root.style.setProperty(
        "--font-brand",
        `"${fontFamily}", -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif`
      );
    } else {
      root.style.removeProperty("--font-brand");
    }
  }, [primaryColor, secondaryColor, bgColor, sidebarColor, textColor, fontFamily]);

  const hasBrandingChanges =
    primaryColor !== (enterprise?.primaryColor || DEFAULTS.primaryColor) ||
    secondaryColor !== (enterprise?.secondaryColor || DEFAULTS.secondaryColor);

  const hasSettingsChanges =
    bgColor !== (enterprise?.settings?.bgColor || DEFAULTS.bgColor) ||
    sidebarColor !== (enterprise?.settings?.sidebarColor || DEFAULTS.sidebarColor) ||
    textColor !== (enterprise?.settings?.textColor || DEFAULTS.textColor) ||
    fontFamily !== (enterprise?.settings?.fontFamily || DEFAULTS.fontFamily);

  const hasChanges = hasBrandingChanges || hasSettingsChanges;

  async function handleSave() {
    try {
      const promises = [];
      if (hasBrandingChanges) {
        promises.push(brandingMutation.mutateAsync({ primary_color: primaryColor, secondary_color: secondaryColor }));
      }
      if (hasSettingsChanges) {
        promises.push(settingsMutation.mutateAsync({ bgColor, sidebarColor, textColor, fontFamily }));
      }
      await Promise.all(promises);
      setToast({ type: "success", message: "Branding updated successfully." });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: "error", message: err?.response?.data?.message || "Failed to update branding." });
      setTimeout(() => setToast(null), 4000);
    }
  }

  function handleReset() {
    setPrimaryColor(enterprise?.primaryColor || DEFAULTS.primaryColor);
    setSecondaryColor(enterprise?.secondaryColor || DEFAULTS.secondaryColor);
    setBgColor(enterprise?.settings?.bgColor || DEFAULTS.bgColor);
    setSidebarColor(enterprise?.settings?.sidebarColor || DEFAULTS.sidebarColor);
    setTextColor(enterprise?.settings?.textColor || DEFAULTS.textColor);
    setFontFamily(enterprise?.settings?.fontFamily || DEFAULTS.fontFamily);
  }

  function handleRevertToOriginal() {
    setPrimaryColor(DEFAULTS.primaryColor);
    setSecondaryColor(DEFAULTS.secondaryColor);
    setBgColor(DEFAULTS.bgColor);
    setSidebarColor(DEFAULTS.sidebarColor);
    setTextColor(DEFAULTS.textColor);
    setFontFamily(DEFAULTS.fontFamily);
  }

  function applyPreset(preset) {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  }

  const isSaving = brandingMutation.isPending || settingsMutation.isPending;

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
  const MAX_SIZE = 3 * 1024 * 1024; // 3 MB

  function handleLogoFile(file) {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setToast({ type: "error", message: "Only PNG, JPG, or JPEG files are allowed." });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (file.size > MAX_SIZE) {
      setToast({ type: "error", message: "File size must not exceed 3 MB." });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    // Show local preview
    setLogoPreview(URL.createObjectURL(file));
    // Upload
    logoMutation.mutate(file, {
      onSuccess: () => {
        setToast({ type: "success", message: "Logo uploaded successfully." });
        setTimeout(() => setToast(null), 3000);
      },
      onError: (err) => {
        setLogoPreview(null);
        setToast({ type: "error", message: err?.response?.data?.message || "Failed to upload logo." });
        setTimeout(() => setToast(null), 4000);
      },
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    handleLogoFile(file);
  }

  const currentLogo = logoPreview || enterprise?.logoUrl;

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* ── Revert Brand ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-standard border border-whisper bg-warm-white">
        <div>
          <h2 className="text-[14px] font-medium text-notion-black">Original Brand</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Reset all your customized colors and fonts back to the default brand.
          </p>
        </div>
        <Button variant="outline" onClick={handleRevertToOriginal} leftIcon={<RotateCcw size={15} />}>
          Revert to Original
        </Button>
      </div>

      {/* ── Logo Upload Card ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Logo</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Upload your enterprise logo. PNG, JPG, or JPEG — max 3 MB.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Current logo preview */}
            <div className="w-24 h-24 rounded-comfortable border border-whisper bg-warm-white flex items-center justify-center shrink-0 overflow-hidden">
              {currentLogo ? (
                <img src={currentLogo} alt="Enterprise logo" className="w-full h-full object-contain" />
              ) : (
                <Image size={32} className="text-warm-gray-300" />
              )}
            </div>

            {/* Upload area */}
            <div className="flex-1">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-standard px-6 py-8 text-center cursor-pointer transition-all",
                  "border-warm-gray-300/50 hover:border-brand-primary/50 hover:bg-brand-primary/5",
                  logoMutation.isPending && "pointer-events-none opacity-60"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
                {logoMutation.isPending ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[13px] text-warm-gray-500">Uploading…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-warm-gray-300" />
                    <p className="text-[13px] text-warm-gray-500">
                      <span className="font-medium text-brand-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[11px] text-warm-gray-300">PNG, JPG, JPEG up to 3 MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Brand Colors Card ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Brand Colors</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Customize the primary and secondary colors. Changes preview in real-time.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker id="branding-primary-color" label="Primary Color" description="Buttons, links, and accent elements" value={primaryColor} onChange={setPrimaryColor} />
            <ColorPicker id="branding-secondary-color" label="Secondary Color" description="Hover states and deeper accents" value={secondaryColor} onChange={setSecondaryColor} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-notion-black mb-3">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                    primaryColor === preset.primary
                      ? "border-brand-primary/40 bg-brand-primary/5 text-brand-primary"
                      : "border-whisper bg-white text-warm-gray-500 hover:border-warm-gray-300 hover:text-notion-black"
                  )}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.primary }} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Appearance Card ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Appearance</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">
            Customize background, sidebar, text color, and typography.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ColorPicker id="branding-bg-color" label="Background Color" description="Main content area" value={bgColor} onChange={setBgColor} />
            <ColorPicker id="branding-sidebar-color" label="Sidebar Color" description="Navigation sidebar" value={sidebarColor} onChange={setSidebarColor} />
            <ColorPicker id="branding-text-color" label="Text Color" description="Primary body text" value={textColor} onChange={setTextColor} />
          </div>

          {/* Font Selector */}
          <div>
            <label htmlFor="branding-font" className="block text-[14px] font-medium text-notion-black mb-1">
              Font Family
            </label>
            <p className="text-[12px] text-warm-gray-500 mb-2">Choose a typeface for your portal</p>
            <select
              id="branding-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full max-w-xs border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black bg-white transition-all focus:outline-none focus:ring-2 focus:border-brand-primary focus:ring-brand-primary/20 cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f === "Default" ? "Default (Inter)" : f}</option>
              ))}
            </select>
            {fontFamily !== "Default" && (
              <p className="text-[12px] text-warm-gray-300 mt-2" style={{ fontFamily: `"${fontFamily}", sans-serif` }}>
                Preview: The quick brown fox jumps over the lazy dog
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Live Preview Card ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-notion-black">Live Preview</h2>
          <p className="text-[13px] text-warm-gray-500 mt-0.5">See how your customizations look.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sidebar preview */}
            <div className="rounded-standard border border-whisper overflow-hidden" style={{ backgroundColor: bgColor }}>
              <div className="flex">
                <div className="w-48 p-4 space-y-2 border-r border-whisper" style={{ backgroundColor: sidebarColor }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: primaryColor }}>V</div>
                    <span className="font-semibold text-[14px] truncate" style={{ color: textColor, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>
                      {enterprise?.displayName || "Enterprise"}
                    </span>
                  </div>
                  {["Dashboard", "Exams", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[5px] px-3 py-2 text-[13px] font-medium"
                      style={i === 2 ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : { color: `${textColor}99` }}
                    >
                      <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: i === 2 ? primaryColor : `${textColor}25` }} />
                      <span style={{ fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4" style={{ backgroundColor: bgColor }}>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: textColor, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>Content Area</p>
                  <p className="text-[12px]" style={{ color: `${textColor}80`, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>This is how your main content will appear.</p>
                </div>
              </div>
            </div>

            {/* UI element previews */}
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-medium text-warm-gray-500 uppercase tracking-wide mb-2">Buttons</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center justify-center font-medium rounded-micro text-white text-[14px] px-4 py-2 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: primaryColor, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = secondaryColor)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = primaryColor)}
                  >
                    Primary Button
                  </button>
                  <button className="inline-flex items-center justify-center font-medium rounded-micro bg-warm-white text-notion-black text-[14px] px-4 py-2 hover:bg-[#e4e2e0] transition-all active:scale-[0.98]">
                    Secondary
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-warm-gray-500 uppercase tracking-wide mb-2">Typography</p>
                <p className="text-[15px] font-semibold" style={{ color: textColor, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>
                  Heading Text Sample
                </p>
                <p className="text-[13px] mt-1" style={{ color: `${textColor}90`, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}>
                  Body text sample — The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-warm-gray-500 uppercase tracking-wide mb-2">Focus Ring</p>
                <input
                  className="w-full border rounded-micro px-3.5 py-2 text-[14px] placeholder:text-warm-gray-300 transition-all focus:outline-none border-[#ddd]"
                  style={{ color: textColor, fontFamily: fontFamily !== "Default" ? `"${fontFamily}", sans-serif` : undefined }}
                  onFocus={(e) => { e.target.style.borderColor = primaryColor; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}20`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#ddd"; e.target.style.boxShadow = "none"; }}
                  placeholder="Click to see focus ring color…"
                  readOnly
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Save Actions (sticky) ──────────────────────────────────────────── */}
      {hasChanges && (
        <div className="sticky bottom-6 flex items-center gap-3 p-4 bg-white rounded-comfortable shadow-deep border border-whisper">
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>Save All Changes</Button>
          <Button variant="ghost" onClick={handleReset} leftIcon={<RotateCcw size={15} />}>Reset</Button>
          <span className="text-[12px] text-warm-gray-300 ml-auto">Unsaved changes</span>
        </div>
      )}
    </div>
  );
}

/* ─── Color Picker ───────────────────────────────────────────────────────────── */

function ColorPicker({ id, label, description, value, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[14px] font-medium text-notion-black">{label}</label>
      {description && <p className="text-[12px] text-warm-gray-500 -mt-1">{description}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color" id={id} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-standard border border-whisper cursor-pointer p-0.5 bg-white transition-shadow hover:shadow-card"
          style={{ WebkitAppearance: "none" }}
        />
        <div className="flex-1">
          <input
            type="text" value={value}
            onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v); }}
            className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black font-mono uppercase placeholder:text-warm-gray-300 transition-all focus:outline-none focus:ring-2 focus:border-brand-primary focus:ring-brand-primary/20"
            placeholder="#000000" maxLength={7}
          />
        </div>
        <div className="w-12 h-12 rounded-standard border border-whisper shrink-0 transition-colors" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────────── */

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-3 rounded-standard text-[14px] font-medium transition-all",
      toast.type === "success" ? "bg-[#ebf5ed] text-success border border-success/20" : "bg-destructive-bg text-destructive border border-destructive/20"
    )}>
      {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {toast.message}
    </div>
  );
}
