import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enterpriseApi } from "@/lib/api/enterprises.api.js";

/**
 * Mutation hooks for enterprise settings management.
 * Each invalidates the "enterprises/me" query on success
 * so the BrandingProvider and Settings form stay in sync.
 */

/** Update general enterprise profile fields (displayName, legalName, contactEmail, etc.). */
export function useUpdateEnterprise(enterpriseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => enterpriseApi.update(enterpriseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enterprises", "me"] });
    },
  });
}

/** Update branding fields (primary_color, secondary_color, logo_url). */
export function useUpdateBranding(enterpriseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => enterpriseApi.updateBranding(enterpriseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enterprises", "me"] });
    },
  });
}

/** Update enterprise settings (bgColor, sidebarColor, textColor, fontFamily, etc.). */
export function useUpdateSettings(enterpriseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings) => enterpriseApi.updateSettings(enterpriseId, settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enterprises", "me"] });
    },
  });
}

/** Upload enterprise logo image (png, jpg, jpeg — max 3 MB). */
export function useUploadLogo(enterpriseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => enterpriseApi.uploadLogo(enterpriseId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enterprises", "me"] });
    },
  });
}
