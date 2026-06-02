import { useState } from "react";
import { CheckCircle2, Zap, Building2, Plus, Pencil, Power, X, Loader2 } from "lucide-react";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans.js";
import { useCreatePlan } from "../hooks/useCreatePlan.js";
import { useUpdatePlan } from "../hooks/useUpdatePlan.js";
import { useDeactivatePlan } from "../hooks/useDeactivatePlan.js";
import { Badge, Skeleton, Button, Modal, Input } from "@/components/ui/index.js";

/** Formats ETB price nicely. */
function formatPrice(price, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

/** Generates a slug from a name string. */
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Converts a features object into an array of { key, value } rows. */
function featuresToRows(features) {
  if (!features || Object.keys(features).length === 0) return [{ key: "", value: "" }];
  return Object.entries(features).map(([key, value]) => ({ key, value }));
}

/** Converts feature rows back to an object, filtering empties. */
function rowsToFeatures(rows) {
  const obj = {};
  rows.forEach(({ key, value }) => {
    const trimmed = key.trim();
    if (trimmed) obj[trimmed] = value;
  });
  return obj;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  currency: "USD",
  billing_cycle: "month",
  is_active: true,
};

export default function SubscriptionPlansPage() {
  const [params] = useState({ page: 1, limit: 50, sort: "created_at", sort_dir: "desc" });
  const { data: plansData, isLoading } = useSubscriptionPlans(params);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [featureRows, setFeatureRows] = useState([{ key: "", value: "" }]);

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deactivateMutation = useDeactivatePlan();

  const plans = plansData?.data ?? [];

  function openCreateModal() {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setFeatureRows([{ key: "", value: "" }]);
    setIsModalOpen(true);
  }

  function openEditModal(plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      slug: plan.slug || "",
      description: plan.description || "",
      price: plan.price?.toString() || "",
      currency: plan.currency || "USD",
      billing_cycle: plan.billing_cycle || "monthly",
      is_active: plan.is_active ?? true,
    });
    setFeatureRows(featuresToRows(plan.features));
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPlan(null);
  }

  function handleFormChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editingPlan) {
        next.slug = toSlug(value);
      }
      return next;
    });
  }

  function handleFeatureChange(index, field, value) {
    setFeatureRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addFeatureRow() {
    setFeatureRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeFeatureRow(index) {
    setFeatureRows((prev) => {
      if (prev.length <= 1) return [{ key: "", value: "" }];
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      is_active: form.is_active,
      features: rowsToFeatures(featureRows),
    };

    if (editingPlan) {
      await updateMutation.mutateAsync({ planId: editingPlan.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDeactivate(plan) {
    if (!window.confirm(`Deactivate "${plan.name}"? This sets is_active to false.`)) return;
    await deactivateMutation.mutateAsync(plan.id);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-whisper pb-6">
        <div>
          <h1 className="text-2xl font-bold text-notion-black">Subscription Plans</h1>
          <p className="text-warm-gray-500 text-[15px] mt-1">
            Manage plans that enterprises can subscribe to.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus size={16} />
          Create Plan
        </Button>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-comfortable" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-warm-gray-500">
          No subscription plans found. Create your first plan to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => openEditModal(plan)}
              onDeactivate={() => handleDeactivate(plan)}
              isDeactivating={deactivateMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPlan ? "Edit Plan" : "Create Plan"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Slug */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plan Name"
              id="plan-name"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="e.g. Professional"
              required
            />
            <Input
              label="Slug"
              id="plan-slug"
              value={form.slug}
              onChange={(e) => handleFormChange("slug", e.target.value)}
              placeholder="e.g. professional"
              required
            />
          </div>

          {/* Description */}
          <div className="w-full">
            <label htmlFor="plan-description" className="block text-[14px] font-medium text-notion-black mb-1.5">
              Description
            </label>
            <textarea
              id="plan-description"
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              rows={2}
              className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black placeholder:text-warm-gray-300 transition-all focus:outline-none focus:ring-2 focus:border-notion-blue focus:ring-notion-blue/20 resize-none"
              placeholder="Brief description of the plan"
            />
          </div>

          {/* Price + Currency + Billing Cycle */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price"
              id="plan-price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => handleFormChange("price", e.target.value)}
              placeholder="0"
              required
            />
            <div className="w-full">
              <label htmlFor="plan-currency" className="block text-[14px] font-medium text-notion-black mb-1.5">
                Currency
              </label>
              <select
                id="plan-currency"
                value={form.currency}
                onChange={(e) => handleFormChange("currency", e.target.value)}
                className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black transition-all focus:outline-none focus:ring-2 focus:border-notion-blue focus:ring-notion-blue/20 bg-white"
              >
                <option value="USD">USD</option>
                <option value="ETB">ETB</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="plan-billing" className="block text-[14px] font-medium text-notion-black mb-1.5">
                Billing Cycle
              </label>
              <select
                id="plan-billing"
                value={form.billing_cycle}
                onChange={(e) => handleFormChange("billing_cycle", e.target.value)}
                className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black transition-all focus:outline-none focus:ring-2 focus:border-notion-blue focus:ring-notion-blue/20 bg-white"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleFormChange("is_active", !form.is_active)}
              className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
                form.is_active ? "bg-notion-blue" : "bg-warm-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                  form.is_active ? "translate-x-[18px]" : ""
                }`}
              />
            </button>
            <span className="text-[14px] font-medium text-notion-black">
              {form.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Features key-value editor */}
          <div>
            <label className="block text-[14px] font-medium text-notion-black mb-2">Features</label>
            <div className="space-y-2">
              {featureRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={row.key}
                    onChange={(e) => handleFeatureChange(idx, "key", e.target.value)}
                    placeholder="Feature key"
                    className="flex-1 border border-[#ddd] rounded-micro px-3 py-1.5 text-[13px] text-notion-black placeholder:text-warm-gray-300 focus:outline-none focus:ring-2 focus:border-notion-blue focus:ring-notion-blue/20"
                  />
                  <input
                    value={row.value}
                    onChange={(e) => handleFeatureChange(idx, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 border border-[#ddd] rounded-micro px-3 py-1.5 text-[13px] text-notion-black placeholder:text-warm-gray-300 focus:outline-none focus:ring-2 focus:border-notion-blue focus:ring-notion-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatureRow(idx)}
                    className="p-1 rounded-micro text-warm-gray-300 hover:text-destructive hover:bg-destructive-bg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeatureRow}
              className="mt-2 text-[13px] text-notion-blue hover:text-active-blue font-medium flex items-center gap-1 transition-colors"
            >
              <Plus size={13} />
              Add Feature
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-whisper">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving || !form.name.trim()}>
              {editingPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PlanCard({ plan, onEdit, onDeactivate, isDeactivating }) {
  const features = plan.features ? Object.entries(plan.features) : [];

  return (
    <div className="bg-white rounded-comfortable border border-whisper shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Card header accent */}
      <div className={`h-1 w-full ${plan.is_active ? "bg-notion-blue" : "bg-warm-gray-300"}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Name + status */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className={plan.is_active ? "text-notion-blue" : "text-warm-gray-300"} />
              <h2 className="font-bold text-notion-black text-[17px]">{plan.name}</h2>
            </div>
            <p className="text-warm-gray-500 text-[13px] leading-snug">{plan.description || "—"}</p>
          </div>
          <Badge variant={plan.is_active ? "success" : "neutral"}>
            {plan.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Price */}
        <div className="mb-5">
          <span className="text-3xl font-bold text-notion-black">{formatPrice(plan.price, plan.currency)}</span>
          <span className="text-warm-gray-500 text-sm ml-1">/ {plan.billing_cycle}</span>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-2 flex-1">
            {features.map(([key, value], idx) => (
              <li key={idx} className="flex items-center gap-2 text-[14px] text-notion-black">
                <CheckCircle2 size={15} className="text-success shrink-0" />
                <span className="font-medium">{key}:</span>
                <span className="text-warm-gray-500">{value}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer meta + actions */}
        <div className="mt-6 pt-4 border-t border-whisper flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-warm-gray-300 font-medium">
            <Building2 size={13} />
            <span className="font-mono">{plan.slug}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-micro text-warm-gray-500 hover:text-notion-blue hover:bg-notion-blue/5 transition-colors"
              title="Edit plan"
            >
              <Pencil size={14} />
            </button>
            {plan.is_active && (
              <button
                onClick={onDeactivate}
                disabled={isDeactivating}
                className="p-1.5 rounded-micro text-warm-gray-500 hover:text-destructive hover:bg-destructive-bg transition-colors disabled:opacity-50"
                title="Deactivate plan"
              >
                {isDeactivating ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
