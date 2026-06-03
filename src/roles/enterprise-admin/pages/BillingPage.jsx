import { useState } from "react";
import {
  CreditCard, Clock, CalendarDays,
  RefreshCw, XCircle, Check,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore.js";
import { useBillingSummary } from "../hooks/useBillingSummary.js";
import { useEnterpriseSubscription } from "../hooks/useEnterpriseSubscription.js";
import { useCancelSubscription } from "../hooks/useCancelSubscription.js";
import { useReactivateSubscription } from "../hooks/useReactivateSubscription.js";
import { useUpgradeSubscription } from "../hooks/useUpgradeSubscription.js";
import { usePlans } from "@/hooks/usePlans.js";
import { Card, CardContent, Badge, Skeleton, Button } from "@/components/ui/index.js";
import { formatDate } from "@/lib/utils/date.js";

/** Formats ETB price nicely. */
function formatPrice(amount, currency = "ETB") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-ET", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

/** Status → badge variant mapping. */
function statusVariant(status) {
  const map = {
    Active: "success",
    Paid: "success",
    Succeeded: "success",
    Trial: "warning",
    PastDue: "warning",
    Pending: "warning",
    Draft: "neutral",
    Open: "neutral",
    Cancelled: "neutral",
    Expired: "neutral",
    Failed: "neutral",
    Void: "neutral",
  };
  return map[status] || "neutral";
}

export default function BillingPage() {
  const enterpriseId = useAuthStore((s) => s.user?.enterpriseId);

  const { data: summary, isLoading: summaryLoading } = useBillingSummary();
  const { data: subscription, isLoading: subLoading } = useEnterpriseSubscription(enterpriseId);

  const cancelMutation = useCancelSubscription(enterpriseId);
  const reactivateMutation = useReactivateSubscription(enterpriseId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-whisper pb-6">
        <h1 className="text-2xl font-bold text-notion-black">Billing & Subscription</h1>
        <p className="text-warm-gray-500 text-[15px] mt-1">
          Manage your subscription plan, view invoices, and track payment history.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} isLoading={summaryLoading} />

      {/* Current Subscription */}
      <SubscriptionSection
        subscription={subscription}
        summary={summary}
        isLoading={subLoading}
        onCancel={() => {
          if (window.confirm("Cancel your subscription at the end of the current period?")) {
            cancelMutation.mutate({ cancelAtPeriodEnd: true });
          }
        }}
        onReactivate={() => reactivateMutation.mutate()}
        isCancelling={cancelMutation.isPending}
        isReactivating={reactivateMutation.isPending}
      />

      {/* Available Plans */}
      <PlansSection currentPlanId={subscription?.plan_id} />
    </div>
  );
}

/* ─── Summary Cards ──────────────────────────────────────────────────────────── */

function SummaryCards({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-comfortable" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Active Plan",
      value: summary?.active_plan_name || "None",
      icon: CreditCard,
      color: "text-notion-blue",
      bg: "bg-notion-blue/10",
    },
    {
      label: "Subscription Status",
      value: summary?.subscription_status || "—",
      icon: Clock,
      color: summary?.subscription_status === "Active" ? "text-success" : "text-warning",
      bg: summary?.subscription_status === "Active" ? "bg-success/10" : "bg-warning/10",
      badge: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center p-5">
            <div className={`w-11 h-11 rounded-full ${card.bg} flex items-center justify-center ${card.color} mr-4 shrink-0`}>
              <card.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-warm-gray-500 uppercase tracking-wide">{card.label}</p>
              {card.badge ? (
                <Badge variant={statusVariant(summary?.subscription_status)} className="mt-1">
                  {card.value}
                </Badge>
              ) : (
                <p className="text-xl font-bold text-notion-black mt-0.5 truncate">{card.value}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Subscription Section ───────────────────────────────────────────────────── */

function SubscriptionSection({ subscription, summary, isLoading, onCancel, onReactivate, isCancelling, isReactivating }) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-comfortable" />;
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-warm-gray-500">
          No active subscription found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-notion-black uppercase tracking-wide">Current Subscription</h2>
          <Badge variant={statusVariant(subscription.status)}>{subscription.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs text-warm-gray-300 font-medium uppercase mb-1">Plan</p>
            <p className="text-[15px] font-medium text-notion-black">{summary?.active_plan_name || subscription.plan_id || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-warm-gray-300 font-medium uppercase mb-1">Current Period</p>
            <p className="text-[14px] text-warm-gray-500">
              {subscription.current_period_start ? formatDate(subscription.current_period_start) : "—"}
              {" — "}
              {subscription.current_period_end ? formatDate(subscription.current_period_end) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-warm-gray-300 font-medium uppercase mb-1">Next Billing</p>
            <p className="text-[14px] text-warm-gray-500 flex items-center gap-1.5">
              <CalendarDays size={14} className="text-warm-gray-300" />
              {summary?.next_billing_date ? formatDate(summary.next_billing_date) : "—"}
            </p>
          </div>
        </div>

        {/* Cancellation banner */}
        {subscription.cancel_at_period_end && (
          <div className="bg-warning/5 border border-warning/20 rounded-micro px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-[13px] text-notion-black">
              <span className="font-medium">Scheduled for cancellation</span> at the end of the current period.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={onReactivate}
              isLoading={isReactivating}
              className="gap-1.5 shrink-0"
            >
              <RefreshCw size={13} />
              Reactivate
            </Button>
          </div>
        )}

        {/* Actions */}
        {!subscription.cancel_at_period_end && subscription.status !== "Cancelled" && (
          <div className="pt-4 border-t border-whisper">
            <Button
              className="gap-2 bg-white border border-destructive/20 text-warm-gray-500 hover:text-destructive hover:bg-destructive-bg hover:border-destructive/40 transition-all text-[13px]"
              onClick={onCancel}
              isLoading={isCancelling}
            >
              <XCircle size={14} />
              Cancel Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


/* ─── Plans Section ──────────────────────────────────────────────────────────── */

const PROVIDERS = [
  { value: "stripe", label: "Stripe" },
  { value: "chapa", label: "Chapa" },
];

function PlanCard({ plan, currentPlanId, upgradeMutation }) {
  const [provider, setProvider] = useState("stripe");
  const isCurrent = currentPlanId === plan.id;
  const isPending =
    upgradeMutation.isPending &&
    upgradeMutation.variables?.planId === plan.id;

  return (
    <Card
      className={`relative h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-subtle ${
        isCurrent ? "border-notion-blue ring-1 ring-notion-blue/20" : ""
      }`}
    >
      {isCurrent && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
          <Badge variant="success" className="shadow-sm">Current Plan</Badge>
        </div>
      )}
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-notion-black">{plan.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-notion-black tracking-tight">
              {formatPrice(plan.price, plan.currency || "ETB")}
            </span>
            <span className="text-warm-gray-400 text-sm">
              /{plan.billing_cycle === "yearly" ? "yr" : "mo"}
            </span>
          </div>
          <p className="text-sm text-warm-gray-500 mt-2 min-h-[40px]">
            {plan.description || "The ideal plan for growing teams."}
          </p>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          {Object.entries(plan.features || {}).map(([key, val]) => (
            <div key={key} className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-full bg-notion-blue/10 p-[2px] shrink-0 text-notion-blue">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-sm text-notion-black font-medium tracking-tight">
                {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:{" "}
                <span className="font-normal text-warm-gray-500">{val}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Provider selector — only shown for non-current plans */}
        {!isCurrent && (
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-warm-gray-400 uppercase tracking-wide mb-1.5">
              Pay via
            </p>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProvider(p.value)}
                  className={`flex-1 py-1.5 text-[12px] font-medium rounded-micro border transition-all ${
                    provider === p.value
                      ? "bg-notion-blue text-white border-notion-blue shadow-sm"
                      : "bg-transparent text-warm-gray-500 border-whisper hover:border-notion-blue/40 hover:text-notion-blue"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          className={`w-full mt-auto ${
            isCurrent
              ? "bg-warm-gray-100 text-warm-gray-500 hover:bg-warm-gray-200 cursor-not-allowed border-none"
              : "bg-notion-blue text-white hover:bg-[#004dc2] shadow-sm"
          }`}
          disabled={isCurrent || upgradeMutation.isPending}
          isLoading={isPending}
          onClick={() =>
            !isCurrent &&
            upgradeMutation.mutate({ planId: plan.id, provider })
          }
        >
          {isCurrent ? "Current Plan" : `Upgrade via ${PROVIDERS.find((p) => p.value === provider)?.label}`}
        </Button>
      </CardContent>
    </Card>
  );
}

function PlansSection({ currentPlanId }) {
  const enterpriseId = useAuthStore((s) => s.user?.enterpriseId);
  const { data: plansData, isLoading } = usePlans();
  const upgradeMutation = useUpgradeSubscription(enterpriseId);

  const plans = plansData?.data || [];
  const activePlans = plans.filter((p) => p.is_active);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-comfortable" />
        ))}
      </div>
    );
  }

  if (activePlans.length === 0) return null;

  return (
    <div className="mt-8 mb-8">
      <div className="mb-6 border-t border-whisper pt-8">
        <h2 className="text-[18px] font-semibold text-notion-black tracking-tight">Available Plans</h2>
        <p className="text-warm-gray-500 text-[14px] mt-1">
          Upgrade your subscription to unlock more features.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            upgradeMutation={upgradeMutation}
          />
        ))}
      </div>
    </div>
  );
}

