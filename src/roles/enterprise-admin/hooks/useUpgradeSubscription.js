import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentApi } from "@/lib/api/payment.api.js";
import { queryKeys } from "@/lib/api/queryKeys.js";
import { normalizeError } from "@/lib/utils/errorNormalizer.js";

/**
 * Hook to create a checkout session for upgrading a subscription.
 * Accepts { planId, provider } — provider is optional and defaults to 'stripe'.
 * @param {string} enterpriseId
 */
export function useUpgradeSubscription(enterpriseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, provider }) =>
      paymentApi.upgradeSubscription(enterpriseId, planId, provider),
    onSuccess: (data) => {
      // Both Stripe and Chapa return a redirect URL (key may differ by provider)
      const redirectUrl = data?.checkout_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.success("Upgrade process initiated successfully.");
        queryClient.invalidateQueries({
          queryKey: queryKeys.payments.subscription(enterpriseId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.payments.billingSummary,
        });
      }
    },
    onError: (err) => {
      toast.error(normalizeError(err, "Failed to initiate upgrade"));
    },
  });
}
