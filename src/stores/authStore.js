import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'SystemAdmin'|'EnterpriseAdmin'|'EnterpriseStaff'|'EnterpriseAuto'} role
 * @property {string} enterpriseId
 */

/**
 * Auth store — persisted to localStorage as "veritas-auth".
 * Holds JWT tokens and decoded user identity.
 * Used by the Axios request interceptor and route guards.
 */
export const useAuthStore = create()(
  persist(
    (set, get) => ({
      /** @type {string|null} */
      accessToken: null,

      /** @type {string|null} */
      refreshToken: null,

      /** @type {AuthUser|null} */
      user: null,

      /**
       * Called after a successful login or token refresh.
       * Decodes the JWT to extract user identity.
       * @param {string} access
       * @param {string} refresh
       */
      setTokens: (access, refresh) => {
        const decoded = jwtDecode(access);
        const user = {
          ...decoded,
          id: decoded.id || decoded.sub,
          firstName: decoded.firstName || decoded.first_name,
          lastName: decoded.lastName || decoded.last_name,
          enterpriseId: decoded.enterpriseId || decoded.enterprise_id,
          email: decoded.email,
        };
        set({ accessToken: access, refreshToken: refresh, user });
      },

      /** Clear all auth state — called on logout or failed refresh */
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

      /**
       * Returns true if the access token is expired or missing.
       * @returns {boolean}
       */
      isTokenExpired: () => {
        const { user } = get();
        if (!user?.exp) return true;
        return Date.now() / 1000 > user.exp;
      },
    }),
    { name: "veritas-auth" }
  )
);

// ── Cross-tab synchronization ────────────────────────────────────────────────
// When another tab writes to localStorage under "veritas-auth",
// rehydrate this tab's in-memory Zustand state so stale tokens
// cannot overwrite the freshly logged-in user via a 401 refresh race.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== "veritas-auth") return;

    if (!e.newValue) {
      // Another tab cleared auth (logout)
      useAuthStore.getState().clearAuth();
      return;
    }

    try {
      const { state } = JSON.parse(e.newValue);
      if (state) {
        useAuthStore.setState({
          accessToken: state.accessToken ?? null,
          refreshToken: state.refreshToken ?? null,
          user: state.user ?? null,
        });
      }
    } catch {
      // Malformed storage value — ignore
    }
  });
}
