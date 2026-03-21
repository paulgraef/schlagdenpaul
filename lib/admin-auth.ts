export const ADMIN_AUTH_KEY = "sdp_admin";

export function getConfiguredAdminPin(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PIN ?? "1234";
}

